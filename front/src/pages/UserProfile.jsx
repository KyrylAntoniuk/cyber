import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { selectIsAuth, fetchUpdateUser } from '../redux/slices/userSlice';
import '../SCSS/pages/userProfile.scss'; // Создадим стили ниже

const UserProfile = () => {
  const dispatch = useDispatch();
  const isAuth = useSelector(selectIsAuth);
  const { data } = useSelector((state) => state.auth);

  const [isEditingAddress, setIsEditingAddress] = React.useState(false);
  
  // Стейт для новой формы адреса
  const [newAddress, setNewAddress] = React.useState({
    addressName: '',
    address: '',
    phoneNumber: ''
  });

  if (!isAuth && !window.localStorage.getItem('token')) {
    return <Navigate to="/login" />;
  }

  if (!data) return <div>Загрузка профиля...</div>;

  const handleAddAddress = async () => {
    // Создаем копию текущего списка адресов и добавляем новый
    const updatedAddresses = [...(data.addressList || []), newAddress];
    
    // Отправляем на сервер
    const result = await dispatch(fetchUpdateUser({
      addressList: updatedAddresses
    }));

    if (result.payload) {
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

      {/* Здесь позже добавим блок Payment Info аналогично Address Info */}
    </div>
  );
};

export default UserProfile;