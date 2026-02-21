import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllOrders, updateOrderStatus } from '../../redux/slices/orderSlice';

const AdminOrders = () => {
  const dispatch = useDispatch();
  const { items: orders, status: ordersStatus } = useSelector((state) => state.orders?.adminOrders || { items: [], status: 'loading' });

  // Состояния для поиска и сортировки
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('date_desc');

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  const handleStatusChange = (id, newStatus) => {
    if (window.confirm(`Изменить статус заказа на "${newStatus}"?`)) {
      dispatch(updateOrderStatus({ id, status: newStatus }));
    }
  };

  // Фильтрация и сортировка на лету (клиентская часть)
  const filteredAndSortedOrders = [...(orders || [])]
    .filter(order => {
      const q = searchQuery.toLowerCase();
      // Ищем по ID заказа, имени покупателя или его email
      const idMatch = String(order._id).toLowerCase().includes(q);
      const nameMatch = order.user?.fullName?.toLowerCase().includes(q);
      const emailMatch = order.user?.email?.toLowerCase().includes(q);
      
      return idMatch || nameMatch || emailMatch;
    })
    .sort((a, b) => {
      // ИСПОЛЬЗУЕМ totalAmount ВМЕСТО totalPrice ДЛЯ СОРТИРОВКИ
      if (sortOrder === 'date_desc') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortOrder === 'date_asc') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortOrder === 'sum_desc') return (b.totalAmount || 0) - (a.totalAmount || 0);
      if (sortOrder === 'sum_asc') return (a.totalAmount || 0) - (b.totalAmount || 0);
      return 0;
    });

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Все заказы пользователей</h2>

      {/* ПАНЕЛЬ ПОИСКА И СОРТИРОВКИ */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center' }}>
        <input 
          type="text" 
          placeholder="Поиск по ID, имени, email..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', flex: 1, outline: 'none' }}
        />
        <select 
          value={sortOrder} 
          onChange={(e) => setSortOrder(e.target.value)}
          style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', outline: 'none', cursor: 'pointer' }}
        >
          <option value="date_desc">Сначала новые (по дате)</option>
          <option value="date_asc">Сначала старые (по дате)</option>
          <option value="sum_desc">Сумма (по убыванию)</option>
          <option value="sum_asc">Сумма (по возрастанию)</option>
        </select>
      </div>

      {ordersStatus === 'loading' ? (
        <p>Загрузка заказов...</p>
      ) : filteredAndSortedOrders.length === 0 ? (
        <p style={{ color: 'gray' }}>Заказы не найдены.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #000' }}>
              <th style={{ padding: '10px' }}>ID заказа</th>
              <th>Покупатель</th>
              <th>Сумма</th>
              <th>Дата</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedOrders.map((order) => (
              <tr key={order._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px', fontSize: '14px', color: '#555' }}>{order._id}</td>
                <td>
                  {order.user ? (
                    <><div>{order.user.fullName}</div><div style={{ fontSize: '12px', color: 'gray' }}>{order.user.email}</div></>
                  ) : <span style={{ color: 'red' }}>Пользователь удален</span>}
                </td>
                {/* ИСПОЛЬЗУЕМ totalAmount ВМЕСТО totalPrice ДЛЯ ОТОБРАЖЕНИЯ */}
                <td style={{ fontWeight: 'bold' }}>{order.totalAmount || 0} ₴</td>
                <td>{new Date(order.createdAt).toLocaleDateString('ru-RU')}</td>
                <td>
                  <select 
                    value={order.status} 
                    onChange={(e) => handleStatusChange(order._id, e.target.value)} 
                    style={{ padding: '6px', borderRadius: '5px', border: '1px solid #ccc', background: order.status === 'Delivered' ? '#d4edda' : '#fff' }}
                  >
                    <option value="Pending">Ожидает (Pending)</option>
                    <option value="Processing">В обработке (Processing)</option>
                    <option value="Shipped">Отправлен (Shipped)</option>
                    <option value="Delivered">Доставлен (Delivered)</option>
                    <option value="Cancelled">Отменен (Cancelled)</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminOrders;