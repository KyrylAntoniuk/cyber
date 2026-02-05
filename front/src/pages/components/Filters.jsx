import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFilterValue, clearFilters } from "../../redux/slices/filterSlice";
import "../../SCSS/components/fillters.scss";

// SVG (проверьте пути)
import expondMoreSvg from "../../assets/expand_more.svg";
import expendLessSvg from "../../assets/expand_less.svg";
import FilterSvg from "../../assets/filters.svg";

// Вспомогательная функция для красивого отображения названий фильтров
// Например: "batteryCapacity" -> "Battery Capacity"
const formatLabel = (str) => {
    return str
      .replace(/([A-Z])/g, ' $1') // Добавляем пробел перед заглавными
      .replace(/^./, (str) => str.toUpperCase()); // Делаем первую букву заглавной
};

function Filters() {
  const dispatch = useDispatch();
  
  // Достаем доступные и выбранные фильтры
  const { availableFilters, selectedFilters } = useSelector((state) => state.filter);
  
  const [openFilters, setOpenFilters] = React.useState({});
  const [visible, setVisible] = React.useState(false); // Для мобильной версии

  // Открытие/закрытие аккордеона фильтра
  const toggleFilter = (key) => {
    setOpenFilters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Обработчик чекбокса
  const handleCheckboxChange = (filterName, value, e) => {
      // Останавливаем всплытие, чтобы не сработал клик на родительский div (аккордеон)
      e.stopPropagation(); 
      dispatch(
        setFilterValue({
          filterName,
          value,
          checked: e.target.checked,
        })
      );
  };

  return (
    <div className="filters-container">
      <div className="filters-top-bar">
          <h1>Filters</h1>
          {/* Кнопка сброса (показываем, если есть выбранные фильтры) */}
          {Object.keys(selectedFilters).length > 0 && (
             <button className="reset-btn" onClick={() => dispatch(clearFilters())}>
                 Reset all
             </button>
          )}
      </div>

      {/* Кнопка для мобилок */}
      <button className="burger" onClick={() => setVisible(!visible)}>
        <span>Filters</span>
        <img src={FilterSvg} alt="filter icon" />
      </button>

      {/* Список фильтров */}
      <div className={`filters-list ${visible ? "visible" : ""}`}>
        {Object.entries(availableFilters).map(([filterKey, options]) => {
          // Проверяем, открыт ли этот фильтр
          // (можно сделать все открытыми по умолчанию, если добавить ! в условие)
          const isOpen = openFilters[filterKey] ?? false;

          return (
            <div key={filterKey} className="filter-group">
              {/* Заголовок фильтра (аккордеон) */}
              <div 
                className="filter-header" 
                onClick={() => toggleFilter(filterKey)}
              >
                <span>{formatLabel(filterKey)}</span>
                <img 
                    src={isOpen ? expendLessSvg : expondMoreSvg} 
                    alt="arrow" 
                    className="arrow-icon"
                />
              </div>

              {/* Опции (чекбоксы) */}
              {isOpen && (
                <div className="filter-options">
                  {options.map((value, i) => {
                      // Проверяем, выбран ли этот чекбокс в Redux
                      const isChecked = selectedFilters[filterKey]?.includes(value);

                      return (
                        <label key={i} className="checkbox-label" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            value={value}
                            checked={isChecked || false} // ВАЖНО: Привязываем checked к Redux
                            onChange={(e) => handleCheckboxChange(filterKey, value, e)}
                          />
                          <span className="checkmark"></span>
                          <span className="text">{value}</span>
                        </label>
                      );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Filters;