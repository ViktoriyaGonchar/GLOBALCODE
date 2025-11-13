import { Router } from 'express';
import { searchController } from '../controllers/search.controller';

const router = Router();

// Все маршруты публичные
router.get('/', searchController.globalSearch.bind(searchController));
router.get('/projects', searchController.searchProjects.bind(searchController));
router.get('/forum', searchController.searchForum.bind(searchController));
router.get('/users', searchController.searchUsers.bind(searchController));
router.get('/courses', searchController.searchCourses.bind(searchController));

export default router;

