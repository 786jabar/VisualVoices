import { FC, useState } from 'react';
import { useP5Visualization } from '@/hooks/useP5Visualization';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

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
  processingMessage = 'Processing your narrative...',
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

  return (
    <section id="visualizationContainer" className="relative flex-1 bg-dark overflow-hidden">
      {/* P5.js Canvas Container */}
      <div ref={canvasRef} className="absolute inset-0"></div>
      
      {/* Overlay for loading states */}
      <div 
        className={cn(
          "absolute inset-0 bg-dark bg-opacity-80 flex flex-col items-center justify-center z-10 transition-opacity duration-300",
          isProcessing ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="animate-spin mb-4">
          <Loader2 className="h-8 w-8 text-primary" />
        </div>
        <p className="text-lg font-medium">{processingMessage}</p>
        <p className="text-sm text-dark-500 mt-2">Creating your surreal landscape</p>
      </div>
    </section>
  );
};

export default VisualizationCanvas;
