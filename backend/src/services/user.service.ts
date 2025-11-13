import { prisma } from '../utils/prisma';
import { NotFoundError, ConflictError, AuthorizationError } from '../utils/errors';
import { UpdateProfileInput } from '../validators/user.validator';

export class UserService {
  async getUserById(userId: string, currentUserId?: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: currentUserId === userId ? true : false, // Email только для своего профиля
        username: true,
        avatar: true,
        bio: true,
        reputation: true,
        level: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            projects: true,
            forumTopics: true,
            forumPosts: true,
            enrolledCourses: true,
            certificates: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }

    return user;
  }

  async updateProfile(userId: string, data: UpdateProfileInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }

    // Проверка уникальности username, если он изменяется
    if (data.username && data.username !== user.username) {
      const existing = await prisma.user.findUnique({
        where: { username: data.username },
      });

      if (existing) {
        throw new ConflictError('Пользователь с таким именем уже существует');
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        username: data.username,
        bio: data.bio,
        avatar: data.avatar,
      },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        bio: true,
        reputation: true,
        level: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  async getUserStats(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            projects: true,
            forumTopics: true,
            forumPosts: true,
            enrolledCourses: true,
            certificates: true,
            teams: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }

    // Подсчёт звёзд проектов
    const projects = await prisma.project.findMany({
      where: { authorId: userId },
      select: { stars: true },
    });
    const totalStars = projects.reduce((sum, p) => sum + p.stars, 0);

    return {
      projects: user._count.projects,
      forumTopics: user._count.forumTopics,
      forumPosts: user._count.forumPosts,
      enrolledCourses: user._count.enrolledCourses,
      certificates: user._count.certificates,
      teams: user._count.teams,
      totalStars,
      reputation: user.reputation,
      level: user.level,
    };
  }

  async getUserBadges(userId: string) {
    const badges = await prisma.userBadge.findMany({
      where: { userId },
      include: {
        badge: true,
      },
      orderBy: { earnedAt: 'desc' },
    });

    return badges.map((ub) => ({
      id: ub.badge.id,
      name: ub.badge.name,
      description: ub.badge.description,
      icon: ub.badge.icon,
      earnedAt: ub.earnedAt,
    }));
  }

  async getUserActivity(userId: string, limit: number = 20) {
    // Получаем последнюю активность пользователя
    const [projects, topics, posts, enrollments] = await Promise.all([
      prisma.project.findMany({
        where: { authorId: userId },
        select: {
          id: true,
          title: true,
          createdAt: true,
          type: 'project' as const,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.forumTopic.findMany({
        where: { authorId: userId },
        select: {
          id: true,
          title: true,
          createdAt: true,
          type: 'topic' as const,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.forumPost.findMany({
        where: { authorId: userId },
        select: {
          id: true,
          topicId: true,
          createdAt: true,
          type: 'post' as const,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.courseEnrollment.findMany({
        where: { userId },
        select: {
          id: true,
          courseId: true,
          enrolledAt: true,
          type: 'enrollment' as const,
        },
        orderBy: { enrolledAt: 'desc' },
        take: limit,
      }),
    ]);

    // Объединяем и сортируем по дате
    const activities = [
      ...projects.map((p) => ({ ...p, date: p.createdAt })),
      ...topics.map((t) => ({ ...t, date: t.createdAt })),
      ...posts.map((p) => ({ ...p, date: p.createdAt })),
      ...enrollments.map((e) => ({ ...e, date: e.enrolledAt })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);

    return activities;
  }

  async getUserProjects(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where: { authorId: userId },
        include: {
          tags: true,
          _count: {
            select: {
              versions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.project.count({ where: { authorId: userId } }),
    ]);

    return {
      projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async followUser(userId: string, targetUserId: string) {
    if (userId === targetUserId) {
      throw new ConflictError('Нельзя подписаться на самого себя');
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      throw new NotFoundError('Пользователь не найден');
    }

    // TODO: Реализовать таблицу подписок в базе данных
    // Пока возвращаем заглушку
    return { message: 'Подписка успешна' };
  }

  async unfollowUser(userId: string, targetUserId: string) {
    // TODO: Реализовать таблицу подписок в базе данных
    return { message: 'Отписка успешна' };
  }

  async getFollowers(userId: string) {
    // TODO: Реализовать таблицу подписок в базе данных
    return [];
  }

  async getFollowing(userId: string) {
    // TODO: Реализовать таблицу подписок в базе данных
    return [];
  }
}

export const userService = new UserService();

