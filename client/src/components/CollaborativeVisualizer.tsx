import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Share2,
  Users,
  MessageSquare,
  Copy,
  LogOut,
  User,
  Send,
  Mic,
  Crown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import useCollaborativeVisualization from '@/hooks/useCollaborativeVisualization';
import AdvancedVisualizationCanvas from './AdvancedVisualizationCanvas';

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
  // Toast notification
  const { toast } = useToast();
  
  // Collaborative visualization hook
  const {
    isConnected,
    isOwner,
    clientId,
    room,
    visualizationData,
    chatMessages,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    updateVisualization,
    sendChatMessage,
    shareRoomLink
  } = useCollaborativeVisualization();
  
  // UI State
  const [showJoinDialog, setShowJoinDialog] = useState<boolean>(false);
  const [showShareDialog, setShowShareDialog] = useState<boolean>(false);
  const [showChatPanel, setShowChatPanel] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [roomIdToJoin, setRoomIdToJoin] = useState<string>('');
  const [chatMessage, setChatMessage] = useState<string>('');
  
  // Effect to update visualization when receiving data from collaboration
  useEffect(() => {
    if (visualizationData) {
      // Data from collaboration will override local data
      console.log('Received visualization data from collaboration:', visualizationData);
    }
  }, [visualizationData]);
  
  // Effect to check for room ID in URL
  useEffect(() => {
    // Check for room ID in URL
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get('room');
    
    if (roomId && !room) {
      setRoomIdToJoin(roomId);
      setShowJoinDialog(true);
    }
  }, [room]);
  
  // Handle error notifications
  useEffect(() => {
    if (error) {
      toast({
        title: 'Collaboration Error',
        description: error,
        variant: 'destructive'
      });
    }
  }, [error, toast]);
  
  // Create a new collaboration room
  const handleCreateRoom = () => {
    if (!username.trim()) {
      toast({
        title: 'Username Required',
        description: 'Please enter a username to create a collaborative session.',
        variant: 'destructive'
      });
      return;
    }
    
    createRoom(username, {
      sentiment: initialSentiment,
      sentimentScore: initialSentimentScore,
      text: initialText,
      colorIntensity: initialColorIntensity,
      motion: initialMotion,
      poeticSummary
    });
    
    toast({
      title: 'Collaboration Started',
      description: 'Room created! Share the link with others to collaborate.'
    });
  };
  
  // Join an existing room
  const handleJoinRoom = () => {
    if (!username.trim()) {
      toast({
        title: 'Username Required',
        description: 'Please enter a username to join the collaborative session.',
        variant: 'destructive'
      });
      return;
    }
    
    if (!roomIdToJoin.trim()) {
      toast({
        title: 'Room ID Required',
        description: 'Please enter a room ID to join.',
        variant: 'destructive'
      });
      return;
    }
    
    joinRoom(roomIdToJoin, username);
    setShowJoinDialog(false);
    
    // Remove room ID from URL to prevent repeated join prompts
    const url = new URL(window.location.href);
    url.searchParams.delete('room');
    window.history.replaceState({}, document.title, url.toString());
  };
  
  // Leave the current room
  const handleLeaveRoom = () => {
    leaveRoom();
    
    toast({
      title: 'Left Collaboration',
      description: 'You have left the collaborative session.'
    });
  };
  
  // Share the room link
  const handleShareLink = () => {
    const link = shareRoomLink();
    navigator.clipboard.writeText(link).then(() => {
      toast({
        title: 'Link Copied',
        description: 'Collaboration link copied to clipboard!'
      });
    });
  };
  
  // Send a chat message
  const handleSendChatMessage = () => {
    if (!chatMessage.trim()) return;
    
    sendChatMessage(chatMessage);
    setChatMessage('');
  };
  
  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };
  
  return (
    <div className="flex flex-col h-full w-full relative bg-black rounded-lg overflow-hidden">
      {/* Visualization Canvas */}
      <div className={`flex-grow ${showChatPanel ? 'w-3/4' : 'w-full'}`}>
        {visualizationData ? (
          <AdvancedVisualizationCanvas
            sentiment={visualizationData.sentiment}
            sentimentScore={visualizationData.sentimentScore}
            text={visualizationData.text}
            isProcessing={false}
            colorIntensity={visualizationData.colorIntensity}
            motion={visualizationData.motion}
          />
        ) : (
          <AdvancedVisualizationCanvas
            sentiment={initialSentiment}
            sentimentScore={initialSentimentScore}
            text={initialText}
            isProcessing={false}
            colorIntensity={initialColorIntensity}
            motion={initialMotion}
          />
        )}
      </div>
      
      {/* Collaboration Panel */}
      <div className="absolute bottom-4 right-4 flex items-center space-x-2">
        {/* Join Room Button */}
        {!room && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-black/40 border-gray-600 hover:bg-black/60 text-white"
                  onClick={() => setShowJoinDialog(true)}
                >
                  <Users className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Join Collaborative Session</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {/* Create Room Button */}
        {!room && (
          <Button
            variant="outline"
            className="bg-black/40 border-gray-600 hover:bg-black/60 text-white"
            onClick={() => setShowJoinDialog(true)}
          >
            <Users className="h-5 w-5 mr-2" />
            <span>Collaborate</span>
          </Button>
        )}
        
        {/* Room Controls (when in a room) */}
        {room && (
          <>
            {/* Share Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-black/40 border-gray-600 hover:bg-black/60 text-white"
                    onClick={() => setShowShareDialog(true)}
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share Session</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* Toggle Chat Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className={`${
                      showChatPanel ? 'bg-white/20' : 'bg-black/40'
                    } border-gray-600 hover:bg-black/60 text-white`}
                    onClick={() => setShowChatPanel(!showChatPanel)}
                  >
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{showChatPanel ? 'Hide Chat' : 'Show Chat'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* User Count */}
            <div className="bg-black/40 border border-gray-600 text-white rounded-full px-3 py-1 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              <span>{room.users.length}</span>
            </div>
            
            {/* Leave Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-black/40 border-red-900 hover:bg-red-900/30 text-white"
                    onClick={handleLeaveRoom}
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Leave Session</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        )}
      </div>
      
      {/* Chat Panel */}
      {room && showChatPanel && (
        <div className="absolute top-0 right-0 h-full w-1/4 bg-black/80 border-l border-gray-700 flex flex-col">
          {/* Chat Header */}
          <div className="p-3 border-b border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-white flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-white"
              onClick={() => setShowChatPanel(false)}
            >
              &times;
            </Button>
          </div>
          
          {/* Participants */}
          <div className="p-2 border-b border-gray-700">
            <h4 className="text-xs text-gray-500 mb-1">PARTICIPANTS</h4>
            <div className="max-h-24 overflow-y-auto">
              {room.users.map((user) => (
                <div key={user.id} className="flex items-center text-sm py-1 text-gray-300">
                  {room.owner === user.id ? (
                    <Crown className="h-3 w-3 mr-2 text-yellow-500" />
                  ) : (
                    <User className="h-3 w-3 mr-2" />
                  )}
                  <span>{user.username}</span>
                  {user.id === clientId && (
                    <span className="text-xs ml-2 text-gray-500">(you)</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Chat Messages */}
          <div className="flex-grow overflow-y-auto p-3 space-y-2">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  msg.sender.id === clientId
                    ? 'items-end'
                    : msg.sender.id === 'system'
                    ? 'items-center'
                    : 'items-start'
                }`}
              >
                {msg.sender.id !== 'system' && (
                  <span
                    className={`text-xs ${
                      msg.sender.id === clientId ? 'text-blue-400' : 'text-green-400'
                    }`}
                  >
                    {msg.sender.id === clientId ? 'You' : msg.sender.username}{' '}
                    <span className="text-gray-500">{formatTimestamp(msg.timestamp)}</span>
                  </span>
                )}
                <div
                  className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${
                    msg.sender.id === 'system'
                      ? 'bg-gray-800/50 text-gray-400 text-xs italic'
                      : msg.sender.id === clientId
                      ? 'bg-blue-900/50 text-white'
                      : 'bg-gray-700/70 text-white'
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            ))}
          </div>
          
          {/* Chat Input */}
          <div className="p-3 border-t border-gray-700 flex">
            <Input
              type="text"
              placeholder="Type a message..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendChatMessage();
                }
              }}
              className="bg-gray-800 border-gray-700 text-white focus:border-blue-500"
            />
            <Button
              variant="ghost"
              size="icon"
              className="ml-1 text-gray-400 hover:text-white"
              onClick={handleSendChatMessage}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Join/Create Room Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent className="bg-gray-900 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Join or Create a Collaborative Session</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 my-2">
            {/* Username */}
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Your Display Name
              </label>
              <Input
                id="username"
                placeholder="Enter your name..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-gray-800 border-gray-700"
              />
            </div>
            
            {/* Room ID (if joining) */}
            {roomIdToJoin && (
              <div className="space-y-2">
                <label htmlFor="roomId" className="text-sm font-medium">
                  Room ID to Join
                </label>
                <Input
                  id="roomId"
                  placeholder="Enter room ID..."
                  value={roomIdToJoin}
                  onChange={(e) => setRoomIdToJoin(e.target.value)}
                  disabled
                  className="bg-gray-800 border-gray-700"
                />
                <p className="text-xs text-gray-400">
                  You're being invited to join an existing visualization session.
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            {roomIdToJoin ? (
              <Button
                variant="default"
                onClick={handleJoinRoom}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Join Session
              </Button>
            ) : (
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  onClick={() => setShowJoinDialog(false)}
                  className="border-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={handleCreateRoom}
                  className="bg-blue-600 hover:bg-blue-700 flex-1"
                >
                  Create New Session
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="bg-gray-900 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Share Collaborative Session</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 my-2">
            <p className="text-sm text-gray-300">
              Share this link with others to invite them to your collaborative visualization session:
            </p>
            
            <div className="flex">
              <Input
                value={shareRoomLink()}
                readOnly
                className="bg-gray-800 border-gray-700 pr-10"
              />
              <Button
                variant="ghost"
                size="icon"
                className="ml-2"
                onClick={handleShareLink}
              >
                <Copy className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="mt-2">
              <h4 className="text-sm font-medium mb-1">Current Participants:</h4>
              <div className="max-h-24 overflow-y-auto">
                {room?.users.map((user) => (
                  <div key={user.id} className="flex items-center text-sm py-1">
                    {room.owner === user.id ? (
                      <Crown className="h-4 w-4 mr-2 text-yellow-500" />
                    ) : (
                      <User className="h-4 w-4 mr-2" />
                    )}
                    <span>{user.username}</span>
                    {user.id === clientId && (
                      <span className="text-xs ml-2 text-gray-500">(you)</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="default"
              onClick={() => setShowShareDialog(false)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}