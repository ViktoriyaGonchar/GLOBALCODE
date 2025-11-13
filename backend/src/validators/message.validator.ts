import { z } from 'zod';

export const createConversationSchema = z.object({
  userId: z.string().min(1, 'ID пользователя обязателен'),
  type: z.enum(['direct', 'group']).default('direct'),
  participantIds: z.array(z.string()).optional().default([]),
});

export const createMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'Сообщение не может быть пустым')
    .max(5000, 'Сообщение не должно превышать 5000 символов'),
});

export const updateMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'Сообщение не может быть пустым')
    .max(5000, 'Сообщение не должно превышать 5000 символов'),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type UpdateMessageInput = z.infer<typeof updateMessageSchema>;

