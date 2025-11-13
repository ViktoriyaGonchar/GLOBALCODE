import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Некорректный email адрес'),
  username: z
    .string()
    .min(3, 'Имя пользователя должно содержать минимум 3 символа')
    .max(30, 'Имя пользователя не должно превышать 30 символов')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Имя пользователя может содержать только буквы, цифры, _ и -'),
  password: z
    .string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)/,
      'Пароль должен содержать хотя бы одну букву и одну цифру'
    ),
});

export const loginSchema = z.object({
  email: z.string().email('Некорректный email адрес'),
  password: z.string().min(1, 'Пароль обязателен для заполнения'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Некорректный email адрес'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Токен обязателен'),
  password: z
    .string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)/,
      'Пароль должен содержать хотя бы одну букву и одну цифру'
    ),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Токен обязателен'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token обязателен'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

