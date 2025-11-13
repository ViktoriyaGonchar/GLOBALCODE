import { z } from 'zod';

export const createTopicSchema = z.object({
  title: z
    .string()
    .min(5, 'Заголовок должен содержать минимум 5 символов')
    .max(200, 'Заголовок не должен превышать 200 символов'),
  content: z
    .string()
    .min(10, 'Содержание должно содержать минимум 10 символов')
    .max(10000, 'Содержание не должно превышать 10000 символов'),
  categoryId: z.string().min(1, 'Категория обязательна'),
  attachedProjectIds: z.array(z.string()).optional().default([]),
});

export const updateTopicSchema = z.object({
  title: z
    .string()
    .min(5, 'Заголовок должен содержать минимум 5 символов')
    .max(200, 'Заголовок не должен превышать 200 символов')
    .optional(),
  content: z
    .string()
    .min(10, 'Содержание должно содержать минимум 10 символов')
    .max(10000, 'Содержание не должно превышать 10000 символов')
    .optional(),
  categoryId: z.string().min(1, 'Категория обязательна').optional(),
  isLocked: z.boolean().optional(),
  isPinned: z.boolean().optional(),
});

export const createPostSchema = z.object({
  content: z
    .string()
    .min(1, 'Сообщение не может быть пустым')
    .max(5000, 'Сообщение не должно превышать 5000 символов'),
  parentId: z.string().optional(), // Для ответов на сообщения
});

export const updatePostSchema = z.object({
  content: z
    .string()
    .min(1, 'Сообщение не может быть пустым')
    .max(5000, 'Сообщение не должно превышать 5000 символов'),
});

export const reportPostSchema = z.object({
  reason: z
    .string()
    .min(5, 'Причина должна содержать минимум 5 символов')
    .max(500, 'Причина не должна превышать 500 символов'),
});

export type CreateTopicInput = z.infer<typeof createTopicSchema>;
export type UpdateTopicInput = z.infer<typeof updateTopicSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type ReportPostInput = z.infer<typeof reportPostSchema>;

