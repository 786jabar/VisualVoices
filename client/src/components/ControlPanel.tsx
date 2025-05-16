import { FC, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  cn, 
  getSentimentColorClass, 
  getSentimentEmoji, 
  getSentimentDescription 
} from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { 
  Mic, 
  StopCircle, 
  Camera, 
  Volume2, 
  VolumeX, 
  Share2, 
  Download, 
  Copy 
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
        color: 'bg-emerald-500',
        animation: 'animate-pulse'
      };
    } else if (isProcessingSummary) {
      return {
        text: 'Generating Poetic Summary...',
        color: 'bg-amber-500',
        animation: 'animate-pulse'
      };
    } else if (transcription) {
      return {
        text: 'Ready to capture more words',
        color: 'bg-indigo-500',
        animation: ''
      };
    } else {
      return {
        text: 'Ready to listen',
        color: 'bg-slate-400',
        animation: ''
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
  
  // Handle copy to clipboard
  const handleCopyText = () => {
    const textToCopy = poeticSummary || transcription;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        toast({
          title: 'Copied!',
          description: 'Text copied to clipboard',
        });
      }).catch(() => {
        toast({
          title: 'Copy Failed',
          description: 'Could not copy text to clipboard',
          variant: 'destructive'
        });
      });
    }
  };
  
  return (
    <section className="bg-gray-900/90 backdrop-blur-sm border-l border-gray-800 w-full md:w-96 flex flex-col overflow-hidden">
      {/* Speech Input Controls */}
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-2xl font-semibold mb-3 text-white flex items-center">
          <span className="mr-2">Vocal Earth</span>
          {sentiment && <span>{getSentimentEmoji(sentiment)}</span>}
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          {transcription ? getSentimentDescription(sentiment) : 'Your voice will create a living, surreal landscape that evolves as you speak.'}
        </p>
        
        {/* Speech Controls */}
        <div className="flex flex-col space-y-4">
          <div id="speechStatus" className="rounded-lg bg-gray-800/70 p-3 flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${statusInfo.color} ${statusInfo.animation}`}></div>
            <span className="text-sm text-gray-300">{statusInfo.text}</span>
          </div>
          
          <div className="flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className={cn(
                      "flex-1 py-3 px-4 flex items-center justify-center space-x-2",
                      isListening 
                        ? "bg-rose-700 hover:bg-rose-600 text-white" 
                        : "bg-emerald-700 hover:bg-emerald-600 text-white"
                    )}
                    onClick={isListening ? onStopSpeaking : onStartSpeaking}
                  >
                    {isListening ? (
                      <>
                        <StopCircle className="h-4 w-4 mr-2" />
                        <span>End Recording</span>
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4 mr-2" />
                        <span>Start Speaking</span>
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isListening ? "Stop recording and generate summary" : "Begin voice recording"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="bg-indigo-700 hover:bg-indigo-600 text-white"
                    onClick={onToggleAudio}
                    aria-label={isAudioEnabled ? "Mute audio" : "Enable audio"}
                  >
                    {isAudioEnabled ? (
                      <Volume2 className="h-4 w-4" />
                    ) : (
                      <VolumeX className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isAudioEnabled ? "Disable ambient sound" : "Enable ambient sound"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      
      {/* Current Transcription */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-white">Your Speech</h3>
          {sentiment && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSentimentColorClass(sentiment)}`}>
                    {getSentimentEmoji(sentiment)} {sentiment}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{getSentimentDescription(sentiment)}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        <div className="rounded-lg bg-gray-800/50 border border-gray-700 p-4 min-h-[100px] mb-4 text-sm">
          {transcription ? (
            <p className="text-gray-200">{transcription}</p>
          ) : (
            <p className="text-gray-500 italic">Your spoken words will appear here as you speak...</p>
          )}
        </div>
        
        {/* Poetic Summary (Hidden until generated) */}
        {poeticSummary && (
          <div className="rounded-lg bg-gray-800/60 p-4 border border-gray-700 mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-white flex items-center">
                <span className="mr-2">✨ Poetic Interpretation</span>
              </h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={handleCopyText} className="h-7 w-7 p-0">
                      <Copy className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy to clipboard</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-sm italic text-gray-300">{poeticSummary}</p>
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="p-4 border-t border-gray-800 bg-gray-900/70">
        <div className="grid grid-cols-3 gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="bg-indigo-700 hover:bg-indigo-600 text-white col-span-2 py-2 flex items-center justify-center"
                  onClick={onSaveImage}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  <span>Save Landscape</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download this landscape as an image</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="bg-indigo-700 hover:bg-indigo-600 text-white py-2 px-3"
                  onClick={handleShare}
                  aria-label="Share"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share this creation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Info text */}
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500">
            {transcription ? 'Continue speaking to evolve your world, or save your creation.' : 'Start speaking to create your unique world.'}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ControlPanel;
