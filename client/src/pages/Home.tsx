import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { generatePoeticSummary } from '@/lib/queryClient';
import { analyzeSentiment } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Mic, StopCircle, Camera } from 'lucide-react';

export default function Home() {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [sentimentScore, setSentimentScore] = useState(0);
  const [poeticSummary, setPoeticSummary] = useState<string | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const p5InstanceRef = useRef<any>(null);

  // Initialize p5 sketch and canvas
  useEffect(() => {
    if (!canvasContainerRef.current) return;
    
    const sketch = (p: any) => {
      p.setup = () => {
        const container = canvasContainerRef.current;
        if (!container) return;
        
        p.createCanvas(container.offsetWidth, container.offsetHeight);
        p.noLoop();
        drawLandscape(p, 0);
      };
      
      p.windowResized = () => {
        const container = canvasContainerRef.current;
        if (!container) return;
        
        p.resizeCanvas(container.offsetWidth, container.offsetHeight);
        p.redraw();
      };
      
      p.draw = () => {
        drawLandscape(p, sentimentScore);
      };
    };
    
    // Initialize p5
    try {
      // Check if p5 is available globally
      if (typeof window !== 'undefined' && (window as any).p5) {
        p5InstanceRef.current = new (window as any).p5(sketch, canvasContainerRef.current);
      } else {
        // Try importing p5 dynamically
        import('p5').then(p5Module => {
          const p5 = p5Module.default;
          p5InstanceRef.current = new p5(sketch, canvasContainerRef.current);
        }).catch(err => {
          console.error('Failed to load p5:', err);
        });
      }
    } catch (err) {
      console.error('Error initializing p5:', err);
    }
    
    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
      }
    };
  }, []);
  
  // Update visualization when sentiment changes
  useEffect(() => {
    if (p5InstanceRef.current) {
      p5InstanceRef.current.redraw();
    }
  }, [sentimentScore]);
  
  // Speech recognition initialization
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        title: 'Browser Not Supported',
        description: 'Your browser does not support speech recognition. Please try Chrome, Edge, or Safari.',
        variant: 'destructive'
      });
      return;
    }
  }, [toast]);
  
  // Mutation for generating poetic summary
  const summaryMutation = useMutation({
    mutationFn: (text: string) => generatePoeticSummary(text),
    onSuccess: (data) => {
      setPoeticSummary(data);
    },
    onError: (error) => {
      toast({
        title: 'Error Generating Summary',
        description: error instanceof Error ? error.message : 'Failed to generate poetic summary',
        variant: 'destructive'
      });
    }
  });

  // Start speech recognition
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    
    try {
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
        setPoeticSummary(null);
      };
      
      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        const fullText = finalTranscript + interimTranscript;
        setTranscript(fullText);
        
        // Analyze sentiment
        const score = analyzeSentiment(fullText);
        setSentimentScore(score);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: 'Speech Recognition Error',
          description: event.error,
          variant: 'destructive'
        });
      };
      
      recognition.onend = () => {
        // If still listening, restart recognition
        if (isListening) {
          recognition.start();
        }
      };
      
      recognition.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setIsListening(false);
    }
  };
  
  // Stop speech recognition
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      
      // Generate summary
      if (transcript.trim()) {
        summaryMutation.mutate(transcript);
      }
    }
  };
  
  // Save canvas as image
  const saveImage = () => {
    if (!p5InstanceRef.current) {
      toast({
        title: 'Error',
        description: 'Canvas not available',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      p5InstanceRef.current.saveCanvas('vocal-earth-landscape', 'png');
      toast({
        title: 'Image Saved',
        description: 'Your landscape has been saved to your device.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save image',
        variant: 'destructive'
      });
    }
  };
  
  // Draw landscape based on sentiment
  function drawLandscape(p: any, score: number) {
    if (score > 0.2) {
      // Positive sentiment - blue sky with rolling hills
      p.background(70, 130, 180);
      drawPositiveLandscape(p);
    } else if (score < -0.2) {
      // Negative sentiment - dark red/purple sky with jagged mountains
      p.background(40, 20, 30);
      drawNegativeLandscape(p);
    } else {
      // Neutral sentiment - purple-gray with foggy hills
      p.background(90, 90, 110);
      drawNeutralLandscape(p);
    }
  }
  
  // Draw positive landscape
  function drawPositiveLandscape(p: any) {
    // Rolling green hills
    p.fill(150, 230, 150);
    p.noStroke();
    for (let x = 0; x < p.width; x += 50) {
      p.ellipse(x, p.height - 60 + p.sin(x * 0.05) * 10, 100, 40);
    }
    
    // Sparkles
    for (let i = 0; i < 20; i++) {
      let x = p.random(p.width);
      let y = p.random(p.height - 100, p.height - 50);
      p.fill(255, 255, 180, p.random(100, 200));
      p.ellipse(x, y, 5, 5);
    }
  }
  
  // Draw negative landscape
  function drawNegativeLandscape(p: any) {
    // Jagged mountains
    p.fill(60, 20, 20);
    p.stroke(150, 0, 0);
    p.strokeWeight(3);
    p.beginShape();
    p.vertex(0, p.height);
    for (let x = 0; x <= p.width; x += 40) {
      p.vertex(x, p.height - p.random(50, 150));
    }
    p.vertex(p.width, p.height);
    p.endShape(p.CLOSE);
    
    // Lightning flash
    if (Math.random() > 0.9) {
      p.stroke(255, 255, 200, 200);
      p.strokeWeight(5);
      p.line(p.random(p.width), 0, p.random(p.width), p.height / 2);
    }
  }
  
  // Draw neutral landscape
  function drawNeutralLandscape(p: any) {
    // Foggy lake
    p.fill(60, 60, 80, 180);
    p.noStroke();
    p.rect(0, p.height - 100, p.width, 100);
    
    // Smooth hills
    p.fill(80, 80, 100);
    for (let x = 0; x < p.width; x += 60) {
      p.ellipse(x, p.height - 120, 120, 40);
    }
    
    // Fog effect
    p.fill(120, 120, 130, 50);
    for (let i = 0; i < 10; i++) {
      p.ellipse(p.random(p.width), p.random(p.height - 130, p.height - 80), 80, 40);
    }
  }
  
  return (
    <div className="bg-gradient-to-br from-blue-900 to-indigo-800 min-h-screen text-white p-4 flex flex-col items-center">
      <header className="w-full max-w-4xl bg-opacity-70 bg-black bg-opacity-30 rounded-lg p-6 mb-6 text-center">
        <h1 className="text-4xl font-bold mb-2">Vocal Earth</h1>
        <p className="text-blue-200 italic">Speak your world into existence.</p>
      </header>
      
      <main className="w-full max-w-4xl flex flex-col items-center space-y-6">
        <div className="flex space-x-4">
          <Button 
            disabled={isListening}
            onClick={startListening}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Mic className="mr-2 h-4 w-4" />
            Start Speaking
          </Button>
          
          <Button 
            disabled={!isListening}
            onClick={stopListening}
            className="bg-red-600 hover:bg-red-700"
          >
            <StopCircle className="mr-2 h-4 w-4" />
            End Session
          </Button>
          
          <Button 
            onClick={saveImage}
            className="bg-green-600 hover:bg-green-700"
          >
            <Camera className="mr-2 h-4 w-4" />
            Save Image
          </Button>
        </div>
        
        <div 
          ref={canvasContainerRef}
          className="w-full h-96 border-2 border-blue-400 rounded-lg bg-indigo-900 shadow-lg"
        ></div>
        
        <div className="w-full bg-black bg-opacity-50 rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">
            {isListening ? 'Listening...' : transcript ? 'Your words:' : 'Ready to listen'}
          </h2>
          <div className="min-h-16 rounded bg-black bg-opacity-30 p-3 mb-4 text-sm">
            {transcript || (isListening ? 'Speak now...' : 'Your spoken words will appear here')}
          </div>
          
          {poeticSummary && (
            <>
              <h2 className="text-xl font-semibold mb-2">Poetic Summary</h2>
              <div className="min-h-16 rounded bg-indigo-800 bg-opacity-50 p-3 border border-blue-500 text-sm italic">
                {poeticSummary}
              </div>
            </>
          )}
          
          {summaryMutation.isPending && (
            <div className="text-center p-4">
              <div className="animate-spin inline-block w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full"></div>
              <p className="mt-2">Generating poetic summary...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Add TypeScript declarations for the Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
