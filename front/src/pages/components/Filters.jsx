import React, { useEffect } from "react"; // Добавили useEffect
import { useDispatch, useSelector } from "react-redux";
// Импортируем новый thunk fetchFilters
import { setFilterValue, clearFilters, fetchFilters } from "../../redux/slices/filterSlice";
import "../../SCSS/components/fillters.scss";

import expondMoreSvg from "../../assets/expand_more.svg";
import expendLessSvg from "../../assets/expand_less.svg";
import FilterSvg from "../../assets/filters.svg";

// Функция форматирования camelCase в красивый текст
const formatLabel = (str) => {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase());
};

function Filters() {
  const dispatch = useDispatch();
  
  const { availableFilters, selectedFilters, status } = useSelector((state) => state.filter);
  
  const [openFilters, setOpenFilters] = React.useState({});
  const [visible, setVisible] = React.useState(false);

  // ЗАПРОС ФИЛЬТРОВ ПРИ МОНТИРОВАНИИ
  useEffect(() => {
    // Запрашиваем фильтры, только если они пустые (оптимизация)
    // или можно запрашивать всегда, чтобы были свежие
    dispatch(fetchFilters());
  }, [dispatch]);

  const toggleFilter = (key) => {
    setOpenFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCheckboxChange = (filterName, value, e) => {
    e.stopPropagation();
    dispatch(
      setFilterValue({
        filterName,
        value,
        checked: e.target.checked,
      })
    );
  };

  if (status === 'loading' && Object.keys(availableFilters).every(k => availableFilters[k].length === 0)) {
     return <div className="filters-container">Загрузка фильтров...</div>;
  }

  return (
    <div className="filters-container">
      <div className="filters-top-bar">
          <h1>Filters</h1>
          {Object.keys(selectedFilters).length > 0 && (
             <button className="reset-btn" onClick={() => dispatch(clearFilters())}>
                 Reset all
             </button>
          )}
      </div>

      <button className="burger" onClick={() => setVisible(!visible)}>
        <span>Filters</span>
        <img src={FilterSvg} alt="filter icon" />
      </button>

      <div className={`filters-list ${visible ? "visible" : ""}`}>
        {Object.entries(availableFilters).map(([filterKey, options]) => {
          // Если опций для фильтра нет (пустой массив с бэка), не показываем его
          if (!options || options.length === 0) return null;

          const isOpen = openFilters[filterKey] ?? false;

          return (
            <div key={filterKey} className="filter-group">
              <div 
                className="filter-header" 
                onClick={() => toggleFilter(filterKey)}
              >
                <span>{formatLabel(filterKey)}</span>
                <img 
                    src={isOpen ? expendLessSvg : expondMoreSvg} 
                    alt="arrow" 
                />
              </div>

              {isOpen && (
                <div className="filter-options">
                  {options.map((value, i) => {
                      const isChecked = selectedFilters[filterKey]?.includes(value);

                      return (
                        <label key={i} className="checkbox-label" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            value={value}
                            checked={isChecked || false}
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