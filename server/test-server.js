// A simple test server to verify port binding
import express from 'express';
import http from 'http';

const app = express();
const server = http.createServer(app);

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Test server is running' });
});

const port = 5000;
server.listen(port, '0.0.0.0', () => {
  console.log(`Test server listening on port ${port}`);
});