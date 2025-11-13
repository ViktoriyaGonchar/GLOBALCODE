import { apiClient, ApiResponse } from '../api';

export interface Course {
  id: string;
  title: string;
  description: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
    reputation?: number;
  };
  rating: number;
  enrolledUsers: number;
  isPublished: boolean;
  lessons?: Lesson[];
  enrollment?: CourseEnrollment;
  createdAt: string;
  updatedAt: string;
  _count?: {
    lessons: number;
    enrollments: number;
  };
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  content: string;
  type: 'VIDEO' | 'TEXT' | 'EXERCISE' | 'QUIZ';
  videoUrl?: string;
  order: number;
  duration: number;
  exercise?: Exercise;
  quiz?: Quiz;
  createdAt: string;
  updatedAt: string;
}

export interface Exercise {
  id: string;
  lessonId: string;
  description: string;
  starterCode: string;
  solution: string;
  tests: Array<{
    input: string;
    expectedOutput: string;
  }>;
}

export interface Quiz {
  id: string;
  lessonId: string;
  questions: Array<{
    id?: string;
    text: string;
    type: 'multiple-choice' | 'true-false' | 'code';
    options?: string[];
    correctAnswer: string | number;
  }>;
  passingScore: number;
}

export interface CourseEnrollment {
  id: string;
  userId: string;
  courseId: string;
  progress: number;
  enrolledAt: string;
  completedAt?: string;
}

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  course: {
    id: string;
    title: string;
    description: string;
  };
  verificationUrl: string;
  blockchainHash?: string;
  issuedAt: string;
}

export interface CreateCourseData {
  title: string;
  description: string;
  isPublished?: boolean;
}

export interface UpdateCourseData {
  title?: string;
  description?: string;
  isPublished?: boolean;
}

export interface CreateLessonData {
  title: string;
  content: string;
  type: 'VIDEO' | 'TEXT' | 'EXERCISE' | 'QUIZ';
  videoUrl?: string;
  order: number;
  duration?: number;
}

export interface SubmitExerciseData {
  code: string;
}

export interface SubmitQuizData {
  answers: Array<{
    questionId: string;
    answer: string | number;
  }>;
}

export interface CoursesResponse {
  courses: Course[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const courseApi = {
  getCourses: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    published?: boolean;
    author?: string;
  }): Promise<ApiResponse<CoursesResponse>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.published !== undefined) queryParams.append('published', params.published.toString());
    if (params?.author) queryParams.append('author', params.author);

    const query = queryParams.toString();
    return apiClient.get(`/courses${query ? `?${query}` : ''}`);
  },

  getCourse: async (id: string): Promise<ApiResponse<Course>> => {
    return apiClient.get(`/courses/${id}`);
  },

  createCourse: async (data: CreateCourseData): Promise<ApiResponse<Course>> => {
    return apiClient.post('/courses', data);
  },

  updateCourse: async (id: string, data: UpdateCourseData): Promise<ApiResponse<Course>> => {
    return apiClient.put(`/courses/${id}`, data);
  },

  deleteCourse: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.delete(`/courses/${id}`);
  },

  enroll: async (id: string): Promise<ApiResponse<CourseEnrollment>> => {
    return apiClient.post(`/courses/${id}/enroll`);
  },

  getProgress: async (id: string): Promise<ApiResponse<CourseEnrollment>> => {
    return apiClient.get(`/courses/${id}/progress`);
  },

  completeLesson: async (courseId: string, lessonId: string): Promise<ApiResponse<CourseEnrollment>> => {
    return apiClient.post(`/courses/${courseId}/lessons/${lessonId}/complete`);
  },

  getCertificates: async (): Promise<ApiResponse<Certificate[]>> => {
    return apiClient.get('/courses/user/certificates');
  },

  createLesson: async (courseId: string, data: CreateLessonData): Promise<ApiResponse<Lesson>> => {
    return apiClient.post(`/courses/${courseId}/lessons`, data);
  },

  updateLesson: async (lessonId: string, data: Partial<CreateLessonData>): Promise<ApiResponse<Lesson>> => {
    return apiClient.put(`/courses/lessons/${lessonId}`, data);
  },

  deleteLesson: async (lessonId: string): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.delete(`/courses/lessons/${lessonId}`);
  },

  submitExercise: async (lessonId: string, data: SubmitExerciseData): Promise<ApiResponse<any>> => {
    return apiClient.post(`/courses/lessons/${lessonId}/exercise/submit`, data);
  },

  submitQuiz: async (lessonId: string, data: SubmitQuizData): Promise<ApiResponse<any>> => {
    return apiClient.post(`/courses/lessons/${lessonId}/quiz/submit`, data);
  },
};

