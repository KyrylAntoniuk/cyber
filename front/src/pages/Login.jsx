import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Link } from "react-router-dom";
import { fetchAuth, selectIsAuth } from "../redux/slices/userSlice";
import '../SCSS/components/_buttons.scss';

const Login = () => {
  const isAuth = useSelector(selectIsAuth);
  const dispatch = useDispatch();
  
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    const data = await dispatch(fetchAuth({ email, password }));
    
    if (!data.payload) {
      return alert("Не удалось авторизоваться!");
    }
    
    if ('token' in data.payload) {
      window.localStorage.setItem('token', data.payload.token);
    }
  };

  if (isAuth) {
    return <Navigate to="/" />;
  }

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '50px' }}>
      <h2>Вход в аккаунт</h2>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
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
        <button type="submit" className="button-black">Войти</button>
      </form>
      <div style={{marginTop: '20px'}}>
        Нет аккаунта? <Link to="/register" style={{color: 'blue'}}>Зарегистрироваться</Link>
      </div>
    </div>
  );
};

export default Login;