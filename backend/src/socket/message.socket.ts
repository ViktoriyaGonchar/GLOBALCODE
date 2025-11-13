import { Server as SocketIOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { messageService } from '../services/message.service';

export function setupMessageSocket(server: HTTPServer) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
  });

  // Middleware для аутентификации
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Токен не предоставлен'));
      }

      const payload = verifyAccessToken(token);
      socket.data.user = payload;
      next();
    } catch (error) {
      next(new Error('Недействительный токен'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user as TokenPayload;
    console.log(`User ${user.userId} connected to messages`);

    // Присоединение к комнатам бесед пользователя
    socket.on('join-conversations', async () => {
      try {
        const conversations = await messageService.getConversations(user.userId);
        conversations.forEach((conv) => {
          socket.join(`conversation:${conv.id}`);
        });
      } catch (error) {
        console.error('Error joining conversations:', error);
      }
    });

    // Присоединение к конкретной беседе
    socket.on('join-conversation', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
    });

    // Отправка сообщения
    socket.on('send-message', async (data: { conversationId: string; content: string }) => {
      try {
        const message = await messageService.createMessage(
          data.conversationId,
          user.userId,
          { content: data.content }
        );

        // Отправляем сообщение всем участникам беседы
        io.to(`conversation:${data.conversationId}`).emit('new-message', message);
      } catch (error) {
        socket.emit('error', { message: 'Ошибка отправки сообщения' });
      }
    });

    // Отметка как прочитанное
    socket.on('mark-read', async (conversationId: string) => {
      try {
        await messageService.markAsRead(conversationId, user.userId);
        socket.to(`conversation:${conversationId}`).emit('message-read', {
          conversationId,
          userId: user.userId,
        });
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User ${user.userId} disconnected from messages`);
    });
  });

  return io;
}

