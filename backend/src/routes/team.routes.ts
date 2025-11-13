import { Router } from 'express';
import { teamController } from '../controllers/team.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createTeamSchema,
  updateTeamSchema,
  addMemberSchema,
  updateMemberRoleSchema,
} from '../validators/team.validator';

const router = Router();

// Все маршруты требуют аутентификации
router.use(authenticate);

router.get('/', teamController.getTeams.bind(teamController));
router.get('/:id', teamController.getTeam.bind(teamController));

router.post(
  '/',
  validate(createTeamSchema),
  teamController.createTeam.bind(teamController)
);

router.put(
  '/:id',
  validate(updateTeamSchema),
  teamController.updateTeam.bind(teamController)
);

router.delete('/:id', teamController.deleteTeam.bind(teamController));

router.get('/:id/members', teamController.getMembers.bind(teamController));

router.post(
  '/:id/members',
  validate(addMemberSchema),
  teamController.addMember.bind(teamController)
);

router.put(
  '/:id/members/:userId',
  validate(updateMemberRoleSchema),
  teamController.updateMemberRole.bind(teamController)
);

router.delete('/:id/members/:userId', teamController.removeMember.bind(teamController));

// Заглушки для будущей реализации
router.get('/:id/chat', teamController.getChat.bind(teamController));
router.get('/:id/files', teamController.getFiles.bind(teamController));
router.post('/:id/files', teamController.uploadFile.bind(teamController));
router.get('/:id/tasks', teamController.getTasks.bind(teamController));
router.post('/:id/tasks', teamController.createTask.bind(teamController));
router.put('/:id/tasks/:taskId', teamController.updateTask.bind(teamController));
router.delete('/:id/tasks/:taskId', teamController.deleteTask.bind(teamController));
router.get('/:id/calendar', teamController.getCalendar.bind(teamController));
router.post('/:id/events', teamController.createEvent.bind(teamController));

export default router;

