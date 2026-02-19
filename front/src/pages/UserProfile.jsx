import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom'; // Добавил useNavigate

// Redux
import { selectIsAuth, fetchUpdateUser, logout } from '../redux/slices/userSlice'; // Добавил logout
import { fetchMyOrders } from '../redux/slices/orderSlice';

// Компоненты
import OrderHistoryItem from './components/OrderHistoryItem';

// Стили
import '../SCSS/pages/userProfile.scss';

const UserProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Хук для навигации
  
  // Данные пользователя
  const isAuth = useSelector(selectIsAuth);
  const { data } = useSelector((state) => state.auth);

  // Данные заказов
  const { items: orders, status: ordersStatus } = useSelector((state) => state.orders);

  // Локальный стейт для формы адреса
  const [isEditingAddress, setIsEditingAddress] = React.useState(false);
  const [newAddress, setNewAddress] = React.useState({
    addressName: '',
    address: '',
    phoneNumber: ''
  });

  // Загружаем историю заказов при входе на страницу
  useEffect(() => {
    if (isAuth) {
      dispatch(fetchMyOrders());
    }
  }, [dispatch, isAuth]);

  // Логика выхода (перенесена из Header)
  const onClickLogout = () => {
    if (window.confirm('Вы действительно хотите выйти из аккаунта?')) {
      dispatch(logout());
      window.localStorage.removeItem('token');
      navigate('/'); // Перенаправляем на главную после выхода
    }
  };

  // Проверка авторизации
  if (!isAuth && !window.localStorage.getItem('token')) {
    return <Navigate to="/login" />;
  }

  if (!data) return <div className="container">Загрузка профиля...</div>;

  // --- Методы управления адресами ---
  
  const handleAddAddress = async () => {
    if (!newAddress.addressName || !newAddress.address) {
       return alert("Заполните поля!");
    }

    const updatedAddresses = [...(data.addressList || []), newAddress];
    
    const result = await dispatch(fetchUpdateUser({
      addressList: updatedAddresses
    }));

    if (result.meta.requestStatus === 'fulfilled') {
      alert('Адрес добавлен!');
      setIsEditingAddress(false);
      setNewAddress({ addressName: '', address: '', phoneNumber: '' });
    }
  };

  const handleRemoveAddress = async (indexToRemove) => {
    if(window.confirm('Удалить этот адрес?')) {
        const updatedAddresses = data.addressList.filter((_, index) => index !== indexToRemove);
        dispatch(fetchUpdateUser({ addressList: updatedAddresses }));
    }
  };

  return (
    <div className="container user-profile">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Личный кабинет</h1>
        
        {/* КНОПКА ВЫХОДА */}
        <button 
            onClick={onClickLogout} 
            className="button" 
            style={{ backgroundColor: '#ff4d4f', color: '#fff', padding: '10px 20px', border: 'none' }}
        >
            Выйти
        </button>
      </div>
      {data?.role === 'admin' && (
  <Link to="/admin" className="header__nav-item" style={{ fontWeight: 'bold', color: 'red' }}>
    Админка
  </Link>
)}
      
      {/* 1. ИНФОРМАЦИЯ О ПОЛЬЗОВАТЕЛЕ */}
      <div className="profile-section">
        <div className="profile-info">
            <img 
              src={data.avatarUrl || "https://via.placeholder.com/100"} 
              alt="Avatar" 
              className="profile-avatar"
            />
            <div>
                <h2>{data.fullName}</h2>
                <p>{data.email}</p>
            </div>
        </div>
      </div>

      {/* 2. ИСТОРИЯ ЗАКАЗОВ */}
      <div className="profile-section">
          <h3>История заказов</h3>
          
          <div className="orders-list-wrapper" style={{ marginTop: '20px' }}>
              {ordersStatus === 'loading' ? (
                  <p>Загрузка заказов...</p>
              ) : ordersStatus === 'error' ? (
                  <p>Не удалось загрузить заказы.</p>
              ) : orders.length > 0 ? (
                  orders.map((order) => (
                      <OrderHistoryItem key={order._id} order={order} />
                  ))
              ) : (
                  <p style={{ color: '#888' }}>Вы еще ничего не заказывали.</p>
              )}
          </div>
      </div>

      {/* 3. МОИ АДРЕСА */}
      <div className="profile-section">
        <div className="section-header">
            <h3>Мои адреса</h3>
            <button 
                className="button button--outline"
                onClick={() => setIsEditingAddress(!isEditingAddress)}
            >
                {isEditingAddress ? 'Отмена' : '+ Добавить'}
            </button>
        </div>

        {isEditingAddress && (
            <div className="add-form">
                <input 
                    placeholder="Название (Дом, Офис)" 
                    value={newAddress.addressName}
                    onChange={(e) => setNewAddress({...newAddress, addressName: e.target.value})}
                />
                <input 
                    placeholder="Полный адрес" 
                    value={newAddress.address}
                    onChange={(e) => setNewAddress({...newAddress, address: e.target.value})}
                />
                <input 
                    placeholder="Телефон" 
                    value={newAddress.phoneNumber}
                    onChange={(e) => setNewAddress({...newAddress, phoneNumber: e.target.value})}
                />
                <button onClick={handleAddAddress} className="button">Сохранить</button>
            </div>
        )}

        <div className="address-list">
            {data.addressList && data.addressList.length > 0 ? (
                data.addressList.map((addr, idx) => (
                    <div key={idx} className="address-card">
                        <h4>{addr.addressName}</h4>
                        <p>{addr.address}</p>
                        <p>{addr.phoneNumber}</p>
                        <button onClick={() => handleRemoveAddress(idx)} className="remove-btn">Удалить</button>
                    </div>
                ))
            ) : (
                <p>Адресов пока нет.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;