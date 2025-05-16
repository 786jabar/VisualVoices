import React, { useState, useEffect } from 'react';
import { Link, useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  MessageSquare,
  Play,
  Pause,
  Music,
  VolumeX,
  Volume2,
  FileDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAudioCoordinator } from '@/hooks/useAudioCoordinator';
import { useMultipleSoundscapes, SoundscapeType } from '@/hooks/useMultipleSoundscapes';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { getSentimentEmoji, getSentimentDescription, downloadImage } from '@/lib/utils';
import SocialShareModal from '@/components/SocialShareModal';
import ErrorBoundary from '@/components/ErrorBoundary';
import type { GalleryItemResponse } from '@shared/schema';

export default function GalleryItemPage() {
  const { toast } = useToast();
  const [, params] = useRoute<{ id: string }>('/gallery/:id');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  // Audio control state
  const { isActive: isAudioApproved, requestPlayback, stopPlayback } = useAudioCoordinator('gallery-item');
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0.5);
  const [isNarrating, setIsNarrating] = useState(false);
  
  // Fetch visualization data
  const { 
    data: galleryItem,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['gallery', params?.id],
    queryFn: () => apiRequest<GalleryItemResponse>(`/api/gallery/${params?.id}`, { method: 'GET' }),
    enabled: !!params?.id
  });
  
  // Extract sound type from sentiment
  const extractSoundscapeType = (sentiment: string): SoundscapeType => {
    switch (sentiment) {
      case 'Positive':
        return 'cheerful';
      case 'Negative':
        return 'dramatic';
      case 'Neutral':
      default:
        return 'peaceful';
    }
  };
  
  // Soundscape system for ambient audio
  const { 
    isPlaying: isSoundscapePlaying,
    isInitialized: isSoundscapeInitialized,
    currentSoundscape,
    changeSoundscape,
    togglePlay: toggleSoundscape,
    setVolume: setSoundscapeVolume,
    initialize: initializeSoundscape
  } = useMultipleSoundscapes({
    initialType: extractSoundscapeType(galleryItem?.sentiment || 'Neutral'),
    isActive: false,
    volume: audioVolume
  });
  
  // Speech synthesis for narration
  const { 
    speak, 
    stop: stopSpeaking,
    isSpeaking,
    voices,
    setVoice,
    setVolume: setSpeechVolume 
  } = useSpeechSynthesis({
    rate: 0.95,
    pitch: 1,
    volume: audioVolume
  });
  
  // Initialize audio system
  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeSoundscape();
      } catch (error) {
        console.error('Failed to initialize audio:', error);
      }
    };
    
    initialize();
  }, [initializeSoundscape]);
  
  // Update soundscape when sentiment changes
  useEffect(() => {
    if (galleryItem && isSoundscapeInitialized) {
      const soundType = extractSoundscapeType(galleryItem.sentiment);
      changeSoundscape(soundType);
    }
  }, [galleryItem, isSoundscapeInitialized, changeSoundscape]);
  
  // Handle audio toggling
  const handleToggleAudio = async () => {
    if (isAudioEnabled) {
      // Turn off audio
      setIsAudioEnabled(false);
      stopPlayback();
      
      if (isSoundscapePlaying) {
        await toggleSoundscape();
      }
    } else {
      // Request permission to play audio
      const granted = requestPlayback();
      
      if (granted) {
        setIsAudioEnabled(true);
        
        if (!isSoundscapePlaying) {
          await toggleSoundscape();
        }
      }
    }
  };
  
  // Handle narration
  const handleNarration = () => {
    if (isNarrating) {
      stopSpeaking();
      setIsNarrating(false);
    } else {
      // If we have a poetic summary, narrate it
      if (galleryItem?.poeticSummary) {
        setIsNarrating(true);
        speak(galleryItem.poeticSummary);
        
        // Set up listener for when narration ends
        const handleSpeechEnd = () => {
          setIsNarrating(false);
          // Remove the event listener
          window.speechSynthesis.removeEventListener('end', handleSpeechEnd);
        };
        
        // Add event listener for speech end
        window.speechSynthesis.addEventListener('end', handleSpeechEnd);
      } else {
        // Narrate transcription if no poetic summary
        if (galleryItem?.transcriptionText) {
          setIsNarrating(true);
          speak(galleryItem.transcriptionText);
          
          // Set up listener for when narration ends
          const handleSpeechEnd = () => {
            setIsNarrating(false);
            // Remove the event listener
            window.speechSynthesis.removeEventListener('end', handleSpeechEnd);
          };
          
          // Add event listener for speech end
          window.speechSynthesis.addEventListener('end', handleSpeechEnd);
        }
      }
    }
  };
  
  // Handle image download
  const handleDownload = () => {
    if (galleryItem?.imageData) {
      downloadImage(galleryItem.imageData, `vocal-earth-${galleryItem.id}`);
      
      toast({
        title: 'Success',
        description: 'Image downloaded successfully'
      });
    }
  };
  
  // Handle share
  const handleShare = () => {
    if (galleryItem) {
      setIsShareModalOpen(true);
    }
  };
  
  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setAudioVolume(newVolume);
    setSoundscapeVolume(newVolume);
    setSpeechVolume(newVolume);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b">
          <div className="container py-4 flex items-center">
            <Link href="/gallery">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Skeleton className="h-8 w-40 ml-4" />
          </div>
        </header>
        
        <main className="flex-1 container py-8">
          <div className="max-w-5xl mx-auto">
            <div className="aspect-video w-full">
              <Skeleton className="w-full h-full rounded-lg" />
            </div>
            
            <div className="mt-6 space-y-4">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  // Error state
  if (isError || !galleryItem) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b">
          <div className="container py-4 flex items-center">
            <Link href="/gallery">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold ml-4">Error</h1>
          </div>
        </header>
        
        <main className="flex-1 container py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-xl font-medium mb-2">Visualization Not Found</h2>
            <p className="text-gray-500 mb-6">
              The visualization you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Link href="/gallery">
              <Button>Return to Gallery</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/gallery">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">{galleryItem.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleDownload}>
              <FileDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Visualization display */}
            <div className="lg:w-2/3">
              <ErrorBoundary fallback={
                <div className="w-full aspect-video flex items-center justify-center bg-gray-100 text-gray-500 rounded-lg">
                  Image could not be displayed
                </div>
              }>
                <div className="aspect-video w-full relative overflow-hidden rounded-lg shadow-lg">
                  <img 
                    src={galleryItem.imageData} 
                    alt={galleryItem.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </ErrorBoundary>
              
              {/* Audio Controls */}
              <div className="mt-4 flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <Button 
                  variant={isAudioEnabled && isSoundscapePlaying ? "default" : "outline"} 
                  size="icon"
                  onClick={handleToggleAudio}
                >
                  {isAudioEnabled && isSoundscapePlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Music className="h-4 w-4" />
                  )}
                </Button>
                
                <Button 
                  variant={isNarrating ? "default" : "outline"}
                  size="icon"
                  onClick={handleNarration}
                  disabled={!galleryItem.poeticSummary && !galleryItem.transcriptionText}
                >
                  {isNarrating ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <MessageSquare className="h-4 w-4" />
                  )}
                </Button>
                
                <div className="flex items-center gap-2 flex-1">
                  {audioVolume === 0 ? (
                    <VolumeX className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Volume2 className="h-4 w-4 text-gray-500" />
                  )}
                  
                  <Slider
                    defaultValue={[0.5]}
                    max={1}
                    step={0.01}
                    value={[audioVolume]}
                    onValueChange={handleVolumeChange}
                    className="w-full max-w-xs"
                  />
                </div>
              </div>
            </div>
            
            {/* Details panel */}
            <div className="lg:w-1/3">
              <Card>
                <CardContent className="p-6 space-y-6">
                  {galleryItem.description && (
                    <div>
                      <h3 className="font-semibold mb-2 text-sm uppercase text-gray-500">Description</h3>
                      <p>{galleryItem.description}</p>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-semibold mb-2 text-sm uppercase text-gray-500">Sentiment</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getSentimentEmoji(galleryItem.sentiment)}</span>
                      <span>{getSentimentDescription(galleryItem.sentiment)}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2 text-sm uppercase text-gray-500">Created</h3>
                    <p>{formatDate(galleryItem.createdAt)}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Tabs defaultValue="poetic-summary" className="mt-6">
                <TabsList className="w-full">
                  {galleryItem.poeticSummary && (
                    <TabsTrigger value="poetic-summary">Poetic Summary</TabsTrigger>
                  )}
                  <TabsTrigger value="transcription">Transcription</TabsTrigger>
                </TabsList>
                
                {galleryItem.poeticSummary && (
                  <TabsContent value="poetic-summary" className="mt-4">
                    <Card>
                      <CardContent className="p-6">
                        <blockquote className="italic border-l-4 border-primary/50 pl-4 py-2">
                          "{galleryItem.poeticSummary}"
                        </blockquote>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}
                
                <TabsContent value="transcription" className="mt-4">
                  <Card>
                    <CardContent className="p-6">
                      <p>{galleryItem.transcriptionText}</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      
      {/* Share Modal */}
      {isShareModalOpen && galleryItem && (
        <SocialShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          imageUrl={galleryItem.imageData}
          title={galleryItem.title}
          description={galleryItem.description || undefined}
          poeticSummary={galleryItem.poeticSummary}
        />
      )}
    </div>
  );
}