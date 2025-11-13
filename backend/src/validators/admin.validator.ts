import { z } from 'zod';

export const updateUserSchema = z.object({
  username: z
    .string()
    .min(3, 'Имя пользователя должно содержать минимум 3 символа')
    .max(30, 'Имя пользователя не должно превышать 30 символов')
    .optional(),
  role: z.enum(['USER', 'MODERATOR', 'ADMIN']).optional(),
  isEmailVerified: z.boolean().optional(),
  isBanned: z.boolean().optional(),
});

export const updateProjectSchema = z.object({
  isPublic: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export const updateTopicSchema = z.object({
  isLocked: z.boolean().optional(),
  isPinned: z.boolean().optional(),
});

export const updateCourseSchema = z.object({
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type UpdateTopicInput = z.infer<typeof updateTopicSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;

