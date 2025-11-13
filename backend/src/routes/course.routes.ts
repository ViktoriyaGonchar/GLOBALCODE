import { Router } from 'express';
import { courseController } from '../controllers/course.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createCourseSchema,
  updateCourseSchema,
  createLessonSchema,
  updateLessonSchema,
  createExerciseSchema,
  createQuizSchema,
  submitExerciseSchema,
  submitQuizSchema,
} from '../validators/course.validator';

const router = Router();

// Публичные маршруты
router.get('/', courseController.getCourses.bind(courseController));
router.get('/:id', courseController.getCourse.bind(courseController));

// Защищённые маршруты
router.post(
  '/',
  authenticate,
  validate(createCourseSchema),
  courseController.createCourse.bind(courseController)
);

router.put(
  '/:id',
  authenticate,
  validate(updateCourseSchema),
  courseController.updateCourse.bind(courseController)
);

router.delete(
  '/:id',
  authenticate,
  courseController.deleteCourse.bind(courseController)
);

router.post(
  '/:id/enroll',
  authenticate,
  courseController.enroll.bind(courseController)
);

router.get(
  '/:id/progress',
  authenticate,
  courseController.getProgress.bind(courseController)
);

router.post(
  '/:id/lessons/:lessonId/complete',
  authenticate,
  courseController.completeLesson.bind(courseController)
);

router.get(
  '/user/certificates',
  authenticate,
  courseController.getCertificates.bind(courseController)
);

// Управление уроками
router.post(
  '/:id/lessons',
  authenticate,
  validate(createLessonSchema),
  courseController.createLesson.bind(courseController)
);

router.put(
  '/lessons/:lessonId',
  authenticate,
  validate(updateLessonSchema),
  courseController.updateLesson.bind(courseController)
);

router.delete(
  '/lessons/:lessonId',
  authenticate,
  courseController.deleteLesson.bind(courseController)
);

// Упражнения и тесты
router.post(
  '/lessons/:lessonId/exercise',
  authenticate,
  validate(createExerciseSchema),
  courseController.createExercise.bind(courseController)
);

router.post(
  '/lessons/:lessonId/quiz',
  authenticate,
  validate(createQuizSchema),
  courseController.createQuiz.bind(courseController)
);

router.post(
  '/lessons/:lessonId/exercise/submit',
  authenticate,
  validate(submitExerciseSchema),
  courseController.submitExercise.bind(courseController)
);

router.post(
  '/lessons/:lessonId/quiz/submit',
  authenticate,
  validate(submitQuizSchema),
  courseController.submitQuiz.bind(courseController)
);

export default router;

