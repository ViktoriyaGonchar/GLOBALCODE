import { Router } from 'express';
import { messageController } from '../controllers/message.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createConversationSchema,
  createMessageSchema,
  updateMessageSchema,
} from '../validators/message.validator';

const router = Router();

// Все маршруты требуют аутентификации
router.use(authenticate);

router.get(
  '/conversations',
  messageController.getConversations.bind(messageController)
);

router.get(
  '/conversations/:id',
  messageController.getConversation.bind(messageController)
);

router.post(
  '/conversations',
  validate(createConversationSchema),
  messageController.createConversation.bind(messageController)
);

router.get(
  '/conversations/:id/messages',
  messageController.getMessages.bind(messageController)
);

router.post(
  '/conversations/:id/messages',
  validate(createMessageSchema),
  messageController.createMessage.bind(messageController)
);

router.put(
  '/messages/:id',
  validate(updateMessageSchema),
  messageController.updateMessage.bind(messageController)
);

router.delete(
  '/messages/:id',
  messageController.deleteMessage.bind(messageController)
);

router.post(
  '/conversations/:id/read',
  messageController.markAsRead.bind(messageController)
);

router.get(
  '/unread-count',
  messageController.getUnreadCount.bind(messageController)
);

export default router;

