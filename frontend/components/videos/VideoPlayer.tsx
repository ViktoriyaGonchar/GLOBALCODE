'use client';

import { useState, useEffect, useRef } from 'react';
import { Video, VideoQuality } from '@/lib/api/video';
import { videoApi } from '@/lib/api/video';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store/auth';
import { formatDuration } from '@/lib/utils/date';

interface VideoPlayerProps {
  video: Video;
  onVideoChange?: (videoNumber: number) => void;
}

export function VideoPlayer({ video, onVideoChange }: VideoPlayerProps) {
  const { isAuthenticated } = useAuthStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [selectedQuality, setSelectedQuality] = useState<string>('auto');
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPictureInPicture, setIsPictureInPicture] = useState(false);
  const [videoUrl, setVideoUrl] = useState(video.url);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    loadVideo();
    loadProgress();
  }, [video.id]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
      // Автосохранение прогресса каждые 5 секунд
      if (isAuthenticated && Math.floor(videoElement.currentTime) % 5 === 0) {
        saveProgress(videoElement.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => setVolume(videoElement.volume);

    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('volumechange', handleVolumeChange);

    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [video.id, isAuthenticated]);

  const loadVideo = async () => {
    try {
      const response = await videoApi.getStream(video.id, selectedQuality as any);
      if (response.success && response.data) {
        setVideoUrl(response.data.url);
      }
    } catch (err) {
      console.error('Error loading video stream:', err);
    }
  };

  const loadProgress = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await videoApi.getProgress(video.id);
      if (response.success && response.data) {
        const videoElement = videoRef.current;
        if (videoElement && response.data.currentTime > 0) {
          videoElement.currentTime = response.data.currentTime;
        }
      }
    } catch (err) {
      console.error('Error loading progress:', err);
    }
  };

  const saveProgress = async (time: number) => {
    if (!isAuthenticated) return;

    try {
      await videoApi.saveProgress(video.id, { currentTime: time });
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  };

  const togglePlay = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isPlaying) {
      videoElement.pause();
    } else {
      videoElement.play();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const time = parseFloat(e.target.value);
    videoElement.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const vol = parseFloat(e.target.value);
    videoElement.volume = vol;
    setVolume(vol);
  };

  const handleQualityChange = async (quality: string) => {
    setSelectedQuality(quality);
    const response = await videoApi.getStream(video.id, quality as any);
    if (response.success && response.data) {
      const videoElement = videoRef.current;
      const currentTime = videoElement?.currentTime || 0;
      setVideoUrl(response.data.url);
      // Восстанавливаем позицию после загрузки
      setTimeout(() => {
        if (videoElement) {
          videoElement.currentTime = currentTime;
        }
      }, 100);
    }
  };

  const handleSpeedChange = (speed: number) => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    videoElement.playbackRate = speed;
    setPlaybackRate(speed);
  };

  const toggleFullscreen = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (!document.fullscreenElement) {
      videoElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const togglePictureInPicture = async () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPictureInPicture(false);
      } else {
        await videoElement.requestPictureInPicture();
        setIsPictureInPicture(true);
      }
    } catch (err) {
      console.error('Error toggling PiP:', err);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handlePreviousVideo = () => {
    if (video.number > 1 && onVideoChange) {
      onVideoChange(video.number - 1);
    }
  };

  const handleNextVideo = () => {
    if (video.number < 100 && onVideoChange) {
      onVideoChange(video.number + 1);
    }
  };

  return (
    <div
      className="relative bg-black rounded-lg overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-auto"
        poster={video.thumbnail}
        onClick={togglePlay}
      />

      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          {/* Прогресс-бар */}
          <div className="mb-4">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-white mt-1">
              <span>{formatDuration(currentTime)}</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>

          {/* Элементы управления */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? '⏸️' : '▶️'}
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-white text-sm">🔊</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <select
                value={playbackRate}
                onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                className="bg-black/50 text-white px-2 py-1 rounded text-sm"
              >
                <option value="0.5">0.5x</option>
                <option value="0.75">0.75x</option>
                <option value="1">1x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
              </select>

              {video.number > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePreviousVideo}
                  className="text-white hover:bg-white/20"
                >
                  ⏮️ Предыдущее
                </Button>
              )}

              {video.number < 100 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNextVideo}
                  className="text-white hover:bg-white/20"
                >
                  Следующее ⏭️
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedQuality}
                onChange={(e) => handleQualityChange(e.target.value)}
                className="bg-black/50 text-white px-2 py-1 rounded text-sm"
              >
                <option value="auto">Авто</option>
                {video.qualities.map((q) => (
                  <option key={q.quality} value={q.quality}>
                    {q.quality}
                  </option>
                ))}
              </select>

              <Button
                variant="ghost"
                size="icon"
                onClick={togglePictureInPicture}
                className="text-white hover:bg-white/20"
                title="Открепить видео"
              >
                ⊟
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20"
                title="Полный экран"
              >
                ⛶
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Номер видео */}
      <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
        Видео #{video.number}
      </div>
    </div>
  );
}

