import { Router } from 'express';
import { videoController } from '../controllers/video.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createVideoSchema, updateVideoSchema, saveProgressSchema } from '../validators/video.validator';

const router = Router();

// Публичные маршруты
router.get('/', videoController.getVideos.bind(videoController));
router.get('/number/:number', videoController.getVideoByNumber.bind(videoController));
router.get('/:id', videoController.getVideo.bind(videoController));
router.get('/:id/stream', videoController.getStream.bind(videoController));
router.get('/:id/qualities', videoController.getQualities.bind(videoController));
router.get('/:id/subtitles', videoController.getSubtitles.bind(videoController));

// Защищённые маршруты
router.post(
  '/',
  authenticate,
  validate(createVideoSchema),
  videoController.createVideo.bind(videoController)
);

router.put(
  '/:id',
  authenticate,
  validate(updateVideoSchema),
  videoController.updateVideo.bind(videoController)
);

router.delete(
  '/:id',
  authenticate,
  videoController.deleteVideo.bind(videoController)
);

router.post(
  '/:id/progress',
  authenticate,
  validate(saveProgressSchema),
  videoController.saveProgress.bind(videoController)
);

router.get(
  '/:id/progress',
  authenticate,
  videoController.getProgress.bind(videoController)
);

router.get(
  '/user/playlist',
  authenticate,
  videoController.getPlaylist.bind(videoController)
);

router.post(
  '/:id/playlist',
  authenticate,
  videoController.addToPlaylist.bind(videoController)
);

export default router;

