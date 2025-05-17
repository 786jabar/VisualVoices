import React from 'react';
import { Play, Info } from 'lucide-react';

interface LandscapeCardProps {
  id: string | number;
  name: string;
  thumbnailUrl: string;
  hasAISupport?: boolean;
  onPlay?: () => void;
  onInfo?: () => void;
}

export default function LandscapeCard({
  id,
  name,
  thumbnailUrl,
  hasAISupport = false,
  onPlay,
  onInfo
}: LandscapeCardProps) {
  return (
    <div className="landscape-card">
      <img 
        src={thumbnailUrl} 
        alt={name} 
        className="landscape-card__thumbnail"
        loading="lazy"
      />
      
      {hasAISupport && (
        <div className="landscape-card__badge">
          AI Enhanced
        </div>
      )}
      
      <div className="landscape-card__content">
        <h3 className="landscape-card__title">{name}</h3>
        
        <div className="landscape-card__actions">
          <button 
            className="btn-primary"
            onClick={onPlay}
            aria-label={`Play ${name}`}
          >
            <Play className="h-4 w-4" />
            <span>Play</span>
          </button>
          
          <button 
            className="btn-icon"
            onClick={onInfo}
            aria-label={`Information about ${name}`}
          >
            <Info className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}