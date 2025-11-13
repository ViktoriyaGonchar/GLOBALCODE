'use client';

import { Conversation } from '@/lib/api/message';
import { formatRelativeTime } from '@/lib/utils/date';
import { useAuthStore } from '@/lib/store/auth';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

export function ConversationItem({
  conversation,
  isSelected,
  onClick,
}: ConversationItemProps) {
  const { user } = useAuthStore();

  // Для прямых сообщений показываем другого участника
  const otherParticipant =
    conversation.type === 'direct'
      ? conversation.participants.find((p) => p.id !== user?.id)
      : null;

  const displayName =
    conversation.type === 'direct'
      ? otherParticipant?.username || 'Неизвестный'
      : `Группа (${conversation.participants.length})`;

  const displayAvatar =
    conversation.type === 'direct'
      ? otherParticipant?.avatar
      : undefined;

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg cursor-pointer transition-colors ${
        isSelected
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-accent'
      }`}
    >
      <div className="flex items-center gap-3">
        {displayAvatar ? (
          <img
            src={displayAvatar}
            alt={displayName}
            className="w-12 h-12 rounded-full"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-semibold">
              {displayName[0].toUpperCase()}
            </span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="font-semibold truncate">{displayName}</p>
            {conversation.lastMessage && (
              <span className="text-xs opacity-70">
                {formatRelativeTime(conversation.lastMessage.createdAt)}
              </span>
            )}
          </div>
          {conversation.lastMessage && (
            <p
              className={`text-sm truncate ${
                isSelected ? 'opacity-90' : 'text-muted-foreground'
              }`}
            >
              {conversation.lastMessage.content}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

