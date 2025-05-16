import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model for authentication (basic implementation)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Vocal Earth specific models
export const transcriptions = pgTable("transcriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  transcriptionText: text("transcription_text").notNull(),
  sentiment: text("sentiment").notNull(),
  poeticSummary: text("poetic_summary"),
  createdAt: text("created_at").notNull(),
});

export const insertTranscriptionSchema = createInsertSchema(transcriptions).pick({
  userId: true,
  transcriptionText: true,
  sentiment: true,
  poeticSummary: true,
  createdAt: true,
});

// Gallery for saved visualizations
export const visualizations = pgTable("visualizations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  transcriptionText: text("transcription_text").notNull(),
  sentiment: text("sentiment").notNull(),
  sentimentScore: integer("sentiment_score"),
  poeticSummary: text("poetic_summary"),
  imageData: text("image_data").notNull(), // Base64 encoded image data
  visualSettings: jsonb("visual_settings"), // Store colorIntensity, motion, etc.
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVisualizationSchema = createInsertSchema(visualizations).pick({
  userId: true,
  title: true,
  description: true,
  transcriptionText: true,
  sentiment: true,
  sentimentScore: true,
  poeticSummary: true,
  imageData: true,
  visualSettings: true,
  isPublic: true,
});

// Definition types to be used in the application
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTranscription = z.infer<typeof insertTranscriptionSchema>;
export type Transcription = typeof transcriptions.$inferSelect;

export type InsertVisualization = z.infer<typeof insertVisualizationSchema>;
export type Visualization = typeof visualizations.$inferSelect;

// Types for API requests and responses
export type GenerateSummaryRequest = {
  transcription: string;
};

export type GenerateSummaryResponse = {
  summary: string;
};

// Gallery related types
export type SaveVisualizationRequest = {
  title: string;
  description?: string;
  transcriptionText: string;
  sentiment: string;
  sentimentScore: number;
  poeticSummary?: string;
  imageData: string;
  visualSettings?: {
    colorIntensity: boolean;
    motion: boolean;
  };
  isPublic?: boolean;
};

export type GalleryItemResponse = {
  id: number;
  title: string;
  description: string | null;
  transcriptionText: string;
  sentiment: string;
  poeticSummary: string | null;
  imageData: string;
  createdAt: string;
};
