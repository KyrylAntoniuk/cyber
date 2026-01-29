import React from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

// Импортируем правильные действия
import { clearCart, removeItem, minusItem, addItem } from "../redux/slices/cartSlice";

import CartItem from "./components/CartItem";
// import CartEmpty from "../assets/CartEmpty.png";
// import TrashSvg from "../assets/Trash.svg"; 

import "../SCSS/pages/cartPage.scss";

const CartPage = () => {
  const dispatch = useDispatch();
  
  // Достаем items и totalPrice из Redux
  const { items, totalPrice } = useSelector((state) => state.cart);
  
  // Безопасная проверка на массив
  const cartItems = items || [];
  const totalCount = cartItems.reduce((sum, item) => sum + item.count, 0);

  const onClickClear = () => {
    if (window.confirm("Очистить корзину?")) {
      dispatch(clearCart());
    }
  };

  // Если корзина пуста
  if (!cartItems.length) {
    return (
      <div className="container container--cart">
        <div className="cart cart--empty">
          <h2>Корзина пустая 😕</h2>
          <p>
            Вероятней всего, вы еще ничего не заказывали.<br />
            Для того, чтобы сделать заказ, перейди на главную страницу.
          </p>
          {/* Если картинки нет, можно убрать <img> */}
          {/* <img src={CartEmpty} alt="Empty cart" /> */}
          <Link to="/" className="button button--black">
            <span>Вернуться назад</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container container--cart">
      <div className="cart">
        <div className="cart__top">
          <h2 className="content__title">
             Корзина
          </h2>
          <div onClick={onClickClear} className="cart__clear">
            {/* <img src={TrashSvg} alt="trash" /> */}
            <span>Очистить корзину</span>
          </div>
        </div>
        
        <div className="content__items">
          {cartItems.map((item) => (
            <CartItem 
              key={item.id} 
              {...item} 
            />
          ))}
        </div>
        
        <div className="cart__bottom">
          <div className="cart__bottom-details">
            <span>
              Всего товаров: <b>{totalCount} шт.</b>
            </span>
            <span>
              Сумма заказа: <b>{totalPrice.toLocaleString()} ₴</b>
            </span>
          </div>
          <div className="cart__bottom-buttons">
            <Link to="/" className="button button--outline button--add go-back-btn">
              <span>Вернуться назад</span>
            </Link>
            <Link to="/cart/checkout" className="button pay-btn">
              <span>Оплатить сейчас</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;