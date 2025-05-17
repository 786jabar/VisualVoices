import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { applyRandomTransformation, type CreativeTransformation } from '@/lib/creativityTransformations';

interface CreativitySparkButtonProps {
  onSpark: (transformation: CreativeTransformation) => void;
  className?: string;
  disabled?: boolean;
}

/**
 * A whimsical button that generates unexpected, inspiring visual transformations
 */
const CreativitySparkButton: React.FC<CreativitySparkButtonProps> = ({
  onSpark,
  className = '',
  disabled = false
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Handle click with debounce to prevent rapid clicks
  const handleClick = async () => {
    if (disabled || isAnimating) return;
    
    setIsAnimating(true);
    
    try {
      // Find the visualization canvas in the DOM
      const canvasContainer = document.querySelector('#visualizationContainer');
      const canvas = canvasContainer?.querySelector('canvas');
      
      // Apply a random transformation
      const transformation = await applyRandomTransformation(
        canvas as HTMLCanvasElement | null,
        canvasContainer as HTMLDivElement | null
      );
      
      // Notify parent component
      onSpark(transformation);
      
      // Add delay to prevent rapid clicks
      setTimeout(() => {
        setIsAnimating(false);
      }, 2500); // Slightly longer than animation duration
    } catch (error) {
      console.error('Error applying creativity transformation:', error);
      setIsAnimating(false);
    }
  };
  
  return (
    <button
      onClick={handleClick}
      disabled={disabled || isAnimating}
      className={`
        group relative flex items-center justify-center gap-2 overflow-hidden
        rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 
        px-4 py-2 font-medium text-white shadow-lg
        transition-all duration-300 hover:scale-105 hover:shadow-xl
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
        disabled:opacity-60 disabled:cursor-not-allowed
        ${isAnimating ? 'animate-pulse' : ''}
        ${className}
      `}
      aria-label="Spark creativity"
    >
      {/* Sparkles icon with animation */}
      <Sparkles 
        className={`h-5 w-5 transition-transform duration-300 
          ${isAnimating ? 'animate-ping' : 'group-hover:scale-125 group-hover:rotate-12'}`} 
      />
      
      {/* Button text */}
      <span className="relative z-10">
        {isAnimating ? 'Sparking Magic...' : 'Creativity Spark'}
      </span>
      
      {/* Background animated glow effect */}
      <span className="absolute inset-0 -z-10 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-0 blur-xl filter transition-opacity duration-1000 group-hover:opacity-70" />
      
      {/* Particle effects when animating */}
      {isAnimating && (
        <span className="absolute inset-0 -z-10">
          <span className="absolute h-2 w-2 rounded-full bg-yellow-300 animate-ping" style={{ top: '20%', left: '30%' }} />
          <span className="absolute h-2 w-2 rounded-full bg-blue-300 animate-ping" style={{ top: '60%', left: '70%', animationDelay: '0.2s' }} />
          <span className="absolute h-2 w-2 rounded-full bg-pink-300 animate-ping" style={{ top: '30%', left: '80%', animationDelay: '0.5s' }} />
        </span>
      )}
    </button>
  );
};

export default CreativitySparkButton;