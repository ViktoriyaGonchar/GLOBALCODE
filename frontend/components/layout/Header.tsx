'use client';

import Link from 'next/link';
import { SearchBar } from '@/components/search/SearchBar';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store/auth';
import { useRouter } from 'next/navigation';

export function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className="border-b bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="text-2xl font-bold">
            GLOBALCODE
          </Link>

          <div className="flex-1 max-w-2xl">
            <SearchBar />
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && user ? (
              <>
                <NotificationBell />
                <Link href={`/profile/${user.id}`}>
                  <Button variant="ghost" size="sm">
                    {user.username}
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Войти
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Регистрация</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

