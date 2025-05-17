import React, { useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface MusicCardProps {
  id: string | number;
  title: string;
  duration: number; // Duration in seconds
  audioUrl: string;
  waveformImageUrl?: string;
  onPlay?: () => void;
  onPause?: () => void;
}

export default function MusicCard({
  id,
  title,
  duration,
  audioUrl,
  waveformImageUrl,
  onPlay,
  onPause
}: MusicCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioElement] = useState<HTMLAudioElement | null>(
    typeof Audio !== 'undefined' ? new Audio(audioUrl) : null
  );
  
  // Format duration (seconds) to MM:SS
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Toggle play/pause
  const togglePlay = () => {
    if (!audioElement) return;
    
    if (isPlaying) {
      audioElement.pause();
      setIsPlaying(false);
      onPause?.();
    } else {
      audioElement.play().catch(err => {
        console.error('Error playing audio:', err);
      });
      setIsPlaying(true);
      onPlay?.();
    }
  };
  
  // Toggle mute
  const toggleMute = () => {
    if (!audioElement) return;
    
    audioElement.muted = !isMuted;
    setIsMuted(!isMuted);
  };
  
  return (
    <div className="card music-card">
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button 
          className="btn-icon bg-accent hover:bg-accent/80"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </button>
        
        <div className="flex-1">
          {/* Title */}
          <h3 className="text-white text-md font-medium mb-1">{title}</h3>
          
          {/* Waveform and Duration */}
          <div className="flex items-center gap-2">
            {waveformImageUrl ? (
              <img 
                src={waveformImageUrl} 
                alt="Audio waveform" 
                className="h-6 w-32 object-cover opacity-60"
              />
            ) : (
              <div className="h-6 w-32 bg-white/10 rounded">
                <div 
                  className="h-full bg-accent/40 rounded" 
                  style={{ width: isPlaying ? '70%' : '0%', transition: 'width 1s linear' }}
                ></div>
              </div>
            )}
            <span className="text-xs text-white/60">{formatDuration(duration)}</span>
          </div>
        </div>
        
        {/* Volume Toggle */}
        <button 
          className="btn-icon"
          onClick={toggleMute}
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}