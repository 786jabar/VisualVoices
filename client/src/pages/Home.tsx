import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { downloadCanvasAsImage } from '@/lib/utils';
import { generatePoeticSummary } from '@/lib/queryClient';
import Header from '@/components/Header';
import VisualizationCanvas from '@/components/VisualizationCanvas';
import ControlPanel from '@/components/ControlPanel';
import HelpModal from '@/components/HelpModal';
import SettingsModal from '@/components/SettingsModal';
import EmotionTracker from '@/components/EmotionTracker';
import SocialShareModal from '@/components/SocialShareModal';
import DashboardLandscapes from '@/components/DashboardLandscapes';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSentimentAnalysis } from '@/hooks/useSentimentAnalysis';
import { useToneAudio } from '@/hooks/useToneAudio';
import { useAudioCoordinator } from '@/hooks/useAudioCoordinator';
import { SupportedLanguage } from '@/hooks/useSpeechSynthesis';

export default function Home() {
  const { toast } = useToast();
  
  // State for modals
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareImageUrl, setShareImageUrl] = useState<string>('');
  
  // Define settings type
  interface AppSettings {
    audioEnabled: boolean;
    audioVolume: number;
    colorIntensity: boolean;
    motionEffects: boolean;
    language: SupportedLanguage;
  }
  
  // State for settings
  const [settings, setSettings] = useState<AppSettings>({
    audioEnabled: true,
    audioVolume: 0.6,
    colorIntensity: true,
    motionEffects: true,
    language: 'en-US'
  });
  
  // State for poetic summary
  const [poeticSummary, setPoeticSummary] = useState<string | null>(null);
  
  // Speech recognition hook
  const { 
    isListening, 
    transcript, 
    finalTranscript,
    error: speechError, 
    startListening, 
    stopListening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();
  
  // Sentiment analysis hook
  const { sentiment, score: sentimentScore, error: sentimentError } = useSentimentAnalysis(transcript);
  
  // Use audio coordinator to prevent conflicts with gallery audio
  const { isActive: isAudioApproved, requestPlayback, stopPlayback } = useAudioCoordinator('home-dashboard');
  
  // Audio hook for tone generation
  const { 
    initialize: initializeAudio, 
    isInitialized: isAudioInitialized,
    isPlaying: isAudioPlaying,
    togglePlay: toggleAudio 
  } = useToneAudio({
    sentiment,
    sentimentScore,
    isActive: settings.audioEnabled && isAudioApproved,
    volume: settings.audioVolume
  });
  
  // Mutation for generating poetic summary
  const summaryMutation = useMutation({
    mutationFn: (text: string) => generatePoeticSummary(text),
    onSuccess: (data) => {
      setPoeticSummary(data);
    },
    onError: (error) => {
      toast({
        title: 'Error Generating Summary',
        description: error instanceof Error ? error.message : 'Failed to generate poetic summary',
        variant: 'destructive'
      });
    }
  });
  
  // Initialize audio when the component mounts
  useEffect(() => {
    const initAudio = async () => {
      try {
        await initializeAudio();
      } catch (error) {
        console.error('Failed to initialize audio:', error);
      }
    };
    
    initAudio();
  }, [initializeAudio]);
  
  // Show error toast when speech recognition errors occur
  useEffect(() => {
    if (speechError) {
      toast({
        title: 'Speech Recognition Error',
        description: speechError,
        variant: 'destructive'
      });
    }
  }, [speechError, toast]);
  
  // Handle start speaking
  const handleStartSpeaking = async () => {
    try {
      // Reset previous state
      resetTranscript();
      setPoeticSummary(null);
      
      // Start listening
      startListening();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start speech recognition',
        variant: 'destructive'
      });
    }
  };
  
  // Handle stop speaking
  const handleStopSpeaking = async () => {
    try {
      // Stop listening
      stopListening();
      
      // Generate poetic summary if we have transcription
      if (transcript.trim()) {
        summaryMutation.mutate(transcript);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process speech',
        variant: 'destructive'
      });
    }
  };
  
  // Handle save image
  const handleSaveImage = async () => {
    try {
      const canvas = document.querySelector('canvas');
      if (!canvas) {
        throw new Error('Canvas not found');
      }
      
      // Get data URL from canvas for sharing
      const dataUrl = canvas.toDataURL('image/png');
      setShareImageUrl(dataUrl);
      
      downloadCanvasAsImage(canvas);
      
      toast({
        title: 'Image Saved',
        description: 'Your landscape has been saved to your gallery.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save image',
        variant: 'destructive'
      });
    }
  };
  
  // Handle share visualization
  const handleShare = () => {
    try {
      const canvas = document.querySelector('canvas');
      if (!canvas) {
        throw new Error('Canvas not found');
      }
      
      // Get data URL from canvas for sharing
      const dataUrl = canvas.toDataURL('image/png');
      setShareImageUrl(dataUrl);
      
      // Open share modal
      setIsShareModalOpen(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to prepare visualization for sharing',
        variant: 'destructive'
      });
    }
  };
  
  // Handle toggle audio with global coordination
  const handleToggleAudio = async () => {
    if (settings.audioEnabled) {
      // Turn off audio
      setSettings({...settings, audioEnabled: false});
      
      // Release global audio lock
      stopPlayback();
      
      // Toggle audio if necessary
      if (isAudioInitialized && isAudioPlaying) {
        try {
          await toggleAudio();
        } catch (error) {
          console.error('Error stopping audio:', error);
        }
      }
    } else {
      // Request global audio permission
      const granted = requestPlayback();
      
      if (granted) {
        if (!isAudioInitialized) {
          // Initialize audio if not already done
          try {
            await initializeAudio();
            setSettings({...settings, audioEnabled: true});
          } catch (error) {
            toast({
              title: 'Audio Error',
              description: 'Failed to initialize audio',
              variant: 'destructive'
            });
          }
        } else {
          // Toggle audio state
          setSettings({...settings, audioEnabled: true});
          
          // Start audio if it's not playing
          if (!isAudioPlaying) {
            try {
              await toggleAudio();
            } catch (error) {
              console.error('Error starting audio:', error);
            }
          }
        }
      }
    }
  };
  
  // Show browser support warning if needed
  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      toast({
        title: 'Browser Not Supported',
        description: 'Your browser does not support speech recognition. Please try Chrome, Edge, or Safari.',
        variant: 'destructive'
      });
    }
  }, [browserSupportsSpeechRecognition, toast]);
  
  return (
    <div className="relative h-screen flex flex-col overflow-hidden bg-black text-white">
      {/* Header */}
      <Header 
        onHelpClick={() => setIsHelpModalOpen(true)}
        onSettingsClick={() => setIsSettingsModalOpen(true)}
      />
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Background Landscapes - rotates landscapes every 15 seconds */}
        <div className="fixed inset-0 w-full h-full z-0">
          <DashboardLandscapes isActive={!isListening && !transcript} />
        </div>
        
        {/* Dashboard Content with glass morphism */}
        <div className="relative z-10 flex flex-col lg:flex-row w-full h-full">
          {/* Left Panel - Visualization Area */}
          <div className="lg:w-2/3 relative flex flex-col h-full">
            {/* Active Visualization Canvas - shows when speaking/processing */}
            <div className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${isListening || transcript ? 'opacity-100' : 'opacity-0'}`}>
              <VisualizationCanvas 
                sentiment={sentiment}
                sentimentScore={sentimentScore}
                text={transcript}
                isProcessing={summaryMutation.isPending}
                colorIntensity={settings.colorIntensity}
                motion={settings.motionEffects}
              />
            </div>
            
            {/* Dashboard Central Title - shows when not actively visualizing */}
            <div 
              className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${!isListening && !transcript ? 'opacity-100' : 'opacity-0'}`}
            >
              <div className="text-center p-8 backdrop-blur-md bg-black/40 rounded-xl max-w-md border border-white/10 shadow-xl">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
                  Vocal Earth
                </h1>
                <p className="text-lg text-gray-200 mb-6">
                  Transform your voice into stunning visual landscapes powered by AI
                </p>
                <button 
                  onClick={handleStartSpeaking}
                  className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-full font-medium hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg"
                >
                  Start Speaking
                </button>
              </div>
            </div>
            
            {/* Emotion Tracker - always visible on top */}
            <div className="absolute bottom-4 left-4 z-20">
              <EmotionTracker 
                sentimentScore={sentimentScore} 
                transcript={transcript}
                isListening={isListening}
                className="w-60 md:w-72 bg-black/50 backdrop-blur-sm p-3 rounded-lg border border-white/10"
              />
            </div>
          </div>
          
          {/* Right Panel - Controls */}
          <div className="lg:w-1/3 backdrop-blur-md bg-black/50 border-l border-gray-800/50 p-4 overflow-auto">
            <ControlPanel 
              isListening={isListening}
              onStartSpeaking={handleStartSpeaking}
              onStopSpeaking={handleStopSpeaking}
              transcription={transcript}
              sentiment={sentiment}
              sentimentScore={sentimentScore}
              poeticSummary={poeticSummary}
              isProcessingSummary={summaryMutation.isPending}
              onSaveImage={handleSaveImage}
              onShareImage={handleShare}
              isAudioEnabled={settings.audioEnabled}
              onToggleAudio={handleToggleAudio}
              colorIntensity={settings.colorIntensity}
              motion={settings.motionEffects}
            />
          </div>
        </div>
      </main>
      
      {/* Modals */}
      <HelpModal 
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
      
      <SettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />
      
      {/* Social Share Modal */}
      <SocialShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        imageUrl={shareImageUrl}
        title="My Vocal Earth Creation"
        description={transcript || undefined}
        poeticSummary={poeticSummary}
      />
    </div>
  );
}
