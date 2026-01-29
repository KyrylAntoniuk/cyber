import express from 'express';
import * as WishlistController from '../controllers/WishlistController.js';
import checkAuth from '../utils/checkAuth.js';

const router = express.Router();

// Все действия с избранным доступны только авторизованным
router.get('/', checkAuth, WishlistController.getWishlist);
router.post('/', checkAuth, WishlistController.addToWishlist);
router.delete('/:productId', checkAuth, WishlistController.removeFromWishlist);

export default router;