import { io, Socket } from 'socket.io-client';
import { Notification } from '../api/notification';
import { useAuthStore } from '../store/auth';

let socket: Socket | null = null;

export function connectNotificationSocket(
  onNotification: (notification: Notification) => void,
  onUnreadCount: (count: number) => void
) {
  const { token } = useAuthStore.getState();
  
  if (!token) {
    return null;
  }

  if (socket?.connected) {
    return socket;
  }

  const socketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:5000';
  
  socket = io(`${socketUrl}/socket/notifications`, {
    auth: {
      token,
    },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('Connected to notification socket');
  });

  socket.on('notification', (data: Notification) => {
    onNotification(data);
  });

  socket.on('unread-count', (data: { count: number }) => {
    onUnreadCount(data.count);
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from notification socket');
  });

  socket.on('error', (error) => {
    console.error('Notification socket error:', error);
  });

  return socket;
}

export function disconnectNotificationSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getNotificationSocket() {
  return socket;
}

