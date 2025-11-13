// Общие типы данных

export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  bio?: string;
  reputation: number;
  level: number;
  badges: Badge[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  authorId: string;
  author: User;
  isPublic: boolean;
  license: string;
  tags: string[];
  stars: number;
  downloads: number;
  versions: ProjectVersion[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectVersion {
  id: string;
  projectId: string;
  version: string;
  changelog: string;
  files: ProjectFile[];
  createdAt: Date;
}

export interface ProjectFile {
  id: string;
  path: string;
  content?: string;
  size: number;
  type: 'file' | 'directory';
}

export interface ForumTopic {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author: User;
  categoryId: string;
  category: ForumCategory;
  posts: ForumPost[];
  attachedProjects: Project[];
  views: number;
  likes: number;
  isLocked: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface ForumPost {
  id: string;
  content: string;
  authorId: string;
  author: User;
  topicId: string;
  parentId?: string;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: User;
  conversationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  participants: User[];
  messages: Message[];
  lastMessage?: Message;
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  members: TeamMember[];
  projects: Project[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  userId: string;
  user: User;
  teamId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  authorId: string;
  author: User;
  lessons: Lesson[];
  enrolledUsers: number;
  rating: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  content: string;
  type: 'video' | 'text' | 'exercise' | 'quiz';
  videoUrl?: string;
  exercise?: Exercise;
  quiz?: Quiz;
  order: number;
  duration: number;
}

export interface Exercise {
  id: string;
  description: string;
  starterCode: string;
  solution: string;
  tests: TestCase[];
}

export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface Quiz {
  id: string;
  questions: Question[];
  passingScore: number;
}

export interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'code';
  options?: string[];
  correctAnswer: string | number;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  duration: number;
  qualities: VideoQuality[];
  subtitles?: string;
  number: number; // 1-100
  createdAt: Date;
}

export interface VideoQuality {
  quality: '360p' | '480p' | '720p' | '1080p';
  url: string;
}

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  course: Course;
  issuedAt: Date;
  verificationUrl: string;
  blockchainHash?: string;
}

