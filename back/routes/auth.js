import express from 'express';
import * as UserController from '../controllers/UserController.js';
import checkAuth from '../utils/checkAuth.js';

const router = express.Router();

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/me', checkAuth, UserController.getMe);
router.patch('/me', checkAuth, UserController.updateMe);

// Новый роут для добавления адреса (защищен checkAuth)
router.post('/address', checkAuth, UserController.addAddress);

export default router;