import express from 'express';
// Убедитесь, что функции импортируются правильно
import * as OrderController from '../controllers/OrderController.js';
import checkAuth from '../utils/checkAuth.js';

const router = express.Router();

router.post('/', checkAuth, OrderController.createOrder);

// ИСПРАВЛЕНИЕ: getAllOrders -> getMyOrders
router.get('/', checkAuth, OrderController.getMyOrders); 

export default router;