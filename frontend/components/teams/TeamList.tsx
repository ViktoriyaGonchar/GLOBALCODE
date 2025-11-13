'use client';

import { useState, useEffect } from 'react';
import { teamApi, Team } from '@/lib/api/team';
import { TeamCard } from './TeamCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function TeamList() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await teamApi.getTeams();
      if (response.success && response.data) {
        setTeams(response.data);
      } else {
        setError(response.error?.message || 'Ошибка загрузки команд');
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки команд');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Загрузка команд...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error}</p>
        <Button onClick={fetchTeams} className="mt-4">
          Попробовать снова
        </Button>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">У вас пока нет команд</p>
        <Link href="/teams/new">
          <Button>Создать команду</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {teams.map((team) => (
        <TeamCard key={team.id} team={team} />
      ))}
    </div>
  );
}

