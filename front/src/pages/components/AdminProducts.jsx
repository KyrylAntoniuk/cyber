import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../redux/slices/productSlice';
import axios from '../../axios';

const PRODUCT_TYPES = {
  phones: { label: 'Телефоны' },
  laptops: { label: 'Ноутбуки' },
  cameras: { label: 'Камеры' },
  other: { label: 'Другое' }
};

const AdminProducts = () => {
  const dispatch = useDispatch();
  const { items: products, status: productsStatus } = useSelector((state) => state.product);

  const [jsonFile, setJsonFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const [editingProductId, setEditingProductId] = useState(null);
  const [editJsonString, setEditJsonString] = useState('');

  // Состояния для поиска и сортировки
  const [searchValue, setSearchValue] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Эффект с дебаунсом: отправляем запрос через 400мс после того как пользователь перестал вводить текст
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchProducts({ limit: 100, search: searchValue, sortBy })); 
    }, 400); 
    
    return () => clearTimeout(timer);
  }, [dispatch, searchValue, sortBy]);

  // Функция для обновления текущего списка (с учетом текущего поиска) после удалений/редактирований
  const reloadProducts = () => {
    dispatch(fetchProducts({ limit: 100, search: searchValue, sortBy }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/json" && !file.name.endsWith('.json')) {
      return alert("Пожалуйста, выберите файл в формате .json");
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsedJson = JSON.parse(event.target.result);
        const dataArray = Array.isArray(parsedJson) ? parsedJson : [parsedJson];
        setJsonFile(dataArray);
      } catch (error) {
        alert("Ошибка чтения JSON файла. Проверьте валидность формата.");
        setJsonFile(null);
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleUploadJson = async () => {
    if (!jsonFile || jsonFile.length === 0) return alert("Сначала выберите корректный JSON файл!");

    try {
      setIsUploading(true);
      const response = await axios.post('/products/bulk', jsonFile);
      alert(response.data.message || `Успешно добавлено ${jsonFile.length} товаров!`);
      
      setJsonFile(null);
      const fileInput = document.getElementById('json-upload-input');
      if (fileInput) fileInput.value = '';
      setIsFormOpen(false);
      
      reloadProducts();
    } catch (error) {
      console.error('Ошибка при загрузке JSON:', error);
      alert(error.response?.data?.message || 'Не удалось добавить товары.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditClick = (product) => {
    const { _id, __v, createdAt, updatedAt, ...editableProduct } = product;
    setEditJsonString(JSON.stringify(editableProduct, null, 2));
    setEditingProductId(_id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateProduct = async () => {
    try {
      const parsedData = JSON.parse(editJsonString);
      await axios.patch(`/products/${editingProductId}`, parsedData);
      alert('Товар успешно обновлен!');
      
      setEditingProductId(null);
      setEditJsonString('');
      reloadProducts();
    } catch (err) {
      if (err instanceof SyntaxError) {
        alert('Ошибка формата JSON! Проверьте синтаксис (запятые, скобки, кавычки).');
      } else {
        alert('Ошибка при обновлении товара на сервере');
        console.error(err);
      }
    }
  };

  const handleProductDelete = async (id) => {
    if (window.confirm('Точно удалить этот товар?')) {
      try {
        await axios.delete(`/products/${id}`);
        alert('Товар удален!');
        reloadProducts();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Фильтрация товаров на клиенте по выбранной категории
  const filteredProducts = products.filter((item) => {
    if (filterCategory && item.category !== filterCategory) return false;
    return true;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
        <h2>Список товаров</h2>
        {!editingProductId && (
          <button className="button button-black" onClick={() => setIsFormOpen(!isFormOpen)}>
              {isFormOpen ? 'Закрыть загрузчик' : '+ Загрузить товары (JSON)'}
          </button>
        )}
      </div>

      {/* ПАНЕЛЬ ПОИСКА И СОРТИРОВКИ */}
      {!editingProductId && (
        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
          <input 
            type="text" 
            placeholder="Поиск товара по названию..." 
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', flex: 1, outline: 'none' }}
          />
          
          {/* Фильтр по категории */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', outline: 'none', cursor: 'pointer' }}
          >
            <option value="">Все категории</option>
            {Object.entries(PRODUCT_TYPES).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', outline: 'none', cursor: 'pointer' }}
          >
            <option value="">По умолчанию (Сначала новые)</option>
            <option value="price_asc">Сначала дешевые</option>
            <option value="price_desc">Сначала дорогие</option>
            <option value="title">По алфавиту (A-Z)</option>
          </select>
        </div>
      )}

      {isFormOpen && !editingProductId && (
        <div style={{ background: '#f9f9f9', padding: '25px', borderRadius: '10px', marginBottom: '30px', border: '1px dashed #1890ff' }}>
          <h3 style={{ marginBottom: '15px' }}>Массовая загрузка товаров</h3>
          <p style={{ fontSize: '14px', color: 'gray', marginBottom: '20px' }}>Выберите файл с массивом товаров в формате JSON, чтобы добавить их в базу данных.</p>
          
          <input id="json-upload-input" type="file" accept=".json" onChange={handleFileChange} style={{ marginBottom: '15px', display: 'block' }} />

          {jsonFile && (
            <div style={{ padding: '10px', background: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: '5px', marginBottom: '15px' }}>
              <p style={{ margin: 0, color: '#0050b3' }}><b>Файл готов к загрузке.</b> Найдено товаров: <b>{jsonFile.length}</b> шт.</p>
            </div>
          )}

          <button 
            onClick={handleUploadJson} disabled={!jsonFile || isUploading} className="button button-black"
            style={{ background: (!jsonFile || isUploading) ? '#ccc' : '#1890ff', borderColor: (!jsonFile || isUploading) ? '#ccc' : '#1890ff', cursor: (!jsonFile || isUploading) ? 'not-allowed' : 'pointer' }}
          >
            {isUploading ? 'Идет загрузка...' : 'Подтвердить и загрузить'}
          </button>
        </div>
      )}

      {editingProductId && (
        <div style={{ background: '#f9f9f9', padding: '25px', borderRadius: '10px', marginBottom: '30px', border: '1px solid #1890ff' }}>
          <h3 style={{ color: '#1890ff', marginBottom: '10px' }}>Редактирование JSON товара</h3>
          <p style={{ fontSize: '14px', color: 'gray', marginBottom: '15px' }}>Внесите изменения в объект ниже. Будьте внимательны с синтаксисом JSON.</p>
          
          <textarea 
            value={editJsonString}
            onChange={(e) => setEditJsonString(e.target.value)}
            spellCheck="false"
            style={{ 
              width: '100%', minHeight: '400px', padding: '15px', boxSizing: 'border-box', 
              fontFamily: 'monospace', fontSize: '14px', background: '#1e1e1e', color: '#d4d4d4', 
              border: '1px solid #333', borderRadius: '5px', resize: 'vertical', lineHeight: '1.5'
            }} 
          />
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button onClick={handleUpdateProduct} className="button button-black" style={{ background: '#1890ff', borderColor: '#1890ff' }}>Сохранить изменения</button>
            <button onClick={() => setEditingProductId(null)} style={{ padding: '12px 20px', cursor: 'pointer', borderRadius: '5px', border: '1px solid #ccc', background: '#fff' }}>Отмена</button>
          </div>
        </div>
      )}

      {productsStatus === 'loading' ? (
        <p>Загрузка товаров...</p>
      ) : products.length === 0 ? (
        <p style={{ color: 'gray' }}>Товары не найдены.</p>
      ) : filteredProducts.length === 0 ? (
        <p style={{ color: 'gray' }}>В этой категории товаров нет.</p>
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
            {filteredProducts.map((item) => (
              <tr key={item._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}><img src={item.img || item.imageUrl} alt="img" width="50" height="50" style={{ objectFit: 'contain' }}/></td>
                <td style={{ maxWidth: '200px' }}>{item.productName || item.title}</td>
                <td style={{ color: 'gray', fontSize: '13px' }}>{PRODUCT_TYPES[item.category]?.label || item.category || 'Другое'}</td>
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
  );
};

export default AdminProducts;