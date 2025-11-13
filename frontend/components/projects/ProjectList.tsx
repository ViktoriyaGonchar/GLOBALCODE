'use client';

import { useState, useEffect } from 'react';
import { projectApi, Project } from '@/lib/api/project';
import { ProjectCard } from './ProjectCard';
import { Button } from '@/components/ui/button';

interface ProjectListProps {
  filters?: {
    search?: string;
    tags?: string[];
    author?: string;
    isPublic?: boolean;
  };
}

export function ProjectList({ filters }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await projectApi.getProjects({
        page,
        limit: 20,
        ...filters,
      });

      if (response.success && response.data) {
        setProjects(response.data.projects);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        setError(response.error?.message || 'Ошибка загрузки проектов');
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки проектов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [page, filters]);

  const handleStar = async (projectId: string) => {
    try {
      await projectApi.starProject(projectId);
      fetchProjects();
    } catch (err) {
      console.error('Error starring project:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Загрузка проектов...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error}</p>
        <Button onClick={fetchProjects} className="mt-4">
          Попробовать снова
        </Button>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Проекты не найдены</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onStar={handleStar}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Назад
          </Button>
          <span className="flex items-center px-4">
            Страница {page} из {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Вперёд
          </Button>
        </div>
      )}
    </div>
  );
}

