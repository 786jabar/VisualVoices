import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ChevronRight } from 'lucide-react';
import BottomNavigation from '../components/ui/BottomNavigation';
import LandscapeCard from '../components/ui/LandscapeCard';

// Import CSS
import '../styles/designSystem.css';

// Example landscape data
const featuredLandscapes = [
  {
    id: 1,
    name: 'Ethereal Aurora Mountains',
    thumbnailUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000',
    hasAISupport: true
  },
  {
    id: 2,
    name: 'Crimson Desert Cliffs',
    thumbnailUrl: 'https://images.unsplash.com/photo-1539137571919-85b7433d82d8?q=80&w=1000',
    hasAISupport: false
  },
  {
    id: 3,
    name: 'Crystal Waterfall Valley',
    thumbnailUrl: 'https://images.unsplash.com/photo-1536063211352-0b94219f6212?q=80&w=1000',
    hasAISupport: true
  },
  {
    id: 4,
    name: 'Midnight Galaxy View',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000',
    hasAISupport: true
  }
];

const recentLandscapes = [
  {
    id: 5,
    name: 'Emerald Forest',
    thumbnailUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1000',
    hasAISupport: false
  },
  {
    id: 6,
    name: 'Ocean Sunset',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000',
    hasAISupport: true
  },
  {
    id: 7,
    name: 'Desert Night Sky',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532978379173-523e16f371f4?q=80&w=1000',
    hasAISupport: false
  }
];

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle play landscape
  const handlePlayLandscape = (id: number | string) => {
    console.log(`Playing landscape: ${id}`);
    // Here you would navigate to the landscape view or start playback
  };
  
  // Handle info landscape
  const handleInfoLandscape = (id: number | string) => {
    console.log(`Viewing info for landscape: ${id}`);
    // Here you would show a modal with landscape details
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
  
  return (
    <div className="min-h-screen bg-background text-white pb-20">
      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b border-white/10">
        <h1 className="gradient-text text-2xl font-bold">Galaxy Landscape</h1>
      </header>
      
      {/* Main Content */}
      <main className="container py-6">
        {/* Featured Landscapes */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Featured Landscapes</h2>
            <Link href="/gallery">
              <a className="text-accent flex items-center text-sm">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredLandscapes.map(landscape => (
              <LandscapeCard
                key={landscape.id}
                id={landscape.id}
                name={landscape.name}
                thumbnailUrl={landscape.thumbnailUrl}
                hasAISupport={landscape.hasAISupport}
                onPlay={() => handlePlayLandscape(landscape.id)}
                onInfo={() => handleInfoLandscape(landscape.id)}
              />
            ))}
          </div>
        </section>
        
        {/* Recently Played */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recently Played</h2>
            <Link href="/history">
              <a className="text-accent flex items-center text-sm">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentLandscapes.map(landscape => (
              <LandscapeCard
                key={landscape.id}
                id={landscape.id}
                name={landscape.name}
                thumbnailUrl={landscape.thumbnailUrl}
                hasAISupport={landscape.hasAISupport}
                onPlay={() => handlePlayLandscape(landscape.id)}
                onInfo={() => handleInfoLandscape(landscape.id)}
              />
            ))}
          </div>
        </section>
        
        {/* Create New Landscape Button */}
        <section className="text-center mt-10">
          <Link href="/create">
            <a className="btn-primary px-8 py-3 text-lg inline-flex">
              Create New Landscape
            </a>
          </Link>
          
          <p className="text-sm text-white/60 mt-3">
            Use your voice to create a unique landscape experience
          </p>
        </section>
      </main>
      
      {/* Bottom Navigation */}
      <BottomNavigation activePath="/" />
    </div>
  );
}