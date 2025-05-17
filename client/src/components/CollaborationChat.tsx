import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, X } from 'lucide-react';
import { ChatMessage, CollaborationUser } from '@/hooks/useCollaborativeVisualization';

interface CollaborationChatProps {
  messages: ChatMessage[];
  activeUsers: CollaborationUser[];
  onSendMessage: (message: string) => void;
  onClose: () => void;
  currentUsername: string;
}

const CollaborationChat: React.FC<CollaborationChatProps> = ({
  messages,
  activeUsers,
  onSendMessage,
  onClose,
  currentUsername
}) => {
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim()) {
      onSendMessage(messageText);
      setMessageText('');
    }
  };
  
  // Format timestamp for display
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-full border rounded-md bg-background">
      {/* Chat header */}
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="flex items-center">
          <span className="font-medium">Collaboration Chat</span>
          <div className="ml-2 bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">
            {activeUsers.length} {activeUsers.length === 1 ? 'user' : 'users'}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Active users sidebar */}
        <div className="w-1/4 min-w-[120px] border-r p-2 bg-muted/30 hidden md:block">
          <h4 className="text-xs font-medium mb-2 text-muted-foreground">PARTICIPANTS</h4>
          <ul className="space-y-1">
            {activeUsers.map(user => (
              <li 
                key={user.id} 
                className={`text-sm py-1 px-2 rounded ${user.username === currentUsername ? 'bg-primary/20 text-primary font-medium' : ''}`}
              >
                {user.username} {user.username === currentUsername ? '(you)' : ''}
              </li>
            ))}
          </ul>
        </div>
        
        {/* Messages area */}
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-3">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                No messages yet. Start the conversation!
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`flex ${msg.sender.username === currentUsername ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] px-3 py-2 rounded-lg ${
                        msg.sender.username === currentUsername 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}
                    >
                      {msg.sender.username !== currentUsername && (
                        <div className="text-xs font-medium mb-1">{msg.sender.username}</div>
                      )}
                      <div className="text-sm break-words">{msg.message}</div>
                      <div className="text-xs opacity-70 mt-1 text-right">{formatTime(msg.timestamp)}</div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>
          
          {/* Message input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t">
            <div className="flex items-center space-x-2">
              <Input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!messageText.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CollaborationChat;