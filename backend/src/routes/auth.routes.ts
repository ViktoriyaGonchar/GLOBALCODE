import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  refreshTokenSchema,
} from '../validators/auth.validator';

const router = Router();

// Публичные маршруты
router.post('/register', validate(registerSchema), authController.register.bind(authController));
router.post('/login', validate(loginSchema), authController.login.bind(authController));
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword.bind(authController));
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword.bind(authController));
router.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail.bind(authController));
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken.bind(authController));

// Защищённые маршруты
router.get('/me', authenticate, authController.getCurrentUser.bind(authController));
router.post('/logout', authenticate, authController.logout.bind(authController));

// OAuth маршруты (заглушки для будущей реализации)
router.post('/oauth/github', (req, res) => {
  res.status(501).json({ success: false, error: { message: 'GitHub OAuth пока не реализован', code: 'NOT_IMPLEMENTED' } });
});

router.post('/oauth/gitlab', (req, res) => {
  res.status(501).json({ success: false, error: { message: 'GitLab OAuth пока не реализован', code: 'NOT_IMPLEMENTED' } });
});

router.post('/oauth/google', (req, res) => {
  res.status(501).json({ success: false, error: { message: 'Google OAuth пока не реализован', code: 'NOT_IMPLEMENTED' } });
});

export default router;

