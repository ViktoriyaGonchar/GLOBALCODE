'use client';

import Link from 'next/link';
import { Project } from '@/lib/api/project';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils/date';

interface ProjectCardProps {
  project: Project;
  onStar?: (id: string) => void;
  isStarred?: boolean;
}

export function ProjectCard({ project, onStar, isStarred }: ProjectCardProps) {
  return (
    <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Link href={`/projects/${project.id}`}>
            <h3 className="text-xl font-semibold hover:text-primary transition-colors">
              {project.title}
            </h3>
          </Link>
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <span>by {project.author.username}</span>
            <span>•</span>
            <span>{formatDate(project.createdAt)}</span>
          </div>
        </div>
        {onStar && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onStar(project.id)}
            className={isStarred ? 'text-yellow-500' : ''}
          >
            ⭐ {project.stars}
          </Button>
        )}
      </div>

      <p className="text-muted-foreground mb-4 line-clamp-3">
        {project.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {project.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="px-2 py-1 text-xs bg-secondary rounded-md"
            >
              {tag.tag}
            </span>
          ))}
          {project.tags.length > 3 && (
            <span className="px-2 py-1 text-xs text-muted-foreground">
              +{project.tags.length - 3}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>⭐ {project.stars}</span>
          <span>📥 {project.downloads}</span>
          <span>📦 {project.versions.length}</span>
        </div>
      </div>
    </div>
  );
}

