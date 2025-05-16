import { FC, useState, useEffect } from 'react';
import { useP5Visualization } from '@/hooks/useP5Visualization';
import { cn, getSentimentEmoji, getSentimentDescription } from '@/lib/utils';
import { Loader2, Sparkles } from 'lucide-react';

interface VisualizationCanvasProps {
  sentiment: 'Negative' | 'Neutral' | 'Positive';
  sentimentScore: number;
  text: string;
  isProcessing: boolean;
  processingMessage?: string;
  colorIntensity: boolean;
  motion: boolean;
}

const VisualizationCanvas: FC<VisualizationCanvasProps> = ({
  sentiment,
  sentimentScore,
  text,
  isProcessing,
  processingMessage = 'Generating poetic summary...',
  colorIntensity,
  motion
}) => {
  const { canvasRef, saveCanvas } = useP5Visualization({
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
      {/* P5.js Canvas Container */}
      <div ref={canvasRef} className="absolute inset-0"></div>
      
      {/* Floating Info Badge - shows when visualization is active but not processing */}
      {text && !isProcessing && (
        <div className="absolute top-4 left-4 bg-gray-900/80 backdrop-blur-sm rounded-lg p-2 text-xs text-white border border-gray-800 animate-fadeIn transition-all duration-300 z-10">
          <div className="flex items-center space-x-2">
            <span>{getSentimentEmoji(sentiment)}</span>
            <span>{getSentimentDescription(sentiment)}</span>
          </div>
        </div>
      )}
      
      {/* Initial guidance overlay */}
      {showGuidance && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/30 backdrop-blur-sm">
          <div 
            className="max-w-md text-center p-8" 
            style={{ opacity: sparkleOpacity }}
            onClick={() => setSparkleOpacity(prev => prev === 0.6 ? 1 : 0.6)}
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
        <div className="animate-spin mb-4">
          <Loader2 className="h-10 w-10 text-indigo-400" />
        </div>
        <p className="text-lg font-medium text-white">{processingMessage}</p>
        <p className="text-sm text-gray-400 mt-2">Weaving your words into poetic reflection</p>
      </div>
      
      {/* Subtle vignette overlay */}
      <div className="absolute inset-0 pointer-events-none z-5" 
        style={{
          background: 'radial-gradient(circle, transparent 40%, rgba(0,0,0,0.3) 100%)'
        }}
      ></div>
    </section>
  );
};

export default VisualizationCanvas;
