import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axios"; // Наш axios

export const fetchProducts = createAsyncThunk(
  "product/fetchProducts",
  async (params) => {
    // params это объект { category: '...', search: '...', sortBy: '...' }
    const { data } = await axios.get("/products", { params }); 
    // Если бэкенд возвращает объект { products: [], total: ... }, берем data.products
    return data.products || data; 
  }
);

// Для получения одного товара
export const fetchOneProduct = createAsyncThunk(
  "product/fetchOneProduct",
  async (id) => {
    const { data } = await axios.get(`/products/${id}`);
    return data;
  }
);

const initialState = {
  items: [],
  status: "idle",
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setItems(state, action) {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchProducts.pending, (state) => {
      state.status = "loading";
      state.items = [];
    });
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      state.items = action.payload;
      state.status = "success";
    });
    builder.addCase(fetchProducts.rejected, (state) => {
      state.status = "error";
      state.items = [];
    });
  },
});

export const { setItems } = productSlice.actions;
export default productSlice.reducer;