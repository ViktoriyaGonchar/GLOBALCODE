'use client';

import { useAuthStore } from '@/lib/store/auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, isAuthenticated, logout, fetchCurrentUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token && !user) {
      fetchCurrentUser();
    }
  }, [user, fetchCurrentUser]);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center">
        <h1 className="text-4xl font-bold text-center mb-8">
          Добро пожаловать в GLOBALCODE
        </h1>
        <p className="text-center text-lg text-muted-foreground mb-8">
          Платформа для программистов: обучение, обмен проектами и коммуникация
        </p>

        {isAuthenticated && user ? (
          <div className="text-center space-y-4">
            <p className="text-lg">
              Привет, <span className="font-semibold">{user.username}</span>!
            </p>
            <p className="text-sm text-muted-foreground">
              Email: {user.email} | Репутация: {user.reputation} | Уровень: {user.level}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/projects">
                <Button>Проекты</Button>
              </Link>
              <Link href="/forum">
                <Button variant="outline">Форум</Button>
              </Link>
              <Link href="/messages">
                <Button variant="outline">Сообщения</Button>
              </Link>
              <Link href="/teams">
                <Button variant="outline">Команды</Button>
              </Link>
              <Link href="/courses">
                <Button variant="outline">Курсы</Button>
              </Link>
              <Link href="/videos">
                <Button variant="outline">Видеотека</Button>
              </Link>
              {user && (
                <Link href={`/profile/${user.id}`}>
                  <Button variant="outline">Профиль</Button>
                </Link>
              )}
              <Button onClick={handleLogout} variant="outline">
                Выйти
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-4 justify-center">
            <Link href="/auth/login">
              <Button>Войти</Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="outline">Зарегистрироваться</Button>
            </Link>
            <Link href="/projects">
              <Button variant="ghost">Проекты</Button>
            </Link>
            <Link href="/forum">
              <Button variant="ghost">Форум</Button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

