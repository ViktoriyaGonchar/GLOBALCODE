'use client';

import { useState, useEffect } from 'react';
import { forumApi, ForumTopic } from '@/lib/api/forum';
import { TopicCard } from './TopicCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TopicListProps {
  categoryId?: string;
}

export function TopicList({ categoryId }: TopicListProps) {
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchTopics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await forumApi.getTopics({
        page,
        limit: 20,
        category: categoryId,
        search: search || undefined,
      });

      if (response.success && response.data) {
        setTopics(response.data.topics);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        setError(response.error?.message || 'Ошибка загрузки тем');
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки тем');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, [page, categoryId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTopics();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Загрузка тем...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error}</p>
        <Button onClick={fetchTopics} className="mt-4">
          Попробовать снова
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <Input
          type="text"
          placeholder="Поиск тем..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Button type="submit">Поиск</Button>
      </form>

      {topics.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Темы не найдены</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {topics.map((topic) => (
              <TopicCard key={topic.id} topic={topic} />
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
        </>
      )}
    </div>
  );
}

