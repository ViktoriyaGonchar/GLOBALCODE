'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ConversationList } from '@/components/messages/ConversationList';
import { MessageList } from '@/components/messages/MessageList';
import { MessageInput } from '@/components/messages/MessageInput';
import { messageApi, Conversation, Message } from '@/lib/api/message';
import { getMessageSocket, joinConversation, sendMessage, markAsRead, disconnectMessageSocket } from '@/lib/socket/message.socket';
import { useAuthStore } from '@/lib/store/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function MessagesPageContent() {
  const { user } = useAuthStore();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const socketInstance = getMessageSocket(token);
        setSocket(socketInstance);

        socketInstance.on('new-message', (message: Message) => {
          if (message.conversationId === selectedConversation?.id) {
            setMessages((prev) => [...prev, message]);
          }
        });

        return () => {
          disconnectMessageSocket();
        };
      }
    }
  }, [user, selectedConversation?.id]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages();
      joinConversation(selectedConversation.id);
      markAsRead(selectedConversation.id);
    }
  }, [selectedConversation?.id]);

  const loadMessages = async () => {
    if (!selectedConversation) return;

    setLoading(true);
    try {
      const response = await messageApi.getMessages(selectedConversation.id);
      if (response.success && response.data) {
        setMessages(response.data.messages);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation || !content.trim()) return;

    try {
      // Отправляем через WebSocket для real-time
      sendMessage(selectedConversation.id, content);
      
      // Также отправляем через API для надёжности
      const response = await messageApi.createMessage(selectedConversation.id, {
        content,
      });

      if (response.success && response.data) {
        setMessages((prev) => [...prev, response.data!]);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-80 border-r bg-card">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Сообщения</h2>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-80px)]">
          <ConversationList
            onSelectConversation={setSelectedConversation}
            selectedId={selectedConversation?.id}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b bg-card">
              <h3 className="font-semibold">
                {selectedConversation.type === 'direct'
                  ? selectedConversation.participants.find((p) => p.id !== user?.id)?.username || 'Неизвестный'
                  : `Группа (${selectedConversation.participants.length})`}
              </h3>
            </div>

            <MessageList messages={messages} />

            <div className="p-4 border-t bg-card">
              <MessageInput onSend={handleSendMessage} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p>Выберите беседу для начала общения</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <ProtectedRoute>
      <MessagesPageContent />
    </ProtectedRoute>
  );
}

