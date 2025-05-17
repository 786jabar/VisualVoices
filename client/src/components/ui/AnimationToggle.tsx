import React from 'react';
import { Sparkles, Zap } from 'lucide-react';

interface AnimationToggleProps {
  motionEnabled: boolean;
  onToggleMotion: () => void;
  fullMotion: boolean;
  onToggleFullMotion: () => void;
}

export default function AnimationToggle({
  motionEnabled,
  onToggleMotion,
  fullMotion,
  onToggleFullMotion
}: AnimationToggleProps) {
  return (
    <div className="card bg-primary/40">
      <h3 className="text-white text-md font-medium mb-3">Animation Controls</h3>
      
      {/* 3D Animation Toggle */}
      <div className="animation-toggle">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <span className="animation-toggle__label">3D Animation</span>
        </div>
        <label className="toggle ml-auto">
          <input
            type="checkbox"
            className="toggle__input"
            checked={motionEnabled}
            onChange={onToggleMotion}
          />
          <span className="toggle__slider"></span>
        </label>
      </div>
      
      {/* Full Motion Toggle - only enabled if basic animation is on */}
      <div className="animation-toggle">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-accent" />
          <span className="animation-toggle__label">High Performance Mode</span>
        </div>
        <label className={`toggle ml-auto ${!motionEnabled ? 'opacity-50' : ''}`}>
          <input
            type="checkbox"
            className="toggle__input"
            checked={fullMotion && motionEnabled}
            onChange={onToggleFullMotion}
            disabled={!motionEnabled}
          />
          <span className="toggle__slider"></span>
        </label>
      </div>
      
      <p className="text-xs text-white/60 mt-3">
        Adjust animation intensity based on device performance. 
        Disable animations on lower-end devices for better experience.
      </p>
    </div>
  );
}