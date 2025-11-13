import { Router } from 'express';
import { forumController } from '../controllers/forum.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createTopicSchema,
  updateTopicSchema,
  createPostSchema,
  updatePostSchema,
  reportPostSchema,
} from '../validators/forum.validator';

const router = Router();

// Публичные маршруты
router.get('/categories', forumController.getCategories.bind(forumController));
router.get('/topics', forumController.getTopics.bind(forumController));
router.get('/topics/:id', forumController.getTopic.bind(forumController));
router.get('/topics/:id/posts', forumController.getPosts.bind(forumController));
router.get('/topics/:id/attached-projects', forumController.getAttachedProjects.bind(forumController));

// Защищённые маршруты
router.post(
  '/topics',
  authenticate,
  validate(createTopicSchema),
  forumController.createTopic.bind(forumController)
);

router.put(
  '/topics/:id',
  authenticate,
  validate(updateTopicSchema),
  forumController.updateTopic.bind(forumController)
);

router.delete(
  '/topics/:id',
  authenticate,
  forumController.deleteTopic.bind(forumController)
);

router.post(
  '/topics/:id/posts',
  authenticate,
  validate(createPostSchema),
  forumController.createPost.bind(forumController)
);

router.put(
  '/posts/:id',
  authenticate,
  validate(updatePostSchema),
  forumController.updatePost.bind(forumController)
);

router.delete(
  '/posts/:id',
  authenticate,
  forumController.deletePost.bind(forumController)
);

router.post(
  '/posts/:id/like',
  authenticate,
  forumController.likePost.bind(forumController)
);

router.post(
  '/topics/:id/attach-project',
  authenticate,
  forumController.attachProject.bind(forumController)
);

router.post(
  '/posts/:id/report',
  authenticate,
  validate(reportPostSchema),
  forumController.reportPost.bind(forumController)
);

export default router;

