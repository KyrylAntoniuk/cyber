import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { logout, selectIsAuth } from '../../redux/slices/userSlice';

// Импорт иконок
import Logo from '../../assets/Logo.svg';
import UserIcon from '../../assets/User.svg';
import CartIcon from '../../assets/Cart.svg';
import FavoritesIcon from '../../assets/Favorites.svg';
import BurgerIcon from '../../assets/Burger.svg'; // Для мобильной версии, если понадобится

// Импорт стилей и компонентов
import '../../SCSS/components/header.scss';
import Search from './Search'; 

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuth = useSelector(selectIsAuth);
  
  // Можно также достать количество товаров в корзине для счетчика
  // const { cartItems } = useSelector(state => state.cart);

  const onClickLogout = () => {
    if (window.confirm('Вы действительно хотите выйти из аккаунта?')) {
      dispatch(logout());
      window.localStorage.removeItem('token');
      navigate('/'); // Перенаправляем на главную после выхода
    }
  };

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
              {/* Если захотите счетчик: 
                 {cartItems.length > 0 && <span className="badge">{cartItems.length}</span>} 
              */}
            </Link>

            {/* Профиль / Вход */}
            {isAuth ? (
              <button 
                onClick={onClickLogout} 
                className="header__nav-item button-logout" 
                title="Выйти"
              >
                <img src={UserIcon} alt="User" className="user-icon-active" />
              </button>
            ) : (
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