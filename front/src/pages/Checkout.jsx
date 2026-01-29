import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "../axios";

// ВАЖНО: Импортируем именно clearCart (как в слайсе)
import { clearCart } from "../redux/slices/cartSlice";

import AdressSelector from "./components/AdressSelector";
import ShipmentSelector from "./components/ShipmentSelector";
import PaymentSelection from "./components/PaymentSelection";
import CartItem from "./components/CartItem";

// Картинки (проверь, что пути верные)
import Step1 from "../assets/Step 1.svg";
import Step2 from "../assets/Step 2.svg";
import Step3 from "../assets/Step 3.svg";
import "../SCSS/pages/CheckoutPage.scss";

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Достаем items (как мы назвали их в слайсе)
  const { items, totalPrice } = useSelector((state) => state.cart);
  
  // Страховка: если items вдруг undefined, берем пустой массив
  const cartItems = items || [];
  const total = totalPrice || 0;

  const [selectedAddress, setSelectedAddress] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const onClickPay = async () => {
    if (!selectedAddress) {
      return alert("Пожалуйста, выберите адрес доставки!");
    }

    try {
      setIsLoading(true);

      const orderData = {
        items: cartItems.map((item) => ({
          product: item.id || item._id,
          quantity: item.count,
          price: item.price,
          options: item.options,
        })),
        totalAmount: total,
        address: selectedAddress,
      };

      await axios.post("/orders", orderData);

      // Очищаем корзину правильным экшеном
      dispatch(clearCart());
      
      alert("Заказ успешно оформлен!");
      navigate("/");
    } catch (error) {
      console.error(error);
      alert("Ошибка при создании заказа");
    } finally {
      setIsLoading(false);
    }
  };

  // Если корзина пуста
  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ textAlign: "center", marginTop: "50px" }}>
        <h2>Корзина пуста 😕</h2>
        <Link to="/" className="button-black" style={{ marginTop: "20px", display: "inline-block" }}>
          Вернуться к покупкам
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="checkout-wrapper">
        <div className="checkout-left-side">
          
          <div className="step-image"><img src={Step1} alt="step 1" /></div>
          <div className="adress-selection-wrapper">
            <AdressSelector onSelect={(addr) => setSelectedAddress(addr)} />
            {selectedAddress && (
              <div style={{ marginTop: "10px", padding: "10px", border: "1px solid green", borderRadius: "8px" }}>
                <b>Выбран:</b> {selectedAddress.adressName}
              </div>
            )}
          </div>

          <div className="step-image"><img src={Step2} alt="step 2" /></div>
          <div className="shipment-wrapper">
            <ShipmentSelector />
          </div>

          <div className="step-image"><img src={Step3} alt="step 3" /></div>
          <div className="payment-wrapper">
            <PaymentSelection />
          </div>
        </div>

        <div className="checkout-right-side">
          <h2>Summary</h2>
          <div className="cart-items-preview" style={{ maxHeight: "300px", overflowY: "auto" }}>
            {cartItems.map((item) => (
              <CartItem key={item.id} {...item} />
            ))}
          </div>

          <div className="summary-total">
            <div className="summary-row">
              <span>Address:</span>
              <span>{selectedAddress ? selectedAddress.adress : "Not selected"}</span>
            </div>
            <div className="summary-row">
              <span>Total:</span>
              <b>{total.toLocaleString()} ₴</b>
            </div>

            <button
              onClick={onClickPay}
              disabled={isLoading}
              className="button-black"
              style={{ width: "100%", marginTop: "20px", opacity: isLoading ? 0.5 : 1 }}
            >
              {isLoading ? "Processing..." : "Pay"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}