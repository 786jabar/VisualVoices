import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Using a fallback connection.");
  process.env.DATABASE_URL = "postgres://postgres:postgres@localhost:5432/postgres";
}

// Create pool with optimized settings
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 3000, // 3 second timeout
  max: 5, // Reduce max connections
  idleTimeoutMillis: 10000 // Close idle connections after 10 seconds
});

// Function to handle connection
const connectToDatabase = async () => {
  try {
    const client = await pool.connect();
    console.log("Successfully connected to database");
    client.release();
    return true;
  } catch (err: any) {
    console.error("Failed to connect to database:", err.message || 'Unknown error');
    return false;
  }
};

// Connect to database but don't wait for it
connectToDatabase();

export const db = drizzle({ client: pool, schema });