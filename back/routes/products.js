import express from 'express';
import * as ProductController from '../controllers/ProductController.js';
import checkAuth from '../utils/checkAuth.js';
import checkAdmin from '../utils/checkAdmin.js';
import { getAll, getOne, create, remove, update } from '../controllers/ProductController.js';
const router = express.Router();

router.get('/filters', ProductController.getFilters); // ПЕРВЫМ!
router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getOne);

router.post('/', checkAuth, ProductController.create);
router.delete('/:id', checkAuth, ProductController.remove);
router.patch('/:id', checkAuth, ProductController.update);

router.post('/', checkAuth, checkAdmin, create);
router.delete('/:id', checkAuth, checkAdmin, remove);
router.patch('/:id', checkAuth, checkAdmin, update);

export default router;