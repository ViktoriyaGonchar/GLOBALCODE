import { prisma } from '../utils/prisma';
import { NotFoundError, AuthorizationError } from '../utils/errors';
import { UpdateUserInput, UpdateProjectInput, UpdateTopicInput, UpdateCourseInput } from '../validators/admin.validator';

export class AdminService {
  async getUsers(page: number = 1, limit: number = 20, filters?: {
    search?: string;
    role?: string;
    isBanned?: boolean;
  }) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.search) {
      where.OR = [
        { username: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.role) {
      where.role = filters.role;
    }

    if (filters?.isBanned !== undefined) {
      where.isBanned = filters.isBanned;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          username: true,
          avatar: true,
          role: true,
          isEmailVerified: true,
          isBanned: true,
          reputation: true,
          level: true,
          createdAt: true,
          _count: {
            select: {
              projects: true,
              forumTopics: true,
              forumPosts: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            projects: true,
            forumTopics: true,
            forumPosts: true,
            enrolledCourses: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }

    return user;
  }

  async updateUser(userId: string, data: UpdateUserInput) {
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
        throw new Error('Пользователь с таким именем уже существует');
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        username: data.username,
        role: data.role,
        isEmailVerified: data.isEmailVerified,
        isBanned: data.isBanned,
      },
    });

    return updated;
  }

  async deleteUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'Пользователь удалён' };
  }

  async getProjects(page: number = 1, limit: number = 20, filters?: {
    search?: string;
    isPublic?: boolean;
    isFeatured?: boolean;
  }) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.isPublic !== undefined) {
      where.isPublic = filters.isPublic;
    }

    if (filters?.isFeatured !== undefined) {
      where.isFeatured = filters.isFeatured;
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              username: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.project.count({ where }),
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

  async updateProject(projectId: string, data: UpdateProjectInput) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundError('Проект не найден');
    }

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        isPublic: data.isPublic,
        isFeatured: data.isFeatured,
      },
    });

    return updated;
  }

  async deleteProject(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundError('Проект не найден');
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    return { message: 'Проект удалён' };
  }

  async getTopics(page: number = 1, limit: number = 20, filters?: {
    search?: string;
    isLocked?: boolean;
    isPinned?: boolean;
  }) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.isLocked !== undefined) {
      where.isLocked = filters.isLocked;
    }

    if (filters?.isPinned !== undefined) {
      where.isPinned = filters.isPinned;
    }

    const [topics, total] = await Promise.all([
      prisma.forumTopic.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              username: true,
            },
          },
          category: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.forumTopic.count({ where }),
    ]);

    return {
      topics,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateTopic(topicId: string, data: UpdateTopicInput) {
    const topic = await prisma.forumTopic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      throw new NotFoundError('Тема не найдена');
    }

    const updated = await prisma.forumTopic.update({
      where: { id: topicId },
      data: {
        isLocked: data.isLocked,
        isPinned: data.isPinned,
      },
    });

    return updated;
  }

  async deleteTopic(topicId: string) {
    const topic = await prisma.forumTopic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      throw new NotFoundError('Тема не найдена');
    }

    await prisma.forumTopic.delete({
      where: { id: topicId },
    });

    return { message: 'Тема удалена' };
  }

  async getCourses(page: number = 1, limit: number = 20, filters?: {
    search?: string;
    isPublished?: boolean;
    isFeatured?: boolean;
  }) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.isPublished !== undefined) {
      where.isPublished = filters.isPublished;
    }

    if (filters?.isFeatured !== undefined) {
      where.isFeatured = filters.isFeatured;
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              username: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.course.count({ where }),
    ]);

    return {
      courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateCourse(courseId: string, data: UpdateCourseInput) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundError('Курс не найден');
    }

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: {
        isPublished: data.isPublished,
        isFeatured: data.isFeatured,
      },
    });

    return updated;
  }

  async deleteCourse(courseId: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundError('Курс не найден');
    }

    await prisma.course.delete({
      where: { id: courseId },
    });

    return { message: 'Курс удалён' };
  }

  async getStats() {
    const [
      totalUsers,
      totalProjects,
      totalTopics,
      totalCourses,
      totalMessages,
      activeUsers,
      bannedUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.forumTopic.count(),
      prisma.course.count(),
      prisma.message.count(),
      prisma.user.count({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Последние 30 дней
          },
        },
      }),
      prisma.user.count({
        where: { isBanned: true },
      }),
    ]);

    return {
      totalUsers,
      totalProjects,
      totalTopics,
      totalCourses,
      totalMessages,
      activeUsers,
      bannedUsers,
    };
  }
}

export const adminService = new AdminService();

