import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateProfileSchema } from '../validators/user.validator';

const router = Router();

// Публичные маршруты
router.get('/:id', userController.getUser.bind(userController));
router.get('/:id/stats', userController.getStats.bind(userController));
router.get('/:id/badges', userController.getBadges.bind(userController));
router.get('/:id/activity', userController.getActivity.bind(userController));
router.get('/:id/projects', userController.getProjects.bind(userController));
router.get('/:id/followers', userController.getFollowers.bind(userController));
router.get('/:id/following', userController.getFollowing.bind(userController));

// Защищённые маршруты
router.put(
  '/:id',
  authenticate,
  validate(updateProfileSchema),
  userController.updateProfile.bind(userController)
);

router.post(
  '/:id/follow',
  authenticate,
  userController.follow.bind(userController)
);

router.delete(
  '/:id/follow',
  authenticate,
  userController.unfollow.bind(userController)
);

export default router;

