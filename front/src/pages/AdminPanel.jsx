import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { fetchProducts } from '../redux/slices/productSlice';
import axios from '../axios';

const AdminPanel = () => {
  const dispatch = useDispatch();
  
  // Достаем пользователя, чтобы проверить, админ ли он
  const { data: user, status: userStatus } = useSelector((state) => state.auth);
  const { items, status: productsStatus } = useSelector((state) => state.product);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 100 })); // Грузим побольше товаров для таблицы
  }, [dispatch]);

  // Защита роута: если юзер загрузился и он не админ -> кидаем на главную
  if (userStatus === 'success' && user?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  const handleDelete = async (id) => {
    if (window.confirm('Точно удалить этот товар?')) {
      try {
        await axios.delete(`/products/${id}`);
        alert('Товар удален!');
        // Перезапрашиваем список товаров после удаления
        dispatch(fetchProducts({ limit: 100 }));
      } catch (err) {
        alert('Ошибка при удалении');
        console.error(err);
      }
    }
  };

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1>Панель управления</h1>
        <button className="button button-black">Добавить товар</button>
      </div>

      {productsStatus === 'loading' ? (
        <p>Загрузка товаров...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #000' }}>
              <th style={{ padding: '10px' }}>Фото</th>
              <th>Название</th>
              <th>Цена</th>
              <th>Рейтинг</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>
                  <img src={item.img || item.imageUrl} alt="img" width="50" height="50" style={{ objectFit: 'contain' }}/>
                </td>
                <td>{item.productName || item.title}</td>
                <td>{item.price} ₴</td>
                <td>{item.rating} ★</td>
                <td>
                  <button 
                    onClick={() => handleDelete(item._id)} 
                    style={{ background: 'red', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '5px' }}
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminPanel;