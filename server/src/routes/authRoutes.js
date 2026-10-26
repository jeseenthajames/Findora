import express from 'express';
import { register, login, getMe, logout } from '../controllers/authController.js';
import { validateRegister, validateLogin } from '../validation/authValidation.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);

export default router;
