import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axios";

// 1. Загрузка списка товаров (для каталога)
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (params) => {
    // params = { page, limit, search, brand, etc... }
    const { data } = await axios.get("/products", { params });
    return data;
  }
);

// 2. Загрузка одного товара (для детальной страницы)
export const fetchOneProduct = createAsyncThunk(
  "products/fetchOneProduct",
  async (id) => {
    const { data } = await axios.get(`/products/${id}`);
    return data;
  }
);

// 3. Загрузка отзывов (для детальной страницы)
export const fetchProductReviews = createAsyncThunk(
  "products/fetchProductReviews",
  async (id) => {
    const { data } = await axios.get(`/reviews/product/${id}`);
    return data;
  }
);

// 4. Отправка нового отзыва
export const fetchCreateReview = createAsyncThunk(
  "products/fetchCreateReview",
  async ({ id, rating, comment, fullName }) => {
    const { data } = await axios.post(`/reviews/product/${id}`, { 
      rating, 
      comment, 
      fullName 
    });
    return data;
  }
);

const initialState = {
  // Список товаров (Каталог)
  items: [],
  totalPages: 1,
  currentPage: 1,
  status: "loading", // loading | success | error

  // Один товар (Детальная страница)
  currentProduct: null,
  
  // Отзывы
  currentReviews: [],
  reviewsStatus: "loading",
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setItems(state, action) {
      state.items = action.payload;
    },
    // Очистка данных при уходе со страницы товара
    clearCurrentProduct(state) {
      state.currentProduct = null;
      state.currentReviews = [];
      state.reviewsStatus = "loading";
    },
  },
  extraReducers: (builder) => {
    // --- Каталог товаров ---
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

    // --- Один товар ---
    builder.addCase(fetchOneProduct.fulfilled, (state, action) => {
      state.currentProduct = action.payload;
    });

    // --- Отзывы ---
    builder
      .addCase(fetchProductReviews.pending, (state) => {
        state.reviewsStatus = "loading";
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.reviewsStatus = "success";
        state.currentReviews = action.payload;
      })
      .addCase(fetchProductReviews.rejected, (state) => {
        state.reviewsStatus = "error";
      });
  },
});

export const { setItems, clearCurrentProduct } = productSlice.actions;

export default productSlice.reducer;