import { useState, useEffect, useCallback, useRef } from 'react';
import { nanoid } from 'nanoid';

// Types for collaboration
export type VisualizationData = {
  sentiment: 'Negative' | 'Neutral' | 'Positive';
  sentimentScore: number;
  text: string;
  colorIntensity: boolean;
  motion: boolean;
  poeticSummary?: string | null;
};

export type CollaborationUser = {
  id: string;
  username: string;
};

export type CollaborationRoom = {
  roomId: string;
  owner: string;
  users: CollaborationUser[];
};

export type ChatMessage = {
  sender: CollaborationUser;
  message: string;
  timestamp: string;
};

type WebSocketMessage = {
  type: string;
  [key: string]: any;
};

interface CollaborativeVisualizationHook {
  isConnected: boolean;
  isOwner: boolean;
  clientId: string;
  room: CollaborationRoom | null;
  visualizationData: VisualizationData | null;
  chatMessages: ChatMessage[];
  error: string | null;
  createRoom: (username: string, initialData: VisualizationData) => void;
  joinRoom: (roomId: string, username: string) => void;
  leaveRoom: () => void;
  updateVisualization: (data: VisualizationData) => void;
  sendChatMessage: (message: string) => void;
  shareRoomLink: () => string;
}

/**
 * Hook for real-time collaborative visualization sharing
 * Allows multiple users to view and interact with the same visualization
 */
