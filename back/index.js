import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import productRoutes from './routes/products.js';
import authRoutes from './routes/auth.js';
import wishlistRoutes from './routes/wishlist.js';
import orderRoutes from './routes/orders.js';
import reviewRoutes from "./routes/reviews.js"
// import orderRoutes from './routes/orders.js'; // Если успеете сделать заказы

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors()); // Разрешает запросы с фронтенда
app.use(express.json()); // Позволяет читать JSON из тела запроса

// Подключение к БД
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ DB connected'))
  .catch((err) => console.error('❌ DB error', err));

// Маршруты
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/reviews', reviewRoutes);


app.listen(PORT, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log(`🚀 Server running on port ${PORT}`);
});