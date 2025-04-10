import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, Volume2, VolumeX, RotateCcw, Download } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { audioProxyService } from '@/services/audioProxyService';

interface AudioPlayerProps {
  src: string;
  title?: string;
  onError?: (error: Error) => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  src, 
  title = 'Audio Player',
  onError 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proxiedSrc, setProxiedSrc] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Proxy the audio source to bypass CORS restrictions
  useEffect(() => {
    const proxyAudio = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get proxied URL
        const proxiedUrl = await audioProxyService.getProxiedAudioUrl(src);
        setProxiedSrc(proxiedUrl);
      } catch (err) {
        console.error('Error proxying audio:', err);
        setError('Failed to load audio file. Please try again.');
        if (onError && err instanceof Error) {
          onError(err);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    proxyAudio();
    
    // Cleanup function to revoke object URL
    return () => {
      if (proxiedSrc && proxiedSrc.startsWith('blob:')) {
        URL.revokeObjectURL(proxiedSrc);
      }
    };
  }, [src, onError]);

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedData = () => {
      setIsLoading(false);
      setAudioData();
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = (e: ErrorEvent) => {
      console.error('Audio error:', e);
      setError('Error playing audio. Please try again.');
      setIsLoading(false);
      if (onError) {
        onError(new Error('Audio playback error'));
      }
    };

    // Add event listeners
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError as EventListener);

    // Clean up
    return () => {
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError as EventListener);
    };
  }, [onError]);

  // Handle play/pause
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(err => {
        console.error('Error playing audio:', err);
        setError('Error playing audio. Please try again.');
        if (onError) {
          onError(err);
        }
      });
    }
    setIsPlaying(!isPlaying);
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  // Handle mute toggle
  const toggleMute = () => {
    if (audioRef.current) {
      const newMutedState = !isMuted;
      audioRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  };

  // Handle seeking
  const handleSeek = (value: number[]) => {
    const seekTime = value[0];
    setCurrentTime(seekTime);
    
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
  };

  // Reset player
  const handleReset = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      }
    }
  };

  // Format time (seconds -> mm:ss)
  const formatTime = (time: number) => {
    if (isNaN(time)) return '00:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle download
  const handleDownload = () => {
    if (proxiedSrc) {
      const a = document.createElement('a');
      a.href = proxiedSrc;
      a.download = title.replace(/\s+/g, '_').toLowerCase() + '.mp3';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <Card className="p-4 w-full max-w-md mx-auto">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium truncate">{title}</h3>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleDownload}
            disabled={!proxiedSrc || isLoading || !!error}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>

        {/* Audio element (hidden) */}
        <audio 
          ref={audioRef} 
          src={proxiedSrc || undefined}
          preload="metadata"
        />

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-destructive text-center py-2">
            {error}
          </div>
        )}

        {/* Player controls */}
        {!isLoading && !error && (
          <>
            {/* Progress bar */}
            <div className="space-y-2">
              <Slider
                value={[currentTime]}
                min={0}
                max={duration || 100}
                step={0.1}
                onValueChange={handleSeek}
                disabled={isLoading || !!error}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={togglePlay}
                  disabled={isLoading || !!error}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleReset}
                  disabled={isLoading || !!error}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center space-x-2 w-1/3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleMute}
                  disabled={isLoading || !!error}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Slider
                  value={[volume]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  disabled={isLoading || !!error}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

export default AudioPlayer;
