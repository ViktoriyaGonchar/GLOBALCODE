'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { projectApi, Project } from '@/lib/api/project';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils/date';
import { useAuthStore } from '@/lib/store/auth';
import Link from 'next/link';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await projectApi.getProject(params.id as string);
        if (response.success && response.data) {
          setProject(response.data);
        } else {
          setError(response.error?.message || 'Проект не найден');
        }
      } catch (err: any) {
        setError(err.message || 'Ошибка загрузки проекта');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProject();
    }
  }, [params.id]);

  const handleStar = async () => {
    if (!project) return;
    try {
      await projectApi.starProject(project.id);
      const response = await projectApi.getProject(project.id);
      if (response.success && response.data) {
        setProject(response.data);
      }
    } catch (err) {
      console.error('Error starring project:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Загрузка проекта...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || 'Проект не найден'}</p>
          <Link href="/projects">
            <Button>Вернуться к проектам</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isAuthor = isAuthenticated && user?.id === project.authorId;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/projects">
          <Button variant="ghost">← Назад к проектам</Button>
        </Link>
      </div>

      <div className="bg-card border rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <span>by {project.author.username}</span>
              <span>•</span>
              <span>Создан {formatDate(project.createdAt)}</span>
              <span>•</span>
              <span>Лицензия: {project.license}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {isAuthenticated && (
              <Button variant="outline" onClick={handleStar}>
                ⭐ {project.stars}
              </Button>
            )}
            {isAuthor && (
              <Link href={`/projects/${project.id}/edit`}>
                <Button variant="outline">Редактировать</Button>
              </Link>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {project.tags.map((tag) => (
            <span
              key={tag.id}
              className="px-3 py-1 text-sm bg-secondary rounded-md"
            >
              {tag.tag}
            </span>
          ))}
        </div>

        <div className="prose max-w-none">
          <p className="text-muted-foreground whitespace-pre-wrap">
            {project.description}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">{project.stars}</div>
          <div className="text-sm text-muted-foreground">Звёзд</div>
        </div>
        <div className="bg-card border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">{project.downloads}</div>
          <div className="text-sm text-muted-foreground">Скачиваний</div>
        </div>
        <div className="bg-card border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">{project.versions.length}</div>
          <div className="text-sm text-muted-foreground">Версий</div>
        </div>
      </div>

      {project.versions.length > 0 && (
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Версии</h2>
          <div className="space-y-3">
            {project.versions.map((version) => (
              <div
                key={version.id}
                className="border rounded p-4 hover:bg-accent transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold">v{version.version}</span>
                    {version.changelog && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {version.changelog}
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(version.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

