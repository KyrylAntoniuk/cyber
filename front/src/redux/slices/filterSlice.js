import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axios";

export const fetchFilters = createAsyncThunk("filter/fetchFilters", async () => {
  const { data } = await axios.get("/products/filters");
  return data;
});

const initialState = {
  availableFilters: {},
  selectedFilters: {},
  searchValue: "",
  status: "loading",
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
        state.selectedFilters[filterName].push(value);
      } else {
        state.selectedFilters[filterName] = state.selectedFilters[filterName].filter(
          (v) => v !== value
        );
      }

      if (state.selectedFilters[filterName].length === 0) {
        delete state.selectedFilters[filterName];
      }
    },
    clearFilters(state) {
      state.selectedFilters = {};
    },
    setSearchValue(state, action) {
      state.searchValue = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchFilters.fulfilled, (state, action) => {
      state.availableFilters = action.payload;
      state.status = "success";
    });
  },
});

export const { setFilterValue, clearFilters, setSearchValue } = filterSlice.actions;
export default filterSlice.reducer;