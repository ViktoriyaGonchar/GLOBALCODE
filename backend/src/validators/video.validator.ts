import { z } from 'zod';

export const createVideoSchema = z.object({
  title: z
    .string()
    .min(3, 'Название должно содержать минимум 3 символа')
    .max(200, 'Название не должно превышать 200 символов'),
  description: z
    .string()
    .max(5000, 'Описание не должно превышать 5000 символов')
    .optional(),
  url: z.string().url('Некорректный URL видео'),
  thumbnail: z.string().url('Некорректный URL превью').optional(),
  duration: z.number().int().min(0, 'Длительность должна быть положительной'),
  number: z
    .number()
    .int()
    .min(1, 'Номер должен быть от 1 до 100')
    .max(100, 'Номер должен быть от 1 до 100'),
  qualities: z.array(
    z.object({
      quality: z.enum(['360p', '480p', '720p', '1080p']),
      url: z.string().url('Некорректный URL'),
    })
  ),
  subtitles: z.string().optional(),
});

export const updateVideoSchema = z.object({
  title: z
    .string()
    .min(3, 'Название должно содержать минимум 3 символа')
    .max(200, 'Название не должно превышать 200 символов')
    .optional(),
  description: z
    .string()
    .max(5000, 'Описание не должно превышать 5000 символов')
    .optional(),
  url: z.string().url('Некорректный URL видео').optional(),
  thumbnail: z.string().url('Некорректный URL превью').optional(),
  duration: z.number().int().min(0).optional(),
  qualities: z
    .array(
      z.object({
        quality: z.enum(['360p', '480p', '720p', '1080p']),
        url: z.string().url('Некорректный URL'),
      })
    )
    .optional(),
  subtitles: z.string().optional(),
});

export const saveProgressSchema = z.object({
  currentTime: z.number().min(0, 'Время должно быть положительным'),
});

export type CreateVideoInput = z.infer<typeof createVideoSchema>;
export type UpdateVideoInput = z.infer<typeof updateVideoSchema>;
export type SaveProgressInput = z.infer<typeof saveProgressSchema>;

