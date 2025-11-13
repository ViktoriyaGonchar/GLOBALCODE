'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { courseApi, Course, Lesson } from '@/lib/api/course';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/lib/utils/date';
import { useAuthStore } from '@/lib/store/auth';
import Link from 'next/link';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await courseApi.getCourse(params.id as string);
        if (response.success && response.data) {
          setCourse(response.data);
        } else {
          setError(response.error?.message || 'Курс не найден');
        }
      } catch (err: any) {
        setError(err.message || 'Ошибка загрузки курса');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCourse();
    }
  }, [params.id]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    try {
      await courseApi.enroll(course!.id);
      const response = await courseApi.getCourse(course!.id);
      if (response.success && response.data) {
        setCourse(response.data);
      }
    } catch (err) {
      console.error('Error enrolling:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Загрузка курса...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || 'Курс не найден'}</p>
          <Link href="/courses">
            <Button>Вернуться к курсам</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isAuthor = isAuthenticated && user?.id === course.authorId;
  const isEnrolled = !!course.enrollment;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/courses">
          <Button variant="ghost">← Назад к курсам</Button>
        </Link>
      </div>

      <div className="bg-card border rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
            <p className="text-muted-foreground mb-4">{course.description}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Автор: {course.author.username}</span>
              <span>•</span>
              <span>⭐ {course.rating.toFixed(1)}</span>
              <span>•</span>
              <span>👥 {course.enrolledUsers} студентов</span>
            </div>
          </div>
          <div className="flex gap-2">
            {isAuthor ? (
              <Link href={`/courses/${course.id}/edit`}>
                <Button variant="outline">Редактировать</Button>
              </Link>
            ) : isEnrolled ? (
              <Link href={`/courses/${course.id}/learn`}>
                <Button>Продолжить обучение</Button>
              </Link>
            ) : (
              <Button onClick={handleEnroll}>Записаться на курс</Button>
            )}
          </div>
        </div>

        {course.enrollment && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Прогресс</span>
              <span className="text-sm text-muted-foreground">
                {course.enrollment.progress}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${course.enrollment.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {course.lessons && course.lessons.length > 0 && (
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Уроки ({course.lessons.length})
          </h2>
          <div className="space-y-2">
            {course.lessons.map((lesson, index) => (
              <Link
                key={lesson.id}
                href={`/courses/${course.id}/lessons/${lesson.id}`}
                className="block p-4 border rounded hover:bg-accent transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">
                      {index + 1}. {lesson.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {lesson.type === 'VIDEO' && '📹 Видео'}
                      {lesson.type === 'TEXT' && '📄 Текст'}
                      {lesson.type === 'EXERCISE' && '💻 Упражнение'}
                      {lesson.type === 'QUIZ' && '❓ Тест'}
                      {lesson.duration > 0 && ` • ${Math.floor(lesson.duration / 60)} мин`}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

