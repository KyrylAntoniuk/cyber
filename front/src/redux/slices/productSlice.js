import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axios";

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (params) => {
    const { page = 1, search = "", limit = 8 } = params;
    // Pass parameters to the backend
    const { data } = await axios.get(`/products?page=${page}&limit=${limit}&search=${search}`);
    return data; // Returns { items: [], totalPages: number, currentPage: number }
  }
);

const initialState = {
  items: [],
  totalPages: 1,
  currentPage: 1,
  status: "loading", // loading | success | error
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setItems(state, action) {
      state.items = action.payload;
    },
    setCurrentPage(state, action) {
      state.currentPage = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
        state.items = [];
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "success";
        // FIX: Extract the array from the 'items' property
        state.items = action.payload.items || []; 
        state.totalPages = action.payload.totalPages || 1;
        state.currentPage = action.payload.currentPage || 1;
      })
      .addCase(fetchProducts.rejected, (state) => {
        state.status = "error";
        state.items = [];
      });
  },
});

export const { setItems, setCurrentPage } = productSlice.actions;
export default productSlice.reducer;