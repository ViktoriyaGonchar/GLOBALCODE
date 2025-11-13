import { prisma } from '../utils/prisma';
import {
  NotFoundError,
  AuthorizationError,
  ConflictError,
} from '../utils/errors';
import {
  CreateProjectInput,
  UpdateProjectInput,
  CreateVersionInput,
} from '../validators/project.validator';

export class ProjectService {
  async getProjects(filters: {
    page?: number;
    limit?: number;
    search?: string;
    tags?: string[];
    authorId?: string;
    isPublic?: boolean;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.isPublic !== undefined) {
      where.isPublic = filters.isPublic;
    }

    if (filters.authorId) {
      where.authorId = filters.authorId;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.tags && filters.tags.length > 0) {
      where.tags = {
        some: {
          tag: {
            in: filters.tags,
          },
        },
      };
    }

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
          versions: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
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

  async getProjectById(projectId: string, userId?: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
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
        tags: true,
        versions: {
          orderBy: { createdAt: 'desc' },
          include: {
            files: {
              orderBy: { path: 'asc' },
            },
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundError('Проект не найден');
    }

    // Проверка доступа
    if (!project.isPublic && project.authorId !== userId) {
      throw new AuthorizationError('Нет доступа к этому проекту');
    }

    return project;
  }

  async createProject(userId: string, data: CreateProjectInput) {
    const project = await prisma.project.create({
      data: {
        title: data.title,
        description: data.description,
        license: data.license,
        isPublic: data.isPublic,
        authorId: userId,
        tags: {
          create: data.tags?.map((tag) => ({ tag })),
        },
      },
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
    });

    return project;
  }

  async updateProject(projectId: string, userId: string, data: UpdateProjectInput) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundError('Проект не найден');
    }

    if (project.authorId !== userId) {
      throw new AuthorizationError('Только автор может редактировать проект');
    }

    // Обновление тегов
    if (data.tags !== undefined) {
      await prisma.projectTag.deleteMany({
        where: { projectId },
      });
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        title: data.title,
        description: data.description,
        license: data.license,
        isPublic: data.isPublic,
        tags: data.tags
          ? {
              create: data.tags.map((tag) => ({ tag })),
            }
          : undefined,
      },
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
    });

    return updatedProject;
  }

  async deleteProject(projectId: string, userId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundError('Проект не найден');
    }

    if (project.authorId !== userId) {
      throw new AuthorizationError('Только автор может удалить проект');
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    return { message: 'Проект успешно удалён' };
  }

  async createVersion(projectId: string, userId: string, data: CreateVersionInput) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundError('Проект не найден');
    }

    if (project.authorId !== userId) {
      throw new AuthorizationError('Только автор может создавать версии');
    }

    // Проверка уникальности версии
    const existingVersion = await prisma.projectVersion.findFirst({
      where: {
        projectId,
        version: data.version,
      },
    });

    if (existingVersion) {
      throw new ConflictError('Версия с таким номером уже существует');
    }

    const version = await prisma.projectVersion.create({
      data: {
        projectId,
        version: data.version,
        changelog: data.changelog,
      },
      include: {
        files: true,
      },
    });

    return version;
  }

  async getVersions(projectId: string) {
    const versions = await prisma.projectVersion.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            files: true,
          },
        },
      },
    });

    return versions;
  }

  async starProject(projectId: string, userId: string) {
    // В будущем можно добавить отдельную таблицу для звёзд
    // Пока просто увеличиваем счётчик
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundError('Проект не найден');
    }

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        stars: {
          increment: 1,
        },
      },
    });

    return updated;
  }

  async unstarProject(projectId: string, userId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundError('Проект не найден');
    }

    if (project.stars > 0) {
      const updated = await prisma.project.update({
        where: { id: projectId },
        data: {
          stars: {
            decrement: 1,
          },
        },
      });

      return updated;
    }

    return project;
  }

  async getProjectStats(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        _count: {
          select: {
            versions: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundError('Проект не найден');
    }

    return {
      stars: project.stars,
      downloads: project.downloads,
      versions: project._count.versions,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }
}

export const projectService = new ProjectService();

