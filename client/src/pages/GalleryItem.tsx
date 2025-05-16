import { FC, useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useRoute, useLocation } from 'wouter';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Download, 
  Share2, 
  Sparkles,
  Volume2,
  VolumeX,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useP5Visualization } from '@/hooks/useP5Visualization';
import { useToneAudio } from '@/hooks/useToneAudio';
import { getSentimentEmoji, getSentimentDescription } from '@/lib/utils';

// Define interface for visualization item
interface Visualization {
  id: number;
  title: string;
  description: string | null;
  transcriptionText: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  sentimentScore: number;
  poeticSummary: string | null;
  imageData: string;
  visualSettings: {
    colorIntensity: boolean;
    motion: boolean;
  } | null;
  createdAt: string;
}

const GalleryItem: FC = () => {
  const { toast } = useToast();
  const [, params] = useRoute<{ id: string }>('/gallery/:id');
  const [, navigate] = useLocation();
  
  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);
  
  // Fetch visualization data
  const { 
    data: visualization,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['gallery', params?.id],
    queryFn: () => apiRequest<Visualization>(`/api/gallery/${params?.id}`),
    enabled: !!params?.id
  });
  
  // Initialize visualization (static version)
  const { canvasRef, p5Instance } = useP5Visualization({
    sentiment: visualization?.sentiment || 'Neutral',
    sentimentScore: visualization?.sentimentScore || 0,
    text: visualization?.transcriptionText || '',
    colorIntensity: visualization?.visualSettings?.colorIntensity || true,
    motion: visualization?.visualSettings?.motion || true
  });
  
  // Initialize audio
  const { 
    initialize: initializeAudio, 
    isInitialized: isAudioInitialized,
    isPlaying: isAudioPlaying,
    togglePlay: toggleAudio 
  } = useToneAudio({
    sentiment: visualization?.sentiment || 'Neutral',
    sentimentScore: visualization?.sentimentScore || 0,
    isActive: isAudioEnabled,
    volume: 0.6
  });
  
  // Initialize audio when component mounts
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
  
  // Toggle audio playback
  const handleToggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    if (isAudioInitialized) {
      toggleAudio();
    }
  };
  
  // Format date for display
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
  
  // Handle download image
  const handleDownload = () => {
    if (visualization?.imageData) {
      const link = document.createElement('a');
      link.href = visualization.imageData;
      link.download = `${visualization.title.replace(/\s+/g, '-').toLowerCase()}-${visualization.id}.png`;
      link.click();
      
      toast({
        title: 'Image Downloaded',
        description: 'Visualization saved to your device',
      });
    }
  };
  
  // Handle share
  const handleShare = () => {
    if (navigator.share && visualization) {
      navigator.share({
        title: visualization.title,
        text: visualization.poeticSummary || 'Check out this surreal landscape I created with Vocal Earth!',
        url: window.location.href
      }).catch(error => {
        toast({
          title: 'Share Failed',
          description: 'Could not share content.',
          variant: 'destructive'
        });
      });
    } else {
      // Fallback to copy link
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast({
          title: 'Link Copied',
          description: 'Share link copied to clipboard',
        });
      });
    }
  };
  
  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 text-white p-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Visualization</h1>
          <p className="text-gray-300 mb-6">{error instanceof Error ? error.message : 'Could not load the visualization. It may have been deleted or you don\'t have permission to view it.'}</p>
          <Link href="/gallery">
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Gallery
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 text-white">
      {/* Header */}
      <header className="py-4 px-6 border-b border-gray-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link href="/gallery">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold truncate max-w-md">
            {isLoading ? <Skeleton className="h-7 w-40 bg-gray-700" /> : visualization?.title}
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleToggleAudio}
            className="text-gray-400 hover:text-white"
          >
            {isAudioEnabled ? (
              <Volume2 className="h-5 w-5" />
            ) : (
              <VolumeX className="h-5 w-5" />
            )}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleShare}
            className="text-gray-400 hover:text-white"
          >
            <Share2 className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleDownload}
            className="text-gray-400 hover:text-white"
          >
            <Download className="h-5 w-5" />
          </Button>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Visualization Canvas */}
        <div className="relative flex-1 bg-black">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div ref={canvasRef} className="absolute inset-0"></div>
          )}
          
          {/* Info badge */}
          {visualization && (
            <div className="absolute top-4 left-4 bg-gray-900/80 backdrop-blur-sm rounded-lg p-2 text-xs text-white border border-gray-800 transition-all duration-300 z-10">
              <div className="flex items-center space-x-2">
                <span>{getSentimentEmoji(visualization.sentiment)}</span>
                <span>{getSentimentDescription(visualization.sentiment)}</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Side Panel */}
        <div className="w-full md:w-96 bg-gray-900/90 backdrop-blur-sm border-l border-gray-800 flex flex-col overflow-auto">
          {/* Visualization Info */}
          <div className="p-4 border-b border-gray-800">
            {isLoading ? (
              <>
                <Skeleton className="h-7 w-full bg-gray-700 mb-3" />
                <Skeleton className="h-4 w-1/2 bg-gray-700 mb-6" />
                <Skeleton className="h-20 w-full bg-gray-700" />
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-semibold">{visualization?.title}</h2>
                  <span className="text-xs text-gray-400">{formatDate(visualization?.createdAt || '')}</span>
                </div>
                
                {visualization?.description && (
                  <p className="text-sm text-gray-300 mb-4">{visualization.description}</p>
                )}
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs flex items-center">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {visualization?.sentiment}
                  </span>
                </div>
              </>
            )}
          </div>
          
          {/* Poetic Summary */}
          {!isLoading && visualization?.poeticSummary && (
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <span className="mr-2">✨ Poetic Interpretation</span>
              </h3>
              <p className="text-sm italic text-gray-300">{visualization.poeticSummary}</p>
            </div>
          )}
          
          {/* Transcript Toggle */}
          <div className="p-4 border-b border-gray-800">
            <button 
              onClick={() => setShowTranscript(!showTranscript)}
              className="w-full flex items-center justify-between px-3 py-2 bg-gray-800/50 rounded-md hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-2 text-gray-400" />
                <span className="text-sm">Original Transcript</span>
              </div>
              <span className="text-xs text-gray-400">
                {showTranscript ? 'Hide' : 'Show'}
              </span>
            </button>
            
            {showTranscript && !isLoading && visualization?.transcriptionText && (
              <div className="mt-3 p-3 bg-gray-800/30 rounded-md border border-gray-700">
                <p className="text-sm text-gray-300">{visualization.transcriptionText}</p>
              </div>
            )}
          </div>
          
          {/* Playback info */}
          <div className="mt-auto p-4 text-center border-t border-gray-800">
            <p className="text-xs text-gray-500">
              This is a saved visualization. It captures a moment in time.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GalleryItem;