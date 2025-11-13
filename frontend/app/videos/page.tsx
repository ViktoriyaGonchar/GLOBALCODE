'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { VideoPlayer } from '@/components/videos/VideoPlayer';
import { VideoList } from '@/components/videos/VideoList';
import { videoApi, Video } from '@/lib/api/video';
import { Button } from '@/components/ui/button';

function VideosPageContent() {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadVideo = async (number: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await videoApi.getVideoByNumber(number);
      if (response.success && response.data) {
        setSelectedVideo(response.data);
      } else {
        setError(response.error?.message || 'Видео не найдено');
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки видео');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoChange = (number: number) => {
    loadVideo(number);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Видеотека</h1>
        <p className="text-muted-foreground">
          Просмотр видео из коллекции (1Video - 100Video)
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-card border rounded-lg p-4">
            <h2 className="font-semibold mb-4">Список видео</h2>
            <VideoList
              onSelectVideo={handleVideoChange}
              selectedNumber={selectedVideo?.number}
            />
          </div>
        </div>

        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex items-center justify-center h-[600px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Загрузка видео...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-card border rounded-lg p-8 text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => handleVideoChange(1)}>
                Загрузить первое видео
              </Button>
            </div>
          ) : selectedVideo ? (
            <div className="space-y-4">
              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-2">{selectedVideo.title}</h2>
                {selectedVideo.description && (
                  <p className="text-muted-foreground mb-4">{selectedVideo.description}</p>
                )}
              </div>
              <VideoPlayer video={selectedVideo} onVideoChange={handleVideoChange} />
            </div>
          ) : (
            <div className="bg-card border rounded-lg p-8 text-center">
              <p className="text-muted-foreground mb-4">
                Выберите видео из списка для просмотра
              </p>
              <Button onClick={() => handleVideoChange(1)}>
                Загрузить первое видео
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VideosPage() {
  return (
    <ProtectedRoute>
      <VideosPageContent />
    </ProtectedRoute>
  );
}

