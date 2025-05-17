import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import CustomAnimationsManager from '@/components/CustomAnimationsManager';
import { CustomAnimation } from '@/components/CustomAnimationUpload';
import HelpModal from '@/components/HelpModal';
import SettingsModal from '@/components/SettingsModal';
import DashboardLandscapes from '@/components/DashboardLandscapes';
import SimpleDashboardCanvas from '@/components/SimpleDashboardCanvas';

export default function UserAnimations() {
  const { toast } = useToast();
  
  // State for modals
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  // State for selected animation
  const [selectedAnimation, setSelectedAnimation] = useState<CustomAnimation | null>(null);
  
  // Handle animation selection
  const handleSelectAnimation = (animation: CustomAnimation) => {
    setSelectedAnimation(animation);
  };
  
  // Preview the selected animation
  const renderAnimationPreview = () => {
    if (!selectedAnimation) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-12 rounded-lg bg-gray-100 dark:bg-gray-800 text-center">
          <h3 className="text-lg font-medium mb-2">No Animation Selected</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Select a custom animation to preview or create a new one
          </p>
        </div>
      );
    }
    
    return (
      <div className="relative w-full h-full min-h-[400px] rounded-lg overflow-hidden">
        <SimpleDashboardCanvas
          colors={selectedAnimation.colors}
          soundscapeType={selectedAnimation.soundscapeType}
          isActive={true}
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
          <h3 className="text-xl font-semibold text-white mb-1">{selectedAnimation.name}</h3>
          {selectedAnimation.description && (
            <p className="text-gray-200">{selectedAnimation.description}</p>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header
        onHelpClick={() => setIsHelpModalOpen(true)}
        onSettingsClick={() => setIsSettingsModalOpen(true)}
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left side - Animation Management */}
          <div className="w-full md:w-7/12">
            <h2 className="text-2xl font-bold mb-6">My Custom Animations</h2>
            <CustomAnimationsManager onSelectAnimation={handleSelectAnimation} />
          </div>
          
          {/* Right side - Preview and Settings */}
          <div className="w-full md:w-5/12">
            <h2 className="text-2xl font-bold mb-6">Animation Preview</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="h-96">
                {renderAnimationPreview()}
              </div>
              
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Apply Animation</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Use this animation in your next Vocal Earth session
                </p>
                <Button 
                  className="w-full" 
                  onClick={() => {
                    if (selectedAnimation) {
                      // Store selected animation in localStorage
                      localStorage.setItem('activeCustomAnimation', JSON.stringify(selectedAnimation));
                      toast({
                        title: 'Animation Applied',
                        description: `${selectedAnimation.name} will be used in your next session`,
                      });
                    } else {
                      toast({
                        title: 'No Animation Selected',
                        description: 'Please select an animation first',
                        variant: 'destructive',
                      });
                    }
                  }}
                  disabled={!selectedAnimation}
                >
                  Apply to Next Session
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Browse Built-in Animations */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Browse Built-in Animations</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            These beautiful landscapes are available for inspiration or as a starting point for your own creations
          </p>
          
          <div className="h-64 mb-8">
            <DashboardLandscapes isActive={true} />
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
        onSettingsChange={() => {}}
        initialSettings={{
          audioEnabled: true,
          audioVolume: 0.7,
          colorIntensity: true,
          motionEffects: true,
          language: 'en-US'
        }}
      />
    </div>
  );
}