import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z
    .string()
    .min(3, 'Название должно содержать минимум 3 символа')
    .max(100, 'Название не должно превышать 100 символов'),
  description: z
    .string()
    .min(10, 'Описание должно содержать минимум 10 символов')
    .max(5000, 'Описание не должно превышать 5000 символов'),
  license: z.enum(['MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-3-Clause', 'Unlicense', 'Other']),
  tags: z
    .array(z.string().min(1).max(30))
    .max(10, 'Максимум 10 тегов')
    .optional()
    .default([]),
  isPublic: z.boolean().default(true),
});

export const updateProjectSchema = z.object({
  title: z
    .string()
    .min(3, 'Название должно содержать минимум 3 символа')
    .max(100, 'Название не должно превышать 100 символов')
    .optional(),
  description: z
    .string()
    .min(10, 'Описание должно содержать минимум 10 символов')
    .max(5000, 'Описание не должно превышать 5000 символов')
    .optional(),
  license: z
    .enum(['MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-3-Clause', 'Unlicense', 'Other'])
    .optional(),
  tags: z
    .array(z.string().min(1).max(30))
    .max(10, 'Максимум 10 тегов')
    .optional(),
  isPublic: z.boolean().optional(),
});

export const createVersionSchema = z.object({
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, 'Версия должна быть в формате x.y.z (например, 1.0.0)'),
  changelog: z.string().max(5000, 'Changelog не должен превышать 5000 символов').optional(),
});

export const updateAccessSchema = z.object({
  isPublic: z.boolean(),
  invitedUsers: z.array(z.string()).optional(),
});

export const inviteUserSchema = z.object({
  email: z.string().email('Некорректный email адрес'),
});

export const gitImportSchema = z.object({
  repositoryUrl: z.string().url('Некорректный URL репозитория'),
  branch: z.string().optional().default('main'),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateVersionInput = z.infer<typeof createVersionSchema>;
export type UpdateAccessInput = z.infer<typeof updateAccessSchema>;
export type InviteUserInput = z.infer<typeof inviteUserSchema>;
export type GitImportInput = z.infer<typeof gitImportSchema>;

