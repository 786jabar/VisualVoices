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

// Create pool with connection timeout
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000 // 5 second timeout
});

// Test connection and log status
pool.connect()
  .then(client => {
    console.log("Successfully connected to database");
    client.release();
  })
  .catch(err => {
    console.error("Failed to connect to database:", err.message);
  });

export const db = drizzle({ client: pool, schema });