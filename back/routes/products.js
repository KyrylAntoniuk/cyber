import express from 'express';
import * as ProductController from '../controllers/ProductController.js';
import checkAuth from '../utils/checkAuth.js';
const router = express.Router();

router.get('/filters', ProductController.getFilters); 
// --------------------------------------------------

// Получение всех товаров
router.get('/', ProductController.getAll);

// Получение одного товара по ID (этот маршрут ловит всё, что не 'filters')
router.get('/:id', ProductController.getOne);

// Админские методы
router.post('/', checkAuth, ProductController.create);
router.delete('/:id', checkAuth, ProductController.remove);
router.patch('/:id', checkAuth, ProductController.update);
export default router;