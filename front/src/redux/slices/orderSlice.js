import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axios";

// Асинхронный экшен для получения заказов пользователя
export const fetchMyOrders = createAsyncThunk("orders/fetchMyOrders", async () => {
  const { data } = await axios.get("/orders");
  return data;
});

// --- НОВЫЕ ЭКШЕНЫ ДЛЯ АДМИНА ---

// Асинхронный экшен для получения ВСЕХ заказов
export const fetchAllOrders = createAsyncThunk("orders/fetchAllOrders", async () => {
  const { data } = await axios.get("/orders/all");
  return data;
});

// Асинхронный экшен для изменения статуса заказа
export const updateOrderStatus = createAsyncThunk(
  "orders/updateOrderStatus",
  async ({ id, status }) => {
    const { data } = await axios.patch(`/orders/${id}/status`, { status });
    return data; // Возвращаем обновленный заказ от бэкенда
  }
);

const initialState = {
  // Данные для страницы пользователя
  items: [],
  status: "loading", // loading | success | error

  // Данные для админ-панели
  adminOrders: {
    items: [],
    status: "loading", // loading | success | error
  },
};

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // --- Обработка пользовательских заказов (fetchMyOrders) ---
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
      })

      // --- Обработка админских заказов (fetchAllOrders) ---
      .addCase(fetchAllOrders.pending, (state) => {
        state.adminOrders.status = "loading";
        state.adminOrders.items = [];
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.adminOrders.status = "success";
        state.adminOrders.items = action.payload;
      })
      .addCase(fetchAllOrders.rejected, (state) => {
        state.adminOrders.status = "error";
        state.adminOrders.items = [];
      })

      // --- Обработка обновления статуса (updateOrderStatus) ---
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        // Получаем обновленный заказ из payload
        const updatedOrder = action.payload;
        
        // Находим индекс этого заказа в массиве админских заказов
        const index = state.adminOrders.items.findIndex(
          (order) => order._id === updatedOrder._id
        );
        
        // Если заказ найден, точечно обновляем его статус без перезагрузки всей таблицы
        if (index !== -1) {
          state.adminOrders.items[index].status = updatedOrder.status;
        }
      });
  },
});

export default orderSlice.reducer;