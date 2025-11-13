'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { adminApi, AdminStats } from '@/lib/api/admin';
import { useAuthStore } from '@/lib/store/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function AdminPageContent() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверка прав администратора
    if (user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    fetchStats();
  }, [user, router]);

  const fetchStats = async () => {
    try {
      const response = await adminApi.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Панель администратора</h1>
        <p className="text-muted-foreground">Управление платформой</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Всего пользователей</h3>
          <p className="text-3xl font-bold">{stats.totalUsers}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Активных: {stats.activeUsers} • Заблокированных: {stats.bannedUsers}
          </p>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Проектов</h3>
          <p className="text-3xl font-bold">{stats.totalProjects}</p>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Тем форума</h3>
          <p className="text-3xl font-bold">{stats.totalTopics}</p>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Курсов</h3>
          <p className="text-3xl font-bold">{stats.totalCourses}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/admin/users">
          <div className="bg-card border rounded-lg p-6 hover:bg-accent transition-colors cursor-pointer">
            <h3 className="font-semibold mb-2">👥 Пользователи</h3>
            <p className="text-sm text-muted-foreground">Управление пользователями</p>
          </div>
        </Link>

        <Link href="/admin/projects">
          <div className="bg-card border rounded-lg p-6 hover:bg-accent transition-colors cursor-pointer">
            <h3 className="font-semibold mb-2">📁 Проекты</h3>
            <p className="text-sm text-muted-foreground">Управление проектами</p>
          </div>
        </Link>

        <Link href="/admin/topics">
          <div className="bg-card border rounded-lg p-6 hover:bg-accent transition-colors cursor-pointer">
            <h3 className="font-semibold mb-2">💬 Темы форума</h3>
            <p className="text-sm text-muted-foreground">Модерация форума</p>
          </div>
        </Link>

        <Link href="/admin/courses">
          <div className="bg-card border rounded-lg p-6 hover:bg-accent transition-colors cursor-pointer">
            <h3 className="font-semibold mb-2">📚 Курсы</h3>
            <p className="text-sm text-muted-foreground">Управление курсами</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <AdminPageContent />
    </ProtectedRoute>
  );
}

