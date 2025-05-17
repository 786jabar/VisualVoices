import { useRef, useState, useEffect } from 'react';
import p5 from '@/hooks/p5Types';

interface VisualizationOptions {
  sentiment: 'Negative' | 'Neutral' | 'Positive';
  sentimentScore: number;
  text: string;
  motion: boolean;
  colorIntensity: boolean;
}

interface SimpleVisualizationHook {
  canvasRef: React.RefObject<HTMLDivElement>;
  p5Instance: p5 | null;
  saveCanvas: () => Promise<void>;
}

/**
 * A hook that creates a simpler, non-3D visualization using p5.js
 * 
 * This version uses simple 2D shapes and animations instead of complex 3D elements
 * to improve performance and stability
 */
export function useSimpleVisualization(options: VisualizationOptions): SimpleVisualizationHook {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [p5Instance, setP5Instance] = useState<p5 | null>(null);
  const optionsRef = useRef(options);

  // Update the ref when options change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Create and destroy p5 instance
  useEffect(() => {
    if (!canvasRef.current) return;

    // Create new p5 instance
    const sketch = (p: p5) => {
      // Particles for visual elements - much simpler than 3D version
      let particles: Array<{
        x: number;
        y: number;
        size: number;
        color: p5.Color;
        speedX: number;
        speedY: number;
        alpha: number;
        shape: 'circle' | 'square' | 'triangle';
      }> = [];
      
      // Background gradient colors
      let bgColor1: p5.Color;
      let bgColor2: p5.Color;
      
      // Current sentiment and text tracked for changes
      let currentSentiment: string = '';
      let currentText: string = '';
      
      // Setup function - runs once at the start
      p.setup = () => {
        console.log('Simple visualization p5 setup');
        
        // Create canvas to fill the container
        const canvasParent = canvasRef.current;
        if (!canvasParent) return;
        
        // Get container dimensions
        const w = canvasParent.clientWidth;
        const h = canvasParent.clientHeight;
        
        const canvas = p.createCanvas(w, h);
        canvas.parent(canvasParent);
        
        // Set colors based on initial sentiment
        updateColors();
        
        // Initialize particles
        initializeParticles();
        
        // Reduce animation complexity and framerate to improve performance
        p.frameRate(30);
      };
      
      // Initialize particles based on sentiment and text
      const initializeParticles = () => {
        // Clear existing particles
        particles = [];
        
        // Get sentiment and text from options
        const { sentiment, sentimentScore, text } = optionsRef.current;
        
        // Update tracking variables
        currentSentiment = sentiment;
        currentText = text;
        
        // Calculate particle count based on text length, but with a lower limit
        // This is much less intensive than the 3D version
        const particleCount = Math.min(Math.max(50, text.length / 2), 150);
        
        // Create particles
        for (let i = 0; i < particleCount; i++) {
          const x = p.random(p.width);
          const y = p.random(p.height);
          const size = p.random(3, 12);
          
          // Get color based on sentiment
          let particleColor;
          if (sentiment === 'Positive') {
            particleColor = p.color(p.random(50, 150), p.random(150, 255), p.random(50, 150));
          } else if (sentiment === 'Negative') {
            particleColor = p.color(p.random(150, 255), p.random(50, 150), p.random(50, 150));
          } else {
            particleColor = p.color(p.random(150, 200), p.random(150, 200), p.random(150, 255));
          }
          
          // Set alpha based on sentiment intensity
          const alpha = p.map(Math.abs(sentimentScore), 0, 1, 100, 200);
          
          // Assign random shape
          const shapes = ['circle', 'square', 'triangle'] as const;
          const shape = shapes[Math.floor(p.random(shapes.length))];
          
          // Create particle with simplified properties
          particles.push({
            x,
            y,
            size,
            color: particleColor,
            speedX: p.random(-1, 1) * (optionsRef.current.motion ? 1 : 0.3),
            speedY: p.random(-1, 1) * (optionsRef.current.motion ? 1 : 0.3),
            alpha,
            shape,
          });
        }
      };
      
      // Update colors based on sentiment
      const updateColors = () => {
        const { sentiment, sentimentScore, colorIntensity } = optionsRef.current;
        
        // Calculate intensity factor based on settings
        const intensityFactor = colorIntensity ? 1 : 0.7;
        
        // Set background colors based on sentiment
        if (sentiment === 'Positive') {
          // Cheerful, positive gradient (blues, greens, light purples)
          bgColor1 = p.color(
            100 + 50 * intensityFactor, 
            150 + 50 * intensityFactor, 
            200 + 30 * intensityFactor
          );
          bgColor2 = p.color(
            50 + 30 * intensityFactor, 
            150 + 70 * intensityFactor, 
            100 + 50 * intensityFactor
          );
        } else if (sentiment === 'Negative') {
          // Darker, more intense gradient for negative sentiment
          bgColor1 = p.color(
            120 + 50 * intensityFactor, 
            50 + 20 * intensityFactor, 
            100 + 20 * intensityFactor
          );
          bgColor2 = p.color(
            150 + 40 * intensityFactor, 
            70 + 20 * intensityFactor, 
            70 + 20 * intensityFactor
          );
        } else {
          // Neutral, calmer gradient
          bgColor1 = p.color(
            100 + 30 * intensityFactor, 
            100 + 30 * intensityFactor, 
            150 + 40 * intensityFactor
          );
          bgColor2 = p.color(
            130 + 20 * intensityFactor, 
            130 + 20 * intensityFactor, 
            150 + 20 * intensityFactor
          );
        }
      };
      
      // Draw function - runs every frame
      p.draw = () => {
        // Check if sentiment or text has changed
        if (currentSentiment !== optionsRef.current.sentiment || 
            currentText !== optionsRef.current.text) {
          // Update colors and particles
          updateColors();
          initializeParticles();
        }
        
        // Draw background gradient
        drawBackground();
        
        // Draw foreground landscape elements (simplified)
        drawForeground();
        
        // Update and draw particles
        updateParticles();
      };
      
      // Draw background gradient
      const drawBackground = () => {
        // Create gradient background
        for (let y = 0; y < p.height; y++) {
          // Calculate interpolation factor
          const inter = p.map(y, 0, p.height, 0, 1);
          
          // Interpolate between the two colors
          const c = p.lerpColor(bgColor1, bgColor2, inter);
          
          // Draw a line of the gradient
          p.stroke(c);
          p.line(0, y, p.width, y);
        }
        
        // Reset stroke
        p.noStroke();
      };
      
      // Draw simplified foreground landscape
      const drawForeground = () => {
        const { sentiment } = optionsRef.current;
        
        p.noStroke();
        
        if (sentiment === 'Positive') {
          // Draw simplified mountains for positive sentiment
          drawSimpleMountains(0.6, p.color(30, 120, 80, 180));
        } else if (sentiment === 'Negative') {
          // Draw jagged mountains for negative sentiment
          drawJaggedMountains(0.7, p.color(80, 30, 60, 180));
        } else {
          // Draw gentler hills for neutral sentiment
          drawSimpleMountains(0.4, p.color(60, 70, 100, 150));
        }
      };
      
      // Draw simplified mountains
      const drawSimpleMountains = (heightFactor: number, mountainColor: p5.Color) => {
        p.fill(mountainColor);
        p.beginShape();
        
        // Start at bottom left
        p.vertex(0, p.height);
        
        // Create a mountain range with smoother curves
        const segments = 10;
        const segmentWidth = p.width / segments;
        
        for (let i = 0; i <= segments; i++) {
          const x = i * segmentWidth;
          const baseHeight = p.height * (1 - heightFactor);
          
          // Use sin function for smoother mountains
          const mountainHeight = baseHeight + 
            p.sin(i / segments * p.PI) * p.height * heightFactor * 0.8 + 
            p.noise(i * 0.2) * p.height * 0.1;
          
          p.vertex(x, mountainHeight);
        }
        
        // End at bottom right
        p.vertex(p.width, p.height);
        p.endShape(p.CLOSE);
      };
      
      // Draw jagged mountains for negative sentiment
      const drawJaggedMountains = (heightFactor: number, mountainColor: p5.Color) => {
        p.fill(mountainColor);
        p.beginShape();
        
        // Start at bottom left
        p.vertex(0, p.height);
        
        // Create a jagged mountain range
        const segments = 20; // More segments for more jaggedness
        const segmentWidth = p.width / segments;
        
        for (let i = 0; i <= segments; i++) {
          const x = i * segmentWidth;
          const baseHeight = p.height * (1 - heightFactor);
          
          // More random, jagged mountains
          const mountainHeight = baseHeight + 
            p.random(p.height * heightFactor * 0.5, p.height * heightFactor) * 
            p.noise(i * 0.5);
          
          p.vertex(x, mountainHeight);
        }
        
        // End at bottom right
        p.vertex(p.width, p.height);
        p.endShape(p.CLOSE);
      };
      
      // Update and draw all particles
      const updateParticles = () => {
        const { motion } = optionsRef.current;
        
        particles.forEach((particle) => {
          // Only apply motion if it's enabled
          if (motion) {
            // Update position
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Wrap around edges
            if (particle.x < 0) particle.x = p.width;
            if (particle.x > p.width) particle.x = 0;
            if (particle.y < 0) particle.y = p.height;
            if (particle.y > p.height) particle.y = 0;
          }
          
          // Draw particle based on shape
          p.fill(particle.color, particle.alpha);
          p.noStroke();
          
          if (particle.shape === 'circle') {
            p.ellipse(particle.x, particle.y, particle.size);
          } else if (particle.shape === 'square') {
            p.rect(particle.x - particle.size/2, particle.y - particle.size/2, 
                   particle.size, particle.size);
          } else if (particle.shape === 'triangle') {
            p.triangle(
              particle.x, particle.y - particle.size/2,
              particle.x - particle.size/2, particle.y + particle.size/2,
              particle.x + particle.size/2, particle.y + particle.size/2
            );
          }
        });
      };
      
      // Window resize handler
      p.windowResized = () => {
        if (!canvasRef.current) return;
        
        const w = canvasRef.current.clientWidth;
        const h = canvasRef.current.clientHeight;
        
        p.resizeCanvas(w, h);
        
        // Re-initialize particles on resize
        initializeParticles();
      };
    };

    // Create new p5 instance
    const newP5 = new p5(sketch);
    setP5Instance(newP5);

    // Cleanup function
    return () => {
      console.log('Removing simple visualization p5 instance');
      newP5.remove();
      setP5Instance(null);
    };
  }, []);

  // Save canvas to image function
  const saveCanvas = async () => {
    if (!p5Instance || !canvasRef.current) {
      console.error('Cannot save canvas: No p5 instance or canvas reference');
      return;
    }

    return new Promise<void>((resolve) => {
      try {
        // Create a temporary canvas to save the image with proper dimensions
        const tempCanvas = document.createElement('canvas');
        const context = tempCanvas.getContext('2d');
        
        if (!context) {
          console.error('Could not get 2D context for temp canvas');
          resolve();
          return;
        }
        
        // Set canvas dimensions
        tempCanvas.width = canvasRef.current!.clientWidth;
        tempCanvas.height = canvasRef.current!.clientHeight;
        
        // Copy the content of the p5 canvas
        const p5Canvas = canvasRef.current!.querySelector('canvas');
        if (!p5Canvas) {
          console.error('Could not find p5 canvas element');
          resolve();
          return;
        }
        
        // Draw the p5 canvas onto the temp canvas
        context.drawImage(p5Canvas, 0, 0);
        
        // Convert canvas to data URL
        const dataUrl = tempCanvas.toDataURL('image/png');
        
        // Use the dataUrl for saving
        localStorage.setItem('lastSavedVisualization', dataUrl);
        console.log('Visualization saved to localStorage');
        
        resolve();
      } catch (error) {
        console.error('Error saving canvas:', error);
        resolve();
      }
    });
  };

  return {
    canvasRef,
    p5Instance,
    saveCanvas,
  };
}