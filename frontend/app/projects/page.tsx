'use client';

import { ProjectList } from '@/components/projects/ProjectList';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth';

export default function ProjectsPage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Проекты</h1>
          <p className="text-muted-foreground">
            Исследуйте проекты сообщества разработчиков
          </p>
        </div>
        {isAuthenticated && (
          <Link href="/projects/new">
            <Button>Создать проект</Button>
          </Link>
        )}
      </div>

      <ProjectList />
    </div>
  );
}

