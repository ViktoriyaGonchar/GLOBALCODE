import { Router } from 'express';
import { projectController } from '../controllers/project.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createProjectSchema,
  updateProjectSchema,
  createVersionSchema,
} from '../validators/project.validator';

const router = Router();

// Публичные маршруты
router.get('/', projectController.getProjects.bind(projectController));
router.get('/:id', projectController.getProject.bind(projectController));
router.get('/:id/versions', projectController.getVersions.bind(projectController));
router.get('/:id/stats', projectController.getStats.bind(projectController));

// Защищённые маршруты
router.post(
  '/',
  authenticate,
  validate(createProjectSchema),
  projectController.createProject.bind(projectController)
);

router.put(
  '/:id',
  authenticate,
  validate(updateProjectSchema),
  projectController.updateProject.bind(projectController)
);

router.delete(
  '/:id',
  authenticate,
  projectController.deleteProject.bind(projectController)
);

router.post(
  '/:id/version',
  authenticate,
  validate(createVersionSchema),
  projectController.createVersion.bind(projectController)
);

router.post(
  '/:id/star',
  authenticate,
  projectController.starProject.bind(projectController)
);

router.delete(
  '/:id/star',
  authenticate,
  projectController.unstarProject.bind(projectController)
);

// Заглушки для будущей реализации
router.post('/:id/upload', authenticate, projectController.uploadFiles.bind(projectController));
router.get('/:id/files', projectController.getFiles.bind(projectController));
router.get('/:id/file/:path', projectController.getFile.bind(projectController));
router.get('/:id/preview', projectController.getPreview.bind(projectController));
router.post('/:id/run', authenticate, projectController.runDemo.bind(projectController));
router.put('/:id/access', authenticate, projectController.updateAccess.bind(projectController));
router.post('/:id/invite', authenticate, projectController.inviteUser.bind(projectController));
router.post('/:id/git-import', authenticate, projectController.importFromGit.bind(projectController));

export default router;

