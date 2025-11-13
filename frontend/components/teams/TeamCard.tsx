'use client';

import Link from 'next/link';
import { Team } from '@/lib/api/team';
import { formatRelativeTime } from '@/lib/utils/date';

interface TeamCardProps {
  team: Team;
}

export function TeamCard({ team }: TeamCardProps) {
  return (
    <Link href={`/teams/${team.id}`}>
      <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold hover:text-primary transition-colors mb-2">
              {team.name}
            </h3>
            {team.description && (
              <p className="text-muted-foreground mb-3 line-clamp-2">
                {team.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Владелец: {team.owner.username}</span>
              <span>•</span>
              <span>Обновлено {formatRelativeTime(team.updatedAt)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>👥 {team._count?.members || team.members.length} участников</span>
            <span>📁 {team._count?.projects || team.projects?.length || 0} проектов</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

