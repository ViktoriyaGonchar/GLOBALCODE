'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { userApi, User, UserStats, Badge } from '@/lib/api/user';
import { UserProfile } from '@/components/profile/UserProfile';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store/auth';
import Link from 'next/link';

export default function ProfilePage() {
  const params = useParams();
  const { user: currentUser } = useAuthStore();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'projects' | 'activity'>('projects');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userResponse, statsResponse, badgesResponse, projectsResponse] = await Promise.all([
          userApi.getUser(params.id as string),
          userApi.getStats(params.id as string),
          userApi.getBadges(params.id as string),
          userApi.getProjects(params.id as string),
        ]);

        if (userResponse.success && userResponse.data) {
          setUser(userResponse.data);
        }
        if (statsResponse.success && statsResponse.data) {
          setStats(statsResponse.data);
        }
        if (badgesResponse.success && badgesResponse.data) {
          setBadges(badgesResponse.data);
        }
        if (projectsResponse.success && projectsResponse.data) {
          setProjects(projectsResponse.data.projects);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-destructive mb-4">Пользователь не найден</p>
          <Link href="/">
            <Button>На главную</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === user.id;

  return (
    <div className="container mx-auto px-4 py-8">
      <UserProfile
        user={user}
        stats={stats || undefined}
        badges={badges}
        isOwnProfile={isOwnProfile}
      />

      {isOwnProfile && (
        <div className="mt-6">
          <Link href="/profile/settings">
            <Button variant="outline">Настройки профиля</Button>
          </Link>
        </div>
      )}

      <div className="mt-6">
        <div className="flex gap-4 border-b mb-6">
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
              activeTab === 'projects'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Проекты ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
              activeTab === 'activity'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Активность
          </button>
        </div>

        {activeTab === 'projects' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
            {projects.length === 0 && (
              <p className="text-muted-foreground">Нет проектов</p>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-4">
            <p className="text-muted-foreground">История активности будет здесь</p>
          </div>
        )}
      </div>
    </div>
  );
}

