// Minimal server for testing
import express from 'express';
import { createServer } from 'http';

// Basic Express setup
const app = express();
const server = createServer(app);

// JSON body parser
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Basic API endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// Static welcome page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Voice to Landscape</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #333; }
        </style>
      </head>
      <body>
        <h1>Voice to Landscape</h1>
        <p>Server is running! This is a minimal test page.</p>
        <p>Health check: <a href="/health">Check server health</a></p>
        <p>API health: <a href="/api/health">Check API health</a></p>
      </body>
    </html>
  `);
});

// Start the server
const port = 5000;
server.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});