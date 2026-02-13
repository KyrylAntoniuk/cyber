import express from 'express';
import checkAuth from '../utils/checkAuth.js';
import * as ReviewController from '../controllers/ReviewController.js';

const router = express.Router();

// GET /reviews/product/:productId - Получить отзывы товара
router.get('/product/:productId', ReviewController.getByProduct);

// POST /reviews/product/:productId - Создать отзыв (нужна авторизация)
router.post('/product/:productId', checkAuth, ReviewController.create);

export default router;