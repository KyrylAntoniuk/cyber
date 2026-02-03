import { configureStore } from "@reduxjs/toolkit";
import product from "./slices/productSlice";
import filter from "./slices/filterSlice";
import wishlist from "./slices/wishlistSlice";
import cart from "./slices/cartSlice";

import authReducer from "./slices/userSlice"

export const store = configureStore({
  reducer: { product, filter, wishlist, cart, auth: authReducer },
});
