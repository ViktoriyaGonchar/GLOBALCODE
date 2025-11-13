import { prisma } from '../utils/prisma';
import {
  NotFoundError,
  AuthorizationError,
  ConflictError,
} from '../utils/errors';
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

export class CourseService {
  async getCourses(filters: {
    page?: number;
    limit?: number;
    search?: string;
    isPublished?: boolean;
    authorId?: string;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.isPublished !== undefined) {
      where.isPublished = filters.isPublished;
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
          _count: {
            select: {
              lessons: true,
              enrollments: true,
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

  async getCourseById(courseId: string, userId?: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
            reputation: true,
          },
        },
        lessons: {
          orderBy: { order: 'asc' },
          include: {
            exercise: true,
            quiz: true,
          },
        },
        _count: {
          select: {
            lessons: true,
            enrollments: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundError('Курс не найден');
    }

    // Проверка доступа для неопубликованных курсов
    if (!course.isPublished && course.authorId !== userId) {
      throw new AuthorizationError('Нет доступа к этому курсу');
    }

    // Если пользователь зарегистрирован, получаем его прогресс
    let enrollment = null;
    if (userId) {
      enrollment = await prisma.courseEnrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
      });
    }

    return {
      ...course,
      enrollment,
    };
  }

  async createCourse(userId: string, data: CreateCourseInput) {
    const course = await prisma.course.create({
      data: {
        title: data.title,
        description: data.description,
        authorId: userId,
        isPublished: data.isPublished,
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

    return course;
  }

  async updateCourse(courseId: string, userId: string, data: UpdateCourseInput) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundError('Курс не найден');
    }

    if (course.authorId !== userId) {
      throw new AuthorizationError('Только автор может редактировать курс');
    }

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: {
        title: data.title,
        description: data.description,
        isPublished: data.isPublished,
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

    return updated;
  }

  async deleteCourse(courseId: string, userId: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundError('Курс не найден');
    }

    if (course.authorId !== userId) {
      throw new AuthorizationError('Только автор может удалить курс');
    }

    await prisma.course.delete({
      where: { id: courseId },
    });

    return { message: 'Курс успешно удалён' };
  }

  async enrollInCourse(courseId: string, userId: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundError('Курс не найден');
    }

    if (!course.isPublished) {
      throw new AuthorizationError('Курс не опубликован');
    }

    // Проверка, не записан ли уже
    const existing = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existing) {
      throw new ConflictError('Вы уже записаны на этот курс');
    }

    const enrollment = await prisma.courseEnrollment.create({
      data: {
        userId,
        courseId,
        progress: 0,
      },
    });

    // Увеличиваем счётчик записанных
    await prisma.course.update({
      where: { id: courseId },
      data: {
        enrolledUsers: {
          increment: 1,
        },
      },
    });

    return enrollment;
  }

  async getProgress(courseId: string, userId: string) {
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundError('Вы не записаны на этот курс');
    }

