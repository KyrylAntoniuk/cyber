import React from "react";
import { useDispatch, useSelector } from "react-redux";
// ВАЖНО: Импортируем универсальное действие обновления профиля
import { fetchUpdateUser } from "../../redux/slices/userSlice"; 
import AdressSelectorItem from "./AdressSelectorItem";
import "../../SCSS/components/adressSelector.scss";

// Картинки
import closeSvg from "../../assets/Close.svg";
import DoneSvg from "../../assets/Done.svg";
import PlusSvg from "../../assets/Plus.svg";

export default function AdressSelector({ onSelect, selectedAddress }) {
  const dispatch = useDispatch();
  const [addAdressButton, setAddAdressButton] = React.useState(false);
  
  const { data } = useSelector((state) => state.auth); // Обычно auth, но проверьте ваш slice name (user или auth)
  
  // Безопасно получаем список адресов
  const list = data?.addressList || [];

  const [updateAderss, setUpdateAdress] = React.useState({
    addressName: "", // Исправил опечатку: adressName -> addressName (чтобы совпадало с БД)
    tag: "home",
    address: "",     // Само поле адреса
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

  const handleUpdate = async () => {
      // 1. Проверка на пустоту
      if (!updateAderss.addressName || !updateAderss.address) {
          alert("Пожалуйста, заполните название и адрес!");
          return;
      }

      try {
          console.log("Добавление адреса...");
          
          // 2. Создаем новый массив адресов (старые + новый)
          const newAddressList = [...list, updateAderss];

          // 3. Отправляем ВЕСЬ обновленный массив на сервер через fetchUpdateUser
          const result = await dispatch(fetchUpdateUser({ addressList: newAddressList }));
          
          if (result.meta.requestStatus === 'fulfilled') {
             alert("Адрес успешно добавлен!");
             setAddAdressButton(false);
             setUpdateAdress({
                addressName: "",
                tag: "home",
                address: "",
                postCode: "",
                phoneNumber: ""
             });
          } else {
             alert("Не удалось добавить адрес.");
          }

      } catch (error) {
          console.error(error);
          alert("Ошибка при сохранении адреса");
      }
  };

  // Функция удаления (передаем её в AdressSelectorItem)
  const handleRemove = (indexToRemove) => {
     if(window.confirm('Удалить этот адрес?')) {
        const newAddressList = list.filter((_, i) => i !== indexToRemove);
        dispatch(fetchUpdateUser({ addressList: newAddressList }));
     }
  };

  return (
    <div className="address-selector-wrapper">
      <h2>Select Address</h2>
      <div className="list-container">
        {list.length > 0 ? (
          list.map((item, index) => (
            // Используем индекс как ключ, если нет _id (для новых адресов)
            <div key={item._id || index} style={{ marginBottom: '10px' }}>
               <AdressSelectorItem
                 address={item} // Передаем весь объект
                 isSelected={selectedAddress === item} // Проверка выбран ли он
                 onSelect={() => onSelect && onSelect(item)}
                 onRemove={() => handleRemove(index)}
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
        <div className="adress-change-item">
          <div className="items-change">
            <div className="adress-name-change-wrapper">
              <input
                className="change-section-input"
                type="text"
                name="addressName" // Исправлено имя поля
                value={updateAderss.addressName}
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
                name="address"
                value={updateAderss.address}
                onChange={handleInputChange}
                placeholder="Full Address"
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