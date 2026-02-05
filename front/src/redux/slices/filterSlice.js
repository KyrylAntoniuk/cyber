import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // Лучше получать это с сервера, но пока оставим как есть
  availableFilters: {
    brand: ["Apple", "Samsung", "Xiaomi"],
    batteryCapacity: ["3000 mAh", "4000 mAh", "5000 mAh"], // camelCase для ключей удобнее
    screenType: ["AMOLED", "LCD", "IPS"],
    screenDiagonal: ['6.1"', '6.5"', '6.8"'],
    protectionClass: ["IP67", "IP68"],
    builtInMemory: ["64GB", "128GB", "256GB"],
  },
  selectedFilters: {}, // Структура: { brand: ["Apple"], screenType: ["IPS", "LCD"] }
  searchValue: "", // Исправили serchValue -> searchValue
};

const filterSlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    setAvailableFilters(state, action) {
      state.availableFilters = action.payload;
    },
    setFilterValue(state, action) {
      const { filterName, value, checked } = action.payload;
      
      // Инициализируем массив, если его нет
      if (!state.selectedFilters[filterName]) {
        state.selectedFilters[filterName] = [];
      }
      
      if (checked) {
        // Добавляем значение, если его нет
        if (!state.selectedFilters[filterName].includes(value)) {
          state.selectedFilters[filterName].push(value);
        }
      } else {
        // Удаляем значение
        state.selectedFilters[filterName] = state.selectedFilters[filterName].filter(
          (v) => v !== value
        );
        
        // Если массив пустой, удаляем ключ (чтобы не отправлять пустой фильтр на сервер)
        if (state.selectedFilters[filterName].length === 0) {
          delete state.selectedFilters[filterName];
        }
      }
    },
    clearFilters(state) {
      state.selectedFilters = {};
      state.searchValue = "";
    },
    setSearchValue(state, action) {
      state.searchValue = action.payload;
    },
  },
});

export const {
  setAvailableFilters,
  setFilterValue,
  clearFilters,
  setSearchValue,
} = filterSlice.actions;

export default filterSlice.reducer;