export default function useCollaborativeVisualization(): CollaborativeVisualizationHook {
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Client and room state
  const [clientId] = useState(nanoid(8));
  const [username, setUsername] = useState<string>('');
  const [room, setRoom] = useState<CollaborationRoom | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  
  // Data state
  const [visualizationData, setVisualizationData] = useState<VisualizationData | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  // WebSocket connection
  const socket = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  
  // Function to establish WebSocket connection
  const connectWebSocket = useCallback(() => {
    try {
      // Close existing connection if any
      if (socket.current && socket.current.readyState === WebSocket.OPEN) {
        socket.current.close();
      }
      
      // Determine WebSocket URL based on environment
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      console.log('Connecting to WebSocket at:', wsUrl);
      
      // Create new WebSocket connection
      socket.current = new WebSocket(wsUrl);
      
      // Connection opened handler
      socket.current.onopen = () => {
        console.log('WebSocket connection established');
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
      };
      
      // Connection error handler
      socket.current.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('Failed to connect to collaboration server');
      };
      
      // Connection closed handler
      socket.current.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        setIsConnected(false);
        
        // Attempt to reconnect unless max attempts reached
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current})`);
          
          setTimeout(() => {
            connectWebSocket();
          }, delay);
        } else {
          setError('Could not establish a stable connection. Please try again later.');
        }
      };
      
      // Message handler
      socket.current.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          console.log('Received WebSocket message:', data.type);
          
          switch (data.type) {
            case 'room_created':
              handleRoomCreated(data);
              break;
            case 'room_joined':
              handleRoomJoined(data);
              break;
            case 'user_joined':
              handleUserJoined(data);
              break;
            case 'user_left':
              handleUserLeft(data);
              break;
            case 'visualization_update':
              handleVisualizationUpdate(data);
              break;
            case 'chat_message':
              handleChatMessage(data);
              break;
            case 'error':
              handleError(data);
              break;
            default:
              console.warn('Unknown message type:', data.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
    } catch (error) {
      console.error('Error setting up WebSocket connection:', error);
      setError('Failed to set up collaboration. Please try again.');
    }
  }, []);
  
  // Connect on initial load
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      // Cleanup WebSocket connection on unmount
      if (socket.current) {
        socket.current.close();
      }
    };
  }, [connectWebSocket]);
  
  // Send message to WebSocket server
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (!socket.current || socket.current.readyState !== WebSocket.OPEN) {
      setError('Not connected to collaboration server');
      return false;
    }
    
    try {
      socket.current.send(JSON.stringify({
        ...message,
        clientId
      }));
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
      return false;
    }
  }, [clientId]);
  
  // Create a new collaboration room
  const createRoom = useCallback((newUsername: string, initialData: VisualizationData) => {
    setUsername(newUsername);
    
    const success = sendMessage({
      type: 'create_room',
      username: newUsername,
      initialData
    });
    
    if (success) {
      setIsOwner(true);
    }
  }, [sendMessage]);
  
  // Join an existing collaboration room
  const joinRoom = useCallback((roomId: string, newUsername: string) => {
    setUsername(newUsername);
    
    sendMessage({
      type: 'join_room',
      roomId,
      username: newUsername
    });
  }, [sendMessage]);
  
  // Leave the current room
  const leaveRoom = useCallback(() => {
    if (!room) return;
    
    sendMessage({
      type: 'leave_room',
      roomId: room.roomId
    });
    
    setRoom(null);
    setVisualizationData(null);
    setChatMessages([]);
    setIsOwner(false);
  }, [room, sendMessage]);
  
  // Update visualization data (only owner can do this)
  const updateVisualization = useCallback((data: VisualizationData) => {
    if (!room) return;
    
    if (!isOwner) {
      console.warn('Only the room owner can update visualization data');
      return;
    }
    
    sendMessage({
      type: 'visualization_update',
      roomId: room.roomId,
      data
    });
    
    // Update local data immediately for owner
    setVisualizationData(data);
  }, [room, isOwner, sendMessage]);
  
  // Send a chat message
  const sendChatMessage = useCallback((message: string) => {
    if (!room || !message.trim()) return;
    
    sendMessage({
      type: 'chat_message',
      roomId: room.roomId,
      message,
      timestamp: new Date().toISOString()
    });
  }, [room, sendMessage]);
  
  // Generate shareable room link
  const shareRoomLink = useCallback(() => {
    if (!room) return '';
    
    const url = new URL(window.location.href);
    url.searchParams.set('room', room.roomId);
    return url.toString();
  }, [room]);
  
  // Handle room created message
  const handleRoomCreated = useCallback((data: WebSocketMessage) => {
    setRoom(data.room);
    setVisualizationData(data.initialData);
    setIsOwner(true);
  }, []);
  
  // Handle room joined message
  const handleRoomJoined = useCallback((data: WebSocketMessage) => {
    setRoom(data.room);
    setVisualizationData(data.visualizationData);
    setChatMessages(data.chatHistory || []);
    setIsOwner(data.room.owner === clientId);
  }, [clientId]);
  
  // Handle user joined message
  const handleUserJoined = useCallback((data: WebSocketMessage) => {
    setRoom(prevRoom => {
      if (!prevRoom) return null;
      
      // Add user to the room's user list
      return {
        ...prevRoom,
        users: [...prevRoom.users, data.user]
      };
    });
  }, []);
  
  // Handle user left message
  const handleUserLeft = useCallback((data: WebSocketMessage) => {
    setRoom(prevRoom => {
      if (!prevRoom) return null;
      
      // Remove user from the room's user list
      return {
        ...prevRoom,
        users: prevRoom.users.filter(user => user.id !== data.userId)
      };
    });
  }, []);
  
  // Handle visualization update message
  const handleVisualizationUpdate = useCallback((data: WebSocketMessage) => {
    setVisualizationData(data.data);
  }, []);
  
  // Handle chat message
  const handleChatMessage = useCallback((data: WebSocketMessage) => {
    setChatMessages(prevMessages => [
      ...prevMessages,
      {
        sender: data.sender,
        message: data.message,
        timestamp: data.timestamp
      }
    ]);
  }, []);
  
  // Handle error message
  const handleError = useCallback((data: WebSocketMessage) => {
    setError(data.message || 'An error occurred');
  }, []);
  
  return {
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
  };
}