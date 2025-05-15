import { users, transcriptions, type User, type InsertUser, type Transcription, type InsertTranscription } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Add transcription methods
  getTranscription(id: number): Promise<Transcription | undefined>;
  getTranscriptionsByUserId(userId: number): Promise<Transcription[]>;
  createTranscription(transcription: InsertTranscription): Promise<Transcription>;
}

export class DatabaseStorage implements IStorage {
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
}

export const storage = new DatabaseStorage();
