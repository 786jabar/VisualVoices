// Simple express server that starts up quickly and meets Replit's port detection requirements
const express = require('express');
const app = express();

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.send('OK');
});

// Respond to the root path
app.get('/', (req, res) => {
  res.send('Voice to Landscape app is starting...');
});

// Start the server immediately on port 5000
const server = app.listen(5000, '0.0.0.0', () => {
  console.log('Quick starter server running on port 5000');
  
  // After the port is bound and Replit recognizes it, start the actual application
  setTimeout(() => {
    console.log('Starting main application...');
    require('../node_modules/.bin/tsx')(['server/index.ts']);
  }, 1000);
});

// Keep the server running until the main app takes over
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Starter server shutting down');
  });
});