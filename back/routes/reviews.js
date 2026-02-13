import express from 'express';
import { create, getByProduct } from '../controllers/ReviewController.js';
import checkAuth from '../utils/checkAuth.js'; // твой мидлвар авторизации

const router = express.Router();

// Обрати внимание на путь! Он должен быть '/product/:productId'
router.post('/product/:productId', checkAuth, create);
router.get('/product/:productId', getByProduct);

export default router;