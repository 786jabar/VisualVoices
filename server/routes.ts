import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from 'ws';
import { storage } from "./storage";
import axios from "axios";
import { z } from "zod";
import { 
  GenerateSummaryRequest, 
  GenerateSummaryResponse,
  SaveVisualizationRequest,
  GalleryItemResponse,
  InsertVisualization 
} from "@shared/schema";

// Validate request body schema for summary generation
const summaryRequestSchema = z.object({
  transcription: z.string().min(1),
});

// Validate request body schema for saving visualizations
const saveVisualizationSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  transcriptionText: z.string().min(1),
  sentiment: z.string(),
  sentimentScore: z.number(),
  poeticSummary: z.string().optional(),
  imageData: z.string().min(1), // Base64 encoded image data
  visualSettings: z.object({
    colorIntensity: z.boolean().optional(),
    motion: z.boolean().optional()
  }).optional(),
  isPublic: z.boolean().optional()
});

export async function registerRoutes(app: Express): Promise<Server> {
  // DeepSeek API endpoint for generating poetic summaries
  app.post("/api/generate-summary", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const result = summaryRequestSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid request body", errors: result.error.errors });
      }

      const { transcription } = req.body as GenerateSummaryRequest;

      // Ensure the DeepSeek API key is set
      const apiKey = process.env.DEEPSEEK_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: "DeepSeek API key is not configured" });
      }

      // Call DeepSeek API to generate a poetic summary
      const response = await axios.post(
        "https://api.deepseek.com/v1/chat/completions",
        {
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: "You are a poetic assistant that creates beautiful, vivid descriptions of surreal landscapes based on user input. Keep your responses under 150 words and focus on creating evocative, imaginative imagery."
            },
            {
              role: "user",
              content: `Create a poetic summary describing a surreal landscape inspired by the following words: "${transcription}"`
            }
          ],
          max_tokens: 300
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          }
        }
      );

      // Extract the poetic summary from the response
      const summary = response.data.choices[0]?.message?.content || 
        "In a realm of digital echoes, your words have created a landscape of possibility, shimmering with potential and dancing with ethereal light.";

      // Return the generated summary
      return res.status(200).json({ summary } as GenerateSummaryResponse);
    } catch (error) {
      console.error("Error generating summary:", error);
      return res.status(500).json({ 
        message: "Failed to generate summary", 
        details: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  // Enhanced endpoint for generating narration for the AI assistant with multi-language support
  app.post("/api/generate-narration", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const result = summaryRequestSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid request body", errors: result.error.errors });
      }

      // Extract transcription and language from request
      const { transcription, language = "english" } = req.body as GenerateSummaryRequest & { language?: string };

      // Ensure the DeepSeek API key is set
      const apiKey = process.env.DEEPSEEK_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: "DeepSeek API key is not configured" });
      }

      // Detect language if not specified to ensure proper narration
      const detectedLanguage = language || "english";
      
      // Prepare system prompt with language support
      const systemPrompt = `You are an AI landscape guide with a friendly, engaging female voice. Your narration must consist of complete, grammatically correct sentences with proper punctuation in ${detectedLanguage}. 
      
Each sentence must be complete with subject and verb - never use fragments. Ensure the narration flows naturally and sounds engaging when read aloud. Write 6-8 well-formed sentences (120-180 words total).

Always start with a welcoming opening and end with a clear concluding sentence. The narration should sound like a professional female tour guide explaining the landscape to visitors.`;

      // Prepare user prompt with emphasis on complete sentences
      const userPrompt = `Create a spoken narration in ${detectedLanguage} for a surreal landscape guide explaining a world inspired by these words: "${transcription}". 

Follow these STRICT requirements:
1. Every sentence MUST be complete with subject and verb
2. Use 6-8 full, grammatically correct sentences 
3. The narration should feel like a cohesive tour given by a female guide
4. Begin with a welcome and end with a strong conclusion
5. NEVER use sentence fragments or incomplete thoughts
6. Include descriptive, sensory details about the landscape

This narration will be read aloud by a text-to-speech system, so ensure it flows naturally when spoken.`;

      // Call DeepSeek API with enhanced prompts for better speech quality
      const response = await axios.post(
        "https://api.deepseek.com/v1/chat/completions",
        {
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: userPrompt
            }
          ],
          max_tokens: 400,
          temperature: 0.7 // Slightly higher creativity while maintaining coherence
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          }
        }
      );

      // Default fallback narrations in multiple languages
      const fallbackNarrations: Record<string, string> = {
        english: "Welcome to this surreal landscape created from your words. As you can see, the elements of your speech have manifested into visual forms, creating this unique environment. Feel free to explore and listen to how the world responds to your voice. Each color and shape represents an aspect of your spoken input. The scenery evolves based on the emotions detected in your voice. Take a moment to appreciate this personalized visualization that transforms your thoughts into imagery.",
        spanish: "Bienvenido a este paisaje surrealista creado a partir de tus palabras. Como puedes ver, los elementos de tu discurso se han manifestado en formas visuales, creando este entorno único. Siéntete libre de explorar y escuchar cómo el mundo responde a tu voz. Cada color y forma representa un aspecto de lo que has expresado. El escenario evoluciona según las emociones detectadas en tu voz. Tómate un momento para apreciar esta visualización personalizada que transforma tus pensamientos en imágenes.",
        french: "Bienvenue dans ce paysage surréaliste créé à partir de vos mots. Comme vous pouvez le voir, les éléments de votre discours se sont manifestés sous des formes visuelles, créant cet environnement unique. N'hésitez pas à explorer et à écouter comment le monde répond à votre voix. Chaque couleur et forme représente un aspect de ce que vous avez exprimé. Le paysage évolue en fonction des émotions détectées dans votre voix. Prenez un moment pour apprécier cette visualisation personnalisée qui transforme vos pensées en images.",
        german: "Willkommen in dieser surrealen Landschaft, die aus Ihren Worten erschaffen wurde. Wie Sie sehen können, haben sich die Elemente Ihrer Sprache in visuelle Formen manifestiert und diese einzigartige Umgebung geschaffen. Fühlen Sie sich frei, zu erkunden und zu hören, wie die Welt auf Ihre Stimme reagiert. Jede Farbe und Form repräsentiert einen Aspekt Ihrer Äußerungen. Die Szenerie entwickelt sich basierend auf den in Ihrer Stimme erkannten Emotionen. Nehmen Sie sich einen Moment Zeit, um diese personalisierte Visualisierung zu schätzen, die Ihre Gedanken in Bilder umwandelt.",
        chinese: "欢迎来到这个由你的话语创造的超现实景观。如你所见，你的言语元素已经转化为视觉形式，创造了这个独特的环境。请随意探索并聆听世界如何回应你的声音。每种颜色和形状都代表你所表达的一个方面。场景会根据你声音中检测到的情绪而变化。花点时间欣赏这个将你的思想转化为图像的个性化视觉效果。",
        japanese: "あなたの言葉から作られたこのシュールな風景へようこそ。ご覧のように、あなたのスピーチの要素が視覚的な形となって現れ、この独特な環境を作り出しています。自由に探索し、世界があなたの声にどのように反応するかを聞いてみてください。それぞれの色と形は、あなたが表現したことの一側面を表しています。風景はあなたの声から検出された感情に基づいて進化します。あなたの考えを画像に変換するこのパーソナライズされた視覚化を鑑賞する時間をとってください。"
      };
      
      // Select appropriate fallback based on language
      const fallbackNarration = fallbackNarrations[detectedLanguage.toLowerCase()] || fallbackNarrations.english;

      // Extract the narration from the response with careful error handling
      let narration = "";
      try {
        narration = response.data.choices[0]?.message?.content || "";
      } catch (e) {
        console.error("Error extracting narration from API response:", e);
        narration = "";
      }
      
      // Validate the narration - must not be empty and must be sufficiently long
      if (!narration.trim() || narration.split(/\s+/).length < 20) {
        console.warn("Received invalid or short narration, using fallback");
        narration = fallbackNarration;
      }

      // Ensure narration ends with proper punctuation
      const lastChar = narration.trim().slice(-1);
      if (!['.', '!', '?', '。', '！', '？'].includes(lastChar)) {
        narration = narration.trim() + '.';
      }
      
      // Validate sentence structure and quality
      const sentenceCount = narration.split(/[.!?。！？]+/).filter(s => s.trim().length > 0).length;
      if (sentenceCount < 3) {
        console.warn("Narration has too few sentences, using fallback");
        narration = fallbackNarration;
      }

      console.log(`Generated ${detectedLanguage} narration with ${sentenceCount} sentences`);
      
      // Return the generated narration
      return res.status(200).json({ narration });
    } catch (error) {
      console.error("Error generating narration:", error);
      return res.status(500).json({ 
        message: "Failed to generate narration", 
        details: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // GALLERY ROUTES

  // Save a visualization to the gallery
  app.post("/api/gallery", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const result = saveVisualizationSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid request body", errors: result.error.errors });
      }

      const visualizationData = req.body as SaveVisualizationRequest;
      
      // Use a default userId (1) for now - in a real app you'd use authentication
      const userId = 1;
      
      // Create the visualization in the database
      const newVisualization = await storage.createVisualization({
        userId,
        title: visualizationData.title,
        description: visualizationData.description,
        transcriptionText: visualizationData.transcriptionText,
        sentiment: visualizationData.sentiment,
        sentimentScore: visualizationData.sentimentScore,
        poeticSummary: visualizationData.poeticSummary,
        imageData: visualizationData.imageData,
        visualSettings: visualizationData.visualSettings,
        isPublic: visualizationData.isPublic ?? false
      });

      // Return the created visualization
      return res.status(201).json(newVisualization);
    } catch (error) {
      console.error("Error saving visualization:", error);
      return res.status(500).json({
        message: "Failed to save visualization",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get all visualizations (user's own)
  app.get("/api/gallery", async (req: Request, res: Response) => {
    try {
      // Use a default userId (1) for now - in a real app you'd use authentication
      const userId = 1;
      
      // Get the user's visualizations
      const visualizations = await storage.getVisualizationsByUserId(userId);
      
      // Map to response type excluding large imageData field for list view
      const response = visualizations.map(viz => ({
        id: viz.id,
        title: viz.title,
        description: viz.description,
        sentiment: viz.sentiment,
        poeticSummary: viz.poeticSummary,
        // Include a thumbnail version or just exclude full imageData
        imageData: viz.imageData,
        createdAt: viz.createdAt instanceof Date ? viz.createdAt.toISOString() : viz.createdAt.toString()
      }));
      
      return res.status(200).json(response);
    } catch (error) {
      console.error("Error fetching visualizations:", error);
      return res.status(500).json({
        message: "Failed to fetch visualizations",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get public visualization gallery
  app.get("/api/gallery/public", async (req: Request, res: Response) => {
    try {
      // Get public visualizations
      const visualizations = await storage.getPublicVisualizations();
      
      // Map to response type excluding large imageData field for list view
      const response = visualizations.map(viz => ({
        id: viz.id,
        title: viz.title,
        description: viz.description,
        sentiment: viz.sentiment,
        poeticSummary: viz.poeticSummary,
        // Include a thumbnail version or just exclude full imageData
        imageData: viz.imageData,
        createdAt: viz.createdAt instanceof Date ? viz.createdAt.toISOString() : viz.createdAt.toString()
      }));
      
      return res.status(200).json(response);
    } catch (error) {
      console.error("Error fetching public visualizations:", error);
      return res.status(500).json({
        message: "Failed to fetch public visualizations",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get a single visualization by ID
  app.get("/api/gallery/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid visualization ID" });
      }
      
      // Get the visualization
      const visualization = await storage.getVisualization(id);
      if (!visualization) {
        return res.status(404).json({ message: "Visualization not found" });
      }
      
      // Use a default userId (1) for now - in a real app you'd use authentication
      const userId = 1;
      
      // Check if the user has access to this visualization
      if (visualization.userId !== userId && !visualization.isPublic) {
        return res.status(403).json({ message: "You don't have permission to view this visualization" });
      }
      
      return res.status(200).json(visualization);
    } catch (error) {
      console.error("Error fetching visualization:", error);
      return res.status(500).json({
        message: "Failed to fetch visualization",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Update a visualization
  app.put("/api/gallery/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid visualization ID" });
      }
      
      // Validate request body
      const result = saveVisualizationSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid request body", errors: result.error.errors });
      }
      
      // Get the existing visualization
      const visualization = await storage.getVisualization(id);
      if (!visualization) {
        return res.status(404).json({ message: "Visualization not found" });
      }
      
      // Use a default userId (1) for now - in a real app you'd use authentication
      const userId = 1;
      
      // Check if the user has permission to update this visualization
      if (visualization.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to update this visualization" });
      }
      
      // Update the visualization
      const updateData = req.body as Partial<SaveVisualizationRequest>;
      const updatedVisualization = await storage.updateVisualization(id, updateData);
      
      return res.status(200).json(updatedVisualization);
    } catch (error) {
      console.error("Error updating visualization:", error);
      return res.status(500).json({
        message: "Failed to update visualization",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Delete a visualization
  app.delete("/api/gallery/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid visualization ID" });
      }
      
      // Get the existing visualization
      const visualization = await storage.getVisualization(id);
      if (!visualization) {
        return res.status(404).json({ message: "Visualization not found" });
      }
      
      // Use a default userId (1) for now - in a real app you'd use authentication
      const userId = 1;
      
      // Check if the user has permission to delete this visualization
      if (visualization.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to delete this visualization" });
      }
      
      // Delete the visualization
      const deleted = await storage.deleteVisualization(id);
      if (!deleted) {
        return res.status(500).json({ message: "Failed to delete visualization" });
      }
      
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting visualization:", error);
      return res.status(500).json({
        message: "Failed to delete visualization",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "ok" });
  });
  
  // WebSocket connection status endpoint
  app.get("/api/ws-status", (_req: Request, res: Response) => {
    res.status(200).json({ 
      status: "ok",
      wsEnabled: true,
      activeSessions: connectedClients.size,
      activeRooms: collaborationRooms.size
    });
  });

  const httpServer = createServer(app);
  
  // Create WebSocket server for real-time collaboration
  // Using '/ws' path to avoid conflicts with Vite's HMR WebSocket
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws',
    // Add permissive CORS settings for development
    verifyClient: (info, cb) => {
      cb(true); // Accept all connections during development
    }
  });
  
  // Track connected clients and their rooms
  const connectedClients = new Map<WebSocket, {
    id: string;
    room: string;
    username: string;
  }>();
  
  // Track collaboration rooms
  const collaborationRooms = new Map<string, {
    clients: WebSocket[];
    visualizationData: any;
    owner: string;
  }>();
  
  // Handle WebSocket connections
  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection established');
    
    // Handle messages from clients
    ws.on('message', (message) => {
      try {
        // Ensure proper string conversion
        const messageStr = message instanceof Buffer 
          ? message.toString() 
          : typeof message === 'string' 
            ? message
            : JSON.stringify(message);
            
        const data = JSON.parse(messageStr);
        
        // Handle different message types
        switch (data.type) {
          case 'join':
          case 'join_room':
            handleJoinRoom(ws, data);
            break;
          case 'create':
          case 'create_room':
            handleCreateRoom(ws, data);
            break;
          case 'leave':
          case 'leave_room':
            handleLeaveRoom(ws, data);
            break;
          case 'update':
          case 'visualization_update':
            handleVisualizationUpdate(ws, data);
            break;
          case 'chat':
          case 'chat_message':
            handleChatMessage(ws, data);
            break;
          default:
            console.warn('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
        sendToClient(ws, {
          type: 'error',
          message: 'Invalid message format'
        });
      }
    });
    
    // Handle client disconnection
    ws.on('close', () => {
      console.log('WebSocket connection closed');
      handleClientDisconnect(ws);
    });
    
    // Send initial connection acknowledgment
    sendToClient(ws, {
      type: 'connected',
      message: 'Connected to Vocal Earth collaborative visualization server'
    });
  });
  
  // Helper function to send message to a specific client
  function sendToClient(client: WebSocket, data: any) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  }
  
  // Helper function to broadcast to all clients in a room
  function broadcastToRoom(roomId: string, data: any, excludeClient?: WebSocket) {
    const room = collaborationRooms.get(roomId);
    if (!room) return;
    
    room.clients.forEach(client => {
      if (client !== excludeClient && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }
  
  // Handle client joining a room
  function handleJoinRoom(ws: WebSocket, data: any) {
    const { roomId, username, clientId } = data;
    
    // Check if room exists
    const room = collaborationRooms.get(roomId);
    if (!room) {
      return sendToClient(ws, {
        type: 'error',
        message: 'Room does not exist'
      });
    }
    
    // Add client to room
    room.clients.push(ws);
    
    // Track client details
    connectedClients.set(ws, {
      id: clientId,
      room: roomId,
      username: username || 'Anonymous'
    });
    
    // Notify other clients in the room
    broadcastToRoom(roomId, {
      type: 'user-joined',
      username: username || 'Anonymous',
      clientId: clientId,
      timestamp: new Date().toISOString()
    }, ws);
    
    // Send current visualization data to the new client
    sendToClient(ws, {
      type: 'visualization-data',
      data: room.visualizationData,
      users: room.clients.map(client => {
        const clientInfo = connectedClients.get(client);
        return {
          id: clientInfo?.id,
          username: clientInfo?.username
        };
      }).filter(Boolean),
      owner: room.owner
    });
    
    console.log(`Client ${clientId} (${username}) joined room ${roomId}`);
  }
  
  // Handle client creating a new room
  function handleCreateRoom(ws: WebSocket, data: any) {
    const { visualizationData, username, clientId } = data;
    
    // Generate a unique room ID
    const roomId = Math.random().toString(36).substring(2, 10);
    
    // Create the room
    collaborationRooms.set(roomId, {
      clients: [ws],
      visualizationData,
      owner: clientId
    });
    
    // Track client details
    connectedClients.set(ws, {
      id: clientId,
      room: roomId,
      username: username || 'Anonymous'
    });
    
    // Notify client that room was created
    sendToClient(ws, {
      type: 'room-created',
      roomId,
      owner: clientId
    });
    
    console.log(`Client ${clientId} (${username}) created room ${roomId}`);
  }
  
  // Handle client leaving a room
  function handleLeaveRoom(ws: WebSocket, data: any) {
    const clientInfo = connectedClients.get(ws);
    if (!clientInfo) return;
    
    const { room: roomId } = clientInfo;
    
    // Get the room
    const room = collaborationRooms.get(roomId);
    if (!room) return;
    
    // Remove client from room
    room.clients = room.clients.filter(client => client !== ws);
    
    // Notify other clients in the room
    broadcastToRoom(roomId, {
      type: 'user-left',
      username: clientInfo.username,
      clientId: clientInfo.id,
      timestamp: new Date().toISOString()
    });
    
    // If room is empty, delete it
    if (room.clients.length === 0) {
      collaborationRooms.delete(roomId);
      console.log(`Room ${roomId} deleted (no clients)`);
    }
    // If owner left, assign new owner
    else if (room.owner === clientInfo.id) {
      const newOwner = connectedClients.get(room.clients[0]);
      if (newOwner) {
        room.owner = newOwner.id;
        broadcastToRoom(roomId, {
          type: 'new-owner',
          owner: newOwner.id,
          username: newOwner.username
        });
      }
    }
    
    // Remove client tracking
    connectedClients.delete(ws);
    
    console.log(`Client ${clientInfo.id} (${clientInfo.username}) left room ${roomId}`);
  }
  
  // Handle visualization updates from clients
  function handleVisualizationUpdate(ws: WebSocket, data: any) {
    const clientInfo = connectedClients.get(ws);
    if (!clientInfo) return;
    
    const { room: roomId } = clientInfo;
    const { visualizationData } = data;
    
    // Get the room
    const room = collaborationRooms.get(roomId);
    if (!room) return;
    
    // Update the visualization data
    room.visualizationData = visualizationData;
    
    // Broadcast the update to all clients in the room
    broadcastToRoom(roomId, {
      type: 'visualization-update',
      data: visualizationData,
      sender: {
        id: clientInfo.id,
        username: clientInfo.username
      },
      timestamp: new Date().toISOString()
    }, ws);
  }
  
  // Handle chat messages between clients
  function handleChatMessage(ws: WebSocket, data: any) {
    const clientInfo = connectedClients.get(ws);
    if (!clientInfo) return;
    
    const { room: roomId } = clientInfo;
    const { message } = data;
    
    // Broadcast the message to all clients in the room
    broadcastToRoom(roomId, {
      type: 'chat',
      message,
      sender: {
        id: clientInfo.id,
        username: clientInfo.username
      },
      timestamp: new Date().toISOString()
    });
  }
  
  // Handle client disconnection
  function handleClientDisconnect(ws: WebSocket) {
    const clientInfo = connectedClients.get(ws);
    if (!clientInfo) return;
    
    // Handle as if client left the room
    handleLeaveRoom(ws, {});
  }
  
  return httpServer;
}
