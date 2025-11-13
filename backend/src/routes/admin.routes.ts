import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  updateUserSchema,
  updateProjectSchema,
  updateTopicSchema,
  updateCourseSchema,
} from '../validators/admin.validator';

const router = Router();

// Все маршруты требуют аутентификации и прав администратора
router.use(authenticate);
router.use(authorize('ADMIN'));

// Пользователи
router.get('/users', adminController.getUsers.bind(adminController));
router.get('/users/:id', adminController.getUser.bind(adminController));
router.put(
  '/users/:id',
  validate(updateUserSchema),
  adminController.updateUser.bind(adminController)
);
router.delete('/users/:id', adminController.deleteUser.bind(adminController));

// Проекты
router.get('/projects', adminController.getProjects.bind(adminController));
router.put(
  '/projects/:id',
  validate(updateProjectSchema),
  adminController.updateProject.bind(adminController)
);
router.delete('/projects/:id', adminController.deleteProject.bind(adminController));

// Темы форума
router.get('/topics', adminController.getTopics.bind(adminController));
router.put(
  '/topics/:id',
  validate(updateTopicSchema),
  adminController.updateTopic.bind(adminController)
);
router.delete('/topics/:id', adminController.deleteTopic.bind(adminController));

// Курсы
router.get('/courses', adminController.getCourses.bind(adminController));
router.put(
  '/courses/:id',
  validate(updateCourseSchema),
  adminController.updateCourse.bind(adminController)
);
router.delete('/courses/:id', adminController.deleteCourse.bind(adminController));

// Статистика
router.get('/stats', adminController.getStats.bind(adminController));

export default router;

