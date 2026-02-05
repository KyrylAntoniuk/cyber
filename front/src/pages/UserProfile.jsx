import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

// Redux
import { selectIsAuth, fetchUpdateUser } from '../redux/slices/userSlice';
import { fetchMyOrders } from '../redux/slices/orderSlice'; // Импорт экшена заказов

// Компоненты
import OrderHistoryItem from './components/OrderHistoryItem'; // Импорт карточки заказа

// Стили
import '../SCSS/pages/userProfile.scss';

const UserProfile = () => {
  const dispatch = useDispatch();
  
  // Данные пользователя
  const isAuth = useSelector(selectIsAuth);
  const { data } = useSelector((state) => state.auth);

  // Данные заказов (переименовываем items в orders для ясности)
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
      <h1>Личный кабинет</h1>
      
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

      {/* 2. ИСТОРИЯ ЗАКАЗОВ (НОВОЕ) */}
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