import express from 'express';
import * as OrderController from '../controllers/OrderController.js';
import checkAuth from '../utils/checkAuth.js';

const router = express.Router();

router.post('/', checkAuth, OrderController.createOrder);
router.get('/', checkAuth, OrderController.getAllOrders);

export default router;