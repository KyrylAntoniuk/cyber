import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "../axios";

import { clearCart } from "../redux/slices/cartSlice";
import { cartTotalPrice } from "../utils/cartTotalPrice"; // Убедитесь, что этот путь верен

// Компоненты (проверьте пути импорта)
import AdressSelector from "./components/AdressSelector";
import ShipmentSelector from "./components/ShipmentSelector";
import PaymentSelection from "./components/PaymentSelection";

import "../SCSS/pages/CheckoutPage.scss"; // Проверьте путь к стилям

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Достаем данные из Redux
  // isAuth нужен, если вы хотите предзаполнить email, но для заказа это необязательно
  const { items, totalPrice } = useSelector((state) => state.cart);
  const { data: userData } = useSelector((state) => state.auth || {}); // fallback если auth нет

  const [isLoading, setIsLoading] = React.useState(false);

  // Локальный стейт для формы
  const [formData, setFormData] = React.useState({
    addressName: "",
    postCode: "",
    phoneNumber: "",
    address: "", // Само поле адреса
    tag: "Home", // "Home" или "Office"
  });

  // Если корзина пуста, уходим назад (защита от пустого заказа)
  React.useEffect(() => {
    if (items.length === 0) {
      navigate("/");
    }
  }, [items, navigate]);

  // Обработчик инпутов
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Отправка заказа
  const onSubmit = async () => {
    try {
      setIsLoading(true);

      // 1. Формируем массив товаров для бэкенда (новая структура!)
      const orderItems = items.map((item) => ({
        product: item.id, // ID товара
        quantity: item.count,
        price: item.price,
        // Важно: передаем опции внутрь товара, как мы сделали в бэкенде
        selectedOptions: {
            color: item.color || "#000000",      // пример получения из корзины
            builtInMemory: item.capacity || "128GB" // пример
        }
      }));

      // 2. Собираем весь объект заказа
      const orderData = {
        items: orderItems,
        totalAmount: totalPrice, // Общая сумма в корне
        address: {
          addressName: formData.addressName,
          postCode: formData.postCode,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          tag: formData.tag,
        },
      };

      // 3. Отправляем на сервер
      const { data } = await axios.post("/orders", orderData);

      // 4. Очищаем корзину и уходим
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
            {/* Можно вернуть AdressSelector, если он работает корректно */}
            {/* <AdressSelector /> */}
          </section>

          {/* Другие секции можно добавить здесь (Shipment, Payment) */}
          <section className="checkout-section">
             <h2>Shipment Method</h2>
             <ShipmentSelector />
          </section>
        </div>

        {/* ПРАВАЯ КОЛОНКА - ИТОГ */}
        <div className="checkout-page__right">
          <div className="summary-card">
            <h3>Summary</h3>
            
            {/* СПИСОК ТОВАРОВ - ВОТ ЗДЕСЬ БЫЛА ОШИБКА */}
            <div className="summary-items">
              {items.map((item) => (
                <div key={item.id + (item.color || "")} className="summary-item">
                  <div className="summary-item__img">
                    {/* Проверка на наличие картинки */}
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