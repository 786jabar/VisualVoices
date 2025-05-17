import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { use3DVisualization } from '@/hooks/use3DVisualization';
// Import from Lucide React instead
import { 
  Trash as IconTrash,
  MessageSquare as IconMessage, 
  Mic as IconMicrophone,
  MicOff as IconMicrophoneOff,
  Lightbulb as IconBulb
} from 'lucide-react';

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
 * with improved stability and less resource usage
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
  // Use the 3D visualization hook for continuous animation
  const { canvasRef, getColors } = use3DVisualization({
    sentiment,
    sentimentScore,
    text,
    motion,
    colorIntensity
  });
  
  // Local state for processing indicator animation
  const [processedWords, setProcessedWords] = useState<string[]>([]);
  const [displayText, setDisplayText] = useState('');
  const wordsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Color palette for the current sentiment
  const colors = getColors();
  
  // Animate the processing text
  useEffect(() => {
    if (isProcessing) {
      // Split the text into an array of words
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
      {/* Main 3D canvas - always renders */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full z-10"
      />
      
      {/* Show the processing overlay when generating AI summary */}
      {isProcessing && (
        <div className="absolute inset-0 z-20 bg-black/20 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
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
      
      {/* Speech indicator */}
      {text && !isProcessing && (
        <div className="absolute bottom-4 right-4 z-30">
          <div 
            className="flex items-center space-x-2 px-4 py-2 rounded-full text-sm"
            style={{ 
              backgroundColor: `${colors.background}CC`,
              border: `1px solid ${colors.primary}40`,
            }}
          >
            <IconMicrophone className="w-4 h-4 text-green-400 animate-pulse" />
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
            <IconTrash className="w-4 h-4 mr-2" />
            <span>Clear Summary</span>
          </Button>
        </div>
      )}
      
      {/* Sentiment indicator */}
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
    </div>
  );
}