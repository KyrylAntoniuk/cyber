import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { fetchProducts } from '../redux/slices/productSlice';
import { fetchAllOrders, updateOrderStatus } from '../redux/slices/orderSlice';
import axios from '../axios';

// ================= КОНФИГУРАЦИЯ КАТЕГОРИЙ =================
const PRODUCT_TYPES = {
  phones: {
    label: 'Телефоны',
    characteristics: ['Memory', 'Screen size', 'CPU', 'Number of Cores', 'Main camera', 'Front-camera', 'Battery capacity'],
    details: [
      { group: 'screen', key: 'screenDiagonal' },
      { group: 'screen', key: 'theScreenResolution' },
      { group: 'CPU', key: 'CPU' }
    ]
  },
  laptops: {
    label: 'Ноутбуки',
    characteristics: ['Processor', 'RAM', 'Storage', 'Display', 'Graphics', 'Battery'],
    details: [
      { group: 'display', key: 'size' },
      { group: 'display', key: 'resolution' },
      { group: 'performance', key: 'CPU' },
      { group: 'performance', key: 'GPU' }
    ]
  },
  cameras: {
    label: 'Камеры',
    characteristics: ['Megapixels', 'Sensor Type', 'Video Resolution', 'ISO Range', 'Battery'],
    details: [
      { group: 'sensor', key: 'type' },
      { group: 'sensor', key: 'size' },
      { group: 'video', key: 'maxResolution' }
    ]
  },
  other: {
    label: 'Другое',
    characteristics: ['Weight', 'Dimensions', 'Color'],
    details: [
      { group: 'general', key: 'material' }
    ]
  }
};

