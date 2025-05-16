import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Facebook, Twitter, Instagram, Link, Copy, Check, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  description?: string;
  poeticSummary?: string | null;
}

export default function SocialShareModal({
  isOpen,
  onClose,
  imageUrl,
  title,
  description,
  poeticSummary
}: SocialShareModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('share');
  
  // Generate a page URL for sharing
  const pageUrl = window.location.href;
  
  // Handle copy to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(pageUrl).then(() => {
      setCopied(true);
      toast({
        title: 'Success',
        description: 'Link copied to clipboard',
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
      toast({
        title: 'Error',
        description: 'Failed to copy link',
        variant: 'destructive'
      });
    });
  };
  
  // Handle social media sharing
  const handleShare = (platform: string) => {
    let shareUrl = '';
    const shareText = `Check out this "Vocal Earth" visualization: ${title}`;
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}&quote=${encodeURIComponent(shareText)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`;
        break;
      default:
        return;
    }
    
    // Open share dialog in a new window
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-xl">
        <DialogHeader>
          <DialogTitle>Share Visualization</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="share" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="share">Share Link</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="share" className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                value={pageUrl}
                readOnly
                className="flex-1"
              />
              <Button 
                size="icon" 
                onClick={handleCopyLink}
                variant="outline"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            
            <div className="flex justify-center space-x-4 pt-4">
              <Button 
                variant="outline" 
                className="rounded-full w-12 h-12 p-0" 
                onClick={() => handleShare('twitter')}
              >
                <Twitter className="h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                className="rounded-full w-12 h-12 p-0" 
                onClick={() => handleShare('facebook')}
              >
                <Facebook className="h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                className="rounded-full w-12 h-12 p-0" 
                onClick={() => handleShare('linkedin')}
              >
                <Link className="h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                className="rounded-full w-12 h-12 p-0" 
                onClick={() => setActiveTab('preview')}
              >
                <MessageSquare className="h-5 w-5" />
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="space-y-4">
            <div className="aspect-video overflow-hidden rounded-md">
              <img 
                src={imageUrl} 
                alt={title} 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-bold text-lg">{title}</h3>
              
              {description && (
                <p className="text-sm text-gray-500">{description}</p>
              )}
              
              {poeticSummary && (
                <div className="mt-2">
                  <h4 className="text-sm font-medium text-gray-700">AI-Generated Poetic Summary:</h4>
                  <p className="italic text-sm mt-1">{poeticSummary}</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}