import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Share, Users, UserPlus, Link as LinkIcon, Copy, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { VisualizationData } from '@/hooks/useCollaborativeVisualization';

interface CollaborationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: (username: string) => void;
  onJoinRoom: (roomId: string, username: string) => void;
  currentVisualizationData: VisualizationData;
  roomId?: string;
  isOwner?: boolean;
}

const CollaborationModal: React.FC<CollaborationModalProps> = ({
  isOpen,
  onClose,
  onCreateRoom,
  onJoinRoom,
  currentVisualizationData,
  roomId,
  isOwner
}) => {
  const [username, setUsername] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [activeTab, setActiveTab] = useState(roomId ? 'manage' : 'create');
  const { toast } = useToast();

  // Handle form submissions
  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast({
        title: 'Username required',
        description: 'Please enter a username to create a room',
        variant: 'destructive'
      });
      return;
    }
    onCreateRoom(username);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast({
        title: 'Username required',
        description: 'Please enter a username to join a room',
        variant: 'destructive'
      });
      return;
    }
    if (!joinRoomId.trim()) {
      toast({
        title: 'Room ID required',
        description: 'Please enter a room ID to join',
        variant: 'destructive'
      });
      return;
    }
    onJoinRoom(joinRoomId, username);
  };

  const copyRoomIdToClipboard = () => {
    if (!roomId) return;
    
    navigator.clipboard.writeText(roomId).then(() => {
      toast({
        title: 'Room ID copied!',
        description: 'Share this with others to let them join your visualization',
      });
    }).catch(err => {
      console.error('Failed to copy room ID:', err);
      toast({
        title: 'Failed to copy',
        description: 'Please try again or manually select and copy the room ID',
        variant: 'destructive'
      });
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Real-time Collaboration</DialogTitle>
          <DialogDescription>
            Create or join a collaborative visualization session to share your creative process with others.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={activeTab} className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create" disabled={!!roomId}>
              <UserPlus className="h-4 w-4 mr-2" />
              Create
            </TabsTrigger>
            <TabsTrigger value="join" disabled={!!roomId}>
              <Users className="h-4 w-4 mr-2" />
              Join
            </TabsTrigger>
            <TabsTrigger value="manage" disabled={!roomId}>
              <Share className="h-4 w-4 mr-2" />
              Share
            </TabsTrigger>
          </TabsList>

          {/* Create Room Tab */}
          <TabsContent value="create">
            <form onSubmit={handleCreateRoom} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="create-username">Your Display Name</Label>
                <Input 
                  id="create-username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your display name"
                  className="w-full"
                />
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full">
                  Create Collaboration Room
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          {/* Join Room Tab */}
          <TabsContent value="join">
            <form onSubmit={handleJoinRoom} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="join-username">Your Display Name</Label>
                <Input 
                  id="join-username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your display name"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-id">Room ID</Label>
                <Input 
                  id="room-id" 
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value)}
                  placeholder="Enter the room ID"
                  className="w-full"
                />
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full">
                  Join Collaboration Room
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          {/* Manage/Share Room Tab */}
          <TabsContent value="manage">
            {roomId ? (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Room ID</Label>
                  <div className="flex items-center space-x-2">
                    <div className="border rounded-md px-3 py-2 bg-muted flex-1 font-mono text-sm">
                      {roomId}
                    </div>
                    <Button variant="outline" size="icon" onClick={copyRoomIdToClipboard}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Share this ID with others to let them join your visualization session.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Sharing Status</Label>
                  <div className="flex items-center space-x-2 py-2">
                    <div className={`w-3 h-3 rounded-full ${isOwner ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                    <span className="text-sm">{isOwner ? 'You are the owner of this room' : 'You joined as a collaborator'}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <Button variant="secondary" className="w-full" onClick={onClose}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Continue to Collaboration
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-4">
                <p className="text-sm text-muted-foreground">
                  You're not currently in any collaboration room. Create or join a room first.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CollaborationModal;