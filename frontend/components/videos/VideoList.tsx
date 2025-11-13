'use client';

import { useState, useEffect } from 'react';
import { videoApi, Video } from '@/lib/api/video';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface VideoListProps {
  onSelectVideo: (videoNumber: number) => void;
  selectedNumber?: number;
}

export function VideoList({ onSelectVideo, selectedNumber }: VideoListProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchNumber, setSearchNumber] = useState('');

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const response = await videoApi.getVideos({ limit: 100 });
      if (response.success && response.data) {
        setVideos(response.data.videos);
      }
    } catch (err) {
      console.error('Error fetching videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(searchNumber);
    if (num >= 1 && num <= 100) {
      onSelectVideo(num);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <Input
          type="number"
          min="1"
          max="100"
          placeholder="Номер видео (1-100)"
          value={searchNumber}
          onChange={(e) => setSearchNumber(e.target.value)}
          className="flex-1"
        />
        <Button type="submit">Загрузить</Button>
      </form>

      <div className="grid grid-cols-5 gap-2 max-h-[600px] overflow-y-auto">
        {Array.from({ length: 100 }, (_, i) => i + 1).map((num) => {
          const video = videos.find((v) => v.number === num);
          return (
            <button
              key={num}
              onClick={() => onSelectVideo(num)}
              className={`p-3 border rounded text-center transition-colors ${
                selectedNumber === num
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
            >
              <div className="font-semibold">#{num}</div>
              {video && (
                <div className="text-xs mt-1 truncate">{video.title}</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

