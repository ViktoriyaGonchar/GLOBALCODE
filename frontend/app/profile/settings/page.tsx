'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/lib/store/auth';
import { userApi } from '@/lib/api/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';

function ProfileSettingsContent() {
  const { user, fetchCurrentUser } = useAuthStore();
  const router = useRouter();
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setBio(user.bio || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      await userApi.updateProfile(user.id, {
        username,
        bio,
        avatar,
      });
      await fetchCurrentUser();
      router.push(`/profile/${user.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Ошибка обновления профиля');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Настройки профиля</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="username" className="text-sm font-medium">
            Имя пользователя
          </label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="bio" className="text-sm font-medium">
            Биография
          </label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground">
            {bio.length}/500 символов
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="avatar" className="text-sm font-medium">
            URL аватара
          </label>
          <Input
            id="avatar"
            type="url"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            placeholder="https://example.com/avatar.jpg"
          />
          {avatar && (
            <img
              src={avatar}
              alt="Preview"
              className="w-24 h-24 rounded-full mt-2"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
        </div>

        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Сохранение...' : 'Сохранить изменения'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Отмена
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function ProfileSettingsPage() {
  return (
    <ProtectedRoute>
      <ProfileSettingsContent />
    </ProtectedRoute>
  );
}