    return enrollment;
  }

  async completeLesson(courseId: string, lessonId: string, userId: string) {
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      include: {
        course: {
          include: {
            lessons: true,
          },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundError('Вы не записаны на этот курс');
    }

    // Обновляем прогресс
    const totalLessons = enrollment.course.lessons.length;
    const completedLessons = Math.floor((enrollment.progress / 100) * totalLessons) + 1;
    const newProgress = Math.min(100, Math.round((completedLessons / totalLessons) * 100));

    const updated = await prisma.courseEnrollment.update({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      data: {
        progress: newProgress,
        completedAt: newProgress === 100 ? new Date() : null,
      },
    });

    // Если курс завершён, создаём сертификат
    if (newProgress === 100 && !enrollment.completedAt) {
      await this.generateCertificate(courseId, userId);
    }

    return updated;
  }

  async generateCertificate(courseId: string, userId: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundError('Курс не найден');
    }

    // Генерируем уникальный URL для верификации
    const verificationUrl = `certificate-${courseId}-${userId}-${Date.now()}`;

    const certificate = await prisma.certificate.create({
      data: {
        userId,
        courseId,
        verificationUrl,
      },
      include: {
        course: true,
      },
    });

    return certificate;
  }

  async getCertificates(userId: string) {
    const certificates = await prisma.certificate.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });

    return certificates;
  }

  async createLesson(courseId: string, userId: string, data: CreateLessonInput) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundError('Курс не найден');
    }

    if (course.authorId !== userId) {
      throw new AuthorizationError('Только автор может добавлять уроки');
    }

    const lesson = await prisma.lesson.create({
      data: {
        courseId,
        title: data.title,
        content: data.content,
        type: data.type,
        videoUrl: data.videoUrl,
        order: data.order,
        duration: data.duration,
      },
    });

    return lesson;
  }

  async updateLesson(lessonId: string, userId: string, data: UpdateLessonInput) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: true,
      },
    });

    if (!lesson) {
      throw new NotFoundError('Урок не найден');
    }

    if (lesson.course.authorId !== userId) {
      throw new AuthorizationError('Только автор может редактировать урок');
    }

    const updated = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        title: data.title,
        content: data.content,
        type: data.type,
        videoUrl: data.videoUrl,
        order: data.order,
        duration: data.duration,
      },
    });

    return updated;
  }

  async deleteLesson(lessonId: string, userId: string) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: true,
      },
    });

    if (!lesson) {
      throw new NotFoundError('Урок не найден');
    }

    if (lesson.course.authorId !== userId) {
      throw new AuthorizationError('Только автор может удалить урок');
    }

    await prisma.lesson.delete({
      where: { id: lessonId },
    });

    return { message: 'Урок успешно удалён' };
  }

  async createExercise(lessonId: string, userId: string, data: CreateExerciseInput) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: true,
      },
    });

    if (!lesson) {
      throw new NotFoundError('Урок не найден');
    }

    if (lesson.course.authorId !== userId) {
      throw new AuthorizationError('Только автор может создавать упражнения');
    }

    if (lesson.type !== 'EXERCISE') {
      throw new ConflictError('Урок должен быть типа EXERCISE');
    }

    const exercise = await prisma.exercise.create({
      data: {
        lessonId,
        description: data.description,
        starterCode: data.starterCode,
        solution: data.solution,
        tests: data.tests as any,
      },
    });

    return exercise;
  }

  async createQuiz(lessonId: string, userId: string, data: CreateQuizInput) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: true,
      },
    });

    if (!lesson) {
      throw new NotFoundError('Урок не найден');
    }

    if (lesson.course.authorId !== userId) {
      throw new AuthorizationError('Только автор может создавать тесты');
    }

    if (lesson.type !== 'QUIZ') {
      throw new ConflictError('Урок должен быть типа QUIZ');
    }

    const quiz = await prisma.quiz.create({
      data: {
        lessonId,
        questions: data.questions as any,
        passingScore: data.passingScore,
      },
    });

    return quiz;
  }

  async submitExercise(lessonId: string, userId: string, data: SubmitExerciseInput) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        exercise: true,
        course: true,
      },
    });

    if (!lesson || !lesson.exercise) {
      throw new NotFoundError('Упражнение не найдено');
    }

    // TODO: Реализовать выполнение кода в sandbox
    // Пока просто проверяем, что код отправлен
    const tests = lesson.exercise.tests as Array<{ input: string; expectedOutput: string }>;
    
    // Заглушка для проверки
    const results = {
      passed: 0,
      failed: 0,
      tests: tests.map((test) => ({
        input: test.input,
        expected: test.expectedOutput,
        actual: 'Not implemented', // TODO: Выполнить код
        passed: false,
      })),
    };

    return {
      success: results.passed === tests.length,
      results,
    };
  }

  async submitQuiz(lessonId: string, userId: string, data: SubmitQuizInput) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        quiz: true,
        course: true,
      },
    });

    if (!lesson || !lesson.quiz) {
      throw new NotFoundError('Тест не найден');
    }

    const questions = lesson.quiz.questions as Array<{
      id?: string;
      text: string;
      type: string;
      correctAnswer: string | number;
    }>;

    let correct = 0;
    const results = data.answers.map((answer) => {
      const question = questions.find((q, idx) => 
        q.id === answer.questionId || idx.toString() === answer.questionId
      );
      
      const isCorrect = question && 
        JSON.stringify(question.correctAnswer) === JSON.stringify(answer.answer);
      
      if (isCorrect) correct++;

      return {
        questionId: answer.questionId,
        correct: isCorrect,
        correctAnswer: question?.correctAnswer,
        userAnswer: answer.answer,
      };
    });

    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= lesson.quiz.passingScore;

    return {
      passed,
      score,
      correct,
      total: questions.length,
      results,
    };
  }
}

export const courseService = new CourseService();

