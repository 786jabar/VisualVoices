import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Share, MessageSquare, Users, Globe } from 'lucide-react';
import AdvancedVisualizationCanvas from './AdvancedVisualizationCanvas';
import useCollaborativeVisualization, { 
  VisualizationData, 
  CollaborationUser, 
  ChatMessage 
} from '@/hooks/useCollaborativeVisualization';
import CollaborationModal from './CollaborationModal';
import CollaborationChat from './CollaborationChat';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface CollaborativeVisualizerProps {
  initialSentiment: 'Negative' | 'Neutral' | 'Positive';
  initialSentimentScore: number;
  initialText: string;
  initialColorIntensity: boolean;
  initialMotion: boolean;
  poeticSummary?: string | null;
  onClose?: () => void;
}

export default function CollaborativeVisualizer({
  initialSentiment,
  initialSentimentScore,
  initialText,
  initialColorIntensity,
  initialMotion,
  poeticSummary,
  onClose
}: CollaborativeVisualizerProps) {
  // Toast for notifications
  const { toast } = useToast();
  
  // Visualization states
  const [sentiment, setSentiment] = useState<'Negative' | 'Neutral' | 'Positive'>(initialSentiment);
  const [sentimentScore, setSentimentScore] = useState(initialSentimentScore);
  const [text, setText] = useState(initialText);
  const [colorIntensity, setColorIntensity] = useState(initialColorIntensity);
  const [motion, setMotion] = useState(initialMotion);
  const [summary, setSummary] = useState<string | null>(poeticSummary || null);
  
  // UI states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCollaborationModalOpen, setIsCollaborationModalOpen] = useState(false);
  
  // Get collaboration hook
  const {
    isConnected,
    error,
    room,
    isOwner,
    visualizationData,
    chatMessages,
    activeUsers,
    username,
    createRoom,
    joinRoom,
    leaveRoom,
    updateVisualization,
    sendChatMessage
  } = useCollaborativeVisualization();

  // Update local visualization state when collaborative data changes
  useEffect(() => {
    if (visualizationData) {
      setSentiment(visualizationData.sentiment);
      setSentimentScore(visualizationData.sentimentScore);
      setText(visualizationData.text);
      setColorIntensity(visualizationData.colorIntensity);
      setMotion(visualizationData.motion);
      setSummary(visualizationData.poeticSummary || null);
    }
  }, [visualizationData]);

  // Show errors from websocket if any
  useEffect(() => {
    if (error) {
      toast({
        title: 'Collaboration Error',
        description: error,
        variant: 'destructive'
      });
    }
  }, [error, toast]);

  // Show connection status
  useEffect(() => {
    if (isConnected) {
      toast({
        title: 'Connected',
        description: 'Connected to the collaboration server',
      });
    }
  }, [isConnected, toast]);

  // Handle room creation
  const handleCreateRoom = (username: string) => {
    const initialData: VisualizationData = {
      sentiment,
      sentimentScore,
      text,
      colorIntensity,
      motion,
      poeticSummary: summary
    };
    
    createRoom(username, initialData);
    setIsCollaborationModalOpen(false);
    
    toast({
      title: 'Room Created',
      description: 'Your collaboration room has been created. Share the Room ID with others to invite them.'
    });
  };

  // Handle joining a room
  const handleJoinRoom = (roomId: string, username: string) => {
    joinRoom(roomId, username);
    setIsCollaborationModalOpen(false);
    
    toast({
      title: 'Joining Room',
      description: 'Attempting to join the collaboration room...'
    });
  };

  // Handle leaving a room
  const handleLeaveRoom = () => {
    leaveRoom();
    
    toast({
      title: 'Left Room',
      description: 'You have left the collaboration room'
    });
    
    // Reset to initial visualization
    setSentiment(initialSentiment);
    setSentimentScore(initialSentimentScore);
    setText(initialText);
    setColorIntensity(initialColorIntensity);
    setMotion(initialMotion);
    setSummary(poeticSummary || null);
  };

  // Update visualization when the owner makes changes
  useEffect(() => {
    if (isOwner && room) {
      const currentData: VisualizationData = {
        sentiment,
        sentimentScore,
        text,
        colorIntensity,
        motion,
        poeticSummary: summary
      };
      
      updateVisualization(currentData);
    }
  }, [isOwner, room, sentiment, sentimentScore, text, colorIntensity, motion, summary, updateVisualization]);

  return (
    <div className="flex flex-col h-full">
      {/* Collaboration Status Bar */}
      {room && (
        <div className="bg-muted/50 p-2 px-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <span>
              Collaborating with <strong>{activeUsers.length - 1}</strong> {activeUsers.length - 1 === 1 ? 'person' : 'people'}
            </span>
            {isOwner && (
              <Badge variant="secondary" className="ml-2">Owner</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="flex gap-1 items-center"
            >
              <MessageSquare className="h-4 w-4" />
              Chat
              {chatMessages.length > 0 && (
                <Badge variant="secondary" className="ml-1">{chatMessages.length}</Badge>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollaborationModalOpen(true)}
              className="flex gap-1 items-center"
            >
              <Users className="h-4 w-4" />
              Room
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLeaveRoom}
              className="text-destructive hover:text-destructive/80"
            >
              Leave
            </Button>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Main Visualization Canvas */}
        <div className={`flex-1 ${isChatOpen ? 'lg:w-2/3' : 'w-full'}`}>
          <AdvancedVisualizationCanvas
            sentiment={sentiment}
            sentimentScore={sentimentScore}
            text={text}
            isProcessing={false}
            colorIntensity={colorIntensity}
            motion={motion}
            onClearSummary={isOwner ? () => setSummary(null) : undefined}
          />
        </div>
        
        {/* Chat Panel */}
        {isChatOpen && room && (
          <div className="w-full lg:w-1/3 h-full overflow-hidden border-l">
            <CollaborationChat
              messages={chatMessages}
              activeUsers={activeUsers}
              onSendMessage={sendChatMessage}
              onClose={() => setIsChatOpen(false)}
              currentUsername={username}
            />
          </div>
        )}
      </div>
      
      {/* Collaboration Controls (if not in a room) */}
      {!room && (
        <div className="absolute bottom-6 right-6">
          <Button 
            onClick={() => setIsCollaborationModalOpen(true)}
            className="shadow-lg"
          >
            <Share className="h-4 w-4 mr-2" />
            Share Visualization
          </Button>
        </div>
      )}
      
      {/* Collaboration Modal */}
      <CollaborationModal
        isOpen={isCollaborationModalOpen}
        onClose={() => setIsCollaborationModalOpen(false)}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        currentVisualizationData={{
          sentiment,
          sentimentScore,
          text,
          colorIntensity,
          motion,
          poeticSummary: summary
        }}
        roomId={room?.roomId}
        isOwner={isOwner}
      />
    </div>
  );
}