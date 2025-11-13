'use client';

import { useState, useEffect } from 'react';
import { messageApi, Conversation } from '@/lib/api/message';
import { ConversationItem } from './ConversationItem';
import { formatRelativeTime } from '@/lib/utils/date';

export function ConversationList({
  onSelectConversation,
  selectedId,
}: {
  onSelectConversation: (conversation: Conversation) => void;
  selectedId?: string;
}) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await messageApi.getConversations();
        if (response.success && response.data) {
          setConversations(response.data);
        } else {
          setError(response.error?.message || 'Ошибка загрузки бесед');
        }
      } catch (err: any) {
        setError(err.message || 'Ошибка загрузки бесед');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Нет бесед</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          isSelected={selectedId === conversation.id}
          onClick={() => onSelectConversation(conversation)}
        />
      ))}
    </div>
  );
}

