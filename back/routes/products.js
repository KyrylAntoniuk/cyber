import express from 'express';
import * as ProductController from '../controllers/ProductController.js';

const router = express.Router();

router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getOne);

export default router;