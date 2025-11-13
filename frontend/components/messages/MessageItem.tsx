'use client';

import { Message } from '@/lib/api/message';
import { formatRelativeTime } from '@/lib/utils/date';

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
}

export function MessageItem({ message, isOwn }: MessageItemProps) {
  return (
    <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
      {!isOwn && (
        <div className="flex-shrink-0">
          {message.sender.avatar ? (
            <img
              src={message.sender.avatar}
              alt={message.sender.username}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-semibold text-primary">
                {message.sender.username[0].toUpperCase()}
              </span>
            </div>
          )}
        </div>
      )}

      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
        {!isOwn && (
          <span className="text-xs text-muted-foreground mb-1">
            {message.sender.username}
          </span>
        )}
        <div
          className={`rounded-lg px-4 py-2 ${
            isOwn
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted'
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <span className="text-xs text-muted-foreground mt-1">
          {formatRelativeTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
}

