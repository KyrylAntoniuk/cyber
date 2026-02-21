import express from 'express';
import checkAuth from '../utils/checkAuth.js';
import checkAdmin from '../utils/checkAdmin.js';

// Импортируем только те методы, которые реально существуют в ProductController
import { 
  getFilters, 
  getAll, 
  getOne, 
  remove, 
  update, 
  createBulk 
} from '../controllers/ProductController.js';

const router = express.Router();

// Получение данных
router.get('/filters', getFilters);
router.get('/', getAll);
router.get('/:id', getOne);

// --- ДЕЙСТВИЯ АДМИНА ---

// Массовое добавление товаров через JSON
router.post('/bulk', checkAuth, checkAdmin, createBulk);

// Удаление и обновление товаров
router.delete('/:id', checkAuth, checkAdmin, remove);
router.patch('/:id', checkAuth, checkAdmin, update);

export default router;