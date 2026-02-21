import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

// Импортируем наши новые компоненты
import AdminProducts from './components/AdminProducts';
import AdminOrders from './components/AdminOrders';

const AdminPanel = () => {
  const { data: user, status: userStatus } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('products'); 

  // Проверка прав администратора
  if (userStatus === 'success' && user?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  // Общие стили для кнопок табов
  const getTabStyle = (tabName) => ({
    padding: '10px 20px', 
    cursor: 'pointer', 
    background: activeTab === tabName ? '#000' : 'transparent', 
    color: activeTab === tabName ? '#fff' : '#000', 
    border: '1px solid #000', 
    borderRadius: '5px'
  });

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <h1>Панель управления</h1>

      {/* Навигация (Табы) */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        <button onClick={() => setActiveTab('products')} style={getTabStyle('products')}>
          Управление товарами
        </button>
        <button onClick={() => setActiveTab('orders')} style={getTabStyle('orders')}>
          Управление заказами
        </button>
      </div>

      {/* Рендер активного компонента */}
      {activeTab === 'products' && <AdminProducts />}
      {activeTab === 'orders' && <AdminOrders />}
      
    </div>
  );
};

export default AdminPanel;