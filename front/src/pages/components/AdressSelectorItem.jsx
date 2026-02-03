import React from "react";
import "../../SCSS/components/adressSelectorItem.scss"; 
// Иконки (проверьте пути)
import PencilSvg from "../../assets/To edit.svg";
import CloseSvg from "../../assets/Close.svg"; 

const AdressSelectorItem = ({ 
  address, 
  isSelected, 
  onSelect, 
  onRemove // Функция удаления передается от родителя
}) => {
  return (
    <div 
      className={`address-selector-item ${isSelected ? "selected" : ""}`}
      onClick={() => onSelect(address)}
    >
      <div className="address-info">
        <div className="address-header">
          <b>{address.addressName || "Address"}</b>
          {address.tag && <span className="tag">{address.tag}</span>}
        </div>
        <p>{address.address}</p>
        <span className="phone">{address.phoneNumber}</span>
      </div>

      <div className="address-actions">
        {/* Кнопка удаления */}
        {onRemove && (
          <button 
            className="action-btn remove" 
            onClick={(e) => {
              e.stopPropagation(); // Чтобы не сработал выбор адреса при удалении
              onRemove();
            }}
          >
            <img src={CloseSvg} alt="Remove" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AdressSelectorItem;