import { createSlice } from "@reduxjs/toolkit";

const getCartFromLS = () => {
  const data = localStorage.getItem("cart");
  const items = data ? JSON.parse(data) : [];
  const totalPrice = items.reduce((sum, obj) => obj.price * obj.count + sum, 0);

  return {
    items,
    totalPrice,
  };
};

const initialState = getCartFromLS();

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem(state, action) {
      const findItem = state.items.find((obj) => obj.id === action.payload.id);

      if (findItem) {
        findItem.count++;
      } else {
        state.items.push({
          ...action.payload,
          count: 1,
        });
      }
      
      state.totalPrice = state.items.reduce((sum, obj) => {
        return obj.price * obj.count + sum;
      }, 0);
      
      localStorage.setItem("cart", JSON.stringify(state.items));
    },
    
    minusItem(state, action) {
      const findItem = state.items.find((obj) => obj.id === action.payload);

      if (findItem) {
        findItem.count--;
        // Если стало 0, можно удалить (опционально)
        // if (findItem.count === 0) state.items = state.items.filter(...)
      }
      state.totalPrice = state.items.reduce((sum, obj) => {
        return obj.price * obj.count + sum;
      }, 0);
      
      localStorage.setItem("cart", JSON.stringify(state.items));
    },

    removeItem(state, action) {
      state.items = state.items.filter((obj) => obj.id !== action.payload);
      state.totalPrice = state.items.reduce((sum, obj) => {
        return obj.price * obj.count + sum;
      }, 0);
      
      localStorage.setItem("cart", JSON.stringify(state.items));
    },

    // ВАЖНО: действие называется clearCart
    clearCart(state) {
      state.items = [];
      state.totalPrice = 0;
      localStorage.removeItem("cart");
    },
  },
});

export const { addItem, removeItem, minusItem, clearCart } = cartSlice.actions;

export default cartSlice.reducer;