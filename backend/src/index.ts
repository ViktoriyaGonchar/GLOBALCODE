import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';
import authRoutes from './routes/auth.routes.js';
import projectRoutes from './routes/project.routes.js';
import forumRoutes from './routes/forum.routes.js';
import messageRoutes from './routes/message.routes.js';
import teamRoutes from './routes/team.routes.js';
import courseRoutes from './routes/course.routes.js';
import videoRoutes from './routes/video.routes.js';
import userRoutes from './routes/user.routes.js';
import searchRoutes from './routes/search.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { setupMessageSocket } from './socket/message.socket.js';
import { setupNotificationSocket } from './socket/notification.socket.js';
import { sendError } from './utils/response.js';
import { AppError } from './utils/errors.js';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// Настройка WebSocket для сообщений
setupMessageSocket(server);
const notificationSocket = setupNotificationSocket(server);
import('./socket/notification.socket.js').then(({ setNotificationSocket }) => {
  if (notificationSocket) {
    setNotificationSocket(notificationSocket);
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.get('/api', (req, res) => {
  res.json({ message: 'GLOBALCODE API v1.0.0' });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Project routes
app.use('/api/projects', projectRoutes);

// Forum routes
app.use('/api/forum', forumRoutes);

// Message routes
app.use('/api/messages', messageRoutes);

// Team routes
app.use('/api/teams', teamRoutes);

// Course routes
app.use('/api/courses', courseRoutes);

// Video routes
app.use('/api/videos', videoRoutes);

// User routes
app.use('/api/users', userRoutes);

// Search routes
app.use('/api/search', searchRoutes);

// Notification routes
app.use('/api/notifications', notificationRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  if (err instanceof AppError) {
    return sendError(res, err);
  }
  
  // Неожиданные ошибки
  return sendError(res, err, 500);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: { 
      message: 'Route not found',
      code: 'NOT_FOUND'
    } 
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API available at http://localhost:${PORT}/api`);
  console.log(`💬 WebSocket available for real-time messages`);
});

