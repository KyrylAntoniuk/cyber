import React from "react";
import { useDispatch } from "react-redux";
import "../../SCSS/components/cartItem.scss";
// Убедитесь, что пути правильные, SVG часто капризны к регистру букв
import CloseSvg from "../../assets/Close.svg"; 
import MinusSvg from "../../assets/Minus.svg"; 
import PlusSvg from "../../assets/Plus.svg"; 

import { addItem, minusItem, removeItem } from "../../redux/slices/cartSlice";

const CartItem = ({ id, title, price, count, imageUrl, type, size }) => {
  const dispatch = useDispatch();

  const onClickPlus = () => {
    dispatch(
      addItem({
        id,
        title,
        price,
        imageUrl,
        type,
        size,
      })
    );
  };

  const onClickMinus = () => {
    if (count > 1) {
       dispatch(minusItem(id));
    } else {
       if(window.confirm('Удалить товар?')) {
         dispatch(removeItem(id));
       }
    }
  };

  const onClickRemove = () => {
    if (window.confirm("Вы действительно хотите удалить товар?")) {
      dispatch(removeItem(id));
    }
  };

  return (
    <div className="cart-item">
      <div className="cart-item__img">
        <img className="cart-item__image" src={imageUrl} alt="Pizza" />
      </div>
      <div className="cart-item__info">
        <h3>{title}</h3>
        <p>{type} {size}</p> 
      </div>
      <div className="cart-item__count">
        <button
          disabled={count === 1}
          onClick={onClickMinus}
          className="button button--outline button--circle cart-item__count-minus"
        >
          <img src={MinusSvg} alt="minus" />
        </button>
        <b>{count}</b>
        <button
          onClick={onClickPlus}
          className="button button--outline button--circle cart-item__count-plus"
        >
          <img src={PlusSvg} alt="plus" />
        </button>
      </div>
      <div className="cart-item__price">
        <b>{price * count} ₴</b>
      </div>
      <div className="cart-item__remove">
        <button onClick={onClickRemove} className="button button--outline button--circle">
          <img src={CloseSvg} alt="close" />
        </button>
      </div>
    </div>
  );
};

export default CartItem;