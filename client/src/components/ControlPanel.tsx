import { FC, useState, useRef, useEffect } from 'react';
import { Link } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { 
  cn, 
  getSentimentColorClass, 
  getSentimentEmoji, 
  getSentimentDescription 
} from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, generateNarration } from '@/lib/queryClient';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { 
  Mic, 
  StopCircle, 
  Camera, 
  Volume2, 
  VolumeX, 
  Share2, 
  Download, 
  Copy,
  Save,
  Layers,
  MessageSquare,
  PlayCircle,
  PauseCircle,
  Users
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface ControlPanelProps {
  isListening: boolean;
  onStartSpeaking: () => void;
  onStopSpeaking: () => void;
  transcription: string;
  sentiment: 'Negative' | 'Neutral' | 'Positive';
  sentimentScore: number;
  poeticSummary: string | null;
  isProcessingSummary: boolean;
  onSaveImage: () => void;
  onShareImage?: () => void; // Added share image handler
  isAudioEnabled: boolean;
  onToggleAudio: () => void;
  colorIntensity: boolean;
  motion: boolean;
  onCollaborationToggle?: () => void;
  onClearSummary?: () => void; // Added clear summary handler
}

// Add sentimentScore, colorIntensity, and motion to props
const ControlPanel: FC<ControlPanelProps> = ({
  isListening,
  onStartSpeaking,
  onStopSpeaking,
  transcription,
  sentiment,
  sentimentScore,
  poeticSummary,
  isProcessingSummary,
  onSaveImage,
  onShareImage,
  isAudioEnabled,
  onToggleAudio,
  colorIntensity,
  motion,
  onCollaborationToggle,
  onClearSummary
}) => {
  const { toast } = useToast();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Form state for saving to gallery
  const [galleryItemTitle, setGalleryItemTitle] = useState('');
  const [galleryItemDescription, setGalleryItemDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  
  // State for AI narration
  const [narration, setNarration] = useState<string | null>(null);
  const [isGeneratingNarration, setIsGeneratingNarration] = useState(false);
  
  // Speech synthesis for AI narration
  const { 
    speak, 
    stop: stopSpeaking, 
    isSpeaking, 
    isPaused,
    pause: pauseSpeaking,
    resume: resumeSpeaking,
    isSupported: isSpeechSynthesisSupported
  } = useSpeechSynthesis({
    rate: 0.9,
    pitch: 1.0,
    volume: 1.0
  });
  
  // Generate narration when poetic summary is available
  useEffect(() => {
    if (poeticSummary && !narration && !isGeneratingNarration && transcription) {
      generateAINarration();
    }
  }, [poeticSummary, narration, isGeneratingNarration, transcription]);
  
  // Function to generate AI narration
  const generateAINarration = async () => {
    if (!transcription || isGeneratingNarration) return;
    
    try {
      setIsGeneratingNarration(true);
      const generatedNarration = await generateNarration(transcription);
      setNarration(generatedNarration);
    } catch (error) {
      console.error('Failed to generate narration:', error);
      toast({
        title: 'Narration Error',
        description: 'Could not generate AI narration',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingNarration(false);
    }
  };
  
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
  
  // Save to gallery mutation
  const saveToGalleryMutation = useMutation({
    mutationFn: async (imageData: string) => {
      return apiRequest('/api/gallery', {
        method: 'POST',
        body: {
          title: galleryItemTitle || `VocalEarth Creation - ${new Date().toLocaleDateString()}`,
          description: galleryItemDescription || null,
          transcriptionText: transcription,
          sentiment,
          sentimentScore,
          poeticSummary,
          imageData,
          visualSettings: {
            colorIntensity,
            motion
          },
          isPublic
        }
      });
    },
    onSuccess: () => {
      toast({
        title: 'Saved to Gallery',
        description: 'Your visualization has been saved to your gallery.',
      });
      setSaveDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error Saving',
        description: error instanceof Error ? error.message : 'Failed to save to gallery',
        variant: 'destructive'
      });
    }
  });
  
  // Handle share functionality
  const handleShare = () => {
    if (onShareImage) {
      // Use the provided share function from parent component
      onShareImage();
    } else if (typeof navigator.share === 'function') {
      // Fallback to native share API if available
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
        description: 'Advanced sharing options will be available soon!',
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
  
  // Handle saving to gallery
  const handleSaveToGallery = () => {
    // Find the canvas element - we'll need its image data
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      toast({
        title: 'Error',
        description: 'Canvas not found',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      // Get image data from canvas
      const imageData = canvas.toDataURL('image/png');
      
      // Save to gallery
      saveToGalleryMutation.mutate(imageData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save visualization',
        variant: 'destructive'
      });
    }
  };
  
  // Check if we can show save dialog
  const canSaveToGallery = !!transcription && !isListening && !isProcessingSummary;
  
  return (
    <section className="bg-gray-900/90 backdrop-blur-sm border-l border-gray-800 w-full md:w-96 flex flex-col overflow-hidden">
      {/* Speech Input Controls */}
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-2xl font-semibold mb-3 text-white flex items-center">
          <span className="mr-2">Vocal Earth</span>
          {sentiment && <span className="text-3xl">{getSentimentEmoji(sentiment)}</span>}
        </h2>
        <p className="text-sm text-gray-300 mb-4 leading-relaxed">
          {transcription ? getSentimentDescription(sentiment) : 'Your voice will create a living, surreal landscape that evolves as you speak.'}
        </p>
        
        {/* Speech Controls */}
        <div className="flex flex-col space-y-4">
          <div id="speechStatus" className="rounded-lg bg-gray-800/80 p-4 flex items-center space-x-3 border border-gray-700/30 shadow-inner">
            <div className={`w-4 h-4 rounded-full ${statusInfo.color} ${statusInfo.animation}`}></div>
            <span className="text-sm font-medium text-gray-200">{statusInfo.text}</span>
          </div>
          
          <div className="flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className={cn(
                      "flex-1 py-4 px-5 flex items-center justify-center space-x-2 shadow-lg transition-all duration-300",
                      isListening 
                        ? "bg-rose-700 hover:bg-rose-600 text-white border border-rose-500" 
                        : "bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-500"
                    )}
                    onClick={isListening ? onStopSpeaking : onStartSpeaking}
                  >
                    {isListening ? (
                      <>
                        <StopCircle className="h-5 w-5 mr-2" />
                        <span className="font-medium">End Recording</span>
                      </>
                    ) : (
                      <>
                        <Mic className="h-5 w-5 mr-2" />
                        <span className="font-medium">Start Speaking</span>
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
                    className="bg-indigo-700 hover:bg-indigo-600 text-white border border-indigo-500 shadow-md"
                    onClick={onToggleAudio}
                    aria-label={isAudioEnabled ? "Mute audio" : "Enable audio"}
                    size="lg"
                  >
                    {isAudioEnabled ? (
                      <Volume2 className="h-5 w-5" />
                    ) : (
                      <VolumeX className="h-5 w-5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isAudioEnabled ? "Disable ambient sound" : "Enable ambient sound"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {onCollaborationToggle && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="bg-purple-700 hover:bg-purple-600 text-white border border-purple-500 shadow-md"
                      onClick={onCollaborationToggle}
                      size="lg"
                    >
                      <Users className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Start or join collaborative session</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </div>
      
      {/* Current Transcription */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-white flex items-center">
            <MessageSquare className="h-4 w-4 mr-2 text-indigo-400" />
            Your Speech
          </h3>
          {sentiment && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={`px-4 py-1.5 rounded-full text-sm font-semibold shadow-md ${getSentimentColorClass(sentiment)}`}>
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
        
        <div className="rounded-lg bg-gray-800/70 border border-gray-700/50 p-5 min-h-[120px] mb-5 text-sm shadow-inner">
          {transcription ? (
            <p className="text-gray-200">{transcription}</p>
          ) : (
            <p className="text-gray-500 italic">Your spoken words will appear here as you speak...</p>
          )}
        </div>
        
        {/* Poetic Summary (Hidden until generated) */}
        {poeticSummary && (
          <div className="rounded-lg bg-gray-800/80 p-5 border border-indigo-900/40 mb-5 shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center">
                <span className="mr-2">✨ Poetic Interpretation</span>
              </h3>
              <div className="flex space-x-1">
                {/* Copy button */}
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
                
                {/* Clear Summary button */}
                {onClearSummary && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={onClearSummary}
                          className="h-7 w-7 p-0"
                        >
                          <StopCircle className="h-3.5 w-3.5 text-gray-400" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Clear summary</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
            <p className="text-sm italic text-gray-300">{poeticSummary}</p>
          </div>
        )}
        
        {/* AI Narration */}
        {narration && (
          <div className="rounded-lg bg-indigo-900/40 p-5 border border-indigo-800/50 mb-5 shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center">
                <MessageSquare className="h-4 w-4 mr-2 text-indigo-400" />
                <span>AI Landscape Guide</span>
              </h3>
              <div className="flex space-x-1">
                {/* Play/Pause button */}
                {isSpeechSynthesisSupported && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0"
                          onClick={() => {
                            if (isSpeaking) {
                              if (isPaused) {
                                resumeSpeaking();
                              } else {
                                pauseSpeaking();
                              }
                            } else {
                              speak(narration);
                            }
                          }}
                        >
                          {isSpeaking ? (
                            isPaused ? (
                              <PlayCircle className="h-4 w-4 text-indigo-400" />
                            ) : (
                              <PauseCircle className="h-4 w-4 text-indigo-400" />
                            )
                          ) : (
                            <PlayCircle className="h-4 w-4 text-indigo-400" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isSpeaking ? (isPaused ? "Resume narration" : "Pause narration") : "Play narration"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                
                {/* Copy button */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 w-7 p-0"
                        onClick={() => {
                          if (narration) {
                            navigator.clipboard.writeText(narration);
                            toast({
                              title: 'Copied!',
                              description: 'Narration copied to clipboard',
                            });
                          }
                        }}
                      >
                        <Copy className="h-3.5 w-3.5 text-gray-400" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy narration</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            <p className="text-sm text-indigo-200">{narration}</p>
            
            {!isSpeechSynthesisSupported && (
              <p className="text-xs text-indigo-400 mt-2">
                Note: Your browser doesn't support speech synthesis. You can still read the narration.
              </p>
            )}
          </div>
        )}
        
        {/* Narration loading */}
        {isGeneratingNarration && !narration && (
          <div className="rounded-lg bg-indigo-900/30 p-4 border border-indigo-800/40 mb-4 flex items-center">
            <div className="animate-spin mr-3">
              <MessageSquare className="h-4 w-4 text-indigo-400" />
            </div>
            <span className="text-sm text-indigo-200">Generating AI landscape narration...</span>
          </div>
        )}
        
        {/* Gallery Link (if there's content) */}
        {transcription && (
          <Link href="/gallery">
            <div className="rounded-lg bg-indigo-900/30 border border-indigo-800/40 p-3 mb-4 flex items-center justify-between hover:bg-indigo-900/40 transition-colors cursor-pointer">
              <div className="flex items-center">
                <Layers className="h-4 w-4 mr-2 text-indigo-400" />
                <span className="text-sm text-indigo-300">View your gallery</span>
              </div>
              <span className="text-xs text-indigo-400">→</span>
            </div>
          </Link>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="p-4 border-t border-gray-800 bg-gray-900/70">
        <div className="grid grid-cols-3 gap-2">
          {/* Save to Gallery Dialog */}
          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-indigo-700 hover:bg-indigo-600 text-white col-span-2 py-2 flex items-center justify-center"
                disabled={!canSaveToGallery}
              >
                <Save className="h-4 w-4 mr-2" />
                <span>Save to Gallery</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle>Save to Gallery</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Save your vocal landscape to revisit and share later.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={galleryItemTitle}
                    onChange={(e) => setGalleryItemTitle(e.target.value)}
                    placeholder="My Vocal Landscape"
                    className="col-span-3 bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={galleryItemDescription}
                    onChange={(e) => setGalleryItemDescription(e.target.value)}
                    placeholder="Optional description..."
                    className="col-span-3 bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="public" className="text-right">
                    Public
                  </Label>
                  <div className="flex items-center space-x-2 col-span-3">
                    <Switch
                      id="public"
                      checked={isPublic}
                      onCheckedChange={setIsPublic}
                    />
                    <span className="text-sm text-gray-400">
                      {isPublic ? "Visible to everyone" : "Only visible to you"}
                    </span>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setSaveDialogOpen(false)} className="border-gray-700 text-gray-300">
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveToGallery}
                  className="bg-indigo-700 hover:bg-indigo-600 text-white"
                  disabled={saveToGalleryMutation.isPending}
                >
                  {saveToGalleryMutation.isPending ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Saving...
                    </>
                  ) : (
                    <>Save</>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Download Image Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="bg-indigo-700 hover:bg-indigo-600 text-white"
                  onClick={onSaveImage}
                  disabled={!transcription}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download image to your device</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Share Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="bg-indigo-700 hover:bg-indigo-600 text-white"
                  onClick={handleShare}
                  aria-label="Share"
                  disabled={!transcription}
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
