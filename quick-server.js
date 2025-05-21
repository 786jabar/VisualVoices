// Quick-start server
import express from 'express';
import http from 'http';

const app = express();
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.send('OK');
});

// Basic API endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running', timestamp: new Date() });
});

// Static home page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Voice to Landscape - Quick Start</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #333; }
          .info { background: #f0f0f0; padding: 15px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <h1>Voice to Landscape</h1>
        <div class="info">
          <p><strong>Quick Start Server</strong> is running!</p>
          <p>This is a temporary server to help verify that port 5000 is working properly.</p>
          <p>API Status: <a href="/api/health">Check API health</a></p>
          <p>When you're ready to continue working with your full application, return to the assistant.</p>
        </div>
      </body>
    </html>
  `);
});

// Start the server
const port = 5000;
const server = http.createServer(app);

server.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});