const AdminPanel = () => {
  const dispatch = useDispatch();
  
  const { data: user, status: userStatus } = useSelector((state) => state.auth);
  const { items: products, status: productsStatus } = useSelector((state) => state.product);
  const { items: orders, status: ordersStatus } = useSelector((state) => state.orders?.adminOrders || { items: [], status: 'loading' });

  const [activeTab, setActiveTab] = useState('products'); 
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  // Функция для генерации дефолтного стейта на основе категории
  const getInitialStateByCategory = (categoryKey = 'phones') => {
    const config = PRODUCT_TYPES[categoryKey];
    return {
      productName: '', price: '', img: '', brand: '', description: '', category: categoryKey,
      colors: [],
      characteristics: config.characteristics.map(key => ({ key, value: '' })),
      details: config.details.map(d => ({ group: d.group, key: d.key, value: '' }))
    };
  };

  const [formData, setFormData] = useState(getInitialStateByCategory('phones'));

  useEffect(() => {
    if (activeTab === 'products') dispatch(fetchProducts({ limit: 100 })); 
    else if (activeTab === 'orders') dispatch(fetchAllOrders());
  }, [dispatch, activeTab]);

  if (userStatus === 'success' && user?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  // ================= ОБРАБОТЧИКИ ИЗМЕНЕНИЙ =================
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- НОВОЕ: Обработчик смены категории ---
  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    
    setFormData((prev) => {
      const newState = { ...prev, category: newCategory };
      
      // Если мы создаем новый товар (а не редактируем старый), 
      // то при смене категории подставляем её шаблонные характеристики
      if (!editingProductId) {
        const config = PRODUCT_TYPES[newCategory] || PRODUCT_TYPES.other;
        newState.characteristics = config.characteristics.map(key => ({ key, value: '' }));
        newState.details = config.details.map(d => ({ group: d.group, key: d.key, value: '' }));
      }
      
      return newState;
    });
  };

  // Цвета
  const handleColorChange = (index, value) => {
    const newColors = [...formData.colors];
    newColors[index] = value;
    setFormData((prev) => ({ ...prev, colors: newColors }));
  };
  const addColorItem = () => setFormData((prev) => ({ ...prev, colors: [...prev.colors, ''] }));
  const removeColorItem = (index) => setFormData((prev) => ({ ...prev, colors: prev.colors.filter((_, i) => i !== index) }));

  // Характеристики
  const handleCharChange = (index, field, value) => {
    const newChars = [...formData.characteristics];
    newChars[index][field] = value;
    setFormData((prev) => ({ ...prev, characteristics: newChars }));
  };
  const addCharItem = () => setFormData((prev) => ({ ...prev, characteristics: [...prev.characteristics, { key: '', value: '' }] }));
  const removeCharItem = (index) => setFormData((prev) => ({ ...prev, characteristics: prev.characteristics.filter((_, i) => i !== index) }));

  // Кастомные Детали
  const handleDetailChange = (index, field, value) => {
    const newDetails = [...formData.details];
    newDetails[index][field] = value;
    setFormData((prev) => ({ ...prev, details: newDetails }));
  };
  const addDetailItem = () => setFormData((prev) => ({ ...prev, details: [...prev.details, { group: '', key: '', value: '' }] }));
  const removeDetailItem = (index) => setFormData((prev) => ({ ...prev, details: prev.details.filter((_, i) => i !== index) }));

  // ================= ОТПРАВКА И ЗАПОЛНЕНИЕ =================

  const handleEditClick = (product) => {
    // Определяем категорию, если её нет - ставим 'other'
    const prodCategory = product.category || 'other';

    const charsObj = product.characteristics || {};
    let charsArr = Object.entries(charsObj).map(([key, value]) => ({ key, value }));

    let detailsArr = [];
    if (product.details && product.details[0]) {
      Object.entries(product.details[0]).forEach(([groupName, groupArr]) => {
        if (groupArr && groupArr[0]) {
          Object.entries(groupArr[0]).forEach(([key, value]) => {
            detailsArr.push({ group: groupName, key, value });
          });
        }
      });
    }

    setFormData({
      productName: product.productName || product.title || '',
      price: product.price || '',
      img: product.img || product.imageUrl || '',
      brand: product.brand || '',
      description: product.description || '',
      category: prodCategory, // <-- Загружаем категорию
      colors: product.options?.color || [],
      characteristics: charsArr,
      details: detailsArr
    });
    setEditingProductId(product._id);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();

    const packedCharacteristics = formData.characteristics.reduce((acc, char) => {
      if (char.key.trim() && char.value.trim()) acc[char.key.trim()] = char.value.trim();
      return acc;
    }, {});

    const detailsObj = {};
    formData.details.forEach(detail => {
      const g = detail.group.trim();
      const k = detail.key.trim();
      const v = detail.value.trim();
      if (g && k && v) {
        if (!detailsObj[g]) detailsObj[g] = [{}];
        detailsObj[g][0][k] = v;
      }
    });
    const packedDetails = Object.keys(detailsObj).length > 0 ? [detailsObj] : [];

    const payload = {
      productName: formData.productName,
      price: Number(formData.price),
      img: formData.img,
      brand: formData.brand,
      description: formData.description,
      category: formData.category, // <-- Отправляем категорию на бэкенд
      characteristics: packedCharacteristics,
      options: { color: formData.colors.map(c => c.trim()).filter(Boolean) },
      details: packedDetails
    };

    try {
      if (editingProductId) {
        await axios.patch(`/products/${editingProductId}`, payload);
        alert('Товар успешно обновлен!');
      } else {
        await axios.post('/products', payload);
        alert('Товар успешно добавлен!');
      }
      resetForm();
      dispatch(fetchProducts({ limit: 100 }));
    } catch (err) {
      alert(editingProductId ? 'Ошибка при обновлении товара' : 'Ошибка при добавлении товара');
      console.error(err);
    }
  };

  const handleProductDelete = async (id) => {
    if (window.confirm('Точно удалить этот товар?')) {
      try {
        await axios.delete(`/products/${id}`);
        alert('Товар удален!');
        dispatch(fetchProducts({ limit: 100 }));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleStatusChange = (id, newStatus) => {
    if (window.confirm(`Изменить статус заказа на "${newStatus}"?`)) {
      dispatch(updateOrderStatus({ id, status: newStatus }));
    }
  };

  const resetForm = () => {
    setFormData(getInitialStateByCategory('phones'));
    setEditingProductId(null);
    setIsFormOpen(false);
  };

  // ================= СТИЛИ =================
  const inputStyle = { padding: '8px', borderRadius: '5px', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box' };
  const sectionStyle = { border: '1px solid #ddd', padding: '15px', borderRadius: '8px', background: '#fff', marginBottom: '15px' };
  const addBtnStyle = { background: '#f6ffed', color: '#1890ff', border: '1px dashed #1890ff', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer', fontSize: '13px', marginTop: '10px' };
  const delBtnStyle = { background: '#fff1f0', color: '#ff4d4f', border: '1px solid #ffa39e', padding: '6px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '13px' };

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <h1>Панель управления</h1>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        <button onClick={() => setActiveTab('products')} style={{ padding: '10px 20px', cursor: 'pointer', background: activeTab === 'products' ? '#000' : 'transparent', color: activeTab === 'products' ? '#fff' : '#000', border: '1px solid #000', borderRadius: '5px' }}>Управление товарами</button>
        <button onClick={() => setActiveTab('orders')} style={{ padding: '10px 20px', cursor: 'pointer', background: activeTab === 'orders' ? '#000' : 'transparent', color: activeTab === 'orders' ? '#fff' : '#000', border: '1px solid #000', borderRadius: '5px' }}>Управление заказами</button>
      </div>

      {activeTab === 'products' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2>Список товаров</h2>
            <button className="button button-black" onClick={() => isFormOpen ? resetForm() : setIsFormOpen(true)}>
                {isFormOpen ? 'Отменить / Закрыть' : '+ Добавить товар'}
            </button>
          </div>

          {isFormOpen && (
            <div style={{ background: '#f9f9f9', padding: '25px', borderRadius: '10px', marginBottom: '30px', border: '1px solid #ddd' }}>
              <h3 style={{ color: editingProductId ? '#1890ff' : '#000', marginBottom: '20px' }}>
                {editingProductId ? 'Редактирование товара' : 'Создание нового товара'}
              </h3>
              
              <form onSubmit={handleProductSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  
                  {/* КОЛОНКА 1: Основа и Детали */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={sectionStyle}>
                      <h4 style={{ marginTop: 0 }}>Основная информация</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        
                        {/* --- ВЫБОР КАТЕГОРИИ --- */}
                        <label style={{ fontSize: '12px', color: 'gray', marginBottom: '-5px' }}>Категория товара:</label>
                        <select 
                          name="category" 
                          value={formData.category} 
                          onChange={handleCategoryChange} 
                          style={{ ...inputStyle, cursor: 'pointer', background: '#fff' }}
                        >
                          {Object.entries(PRODUCT_TYPES).map(([key, config]) => (
                            <option key={key} value={key}>{config.label}</option>
                          ))}
                        </select>

                        <input type="text" name="productName" placeholder="Название товара*" required value={formData.productName} onChange={handleChange} style={inputStyle} />
                        <input type="number" name="price" placeholder="Цена (₴)*" required value={formData.price} onChange={handleChange} style={inputStyle} />
                        <input type="text" name="img" placeholder="URL картинки*" required value={formData.img} onChange={handleChange} style={inputStyle} />
                        <input type="text" name="brand" placeholder="Бренд (например: Apple)*" required value={formData.brand} onChange={handleChange} style={inputStyle} />
                        <textarea name="description" placeholder="Описание товара..." rows="4" required value={formData.description} onChange={handleChange} style={{ ...inputStyle, resize: 'vertical' }} />
                      </div>
                    </div>

                    <div style={sectionStyle}>
                      <h4 style={{ marginTop: 0 }}>Технические детали (Details)</h4>
                      {formData.details.map((detail, index) => (
                        <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', background: '#f0f2f5', padding: '10px', borderRadius: '5px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                            <input type="text" placeholder="Группа (напр. screen)" value={detail.group} onChange={(e) => handleDetailChange(index, 'group', e.target.value)} style={inputStyle} />
                            <input type="text" placeholder="Свойство (напр. screenDiagonal)" value={detail.key} onChange={(e) => handleDetailChange(index, 'key', e.target.value)} style={inputStyle} />
                            <input type="text" placeholder="Значение" value={detail.value} onChange={(e) => handleDetailChange(index, 'value', e.target.value)} style={inputStyle} />
                          </div>
                          <button type="button" onClick={() => removeDetailItem(index)} style={{ ...delBtnStyle, height: 'fit-content', alignSelf: 'center' }}>✕</button>
                        </div>
                      ))}
                      <button type="button" onClick={addDetailItem} style={addBtnStyle}>+ Добавить деталь</button>
                    </div>
                  </div>

                  {/* КОЛОНКА 2: Динамические характеристики и Опции */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    <div style={sectionStyle}>
                      <h4 style={{ marginTop: 0 }}>Характеристики</h4>
                      {formData.characteristics.map((char, index) => (
                        <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                          <input type="text" placeholder="Название ключа" value={char.key} onChange={(e) => handleCharChange(index, 'key', e.target.value)} style={{...inputStyle, flex: 1}} />
                          <input type="text" placeholder="Значение" value={char.value} onChange={(e) => handleCharChange(index, 'value', e.target.value)} style={{...inputStyle, flex: 1}} />
                          <button type="button" onClick={() => removeCharItem(index)} style={delBtnStyle}>✕</button>
                        </div>
                      ))}
                      <button type="button" onClick={addCharItem} style={addBtnStyle}>+ Добавить характеристику</button>
                    </div>

                    <div style={sectionStyle}>
                      <h4 style={{ marginTop: 0 }}>Опции: Цвета</h4>
                      {formData.colors.map((color, index) => (
                        <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                          <input type="text" placeholder="HEX код или название (#000000)" value={color} onChange={(e) => handleColorChange(index, e.target.value)} style={inputStyle} />
                          <button type="button" onClick={() => removeColorItem(index)} style={delBtnStyle}>✕</button>
                        </div>
                      ))}
                      <button type="button" onClick={addColorItem} style={addBtnStyle}>+ Добавить цвет</button>
                    </div>

                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px', marginTop: '20px', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
                  <button type="submit" className="button button-black" style={{ padding: '12px 40px', background: editingProductId ? '#1890ff' : '#000', borderColor: editingProductId ? '#1890ff' : '#000' }}>
                    {editingProductId ? 'Обновить товар' : 'Сохранить товар'}
                  </button>
                  {editingProductId && (
                    <button type="button" onClick={resetForm} style={{ padding: '12px 40px', cursor: 'pointer', borderRadius: '5px', border: '1px solid #ccc', background: '#fff' }}>
                      Отменить
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* ТАБЛИЦА ТОВАРОВ */}
          {productsStatus === 'loading' ? (
            <p>Загрузка товаров...</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #000' }}>
                  <th style={{ padding: '10px' }}>Фото</th>
                  <th>Название</th>
                  <th>Категория</th>
                  <th>Цена</th>
                  <th>Бренд</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {products.map((item) => (
                  <tr key={item._id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px' }}><img src={item.img || item.imageUrl} alt="img" width="50" height="50" style={{ objectFit: 'contain' }}/></td>
                    <td style={{ maxWidth: '200px' }}>{item.productName || item.title}</td>
                    <td style={{ color: 'gray', fontSize: '13px' }}>
                       {PRODUCT_TYPES[item.category]?.label || item.category || 'Другое'}
                    </td>
                    <td style={{ fontWeight: 'bold' }}>{item.price} ₴</td>
                    <td>{item.brand}</td>
                    <td style={{ display: 'flex', gap: '10px', padding: '15px 0' }}>
                      <button onClick={() => handleEditClick(item)} style={{ background: '#1890ff', color: 'white', border: 'none', padding: '8px 12px', cursor: 'pointer', borderRadius: '5px' }}>Изменить</button>
                      <button onClick={() => handleProductDelete(item._id)} style={{ background: '#ff4d4f', color: 'white', border: 'none', padding: '8px 12px', cursor: 'pointer', borderRadius: '5px' }}>Удалить</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ТАБЛИЦА ЗАКАЗОВ */}
      {activeTab === 'orders' && (
        <div>
          <h2 style={{ marginBottom: '20px' }}>Все заказы пользователей</h2>
          {ordersStatus === 'loading' ? (
            <p>Загрузка заказов...</p>
          ) : orders.length === 0 ? (
            <p>Заказов пока нет.</p>
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
                {orders.map((order) => (
                  <tr key={order._id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px', fontSize: '14px', color: '#555' }}>{order._id}</td>
                    <td>
                      {order.user ? (
                        <><div>{order.user.fullName}</div><div style={{ fontSize: '12px', color: 'gray' }}>{order.user.email}</div></>
                      ) : <span style={{ color: 'red' }}>Пользователь удален</span>}
                    </td>
                    <td style={{ fontWeight: 'bold' }}>{order.totalPrice} ₴</td>
                    <td>{new Date(order.createdAt).toLocaleDateString('ru-RU')}</td>
                    <td>
                      <select value={order.status} onChange={(e) => handleStatusChange(order._id, e.target.value)} style={{ padding: '6px', borderRadius: '5px', border: '1px solid #ccc', background: order.status === 'Delivered' ? '#d4edda' : '#fff' }}>
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
      )}
    </div>
  );
};

export default AdminPanel;