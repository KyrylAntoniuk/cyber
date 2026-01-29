import { configureStore } from "@reduxjs/toolkit";
import product from "./slices/productSlice";
import filter from "./slices/filterSlice";
import wishlist from "./slices/wishlistSlice";
import cart from "./slices/cartSlice";

import user from "./slices/userSlice";

export const store = configureStore({
  reducer: { product, filter, wishlist, cart, user },
});
