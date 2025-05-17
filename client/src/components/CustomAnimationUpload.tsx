import React, { useState, useRef } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, XCircle, ImagePlus } from 'lucide-react';
import { SoundscapeType } from '@/hooks/stableSoundscapes';

interface CustomAnimationUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onAnimationUpload: (animation: CustomAnimation) => void;
}

export interface CustomAnimation {
  id: string;
  name: string;
  description: string;
  imageData: string; // Base64 encoded image data
  soundscapeType: SoundscapeType;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

const CustomAnimationUpload: React.FC<CustomAnimationUploadProps> = ({
  isOpen,
  onClose,
  onAnimationUpload
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#3b1d61');
  const [secondaryColor, setSecondaryColor] = useState('#1e4464');
  const [accentColor, setAccentColor] = useState('#61c3df');
  const [soundscapeType, setSoundscapeType] = useState<SoundscapeType>('peaceful');
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB',
        variant: 'destructive'
      });
      return;
    }
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please select a JPEG, PNG, GIF, or SVG image',
        variant: 'destructive'
      });
      return;
    }
    
    // Read the file and create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!name || !previewImage) {
      toast({
        title: 'Missing information',
        description: 'Please provide a name and upload an image',
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);
    
    // Create custom animation object
    const animation: CustomAnimation = {
      id: `custom-${Date.now()}`,
      name,
      description,
      imageData: previewImage,
      soundscapeType,
      colors: {
        primary: primaryColor,
        secondary: secondaryColor,
        accent: accentColor
      }
    };
    
    // Upload the animation (delay to simulate processing)
    setTimeout(() => {
      onAnimationUpload(animation);
      
      // Reset form
      setName('');
      setDescription('');
      setPreviewImage(null);
      setPrimaryColor('#3b1d61');
      setSecondaryColor('#1e4464');
      setAccentColor('#61c3df');
      setSoundscapeType('peaceful');
      setIsLoading(false);
      
      // Close dialog
      onClose();
      
      // Show success message
      toast({
        title: 'Animation uploaded',
        description: 'Your custom animation has been added to your collection',
      });
    }, 1000);
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  // Clear the selected image
  const clearImage = () => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Custom Animation</DialogTitle>
          <DialogDescription>
            Create your own custom 3D animation by uploading an image and choosing colors and sounds
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name field */}
          <div className="space-y-2">
            <Label htmlFor="name">Animation Name <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a name for your animation"
              required
            />
          </div>
          
          {/* Description field */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your animation"
            />
          </div>
          
          {/* Image upload */}
          <div className="space-y-2">
            <Label>Animation Image <span className="text-red-500">*</span></Label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/gif,image/svg+xml"
              className="hidden"
            />
            
            {!previewImage ? (
              <div 
                onClick={triggerFileInput}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
              >
                <ImagePlus className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">
                  Click to upload an image (JPEG, PNG, GIF, SVG, max 5MB)
                </p>
              </div>
            ) : (
              <div className="relative">
                <img 
                  src={previewImage} 
                  alt="Preview" 
                  className="max-h-48 rounded-lg mx-auto object-contain"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1 hover:bg-opacity-70 transition-opacity"
                >
                  <XCircle className="h-5 w-5 text-white" />
                </button>
              </div>
            )}
          </div>
          
          {/* Colors */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  id="primaryColor"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-8 h-8 rounded border border-gray-300"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  id="secondaryColor"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-8 h-8 rounded border border-gray-300"
                />
                <Input
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="accentColor">Accent Color</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  id="accentColor"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-8 h-8 rounded border border-gray-300"
                />
                <Input
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
            </div>
          </div>
          
          {/* Soundscape Type */}
          <div className="space-y-2">
            <Label htmlFor="soundscapeType">Soundscape</Label>
            <select
              id="soundscapeType"
              value={soundscapeType}
              onChange={(e) => setSoundscapeType(e.target.value as SoundscapeType)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="peaceful">Peaceful Ambient</option>
              <option value="mysterious">Mysterious</option>
              <option value="dramatic">Dramatic</option>
              <option value="cheerful">Cheerful</option>
              <option value="melancholic">Melancholic</option>
              <option value="cosmic">Cosmic</option>
              <option value="galactic">Galactic</option>
            </select>
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="ml-2"
              disabled={isLoading || !name || !previewImage}
            >
              {isLoading ? 'Uploading...' : 'Upload Animation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomAnimationUpload;