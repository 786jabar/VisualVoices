import React, { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { ChevronLeft } from 'lucide-react';
import LandscapePlayer from '../components/LandscapePlayer';
import BottomNavigation from '../components/ui/BottomNavigation';
import { SoundscapeType } from '../hooks/useUniqueSoundscapes';

// Import CSS
import '../styles/designSystem.css';

// Example landscapes with different soundscape types
const landscapes = [
  {
    id: 1,
    name: 'Ethereal Aurora Mountains',
    type: 'peaceful' as SoundscapeType,
    thumbnailUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000'
  },
  {
    id: 2,
    name: 'Crimson Desert Cliffs',
    type: 'dramatic' as SoundscapeType,
    thumbnailUrl: 'https://images.unsplash.com/photo-1539137571919-85b7433d82d8?q=80&w=1000'
  },
  {
    id: 3,
    name: 'Crystal Waterfall Valley',
    type: 'cheerful' as SoundscapeType,
    thumbnailUrl: 'https://images.unsplash.com/photo-1536063211352-0b94219f6212?q=80&w=1000'
  },
  {
    id: 4,
    name: 'Midnight Galaxy View',
    type: 'cosmic' as SoundscapeType,
    thumbnailUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000'
  },
  {
    id: 5,
    name: 'Emerald Forest',
    type: 'mysterious' as SoundscapeType,
    thumbnailUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1000'
  },
  {
    id: 6,
    name: 'Ocean Sunset',
    type: 'melancholic' as SoundscapeType,
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000'
  },
  {
    id: 7,
    name: 'Desert Night Sky',
    type: 'galactic' as SoundscapeType,
    thumbnailUrl: 'https://images.unsplash.com/photo-1532978379173-523e16f371f4?q=80&w=1000'
  }
];

export default function LandscapePlayerPage() {
  const [, params] = useRoute<{ id: string }>('/landscape/:id');
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [landscape, setLandscape] = useState<typeof landscapes[0] | null>(null);
  
  // Get landscape by ID
  useEffect(() => {
    if (params?.id) {
      const id = parseInt(params.id, 10);
      const found = landscapes.find(l => l.id === id);
      
      if (found) {
        setLandscape(found);
      } else {
        // Landscape not found, navigate back to home
        navigate('/');
      }
    }
    
    // Simulate loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [params, navigate]);
  
  // Handle back button
  const handleBack = () => {
    navigate('/');
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="gradient-text text-3xl font-bold mb-4">Galaxy Landscape</h1>
          <div className="animate-pulse bg-primary/30 h-8 w-40 rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }
  
  if (!landscape) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-white text-3xl font-bold mb-4">Landscape Not Found</h1>
          <button 
            className="btn-primary"
            onClick={handleBack}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Home
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Back Button */}
      <button
        className="absolute top-4 left-4 z-10 btn-icon bg-black/50 hover:bg-black/70"
        onClick={handleBack}
        aria-label="Back to home"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      
      {/* Landscape Player */}
      <div className="flex-1">
        <LandscapePlayer
          id={landscape.id}
          name={landscape.name}
          type={landscape.type}
          thumbnailUrl={landscape.thumbnailUrl}
          onBack={handleBack}
        />
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation activePath={`/landscape/${landscape.id}`} />
    </div>
  );
}