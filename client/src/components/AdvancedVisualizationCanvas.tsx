import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useAdvanced3DVisualization } from '@/hooks/useAdvanced3DVisualization';
import { 
  Trash,
  MessageSquare,
  Mic,
  MicOff,
  Lightbulb
} from 'lucide-react';

interface AdvancedVisualizationCanvasProps {
  sentiment: 'Negative' | 'Neutral' | 'Positive';
  sentimentScore: number;
  text: string;
  isProcessing: boolean;
  processingMessage?: string;
  colorIntensity: boolean;
  motion: boolean;
  onClearSummary?: () => void; // For clearing summary
}

/**
 * Advanced 3D visualization canvas with enhanced features:
 * - More complex 3D terrain with realistic shading and lighting effects
 * - Particle systems that respond more dynamically to speech emotion
 * - More sophisticated color transitions based on sentiment analysis
 * - Interactive elements that respond to mouse movements
 * - Visual overlays showing emotional patterns over time
 */
export default function AdvancedVisualizationCanvas({
  sentiment,
  sentimentScore,
  text,
  isProcessing,
  processingMessage = 'Generating poetic description...',
  colorIntensity,
  motion,
  onClearSummary
}: AdvancedVisualizationCanvasProps) {
  // Use the advanced 3D visualization hook
  // Use the advanced 3D visualization hook - make sure to keep animation running during recording
  const { canvasRef, dimensions, emotionHistory } = useAdvanced3DVisualization({
    sentiment,
    sentimentScore,
    text,
    motion,
    colorIntensity,
    interactivity: true, // Enable mouse interaction
    keepAnimating: true // Keep animation running during voice recording
  });
  
  // Animation state for text processing
  const [processedWords, setProcessedWords] = useState<string[]>([]);
  const [displayText, setDisplayText] = useState('');
  const wordsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Generate a color palette based on sentiment
  const getColors = () => {
    if (sentiment === 'Positive') {
      return {
        primary: colorIntensity ? '#00b4d8' : '#8ecae6',   // Bright blue
        secondary: colorIntensity ? '#06d6a0' : '#95d5b2', // Bright teal
        accent: colorIntensity ? '#ffdd00' : '#ffd166',    // Bright yellow
        background: '#023047'                              // Deep blue bg
      };
    } else if (sentiment === 'Negative') {
      return {
        primary: colorIntensity ? '#9b2226' : '#ae2012',   // Dark red
        secondary: colorIntensity ? '#bb3e03' : '#ca6702', // Dark orange
        accent: colorIntensity ? '#ee9b00' : '#e9c46a',    // Gold
        background: '#001219'                              // Very dark blue-green
      };
    } else {
      return {
        primary: colorIntensity ? '#4895ef' : '#4cc9f0',   // Medium blue
        secondary: colorIntensity ? '#4361ee' : '#4361ee', // Medium purple
        accent: colorIntensity ? '#3f37c9' : '#3a0ca3',    // Deep purple
        background: '#240046'                              // Deep purple bg
      };
    }
  };
  
  const colors = getColors();
  
  // Animate the processing text
  useEffect(() => {
    if (isProcessing) {
      // Split the text into words
      const words = text.split(' ').filter(word => word.trim() !== '');
      setProcessedWords(words);
      
      // Start with an empty display
      setDisplayText('');
      
      // Animate words appearing one by one
      let currentIndex = 0;
      
      const animateNextWord = () => {
        if (currentIndex < words.length) {
          setDisplayText(prev => 
            prev + (prev ? ' ' : '') + words[currentIndex]
          );
          currentIndex++;
          
          // Schedule the next word
          wordsTimeoutRef.current = setTimeout(
            animateNextWord, 
            Math.random() * 100 + 100 // Random timing between 100-200ms
          );
        }
      };
      
      // Start the animation
      wordsTimeoutRef.current = setTimeout(animateNextWord, 500);
      
      // Cleanup
      return () => {
        if (wordsTimeoutRef.current) {
          clearTimeout(wordsTimeoutRef.current);
        }
      };
    }
  }, [isProcessing, text]);
  
  return (
    <div className="relative w-full h-full overflow-hidden bg-black rounded-lg">
      {/* Advanced 3D visualization canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full z-10"
      />
      
      {/* Processing overlay */}
      {isProcessing && (
        <div className="absolute inset-0 z-20 bg-black/30 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
          <div className="text-xl font-bold mb-2" style={{ color: colors.accent }}>
            {processingMessage}
          </div>
          
          <div className="w-full max-w-3xl my-6 overflow-hidden">
            <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-300 ease-out rounded-full"
                style={{ 
                  width: `${(processedWords.length > 0 ? displayText.split(' ').length / processedWords.length : 0) * 100}%`,
                  backgroundColor: colors.accent
                }}
              />
            </div>
          </div>
          
          <div 
            className="text-sm max-w-2xl overflow-hidden text-gray-200 whitespace-pre-wrap h-40 overflow-y-auto"
            style={{ 
              textShadow: `0 0 10px ${colors.primary}40`,
            }}
          >
            {displayText}
          </div>
        </div>
      )}
      
      {/* Recording indicator */}
      {text && !isProcessing && (
        <div className="absolute bottom-4 right-4 z-30">
          <div 
            className="flex items-center space-x-2 px-4 py-2 rounded-full text-sm"
            style={{ 
              backgroundColor: `${colors.background}CC`,
              border: `1px solid ${colors.primary}40`,
            }}
          >
            <Mic className="w-4 h-4 text-green-400 animate-pulse" />
            <span className="text-white">Recording in progress</span>
          </div>
        </div>
      )}
      
      {/* Clear Summary button */}
      {onClearSummary && !isProcessing && (
        <div className="absolute top-4 right-4 z-30">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearSummary}
            className="bg-black/40 border-gray-600 hover:bg-black/60 text-white"
          >
            <Trash className="w-4 h-4 mr-2" />
            <span>Clear Summary</span>
          </Button>
        </div>
      )}
      
      {/* Emotion stats */}
      <div className="absolute top-4 left-4 z-30">
        <div 
          className="flex items-center space-x-2 px-4 py-2 rounded-full text-sm"
          style={{ 
            backgroundColor: `${colors.background}CC`,
            border: `1px solid ${colors.primary}40`
          }}
        >
          <div 
            className="w-3 h-3 rounded-full"
            style={{ 
              backgroundColor: 
                sentiment === 'Positive' ? '#06d6a0' : 
                sentiment === 'Negative' ? '#ef476f' : 
                '#118ab2'
            }}
          />
          <span className="text-white">
            {sentiment === 'Positive' ? 'Positive' : 
             sentiment === 'Negative' ? 'Negative' : 
             'Neutral'} ({sentimentScore.toFixed(2)})
          </span>
        </div>
      </div>
      
      {/* Visualization help tooltip */}
      <div className="absolute bottom-4 left-4 z-30 opacity-60 hover:opacity-100 transition-opacity">
        <div 
          className="flex items-center space-x-2 px-3 py-1 rounded-full text-xs"
          style={{ 
            backgroundColor: `${colors.background}CC`,
            border: `1px solid ${colors.primary}40`
          }}
        >
          <Lightbulb className="w-3 h-3" />
          <span className="text-white">
            Move mouse to interact with the visualization
          </span>
        </div>
      </div>
    </div>
  );
}