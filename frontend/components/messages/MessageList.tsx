'use client';

import { useEffect, useRef } from 'react';
import { Message } from '@/lib/api/message';
import { MessageItem } from './MessageItem';
import { useAuthStore } from '@/lib/store/auth';

interface MessageListProps {
  messages: Message[];
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function MessageList({ messages, onLoadMore, hasMore }: MessageListProps) {
  const { user } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleScroll = () => {
    if (!containerRef.current || !onLoadMore || !hasMore) return;

    const { scrollTop } = containerRef.current;
    if (scrollTop < 100) {
      onLoadMore();
    }
  };

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Нет сообщений. Начните беседу!</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 space-y-4"
    >
      {hasMore && (
        <div className="text-center text-sm text-muted-foreground">
          Загрузка предыдущих сообщений...
        </div>
      )}
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          isOwn={message.senderId === user?.id}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

