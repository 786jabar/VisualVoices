import React, { useState, useEffect, useRef } from 'react';
import SimpleDashboardCanvas from './SimpleDashboardCanvas';
import { SoundscapeType } from '@/hooks/stableSoundscapes';

// Pre-defined landscape settings for the dashboard carousel with 20 beautiful 3D scenes
const DASHBOARD_LANDSCAPES = [
  // Original 5 landscapes
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
  },
  // Additional 15 beautiful 3D landscapes
  {
    id: 6,
    name: "Milky Way Galaxy",
    soundscapeType: "galactic" as SoundscapeType,
    colors: {
      primary: "#0f0f23",
      secondary: "#202060",
      accent: "#4169e1"
    }
  },
  {
    id: 7,
    name: "Northern Lights Forest",
    soundscapeType: "peaceful" as SoundscapeType,
    colors: {
      primary: "#0f2027",
      secondary: "#203a43",
      accent: "#21d190"
    }
  },
  {
    id: 8,
    name: "Snowfall Mountains",
    soundscapeType: "peaceful" as SoundscapeType,
    colors: {
      primary: "#2c3e50",
      secondary: "#bdc3c7",
      accent: "#ffffff"
    }
  },
  {
    id: 9,
    name: "Alpine Rainbow Valley",
    soundscapeType: "cheerful" as SoundscapeType,
    colors: {
      primary: "#355c7d",
      secondary: "#6c5b7b",
      accent: "#c06c84"
    }
  },
  {
    id: 10,
    name: "Misty River Canyon",
    soundscapeType: "melancholic" as SoundscapeType,
    colors: {
      primary: "#076585",
      secondary: "#3498db",
      accent: "#8bdfff"
    }
  },
  {
    id: 11,
    name: "Mars Landscape",
    soundscapeType: "dramatic" as SoundscapeType,
    colors: {
      primary: "#4a1c1c",
      secondary: "#8a3232",
      accent: "#c45c41"
    }
  },
  {
    id: 12,
    name: "Jupiter Cloud Bands",
    soundscapeType: "cosmic" as SoundscapeType,
    colors: {
      primary: "#824912",
      secondary: "#b47d23",
      accent: "#e3b587"
    }
  },
  {
    id: 13,
    name: "Saturn's Rings",
    soundscapeType: "galactic" as SoundscapeType,
    colors: {
      primary: "#463832",
      secondary: "#725c53",
      accent: "#dec5a8"
    }
  },
  {
    id: 14,
    name: "Tropical Beach Sunset",
    soundscapeType: "peaceful" as SoundscapeType,
    colors: {
      primary: "#0a2e5c",
      secondary: "#f96e5b",
      accent: "#ffd56b"
    }
  },
  {
    id: 15,
    name: "Volcanic Eruption",
    soundscapeType: "dramatic" as SoundscapeType,
    colors: {
      primary: "#000000",
      secondary: "#651212",
      accent: "#f86838"
    }
  },
  {
    id: 16,
    name: "Coral Reef Depths",
    soundscapeType: "mysterious" as SoundscapeType,
    colors: {
      primary: "#0d5c71",
      secondary: "#0891b2",
      accent: "#54e8f8"
    }
  },
  {
    id: 17,
    name: "Earth View From Space",
    soundscapeType: "cosmic" as SoundscapeType,
    colors: {
      primary: "#000c1c",
      secondary: "#003366",
      accent: "#3399ff"
    }
  },
  {
    id: 18,
    name: "Mountain Waterfall",
    soundscapeType: "peaceful" as SoundscapeType,
    colors: {
      primary: "#1a4541",
      secondary: "#386c64",
      accent: "#7fc8ba"
    }
  },
  {
    id: 19,
    name: "Binary Star System",
    soundscapeType: "galactic" as SoundscapeType,
    colors: {
      primary: "#1e0a25",
      secondary: "#471d54",
      accent: "#ff4500"
    }
  },
  {
    id: 20,
    name: "Autumn Forest Rain",
    soundscapeType: "melancholic" as SoundscapeType,
    colors: {
      primary: "#5c3c10",
      secondary: "#8f5c24",
      accent: "#d67d3e"
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
        <SimpleDashboardCanvas
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
          <SimpleDashboardCanvas
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