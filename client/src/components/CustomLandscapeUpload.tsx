import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { FileUp, Image, Upload, X } from 'lucide-react';
import { SoundscapeType } from '@/hooks/useMultipleSoundscapes';

interface CustomLandscapeUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onLandscapeCreate: (landscape: {
    name: string;
    description: string;
    thumbnailUrl: string;
    soundscape: SoundscapeType;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    }
  }) => void;
}

const CustomLandscapeUpload: React.FC<CustomLandscapeUploadProps> = ({
  isOpen,
  onClose,
  onLandscapeCreate
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [soundscape, setSoundscape] = useState<SoundscapeType>('peaceful');
  const [primaryColor, setPrimaryColor] = useState('#3b1d61');
  const [secondaryColor, setSecondaryColor] = useState('#1e4464');
  const [accentColor, setAccentColor] = useState('#61c3df');
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (JPG, PNG, etc.)",
          variant: "destructive"
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  // Reset form
  const resetForm = () => {
    setName('');
    setDescription('');
    setSoundscape('peaceful');
    setPrimaryColor('#3b1d61');
    setSecondaryColor('#1e4464');
    setAccentColor('#61c3df');
    setSelectedFile(null);
    setPreviewUrl(null);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your landscape",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedFile && !previewUrl) {
      toast({
        title: "Image required",
        description: "Please upload an image for your landscape",
        variant: "destructive"
      });
      return;
    }
    
    // Simulate upload
    setIsUploading(true);
    
    try {
      // In a real app, you would upload the file to a server here
      // For now, we'll just use the dataURL as the thumbnail
      const thumbnailUrl = previewUrl || '';
      
      // Create the landscape
      onLandscapeCreate({
        name,
        description,
        thumbnailUrl,
        soundscape,
        colors: {
          primary: primaryColor,
          secondary: secondaryColor,
          accent: accentColor
        }
      });
      
      toast({
        title: "Landscape created",
        description: `Your custom landscape "${name}" has been created successfully`
      });
      
      resetForm();
      onClose();
    } catch (error) {
      toast({
        title: "Error creating landscape",
        description: "An error occurred while creating your landscape. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-gray-900 text-white border-gray-800 sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-lg font-semibold">Upload Custom Landscape</DialogTitle>
            <button onClick={onClose} className="text-gray-500 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 py-2">
            {/* Image Upload */}
            <div>
              <Label className="text-sm block mb-2">Landscape Image</Label>
              
              {previewUrl ? (
                <div className="relative aspect-video bg-gray-800 rounded-md overflow-hidden">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-80 hover:opacity-100"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div 
                  className="flex flex-col items-center justify-center aspect-video bg-gray-800 rounded-md cursor-pointer hover:bg-gray-750 border-2 border-dashed border-gray-700 hover:border-indigo-600 transition-colors"
                  onClick={handleUploadClick}
                >
                  <Image className="h-10 w-10 text-gray-500 mb-2" />
                  <p className="text-sm text-gray-400">Click to upload landscape image</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, WebP (max 5MB)</p>
                </div>
              )}
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            
            {/* Landscape Details */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="landscape-name" className="text-sm block mb-1">
                  Landscape Name
                </Label>
                <Input
                  id="landscape-name"
                  placeholder="Enter landscape name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="landscape-description" className="text-sm block mb-1">
                  Description
                </Label>
                <textarea
                  id="landscape-description"
                  placeholder="Describe your landscape"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-md p-2.5 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:outline-none"
                />
              </div>
            </div>
            
            {/* Soundscape Selection */}
            <div>
              <Label htmlFor="soundscape-select" className="text-sm block mb-1">
                Soundscape
              </Label>
              <select
                id="soundscape-select"
                value={soundscape}
                onChange={(e) => setSoundscape(e.target.value as SoundscapeType)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-md p-2.5 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:outline-none"
              >
                <option value="peaceful">Peaceful</option>
                <option value="mysterious">Mysterious</option>
                <option value="dramatic">Dramatic</option>
                <option value="cheerful">Cheerful</option>
                <option value="melancholic">Melancholic</option>
              </select>
            </div>
            
            {/* Color Selection */}
            <div>
              <Label className="text-sm block mb-2">Color Palette</Label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Primary</p>
                  <div className="flex">
                    <div 
                      className="w-8 h-8 rounded-l-md border border-gray-700"
                      style={{ backgroundColor: primaryColor }}
                    ></div>
                    <Input 
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="rounded-l-none h-8 p-0 w-full border-gray-700"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Secondary</p>
                  <div className="flex">
                    <div 
                      className="w-8 h-8 rounded-l-md border border-gray-700"
                      style={{ backgroundColor: secondaryColor }}
                    ></div>
                    <Input 
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="rounded-l-none h-8 p-0 w-full border-gray-700"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Accent</p>
                  <div className="flex">
                    <div 
                      className="w-8 h-8 rounded-l-md border border-gray-700"
                      style={{ backgroundColor: accentColor }}
                    ></div>
                    <Input 
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="rounded-l-none h-8 p-0 w-full border-gray-700"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="border-t border-gray-800 pt-4 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Create Landscape
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomLandscapeUpload;