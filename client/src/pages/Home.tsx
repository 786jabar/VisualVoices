import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { downloadCanvasAsImage } from '@/lib/utils';
import { generatePoeticSummary } from '@/lib/queryClient';
import Header from '@/components/Header';
import AdvancedVisualizationCanvas from '@/components/AdvancedVisualizationCanvas';
import ControlPanel from '@/components/ControlPanel';
import HelpModal from '@/components/HelpModal';
import SettingsModal from '@/components/SettingsModal';
import EmotionTracker from '@/components/EmotionTracker';
import SocialShareModal from '@/components/SocialShareModal';
import DashboardLandscapes from '@/components/DashboardLandscapes';
import CreativitySparkButton from '@/components/CreativitySparkButton';
import TransformationToast from '@/components/TransformationToast';
import CollaborativeVisualizer from '@/components/CollaborativeVisualizer';
import VisualizationThemeToggle, { VisualizationTheme } from '@/components/VisualizationThemeToggle';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSentimentAnalysis } from '@/hooks/useSentimentAnalysis';
import { use3DAudio } from '@/hooks/use3DAudio';
import { useAudioCoordinator } from '@/hooks/useAudioCoordinator';
import { SupportedLanguage } from '@/hooks/useSpeechSynthesis';
import { 
  applyRandomTransformation,
  type CreativeTransformation 
} from '@/lib/creativityTransformations';

