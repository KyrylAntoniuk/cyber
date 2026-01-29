import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { fetchRegister, selectIsAuth } from '../redux/slices/userSlice';
import '../SCSS/components/_buttons.scss'; // Подключаем ваши стили кнопок

const Registration = () => {
  const dispatch = useDispatch();
  const isAuth = useSelector(selectIsAuth);

  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    const data = await dispatch(fetchRegister({ fullName, email, password }));

    if (!data.payload) {
      return alert('Не удалось зарегистрироваться!');
    }
    
    if ('token' in data.payload) {
      window.localStorage.setItem('token', data.payload.token);
    }
  };

  // Если зарегистрировались — сразу кидаем на главную
  if (isAuth) {
    return <Navigate to="/" />;
  }

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '50px' }}>
      <h2>Создание аккаунта</h2>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="text" 
          placeholder="Полное имя"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          style={{ padding: '10px', fontSize: '16px' }}
        />
        <input 
          type="email" 
          placeholder="E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '10px', fontSize: '16px' }}
        />
        <input 
          type="password" 
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '10px', fontSize: '16px' }}
        />
        <button type="submit" className="button-black">
          Зарегистрироваться
        </button>
      </form>
    </div>
  );
};

export default Registration;