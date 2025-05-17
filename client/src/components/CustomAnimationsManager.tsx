import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit } from 'lucide-react';
import CustomAnimationUpload, { CustomAnimation } from './CustomAnimationUpload';
import { useToast } from '@/hooks/use-toast';

interface CustomAnimationsManagerProps {
  onSelectAnimation: (animation: CustomAnimation) => void;
}

const CustomAnimationsManager: React.FC<CustomAnimationsManagerProps> = ({
  onSelectAnimation
}) => {
  const { toast } = useToast();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [customAnimations, setCustomAnimations] = useState<CustomAnimation[]>([]);
  const [selectedAnimationId, setSelectedAnimationId] = useState<string | null>(null);
  
  // Load saved animations from localStorage on mount
  useEffect(() => {
    const savedAnimations = localStorage.getItem('customAnimations');
    if (savedAnimations) {
      try {
        setCustomAnimations(JSON.parse(savedAnimations));
      } catch (error) {
        console.error('Failed to parse saved animations:', error);
      }
    }
  }, []);
  
  // Save animations to localStorage when they change
  useEffect(() => {
    localStorage.setItem('customAnimations', JSON.stringify(customAnimations));
  }, [customAnimations]);
  
  // Handle new animation upload
  const handleAnimationUpload = (animation: CustomAnimation) => {
    setCustomAnimations(prev => [...prev, animation]);
  };
  
  // Handle animation deletion
  const handleDeleteAnimation = (id: string) => {
    setCustomAnimations(prev => prev.filter(anim => anim.id !== id));
    toast({
      title: 'Animation deleted',
      description: 'Your custom animation has been removed'
    });
  };
  
  // Handle animation selection
  const handleSelectAnimation = (animation: CustomAnimation) => {
    setSelectedAnimationId(animation.id);
    onSelectAnimation(animation);
    toast({
      title: 'Animation applied',
      description: `Now viewing your "${animation.name}" animation`
    });
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">My Custom Animations</h3>
        <Button 
          size="sm" 
          onClick={() => setIsUploadOpen(true)}
          variant="outline"
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          <span>Upload New</span>
        </Button>
      </div>
      
      {customAnimations.length === 0 ? (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            You haven't uploaded any custom animations yet
          </p>
          <Button 
            onClick={() => setIsUploadOpen(true)}
            variant="default"
            className="mx-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Animation
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {customAnimations.map(animation => (
            <div 
              key={animation.id} 
              className={`
                relative overflow-hidden border rounded-lg transition-all
                ${selectedAnimationId === animation.id 
                  ? 'border-blue-500 shadow-md' 
                  : 'border-gray-300 dark:border-gray-700'
                }
                hover:shadow-md
              `}
            >
              {/* Preview image */}
              <div 
                className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer"
                onClick={() => handleSelectAnimation(animation)}
              >
                <img 
                  src={animation.imageData} 
                  alt={animation.name}
                  className="object-cover w-full h-full"
                />
                
                {/* Color indicators */}
                <div className="absolute bottom-2 right-2 flex space-x-1">
                  <div 
                    className="h-3 w-3 rounded-full" 
                    style={{ backgroundColor: animation.colors.primary }}
                    title="Primary color"
                  />
                  <div 
                    className="h-3 w-3 rounded-full" 
                    style={{ backgroundColor: animation.colors.secondary }}
                    title="Secondary color"
                  />
                  <div 
                    className="h-3 w-3 rounded-full" 
                    style={{ backgroundColor: animation.colors.accent }}
                    title="Accent color"
                  />
                </div>
              </div>
              
              {/* Animation details */}
              <div className="p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium truncate">{animation.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{animation.soundscapeType}</p>
                  </div>
                  
                  {/* Actions */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteAnimation(animation.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
                
                {animation.description && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {animation.description}
                  </p>
                )}
              </div>
              
              {/* Selected indicator */}
              {selectedAnimationId === animation.id && (
                <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  Active
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Custom animation upload dialog */}
      <CustomAnimationUpload
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onAnimationUpload={handleAnimationUpload}
      />
    </div>
  );
};

export default CustomAnimationsManager;