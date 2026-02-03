import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../axios";

// --- ACTIONS ---

// Login (Вход)
export const fetchAuth = createAsyncThunk("auth/fetchAuth", async (params) => {
  const { data } = await axios.post("/auth/login", params);
  return data;
});

// Register (Регистрация)
export const fetchRegister = createAsyncThunk("auth/fetchRegister", async (params) => {
  const { data } = await axios.post("/auth/register", params);
  return data;
});

// Get Me (Проверка токена при загрузке)
export const fetchAuthMe = createAsyncThunk("auth/fetchAuthMe", async () => {
  const { data } = await axios.get("/auth/me");
  return data;
});

// Update User (Обновление профиля: адреса, имя, карты)
export const fetchUpdateUser = createAsyncThunk(
  "auth/fetchUpdateUser",
  async (params) => {
    // Используем PATCH /auth/me, который мы создали в backend/routes/auth.js
    const { data } = await axios.patch("/auth/me", params);
    return data;
  }
);

// --- SLICE ---

const initialState = {
  data: null,
  status: "loading", // loading | loaded | error
};

const userSlice = createSlice({
  name: "auth", // Используем имя 'auth' для согласованности с селекторами
  initialState,
  reducers: {
    logout: (state) => {
      state.data = null;
      window.localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    // --- Login ---
    builder
      .addCase(fetchAuth.pending, (state) => {
        state.status = "loading";
        state.data = null;
      })
      .addCase(fetchAuth.fulfilled, (state, action) => {
        state.status = "loaded";
        state.data = action.payload;
      })
      .addCase(fetchAuth.rejected, (state) => {
        state.status = "error";
        state.data = null;
      });

    // --- Register ---
    builder
      .addCase(fetchRegister.pending, (state) => {
        state.status = "loading";
        state.data = null;
      })
      .addCase(fetchRegister.fulfilled, (state, action) => {
        state.status = "loaded";
        state.data = action.payload;
      })
      .addCase(fetchRegister.rejected, (state) => {
        state.status = "error";
        state.data = null;
      });

    // --- Auth Me ---
    builder
      .addCase(fetchAuthMe.pending, (state) => {
        state.status = "loading";
        state.data = null;
      })
      .addCase(fetchAuthMe.fulfilled, (state, action) => {
        state.status = "loaded";
        state.data = action.payload;
      })
      .addCase(fetchAuthMe.rejected, (state) => {
        state.status = "error";
        state.data = null;
      });

    // --- Update User (Address/Info) ---
    builder
      .addCase(fetchUpdateUser.pending, (state) => {
        // Не сбрасываем data в null, чтобы интерфейс не мигал
        state.status = "loading"; 
      })
      .addCase(fetchUpdateUser.fulfilled, (state, action) => {
        state.status = "loaded";
        state.data = action.payload; // Обновляем данные пользователя
      })
      .addCase(fetchUpdateUser.rejected, (state) => {
        state.status = "error";
        // Можно добавить обработку ошибки, но данные не стираем
      });
  },
});

// Селектор для проверки авторизации
export const selectIsAuth = (state) => Boolean(state.auth.data);

export const { logout } = userSlice.actions;
export default userSlice.reducer;