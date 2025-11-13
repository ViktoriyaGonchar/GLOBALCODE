import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z
    .string()
    .min(5, 'Название должно содержать минимум 5 символов')
    .max(100, 'Название не должно превышать 100 символов'),
  description: z
    .string()
    .min(10, 'Описание должно содержать минимум 10 символов')
    .max(5000, 'Описание не должно превышать 5000 символов'),
  isPublished: z.boolean().default(false),
});

export const updateCourseSchema = z.object({
  title: z
    .string()
    .min(5, 'Название должно содержать минимум 5 символов')
    .max(100, 'Название не должно превышать 100 символов')
    .optional(),
  description: z
    .string()
    .min(10, 'Описание должно содержать минимум 10 символов')
    .max(5000, 'Описание не должно превышать 5000 символов')
    .optional(),
  isPublished: z.boolean().optional(),
});

export const createLessonSchema = z.object({
  title: z
    .string()
    .min(3, 'Название должно содержать минимум 3 символа')
    .max(100, 'Название не должно превышать 100 символов'),
  content: z
    .string()
    .min(10, 'Содержание должно содержать минимум 10 символов')
    .max(10000, 'Содержание не должно превышать 10000 символов'),
  type: z.enum(['VIDEO', 'TEXT', 'EXERCISE', 'QUIZ']),
  videoUrl: z.string().url().optional(),
  order: z.number().int().min(0),
  duration: z.number().int().min(0).default(0),
});

export const updateLessonSchema = z.object({
  title: z
    .string()
    .min(3, 'Название должно содержать минимум 3 символа')
    .max(100, 'Название не должно превышать 100 символов')
    .optional(),
  content: z
    .string()
    .min(10, 'Содержание должно содержать минимум 10 символов')
    .max(10000, 'Содержание не должно превышать 10000 символов')
    .optional(),
  type: z.enum(['VIDEO', 'TEXT', 'EXERCISE', 'QUIZ']).optional(),
  videoUrl: z.string().url().optional(),
  order: z.number().int().min(0).optional(),
  duration: z.number().int().min(0).optional(),
});

export const createExerciseSchema = z.object({
  description: z
    .string()
    .min(10, 'Описание должно содержать минимум 10 символов')
    .max(2000, 'Описание не должно превышать 2000 символов'),
  starterCode: z.string().max(10000, 'Код не должен превышать 10000 символов'),
  solution: z.string().max(10000, 'Решение не должно превышать 10000 символов'),
  tests: z.array(
    z.object({
      input: z.string(),
      expectedOutput: z.string(),
    })
  ),
});

export const createQuizSchema = z.object({
  questions: z.array(
    z.object({
      text: z.string().min(5, 'Вопрос должен содержать минимум 5 символов'),
      type: z.enum(['multiple-choice', 'true-false', 'code']),
      options: z.array(z.string()).optional(),
      correctAnswer: z.union([z.string(), z.number()]),
    })
  ),
  passingScore: z.number().int().min(0).max(100).default(70),
});

export const submitExerciseSchema = z.object({
  code: z.string().min(1, 'Код обязателен'),
});

export const submitQuizSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      answer: z.union([z.string(), z.number()]),
    })
  ),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;
export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type SubmitExerciseInput = z.infer<typeof submitExerciseSchema>;
export type SubmitQuizInput = z.infer<typeof submitQuizSchema>;

