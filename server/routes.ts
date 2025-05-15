import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from "axios";
import { z } from "zod";
import { GenerateSummaryRequest, GenerateSummaryResponse } from "@shared/schema";

// Validate request body schema for summary generation
const summaryRequestSchema = z.object({
  transcription: z.string().min(1),
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

  // Health check endpoint
  app.get("/api/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "ok" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
