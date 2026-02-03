import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "../axios";

import { clearCart } from "../redux/slices/cartSlice";

// Компоненты
import AdressSelector from "./components/AdressSelector";
import ShipmentSelector from "./components/ShipmentSelector";
// import PaymentSelection from "./components/PaymentSelection"; // Можно раскомментировать, если готово

import "../SCSS/pages/CheckoutPage.scss";

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Достаем данные из Redux
  const { items, totalPrice } = useSelector((state) => state.cart);
  // Проверяем авторизацию, чтобы знать, показывать ли сохраненные адреса
  const { data: userData } = useSelector((state) => state.auth || {}); 

  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedSavedAddress, setSelectedSavedAddress] = React.useState(null);

  // Локальный стейт для формы
  const [formData, setFormData] = React.useState({
    addressName: "",
    postCode: "",
    phoneNumber: "",
    address: "",
    tag: "Home", 
  });

  // Защита: если корзина пуста, уходим назад
  React.useEffect(() => {
    if (items.length === 0) {
      navigate("/");
    }
  }, [items, navigate]);

  // Обработчик ручного ввода
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Если пользователь начал писать сам, снимаем выделение с сохраненного адреса
    setSelectedSavedAddress(null);
  };

  // Обработчик выбора адреса из списка (AdressSelector)
  const handleSelectAddress = (addr) => {
      setSelectedSavedAddress(addr);
      setFormData({
          addressName: addr.addressName || "",
          postCode: addr.postCode || "",
          phoneNumber: addr.phoneNumber || "",
          address: addr.address || "", 
          tag: addr.tag || "Home"
      });
  };

  // Отправка заказа
  const onSubmit = async () => {
    try {
      setIsLoading(true);

      // 1. Формируем товары
      const orderItems = items.map((item) => ({
        product: item.id,
        quantity: item.count,
        price: item.price,
        selectedOptions: {
            color: item.color || "#000000",
            builtInMemory: item.capacity || "128GB"
        }
      }));

      // 2. Собираем заказ
      const orderData = {
        items: orderItems,
        totalAmount: totalPrice,
        address: {
          addressName: formData.addressName,
          postCode: formData.postCode,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          tag: formData.tag,
        },
      };

      // 3. Отправляем
      const { data } = await axios.post("/orders", orderData);

      // 4. Успех
      dispatch(clearCart());
      alert(`Заказ №${data._id} успешно создан!`);
      navigate("/");

    } catch (err) {
      console.warn("Ошибка при создании заказа:", err);
      alert("Не удалось создать заказ. Проверьте консоль.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!items.length) {
    return <div className="container">Корзина пуста, перенаправление...</div>;
  }

  return (
    <div className="checkout-page container">
      <div className="checkout-page__header">
        <h1>Checkout</h1>
      </div>

      <div className="checkout-page__content">
        {/* ЛЕВАЯ КОЛОНКА - ФОРМА */}
        <div className="checkout-page__left">
          
          {/* Секция адреса */}
          <section className="checkout-section">
            <h2>Address</h2>
            
            {/* Если пользователь вошел, показываем выбор адресов */}
            {userData && (
                <div style={{ marginBottom: '20px' }}>
                    <AdressSelector 
                        selectedAddress={selectedSavedAddress} 
                        onSelect={handleSelectAddress} 
                    />
                </div>
            )}

            {/* Поля ввода (заполняются автоматически при выборе) */}
            <div className="form-group">
                <input 
                    name="addressName"
                    placeholder="Name (e.g. Home)" 
                    value={formData.addressName} 
                    onChange={handleChange} 
                />
                <input 
                    name="address"
                    placeholder="Full Address" 
                    value={formData.address} 
                    onChange={handleChange} 
                />
                <div className="row">
                    <input 
                        name="postCode"
                        placeholder="Post Code" 
                        value={formData.postCode} 
                        onChange={handleChange} 
                    />
                    <input 
                        name="phoneNumber"
                        placeholder="Phone Number" 
                        value={formData.phoneNumber} 
                        onChange={handleChange} 
                    />
                </div>
            </div>
          </section>

          {/* Доставка */}
          <section className="checkout-section">
             <h2>Shipment Method</h2>
             <ShipmentSelector />
          </section>
        </div>

        {/* ПРАВАЯ КОЛОНКА - ИТОГ */}
        <div className="checkout-page__right">
          <div className="summary-card">
            <h3>Summary</h3>
            
            <div className="summary-items">
              {items.map((item) => (
                <div key={item.id + (item.color || "")} className="summary-item">
                  <div className="summary-item__img">
                    <img src={item.imageUrl} alt={item.title} />
                  </div>
                  <div className="summary-item__info">
                    <p>{item.title}</p>
                    <span>x {item.count}</span>
                  </div>
                  <div className="summary-item__price">
                    {item.price * item.count} ₴
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-total">
              <span>Total:</span>
              <b>{totalPrice} ₴</b>
            </div>

            <button 
                disabled={isLoading} 
                onClick={onSubmit} 
                className="button pay-button"
            >
              {isLoading ? "Processing..." : "Pay now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;