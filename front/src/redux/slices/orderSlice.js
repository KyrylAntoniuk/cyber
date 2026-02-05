import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axios";

// Асинхронный экшен для получения заказов пользователя
export const fetchMyOrders = createAsyncThunk("orders/fetchMyOrders", async () => {
  const { data } = await axios.get("/orders");
  return data;
});

const initialState = {
  items: [],
  status: "loading", // loading | success | error
};

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyOrders.pending, (state) => {
        state.status = "loading";
        state.items = [];
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.status = "success";
        state.items = action.payload;
      })
      .addCase(fetchMyOrders.rejected, (state) => {
        state.status = "error";
        state.items = [];
      });
  },
});

export default orderSlice.reducer;