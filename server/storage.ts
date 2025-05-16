import { 
  users, 
  transcriptions, 
  visualizations, 
  type User, 
  type InsertUser, 
  type Transcription, 
  type InsertTranscription,
  type Visualization,
  type InsertVisualization 
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, isNull } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Transcription methods
  getTranscription(id: number): Promise<Transcription | undefined>;
  getTranscriptionsByUserId(userId: number): Promise<Transcription[]>;
  createTranscription(transcription: InsertTranscription): Promise<Transcription>;
  
  // Visualization Gallery methods
  getVisualization(id: number): Promise<Visualization | undefined>;
  getVisualizationsByUserId(userId: number): Promise<Visualization[]>;
  getPublicVisualizations(): Promise<Visualization[]>;
  createVisualization(visualization: InsertVisualization): Promise<Visualization>;
  updateVisualization(id: number, visualization: Partial<InsertVisualization>): Promise<Visualization | undefined>;
  deleteVisualization(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Transcription methods
  async getTranscription(id: number): Promise<Transcription | undefined> {
    const [transcription] = await db.select().from(transcriptions).where(eq(transcriptions.id, id));
    return transcription || undefined;
  }
  
  async getTranscriptionsByUserId(userId: number): Promise<Transcription[]> {
    return await db.select().from(transcriptions).where(eq(transcriptions.userId, userId));
  }
  
  async createTranscription(insertTranscription: InsertTranscription): Promise<Transcription> {
    const [transcription] = await db
      .insert(transcriptions)
      .values(insertTranscription)
      .returning();
    return transcription;
  }
  
  // Visualization Gallery methods
  async getVisualization(id: number): Promise<Visualization | undefined> {
    const [visualization] = await db.select().from(visualizations).where(eq(visualizations.id, id));
    return visualization || undefined;
  }
  
  async getVisualizationsByUserId(userId: number): Promise<Visualization[]> {
    return await db
      .select()
      .from(visualizations)
      .where(eq(visualizations.userId, userId))
      .orderBy(desc(visualizations.createdAt));
  }
  
  async getPublicVisualizations(): Promise<Visualization[]> {
    return await db
      .select()
      .from(visualizations)
      .where(eq(visualizations.isPublic, true))
      .orderBy(desc(visualizations.createdAt))
      .limit(50); // Limit to most recent 50 public visualizations
  }
  
  async createVisualization(insertVisualization: InsertVisualization): Promise<Visualization> {
    const [visualization] = await db
      .insert(visualizations)
      .values({
        ...insertVisualization,
        // Default title to date if not provided
        title: insertVisualization.title || `VocalEarth Creation - ${new Date().toLocaleDateString()}`,
      })
      .returning();
    return visualization;
  }
  
  async updateVisualization(id: number, visualization: Partial<InsertVisualization>): Promise<Visualization | undefined> {
    const [updatedVisualization] = await db
      .update(visualizations)
      .set(visualization)
      .where(eq(visualizations.id, id))
      .returning();
    return updatedVisualization;
  }
  
  async deleteVisualization(id: number): Promise<boolean> {
    const [deletedVisualization] = await db
      .delete(visualizations)
      .where(eq(visualizations.id, id))
      .returning({ id: visualizations.id });
    return !!deletedVisualization;
  }
}

export const storage = new DatabaseStorage();
