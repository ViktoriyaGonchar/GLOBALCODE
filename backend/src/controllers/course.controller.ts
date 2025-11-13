import { Request, Response } from 'express';
import { courseService } from '../services/course.service';
import { sendSuccess, sendError } from '../utils/response';
import {
  CreateCourseInput,
  UpdateCourseInput,
  CreateLessonInput,
  UpdateLessonInput,
  CreateExerciseInput,
  CreateQuizInput,
  SubmitExerciseInput,
  SubmitQuizInput,
} from '../validators/course.validator';

export class CourseController {
  async getCourses(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const isPublished = req.query.published !== undefined
        ? req.query.published === 'true'
        : true; // По умолчанию только опубликованные
      const authorId = req.query.author as string;

      const result = await courseService.getCourses({
        page,
        limit,
        search,
        isPublished,
        authorId,
      });

      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async getCourse(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      const course = await courseService.getCourseById(id, userId);
      return sendSuccess(res, course);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async createCourse(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const data = req.body as CreateCourseInput;
      const course = await courseService.createCourse(req.user.userId, data);
      return sendSuccess(res, course, 201);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async updateCourse(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const { id } = req.params;
      const data = req.body as UpdateCourseInput;
      const course = await courseService.updateCourse(id, req.user.userId, data);
      return sendSuccess(res, course);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async deleteCourse(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const { id } = req.params;
      const result = await courseService.deleteCourse(id, req.user.userId);
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async enroll(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const { id } = req.params;
      const enrollment = await courseService.enrollInCourse(id, req.user.userId);
      return sendSuccess(res, enrollment, 201);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async getProgress(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const { id } = req.params;
      const progress = await courseService.getProgress(id, req.user.userId);
      return sendSuccess(res, progress);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async completeLesson(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const { id, lessonId } = req.params;
      const progress = await courseService.completeLesson(id, lessonId, req.user.userId);
      return sendSuccess(res, progress);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async getCertificates(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const certificates = await courseService.getCertificates(req.user.userId);
      return sendSuccess(res, certificates);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async createLesson(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const { id } = req.params;
      const data = req.body as CreateLessonInput;
      const lesson = await courseService.createLesson(id, req.user.userId, data);
      return sendSuccess(res, lesson, 201);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async updateLesson(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const { lessonId } = req.params;
      const data = req.body as UpdateLessonInput;
      const lesson = await courseService.updateLesson(lessonId, req.user.userId, data);
      return sendSuccess(res, lesson);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async deleteLesson(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const { lessonId } = req.params;
      const result = await courseService.deleteLesson(lessonId, req.user.userId);
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async createExercise(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const { lessonId } = req.params;
      const data = req.body as CreateExerciseInput;
      const exercise = await courseService.createExercise(lessonId, req.user.userId, data);
      return sendSuccess(res, exercise, 201);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async createQuiz(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const { lessonId } = req.params;
      const data = req.body as CreateQuizInput;
      const quiz = await courseService.createQuiz(lessonId, req.user.userId, data);
      return sendSuccess(res, quiz, 201);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async submitExercise(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const { lessonId } = req.params;
      const data = req.body as SubmitExerciseInput;
      const result = await courseService.submitExercise(lessonId, req.user.userId, data);
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }

  async submitQuiz(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, new Error('Требуется аутентификация'), 401);
      }

      const { lessonId } = req.params;
      const data = req.body as SubmitQuizInput;
      const result = await courseService.submitQuiz(lessonId, req.user.userId, data);
      return sendSuccess(res, result);
    } catch (error) {
      return sendError(res, error as Error);
    }
  }
}

export const courseController = new CourseController();

