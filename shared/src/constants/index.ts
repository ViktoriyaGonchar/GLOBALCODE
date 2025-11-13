// Общие константы

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const ROUTES = {
  HOME: '/',
  PROJECTS: '/projects',
  FORUM: '/forum',
  COURSES: '/courses',
  VIDEOS: '/videos',
  TEAMS: '/teams',
  MESSAGES: '/messages',
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const;

export const FORUM_CATEGORIES = {
  LANGUAGES: 'languages',
  FRAMEWORKS: 'frameworks',
  CAREER: 'career',
  HACKATHONS: 'hackathons',
  OPEN_SOURCE: 'open-source',
  GENERAL: 'general',
} as const;

export const VIDEO_QUALITIES = ['360p', '480p', '720p', '1080p'] as const;

export const VIDEO_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

export const USER_ROLES = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
} as const;

export const TEAM_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
} as const;

export const PROJECT_LICENSES = [
  'MIT',
  'Apache-2.0',
  'GPL-3.0',
  'BSD-3-Clause',
  'Unlicense',
  'Other',
] as const;

