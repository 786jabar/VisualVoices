import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  ArrowLeft, 
  Globe, 
  Sparkles, 
  Music, 
  Heart, 
  HeartOff,
  Search,
  SlidersHorizontal,
  ImagePlus,
  FileUp,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useMultipleSoundscapes, SoundscapeType } from '@/hooks/useMultipleSoundscapes';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define pre-built landscape templates
const landscapeTemplates = [
  {
    id: 1,
    name: "Ethereal Aurora Mountains",
    description: "A dreamlike mountain range illuminated by dancing auroras in the night sky",
    category: "Fantasy",
    soundscape: "peaceful" as SoundscapeType,
    thumbnailUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000",
    isFeatured: true,
    colors: {
      primary: "#3b1d61",
      secondary: "#1e4464",
      accent: "#61c3df"
    }
  },
  {
    id: 2,
    name: "Crimson Desert Cliffs",
    description: "Towering red rock formations and deep canyons under a blazing sunset",
    category: "Natural",
    soundscape: "dramatic" as SoundscapeType,
    thumbnailUrl: "https://images.unsplash.com/photo-1539137571919-85b7433d82d8?q=80&w=1000",
    isFeatured: true,
    colors: {
      primary: "#8c2f0c",
      secondary: "#d4773e",
      accent: "#ffcb8e"
    }
  },
  {
    id: 3,
    name: "Floating Crystal Islands",
    description: "Crystalline structures suspended in clouds with waterfalls cascading into the abyss",
    category: "Fantasy",
    soundscape: "mysterious" as SoundscapeType,
    thumbnailUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1000",
    isFeatured: true,
    colors: {
      primary: "#313866",
      secondary: "#504099",
      accent: "#7b88d3"
    }
  },
  {
    id: 4,
    name: "Bioluminescent Jungle",
    description: "A dense rainforest where plants and fungi glow with ethereal blue-green light",
    category: "Fantasy",
    soundscape: "peaceful" as SoundscapeType,
    thumbnailUrl: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?q=80&w=1000",
    isFeatured: false,
    colors: {
      primary: "#0e4429",
      secondary: "#1a7349",
      accent: "#4aded4"
    }
  },
  {
    id: 5,
    name: "Volcanic Obsidian Fields",
    description: "A landscape of black glass and molten rivers under an ash-filled sky",
    category: "Dramatic",
    soundscape: "dramatic" as SoundscapeType,
    thumbnailUrl: "https://images.unsplash.com/photo-1598881048223-178f6738e29a?q=80&w=1000",
    isFeatured: false,
    colors: {
      primary: "#3d0b0b",
      secondary: "#741111",
      accent: "#e25822"
    }
  },
  {
    id: 6,
    name: "Cloud Kingdom",
    description: "A serene cityscape of structures built on and from clouds in pastel hues",
    category: "Fantasy",
    soundscape: "cheerful" as SoundscapeType,
    thumbnailUrl: "https://images.unsplash.com/photo-1536244636800-a3f74db0f3cf?q=80&w=1000",
    isFeatured: false,
    colors: {
      primary: "#7389ae",
      secondary: "#a7bed3",
      accent: "#f6e8ea"
    }
  },
  {
    id: 7,
    name: "Ancient Ruins",
    description: "Moss-covered stone structures of a forgotten civilization, slowly being reclaimed by nature",
    category: "Historical",
    soundscape: "melancholic" as SoundscapeType,
    thumbnailUrl: "https://images.unsplash.com/photo-1549971352-e96641ac7089?q=80&w=1000",
    isFeatured: false,
    colors: {
      primary: "#515751",
      secondary: "#77825c",
      accent: "#b0a160"
    }
  },
  {
    id: 8,
    name: "Fractal Crystal Caves",
    description: "Endlessly repeating geometric crystal formations that refract light in impossible ways",
    category: "Abstract",
    soundscape: "mysterious" as SoundscapeType,
    thumbnailUrl: "https://images.unsplash.com/photo-1551712287-7b84a69ddc75?q=80&w=1000",
    isFeatured: false,
    colors: {
      primary: "#301b70",
      secondary: "#765285",
      accent: "#b8c0ff"
    }
  },
  {
    id: 9,
    name: "Cybernetic Cityscape",
    description: "A futuristic metropolis of neon, glass, and steel under a digital sky",
    category: "Futuristic",
    soundscape: "dramatic" as SoundscapeType,
    thumbnailUrl: "https://images.unsplash.com/photo-1546694539-76c20b4feaa2?q=80&w=1000",
    isFeatured: false,
    colors: {
      primary: "#0d0221",
      secondary: "#190b35",
      accent: "#0cca98"
    }
  },
  {
    id: 10,
    name: "Sunrise Meadow",
    description: "Rolling fields of wildflowers catching the first golden rays of dawn",
    category: "Natural",
    soundscape: "cheerful" as SoundscapeType,
    thumbnailUrl: "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?q=80&w=1000",
    isFeatured: false,
    colors: {
      primary: "#3a6351",
      secondary: "#a0c1b8",
      accent: "#f2d096"
    }
  },
  {
    id: 11,
    name: "Desert Night Oasis",
    description: "A tranquil pool surrounded by palms under a star-filled desert night sky",
    category: "Natural",
    soundscape: "peaceful" as SoundscapeType,
    thumbnailUrl: "https://images.unsplash.com/photo-1518650343960-a21699a5e6f9?q=80&w=1000",
    isFeatured: false,
    colors: {
      primary: "#0a1128",
      secondary: "#1282a2",
      accent: "#fefcfb"
    }
  },
  {
    id: 12,
    name: "Quantum Particle Realm",
    description: "The microscopic world of subatomic particles visualized as a colorful abstract landscape",
    category: "Abstract",
    soundscape: "mysterious" as SoundscapeType,
    thumbnailUrl: "https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?q=80&w=1000",
    isFeatured: false,
    colors: {
      primary: "#240046",
      secondary: "#5a189a",
      accent: "#ff9e00"
    }
  }
];

