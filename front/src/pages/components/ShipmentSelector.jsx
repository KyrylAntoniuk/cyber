import React from "react";
import "../../SCSS/components/shipmentSelector.scss";

// Убедитесь, что пути к картинкам правильные
// import Post from "../../assets/Post.png"; 
// import NovaPoshta from "../../assets/NovaPoshta.png";
// import Store from "../../assets/Store.png";

const shipmentMethods = [
  {
    name: "Regular Post",
    price: "Free",
    date: "20 Jan 2024",
    image: "Post",
  },
  {
    name: "Nova Poshta",
    price: "80 ₴",
    date: "18 Jan 2024",
    image: "NovaPoshta",
  },
  {
    name: "Pickup from Store",
    price: "Free",
    date: "Tomorrow",
    image: "null",
  },
];

const ShipmentSelector = ({ onSelect }) => {
  const [activeIndex, setActiveIndex] = React.useState(0);

  const onClickMethod = (index, method) => {
    setActiveIndex(index);
    // Если родитель передал функцию onSelect, вызываем её
    if (onSelect) {
      onSelect(method);
    }
  };

  return (
    <div className="shipment-selector">
      <h3>Shipment Method</h3>
      <div className="shipment-list">
        {shipmentMethods.map((obj, index) => (
          <div
            key={index}
            onClick={() => onClickMethod(index, obj)}
            className={`shipment-item ${activeIndex === index ? "active" : ""}`}
          >
            <div className="shipment-info">
              {/* Проверка, есть ли картинка, иначе не рендерим img */}
              {obj.image && <img src={obj.image} alt={obj.name} />}
              <div className="text">
                <p className="name">{obj.name}</p>
                <p className="date">{obj.date}</p>
              </div>
            </div>
            <div className="shipment-price">
              <b>{obj.price}</b>
              {/* Радио-кнопка для красоты */}
              <div className={`radio-circle ${activeIndex === index ? "active-circle" : ""}`}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShipmentSelector;