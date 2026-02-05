import React from "react";
import "../../SCSS/components/orderHistoryItem.scss"; // Создадим стили ниже

const OrderHistoryItem = ({ order }) => {
  // Форматирование даты (например: 24.01.2026, 15:30)
  const date = new Date(order.createdAt).toLocaleString("ru-RU", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Получаем статус для стилизации
  const statusColors = {
    pending: "#e6ae05", // Оранжевый
    shipped: "#007bff", // Синий
    delivered: "#28a745", // Зеленый
    cancelled: "#dc3545", // Красный
  };

  return (
    <div className="order-history-item">
      <div className="order-header">
        <div className="order-id">
          <span>Заказ от {date}</span>
          <span className="id">ID: {order._id.slice(-6)}</span>
        </div>
        <div 
            className="order-status" 
            style={{ backgroundColor: statusColors[order.status] || "#ccc" }}
        >
          {order.status}
        </div>
      </div>

      <div className="order-body">
        <div className="order-products">
          {order.items.map((item, idx) => (
            <div key={idx} className="mini-product">
                {/* Проверка на наличие product (вдруг товар удалили из базы) */}
               {item.product ? (
                 <img src={item.product.img} alt={item.product.productName} title={item.product.productName} />
               ) : (
                 <div className="deleted-product">Товар удален</div>
               )}
            </div>
          ))}
        </div>
        
        <div className="order-details">
            <div className="detail-row">
                <span>Адрес:</span>
                <b>{order.address?.address || "Не указан"}</b>
            </div>
            <div className="detail-row">
                <span>Тип:</span>
                <b>{order.address?.tag || "Доставка"}</b>
            </div>
        </div>
      </div>

      <div className="order-footer">
        <span>Итого:</span>
        <span className="total-price">{order.totalAmount} ₴</span>
      </div>
    </div>
  );
};

export default OrderHistoryItem;