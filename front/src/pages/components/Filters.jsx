import expondMoreSvg from "../../assets/expand_more.svg";
import expendLessSvg from "../../assets/expand_less.svg";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFilterValue } from "../../redux/slices/filterSlice";
import "../../SCSS/components/fillters.scss";
import FilterSvg from "../../assets/filters.svg";

function Filters() {
  const dispatch = useDispatch();
  const availableFilters = useSelector(
    (state) => state.filter.availableFilters
  );
  const [openFilters, setOpenFilters] = React.useState({});
  const [visible, setVisible] = React.useState(false);

  const toggleFilter = (title) => {
    setOpenFilters((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <div className="filters-container">
      <h1>Filters</h1>
      <button className="burger" onClick={() => setVisible(!visible)}>
        Filters
        <img src={FilterSvg} alt="" />
      </button>
      {Object.entries(availableFilters).map(([filterName, options]) => {
        const isOpen = openFilters[filterName] ?? false;

        return (
          <div
            key={filterName}
            className={visible ? "filter-items-visible" : "filter-items"}
            onClick={() => toggleFilter(filterName)}
          >
            <div className="filter-header">
              <span>{filterName}</span>
              <button>
                <img src={isOpen ? expendLessSvg : expondMoreSvg} alt="" />
              </button>
            </div>

            {isOpen && (
              <div className="filter-options">
                {options.map((value, i) => (
                  <label key={i}>
                    <input
                      onChange={(e) =>
                        dispatch(
                          setFilterValue({
                            filterName,
                            value,
                            checked: e.target.checked,
                          })
                        )
                      }
                      type="checkbox"
                      value={value}
                    />
                    {value}
                  </label>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Filters;
