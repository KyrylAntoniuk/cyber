import React from "react";
// import "../../SCSS/components/paymentSelection.scss";

// Убедитесь, что пути к картинкам правильные
// import CreditCard from "../../assets/CreditCard.png"; 
// import PayPal from "../../assets/PayPal.png";
// import Cash from "../../assets/Cash.png"; // Если есть оплата наличными

const PaymentSelection = () => {
  const [activeTab, setActiveTab] = React.useState(0);

  const paymentMethods = [
    {
      name: "Credit Card",
      image: CreditCard,
      number: "**** **** **** 1234", // Просто заглушка для красоты
    },
    {
      name: "PayPal",
      image: PayPal,
      number: "user@email.com",
    },
    // { name: "Cash on Delivery", image: Cash, number: "" }
  ];

  return (
    <div className="payment-selection">
      <h3>Payment Method</h3>
      <div className="payment-tabs">
        {/* Вкладки (Credit Card / PayPal) */}
        <div className="tabs-header">
           <button 
             className={activeTab === 0 ? "active" : ""} 
             onClick={() => setActiveTab(0)}
           >
             Credit Card
           </button>
           <button 
             className={activeTab === 1 ? "active" : ""} 
             onClick={() => setActiveTab(1)}
           >
             PayPal
           </button>
        </div>

        {/* Контент выбранной вкладки */}
        <div className="tab-content">
           <div className="card-preview">
              <img src={paymentMethods[activeTab].image} alt="card" />
              <div className="card-details">
                 <p className="method-name">{paymentMethods[activeTab].name}</p>
                 <p className="method-number">{paymentMethods[activeTab].number}</p>
              </div>
              <div className="radio-circle active-circle"></div>
           </div>
           
           {/* Форма для карты (показываем только если выбрана карта) */}
           {activeTab === 0 && (
             <div className="card-inputs" style={{marginTop: '15px', display: 'grid', gap: '10px'}}>
                <input type="text" placeholder="Card Number" className="input-field"/>
                <div style={{display: 'flex', gap: '10px'}}>
                   <input type="text" placeholder="MM/YY" className="input-field"/>
                   <input type="text" placeholder="CVV" className="input-field"/>
                </div>
                <input type="text" placeholder="Card Holder Name" className="input-field"/>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSelection;