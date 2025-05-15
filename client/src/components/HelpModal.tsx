import { FC } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { X, Mic, Shrub, Feather, Camera } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: FC<HelpModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-dark-100 text-white border-dark-200 sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-lg font-poppins font-semibold">How to Use Vocal Earth</DialogTitle>
            <button onClick={onClose} className="text-dark-500 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 max-h-[70vh] overflow-y-auto py-2">
          <div>
            <h4 className="font-medium mb-1 flex items-center">
              <Mic className="text-primary mr-2 h-5 w-5" />
              Start Speaking
            </h4>
            <DialogDescription className="text-dark-500">
              Click the "Start Speaking" button and begin talking. Your words will be captured and visualized in real-time.
            </DialogDescription>
          </div>
          
          <div>
            <h4 className="font-medium mb-1 flex items-center">
              <Shrub className="text-secondary mr-2 h-5 w-5" />
              Watch the Shrub Form
            </h4>
            <DialogDescription className="text-dark-500">
              As you speak, your words will influence the mood, colors, and shapes of the surreal landscape.
            </DialogDescription>
          </div>
          
          <div>
            <h4 className="font-medium mb-1 flex items-center">
              <Feather className="text-accent mr-2 h-5 w-5" />
              Generate Poetic Summary
            </h4>
            <DialogDescription className="text-dark-500">
              When you finish speaking, a poetic description of your created world will be generated.
            </DialogDescription>
          </div>
          
          <div>
            <h4 className="font-medium mb-1 flex items-center">
              <Camera className="text-warning mr-2 h-5 w-5" />
              Save Your Creation
            </h4>
            <DialogDescription className="text-dark-500">
              Use the "Save Image" button to capture your landscape as an image you can download and share.
            </DialogDescription>
          </div>
          
          <div className="pt-2">
            <p className="text-xs text-dark-500">Note: For the best experience, use Vocal Earth in a quiet environment and speak clearly.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HelpModal;
