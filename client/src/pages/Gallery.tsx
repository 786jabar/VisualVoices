import { FC, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Mic, ImageIcon, ArrowLeft, Layers, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getSentimentEmoji, getSentimentColorClass } from '@/lib/utils';

// Interface for gallery items
interface GalleryItem {
  id: number;
  title: string;
  description: string | null;
  sentiment: string;
  poeticSummary: string | null;
  imageData: string;
  createdAt: string;
}

const Gallery: FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('my-creations');
  
  // Fetch user's visualizations
  const { 
    data: userVisualizations,
    isLoading: isLoadingUserVisualizations,
    isError: isErrorUserVisualizations,
    refetch: refetchUserVisualizations,
    error: userVisualizationsError
  } = useQuery({
    queryKey: ['gallery'],
    queryFn: () => apiRequest<GalleryItem[]>('/api/gallery', { method: 'GET' })
  });
  
  // Fetch public visualizations
  const { 
    data: publicVisualizations,
    isLoading: isLoadingPublicVisualizations,
    isError: isErrorPublicVisualizations,
    refetch: refetchPublicVisualizations,
    error: publicVisualizationsError
  } = useQuery({
    queryKey: ['gallery-public'],
    queryFn: () => apiRequest<GalleryItem[]>('/api/gallery/public', { method: 'GET' })
  });
  
  // Handle refresh
  const handleRefresh = () => {
    if (activeTab === 'my-creations') {
      refetchUserVisualizations();
    } else {
      refetchPublicVisualizations();
    }
    
    toast({
      title: 'Refreshed',
      description: 'Gallery has been refreshed',
    });
  };
  
  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Render a gallery card
  const renderGalleryCard = (item: GalleryItem) => (
    <Card key={item.id} className="overflow-hidden bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:border-indigo-500 transition-all duration-200">
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={item.imageData} 
          alt={item.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 z-10">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSentimentColorClass(item.sentiment as 'Positive' | 'Negative' | 'Neutral')}`}>
            {getSentimentEmoji(item.sentiment as 'Positive' | 'Negative' | 'Neutral')} {item.sentiment}
          </span>
        </div>
      </div>
      
      <CardHeader className="py-3">
        <CardTitle className="text-lg font-semibold text-white">{item.title}</CardTitle>
      </CardHeader>
      
      <CardContent className="py-2">
        {item.poeticSummary && (
          <p className="text-sm text-gray-300 line-clamp-3 italic">
            {item.poeticSummary}
          </p>
        )}
      </CardContent>
      
      <CardFooter className="py-3 flex justify-between items-center border-t border-gray-700">
        <span className="text-xs text-gray-400">{formatDate(item.createdAt)}</span>
        <Link href={`/gallery/${item.id}`}>
          <Button variant="outline" size="sm" className="text-xs border-indigo-500 text-indigo-400 hover:bg-indigo-500/20">
            View & Play
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
  
  // Render loading skeleton
  const renderSkeleton = () => (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={`skeleton-${index}`} className="overflow-hidden bg-gray-800/50 backdrop-blur-sm border-gray-700">
          <div className="aspect-video bg-gray-700 animate-pulse"></div>
          <CardHeader className="py-3">
            <Skeleton className="h-5 w-3/4 bg-gray-700" />
          </CardHeader>
          <CardContent className="py-2">
            <Skeleton className="h-3 w-full bg-gray-700 mb-2" />
            <Skeleton className="h-3 w-5/6 bg-gray-700" />
          </CardContent>
          <CardFooter className="py-3 flex justify-between items-center border-t border-gray-700">
            <Skeleton className="h-3 w-20 bg-gray-700" />
            <Skeleton className="h-8 w-24 bg-gray-700 rounded-md" />
          </CardFooter>
        </Card>
      ))}
    </>
  );
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 text-white">
      {/* Header with navigation */}
      <header className="py-4 px-6 border-b border-gray-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Vocal Earth Gallery</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleRefresh}
            className="text-gray-400 hover:text-white"
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
          
          <Link href="/create">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create New
            </Button>
          </Link>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 container mx-auto py-8 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2 bg-gray-800/50">
            <TabsTrigger value="my-creations" className="data-[state=active]:bg-indigo-700">
              <Layers className="h-4 w-4 mr-2" />
              My Creations
            </TabsTrigger>
            <TabsTrigger value="public-gallery" className="data-[state=active]:bg-indigo-700">
              <ImageIcon className="h-4 w-4 mr-2" />
              Public Gallery
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-creations" className="mt-6">
            {isErrorUserVisualizations ? (
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6">
                <p className="text-red-400">
                  Error loading your visualizations. {userVisualizationsError instanceof Error ? userVisualizationsError.message : 'Please try again.'}
                </p>
                <Button onClick={() => refetchUserVisualizations()} className="mt-3 bg-red-700 hover:bg-red-600">
                  Retry
                </Button>
              </div>
            ) : null}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoadingUserVisualizations ? (
                renderSkeleton()
              ) : userVisualizations && userVisualizations.length > 0 ? (
                userVisualizations.map(item => renderGalleryCard(item))
              ) : (
                <div className="col-span-full text-center py-20">
                  <Layers className="h-16 w-16 mx-auto text-gray-600 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">No creations yet</h3>
                  <p className="text-gray-400 mb-6">Start creating your first vocal landscape</p>
                  <Link href="/create">
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                      <Mic className="mr-2 h-4 w-4" />
                      Create Your First Landscape
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="public-gallery" className="mt-6">
            {isErrorPublicVisualizations ? (
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6">
                <p className="text-red-400">
                  Error loading public visualizations. {publicVisualizationsError instanceof Error ? publicVisualizationsError.message : 'Please try again.'}
                </p>
                <Button onClick={() => refetchPublicVisualizations()} className="mt-3 bg-red-700 hover:bg-red-600">
                  Retry
                </Button>
              </div>
            ) : null}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoadingPublicVisualizations ? (
                renderSkeleton()
              ) : publicVisualizations && publicVisualizations.length > 0 ? (
                publicVisualizations.map(item => renderGalleryCard(item))
              ) : (
                <div className="col-span-full text-center py-20">
                  <ImageIcon className="h-16 w-16 mx-auto text-gray-600 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">No public creations yet</h3>
                  <p className="text-gray-400 mb-6">Be the first to share your creation with others</p>
                  <Link href="/create">
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                      <Mic className="mr-2 h-4 w-4" />
                      Create and Share
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Footer */}
      <footer className="py-4 px-6 text-center text-gray-500 border-t border-gray-800">
        <p>Vocal Earth Gallery — Your spoken worlds preserved</p>
      </footer>
    </div>
  );
};

export default Gallery;