export default function Home() {
  const { toast } = useToast();
  
  // State for modals
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCollaborationActive, setIsCollaborationActive] = useState(false);
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
  
  // State for Creativity Spark feature
  const [activeTransformation, setActiveTransformation] = useState<CreativeTransformation | null>(null);
  const [showTransformationToast, setShowTransformationToast] = useState(false);
  const [transformedColors, setTransformedColors] = useState({
    primary: '#3b5998',
    secondary: '#192a56',
    accent: '#4bcffa'
  });
  
  // State for visualization themes
  const [currentThemeId, setCurrentThemeId] = useState<string>('cosmic-blue');
  const [originalState, setOriginalState] = useState<{
    sentiment: number;
    colors: { primary: string; secondary: string; accent: string; };
    motion: boolean;
    intensity: boolean;
  } | null>(null);
  
  // Refs for sound effects
  const sparkleAudioRef = useRef<HTMLAudioElement | null>(null);
  const whooshAudioRef = useRef<HTMLAudioElement | null>(null);
  const chimeAudioRef = useRef<HTMLAudioElement | null>(null);
  const magicalAudioRef = useRef<HTMLAudioElement | null>(null);
  
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
  
  // Enhanced 3D audio hook with stable playback during voice recording
  const { 
    initialize: initializeAudio, 
    isInitialized: isAudioInitialized,
    isPlaying: isAudioPlaying,
    startPlayback: startAudioPlayback,
    stopPlayback: stopAudioPlayback
  } = use3DAudio({
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
  
  // Handle theme change
  const handleThemeChange = (theme: VisualizationTheme) => {
    setCurrentThemeId(theme.id);
    setTransformedColors(theme.colors);
    
    // Show a toast notification for the theme change
    toast({
      title: 'Theme Changed',
      description: `Applied '${theme.name}' theme`,
    });
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
  
  // Function to handle the creativity spark button click
  const handleCreativitySpark = () => {
    // Get current state to apply transformation to
    const currentState = {
      sentiment: sentiment === 'Positive' ? sentimentScore : 
                 sentiment === 'Negative' ? -sentimentScore : 0,
      colors: transformedColors,
      motion: settings.motionEffects,
      intensity: settings.colorIntensity
    };
    
    // Save original state if this is the first transformation
    if (!originalState) {
      setOriginalState(currentState);
    }
    
    // Create a transformation object
    const transformation = {
      type: 'kaleidoscope' as const,
      name: 'Kaleidoscopic Vision',
      description: 'A mesmerizing reflection of geometric patterns that unfold in perfect symmetry',
      intensity: 0.7
    };
    setActiveTransformation(transformation);
    setShowTransformationToast(true);
    
    // Since we're using the new implementation, we don't need to apply the transformation here
    // as it's handled within the CreativitySparkButton component
    
    // Play a sound effect for the transformation
    playTransformationSound('magical');
    
    // Show a toast notification
    toast({
      title: transformation.name,
      description: transformation.description,
    });
  };
  
  // Function to play sound effects for transformations
  const playTransformationSound = (soundEffect: 'sparkle' | 'whoosh' | 'chime' | 'magical' | string) => {
    if (!settings.audioEnabled) return;
    
    let audioElement: HTMLAudioElement | null = null;
    
    switch (soundEffect) {
      case 'sparkle':
        audioElement = sparkleAudioRef.current;
        break;
      case 'whoosh':
        audioElement = whooshAudioRef.current;
        break;
      case 'chime':
        audioElement = chimeAudioRef.current;
        break;
      case 'magical':
        audioElement = magicalAudioRef.current;
        break;
    }
    
    if (audioElement) {
      audioElement.volume = settings.audioVolume;
      audioElement.currentTime = 0;
      audioElement.play().catch(err => console.error('Error playing audio:', err));
    }
  };
  
  // Function to reset transformations
  const resetTransformations = () => {
    if (originalState) {
      setTransformedColors(originalState.colors);
      setSettings(prev => ({
        ...prev,
        colorIntensity: originalState.intensity,
        motionEffects: originalState.motion
      }));
      setOriginalState(null);
      setActiveTransformation(null);
      
      toast({
        title: 'Reset Complete',
        description: 'Visualization returned to original state',
      });
    }
  };
  
  // Function to clear the AI-generated poetic summary
  const handleClearSummary = useCallback(() => {
    setPoeticSummary(null);
    toast({
      title: 'Summary cleared',
      description: 'The AI-generated poetic summary has been removed',
    });
  }, [toast]);

  // Handle toggle audio with global coordination and improved stability
  const handleToggleAudio = async () => {
    if (settings.audioEnabled) {
      // Turn off audio
      setSettings({...settings, audioEnabled: false});
      
      // Release global audio lock
      stopPlayback();
      
      // Stop audio playback with improved stability
      if (isAudioInitialized && isAudioPlaying) {
        try {
          stopAudioPlayback();
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
          // Update audio state with improved stability
          setSettings({...settings, audioEnabled: true});
          
          // Start audio if it's not playing
          if (!isAudioPlaying) {
            try {
              startAudioPlayback();
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
    <div className="relative min-h-screen w-full flex flex-col overflow-hidden bg-black text-white">
      {/* Header */}
      <Header 
        onHelpClick={() => setIsHelpModalOpen(true)}
        onSettingsClick={() => setIsSettingsModalOpen(true)}
      />
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Background Landscapes - rotates landscapes every 15 seconds */}
        <div className="fixed inset-0 w-full h-full z-0" id="dashboard-landscape-container">
          <DashboardLandscapes isActive={!isListening && !transcript} />
        </div>
        
        {/* Dashboard Content with glass morphism */}
        <div className="relative z-10 flex flex-col lg:flex-row w-full h-full">
          {/* Left Panel - Visualization Area */}
          <div className="h-[60vh] lg:h-full lg:w-3/4 relative flex flex-col">
            {/* Active Visualization Canvas - shows when speaking/processing */}
            <div className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${isListening || transcript ? 'opacity-100' : 'opacity-0'}`}>
              <AdvancedVisualizationCanvas 
                sentiment={sentiment}
                sentimentScore={sentimentScore}
                text={transcript}
                isProcessing={summaryMutation.isPending}
                colorIntensity={settings.colorIntensity}
                motion={settings.motionEffects}
                onClearSummary={handleClearSummary}
              />
            </div>
            
            {/* Dashboard Central Title - shows when not actively visualizing */}
            <div 
              className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${!isListening && !transcript ? 'opacity-100' : 'opacity-0'}`}
            >
              <div className="text-center p-6 sm:p-8 backdrop-blur-md bg-black/40 rounded-xl max-w-[90%] sm:max-w-md mx-auto border border-white/10 shadow-xl">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
                  Vocal Earth
                </h1>
                <p className="text-sm sm:text-lg text-gray-200 mb-4 sm:mb-6">
                  Transform your voice into stunning visual landscapes powered by AI
                </p>
                <button 
                  onClick={handleStartSpeaking}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-primary to-accent text-white rounded-full font-medium hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg"
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
                className="w-[calc(100%-2rem)] sm:w-60 md:w-72 mx-2 sm:mx-0 bg-black/50 backdrop-blur-sm p-2 sm:p-3 rounded-lg border border-white/10 text-sm sm:text-base"
              />
            </div>
            
            {/* Creativity Spark Button - only visible when visualization is active */}
            {(isListening || transcript) && (
              <div className="absolute top-4 right-4 z-20 flex gap-2">
                <CreativitySparkButton 
                  onSpark={handleCreativitySpark} 
                  disabled={summaryMutation.isPending}
                />
              </div>
            )}
          </div>
          
          {/* Right Panel - Controls */}
          <div className="h-[40vh] lg:h-full lg:w-1/3 backdrop-blur-md bg-black/50 border-t lg:border-t-0 lg:border-l border-gray-800/50 p-3 sm:p-4 overflow-auto">
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
              onCollaborationToggle={() => setIsCollaborationActive(!isCollaborationActive)}
              currentThemeId={currentThemeId}
              onThemeChange={handleThemeChange}
              onClearSummary={handleClearSummary}
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
      {/* Collaborative Visualization Mode */}
      {isCollaborationActive && (
        <div className="fixed inset-0 z-50 bg-black">
          <div className="absolute top-4 right-4 z-50">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCollaborationActive(false)}
              className="bg-black/40 border-gray-600 hover:bg-black/60 text-white"
            >
              <X className="h-4 w-4 mr-2" />
              <span>Exit Collaboration</span>
            </Button>
          </div>
          
          <CollaborativeVisualizer
            initialSentiment={sentiment}
            initialSentimentScore={sentimentScore}
            initialText={transcript}
            initialColorIntensity={settings.colorIntensity}
            initialMotion={settings.motionEffects}
            poeticSummary={poeticSummary}
            onClose={() => setIsCollaborationActive(false)}
          />
        </div>
      )}

      <SocialShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        imageUrl={shareImageUrl}
        title="My Vocal Earth Creation"
        description={transcript || undefined}
        poeticSummary={poeticSummary}
      />

      {/* Transformation Toast */}
      <TransformationToast 
        transformation={activeTransformation}
        isVisible={showTransformationToast}
        onClose={() => setShowTransformationToast(false)}
      />
      
      {/* Sound Effect Audio Elements */}
      <audio 
        ref={sparkleAudioRef}
        src="/sounds/sparkle.mp3" 
        preload="auto"
      />
      <audio 
        ref={whooshAudioRef}
        src="/sounds/whoosh.mp3" 
        preload="auto"
      />
      <audio 
        ref={chimeAudioRef}
        src="/sounds/chime.mp3" 
        preload="auto"
      />
      <audio 
        ref={magicalAudioRef}
        src="/sounds/magical.mp3" 
        preload="auto"
      />
    </div>
  );
}
