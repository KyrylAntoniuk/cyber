import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { fetchProducts } from '../redux/slices/productSlice';
import axios from '../axios';

const AdminPanel = () => {
  const dispatch = useDispatch();
  
  const { data: user, status: userStatus } = useSelector((state) => state.auth);
  const { items, status: productsStatus } = useSelector((state) => state.product);

  // --- НОВОЕ: Стейты для формы добавления товара ---
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    productName: '',
    price: '',
    img: '',
    brand: '',
    description: ''
  });

  useEffect(() => {
    dispatch(fetchProducts({ limit: 100 })); 
  }, [dispatch]);

  // Защита роута
  if (userStatus === 'success' && user?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  // --- НОВОЕ: Функция создания товара ---
  const handleSubmit = async (e) => {
    e.preventDefault(); // Предотвращаем перезагрузку страницы
    try {
      // Отправляем запрос на бэкенд
      await axios.post('/products', {
        ...formData,
        price: Number(formData.price) // Убедимся, что цена улетит как число
      });
      
      alert('Товар успешно добавлен!');
      
      // Сбрасываем форму и закрываем её
      setFormData({ productName: '', price: '', img: '', brand: '', description: '' });
      setIsFormOpen(false);
      
      // Заново запрашиваем список товаров, чтобы новый появился в таблице
      dispatch(fetchProducts({ limit: 100 }));
    } catch (err) {
      alert('Ошибка при добавлении товара');
      console.error(err);
    }
  };

  // Обработчик изменения полей ввода
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Функция удаления товара
  const handleDelete = async (id) => {
    if (window.confirm('Точно удалить этот товар?')) {
      try {
        await axios.delete(`/products/${id}`);
        alert('Товар удален!');
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
        <button 
            className="button button-black"
            onClick={() => setIsFormOpen(!isFormOpen)} // Переключаем видимость формы
        >
            {isFormOpen ? 'Закрыть форму' : '+ Добавить товар'}
        </button>
      </div>

      {/* --- НОВОЕ: Блок с формой (виден только если isFormOpen === true) --- */}
      {isFormOpen && (
        <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '10px', marginBottom: '30px', border: '1px solid #ddd' }}>
          <h3>Создание нового товара</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '500px', marginTop: '15px' }}>
            <input 
              type="text" name="productName" placeholder="Название товара" required
              value={formData.productName} onChange={handleChange} 
              style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
            <input 
              type="number" name="price" placeholder="Цена (₴)" required
              value={formData.price} onChange={handleChange} 
              style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
            <input 
              type="text" name="img" placeholder="URL картинки (https://...)" required
              value={formData.img} onChange={handleChange} 
              style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
            <input 
              type="text" name="brand" placeholder="Бренд (например: Apple)" required
              value={formData.brand} onChange={handleChange} 
              style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
            <textarea 
              name="description" placeholder="Описание товара..." rows="4" required
              value={formData.description} onChange={handleChange} 
              style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', resize: 'vertical' }}
            />
            <button type="submit" className="button button-black" style={{ marginTop: '10px' }}>
              Сохранить товар
            </button>
          </form>
        </div>
      )}

      {/* Таблица товаров */}
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
                <td>{item.rating || 0} ★</td>
                <td>
                  <button 
                    onClick={() => handleDelete(item._id)} 
                    style={{ background: '#ff4d4f', color: 'white', border: 'none', padding: '8px 12px', cursor: 'pointer', borderRadius: '5px' }}
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