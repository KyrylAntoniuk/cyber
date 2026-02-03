import React from "react";
import { useDispatch } from "react-redux";
import { Route, Routes } from "react-router-dom";
import { fetchAuthMe } from "./redux/slices/userSlice";

// Импортируем компоненты и страницы (перенесли из main.jsx)
import Header from "./pages/components/Header.jsx";
import ProductPage from "./pages/ProductsPage.jsx";
import ProductDetailedpage from "./pages/ProductDetailedPage.jsx";
import CartPage from "./pages/cartPage.jsx";
import Checkout from "./pages/Checkout.jsx";
import WishlistPage from "./pages/WishlistPage.jsx";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import UserProfile from "./pages/UserProfile";

function App() {
  const dispatch = useDispatch();

  // Проверяем авторизацию при первом запуске
  React.useEffect(() => {
    dispatch(fetchAuthMe());
  }, [dispatch]);

  return (
    <>
      <Header />
      <div className="wrapper">
        <Routes>
          <Route path="/products" element={<ProductPage />} />
          <Route path="/product/:id" element={<ProductDetailedpage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/cart/checkout" element={<Checkout />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          {/* Можно добавить маршрут по умолчанию, например на товары */}
          <Route path="*" element={<ProductPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<UserProfile />} />
<Route path="/register" element={<Registration />} />
        </Routes>
      </div>
    </>
  );
}

export default App;