// Define categories for filtering
const categories = [...new Set(landscapeTemplates.map(template => template.category))];
const soundscapes = ["peaceful", "mysterious", "dramatic", "cheerful", "melancholic"];

const Landscapes: React.FC = () => {
  const { toast } = useToast();
  
  // State for filtering and searching
  const [activeTab, setActiveTab] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSoundscape, setSelectedSoundscape] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  
  // State for preview
  const [previewLandscape, setPreviewLandscape] = useState<typeof landscapeTemplates[0] | null>(null);
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  
  // Initialize multiple soundscapes
  const { 
    isPlaying: isSoundscapePlaying,
    currentSoundscape,
    changeSoundscape,
    togglePlay: toggleSoundscape,
    initialize: initializeSoundscapes
  } = useMultipleSoundscapes({
    initialType: (previewLandscape?.soundscape || 'peaceful') as SoundscapeType,
    isActive: isPreviewActive,
    volume: 0.6
  });
  
  // Initialize soundscapes on mount
  useEffect(() => {
    initializeSoundscapes();
  }, [initializeSoundscapes]);
  
  // Change soundscape when preview changes
  useEffect(() => {
    if (previewLandscape && isPreviewActive) {
      changeSoundscape(previewLandscape.soundscape);
    }
  }, [previewLandscape, isPreviewActive, changeSoundscape]);
  
  // Filter landscapes based on active tab, search query, category, and soundscape
  const filteredLandscapes = landscapeTemplates.filter(landscape => {
    // Filter by tab
    if (activeTab === "featured" && !landscape.isFeatured) return false;
    if (activeTab === "favorites" && !favorites.includes(landscape.id)) return false;
    
    // Filter by search query
    if (
      searchQuery && 
      !landscape.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !landscape.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    
    // Filter by category
    if (selectedCategory && landscape.category !== selectedCategory) return false;
    
    // Filter by soundscape
    if (selectedSoundscape && landscape.soundscape !== selectedSoundscape) return false;
    
    return true;
  });
  
  // Toggle favorite status
  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(favId => favId !== id) 
        : [...prev, id]
    );
    
    const landscape = landscapeTemplates.find(l => l.id === id);
    if (landscape) {
      toast({
        title: favorites.includes(id) ? "Removed from favorites" : "Added to favorites",
        description: favorites.includes(id) 
          ? `"${landscape.name}" removed from your favorites` 
          : `"${landscape.name}" added to your favorites`,
      });
    }
  };
  
  // Preview a landscape
  const handlePreview = (landscape: typeof landscapeTemplates[0]) => {
    setPreviewLandscape(landscape);
    setIsPreviewActive(true);
    
    toast({
      title: "Preview mode",
      description: `Previewing "${landscape.name}" with ${landscape.soundscape} soundscape`,
    });
  };
  
  // Close preview
  const closePreview = () => {
    setIsPreviewActive(false);
  };
  
  // Use selected landscape
  const useSelectedLandscape = () => {
    if (!previewLandscape) return;
    
    // Navigate to create page with selected landscape
    // This would typically pass the selected landscape data to the creation screen
    toast({
      title: "Landscape selected",
      description: `Now creating with "${previewLandscape.name}" landscape`,
    });
    
    // For now, just show a success message
    toast({
      title: "Success!",
      description: "Landscape template applied to creation canvas",
    });
  };
  
  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedSoundscape(null);
    
    toast({
      title: "Filters reset",
      description: "All filters have been cleared",
    });
  };
  
  // handle custom upload (simulation)
  const handleCustomUpload = () => {
    toast({
      title: "Upload functionality",
      description: "Custom landscape upload feature will be available in the next update!",
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 text-white">
      {/* Header */}
      <header className="py-4 px-6 border-b border-gray-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Landscape Browser</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="border-emerald-700 text-emerald-400 hover:bg-emerald-700/20"
            onClick={handleCustomUpload}
          >
            <FileUp className="h-4 w-4 mr-2" />
            Upload Custom
          </Button>
          
          <Link href="/gallery">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Sparkles className="h-4 w-4 mr-2" />
              My Gallery
            </Button>
          </Link>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 container mx-auto py-6 px-4">
        {/* Preview Overlay - shows when a landscape is being previewed */}
        {isPreviewActive && previewLandscape && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Preview Header */}
              <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                <h2 className="text-xl font-bold">{previewLandscape.name}</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={closePreview}
                  className="text-gray-400 hover:text-white"
                >
                  Close Preview
                </Button>
              </div>
              
              {/* Preview Content */}
              <div className="flex-1 overflow-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                  {/* Left: Preview Image */}
                  <div className="lg:col-span-2">
                    <div 
                      className="rounded-lg overflow-hidden aspect-video relative" 
                      style={{
                        background: `linear-gradient(135deg, ${previewLandscape.colors.primary}, ${previewLandscape.colors.secondary})`
                      }}
                    >
                      <img 
                        src={previewLandscape.thumbnailUrl} 
                        alt={previewLandscape.name}
                        className="w-full h-full object-cover mix-blend-overlay"
                      />
                      
                      {/* Audio controls */}
                      <div className="absolute bottom-4 right-4 flex space-x-2">
                        <Button 
                          size="sm" 
                          onClick={toggleSoundscape}
                          className="bg-black/60 hover:bg-black/80 backdrop-blur-sm"
                        >
                          <Music className="h-4 w-4 mr-2" />
                          {isSoundscapePlaying ? "Mute Audio" : "Play Audio"}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right: Details & Controls */}
                  <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
                    <h2 className="text-2xl font-bold text-white mb-2">{previewLandscape.name}</h2>
                    
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="bg-indigo-900/30 text-indigo-300 px-3 py-1 rounded-full text-sm inline-flex items-center">
                        <Music className="h-3 w-3 mr-1" />
                        {previewLandscape.soundscape} soundscape
                      </div>
                      
                      <div className="bg-gray-800/80 text-gray-300 px-3 py-1 rounded-full text-sm">
                        {previewLandscape.category}
                      </div>
                    </div>
                    
                    <p className="text-gray-300 mb-6">{previewLandscape.description}</p>
                    
                    <div className="space-y-4">
                      <Link href="/create">
                        <Button
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                          onClick={useSelectedLandscape}
                        >
                          Create with this Landscape
                        </Button>
                      </Link>
                      
                      <Button 
                        className="w-full"
                        variant="outline"
                        onClick={() => toggleFavorite(previewLandscape.id)}
                      >
                        {favorites.includes(previewLandscape.id) ? (
                          <>
                            <HeartOff className="h-4 w-4 mr-2" />
                            Remove from Favorites
                          </>
                        ) : (
                          <>
                            <Heart className="h-4 w-4 mr-2" />
                            Add to Favorites
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => {
                          toast({
                            title: "Share",
                            description: "Sharing functionality will be available soon!",
                          });
                        }}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share this Landscape
                      </Button>
                    </div>
                    
                    <div className="mt-8 pt-4 border-t border-gray-700">
                      <h3 className="text-sm font-semibold text-gray-400 mb-3">Color Palette</h3>
                      <div className="flex space-x-2">
                        <div 
                          className="w-8 h-8 rounded-full" 
                          style={{ backgroundColor: previewLandscape.colors.primary }}
                          title="Primary Color"
                        ></div>
                        <div 
                          className="w-8 h-8 rounded-full" 
                          style={{ backgroundColor: previewLandscape.colors.secondary }}
                          title="Secondary Color"
                        ></div>
                        <div 
                          className="w-8 h-8 rounded-full" 
                          style={{ backgroundColor: previewLandscape.colors.accent }}
                          title="Accent Color"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Filters & Tabs */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
              <TabsList className="grid w-full md:w-[400px] grid-cols-3 bg-gray-800/50">
                <TabsTrigger value="all" className="data-[state=active]:bg-indigo-700">
                  All Landscapes
                </TabsTrigger>
                <TabsTrigger value="featured" className="data-[state=active]:bg-indigo-700">
                  Featured
                </TabsTrigger>
                <TabsTrigger value="favorites" className="data-[state=active]:bg-indigo-700">
                  My Favorites {favorites.length > 0 ? `(${favorites.length})` : ''}
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search landscapes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="border-gray-700">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-gray-800 border-gray-700 text-white">
                  <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  
                  <div className="p-2">
                    <p className="text-xs text-gray-400 mb-1">Category</p>
                    <Select
                      value={selectedCategory || ""}
                      onValueChange={(value) => setSelectedCategory(value || null)}
                    >
                      <SelectTrigger className="w-full bg-gray-900 border-gray-700">
                        <SelectValue placeholder="Any category" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-700">
                        <SelectItem value="">Any category</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="p-2">
                    <p className="text-xs text-gray-400 mb-1">Soundscape</p>
                    <Select
                      value={selectedSoundscape || ""}
                      onValueChange={(value) => setSelectedSoundscape(value || null)}
                    >
                      <SelectTrigger className="w-full bg-gray-900 border-gray-700">
                        <SelectValue placeholder="Any soundscape" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-700">
                        <SelectItem value="">Any soundscape</SelectItem>
                        {soundscapes.map(soundscape => (
                          <SelectItem key={soundscape} value={soundscape}>{soundscape}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <div className="p-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full" 
                      onClick={resetFilters}
                    >
                      Reset Filters
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Active Filters Indicators */}
          {(searchQuery || selectedCategory || selectedSoundscape) && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-sm text-gray-400">Active filters:</span>
              
              {searchQuery && (
                <div className="bg-indigo-900/40 text-indigo-300 px-2 py-1 rounded-md text-xs flex items-center">
                  <span>Search: {searchQuery}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-4 w-4 ml-1 hover:bg-transparent hover:text-white"
                    onClick={() => setSearchQuery("")}
                  >
                    ×
                  </Button>
                </div>
              )}
              
              {selectedCategory && (
                <div className="bg-indigo-900/40 text-indigo-300 px-2 py-1 rounded-md text-xs flex items-center">
                  <span>Category: {selectedCategory}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-4 w-4 ml-1 hover:bg-transparent hover:text-white"
                    onClick={() => setSelectedCategory(null)}
                  >
                    ×
                  </Button>
                </div>
              )}
              
              {selectedSoundscape && (
                <div className="bg-indigo-900/40 text-indigo-300 px-2 py-1 rounded-md text-xs flex items-center">
                  <span>Soundscape: {selectedSoundscape}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-4 w-4 ml-1 hover:bg-transparent hover:text-white"
                    onClick={() => setSelectedSoundscape(null)}
                  >
                    ×
                  </Button>
                </div>
              )}
              
              <Button 
                variant="link" 
                size="sm" 
                className="text-xs text-indigo-400 hover:text-indigo-300 p-0 h-auto"
                onClick={resetFilters}
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
        
        {/* Landscape Grid */}
        {filteredLandscapes.length === 0 ? (
          <div className="bg-gray-800/40 border border-gray-700 rounded-lg p-10 text-center">
            <Globe className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No landscapes found</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              No landscapes match your current filters. Try adjusting your search criteria or browse all available landscapes.
            </p>
            <Button 
              onClick={resetFilters}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Show All Landscapes
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredLandscapes.map(landscape => (
              <div 
                key={landscape.id} 
                className="bg-gray-800/40 border border-gray-700 rounded-lg overflow-hidden hover:border-indigo-600 transition-all duration-300 group"
              >
                {/* Landscape Image */}
                <div 
                  className="aspect-video relative cursor-pointer"
                  onClick={() => handlePreview(landscape)}
                >
                  <img 
                    src={landscape.thumbnailUrl} 
                    alt={landscape.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  
                  {/* Overlay with gradient */}
                  <div 
                    className="absolute inset-0 opacity-60 mix-blend-multiply"
                    style={{
                      background: `linear-gradient(135deg, ${landscape.colors.primary}, ${landscape.colors.secondary})`
                    }}
                  ></div>
                  
                  {/* Favorite Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 bg-black/40 hover:bg-black/60 text-white border border-white/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(landscape.id);
                    }}
                  >
                    <Heart 
                      className={`h-4 w-4 ${favorites.includes(landscape.id) ? 'fill-pink-500 text-pink-500' : ''}`} 
                    />
                  </Button>
                  
                  {/* Category Badge */}
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/40 backdrop-blur-sm rounded text-xs">
                    {landscape.category}
                  </div>
                  
                  {/* Preview Button Overlay */}
                  <div className="absolute inset-0 bg-black/0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:bg-black/40 group-hover:opacity-100">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white transform scale-90 transition-transform duration-300 group-hover:scale-100">
                      Preview Landscape
                    </Button>
                  </div>
                </div>
                
                {/* Landscape Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-white mb-1 group-hover:text-indigo-300 transition-colors">
                    {landscape.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-indigo-900/40 px-2 py-0.5 rounded text-xs text-indigo-300 flex items-center">
                      <Music className="h-3 w-3 mr-1" />
                      {landscape.soundscape}
                    </div>
                    
                    {landscape.isFeatured && (
                      <div className="bg-amber-900/40 px-2 py-0.5 rounded text-xs text-amber-300 flex items-center">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Featured
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-400 text-sm line-clamp-2">{landscape.description}</p>
                </div>
                
                {/* Actions */}
                <div className="px-4 pb-4">
                  <Button 
                    className="w-full bg-gray-700 hover:bg-indigo-600 text-white text-sm"
                    onClick={() => handlePreview(landscape)}
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    Preview & Select
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="py-4 px-6 text-center text-gray-500 border-t border-gray-800">
        <p>Vocal Earth — Browse and select landscape templates for your creations</p>
      </footer>
    </div>
  );
};

export default Landscapes;