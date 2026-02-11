import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axios";

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (params) => {
    // params = { page: 1, limit: 8, search: "...", brand: "Apple,Samsung" }
    const { data } = await axios.get("/products", { params });
    return data;
  }
);

const initialState = {
  items: [],
  totalPages: 1,
  currentPage: 1,
  status: "loading",
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setItems(state, action) {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
        state.items = [];
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "success";
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

export const { setItems } = productSlice.actions;
export default productSlice.reducer;