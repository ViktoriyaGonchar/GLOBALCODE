import { prisma } from '../utils/prisma';
import { NotFoundError, AuthorizationError } from '../utils/errors';
import { CreateVideoInput, UpdateVideoInput, SaveProgressInput } from '../validators/video.validator';

// В production это должно храниться в базе данных
const videoProgress = new Map<string, { userId: string; currentTime: number; updatedAt: Date }>();

export class VideoService {
  async getVideos(filters: {
    page?: number;
    limit?: number;
    number?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.number) {
      where.number = filters.number;
    }

    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where,
        orderBy: { number: 'asc' },
        skip,
        take: limit,
      }),
      prisma.video.count({ where }),
    ]);

    return {
      videos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getVideoById(videoId: string) {
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      throw new NotFoundError('Видео не найдено');
    }

    return video;
  }

  async getVideoByNumber(number: number) {
    const video = await prisma.video.findUnique({
      where: { number },
    });

    if (!video) {
      throw new NotFoundError(`Видео #${number} не найдено`);
    }

    return video;
  }

  async createVideo(data: CreateVideoInput) {
    // Проверка уникальности номера
    const existing = await prisma.video.findUnique({
      where: { number: data.number },
    });

    if (existing) {
      throw new Error(`Видео с номером ${data.number} уже существует`);
    }

    const video = await prisma.video.create({
      data: {
        title: data.title,
        description: data.description,
        url: data.url,
        thumbnail: data.thumbnail || '',
        duration: data.duration,
        number: data.number,
        qualities: data.qualities as any,
        subtitles: data.subtitles,
      },
    });

    return video;
  }

  async updateVideo(videoId: string, data: UpdateVideoInput) {
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      throw new NotFoundError('Видео не найдено');
    }

    const updated = await prisma.video.update({
      where: { id: videoId },
      data: {
        title: data.title,
        description: data.description,
        url: data.url,
        thumbnail: data.thumbnail,
        duration: data.duration,
        qualities: data.qualities as any,
        subtitles: data.subtitles,
      },
    });

    return updated;
  }

  async deleteVideo(videoId: string) {
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      throw new NotFoundError('Видео не найдено');
    }

    await prisma.video.delete({
      where: { id: videoId },
    });

    return { message: 'Видео успешно удалено' };
  }

  async getVideoStream(videoId: string, quality?: '360p' | '480p' | '720p' | '1080p') {
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      throw new NotFoundError('Видео не найдено');
    }

    const qualities = video.qualities as Array<{ quality: string; url: string }>;
    
    if (quality) {
      const qualityOption = qualities.find((q) => q.quality === quality);
      if (qualityOption) {
        return {
          url: qualityOption.url,
          quality: qualityOption.quality,
        };
      }
    }

    // Возвращаем лучшее доступное качество
    const sortedQualities = qualities.sort((a, b) => {
      const order = { '1080p': 4, '720p': 3, '480p': 2, '360p': 1 };
      return (order[b.quality as keyof typeof order] || 0) - (order[a.quality as keyof typeof order] || 0);
    });

    return {
      url: sortedQualities[0]?.url || video.url,
      quality: sortedQualities[0]?.quality || 'auto',
    };
  }

  async getQualities(videoId: string) {
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      throw new NotFoundError('Видео не найдено');
    }

    const qualities = video.qualities as Array<{ quality: string; url: string }>;
    return qualities;
  }

  async saveProgress(videoId: string, userId: string, data: SaveProgressInput) {
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      throw new NotFoundError('Видео не найдено');
    }

    // В production это должно храниться в базе данных
    const key = `${userId}-${videoId}`;
    videoProgress.set(key, {
      userId,
      currentTime: data.currentTime,
      updatedAt: new Date(),
    });

    return { message: 'Прогресс сохранён' };
  }

  async getProgress(videoId: string, userId: string) {
    const key = `${userId}-${videoId}`;
    const progress = videoProgress.get(key);

    if (!progress) {
      return { currentTime: 0 };
    }

    return {
      currentTime: progress.currentTime,
      updatedAt: progress.updatedAt,
    };
  }

  async getUserPlaylist(userId: string) {
    // В production это должно быть в базе данных
    // Пока возвращаем все видео
    const videos = await prisma.video.findMany({
      orderBy: { number: 'asc' },
    });

    return videos;
  }

  async addToPlaylist(videoId: string, userId: string) {
    // В production это должно быть в базе данных
    // Пока просто проверяем существование видео
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      throw new NotFoundError('Видео не найдено');
    }

    return { message: 'Видео добавлено в плейлист' };
  }
}

export const videoService = new VideoService();

