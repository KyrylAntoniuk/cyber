import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  availableFilters: {
    brand: ["Apple", "Samsung", "Xiaomi"],
    "battery capacity": ["3000 mAh", "4000 mAh", "5000 mAh"],
    "Screen type": ["AMOLED", "LCD", "IPS"],
    "Screen diagonal": ['6.1"', '6.5"', '6.8"'],
    "Protection class": ["IP67", "IP68"],
    "Built-in memory": ["64GB", "128GB", "256GB"],
  },
  selectedFilters: {},
  serchValue: "",
};

const filterSlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    setvailableFilters(state, action) {
      state.availableFilters = action.payload;
    },
    setFilterValue(state, action) {
      const { filterName, value, checked } = action.payload;
      if (!state.selectedFilters[filterName]) {
        state.selectedFilters[filterName] = [];
      }
      const values = state.selectedFilters[filterName];

      if (checked) {
        if (!values.includes(value)) {
          values.push(value);
        }
      } else {
        state.selectedFilters[filterName] = values.filter((v) => v !== value);
      }
    },
    clearFilters(state) {
      state.selectedFilters = {};
    },
    setSerchValue(state, action) {
      state.serchValue = action.payload;
    },
    // setFilters(state, action) {
    //   state.selectedFilters = action.payload.selectedFilters;
    //   state.serchValue = action.payload.serchValue;
    // },
  },
});

export const {
  setAvalibaleFilters,
  setFilterValue,
  clearFilters,
  setSerchValue,
  setFilters,
} = filterSlice.actions;
export default filterSlice.reducer;
