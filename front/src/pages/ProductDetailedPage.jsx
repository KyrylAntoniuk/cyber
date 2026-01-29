import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "../axios"; // Ваш настроенный axios
import "../SCSS/pages/productDetailedPage.scss";

import {
  addWishlistItem,
  removeWishlistItem,
} from "../redux/slices/wishlistSlice";
import { addItem } from "../redux/slices/cartSlice";

function ProductDetailedPage() {
  const dispatch = useDispatch();
  const { id } = useParams();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Стейт для выбранных опций (например: { color: "#000000", builtInMemory: "128GB" })
  const [selectedOptions, setSelectedOptions] = useState({});

  const { wishlistItems } = useSelector((state) => state.wishlist);

  useEffect(() => {
    async function fetchOneProduct() {
      try {
        const { data } = await axios.get(`/products/${id}`);
        setProduct(data);
        
        // Автоматически выбираем первые опции по умолчанию
        if (data.options) {
          const initialOptions = {};
          Object.entries(data.options).forEach(([key, values]) => {
            if (values && values.length > 0) {
              initialOptions[key] = values[0];
            }
          });
          setSelectedOptions(initialOptions);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Ошибка при загрузке товара", error);
        setLoading(false);
      }
    }
    fetchOneProduct();
  }, [id]);

  if (loading) return <div className="container"><h1>Loading...</h1></div>;
  if (!product) return <div className="container"><h1>Product not found</h1></div>;

  // Проверка вишлиста (используем id или _id)
  const productId = product.id || product._id;
  const isInWishlist = wishlistItems.some(
    (item) => (item.product ? item.product._id === productId : item.itemId === productId)
  );

  const handleWishlist = () => {
    if (isInWishlist) {
      dispatch(removeWishlistItem(productId));
    } else {
      dispatch(addWishlistItem(productId));
    }
  };

  const handleOptionSelect = (key, value) => {
    setSelectedOptions((prev) => ({ ...prev, [key]: value }));
  };

  const onClickAdd = () => {
    const item = {
      id: productId,
      title: product.productName, // Используем правильное поле из вашей БД
      imageUrl: product.img,
      price: product.price,
      options: selectedOptions, // Передаем выбранные опции в корзину
    };
    dispatch(addItem(item));
    alert("Added to cart!");
  };

  return (
    <div className="productDetailedpage">
      <div className="product-wrapper">
        {/* Левая часть: Картинка */}
        <div className="left-section">
          <img src={product.img} alt={product.productName} />
        </div>

        {/* Правая часть: Инфо */}
        <div className="right-secion">
          <h1 className="product-name">{product.productName}</h1>
          <span className="product-price">{product.price.toLocaleString()} ₴</span>

          {/* Блок ОПЦИЙ (Цвета, Память и т.д.) */}
          {product.options && (
            <div className="options">
              {Object.entries(product.options).map(([key, values]) => (
                <div key={key} className={`product-option ${key === "color" ? "color-option" : ""}`}>
                  <span style={{ textTransform: "capitalize", fontWeight: "bold" }}>
                    {key}:
                  </span>
                  <div className="option-values" style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                    {values.map((val) => {
                      const isActive = selectedOptions[key] === val;
                      // Если это цвет, рисуем кружок
                      if (key === "color") {
                        return (
                          <div
                            key={val}
                            onClick={() => handleOptionSelect(key, val)}
                            style={{
                              width: "30px", height: "30px", borderRadius: "50%",
                              backgroundColor: val,
                              border: isActive ? "3px solid #000" : "1px solid #ccc",
                              cursor: "pointer"
                            }}
                          />
                        );
                      }
                      // Иначе рисуем кнопку (например, память 128GB)
                      return (
                        <div
                          key={val}
                          onClick={() => handleOptionSelect(key, val)}
                          className={`option-item ${isActive ? "active" : ""}`}
                          style={{
                            padding: "5px 10px",
                            border: isActive ? "2px solid black" : "1px solid #ccc",
                            cursor: "pointer",
                            borderRadius: "5px",
                            backgroundColor: isActive ? "#f0f0f0" : "white"
                          }}
                        >
                          {val}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Основные Характеристики (Screen size, CPU...) */}
          <div className="characteristics" style={{ marginTop: '20px' }}>
            {product.characteristics && Object.entries(product.characteristics).map(([key, value]) => (
              <div key={key} className="characteristics-item" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '5px 0' }}>
                <span className="characteristics-name" style={{ color: '#666' }}>{key}</span>
                <span style={{ fontWeight: '500' }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Кнопки */}
          <div className="button-wrapper" style={{ marginTop: '30px' }}>
            <button onClick={handleWishlist} className={isInWishlist ? "button-black" : "button-white"}>
              {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
            </button>
            <button onClick={onClickAdd} className="button-black">
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Описание и Детали */}
      <div className="decr-section-wrapper">
        <h2>Description</h2>
        <p style={{ lineHeight: '1.6', marginBottom: '30px' }}>{product.description}</p>
        
        {/* Сложные детали из массива details */}
        {product.details && product.details.map((detailGroup, index) => (
          <div key={index} className="details-group">
            {Object.entries(detailGroup).map(([categoryName, specsArray]) => (
              <div key={categoryName} style={{ marginBottom: '20px' }}>
                <h3 style={{ textTransform: "capitalize", borderBottom: '2px solid black', display: 'inline-block' }}>
                  {categoryName}
                </h3>
                {specsArray.map((specItem, idx) => (
                  <div key={idx} style={{ marginTop: '10px' }}>
                    {Object.entries(specItem).map(([prop, val]) => (
                      <div key={prop} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '5px 0', borderBottom: '1px solid #f0f0f0' }}>
                        <span style={{ color: '#555' }}>{prop}</span>
                        <span>{val}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductDetailedPage;