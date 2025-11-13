'use client';

import { ForumPost } from '@/lib/api/forum';
import { formatRelativeTime } from '@/lib/utils/date';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store/auth';
import { useState } from 'react';
import { forumApi } from '@/lib/api/forum';

interface PostCardProps {
  post: ForumPost;
  onReply?: (postId: string) => void;
  onUpdate?: () => void;
}

export function PostCard({ post, onReply, onUpdate }: PostCardProps) {
  const { isAuthenticated, user } = useAuthStore();
  const [isLiking, setIsLiking] = useState(false);
  const isAuthor = isAuthenticated && user?.id === post.authorId;

  const handleLike = async () => {
    if (!isAuthenticated || isLiking) return;
    setIsLiking(true);
    try {
      await forumApi.likePost(post.id);
      onUpdate?.();
    } catch (err) {
      console.error('Error liking post:', err);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className="border rounded-lg p-6 mb-4">
      {post.parent && (
        <div className="mb-4 p-3 bg-muted rounded border-l-4 border-primary">
          <p className="text-sm text-muted-foreground mb-1">
            Ответ на сообщение от {post.parent.author.username}:
          </p>
          <p className="text-sm line-clamp-2">{post.parent.content}</p>
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {post.author.avatar ? (
            <img
              src={post.author.avatar}
              alt={post.author.username}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-semibold">
                {post.author.username[0].toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{post.author.username}</span>
              <span className="text-xs text-muted-foreground">
                Уровень {post.author.level} • Репутация {post.author.reputation}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {formatRelativeTime(post.createdAt)}
            </span>
          </div>

          <div className="prose max-w-none mb-4">
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  disabled={isLiking}
                >
                  👍 {post.likes}
                </Button>
                {!isAuthor && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReply?.(post.id)}
                  >
                    Ответить
                  </Button>
                )}
              </>
            )}
            {isAuthor && (
              <span className="text-xs text-muted-foreground">Ваше сообщение</span>
            )}
          </div>

          {post.replies && post.replies.length > 0 && (
            <div className="mt-4 ml-8 space-y-2 border-l-2 pl-4">
              {post.replies.map((reply) => (
                <PostCard
                  key={reply.id}
                  post={reply}
                  onReply={onReply}
                  onUpdate={onUpdate}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

