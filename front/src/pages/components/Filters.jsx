import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFilterValue, fetchFilters, clearFilters } from "../../redux/slices/filterSlice";
import "../../SCSS/components/fillters.scss";
// Импорт иконок (проверьте пути)
import expondMoreSvg from "../../assets/expand_more.svg";
import expendLessSvg from "../../assets/expand_less.svg";
import FilterSvg from "../../assets/Filters.svg";

const formatLabel = (str) => 
  str.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());

function Filters() {
  const dispatch = useDispatch();
  const { availableFilters, selectedFilters } = useSelector((state) => state.filter);
  const [openFilters, setOpenFilters] = React.useState({});
  const [visible, setVisible] = React.useState(false);

  useEffect(() => {
    dispatch(fetchFilters());
  }, [dispatch]);

  const toggleFilter = (key) => {
    setOpenFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="filters-container">
      <div className="filters-top-bar">
          <h1>Filters</h1>
          {Object.keys(selectedFilters).length > 0 && (
             <button className="reset-btn" onClick={() => dispatch(clearFilters())}>Reset</button>
          )}
      </div>

      <button className="burger" onClick={() => setVisible(!visible)}>
        Filters <img src={FilterSvg} alt="" />
      </button>

      <div className={`filters-list ${visible ? "visible" : ""}`}>
        {Object.entries(availableFilters).map(([filterKey, options]) => {
          if (!options || options.length === 0) return null;
          const isOpen = openFilters[filterKey] ?? false;

          return (
            <div key={filterKey} className="filter-group">
              <div className="filter-header" onClick={() => toggleFilter(filterKey)}>
                <span>{formatLabel(filterKey)}</span>
                <img src={isOpen ? expendLessSvg : expondMoreSvg} alt="" />
              </div>

              {isOpen && (
                <div className="filter-options">
                  {options.map((val, i) => (
                    <label key={i} className="checkbox-label" onClick={(e)=>e.stopPropagation()}>
                      <input
                        type="checkbox"
                        value={val}
                        checked={selectedFilters[filterKey]?.includes(val) || false}
                        onChange={(e) => dispatch(setFilterValue({
                            filterName: filterKey, 
                            value: val, 
                            checked: e.target.checked 
                        }))}
                      />
                      <span className="text">{val}</span>
                    </label>
                  ))}
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