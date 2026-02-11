import express from 'express';
import * as ProductController from '../controllers/ProductController.js';
import checkAuth from '../utils/checkAuth.js';

const router = express.Router();

router.get('/filters', ProductController.getFilters); // ПЕРВЫМ!
router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getOne);

router.post('/', checkAuth, ProductController.create);
router.delete('/:id', checkAuth, ProductController.remove);
router.patch('/:id', checkAuth, ProductController.update);

export default router;