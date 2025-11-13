'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { teamApi, Team, TeamMember } from '@/lib/api/team';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/lib/utils/date';
import { useAuthStore } from '@/lib/store/auth';
import Link from 'next/link';

function TeamDetailPageContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await teamApi.getTeam(params.id as string);
        if (response.success && response.data) {
          setTeam(response.data);
        } else {
          setError(response.error?.message || 'Команда не найдена');
        }
      } catch (err: any) {
        setError(err.message || 'Ошибка загрузки команды');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchTeam();
    }
  }, [params.id]);

  const handleDelete = async () => {
    if (!team || !confirm('Вы уверены, что хотите удалить команду?')) return;

    try {
      await teamApi.deleteTeam(team.id);
      router.push('/teams');
    } catch (err) {
      console.error('Error deleting team:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Загрузка команды...</p>
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || 'Команда не найдена'}</p>
          <Link href="/teams">
            <Button>Вернуться к командам</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentMember = team.members.find((m) => m.userId === user?.id);
  const isOwner = team.ownerId === user?.id;
  const isAdmin = currentMember?.role === 'ADMIN' || isOwner;
  const canEdit = isAdmin;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/teams">
          <Button variant="ghost">← Назад к командам</Button>
        </Link>
      </div>

      <div className="bg-card border rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{team.name}</h1>
            {team.description && (
              <p className="text-muted-foreground mb-4">{team.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Владелец: {team.owner.username}</span>
              <span>•</span>
              <span>Создана {formatRelativeTime(team.createdAt)}</span>
            </div>
          </div>
          {canEdit && (
            <div className="flex gap-2">
              <Link href={`/teams/${team.id}/edit`}>
                <Button variant="outline">Редактировать</Button>
              </Link>
              {isOwner && (
                <Button variant="destructive" onClick={handleDelete}>
                  Удалить
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Участники ({team.members.length})</h2>
          <div className="space-y-3">
            {team.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 border rounded"
              >
                <div className="flex items-center gap-3">
                  {member.user.avatar ? (
                    <img
                      src={member.user.avatar}
                      alt={member.user.username}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold">
                        {member.user.username[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{member.user.username}</p>
                    <p className="text-sm text-muted-foreground">
                      {member.role === 'OWNER' && 'Владелец'}
                      {member.role === 'ADMIN' && 'Администратор'}
                      {member.role === 'MEMBER' && 'Участник'}
                    </p>
                  </div>
                </div>
                {isAdmin && member.userId !== team.ownerId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      if (confirm('Удалить участника из команды?')) {
                        try {
                          await teamApi.removeMember(team.id, member.userId);
                          const response = await teamApi.getTeam(team.id);
                          if (response.success && response.data) {
                            setTeam(response.data);
                          }
                        } catch (err) {
                          console.error('Error removing member:', err);
                        }
                      }
                    }}
                  >
                    Удалить
                  </Button>
                )}
              </div>
            ))}
          </div>
          {isAdmin && (
            <div className="mt-4">
              <Link href={`/teams/${team.id}/members/add`}>
                <Button variant="outline" className="w-full">
                  Добавить участника
                </Button>
              </Link>
            </div>
          )}
        </div>

        {team.projects && team.projects.length > 0 && (
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Проекты ({team.projects.length})</h2>
            <div className="space-y-3">
              {team.projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="block p-3 border rounded hover:bg-accent transition-colors"
                >
                  <p className="font-semibold">{project.title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TeamDetailPage() {
  return (
    <ProtectedRoute>
      <TeamDetailPageContent />
    </ProtectedRoute>
  );
}

