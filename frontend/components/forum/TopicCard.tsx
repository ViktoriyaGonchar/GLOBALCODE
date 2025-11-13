'use client';

import Link from 'next/link';
import { ForumTopic } from '@/lib/api/forum';
import { formatRelativeTime } from '@/lib/utils/date';

interface TopicCardProps {
  topic: ForumTopic;
}

export function TopicCard({ topic }: TopicCardProps) {
  return (
    <Link href={`/forum/topics/${topic.id}`}>
      <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {topic.isPinned && (
                <span className="text-yellow-500" title="Закреплено">
                  📌
                </span>
              )}
              {topic.isLocked && (
                <span className="text-muted-foreground" title="Заблокировано">
                  🔒
                </span>
              )}
              <h3 className="text-xl font-semibold hover:text-primary transition-colors">
                {topic.title}
              </h3>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="px-2 py-1 bg-secondary rounded text-xs">
                {topic.category.name}
              </span>
              <span>by {topic.author.username}</span>
              <span>•</span>
              <span>{formatRelativeTime(topic.createdAt)}</span>
            </div>
          </div>
        </div>

        <p className="text-muted-foreground mb-4 line-clamp-2">
          {topic.content}
        </p>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>💬 {topic._count.posts} ответов</span>
            <span>👁️ {topic.views} просмотров</span>
            <span>👍 {topic.likes}</span>
          </div>
          {topic.author.avatar && (
            <img
              src={topic.author.avatar}
              alt={topic.author.username}
              className="w-6 h-6 rounded-full"
            />
          )}
        </div>
      </div>
    </Link>
  );
}

