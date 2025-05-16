import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
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

  const httpServer = createServer(app);
  return httpServer;
}
