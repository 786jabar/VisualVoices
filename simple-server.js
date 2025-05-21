// Simple Express server to test basic functionality
import express from 'express';

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is working!');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Listen on the required port
const port = 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});