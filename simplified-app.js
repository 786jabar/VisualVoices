// Simplified Express application
import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import WebSocket, { WebSocketServer } from 'ws';

// Setup basic Express server
const app = express();
const server = createServer(app);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Configure routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Service is running' });
});

// Basic sentiment analysis endpoint
app.post('/api/analyze', (req, res) => {
  const { text } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }
  
  // Simple sentiment analysis
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
    sentimentScore: score
  });
});

// Basic home page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Voice to Landscape</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        textarea { width: 100%; height: 100px; margin: 10px 0; }
        button { padding: 10px 20px; background: #4CAF50; color: white; border: none; cursor: pointer; }
        #result { margin-top: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 4px; }
        .canvas-container { margin-top: 20px; border: 1px solid #ddd; border-radius: 4px; padding: 10px; }
        canvas { width: 100%; height: 400px; background: #f0f0f0; }
      </style>
    </head>
    <body>
      <h1>Voice to Landscape</h1>
      <p>Enter text to visualize a landscape based on sentiment:</p>
      <textarea id="textInput" placeholder="Type your message here..."></textarea>
      <button id="analyzeBtn">Analyze & Visualize</button>
      <div id="result"></div>
      <div class="canvas-container">
        <canvas id="landscapeCanvas" width="800" height="400"></canvas>
      </div>
      
      <script>
        const canvas = document.getElementById('landscapeCanvas');
        const ctx = canvas.getContext('2d');
        
        // Draw initial neutral landscape
        drawLandscape('Neutral', 0);
        
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
            
            resultDiv.innerHTML = \`
              <h3>Analysis Results:</h3>
              <p><strong>Sentiment:</strong> \${data.sentiment}</p>
              <p><strong>Score:</strong> \${data.sentimentScore}</p>
            \`;
            
            // Draw landscape based on sentiment
            drawLandscape(data.sentiment, data.sentimentScore);
          } catch (error) {
            resultDiv.innerHTML = \`<p>Error: \${error.message}</p>\`;
          }
        });
        
        function drawLandscape(sentiment, score) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Set landscape colors based on sentiment
          let skyColor, groundColor, featureColor;
          
          if (sentiment === 'Positive') {
            skyColor = \`rgb(100, 180, \${200 + score * 10})\`;
            groundColor = \`rgb(60, \${150 + score * 10}, 60)\`;
            featureColor = \`rgb(240, \${200 + score * 10}, 100)\`;
          } else if (sentiment === 'Negative') {
            skyColor = \`rgb(\${150 - score * 10}, 150, 220)\`;
            groundColor = \`rgb(100, \${100 + score * 10}, 100)\`;
            featureColor = \`rgb(180, \${100 + score * 5}, 80)\`;
          } else {
            skyColor = 'rgb(135, 206, 235)';
            groundColor = 'rgb(120, 160, 120)';
            featureColor = 'rgb(220, 180, 100)';
          }
          
          // Draw sky
          ctx.fillStyle = skyColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height/2);
          
          // Draw sun or moon
          ctx.fillStyle = featureColor;
          ctx.beginPath();
          ctx.arc(canvas.width - 100, 100, 40, 0, Math.PI * 2);
          ctx.fill();
          
          // Draw ground
          ctx.fillStyle = groundColor;
          ctx.fillRect(0, canvas.height/2, canvas.width, canvas.height/2);
          
          // Draw mountains or hills
          ctx.fillStyle = 'rgba(80, 80, 80, 0.6)';
          ctx.beginPath();
          ctx.moveTo(0, canvas.height/2);
          
          // Create random peaks for the mountains
          const peaks = Math.abs(Math.floor(score)) + 3;
          const segmentWidth = canvas.width / peaks;
          
          for (let i = 0; i <= peaks; i++) {
            const x = i * segmentWidth;
            const heightVariation = sentiment === 'Positive' ? 
              Math.random() * 50 + 50 : 
              Math.random() * 100 + 100;
            const y = canvas.height/2 - heightVariation;
            ctx.lineTo(x, y);
          }
          
          ctx.lineTo(canvas.width, canvas.height/2);
          ctx.closePath();
          ctx.fill();
          
          // Add trees or features based on sentiment
          if (sentiment === 'Positive') {
            drawTrees(5 + Math.floor(score), 'bright');
          } else if (sentiment === 'Negative') {
            drawTrees(3 - Math.floor(score), 'dark');
          } else {
            drawTrees(4, 'neutral');
          }
        }
        
        function drawTrees(count, style) {
          for (let i = 0; i < count; i++) {
            const x = 100 + Math.random() * (canvas.width - 200);
            const y = canvas.height/2 + 20 + Math.random() * 50;
            const height = 30 + Math.random() * 50;
            
            // Tree trunk
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(x - 5, y, 10, height);
            
            // Tree leaves
            if (style === 'bright') {
              ctx.fillStyle = '#00AA44';
            } else if (style === 'dark') {
              ctx.fillStyle = '#005522';
            } else {
              ctx.fillStyle = '#008833';
            }
            
            ctx.beginPath();
            ctx.moveTo(x - 30, y);
            ctx.lineTo(x, y - 50);
            ctx.lineTo(x + 30, y);
            ctx.closePath();
            ctx.fill();
            
            ctx.beginPath();
            ctx.moveTo(x - 25, y - 20);
            ctx.lineTo(x, y - 60);
            ctx.lineTo(x + 25, y - 20);
            ctx.closePath();
            ctx.fill();
          }
        }
      </script>
    </body>
    </html>
  `);
});

// WebSocket event handlers
wss.on('connection', (ws) => {
  console.log('Client connected');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Received message:', data);
      
      // Echo the message back to the client
      ws.send(JSON.stringify({
        type: 'ECHO',
        data
      }));
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});