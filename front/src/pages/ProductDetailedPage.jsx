import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

// Redux Actions
import { fetchOneProduct, clearCurrentProduct } from "../redux/slices/productSlice";
import { addWishlistItem, removeWishlistItem } from "../redux/slices/wishlistSlice";
import { addItem } from "../redux/slices/cartSlice";

// Components & Styles
import Reviews from "./components/Reviews"; // Импорт компонента отзывов
import "../SCSS/pages/productDetailedPage.scss";

function ProductDetailedPage() {
  const dispatch = useDispatch();
  const { id } = useParams();

  // Достаем товар из Redux (теперь он называется currentProduct)
  // Мы переименовываем его в 'product' для удобства использования в коде ниже
  const { currentProduct: product, status } = useSelector((state) => state.product);
  const { wishlistItems } = useSelector((state) => state.wishlist);

  // Стейт для выбранных опций
  const [selectedOptions, setSelectedOptions] = useState({});

  // 1. Загружаем товар при открытии страницы
  useEffect(() => {
    dispatch(fetchOneProduct(id));

    // Очищаем данные при уходе со страницы
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [dispatch, id]);

  // 2. Автоматически выбираем первые опции, когда товар загрузился
  useEffect(() => {
    if (product && product.options) {
      const initialOptions = {};
      Object.entries(product.options).forEach(([key, values]) => {
        if (values && Array.isArray(values) && values.length > 0) {
          initialOptions[key] = values[0];
        }
      });
      setSelectedOptions(initialOptions);
    }
  }, [product]);

  // Отображение загрузки или ошибки
  if (!product) {
      return <div className="container" style={{padding: '50px'}}><h1>Loading...</h1></div>;
  }

  const productId = product._id || product.id;
  
  // Проверка вишлиста
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
      title: product.productName,
      imageUrl: product.img,
      price: product.price,
      options: selectedOptions,
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
          
          <div className="product-meta" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
             <span className="product-price">{product.price.toLocaleString()} ₴</span>
             {/* Отображение рейтинга */}
             <div className="rating" style={{ color: '#FFD700', fontSize: '18px' }}>
                 {"★".repeat(Math.round(product.rating || 0))}
                 {"☆".repeat(5 - Math.round(product.rating || 0))}
                 <span style={{ color: '#999', fontSize: '14px', marginLeft: '5px' }}>({product.numReviews} reviews)</span>
             </div>
          </div>

          {/* Блок ОПЦИЙ */}
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

          {/* Характеристики */}
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
        <p style={{ lineHeight: '1.6', marginBottom: '30px' }}>{product.text || product.description}</p>
        
        {product.details && product.details.map((detailGroup, index) => (
          <div key={index} className="details-group">
            {Object.entries(detailGroup).map(([categoryName, specsArray]) => (
              <div key={categoryName} style={{ marginBottom: '20px' }}>
                <h3 style={{ textTransform: "capitalize", borderBottom: '2px solid black', display: 'inline-block' }}>
                  {categoryName}
                </h3>
                {Array.isArray(specsArray) && specsArray.map((specItem, idx) => (
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

      {/* Секция Отзывов (НОВОЕ) */}
      <div className="reviews-section-wrapper" style={{ marginTop: '50px' }}>
          <Reviews productId={productId} />
      </div>

    </div>
  );
}

export default ProductDetailedPage;