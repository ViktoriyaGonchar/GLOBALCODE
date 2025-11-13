'use client';

import Link from 'next/link';
import { Course } from '@/lib/api/course';
import { formatRelativeTime } from '@/lib/utils/date';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.id}`}>
      <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold hover:text-primary transition-colors mb-2">
              {course.title}
            </h3>
            <p className="text-muted-foreground mb-3 line-clamp-2">
              {course.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Автор: {course.author.username}</span>
              <span>•</span>
              <span>{formatRelativeTime(course.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>⭐ {course.rating.toFixed(1)}</span>
            <span>📚 {course._count?.lessons || 0} уроков</span>
            <span>👥 {course.enrolledUsers} студентов</span>
          </div>
          {course.enrollment && (
            <div className="px-3 py-1 bg-primary/10 text-primary rounded text-sm">
              Прогресс: {course.enrollment.progress}%
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

