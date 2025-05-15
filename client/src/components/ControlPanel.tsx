import { FC, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn, getSentimentColorClass } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Mic, StopCircle, Camera, Volume2, VolumeX, Share2 } from 'lucide-react';

interface ControlPanelProps {
  isListening: boolean;
  onStartSpeaking: () => void;
  onStopSpeaking: () => void;
  transcription: string;
  sentiment: 'Negative' | 'Neutral' | 'Positive';
  poeticSummary: string | null;
  isProcessingSummary: boolean;
  onSaveImage: () => void;
  isAudioEnabled: boolean;
  onToggleAudio: () => void;
}

const ControlPanel: FC<ControlPanelProps> = ({
  isListening,
  onStartSpeaking,
  onStopSpeaking,
  transcription,
  sentiment,
  poeticSummary,
  isProcessingSummary,
  onSaveImage,
  isAudioEnabled,
  onToggleAudio
}) => {
  const { toast } = useToast();
  
  // Helper function to determine status text and color
  const getStatusInfo = () => {
    if (isListening) {
      return {
        text: 'Listening...',
        color: 'bg-success'
      };
    } else if (isProcessingSummary) {
      return {
        text: 'Processing...',
        color: 'bg-warning'
      };
    } else {
      return {
        text: 'Ready to listen',
        color: 'bg-warning'
      };
    }
  };
  
  const statusInfo = getStatusInfo();
  
  // Handle share functionality
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Vocal Earth Creation',
        text: poeticSummary || 'Check out the surreal landscape I created with my voice on Vocal Earth!',
      }).catch(error => {
        toast({
          title: 'Share Failed',
          description: 'Could not share content.',
          variant: 'destructive'
        });
      });
    } else {
      toast({
        title: 'Share Unavailable',
        description: 'Sharing is not supported in your browser.',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <section className="bg-dark-100 border-l border-dark-200 w-full md:w-96 flex flex-col overflow-hidden">
      {/* Speech Input Controls */}
      <div className="p-4 border-b border-dark-200">
        <h2 className="text-lg font-poppins font-medium mb-3">Speak to Create</h2>
        <p className="text-sm text-dark-500 mb-4">
          Your voice will be transformed into a living, surreal landscape that evolves as you speak.
        </p>
        
        {/* Speech Controls */}
        <div className="flex flex-col space-y-4">
          <div id="speechStatus" className="rounded-lg bg-dark-200 p-3 flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${statusInfo.color} ${isListening ? 'animate-pulse' : ''}`}></div>
            <span className="text-sm">{statusInfo.text}</span>
          </div>
          
          <div className="flex space-x-2">
            <Button
              className={cn(
                "flex-1 py-3 px-4 flex items-center justify-center space-x-2",
                isListening ? "bg-dark-300 hover:bg-dark-400" : "bg-primary hover:bg-primary-light"
              )}
              onClick={isListening ? onStopSpeaking : onStartSpeaking}
            >
              <Mic className="h-4 w-4 mr-2" />
              <span>{isListening ? "Listening..." : "Start Speaking"}</span>
            </Button>
            
            <Button
              className="bg-dark-300 hover:bg-dark-400 py-3 px-4"
              disabled={!isListening}
              onClick={onStopSpeaking}
            >
              <StopCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Current Transcription */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">Current Transcription</h3>
          <span className={`px-2 py-1 rounded text-xs ${getSentimentColorClass(sentiment)}`}>
            {sentiment}
          </span>
        </div>
        
        <div className="rounded-lg bg-dark-200 p-4 min-h-[100px] mb-4 text-sm">
          {transcription ? (
            <p>{transcription}</p>
          ) : (
            <p className="text-dark-500 italic">Your spoken words will appear here as you speak...</p>
          )}
        </div>
        
        {/* Poetic Summary (Hidden until generated) */}
        {poeticSummary && (
          <div className="rounded-lg bg-dark-300 p-4 border border-dark-400 mb-4">
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <i className="ri-quill-pen-line mr-2 text-secondary"></i>
              Poetic Summary
            </h3>
            <p className="text-sm italic">{poeticSummary}</p>
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="p-4 border-t border-dark-200 bg-dark-100">
        <div className="flex space-x-2">
          <Button
            className="flex-1 bg-dark-300 hover:bg-dark-400 py-2 px-4 flex items-center justify-center space-x-2"
            onClick={onSaveImage}
          >
            <Camera className="h-4 w-4 mr-2" />
            <span>Save Image</span>
          </Button>
          
          <Button
            className="bg-dark-300 hover:bg-dark-400 py-2 px-3"
            onClick={onToggleAudio}
            aria-label={isAudioEnabled ? "Mute audio" : "Enable audio"}
          >
            {isAudioEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            className="bg-dark-300 hover:bg-dark-400 py-2 px-3"
            onClick={handleShare}
            aria-label="Share"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ControlPanel;
