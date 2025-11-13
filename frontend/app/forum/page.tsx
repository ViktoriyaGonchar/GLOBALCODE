'use client';

import { useState, useEffect } from 'react';
import { forumApi, ForumCategory } from '@/lib/api/forum';
import { TopicList } from '@/components/forum/TopicList';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth';

export default function ForumPage() {
  const { isAuthenticated } = useAuthStore();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await forumApi.getCategories();
        if (response.success && response.data) {
          setCategories(response.data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Форум</h1>
          <p className="text-muted-foreground">
            Обсуждения, вопросы и помощь от сообщества
          </p>
        </div>
        {isAuthenticated && (
          <Link href="/forum/topics/new">
            <Button>Создать тему</Button>
          </Link>
        )}
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-card border rounded-lg p-4">
            <h2 className="font-semibold mb-4">Категории</h2>
            {loading ? (
              <p className="text-sm text-muted-foreground">Загрузка...</p>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory(undefined)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    !selectedCategory
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                  }`}
                >
                  Все темы
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{category.name}</span>
                      <span className="text-xs opacity-70">
                        {category._count.topics}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          <TopicList categoryId={selectedCategory} />
        </div>
      </div>
    </div>
  );
}

