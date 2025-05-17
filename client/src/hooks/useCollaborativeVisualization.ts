import { useState, useEffect, useCallback, useRef } from 'react';
import { nanoid } from 'nanoid';

// Types for collaboration
type VisualizationData = {
  sentiment: 'Negative' | 'Neutral' | 'Positive';
  sentimentScore: number;
  text: string;
  colorIntensity: boolean;
  motion: boolean;
  poeticSummary?: string | null;
};

type CollaborationUser = {
  id: string;
  username: string;
};

type CollaborationRoom = {
  roomId: string;
  owner: string;
  users: CollaborationUser[];
};

type ChatMessage = {
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
 * Hook for managing real-time collaborative visualization sharing
 */
export default function useCollaborativeVisualization(): CollaborativeVisualizationHook {
  // Generate a unique client ID
  const clientIdRef = useRef<string>(nanoid());
  
  // WebSocket connection
  const socketRef = useRef<WebSocket | null>(null);
  
  // State
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [room, setRoom] = useState<CollaborationRoom | null>(null);
  const [visualizationData, setVisualizationData] = useState<VisualizationData | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  // Initialize WebSocket connection
  const initializeWebSocket = useCallback(() => {
    // Close existing connection if any
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.close();
    }
    
    // Create new connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;
    
    // Connection opened
    socket.addEventListener('open', () => {
      console.log('WebSocket connection established');
      setIsConnected(true);
      setError(null);
    });
    
    // Connection closed
    socket.addEventListener('close', () => {
      console.log('WebSocket connection closed');
      setIsConnected(false);
      
      // Attempt to reconnect after a delay
      setTimeout(() => {
        if (document.visibilityState !== 'hidden') {
          initializeWebSocket();
        }
      }, 3000);
    });
    
    // Connection error
    socket.addEventListener('error', (event) => {
      console.error('WebSocket error:', event);
      setError('Failed to connect to collaboration server');
    });
    
    // Handle incoming messages
    socket.addEventListener('message', (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        handleWebSocketMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
  }, []);
  
  // Handle incoming WebSocket messages
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    console.log('Received WebSocket message:', message);
    
    switch (message.type) {
      case 'connected':
        // Connection confirmed
        setError(null);
        break;
        
      case 'error':
        // Error from server
        setError(message.message || 'An error occurred');
        break;
        
      case 'room-created':
        // Room created successfully
        setRoom({
          roomId: message.roomId,
          owner: message.owner,
          users: [{
            id: clientIdRef.current,
            username: 'You (Owner)'
          }]
        });
        break;
        
      case 'visualization-data':
        // Initial visualization data when joining a room
        setVisualizationData(message.data);
        setRoom({
          roomId: message.roomId || room?.roomId || '',
          owner: message.owner,
          users: message.users || []
        });
        break;
        
      case 'visualization-update':
        // Update to visualization from another client
        setVisualizationData(message.data);
        break;
        
      case 'user-joined':
        // New user joined the room
        setRoom(prevRoom => {
          if (!prevRoom) return prevRoom;
          
          // Add user if not already in the list
          const userExists = prevRoom.users.some(user => user.id === message.clientId);
          if (userExists) return prevRoom;
          
          return {
            ...prevRoom,
            users: [
              ...prevRoom.users,
              {
                id: message.clientId,
                username: message.username
              }
            ]
          };
        });
        
        // Add system message to chat
        setChatMessages(prev => [
          ...prev,
          {
            sender: { id: 'system', username: 'System' },
            message: `${message.username} joined the room`,
            timestamp: message.timestamp || new Date().toISOString()
          }
        ]);
        break;
        
      case 'user-left':
        // User left the room
        setRoom(prevRoom => {
          if (!prevRoom) return prevRoom;
          
          return {
            ...prevRoom,
            users: prevRoom.users.filter(user => user.id !== message.clientId)
          };
        });
        
        // Add system message to chat
        setChatMessages(prev => [
          ...prev,
          {
            sender: { id: 'system', username: 'System' },
            message: `${message.username} left the room`,
            timestamp: message.timestamp || new Date().toISOString()
          }
        ]);
        break;
        
      case 'new-owner':
        // Owner of the room changed
        setRoom(prevRoom => {
          if (!prevRoom) return prevRoom;
          
          return {
            ...prevRoom,
            owner: message.owner
          };
        });
        
        // Add system message to chat
        setChatMessages(prev => [
          ...prev,
          {
            sender: { id: 'system', username: 'System' },
            message: `${message.username} is now the room owner`,
            timestamp: new Date().toISOString()
          }
        ]);
        break;
        
      case 'chat':
        // Chat message from another user
        setChatMessages(prev => [
          ...prev,
          {
            sender: message.sender,
            message: message.message,
            timestamp: message.timestamp || new Date().toISOString()
          }
        ]);
        break;
    }
  }, [room]);
  
  // Send message to WebSocket server
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      setError('Not connected to collaboration server');
      
      // Try to reconnect
      initializeWebSocket();
    }
  }, [initializeWebSocket]);
  
  // Create a new collaboration room
  const createRoom = useCallback((username: string, initialData: VisualizationData) => {
    sendMessage({
      type: 'create',
      clientId: clientIdRef.current,
      username,
      visualizationData: initialData
    });
  }, [sendMessage]);
  
  // Join an existing collaboration room
  const joinRoom = useCallback((roomId: string, username: string) => {
    sendMessage({
      type: 'join',
      roomId,
      clientId: clientIdRef.current,
      username
    });
  }, [sendMessage]);
  
  // Leave the current room
  const leaveRoom = useCallback(() => {
    sendMessage({
      type: 'leave'
    });
    
    // Reset state
    setRoom(null);
    setVisualizationData(null);
    setChatMessages([]);
  }, [sendMessage]);
  
  // Update visualization data
  const updateVisualization = useCallback((data: VisualizationData) => {
    // Update local state
    setVisualizationData(data);
    
    // Send update to server if in a room
    if (room) {
      sendMessage({
        type: 'update',
        visualizationData: data
      });
    }
  }, [room, sendMessage]);
  
  // Send a chat message
  const sendChatMessage = useCallback((message: string) => {
    if (!room) return;
    
    sendMessage({
      type: 'chat',
      message
    });
    
    // Add to local chat
    setChatMessages(prev => [
      ...prev,
      {
        sender: {
          id: clientIdRef.current,
          username: 'You'
        },
        message,
        timestamp: new Date().toISOString()
      }
    ]);
  }, [room, sendMessage]);
  
  // Generate a shareable room link
  const shareRoomLink = useCallback(() => {
    if (!room) return '';
    
    const url = new URL(window.location.href);
    url.searchParams.set('room', room.roomId);
    return url.toString();
  }, [room]);
  
  // Initialize WebSocket on component mount
  useEffect(() => {
    initializeWebSocket();
    
    // Check for room ID in URL
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get('room');
    
    // If room ID is present in URL, prompt to join room
    if (roomId) {
      // We'll handle this in the component that uses this hook
      console.log('Room ID found in URL:', roomId);
    }
    
    // Clean up on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [initializeWebSocket]);
  
  // Determine if the current user is the owner
  const isOwner = room ? room.owner === clientIdRef.current : false;
  
  return {
    isConnected,
    isOwner,
    clientId: clientIdRef.current,
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