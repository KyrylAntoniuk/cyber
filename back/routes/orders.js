import express from 'express';
// Заменили getUserOrders на getMyOrders
import { createOrder, getMyOrders, getAllOrders, updateOrderStatus } from '../controllers/OrderController.js';
import checkAuth from '../utils/checkAuth.js';
import checkAdmin from '../utils/checkAdmin.js'; 

const router = express.Router();

// --- Админские роуты (Важно: они должны быть ДО роутов с параметрами типа /:id) ---
router.get('/all', checkAuth, checkAdmin, getAllOrders);
router.patch('/:id/status', checkAuth, checkAdmin, updateOrderStatus);

// --- Пользовательские роуты ---
router.post('/', checkAuth, createOrder);

// Используем getMyOrders вместо getUserOrders
router.get('/', checkAuth, getMyOrders); 

export default router;