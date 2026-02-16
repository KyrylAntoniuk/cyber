import React from "react";
import LikeSvg from "../../assets/Like.svg";
import LikeActive from "../../assets/Like_active.svg";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import "../../SCSS/components/productCard.scss";

import {
  addWishlistItem,
  removeWishlistItem,
} from "../../redux/slices/wishlistSlice";

function ProductCard(props) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Логика полей:
  const id = props.id || props._id;
  const name = props.productName || props.title || "No Name";
  const image = props.img || props.imageUrl || "";
  const price = props.price;
  
  // Достаем рейтинг (если нет, то 0)
  const rating = props.rating || 0;
  
  const isInWishlist = props.isInWishlist;

  const handleWishlist = (e) => {
    e.stopPropagation();
    if (isInWishlist) {
      dispatch(removeWishlistItem(id));
    } else {
      dispatch(addWishlistItem(id));
    }
  };

  const handleClick = () => {
    if (id) navigate(`/product/${id}`);
  };

  // Вспомогательная функция для генерации звезд
  const renderStars = (rate) => {
    const rounded = Math.round(rate); // Округляем до целого
    return (
      <>
        {"★".repeat(rounded)}
        <span style={{ color: "#ccc" }}>{"★".repeat(5 - rounded)}</span>
      </>
    );
  };

  return (
    <div className="ProductCard">
      <div className="Like-container">
        <img
          className="Like"
          src={isInWishlist ? LikeActive : LikeSvg}
          alt="like"
          onClick={handleWishlist}
          style={{ cursor: "pointer" }}
        />
      </div>
      
      <div className="product-data" onClick={handleClick} style={{ cursor: "pointer" }}>
        <img src={image} alt={name} style={{ objectFit: "contain" }} />
        <p className="product-title">{name}</p>
        
        {/* Блок рейтинга */}
        <div className="product-rating" style={{ marginBottom: '8px', color: '#ffc107', fontSize: '14px' }}>
             {renderStars(rating)} 
             <span style={{ color: '#000', fontSize: '12px', marginLeft: '5px' }}>
                ({rating})
             </span>
        </div>

        <span className="product-price">{price ? price.toLocaleString() : 0} ₴</span>
      </div>

      <button className="button-black" onClick={handleClick}>
        Buy Now
      </button>
    </div>
  );
}

export default ProductCard;