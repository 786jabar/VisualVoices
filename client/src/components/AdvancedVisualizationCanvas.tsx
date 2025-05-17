import React, { useState, useEffect } from 'react';
import { use3DVisualization } from '@/hooks/use3DVisualization';
import { cn, getSentimentEmoji, getSentimentDescription } from '@/lib/utils';
import { Loader2, Sparkles } from 'lucide-react';

interface AdvancedVisualizationCanvasProps {
  sentiment: 'Negative' | 'Neutral' | 'Positive';
  sentimentScore: number;
  text: string;
  isProcessing: boolean;
  processingMessage?: string;
  colorIntensity: boolean;
  motion: boolean;
  onClearSummary?: () => void; // New prop for clearing summary
}

/**
 * Advanced 3D visualization canvas that continues animating during speech
 */
const AdvancedVisualizationCanvas: React.FC<AdvancedVisualizationCanvasProps> = ({
  sentiment,
  sentimentScore,
  text,
  isProcessing,
  processingMessage = 'Generating poetic summary...',
  colorIntensity,
  motion,
  onClearSummary
}) => {
  const { containerRef, saveCanvas } = use3DVisualization({
    sentiment,
    sentimentScore,
    text,
    colorIntensity,
    motion
  });
  
  // Show initial guidance prompt if no text yet
  const showGuidance = !text && !isProcessing;
  
  // Animation frames for the sparkling effect
  const [sparkleOpacity, setSparkleOpacity] = useState(0.6);
  
  useEffect(() => {
    if (showGuidance) {
      // Create pulsing animation for guidance
      const interval = setInterval(() => {
        setSparkleOpacity(prev => prev === 0.6 ? 1 : 0.6);
      }, 1500);
      
      return () => clearInterval(interval);
    }
  }, [showGuidance]);
  
  return (
    <section id="visualizationContainer" className="relative flex-1 bg-black overflow-hidden">
      {/* 3D Visualization Canvas Container */}
      <div 
        ref={containerRef} 
        className="absolute inset-0 w-full h-full" 
        style={{ display: 'block', position: 'absolute', width: '100%', height: '100%' }}
      ></div>
      
      {/* Floating Info Badge - shows when visualization is active but not processing */}
      {text && !isProcessing && (
        <div className="absolute top-4 left-4 bg-gray-900/80 backdrop-blur-sm rounded-lg p-2 text-xs text-white border border-gray-800 animate-fadeIn transition-all duration-300 z-10">
          <div className="flex items-center space-x-2">
            <span>{getSentimentEmoji(sentiment)}</span>
            <span>{getSentimentDescription(sentiment)}</span>
          </div>
        </div>
      )}
      
      {/* Clear Summary Button - shows when there's text to clear */}
      {text && !isProcessing && onClearSummary && (
        <button
          onClick={onClearSummary}
          className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur-sm rounded-full p-2 text-xs text-white border border-gray-800 hover:bg-gray-800 transition-all duration-300 z-10 flex items-center space-x-1"
          title="Clear summary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12"></path>
          </svg>
          <span>Clear</span>
        </button>
      )}
      
      {/* Initial guidance overlay */}
      {showGuidance && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/30 backdrop-blur-sm">
          <div 
            className="max-w-md text-center p-8" 
            style={{ opacity: sparkleOpacity }}
          >
            <Sparkles className="h-8 w-8 text-indigo-400 mx-auto mb-3 animate-slow-spin" />
            <h2 className="text-white text-xl font-bold mb-2">Speak to Create</h2>
            <p className="text-gray-300 mb-6">
              Your voice will transform this blank canvas into a living, surreal landscape
              that evolves with your words and emotions.
            </p>
            <div className="text-sm text-gray-400">
              Click the "Start Speaking" button to begin your creation →
            </div>
          </div>
        </div>
      )}
      
      {/* Processing overlay */}
      <div 
        className={cn(
          "absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-20 transition-opacity duration-500",
          isProcessing ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-white mx-auto mb-4 animate-spin" />
          <p className="text-white font-medium">{processingMessage}</p>
        </div>
      </div>
    </section>
  );
};

export default AdvancedVisualizationCanvas;