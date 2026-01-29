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
  // 1. ID может быть 'id' или '_id'
  const id = props.id || props._id;
  
  // 2. Имя может быть 'productName' (новая БД) или 'title' (старая/резервная)
  const name = props.productName || props.title || "No Name";
  
  // 3. Картинка может быть 'img' (новая БД) или 'imageUrl'
  const image = props.img || props.imageUrl || "";
  console.log("image" + image)
console.log("props.img" + props.img)
console.log("props.imageUrl" + props.imageUrl)
  const price = props.price;
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
        <span className="product-price">{price ? price.toLocaleString() : 0} ₴</span>
      </div>

      <button className="button-black" onClick={handleClick}>
        Buy Now
      </button>
    </div>
  );
}

export default ProductCard;