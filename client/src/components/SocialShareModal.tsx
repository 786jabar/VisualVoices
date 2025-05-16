import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Mail, 
  Link2, 
  X, 
  Instagram,
  Copy,
  Check
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  description?: string;
  poeticSummary?: string | null;
}

const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
  description = '',
  poeticSummary
}) => {
  const { toast } = useToast();
  const [customMessage, setCustomMessage] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  
  // Create share URLs
  const shareText = encodeURIComponent(poeticSummary || description || title);
  const shareUrl = encodeURIComponent(window.location.href);
  const fullShareText = encodeURIComponent(`${title} - Vocal Earth\n\n${customMessage || poeticSummary || description}`);
  
  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${fullShareText}&url=${shareUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${fullShareText}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
    email: `mailto:?subject=${encodeURIComponent(`Check out my Vocal Earth creation: ${title}`)}&body=${fullShareText}%0A%0A${shareUrl}`,
  };
  
  // Handle copy to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        setIsCopied(true);
        toast({
          title: "Link copied!",
          description: "Share link copied to clipboard"
        });
        
        // Reset copy state after 2 seconds
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      })
      .catch((error) => {
        console.error("Error copying link:", error);
        toast({
          title: "Copy failed",
          description: "Could not copy link to clipboard",
          variant: "destructive"
        });
      });
  };
  
  // Handle direct sharing via Web Share API if available
  const handleNativeShare = () => {
    if (typeof navigator.share === 'function') {
      navigator.share({
        title: `Vocal Earth: ${title}`,
        text: customMessage || poeticSummary || description || title,
        url: window.location.href
      })
      .then(() => {
        toast({
          title: "Shared successfully!",
          description: "Your visualization has been shared"
        });
      })
      .catch((error) => {
        console.error("Error sharing:", error);
        
        // If canceled by user, don't show error
        if (error.name !== 'AbortError') {
          toast({
            title: "Sharing failed",
            description: "Could not share your visualization",
            variant: "destructive"
          });
        }
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      toast({
        title: "Not supported",
        description: "Your browser doesn't support direct sharing. Try using the social media buttons instead."
      });
    }
  };
  
  // Download image
  const handleDownloadImage = () => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `vocal-earth-${title.toLowerCase().replace(/\s+/g, '-')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast({
      title: "Download started",
      description: "Your image is being downloaded"
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-gray-900 text-white border-gray-800 sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-lg font-semibold">Share Visualization</DialogTitle>
            <button onClick={onClose} className="text-gray-500 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>
        
        <div className="space-y-5 py-2">
          {/* Preview */}
          <div className="relative aspect-video bg-gray-800 rounded-md overflow-hidden">
            <img 
              src={imageUrl} 
              alt={title} 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Title */}
          <div>
            <h3 className="font-medium text-lg">{title}</h3>
            {poeticSummary && (
              <p className="text-gray-400 text-sm line-clamp-2 mt-1 italic">"{poeticSummary}"</p>
            )}
          </div>
          
          {/* Custom Message */}
          <div>
            <label className="text-sm text-gray-300 block mb-1.5">Add a message (optional)</label>
            <Textarea
              placeholder="Say something about this visualization..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="bg-gray-800 border-gray-700 resize-none"
              rows={2}
            />
          </div>
          
          {/* Social Share Buttons */}
          <div>
            <label className="text-sm text-gray-300 block mb-2">Share on social media</label>
            <div className="grid grid-cols-4 gap-2">
              <a 
                href={shareLinks.twitter} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1"
              >
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-full bg-gray-800 border-gray-700 hover:bg-blue-600 hover:text-white hover:border-blue-600">
                  <Twitter className="h-5 w-5" />
                </Button>
                <span className="text-xs text-gray-400">Twitter</span>
              </a>
              
              <a 
                href={shareLinks.facebook} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1"
              >
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-full bg-gray-800 border-gray-700 hover:bg-blue-700 hover:text-white hover:border-blue-700">
                  <Facebook className="h-5 w-5" />
                </Button>
                <span className="text-xs text-gray-400">Facebook</span>
              </a>
              
              <a 
                href={shareLinks.linkedin} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1"
              >
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-full bg-gray-800 border-gray-700 hover:bg-blue-800 hover:text-white hover:border-blue-800">
                  <Linkedin className="h-5 w-5" />
                </Button>
                <span className="text-xs text-gray-400">LinkedIn</span>
              </a>
              
              <a 
                href={shareLinks.email} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1"
              >
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-full bg-gray-800 border-gray-700 hover:bg-red-600 hover:text-white hover:border-red-600">
                  <Mail className="h-5 w-5" />
                </Button>
                <span className="text-xs text-gray-400">Email</span>
              </a>
            </div>
          </div>
          
          {/* Copy Link */}
          <div>
            <label className="text-sm text-gray-300 block mb-1.5">Copy direct link</label>
            <div className="flex">
              <Input 
                value={window.location.href}
                readOnly
                className="bg-gray-800 border-gray-700 rounded-r-none flex-1"
              />
              <Button 
                onClick={handleCopyLink}
                className="rounded-l-none bg-indigo-600 hover:bg-indigo-700"
              >
                {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter className="border-t border-gray-800 pt-4 flex gap-2">
          <Button
            variant="outline"
            onClick={handleDownloadImage}
            className="border-gray-700 hover:bg-gray-800"
          >
            Download Image
          </Button>
          
          {/* Direct share button (for mobile devices) */}
          {navigator.share && (
            <Button
              onClick={handleNativeShare}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Share Now
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SocialShareModal;