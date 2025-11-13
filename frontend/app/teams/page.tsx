'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { TeamList } from '@/components/teams/TeamList';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function TeamsPageContent() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Команды</h1>
          <p className="text-muted-foreground">
            Управляйте командами и совместной работой над проектами
          </p>
        </div>
        <Link href="/teams/new">
          <Button>Создать команду</Button>
        </Link>
      </div>

      <TeamList />
    </div>
  );
}

export default function TeamsPage() {
  return (
    <ProtectedRoute>
      <TeamsPageContent />
    </ProtectedRoute>
  );
}

