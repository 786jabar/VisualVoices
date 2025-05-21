import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
// Increase payload size limits to handle larger image data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Create a simple health check route to ensure the server is ready
app.get('/health', (_req, res) => {
  res.status(200).send('OK');
});

// Error handler middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  console.error("Server error:", err);
  res.status(status).json({ message });
});

// Start the server first to bind to the port quickly
const port = 5000;
const server = createServer(app);
server.listen(port, "0.0.0.0", () => {
  log(`serving on port ${port}`);
  log(`Server is ready to accept connections on port ${port}`);
});

// Register routes separately without waiting (don't use await)
registerRoutes(app).then(updatedServer => {
  // Routes registered successfully
  log("API routes registered successfully");
}).catch(err => {
  console.error("Error registering routes:", err);
});

// Setup Vite after server is already listening
if (app.get("env") === "development") {
  setupVite(app, server).catch(err => {
    console.error("Vite setup error:", err);
  });
} else {
  serveStatic(app);
}
