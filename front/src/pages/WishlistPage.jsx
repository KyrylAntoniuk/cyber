import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProductCard from "./components/ProductCard";
import { fetchWishlistItems } from "../redux/slices/wishlistSlice";
import "../SCSS/pages/productsPage.scss"; // Используем стили от каталога, чтобы карточки стояли ровно

export default function WishlistPage() {
  const dispatch = useDispatch();
  
  // Достаем данные из Redux
  const { wishlistItems, status } = useSelector((state) => state.wishlist);

  useEffect(() => {
    // Просто обновляем список при заходе на страницу
    dispatch(fetchWishlistItems());
  }, [dispatch]);

  if (status === 'loading') {
    return <div className="container" style={{marginTop: '50px'}}><h2>Loading...</h2></div>;
  }

  if (!wishlistItems || wishlistItems.length === 0) {
    return (
        <div className="container" style={{marginTop: '50px'}}>
            <h2>Your wishlist is empty 😕</h2>
        </div>
    );
  }

  return (
    <div className="container">
      <h1 style={{ margin: '30px 0' }}>My Wishlist</h1>
      
      <div className="items-wrapper">
        <div className="items" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '30px' }}>
          {wishlistItems.map((item) => {
            // Бэкенд возвращает объект: { _id: "...", product: { ...товар... } }
            // Нам нужно достать именно поле product.
            // Если вдруг товар был удален из базы, product может быть null, поэтому ставим проверку.
            if (!item.product) return null;

            return (
              <ProductCard
                key={item.product._id}
                {...item.product} // Передаем все свойства товара (img, productName, price)
                title={item.product.title}
                productName={item.product.title} // Совместимость с ProductCard
                img={item.product.images?.[0]} 
                isInWishlist={true} // Мы и так в вишлисте
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}