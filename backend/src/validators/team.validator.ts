import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z
    .string()
    .min(3, 'Название должно содержать минимум 3 символа')
    .max(50, 'Название не должно превышать 50 символов'),
  description: z
    .string()
    .max(1000, 'Описание не должно превышать 1000 символов')
    .optional(),
});

export const updateTeamSchema = z.object({
  name: z
    .string()
    .min(3, 'Название должно содержать минимум 3 символа')
    .max(50, 'Название не должно превышать 50 символов')
    .optional(),
  description: z
    .string()
    .max(1000, 'Описание не должно превышать 1000 символов')
    .optional(),
});

export const addMemberSchema = z.object({
  userId: z.string().min(1, 'ID пользователя обязателен'),
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER']).default('MEMBER'),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER']),
});

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(3, 'Название должно содержать минимум 3 символа')
    .max(100, 'Название не должно превышать 100 символов'),
  description: z
    .string()
    .max(2000, 'Описание не должно превышать 2000 символов')
    .optional(),
  assigneeId: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  dueDate: z.string().datetime().optional(),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(3, 'Название должно содержать минимум 3 символа')
    .max(100, 'Название не должно превышать 100 символов')
    .optional(),
  description: z
    .string()
    .max(2000, 'Описание не должно превышать 2000 символов')
    .optional(),
  assigneeId: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: z.string().datetime().optional(),
});

export const createEventSchema = z.object({
  title: z
    .string()
    .min(3, 'Название должно содержать минимум 3 символа')
    .max(100, 'Название не должно превышать 100 символов'),
  description: z.string().max(500, 'Описание не должно превышать 500 символов').optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;

