// Speech.js: Captures live speech, analyzes sentiment, and communicates with visuals

const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const summaryText = document.getElementById('summary-text');

let recognition;
let isRecognizing = false;
let fullTranscript = '';
let sentimentAnalyzer;

// Check if Sentiment library is loaded
if (typeof Sentiment !== 'undefined') {
  sentimentAnalyzer = new Sentiment();
} else {
  console.error('Sentiment library not loaded');
}

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    isRecognizing = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    summaryText.textContent = 'Listening... Speak now!';
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    summaryText.textContent = 'Error: ' + event.error;
  };

  recognition.onresult = (event) => {
    let interimTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        fullTranscript += event.results[i][0].transcript + ' ';
        analyzeAndVisualize(fullTranscript);
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }
    summaryText.textContent = fullTranscript + ' ' + interimTranscript;
  };

  recognition.onend = () => {
    isRecognizing = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    if (fullTranscript.trim()) {
      sendToBackend(fullTranscript.trim());
    }
  };
} else {
  alert('Sorry, your browser does not support Speech Recognition.');
  startBtn.disabled = true;
  stopBtn.disabled = true;
}

startBtn.onclick = () => {
  fullTranscript = '';
  recognition.start();
};

stopBtn.onclick = () => {
  recognition.stop();
};

// Analyze sentiment and update visuals live
function analyzeAndVisualize(text) {
  if (sentimentAnalyzer) {
    const result = sentimentAnalyzer.analyze(text);
    updateSentiment(result.score);
  }
}

// Send full narration to backend for poetic summary
async function sendToBackend(text) {
  summaryText.textContent = 'Generating poetic summary...';
  
  try {
    const response = await fetch('/api/generate-summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ transcription: text })
    });
    
    if (!response.ok) {
      throw new Error('Server error: ' + response.status);
    }
    
    const data = await response.json();
    summaryText.textContent = data.summary;
  } catch (error) {
    console.error('Error generating summary:', error);
    summaryText.textContent = 'Error generating summary. Please try again.';
  }
}