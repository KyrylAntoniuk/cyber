import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { selectIsAuth } from '../../redux/slices/userSlice';

// Импорт иконок
import Logo from '../../assets/Logo.svg';
import UserIcon from '../../assets/User.svg';
import CartIcon from '../../assets/Cart.svg';
import FavoritesIcon from '../../assets/Favorites.svg';

// Импорт стилей и компонентов
import '../../SCSS/components/header.scss';
import Search from './Search'; 

function Header() {
  const isAuth = useSelector(selectIsAuth);
  
  // const { cartItems } = useSelector(state => state.cart);

  return (
    <header className="header">
      <div className="container">
        <div className="header__wrapper">
          
          {/* 1. Логотип */}
          <Link to="/" className="header__logo">
            <img src={Logo} alt="Cyber Shop" />
          </Link>

          {/* 2. Поиск */}
          <div className="header__search">
            <Search />
          </div>

          {/* 3. Меню навигации (Иконки) */}
          <nav className="header__nav">
            
            {/* Избранное */}
            <Link to="/wishlist" className="header__nav-item">
              <img src={FavoritesIcon} alt="Favorites" />
            </Link>

            {/* Корзина */}
            <Link to="/cart" className="header__nav-item">
              <img src={CartIcon} alt="Cart" />
            </Link>

            {/* Профиль / Вход */}
            {isAuth ? (
              // ЕСЛИ АВТОРИЗОВАН -> ВЕДЕМ В ЛИЧНЫЙ КАБИНЕТ
              <Link to="/profile" className="header__nav-item" title="Личный кабинет">
                <img src={UserIcon} alt="Profile" />
              </Link>
            ) : (
              // ЕСЛИ НЕ АВТОРИЗОВАН -> ВЕДЕМ НА ЛОГИН
              <Link to="/login" className="header__nav-item" title="Войти">
                <img src={UserIcon} alt="Login" />
              </Link>
            )}

          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;