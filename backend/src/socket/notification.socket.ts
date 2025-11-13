import type { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { authenticateSocket } from '../middleware/auth';

export function setupNotificationSocket(server: HTTPServer) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
    path: '/socket/notifications',
  });

  // Middleware для аутентификации
  io.use(async (socket, next) => {
    try {
      const user = await authenticateSocket(socket);
      if (user) {
        (socket as any).user = user;
        next();
      } else {
        next(new Error('Authentication failed'));
      }
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const user = (socket as any).user;
    if (!user) {
      socket.disconnect();
      return;
    }

    // Присоединяем пользователя к его комнате
    socket.join(`user:${user.userId}`);

    socket.on('disconnect', () => {
      console.log(`User ${user.userId} disconnected from notifications`);
    });
  });

  // Функция для отправки уведомления пользователю
  const sendNotification = (userId: string, notification: {
    type: string;
    title: string;
    message: string;
    link?: string;
  }) => {
    io.to(`user:${userId}`).emit('notification', notification);
  };

  return { io, sendNotification };
}

// Экспортируем функцию для использования в других модулях
let notificationSocketInstance: { io: any; sendNotification: (userId: string, notification: any) => void } | null = null;

export function getNotificationSocket() {
  return notificationSocketInstance;
}

export function setNotificationSocket(instance: { io: any; sendNotification: (userId: string, notification: any) => void }) {
  notificationSocketInstance = instance;
}

