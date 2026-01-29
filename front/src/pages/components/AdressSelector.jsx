import React from "react";
import { useDispatch, useSelector } from "react-redux";
// ВАЖНО: Импортируем действие отправки
import { fetchAddAddress } from "../../redux/slices/userSlice"; 
import AdressSelectorItem from "./AdressSelectorItem";
import "../../SCSS/components/adressSelector.scss";

// Картинки
import closeSvg from "../../assets/Close.svg";
import DoneSvg from "../../assets/Done.svg";
import PlusSvg from "../../assets/Plus.svg";

export default function AdressSelector({ onSelect }) {
  const dispatch = useDispatch();
  const [addAdressButton, setAddAdressButton] = React.useState(false);
  
  const { data } = useSelector((state) => state.user);
  // Безопасно получаем список адресов
  const list = data?.addressList || data?.adressList || [];

  const [updateAderss, setUpdateAdress] = React.useState({
    adressName: "",
    tag: "home",
    adress: "",
    postCode: "",
    phoneNumber: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateAdress((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // --- ВОТ ЭТА ФУНКЦИЯ БЫЛА У ВАС СТАРОЙ ---
  const handleUpdate = async () => {
      // 1. Проверка на пустоту
      if (!updateAderss.adressName || !updateAderss.adress) {
          alert("Пожалуйста, заполните название и адрес!");
          return;
      }

      try {
          console.log("Отправка запроса...");
          // 2. ОТПРАВЛЯЕМ ДАННЫЕ НА СЕРВЕР
          await dispatch(fetchAddAddress(updateAderss));
          
          alert("Адрес успешно добавлен!");
          
          // 3. Закрываем окно и чистим поля
          setAddAdressButton(false);
          setUpdateAdress({
            adressName: "",
            tag: "home",
            adress: "",
            postCode: "",
            phoneNumber: ""
          });
      } catch (error) {
          console.error(error);
          alert("Ошибка при сохранении адреса");
      }
  };
  // -----------------------------------------

  return (
    <div>
      <h2>Select Address</h2>
      <div className="list-container">
        {list.length > 0 ? (
          list.map((item) => (
            <div key={item._id || item.id} onClick={() => onSelect && onSelect(item)}>
               <AdressSelectorItem
                  id={item._id || item.id}
                  adressName={item.adressName || item.addressName}
                  tag={item.tag}
                  adress={item.adress || item.address}
                  postCode={item.postCode}
                  phoneNumber={item.phoneNumber}
               />
            </div>
          ))
        ) : (
          <p style={{marginBottom: '20px', color: '#666'}}>
             У вас пока нет сохраненных адресов.
          </p>
        )}
      </div>

      <div className="add-adress-wrapper">
        <button onClick={() => setAddAdressButton(!addAdressButton)}>
          <img src={PlusSvg} alt="+" />
        </button>
        <span className="dashed-line"></span>
        <p>Add New Address</p>
      </div>

      {addAdressButton ? (
        <div className="adress-change-item ">
          <div className="items-change">
            <div className="adress-name-change-wrapper">
              <input
                className="change-section-input"
                type="text"
                name="adressName"
                value={updateAderss.adressName}
                onChange={handleInputChange}
                placeholder="Name (e.g. Home)"
              />
              <select
                className="tag-selector"
                name="tag"
                value={updateAderss.tag}
                onChange={handleInputChange}
              >
                <option value="home">home</option>
                <option value="office">office</option>
                <option value="other">other</option>
              </select>
            </div>
            <div className="adress-deteil-change-wrapper">
              <input
                className="change-section-input"
                type="text"
                name="adress"
                value={updateAderss.adress}
                onChange={handleInputChange}
                placeholder="Address"
              />
              <input
                className="change-section-input"
                type="text"
                name="postCode"
                value={updateAderss.postCode}
                onChange={handleInputChange}
                placeholder="Post Code"
              />
            </div>
            <input
              className="change-section-input"
              type="text"
              name="phoneNumber"
              value={updateAderss.phoneNumber}
              onChange={handleInputChange}
              placeholder="Phone Number"
            />
          </div>
          <div className="button-wrapper">
            {/* Кнопка вызывает handleUpdate */}
            <button onClick={handleUpdate}>
              <img src={DoneSvg} alt="Save" />
            </button>
            <button onClick={() => setAddAdressButton(false)}>
              <img src={closeSvg} alt="Cancel" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}