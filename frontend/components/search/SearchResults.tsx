'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchApi } from '@/lib/api/search';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { TopicCard } from '@/components/forum/TopicCard';
import { CourseCard } from '@/components/courses/CourseCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [activeTab, setActiveTab] = useState<'all' | 'projects' | 'forum' | 'users' | 'courses'>('all');
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (query) {
      search();
    }
  }, [query, activeTab, page]);

  const search = async () => {
    if (!query || query.length < 2) return;

    setLoading(true);
    try {
      if (activeTab === 'all' || activeTab === 'projects') {
        const response = await searchApi.searchProjects(query, { page, limit: 10 });
        if (response.success && response.data) {
          setResults((prev: any) => ({ ...prev, projects: response.data }));
        }
      }

      if (activeTab === 'all' || activeTab === 'forum') {
        const response = await searchApi.searchForum(query, { page, limit: 10 });
        if (response.success && response.data) {
          setResults((prev: any) => ({ ...prev, topics: response.data }));
        }
      }

      if (activeTab === 'all' || activeTab === 'users') {
        const response = await searchApi.searchUsers(query, { page, limit: 10 });
        if (response.success && response.data) {
          setResults((prev: any) => ({ ...prev, users: response.data }));
        }
      }

      if (activeTab === 'all' || activeTab === 'courses') {
        const response = await searchApi.searchCourses(query, { page, limit: 10 });
        if (response.success && response.data) {
          setResults((prev: any) => ({ ...prev, courses: response.data }));
        }
      }
    } catch (err) {
      console.error('Error searching:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!query || query.length < 2) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Введите поисковый запрос</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b">
        <button
          onClick={() => {
            setActiveTab('all');
            setPage(1);
          }}
          className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
            activeTab === 'all'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Все
        </button>
        <button
          onClick={() => {
            setActiveTab('projects');
            setPage(1);
          }}
          className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
            activeTab === 'projects'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Проекты
        </button>
        <button
          onClick={() => {
            setActiveTab('forum');
            setPage(1);
          }}
          className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
            activeTab === 'forum'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Форум
        </button>
        <button
          onClick={() => {
            setActiveTab('users');
            setPage(1);
          }}
          className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Пользователи
        </button>
        <button
          onClick={() => {
            setActiveTab('courses');
            setPage(1);
          }}
          className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
            activeTab === 'courses'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Курсы
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {(activeTab === 'all' || activeTab === 'projects') && results.projects && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Проекты ({results.projects.pagination?.total || 0})
              </h2>
              {results.projects.projects?.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {results.projects.projects.map((project: any) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Проекты не найдены</p>
              )}
            </div>
          )}

          {(activeTab === 'all' || activeTab === 'forum') && results.topics && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Темы форума ({results.topics.pagination?.total || 0})
              </h2>
              {results.topics.topics?.length > 0 ? (
                <div className="space-y-4">
                  {results.topics.topics.map((topic: any) => (
                    <TopicCard key={topic.id} topic={topic} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Темы не найдены</p>
              )}
            </div>
          )}

          {(activeTab === 'all' || activeTab === 'users') && results.users && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Пользователи ({results.users.pagination?.total || 0})
              </h2>
              {results.users.users?.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {results.users.users.map((user: any) => (
                    <Link
                      key={user.id}
                      href={`/profile/${user.id}`}
                      className="p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.username}
                            className="w-12 h-12 rounded-full"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-semibold">
                              {user.username[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-semibold">{user.username}</p>
                          <p className="text-sm text-muted-foreground">
                            Уровень {user.level} • Репутация {user.reputation}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Пользователи не найдены</p>
              )}
            </div>
          )}

          {(activeTab === 'all' || activeTab === 'courses') && results.courses && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Курсы ({results.courses.pagination?.total || 0})
              </h2>
              {results.courses.courses?.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {results.courses.courses.map((course: any) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Курсы не найдены</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

