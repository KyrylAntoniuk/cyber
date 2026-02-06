import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axios"; // Ваш настроенный axios

// Асинхронный запрос за фильтрами
export const fetchFilters = createAsyncThunk(
  "filter/fetchFilters",
  async () => {
    const { data } = await axios.get("/products/filters");
    return data;
  }
);

const initialState = {
  // Изначально пусто, данные придут с сервера
  availableFilters: {
    brand: [],
    batteryCapacity: [],
    screenType: [],
    builtInMemory: [],
    // Остальные можно добавить в контроллере позже
  },
  selectedFilters: {},
  searchValue: "", // Исправили опечатку (было serchValue)
  status: "loading", // loading | success | error
};

const filterSlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    setFilterValue(state, action) {
      const { filterName, value, checked } = action.payload;
      
      if (!state.selectedFilters[filterName]) {
        state.selectedFilters[filterName] = [];
      }
      
      if (checked) {
        if (!state.selectedFilters[filterName].includes(value)) {
          state.selectedFilters[filterName].push(value);
        }
      } else {
        state.selectedFilters[filterName] = state.selectedFilters[filterName].filter(
          (v) => v !== value
        );
        if (state.selectedFilters[filterName].length === 0) {
          delete state.selectedFilters[filterName];
        }
      }
    },
    clearFilters(state) {
      state.selectedFilters = {};
    },
    setSearchValue(state, action) {
      state.searchValue = action.payload;
    },
  },
  // Обработка асинхронного запроса
  extraReducers: (builder) => {
    builder
      .addCase(fetchFilters.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchFilters.fulfilled, (state, action) => {
        state.status = "success";
        state.availableFilters = action.payload; // Записываем данные с сервера
      })
      .addCase(fetchFilters.rejected, (state) => {
        state.status = "error";
        // В случае ошибки можно оставить пустые массивы
        console.error("Не удалось загрузить фильтры");
      });
  },
});

export const {
  setFilterValue,
  clearFilters,
  setSearchValue,
} = filterSlice.actions;

export default filterSlice.reducer;