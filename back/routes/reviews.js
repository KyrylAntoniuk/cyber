import express from 'express';
// 👇 ОБРАТИ ВНИМАНИЕ: добавили 'update' в фигурные скобки
import { create, getByProduct, update } from '../controllers/ReviewController.js'; 
import checkAuth from '../utils/checkAuth.js';

const router = express.Router();

router.get('/product/:productId', getByProduct);
router.post('/product/:productId', checkAuth, create);

// Теперь переменная 'update' существует, и эта строка сработает
router.patch('/:id', checkAuth, update); 

export default router;