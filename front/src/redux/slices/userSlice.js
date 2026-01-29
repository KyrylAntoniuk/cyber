import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axios";

// Вход
export const fetchAuth = createAsyncThunk("auth/fetchAuth", async (params) => {
  const { data } = await axios.post("/auth/login", params);
  return data;
});

// Регистрация
export const fetchRegister = createAsyncThunk("auth/fetchRegister", async (params) => {
  const { data } = await axios.post("/auth/register", params);
  return data;
});

// Проверка токена (Me)
export const fetchAuthMe = createAsyncThunk("auth/fetchAuthMe", async () => {
  const { data } = await axios.get("/auth/me");
  return data;
});

// --- НОВОЕ ДЕЙСТВИЕ: Добавить адрес ---
export const fetchAddAddress = createAsyncThunk("auth/fetchAddAddress", async (addressData) => {
  // Отправляем POST запрос с данными адреса
  const { data } = await axios.post("/auth/address", addressData);
  return data; // Сервер вернет обновленного пользователя с новым списком адресов
});

const initialState = {
  data: null,
  status: "loading",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state) => {
      state.data = null;
      window.localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(fetchAuth.pending, (state) => {
      state.status = "loading";
      state.data = null;
    });
    builder.addCase(fetchAuth.fulfilled, (state, action) => {
      state.status = "loaded";
      state.data = action.payload;
    });
    builder.addCase(fetchAuth.rejected, (state) => {
      state.status = "error";
      state.data = null;
    });

    // Register
    builder.addCase(fetchRegister.pending, (state) => {
      state.status = "loading";
      state.data = null;
    });
    builder.addCase(fetchRegister.fulfilled, (state, action) => {
      state.status = "loaded";
      state.data = action.payload;
    });
    builder.addCase(fetchRegister.rejected, (state) => {
      state.status = "error";
      state.data = null;
    });

    // Auth Me
    builder.addCase(fetchAuthMe.pending, (state) => {
      state.status = "loading";
      state.data = null;
    });
    builder.addCase(fetchAuthMe.fulfilled, (state, action) => {
      state.status = "loaded";
      state.data = action.payload;
    });
    builder.addCase(fetchAuthMe.rejected, (state) => {
      state.status = "error";
      state.data = null;
    });

    // --- Обработка добавления адреса ---
    builder.addCase(fetchAddAddress.fulfilled, (state, action) => {
      // Обновляем данные пользователя новыми, которые пришли с сервера (там уже есть новый адрес)
      state.data = action.payload;
    });
  },
});

export const selectIsAuth = (state) => Boolean(state.user.data);
export const { logout } = userSlice.actions;
export default userSlice.reducer;