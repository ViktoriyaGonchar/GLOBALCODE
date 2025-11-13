import { z } from 'zod';

export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, 'Имя пользователя должно содержать минимум 3 символа')
    .max(30, 'Имя пользователя не должно превышать 30 символов')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Имя пользователя может содержать только буквы, цифры, _ и -')
    .optional(),
  bio: z
    .string()
    .max(500, 'Биография не должна превышать 500 символов')
    .optional(),
  avatar: z.string().url('Некорректный URL аватара').optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

