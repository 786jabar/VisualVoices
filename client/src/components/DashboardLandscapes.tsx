import React, { useState, useEffect, useRef } from 'react';
import EnhancedLandscapeCanvas from './EnhancedLandscapeCanvas';
import { SoundscapeType } from '@/hooks/stableSoundscapes';

// Pre-defined landscape settings for the dashboard carousel
const DASHBOARD_LANDSCAPES = [
  {
    id: 1,
    name: "Ethereal Aurora Mountains",
    soundscapeType: "peaceful" as SoundscapeType,
    colors: {
      primary: "#3b1d61",
      secondary: "#1e4464",
      accent: "#61c3df"
    }
  },
  {
    id: 2,
    name: "Crimson Desert Cliffs",
    soundscapeType: "dramatic" as SoundscapeType,
    colors: {
      primary: "#8c2f0c",
      secondary: "#d4773e",
      accent: "#ffcb8e"
    }
  },
  {
    id: 3,
    name: "Floating Crystal Islands",
    soundscapeType: "mysterious" as SoundscapeType,
    colors: {
      primary: "#313866",
      secondary: "#504099",
      accent: "#7b88d3"
    }
  },
  {
    id: 4,
    name: "Spiral Galaxy",
    soundscapeType: "galactic" as SoundscapeType,
    colors: {
      primary: "#0a0a2a",
      secondary: "#2d2d7c",
      accent: "#5e72eb"
    }
  },
  {
    id: 5,
    name: "Nebula Expanse",
    soundscapeType: "cosmic" as SoundscapeType,
    colors: {
      primary: "#3c096c",
      secondary: "#7b2cbf",
      accent: "#e0aaff"
    }
  }
];

interface DashboardLandscapesProps {
  className?: string;
  isActive?: boolean;
}

const DashboardLandscapes: React.FC<DashboardLandscapesProps> = ({ 
  className = '',
  isActive = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentLandscape, setCurrentLandscape] = useState(DASHBOARD_LANDSCAPES[0]);
  const [nextLandscape, setNextLandscape] = useState<typeof DASHBOARD_LANDSCAPES[0] | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Effect for rotating landscapes every 15 seconds
  useEffect(() => {
    if (!isActive) return;
    
    const startRotation = () => {
      timerRef.current = setInterval(() => {
        // Start transition animation
        setIsTransitioning(true);
        
        // Pre-load next landscape
        const nextIndex = (currentIndex + 1) % DASHBOARD_LANDSCAPES.length;
        setNextLandscape(DASHBOARD_LANDSCAPES[nextIndex]);
        
        // After transition, update current landscape
        setTimeout(() => {
          setCurrentIndex(nextIndex);
          setCurrentLandscape(DASHBOARD_LANDSCAPES[nextIndex]);
          setIsTransitioning(false);
          setNextLandscape(null);
        }, 1000); // 1 second transition
      }, 15000); // 15 seconds between rotations
    };
    
    startRotation();
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentIndex, isActive]);
  
  useEffect(() => {
    console.log("DashboardLandscapes mounted. isActive:", isActive);
    console.log("Current landscape:", currentLandscape);
  }, []);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`} style={{ minHeight: '100vh', zIndex: 0 }}>
      {/* Current landscape - forcibly visible with important styles */}
      <div 
        className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
        style={{ 
          minHeight: '100%', 
          minWidth: '100%', 
          display: 'block',
          visibility: 'visible',
          zIndex: 1
        }}
        id="current-landscape-container"
      >
        <EnhancedLandscapeCanvas
          colors={currentLandscape.colors}
          soundscapeType={currentLandscape.soundscapeType}
          isActive={isActive && !isTransitioning}
        />
      </div>
      
      {/* Next landscape (shown during transition) */}
      {nextLandscape && (
        <div 
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${isTransitioning ? 'opacity-100' : 'opacity-0'}`}
          style={{ 
            minHeight: '100%', 
            minWidth: '100%',
            display: 'block',
            visibility: 'visible',
            zIndex: 2
          }}
          id="next-landscape-container"
        >
          <EnhancedLandscapeCanvas
            colors={nextLandscape.colors}
            soundscapeType={nextLandscape.soundscapeType}
            isActive={isActive && isTransitioning}
          />
        </div>
      )}
      
      {/* Landscape indicator dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {DASHBOARD_LANDSCAPES.map((landscape, index) => (
          <div 
            key={landscape.id}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-white scale-125' 
                : 'bg-white/30 hover:bg-white/50'
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
      
      {/* Current landscape name overlay */}
      <div className="absolute top-4 left-4 z-10 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-md text-white/80 text-sm font-medium border border-white/10">
        {currentLandscape.name}
      </div>
    </div>
  );
};

export default DashboardLandscapes;