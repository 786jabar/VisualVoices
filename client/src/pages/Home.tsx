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
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSentimentAnalysis } from '@/hooks/useSentimentAnalysis';
import { useToneAudio } from '@/hooks/useToneAudio';

export default function Home() {
  const { toast } = useToast();
  
  // State for modals
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareImageUrl, setShareImageUrl] = useState<string>('');
  
  // State for settings
  const [settings, setSettings] = useState({
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
  
  // Audio hook
  const { 
    initialize: initializeAudio, 
    isInitialized: isAudioInitialized,
    isPlaying: isAudioPlaying,
    togglePlay: toggleAudio 
  } = useToneAudio({
    sentiment,
    sentimentScore,
    isActive: settings.audioEnabled,
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
  
  // Handle toggle audio
  const handleToggleAudio = () => {
    if (!isAudioInitialized) {
      initializeAudio().then(() => {
        setSettings({...settings, audioEnabled: true});
      }).catch(error => {
        toast({
          title: 'Audio Error',
          description: 'Failed to initialize audio',
          variant: 'destructive'
        });
      });
    } else {
      setSettings({...settings, audioEnabled: !settings.audioEnabled});
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
    <div className="relative h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <Header 
        onHelpClick={() => setIsHelpModalOpen(true)}
        onSettingsClick={() => setIsSettingsModalOpen(true)}
      />
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Visualization Canvas */}
        <VisualizationCanvas 
          sentiment={sentiment}
          sentimentScore={sentimentScore}
          text={transcript}
          isProcessing={summaryMutation.isPending}
          colorIntensity={settings.colorIntensity}
          motion={settings.motionEffects}
        />
        
        {/* Control Panel */}
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
          isAudioEnabled={settings.audioEnabled}
          onToggleAudio={handleToggleAudio}
          colorIntensity={settings.colorIntensity}
          motion={settings.motionEffects}
        />
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
    </div>
  );
}
