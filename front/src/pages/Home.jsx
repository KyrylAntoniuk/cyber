import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import ProductCard from './components/ProductCard';
import { fetchProducts } from '../redux/slices/productSlice';

import '../SCSS/pages/homePage.scss';

const Home = () => {
  const dispatch = useDispatch();
  
  // Достаем товары и избранное из Redux
  const { items, status } = useSelector((state) => state.product); 
  const { wishlistItems } = useSelector((state) => state.wishlist);

  // При загрузке главной страницы запрашиваем 4 лучших товара (сортировка по рейтингу)
  useEffect(() => {
    dispatch(fetchProducts({ limit: 4, sortBy: 'rating' }));
    window.scrollTo(0, 0);
  }, [dispatch]);

  const wishlistSet = new Set(wishlistItems.map((i) => (i.product ? i.product._id : i.itemId)));

  return (
    <div className="home-page">
      {/* 1. БЛОК HERO (Главный баннер) */}
      <section className="hero">
        <div className="container hero__container">
          <div className="hero__content">
            <h1>Новое измерение технологий</h1>
            <p>
              Откройте для себя мир инноваций с нашими премиальными гаджетами. 
              Лучшие смартфоны, ноутбуки и аксессуары в Cyber Shop по самым выгодным ценам.
            </p>
            <Link to="/catalog" className="button button-black hero__btn">
              Перейти в каталог
            </Link>
          </div>
          <div className="hero__image">
            {/* Временная картинка-заглушка. Можешь заменить на свой PNG с айфоном или наушниками */}
            <img 
              src="https://png.pngtree.com/png-vector/20240213/ourmid/pngtree-3d-black-mobile-phone-with-blank-screen-png-image_11728282.png" 
              alt="Cyber Gadgets" 
            />
          </div>
        </div>
      </section>

      {/* 2. БЛОК ПРЕИМУЩЕСТВ */}
      <section className="advantages container">
        <div className="advantages__item">
          <div className="adv-icon">🚀</div>
          <h3>Быстрая доставка</h3>
          <p>Доставляем по всей стране в кратчайшие сроки прямиком до двери.</p>
        </div>
        <div className="advantages__item">
          <div className="adv-icon">🛡️</div>
          <h3>Гарантия качества</h3>
          <p>На все товары предоставляется официальная гарантия от производителя.</p>
        </div>
        <div className="advantages__item">
          <div className="adv-icon">💳</div>
          <h3>Удобная оплата</h3>
          <p>Оплачивайте заказы картой онлайн, наличными при получении или в рассрочку.</p>
        </div>
      </section>

      {/* 3. ПОПУЛЯРНЫЕ ТОВАРЫ */}
      <section className="popular-products container">
        <div className="popular-products__header">
          <h2>Популярные товары</h2>
          <Link to="/catalog" className="view-all-link">Смотреть все -</Link>
        </div>
        
        <div className="items-wrapper">
            <div className="items">
                {status === "loading" ? (
                    <h2>Загрузка...</h2> 
                ) : (
                    items.map(obj => (
                        <ProductCard 
                            key={obj._id} 
                            {...obj} 
                            isInWishlist={wishlistSet.has(obj._id)} 
                        />
                    ))
                )}
            </div>
        </div>
      </section>
    </div>
  );
};

export default Home;