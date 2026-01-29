import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../../axios"; // Убедитесь, что этот путь правильный к вашему axios.js

export const fetchWishlistItems = createAsyncThunk(
  "wishlist/fetchWishlistItems",
  async () => {
    const { data } = await axios.get("/wishlist");
    return data;
  }
);

export const addWishlistItem = createAsyncThunk(
  "wishlist/addWishlistItem",
  async (productId) => {
    // Отправляем ID товара
    const { data } = await axios.post("/wishlist", { productId });
    return data;
  }
);

export const removeWishlistItem = createAsyncThunk(
  "wishlist/removeWishlistItem",
  async (productId) => {
    await axios.delete(`/wishlist/${productId}`);
    return productId;
  }
);

const initialState = {
  wishlistItems: [],
  status: "idle",
  error: null,
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    // Fetch
    builder.addCase(fetchWishlistItems.pending, (state) => {
      state.status = "loading";
    });
    builder.addCase(fetchWishlistItems.fulfilled, (state, action) => {
      state.status = "success";
      state.wishlistItems = action.payload;
    });
    builder.addCase(fetchWishlistItems.rejected, (state, action) => {
      state.status = "error";
      state.wishlistItems = [];
      state.error = action.payload;
    });

    // Add
    builder.addCase(addWishlistItem.pending, (state) => {
      state.status = "loading";
    });
    builder.addCase(addWishlistItem.fulfilled, (state, action) => {
      state.status = "success";
      state.wishlistItems.push(action.payload);
    });
    builder.addCase(addWishlistItem.rejected, (state, action) => {
      state.status = "error";
      state.error = action.payload;
    });

    // Remove
    builder.addCase(removeWishlistItem.pending, (state) => {
      state.status = "loading";
    });
    builder.addCase(removeWishlistItem.fulfilled, (state, action) => {
      state.status = "success";
      // Удаляем элемент из массива. Учитываем, что ID может быть в разных полях в зависимости от бэкенда
      state.wishlistItems = state.wishlistItems.filter(
        (item) => (item.product ? item.product._id !== action.payload : item.itemId !== action.payload)
      );
    });
    builder.addCase(removeWishlistItem.rejected, (state, action) => {
      state.status = "error";
      state.error = action.payload;
    });
  },
});

// Вот эта строка пропущена и вызывает ошибку:
export default wishlistSlice.reducer;