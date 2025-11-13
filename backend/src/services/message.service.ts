import { prisma } from '../utils/prisma';
import {
  NotFoundError,
  AuthorizationError,
  ConflictError,
} from '../utils/errors';
import {
  CreateConversationInput,
  CreateMessageInput,
  UpdateMessageInput,
} from '../validators/message.validator';

export class MessageService {
  async getConversations(userId: string) {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Форматируем для удобства
    return conversations.map((conv) => ({
      id: conv.id,
      type: conv.type,
      participants: conv.participants.map((p) => p.user),
      lastMessage: conv.messages[0] || null,
      updatedAt: conv.updatedAt,
    }));
  }

  async getConversationById(conversationId: string, userId: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundError('Беседа не найдена');
    }

    // Проверка участия
    const isParticipant = conversation.participants.some(
      (p) => p.userId === userId
    );

    if (!isParticipant) {
      throw new AuthorizationError('Нет доступа к этой беседе');
    }

    return conversation;
  }

  async createConversation(userId: string, data: CreateConversationInput) {
    // Для прямых сообщений проверяем, существует ли уже беседа
    if (data.type === 'direct') {
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          type: 'DIRECT',
          participants: {
            every: {
              userId: {
                in: [userId, data.userId],
              },
            },
          },
        },
        include: {
          participants: true,
        },
      });

      // Проверяем, что в беседе ровно 2 участника
      if (
        existingConversation &&
        existingConversation.participants.length === 2
      ) {
        return existingConversation;
      }
    }

    // Создаём новую беседу
    const conversation = await prisma.conversation.create({
      data: {
        type: data.type === 'direct' ? 'DIRECT' : 'GROUP',
        participants: {
          create: [
            { userId }, // Создатель
            ...(data.type === 'direct'
              ? [{ userId: data.userId }]
              : data.participantIds.map((id) => ({ userId: id }))),
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return conversation;
  }

  async getMessages(
    conversationId: string,
    userId: string,
    page: number = 1,
    limit: number = 50
  ) {
    // Проверка доступа
    await this.getConversationById(conversationId, userId);

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.message.count({ where: { conversationId } }),
    ]);

    // Отмечаем сообщения как прочитанные
    await prisma.conversationParticipant.updateMany({
      where: {
        conversationId,
        userId,
      },
      data: {
        lastReadAt: new Date(),
      },
    });

    return {
      messages: messages.reverse(), // Возвращаем в хронологическом порядке
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createMessage(
    conversationId: string,
    userId: string,
    data: CreateMessageInput
  ) {
    // Проверка доступа
    await this.getConversationById(conversationId, userId);

    const message = await prisma.message.create({
      data: {
        content: data.content,
        conversationId,
        senderId: userId,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    // Обновляем время обновления беседы
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async updateMessage(messageId: string, userId: string, data: UpdateMessageInput) {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundError('Сообщение не найдено');
    }

    if (message.senderId !== userId) {
      throw new AuthorizationError('Только автор может редактировать сообщение');
    }

    const updated = await prisma.message.update({
      where: { id: messageId },
      data: {
        content: data.content,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    return updated;
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundError('Сообщение не найдено');
    }

    if (message.senderId !== userId) {
      throw new AuthorizationError('Только автор может удалить сообщение');
    }

    await prisma.message.delete({
      where: { id: messageId },
    });

    return { message: 'Сообщение успешно удалено' };
  }

  async markAsRead(conversationId: string, userId: string) {
    await prisma.conversationParticipant.updateMany({
      where: {
        conversationId,
        userId,
      },
      data: {
        lastReadAt: new Date(),
      },
    });

    return { message: 'Отмечено как прочитанное' };
  }

  async getUnreadCount(userId: string) {
    const conversations = await prisma.conversationParticipant.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    let unreadCount = 0;

    for (const participant of conversations) {
      if (participant.conversation.messages.length > 0) {
        const lastMessage = participant.conversation.messages[0];
        const lastReadAt = participant.lastReadAt;

        if (
          !lastReadAt ||
          new Date(lastMessage.createdAt) > new Date(lastReadAt)
        ) {
          if (lastMessage.senderId !== userId) {
            unreadCount++;
          }
        }
      }
    }

    return { unreadCount };
  }
}

export const messageService = new MessageService();

