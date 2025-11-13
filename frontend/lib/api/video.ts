import { apiClient, ApiResponse } from '../api';

export interface VideoQuality {
  quality: '360p' | '480p' | '720p' | '1080p';
  url: string;
}

export interface Video {
  id: string;
  title: string;
  description?: string;
  url: string;
  thumbnail: string;
  duration: number;
  number: number; // 1-100
  qualities: VideoQuality[];
  subtitles?: string;
  createdAt: string;
}

export interface VideoStream {
  url: string;
  quality: string;
}

export interface VideoProgress {
  currentTime: number;
  updatedAt?: string;
}

export interface CreateVideoData {
  title: string;
  description?: string;
  url: string;
  thumbnail?: string;
  duration: number;
  number: number;
  qualities: VideoQuality[];
  subtitles?: string;
}

export interface SaveProgressData {
  currentTime: number;
}

export interface VideosResponse {
  videos: Video[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const videoApi = {
  getVideos: async (params?: {
    page?: number;
    limit?: number;
    number?: number;
  }): Promise<ApiResponse<VideosResponse>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.number) queryParams.append('number', params.number.toString());

    const query = queryParams.toString();
    return apiClient.get(`/videos${query ? `?${query}` : ''}`);
  },

  getVideo: async (id: string): Promise<ApiResponse<Video>> => {
    return apiClient.get(`/videos/${id}`);
  },

  getVideoByNumber: async (number: number): Promise<ApiResponse<Video>> => {
    return apiClient.get(`/videos/number/${number}`);
  },

  getStream: async (
    id: string,
    quality?: '360p' | '480p' | '720p' | '1080p'
  ): Promise<ApiResponse<VideoStream>> => {
    const query = quality ? `?quality=${quality}` : '';
    return apiClient.get(`/videos/${id}/stream${query}`);
  },

  getQualities: async (id: string): Promise<ApiResponse<VideoQuality[]>> => {
    return apiClient.get(`/videos/${id}/qualities`);
  },

  getSubtitles: async (id: string): Promise<ApiResponse<{ subtitles: string | null }>> => {
    return apiClient.get(`/videos/${id}/subtitles`);
  },

  saveProgress: async (id: string, data: SaveProgressData): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.post(`/videos/${id}/progress`, data);
  },

  getProgress: async (id: string): Promise<ApiResponse<VideoProgress>> => {
    return apiClient.get(`/videos/${id}/progress`);
  },

  getPlaylist: async (): Promise<ApiResponse<Video[]>> => {
    return apiClient.get('/videos/user/playlist');
  },

  addToPlaylist: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.post(`/videos/${id}/playlist`);
  },
};

