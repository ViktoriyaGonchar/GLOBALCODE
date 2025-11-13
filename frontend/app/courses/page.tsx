'use client';

import { CourseList } from '@/components/courses/CourseList';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth';

export default function CoursesPage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">CodeAcademy</h1>
          <p className="text-muted-foreground">
            Интерактивные курсы по программированию
          </p>
        </div>
        {isAuthenticated && (
          <Link href="/courses/new">
            <Button>Создать курс</Button>
          </Link>
        )}
      </div>

      <CourseList />
    </div>
  );
}

