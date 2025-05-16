import React, { useState } from 'react';
import { Link } from 'wouter';
import { 
  ArrowLeft, 
  Sparkles,
  Globe,
  HelpCircle,
  Image
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import LandscapeCollection from '@/components/LandscapeCollection';
import { useToast } from '@/hooks/use-toast';

// Define the landscape type
interface Landscape {
  id: number;
  title: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  soundscape: string;
  thumbnailUrl: string;
}

const Explore: React.FC = () => {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('browse');
  const [selectedLandscape, setSelectedLandscape] = useState<Landscape | null>(null);
  
  // Handle landscape selection
  const handleSelectLandscape = (landscape: Landscape) => {
    setSelectedLandscape(landscape);
    
    // Switch to the preview tab
    setSelectedTab('preview');
    
    toast({
      title: 'Landscape Selected',
      description: `Now previewing: ${landscape.title}`,
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
          <h1 className="text-xl font-bold">Explore Landscapes</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Link href="/gallery">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Image className="h-4 w-4 mr-2" />
              View Gallery
            </Button>
          </Link>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 container mx-auto py-6 px-4">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
          <TabsList className="grid w-full md:w-[600px] grid-cols-3 bg-gray-800/50">
            <TabsTrigger value="browse" className="data-[state=active]:bg-indigo-700">
              <Globe className="h-4 w-4 mr-2" />
              Browse Landscapes
            </TabsTrigger>
            <TabsTrigger value="preview" className="data-[state=active]:bg-indigo-700" disabled={!selectedLandscape}>
              <Sparkles className="h-4 w-4 mr-2" />
              Preview Selected
            </TabsTrigger>
            <TabsTrigger value="help" className="data-[state=active]:bg-indigo-700">
              <HelpCircle className="h-4 w-4 mr-2" />
              How It Works
            </TabsTrigger>
          </TabsList>
          
          {/* Browse Tab */}
          <TabsContent value="browse" className="mt-6">
            <LandscapeCollection onSelectLandscape={handleSelectLandscape} />
          </TabsContent>
          
          {/* Preview Tab */}
          <TabsContent value="preview" className="mt-6">
            {selectedLandscape ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Preview Image */}
                <div className="lg:col-span-2">
                  <div className="rounded-lg overflow-hidden aspect-video relative">
                    <img 
                      src={selectedLandscape.thumbnailUrl} 
                      alt={selectedLandscape.title}
                      className="w-full h-full object-cover"
                    />
                    <div 
                      className="absolute inset-0 opacity-30 mix-blend-overlay"
                      style={{ 
                        background: `linear-gradient(135deg, ${selectedLandscape.primaryColor}, ${selectedLandscape.secondaryColor})` 
                      }}
                    ></div>
                  </div>
                </div>
                
                {/* Right: Details */}
                <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedLandscape.title}</h2>
                  <div className="bg-indigo-900/30 text-indigo-300 px-3 py-1 rounded-full text-sm inline-flex items-center mb-4">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {selectedLandscape.soundscape} soundscape
                  </div>
                  
                  <p className="text-gray-300 mb-6">{selectedLandscape.description}</p>
                  
                  <div className="space-y-4">
                    <Button
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                      onClick={() => {
                        toast({
                          title: 'Coming Soon',
                          description: 'This feature will allow you to create with this landscape as a starting point.',
                        });
                      }}
                    >
                      Create with this Landscape
                    </Button>
                    
                    <Link href="/gallery">
                      <Button className="w-full" variant="outline">
                        Explore Similar Creations
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <Sparkles className="h-16 w-16 mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No landscape selected</h3>
                <p className="text-gray-400 mb-6">Select a landscape from the Browse tab to preview it here</p>
                <Button onClick={() => setSelectedTab('browse')} className="bg-indigo-600 hover:bg-indigo-700">
                  Browse Landscapes
                </Button>
              </div>
            )}
          </TabsContent>
          
          {/* Help Tab */}
          <TabsContent value="help" className="mt-6">
            <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-lg p-6 max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-4">How to Use Landscape Explorer</h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-indigo-300">1. Browse Landscapes</h3>
                  <p className="text-gray-300">Explore our collection of predefined landscapes. Each landscape has a unique visual style and associated soundscape that creates an immersive audio-visual experience.</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-indigo-300">2. Preview & Select</h3>
                  <p className="text-gray-300">Click on any landscape to preview it in detail. You can see a larger image and read more about its characteristics.</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-indigo-300">3. Create Your Own</h3>
                  <p className="text-gray-300">Use a predefined landscape as a starting point for your own creation. Your voice will interact with the base landscape, transforming it according to your words and emotions.</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-indigo-300">4. Save & Share</h3>
                  <p className="text-gray-300">After creating a landscape, save it to your gallery and share it with others. Each saved landscape includes the visual elements, transcription, and associated AI narration.</p>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-indigo-900/30 rounded-lg">
                <h3 className="text-lg font-semibold text-indigo-300 mb-2">Pro Tips:</h3>
                <ul className="text-gray-300 space-y-2 list-disc pl-5">
                  <li>Different emotions in your voice will affect how the landscape responds and evolves</li>
                  <li>Try various soundscapes to find the one that best complements your creative vision</li>
                  <li>The AI narration provides a unique interpretation of your landscape that you can play back using text-to-speech</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Footer */}
      <footer className="py-4 px-6 text-center text-gray-500 border-t border-gray-800">
        <p>Vocal Earth — Explore predefined landscapes or create your own with your voice</p>
      </footer>
    </div>
  );
};

export default Explore;