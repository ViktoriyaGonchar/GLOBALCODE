import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export function getMessageSocket(token: string): Socket {
  if (socket && socket.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('Connected to message socket');
    socket?.emit('join-conversations');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from message socket');
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
}

export function disconnectMessageSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function joinConversation(conversationId: string) {
  if (socket && socket.connected) {
    socket.emit('join-conversation', conversationId);
  }
}

export function sendMessage(conversationId: string, content: string) {
  if (socket && socket.connected) {
    socket.emit('send-message', { conversationId, content });
  }
}

export function markAsRead(conversationId: string) {
  if (socket && socket.connected) {
    socket.emit('mark-read', conversationId);
  }
}

