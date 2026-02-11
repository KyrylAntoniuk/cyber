import React, { useMemo, useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import debounce from "lodash.debounce";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../../axios"; 
import { setSearchValue } from "../../redux/slices/filterSlice"; // Сохраняем вашу опечатку в названии
import "../../SCSS/components/search.scss";

export default function Search() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { serchValue } = useSelector((state) => state.filter);
  
  const [fetchedProducts, setFetchedProducts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);

  // Функция загрузки товаров
  const fetchProducts = async (value) => {
    try {
      if (!value) {
        setFetchedProducts([]);
        return;
      }
      
      // Запрашиваем ВСЕ товары, чтобы отфильтровать на клиенте 
      // (так надежнее, пока на бэкенде не исправлен поиск по productName)
      const { data } = await axios.get(`/products`); 
      
      // ИСПРАВЛЕНИЕ: Проверяем, где лежат товары (в data или data.items)
      const productsArray = Array.isArray(data) ? data : (data.items || []);

      const filtered = productsArray.filter(obj => 
        obj.productName.toLowerCase().includes(value.toLowerCase())
      );
      
      setFetchedProducts(filtered);
      setIsOpen(true);
    } catch (error) {
      console.warn("Ошибка при поиске:", error);
      setFetchedProducts([]);
    }
  };

  const debouncedFetch = useMemo(
    () => debounce((value) => fetchProducts(value), 400),
    []
  );

  useEffect(() => {
    return () => debouncedFetch.cancel();
  }, [debouncedFetch]);

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.body.addEventListener('click', handleClickOutside);
    return () => document.body.removeEventListener('click', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    dispatch(setSearchValue(value)); // Обновляем Redux

    // Логика отображения выпадающего списка
    if (location.pathname !== "/products") {
      debouncedFetch(value);
    } else {
      setIsOpen(false);
    }
  };

  const handleItemClick = (id) => {
    setIsOpen(false);
    setFetchedProducts([]);
    dispatch(setSearchValue(""));
    navigate(`/product/${id}`);
  };

  return (
    <div className="search-container" ref={rootRef}>
      <input
        className="search"
        type="text"
        placeholder="Поиск..."
        value={serchValue}
        onChange={handleChange}
        onFocus={() => {
            if(fetchedProducts.length > 0 && location.pathname !== "/products") setIsOpen(true);
        }}
      />
      
      {isOpen && fetchedProducts.length > 0 (  // add page locaction check
        <div className="preview-products">
          {fetchedProducts.map((item) => (
            <div
              key={item._id}
              className="preview-item"
              onClick={() => handleItemClick(item._id)}
            >
              <img 
                src={item.img} 
                alt={item.productName} 
                onError={(e) => { e.target.style.display = 'none'; }} 
              />
              <div className="preview-info">
                <span>{item.productName}</span>
                <b>{item.price} ₴</b>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}