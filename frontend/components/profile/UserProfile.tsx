'use client';

import { User, UserStats, Badge } from '@/lib/api/user';
import { formatDate } from '@/lib/utils/date';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store/auth';
import { userApi } from '@/lib/api/user';
import { useState } from 'react';

interface UserProfileProps {
  user: User;
  stats?: UserStats;
  badges?: Badge[];
  isOwnProfile?: boolean;
}

export function UserProfile({ user, stats, badges, isOwnProfile }: UserProfileProps) {
  const { user: currentUser } = useAuthStore();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      if (isFollowing) {
        await userApi.unfollow(user.id);
        setIsFollowing(false);
      } else {
        await userApi.follow(user.id);
        setIsFollowing(true);
      }
    } catch (err) {
      console.error('Error following user:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="flex items-start gap-6 mb-6">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.username}
            className="w-24 h-24 rounded-full"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-3xl font-semibold text-primary">
              {user.username[0].toUpperCase()}
            </span>
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold">{user.username}</h1>
              {user.bio && (
                <p className="text-muted-foreground mt-2">{user.bio}</p>
              )}
            </div>
            {!isOwnProfile && currentUser && (
              <Button
                onClick={handleFollow}
                disabled={loading}
                variant={isFollowing ? 'outline' : 'default'}
              >
                {isFollowing ? 'Отписаться' : 'Подписаться'}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Уровень {user.level}</span>
            <span>•</span>
            <span>Репутация: {user.reputation}</span>
            <span>•</span>
            <span>На платформе с {formatDate(user.createdAt)}</span>
          </div>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{stats.projects}</div>
            <div className="text-sm text-muted-foreground">Проектов</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{stats.forumPosts}</div>
            <div className="text-sm text-muted-foreground">Сообщений</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{stats.enrolledCourses}</div>
            <div className="text-sm text-muted-foreground">Курсов</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{stats.totalStars}</div>
            <div className="text-sm text-muted-foreground">Звёзд</div>
          </div>
        </div>
      )}

      {badges && badges.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Бейджи и достижения</h2>
          <div className="flex flex-wrap gap-3">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="flex items-center gap-2 p-3 border rounded-lg hover:bg-accent transition-colors"
                title={badge.description}
              >
                <span className="text-2xl">{badge.icon}</span>
                <div>
                  <p className="font-semibold">{badge.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(badge.earnedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

