import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAddAddress } from "../../redux/slices/userSlice"; // Проверьте этот путь!
import AdressSelectorItem from "./AdressSelectorItem";
import "../../SCSS/components/adressSelector.scss";

// Импортируйте ваши иконки
import closeSvg from "../../assets/Close.svg";
import DoneSvg from "../../assets/Done.svg";
import PlusSvg from "../../assets/Plus.svg";

export default function AdressSelector({ onSelect }) {
  const dispatch = useDispatch();
  const [addAdressButton, setAddAdressButton] = React.useState(false);
  
  const { data } = useSelector((state) => state.user);
  const list = data?.addressList || data?.adressList || [];

  // Стейт формы
  const [updateAderss, setUpdateAdress] = React.useState({
    adressName: "",
    tag: "home",
    adress: "",
    postCode: "",
    phoneNumber: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Логируем ввод, чтобы проверить, работает ли input
    // console.log(`Input change: ${name} = ${value}`); 
    setUpdateAdress((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleUpdate = async () => {
      console.log("1. Кнопка нажата!"); // <--- ЕСЛИ ЭТОГО НЕТ В КОНСОЛИ, КНОПКА НЕ РАБОТАЕТ
      console.log("2. Данные формы:", updateAderss);

      // Проверка полей
      if (!updateAderss.adressName || !updateAderss.adress) {
          console.warn("Поля пустые!");
          alert("Заполните название и адрес!");
          return;
      }

      try {
          console.log("3. Отправляем Dispatch...");
          const result = await dispatch(fetchAddAddress(updateAderss));
          console.log("4. Результат запроса:", result);
          
          if (result.meta.requestStatus === 'fulfilled') {
             alert("Адрес добавлен!");
             setAddAdressButton(false);
             // Очистка
             setUpdateAdress({ adressName: "", tag: "home", adress: "", postCode: "", phoneNumber: "" });
          } else {
             alert("Ошибка: " + (result.payload?.message || "Неизвестная ошибка"));
          }

      } catch (error) {
          console.error("5. CATCH Error:", error);
          alert("Критическая ошибка JS");
      }
  };

  return (
    <div>
      <h2>Select Address</h2>
      
      {/* Список адресов */}
      <div className="list-container">
        {list.length > 0 ? (
          list.map((item, index) => (
            <div key={item._id || index} onClick={() => onSelect && onSelect(item)}>
               <AdressSelectorItem
                  adressName={item.adressName || item.addressName}
                  adress={item.adress || item.address}
                  // Передайте остальные пропсы как раньше
               />
            </div>
          ))
        ) : (
          <p>Нет адресов</p>
        )}
      </div>

      {/* Кнопка открытия формы */}
      <div className="add-adress-wrapper">
        <button onClick={() => setAddAdressButton(!addAdressButton)}>
          <img src={PlusSvg} alt="+" />
        </button>
        <p>Add New Address</p>
      </div>

      {/* ФОРМА */}
      {addAdressButton && (
        <div className="adress-change-item" style={{border: "2px solid red", padding: "10px"}}> 
          {/* Я добавил красную рамку, чтобы вы точно видели форму */}
          
          <div className="items-change">
            <input
                className="change-section-input"
                type="text"
                name="adressName" // Важно!
                value={updateAderss.adressName}
                onChange={handleInputChange}
                placeholder="Name (Dom, Rabota)"
            />
            
            <input
                className="change-section-input"
                type="text"
                name="adress" // Важно!
                value={updateAderss.adress}
                onChange={handleInputChange}
                placeholder="Address City Street"
            />
            
            {/* Остальные инпуты... */}
          </div>

          <div className="button-wrapper">
            {/* КНОПКА СОХРАНЕНИЯ */}
            <button onClick={handleUpdate} style={{backgroundColor: "lightgreen", padding: "10px"}}>
              СОХРАНИТЬ (IMG HERE)
            </button>
            
            <button onClick={() => setAddAdressButton(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}