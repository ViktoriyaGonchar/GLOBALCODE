import { prisma } from '../utils/prisma';

export interface SearchResult {
  type: 'project' | 'topic' | 'user' | 'course';
  id: string;
  title: string;
  description?: string;
  author?: {
    id: string;
    username: string;
    avatar?: string;
  };
  url: string;
  relevance?: number;
}

export class SearchService {
  async globalSearch(query: string, limit: number = 20): Promise<SearchResult[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchTerm = query.trim();
    const results: SearchResult[] = [];

    // Поиск проектов
    const projects = await prisma.project.findMany({
      where: {
        isPublic: true,
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
      take: limit,
      orderBy: { stars: 'desc' },
    });

    results.push(
      ...projects.map((project) => ({
        type: 'project' as const,
        id: project.id,
        title: project.title,
        description: project.description,
        author: project.author,
        url: `/projects/${project.id}`,
      }))
    );

    // Поиск тем форума
    const topics = await prisma.forumTopic.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { content: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    results.push(
      ...topics.map((topic) => ({
        type: 'topic' as const,
        id: topic.id,
        title: topic.title,
        description: topic.content.substring(0, 200),
        author: topic.author,
        url: `/forum/topics/${topic.id}`,
      }))
    );

    // Поиск пользователей
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: searchTerm, mode: 'insensitive' } },
          { bio: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        username: true,
        avatar: true,
        bio: true,
      },
      take: limit,
      orderBy: { reputation: 'desc' },
    });

    results.push(
      ...users.map((user) => ({
        type: 'user' as const,
        id: user.id,
        title: user.username,
        description: user.bio || undefined,
        author: {
          id: user.id,
          username: user.username,
          avatar: user.avatar || undefined,
        },
        url: `/profile/${user.id}`,
      }))
    );

    // Поиск курсов
    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
      take: limit,
      orderBy: { rating: 'desc' },
    });

    results.push(
      ...courses.map((course) => ({
        type: 'course' as const,
        id: course.id,
        title: course.title,
        description: course.description,
        author: course.author,
        url: `/courses/${course.id}`,
      }))
    );

    // Сортируем по релевантности (можно улучшить алгоритм)
    return results.slice(0, limit);
  }

  async searchProjects(query: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const where: any = {
      isPublic: true,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    };

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          tags: true,
        },
        orderBy: { stars: 'desc' },
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

  async searchForum(query: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const where: any = {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
      ],
    };

    const [topics, total] = await Promise.all([
      prisma.forumTopic.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          category: true,
          _count: {
            select: {
              posts: true,
            },
          },
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

  async searchUsers(query: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const where: any = {
      OR: [
        { username: { contains: query, mode: 'insensitive' } },
        { bio: { contains: query, mode: 'insensitive' } },
      ],
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          avatar: true,
          bio: true,
          reputation: true,
          level: true,
        },
        orderBy: { reputation: 'desc' },
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

  async searchCourses(query: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const where: any = {
      isPublished: true,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    };

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
        orderBy: { rating: 'desc' },
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
}

export const searchService = new SearchService();

