// Basic Express application with essential functionality
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from client/public
const staticPath = path.join(__dirname, 'client', 'public');
if (fs.existsSync(staticPath)) {
  app.use(express.static(staticPath));
}

// Basic API endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Service is running' });
});

// Add a basic sentiment analysis endpoint
app.post('/api/analyze', (req, res) => {
  const { text } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }
  
  // Simple sentiment analysis logic
  const words = text.toLowerCase().split(/\s+/);
  const positiveWords = ['happy', 'good', 'great', 'excellent', 'love', 'joy'];
  const negativeWords = ['sad', 'bad', 'awful', 'terrible', 'hate', 'angry'];
  
  let score = 0;
  words.forEach(word => {
    if (positiveWords.includes(word)) score += 1;
    if (negativeWords.includes(word)) score -= 1;
  });
  
  let sentiment = 'Neutral';
  if (score > 0) sentiment = 'Positive';
  if (score < 0) sentiment = 'Negative';
  
  res.json({
    text,
    sentiment,
    score
  });
});

// Display a simple HTML page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Sentiment Visualizer</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        textarea { width: 100%; height: 100px; margin: 10px 0; }
        button { padding: 10px 20px; background: #4CAF50; color: white; border: none; cursor: pointer; }
        #result { margin-top: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 4px; }
        .positive { background-color: rgba(76, 175, 80, 0.2); }
        .negative { background-color: rgba(244, 67, 54, 0.2); }
        .neutral { background-color: rgba(156, 156, 156, 0.2); }
      </style>
    </head>
    <body>
      <h1>Sentiment Visualizer</h1>
      <p>Enter text to analyze its sentiment:</p>
      <textarea id="textInput" placeholder="Type your message here..."></textarea>
      <button id="analyzeBtn">Analyze Sentiment</button>
      <div id="result"></div>
      
      <script>
        document.getElementById('analyzeBtn').addEventListener('click', async () => {
          const text = document.getElementById('textInput').value;
          const resultDiv = document.getElementById('result');
          
          if (!text) {
            resultDiv.innerHTML = '<p>Please enter some text to analyze</p>';
            return;
          }
          
          try {
            const response = await fetch('/api/analyze', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ text })
            });
            
            const data = await response.json();
            
            resultDiv.className = data.sentiment.toLowerCase();
            resultDiv.innerHTML = \`
              <h3>Analysis Results:</h3>
              <p><strong>Sentiment:</strong> \${data.sentiment}</p>
              <p><strong>Score:</strong> \${data.score}</p>
            \`;
          } catch (error) {
            resultDiv.innerHTML = \`<p>Error: \${error.message}</p>\`;
          }
        });
      </script>
    </body>
    </html>
  `);
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});