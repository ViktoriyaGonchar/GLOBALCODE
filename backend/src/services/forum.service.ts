import { prisma } from '../utils/prisma';
import {
  NotFoundError,
  AuthorizationError,
  ConflictError,
} from '../utils/errors';
import {
  CreateTopicInput,
  UpdateTopicInput,
  CreatePostInput,
  UpdatePostInput,
} from '../validators/forum.validator';

export class ForumService {
  async getCategories() {
    const categories = await prisma.forumCategory.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: {
            topics: true,
          },
        },
      },
    });

    return categories;
  }

  async getTopics(filters: {
    page?: number;
    limit?: number;
    categoryId?: string;
    search?: string;
    isPinned?: boolean;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.isPinned !== undefined) {
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
              avatar: true,
              reputation: true,
              level: true,
            },
          },
          category: true,
          _count: {
            select: {
              posts: true,
            },
          },
        },
        orderBy: [
          { isPinned: 'desc' },
          { createdAt: 'desc' },
        ],
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

  async getTopicById(topicId: string) {
    const topic = await prisma.forumTopic.findUnique({
      where: { id: topicId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
            reputation: true,
            level: true,
          },
        },
        category: true,
        attachments: {
          include: {
            project: {
              select: {
                id: true,
                title: true,
                description: true,
                author: {
                  select: {
                    id: true,
                    username: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    if (!topic) {
      throw new NotFoundError('Тема не найдена');
    }

    // Увеличиваем количество просмотров
    await prisma.forumTopic.update({
      where: { id: topicId },
      data: { views: { increment: 1 } },
    });

    return topic;
  }

  async createTopic(userId: string, data: CreateTopicInput) {
    // Проверка существования категории
    const category = await prisma.forumCategory.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new NotFoundError('Категория не найдена');
    }

    const topic = await prisma.forumTopic.create({
      data: {
        title: data.title,
        content: data.content,
        categoryId: data.categoryId,
        authorId: userId,
        attachments: data.attachedProjectIds
          ? {
              create: data.attachedProjectIds.map((projectId) => ({
                projectId,
              })),
            }
          : undefined,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
            reputation: true,
            level: true,
          },
        },
        category: true,
        attachments: {
          include: {
            project: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    return topic;
  }

  async updateTopic(topicId: string, userId: string, data: UpdateTopicInput) {
    const topic = await prisma.forumTopic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      throw new NotFoundError('Тема не найдена');
    }

    // Только автор или модератор может редактировать
    if (topic.authorId !== userId) {
      // TODO: Проверка роли модератора
      throw new AuthorizationError('Только автор может редактировать тему');
    }

    if (topic.isLocked) {
      throw new ConflictError('Тема заблокирована для редактирования');
    }

    const updatedTopic = await prisma.forumTopic.update({
      where: { id: topicId },
      data: {
        title: data.title,
        content: data.content,
        categoryId: data.categoryId,
        isLocked: data.isLocked,
        isPinned: data.isPinned,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        category: true,
      },
    });

    return updatedTopic;
  }

  async deleteTopic(topicId: string, userId: string) {
    const topic = await prisma.forumTopic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      throw new NotFoundError('Тема не найдена');
    }

    // Только автор или модератор может удалить
    if (topic.authorId !== userId) {
      // TODO: Проверка роли модератора
      throw new AuthorizationError('Только автор может удалить тему');
    }

    await prisma.forumTopic.delete({
      where: { id: topicId },
    });

    return { message: 'Тема успешно удалена' };
  }

  async getPosts(topicId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.forumPost.findMany({
        where: { topicId },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true,
              reputation: true,
              level: true,
            },
          },
          parent: {
            include: {
              author: {
                select: {
                  id: true,
                  username: true,
                },
              },
            },
          },
          replies: {
            include: {
              author: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                },
              },
            },
          },
          _count: {
            select: {
              replies: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      prisma.forumPost.count({ where: { topicId } }),
    ]);

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createPost(topicId: string, userId: string, data: CreatePostInput) {
    // Проверка существования темы
    const topic = await prisma.forumTopic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      throw new NotFoundError('Тема не найдена');
    }

    if (topic.isLocked) {
      throw new ConflictError('Тема заблокирована для новых сообщений');
    }

    // Если есть parentId, проверяем существование родительского сообщения
    if (data.parentId) {
      const parent = await prisma.forumPost.findUnique({
        where: { id: data.parentId },
      });

      if (!parent || parent.topicId !== topicId) {
        throw new NotFoundError('Родительское сообщение не найдено');
      }
    }

    const post = await prisma.forumPost.create({
      data: {
        content: data.content,
        topicId,
        authorId: userId,
        parentId: data.parentId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
            reputation: true,
            level: true,
          },
        },
        parent: data.parentId
          ? {
              include: {
                author: {
                  select: {
                    id: true,
                    username: true,
                  },
                },
              },
            }
          : undefined,
      },
    });

    return post;
  }

  async updatePost(postId: string, userId: string, data: UpdatePostInput) {
    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundError('Сообщение не найдено');
    }

    // Только автор может редактировать
    if (post.authorId !== userId) {
      throw new AuthorizationError('Только автор может редактировать сообщение');
    }

    const updatedPost = await prisma.forumPost.update({
      where: { id: postId },
      data: {
        content: data.content,
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
    });

    return updatedPost;
  }

  async deletePost(postId: string, userId: string) {
    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundError('Сообщение не найдено');
    }

    // Только автор или модератор может удалить
    if (post.authorId !== userId) {
      // TODO: Проверка роли модератора
      throw new AuthorizationError('Только автор может удалить сообщение');
    }

    await prisma.forumPost.delete({
      where: { id: postId },
    });

    return { message: 'Сообщение успешно удалено' };
  }

  async likePost(postId: string, userId: string) {
    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundError('Сообщение не найдено');
    }

    // В будущем можно добавить отдельную таблицу для лайков
    const updated = await prisma.forumPost.update({
      where: { id: postId },
      data: {
        likes: { increment: 1 },
      },
    });

    return updated;
  }

  async attachProject(topicId: string, projectId: string, userId: string) {
    const topic = await prisma.forumTopic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      throw new NotFoundError('Тема не найдена');
    }

    // Проверка прав на проект
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundError('Проект не найден');
    }

    if (!project.isPublic && project.authorId !== userId) {
      throw new AuthorizationError('Нет доступа к этому проекту');
    }

    // Проверка, не прикреплён ли уже проект
    const existing = await prisma.forumTopicAttachment.findUnique({
      where: {
        topicId_projectId: {
          topicId,
          projectId,
        },
      },
    });

    if (existing) {
      throw new ConflictError('Проект уже прикреплён к теме');
    }

    await prisma.forumTopicAttachment.create({
      data: {
        topicId,
        projectId,
      },
    });

    return { message: 'Проект успешно прикреплён' };
  }

  async getAttachedProjects(topicId: string) {
    const attachments = await prisma.forumTopicAttachment.findMany({
      where: { topicId },
      include: {
        project: {
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
        },
      },
    });

    return attachments.map((a) => a.project);
  }
}

export const forumService = new ForumService();

