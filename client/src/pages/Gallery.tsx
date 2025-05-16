import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Plus, 
  Trash, 
  ExternalLink, 
  SlidersHorizontal, 
  Search,
  Music,
  PlayCircle,
  PauseCircle,
  ImageOff
} from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAudioCoordinator } from '@/hooks/useAudioCoordinator';
import { useMultipleSoundscapes, SoundscapeType } from '@/hooks/useMultipleSoundscapes';
import { getSentimentEmoji, getSentimentDescription } from '@/lib/utils';
import ErrorBoundary from '@/components/ErrorBoundary';
import type { GalleryItemResponse } from '@shared/schema';

export default function Gallery() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [filterSentiment, setFilterSentiment] = useState('all');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDeleteItem, setSelectedDeleteItem] = useState<number | null>(null);
  const [previewItem, setPreviewItem] = useState<GalleryItemResponse | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Set up audio system for gallery items
  const { isActive: isAudioApproved, requestPlayback, stopPlayback } = useAudioCoordinator('gallery-browser');
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [currentPreviewSoundscape, setCurrentPreviewSoundscape] = useState<SoundscapeType>('peaceful');
  
  // Initialize soundscape system
  const { 
    isPlaying: isSoundscapePlaying,
    isInitialized: isSoundscapeInitialized,
    togglePlay: toggleSoundscape,
    changeSoundscape,
    initialize: initializeSoundscape 
  } = useMultipleSoundscapes({
    initialType: 'peaceful',
    isActive: false,
    volume: 0.5
  });

  // Fetch gallery items
  const { 
    data: galleryItems, 
    isLoading, 
    isError,
    refetch
  } = useQuery({
    queryKey: ['gallery'],
    queryFn: () => apiRequest<GalleryItemResponse[]>('/api/gallery', { method: 'GET' })
  });

  // Fetch public gallery items
  const {
    data: publicGalleryItems,
    isLoading: isPublicLoading,
    isError: isPublicError
  } = useQuery({
    queryKey: ['gallery', 'public'],
    queryFn: () => apiRequest<GalleryItemResponse[]>('/api/gallery/public', { method: 'GET' })
  });
  
  // Initialize audio system
  useEffect(() => {
    if (!isSoundscapeInitialized) {
      initializeSoundscape().catch(error => {
        console.error('Failed to initialize soundscapes:', error);
      });
    }
  }, [isSoundscapeInitialized, initializeSoundscape]);
  
  // Toggle audio playback with coordination
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
  
  // Preview a gallery item
  const handlePreview = (item: GalleryItemResponse) => {
    setPreviewItem(item);
    setIsPreviewOpen(true);
    
    // Set soundscape based on sentiment
    const soundscapeType = getSoundscapeFromSentiment(item.sentiment);
    setCurrentPreviewSoundscape(soundscapeType);
    
    if (isSoundscapeInitialized) {
      changeSoundscape(soundscapeType);
    }
  };
  
  // Close preview
  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewItem(null);
    
    // Stop audio if it's playing
    if (isAudioEnabled && isSoundscapePlaying) {
      handleToggleAudio();
    }
  };
  
  // Confirm delete
  const handleConfirmDelete = (id: number) => {
    setSelectedDeleteItem(id);
    setIsDeleteDialogOpen(true);
  };
  
  // Delete item
  const handleDelete = async () => {
    if (!selectedDeleteItem) return;
    
    try {
      await apiRequest(`/api/gallery/${selectedDeleteItem}`, { method: 'DELETE' });
      
      toast({
        title: 'Success',
        description: 'Visualization deleted successfully',
      });
      
      // Refresh gallery data
      refetch();
      
      // Close dialog
      setIsDeleteDialogOpen(false);
      setSelectedDeleteItem(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete visualization',
        variant: 'destructive'
      });
    }
  };
  
  // Helper to determine soundscape type from sentiment
  const getSoundscapeFromSentiment = (sentiment: string): SoundscapeType => {
    if (sentiment === 'Positive') {
      return 'cheerful';
    } else if (sentiment === 'Negative') {
      return 'dramatic';
    } else {
      // Neutral or any other case
      return 'peaceful';
    }
  };
  
  // Filter and sort gallery items
  const getFilteredItems = (items: GalleryItemResponse[] | undefined) => {
    if (!items) return [];
    
    // Filter by search query and sentiment
    let filtered = items.filter(item => {
      const matchesSearch = 
        searchQuery === '' || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesSentiment = 
        filterSentiment === 'all' || 
        item.sentiment === filterSentiment;
      
      return matchesSearch && matchesSentiment;
    });
    
    // Sort items
    if (sortOption === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortOption === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortOption === 'title-asc') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOption === 'title-desc') {
      filtered.sort((a, b) => b.title.localeCompare(a.title));
    }
    
    return filtered;
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  // Render gallery cards
  const renderGalleryCards = (items: GalleryItemResponse[] | undefined) => {
    if (isLoading || isPublicLoading) {
      return Array(6).fill(0).map((_, i) => (
        <Card key={`skeleton-${i}`} className="overflow-hidden">
          <div className="relative aspect-video">
            <Skeleton className="absolute inset-0 w-full h-full" />
          </div>
          <CardContent className="p-4">
            <Skeleton className="h-6 w-2/3 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      ));
    }
    
    if ((isError || isPublicError) || (!items || items.length === 0)) {
      return (
        <div className="col-span-full flex flex-col items-center justify-center p-12 text-center">
          <ImageOff className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium">No visualizations found</h3>
          <p className="text-sm text-gray-500 mt-2">
            {isError ? 'Error loading visualizations.' : 'Create your first visualization to get started.'}
          </p>
          <Link href="/">
            <Button className="mt-4">Create New Visualization</Button>
          </Link>
        </div>
      );
    }
    
    const filteredItems = getFilteredItems(items);
    
    if (filteredItems.length === 0) {
      return (
        <div className="col-span-full flex items-center justify-center p-8 text-center">
          <p className="text-gray-500">No visualizations match your search criteria.</p>
        </div>
      );
    }
    
    return filteredItems.map(item => (
      <Card key={item.id} className="overflow-hidden group">
        <div className="relative aspect-video">
          <img 
            src={item.imageData} 
            alt={item.title} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <Button variant="secondary" size="icon" onClick={() => handlePreview(item)}>
                <PlayCircle className="h-5 w-5" />
              </Button>
              <Link href={`/gallery/${item.id}`}>
                <Button variant="secondary" size="icon">
                  <ExternalLink className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="destructive" size="icon" onClick={() => handleConfirmDelete(item.id)}>
                <Trash className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
        <CardContent className="p-4 space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold line-clamp-1">{item.title}</h3>
            <div className="text-lg" title={`Sentiment: ${item.sentiment}`}>
              {getSentimentEmoji(item.sentiment)}
            </div>
          </div>
          {item.description && (
            <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
          )}
        </CardContent>
        <CardFooter className="px-4 pb-4 pt-0 flex justify-between text-sm text-gray-500">
          <span>{formatDate(item.createdAt)}</span>
        </CardFooter>
      </Card>
    ));
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Visualization Gallery</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/">
              <Button className="flex gap-2 items-center">
                <Plus className="h-4 w-4" />
                <span>New Visualization</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container py-6">
        <Tabs defaultValue="my-gallery" className="w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <TabsList>
              <TabsTrigger value="my-gallery">My Visualizations</TabsTrigger>
              <TabsTrigger value="public-gallery">Public Gallery</TabsTrigger>
            </TabsList>
            
            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search visualizations..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={filterSentiment} onValueChange={setFilterSentiment}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="All Sentiments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sentiments</SelectItem>
                    <SelectItem value="Positive">Positive</SelectItem>
                    <SelectItem value="Neutral">Neutral</SelectItem>
                    <SelectItem value="Negative">Negative</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                    <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <TabsContent value="my-gallery">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderGalleryCards(galleryItems)}
            </div>
          </TabsContent>
          
          <TabsContent value="public-gallery">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderGalleryCards(publicGalleryItems)}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Preview dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl w-full h-[80vh] max-h-[900px] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-3">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl">{previewItem?.title}</DialogTitle>
              <Button 
                variant="outline"
                size="icon" 
                onClick={handleToggleAudio}
                className="ml-auto"
              >
                {isAudioEnabled && isSoundscapePlaying ? (
                  <PauseCircle className="h-5 w-5" />
                ) : (
                  <Music className="h-5 w-5" />
                )}
              </Button>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto p-6 pt-0">
            <div className="aspect-video relative overflow-hidden rounded-lg mb-4">
              <ErrorBoundary fallback={
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
                  Image could not be displayed
                </div>
              }>
                <img 
                  src={previewItem?.imageData} 
                  alt={previewItem?.title} 
                  className="w-full h-full object-cover"
                />
              </ErrorBoundary>
            </div>
            
            <div className="space-y-4">
              {previewItem?.description && (
                <div>
                  <h3 className="font-medium text-sm text-gray-500">Description</h3>
                  <p>{previewItem.description}</p>
                </div>
              )}
              
              <div>
                <h3 className="font-medium text-sm text-gray-500">Transcription</h3>
                <p className="text-sm">{previewItem?.transcriptionText}</p>
              </div>
              
              {previewItem?.poeticSummary && (
                <div>
                  <h3 className="font-medium text-sm text-gray-500">AI-Generated Poetic Summary</h3>
                  <p className="italic">{previewItem.poeticSummary}</p>
                </div>
              )}
              
              <div className="flex justify-between pt-2">
                <div>
                  <h3 className="font-medium text-sm text-gray-500">Sentiment</h3>
                  <p className="flex items-center gap-2">
                    {getSentimentEmoji(previewItem?.sentiment || 'Neutral')} 
                    {getSentimentDescription(previewItem?.sentiment || 'Neutral')}
                  </p>
                </div>
                
                <div className="text-right">
                  <h3 className="font-medium text-sm text-gray-500">Created</h3>
                  <p>{previewItem && formatDate(previewItem.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t flex justify-end gap-2">
            <Button variant="outline" onClick={handleClosePreview}>Close</Button>
            <Link href={`/gallery/${previewItem?.id}`}>
              <Button>Open Full View</Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Visualization</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this visualization? This action cannot be undone.</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}