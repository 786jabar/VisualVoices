import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Settings } from 'lucide-react';
import { useUniqueSoundscapes, SoundscapeType } from '../hooks/useUniqueSoundscapes';
import AnimationToggle from './ui/AnimationToggle';

interface LandscapePlayerProps {
  id: string | number;
  name: string;
  type: SoundscapeType;
  thumbnailUrl: string;
  hasAnimation?: boolean;
  onBack?: () => void;
}

export default function LandscapePlayer({
  id,
  name,
  type,
  thumbnailUrl,
  hasAnimation = true,
  onBack
}: LandscapePlayerProps) {
  // State
  const [isActive, setIsActive] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [motionEnabled, setMotionEnabled] = useState(true);
  const [fullMotion, setFullMotion] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  
  // Use our improved unique soundscapes hook
  const {
    isPlaying,
    isInitialized,
    currentSoundscape,
    togglePlay,
    setVolume: setSoundscapeVolume,
    initialize
  } = useUniqueSoundscapes({
    initialType: type,
    isActive,
    volume: isMuted ? 0 : volume
  });
  
  // Initialize audio when component becomes active
  useEffect(() => {
    if (isActive && !isInitialized && !isInitializing) {
      setIsInitializing(true);
      initialize().finally(() => {
        setIsInitializing(false);
      });
    }
  }, [isActive, isInitialized, initialize, isInitializing]);
  
  // Handle play/pause button click
  const handlePlayPause = async () => {
    if (!isActive) {
      setIsActive(true);
      // Audio will be initialized by the useEffect above
    } else {
      await togglePlay();
    }
  };
  
  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setSoundscapeVolume(newVolume);
  };
  
  // Handle mute toggle
  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    setSoundscapeVolume(isMuted ? volume : 0);
  };
  
  // Toggle motion effects
  const handleToggleMotion = () => {
    setMotionEnabled(!motionEnabled);
    if (!motionEnabled) {
      setFullMotion(false);
    }
  };
  
  // Toggle full motion
  const handleToggleFullMotion = () => {
    if (motionEnabled) {
      setFullMotion(!fullMotion);
    }
  };
  
  return (
    <div className="landscape-player">
      {/* Main visualization area */}
      <div className="landscape-player__visualization">
        {/* Landscape image as background */}
        <div 
          className="landscape-player__background"
          style={{ 
            backgroundImage: `url(${thumbnailUrl})`,
            filter: motionEnabled ? 'blur(3px)' : 'none'
          }}
        ></div>
        
        {/* 3D Visualization Canvas */}
        {motionEnabled && (
          <div className="landscape-player__canvas">
            {/* 3D visualization would be rendered here */}
            <div className="flex items-center justify-center h-full text-center">
              <div className="bg-black/50 p-4 rounded-lg">
                <p className="text-white">
                  {fullMotion ? 
                    '4K High-Performance Visualization Active' : 
                    '3D Visualization Active'}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Overlay information */}
        <div className="landscape-player__overlay">
          <h1 className="landscape-player__title">{name}</h1>
          <div className="landscape-player__type">
            {type.charAt(0).toUpperCase() + type.slice(1)} Soundscape
          </div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="landscape-player__controls">
        <div className="landscape-player__main-controls">
          {/* Play/Pause Button */}
          <button 
            className="btn-icon btn-icon--large bg-accent hover:bg-accent/80"
            onClick={handlePlayPause}
            disabled={isInitializing}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isInitializing ? (
              <div className="btn-icon__spinner"></div>
            ) : isPlaying ? (
              <Pause className="h-8 w-8" />
            ) : (
              <Play className="h-8 w-8" />
            )}
          </button>
          
          {/* Volume Controls */}
          <div className="landscape-player__volume">
            <button 
              className="btn-icon"
              onClick={handleMuteToggle}
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </button>
            
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="volume-slider"
              aria-label="Volume control"
              disabled={isMuted}
            />
          </div>
          
          {/* Settings Button */}
          <button
            className="btn-icon"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
        
        {/* Animation Controls */}
        <div className="mt-6">
          <AnimationToggle
            motionEnabled={motionEnabled}
            onToggleMotion={handleToggleMotion}
            fullMotion={fullMotion}
            onToggleFullMotion={handleToggleFullMotion}
          />
        </div>
      </div>
      
      {/* Styling is moved to CSS classes in designSystem.css */}
    </div>
  );
}