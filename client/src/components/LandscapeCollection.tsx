import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { 
  ImageIcon, 
  Globe, 
  Heart, 
  Share2, 
  ExternalLink, 
  Sparkles, 
  Music, 
  Info,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { apiRequest } from '@/lib/queryClient';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

// Define predefined landscape types for when API data isn't available
const predefinedLandscapes = [
  {
    id: 1,
    title: "Ethereal Aurora Peaks",
    description: "A luminous range of mountains under dancing northern lights, where purple and green auroras cast their glow on crystalline peaks.",
    primaryColor: "#4b3a8c",
    secondaryColor: "#2c5e4f",
    soundscape: "peaceful",
    thumbnailUrl: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGF1cm9yYXxlbnwwfHwwfHx8MA%3D%3D"
  },
  {
    id: 2,
    title: "Crimson Desert Twilight",
    description: "A vast crimson desert with ancient rock formations, bathed in the golden-red glow of a perpetual sunset.",
    primaryColor: "#8c3a3a",
    secondaryColor: "#8c6f3a",
    soundscape: "dramatic",
    thumbnailUrl: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZGVzZXJ0JTIwc3Vuc2V0fGVufDB8fDB8fHww"
  },
  {
    id: 3,
    title: "Floating Island Sanctuary",
    description: "Islands suspended in the clouds, connected by gossamer bridges, with waterfalls cascading into the misty void below.",
    primaryColor: "#3a8c7b",
    secondaryColor: "#3a5e8c",
    soundscape: "peaceful",
    thumbnailUrl: "https://images.unsplash.com/photo-1568126889999-6e6aeac69843?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8ZmxvYXRpbmclMjBpc2xhbmR8ZW58MHx8MHx8fDA%3D"
  },
  {
    id: 4,
    title: "Bioluminescent Forest",
    description: "An ancient woodland where every tree, flower and fungus emits a soft blue-green glow, illuminating the mist that winds between the trunks.",
    primaryColor: "#2e8c3a",
    secondaryColor: "#3a8c8c",
    soundscape: "mysterious",
    thumbnailUrl: "https://images.unsplash.com/photo-1628968419528-4b0c2e1b227f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Ymlvbm1pbmVzY2VudHxlbnwwfHwwfHx8MA%3D%3D"
  },
  {
    id: 5,
    title: "Crystal Cavern Depths",
    description: "Massive geodes form the walls of this underground world, where crystal formations in purple, blue, and gold reflect in still, dark pools.",
    primaryColor: "#5e3a8c",
    secondaryColor: "#3a3a8c",
    soundscape: "mysterious",
    thumbnailUrl: "https://images.unsplash.com/photo-1557178958-57e706be41a0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGNyeXN0YWwlMjBjYXZlfGVufDB8fDB8fHww"
  },
  {
    id: 6,
    title: "Storm-Swept Coastline",
    description: "Jagged cliffs meet turbulent waters under dramatic storm clouds, with lightning occasionally illuminating the churning waves.",
    primaryColor: "#3a4e8c",
    secondaryColor: "#3a3a3a",
    soundscape: "dramatic",
    thumbnailUrl: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c3Rvcm15JTIwY29hc3R8ZW58MHx8MHx8fDA%3D"
  },
  {
    id: 7,
    title: "Pastel Dreamscape",
    description: "Rolling hills of soft pink, lavender, and mint green stretch to the horizon, dotted with cotton candy clouds and prismatic rainbows.",
    primaryColor: "#b87ca3",
    secondaryColor: "#7cb8a3",
    soundscape: "cheerful",
    thumbnailUrl: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHBhc3RlbCUyMHNreXxlbnwwfHwwfHx8MA%3D%3D"
  },
  {
    id: 8,
    title: "Ancient Ruins in Mist",
    description: "The remnants of a forgotten civilization emerge from swirling mist, with moss-covered stones and vine-wrapped columns stretching up toward a pale sun.",
    primaryColor: "#5c5c5c",
    secondaryColor: "#3a5e3a",
    soundscape: "melancholic",
    thumbnailUrl: "https://images.unsplash.com/photo-1599946347371-68eb71b16afc?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YW5jaWVudCUyMHJ1aW5zfGVufDB8fDB8fHww"
  },
];

interface LandscapeCollectionProps {
  onSelectLandscape?: (landscape: any) => void;
  showInteraction?: boolean;
}

const LandscapeCollection: React.FC<LandscapeCollectionProps> = ({ 
  onSelectLandscape,
  showInteraction = true
}) => {
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<number[]>([]);
  
  // Fetch predefined landscapes from API if we have a backend for it
  const { 
    data: apiLandscapes,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['predefined-landscapes'],
    queryFn: async () => {
      try {
        return await apiRequest<typeof predefinedLandscapes>('/api/landscapes', { 
          method: 'GET' 
        });
      } catch (error) {
        // If the API endpoint doesn't exist, fall back to predefined landscapes
        console.log('Using predefined landscapes instead of API');
        return predefinedLandscapes;
      }
    }
  });
  
  // Use either API landscapes or predefined ones
  const landscapes = apiLandscapes || predefinedLandscapes;
  
  // Toggle favorite status
  const handleToggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
    
    toast({
      title: favorites.includes(id) ? 'Removed from favorites' : 'Added to favorites',
      description: favorites.includes(id) 
        ? 'Landscape removed from your favorites' 
        : 'Landscape added to your favorites',
    });
  };
  
  // Handle landscape selection
  const handleSelect = (landscape: any) => {
    if (onSelectLandscape) {
      onSelectLandscape(landscape);
    }
    
    toast({
      title: 'Landscape selected',
      description: `Exploring "${landscape.title}" landscape`,
    });
  };
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Explore Landscapes</h2>
        
        <Button
          variant="outline"
          onClick={() => refetch()}
          className="border-indigo-600 text-indigo-400 hover:bg-indigo-950"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={`skeleton-${idx}`} className="bg-gray-800/50 rounded-lg overflow-hidden">
              <div className="aspect-video bg-gray-700 animate-pulse"></div>
              <div className="p-4">
                <Skeleton className="h-5 w-3/4 bg-gray-700 mb-2" />
                <Skeleton className="h-3 w-full bg-gray-700 mb-1" />
                <Skeleton className="h-3 w-5/6 bg-gray-700 mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-24 bg-gray-700 rounded-md" />
                  <Skeleton className="h-8 w-8 bg-gray-700 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {landscapes.map((landscape) => (
            <Card key={landscape.id} className="bg-gray-800/60 border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-indigo-900/20 hover:border-indigo-800">
              <div 
                className="aspect-video w-full relative overflow-hidden group cursor-pointer"
                onClick={() => handleSelect(landscape)}
              >
                {/* Landscape Image */}
                <img 
                  src={landscape.thumbnailUrl} 
                  alt={landscape.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Color Overlay */}
                <div 
                  className="absolute inset-0 opacity-30 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-40"
                  style={{ 
                    background: `linear-gradient(135deg, ${landscape.primaryColor}, ${landscape.secondaryColor})` 
                  }}
                ></div>
                
                {/* Soundscape Type Badge */}
                <Badge
                  className="absolute top-3 right-3 bg-black/60 text-white backdrop-blur-sm"
                >
                  <Music className="h-3 w-3 mr-1" />
                  {landscape.soundscape}
                </Badge>
                
                {/* Play/Explore Overlay */}
                <div className="absolute inset-0 bg-black/0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:bg-black/40 group-hover:opacity-100">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white transform scale-90 transition-transform duration-300 group-hover:scale-100">
                    Explore Landscape
                  </Button>
                </div>
              </div>
              
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold text-white">{landscape.title}</CardTitle>
                  {showInteraction && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-pink-500"
                            onClick={() => handleToggleFavorite(landscape.id)}
                          >
                            <Heart className={`h-5 w-5 ${favorites.includes(landscape.id) ? 'fill-pink-500 text-pink-500' : ''}`} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {favorites.includes(landscape.id) ? 'Remove from favorites' : 'Add to favorites'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="p-4 pt-0">
                <p className="text-sm text-gray-300 line-clamp-3">
                  {landscape.description}
                </p>
              </CardContent>
              
              <CardFooter className="p-4 pt-0 flex justify-between">
                <Button 
                  variant="outline"
                  size="sm"
                  className="text-xs border-indigo-800/40 text-indigo-300 hover:bg-indigo-900/30"
                  onClick={() => handleSelect(landscape)}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Select
                </Button>
                
                {showInteraction && (
                  <div className="flex gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-indigo-400"
                            onClick={() => {
                              navigator.clipboard.writeText(landscape.title);
                              toast({
                                title: 'Copied',
                                description: 'Landscape name copied to clipboard',
                              });
                            }}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Share
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-indigo-400"
                            onClick={() => {
                              toast({
                                title: 'Landscape Info',
                                description: `${landscape.title} - a ${landscape.soundscape} soundscape`,
                              });
                            }}
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          More Info
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LandscapeCollection;