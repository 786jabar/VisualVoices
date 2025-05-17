import { useRef, useState, useEffect } from 'react';

// Define types for visualization
interface VisualizationOptions {
  sentiment: 'Negative' | 'Neutral' | 'Positive';
  sentimentScore: number;
  text: string;
  motion: boolean;
  colorIntensity: boolean;
}

// Canvas particle type
interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  alpha: number;
  shape: 'circle' | 'square' | 'triangle';
}

/**
 * A hook that creates a simple 2D visualization without p5.js
 * This provides better performance and stability than the 3D version
 */
export function useBasicVisualization(options: VisualizationOptions) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const optionsRef = useRef(options);

  // Track if component is mounted
  const isMountedRef = useRef(true);

  // Update options ref when they change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Setup and manage canvas drawing
  useEffect(() => {
    if (!containerRef.current) return;

    // Setup canvas
    const setupCanvas = () => {
      const container = containerRef.current;
      if (!container) return;

      // Create canvas if it doesn't exist
      if (!canvasRef.current) {
        const canvas = document.createElement('canvas');
        canvas.className = 'visualization-canvas w-full h-full block';
        container.appendChild(canvas);
        canvasRef.current = canvas;
      }

      // Set canvas size to match container
      const canvas = canvasRef.current;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;

      // Initialize visualization
      initializeParticles();
      console.log('Basic visualization canvas initialized');
    };

    // Create particles based on current settings
    const initializeParticles = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const { sentiment, sentimentScore, text } = optionsRef.current;
      particlesRef.current = [];

      // Calculate number of particles based on text length
      const particleCount = Math.min(Math.max(50, text.length / 2), 150);

      for (let i = 0; i < particleCount; i++) {
        // Generate random properties
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 8 + 2;
        
        // Set color based on sentiment
        let r, g, b;
        if (sentiment === 'Positive') {
          r = Math.floor(Math.random() * 100 + 50);
          g = Math.floor(Math.random() * 100 + 150);
          b = Math.floor(Math.random() * 100 + 50);
        } else if (sentiment === 'Negative') {
          r = Math.floor(Math.random() * 100 + 150);
          g = Math.floor(Math.random() * 100 + 50);
          b = Math.floor(Math.random() * 100 + 50);
        } else {
          r = Math.floor(Math.random() * 50 + 100);
          g = Math.floor(Math.random() * 50 + 100);
          b = Math.floor(Math.random() * 50 + 150);
        }
        
        // Set alpha based on sentiment intensity
        const alpha = Math.abs(sentimentScore) * 0.5 + 0.5;
        
        // Choose a random shape
        const shapes = ['circle', 'square', 'triangle'] as const;
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        
        // Create particle
        particlesRef.current.push({
          x,
          y,
          size,
          color: `rgba(${r}, ${g}, ${b}, ${alpha})`,
          speedX: (Math.random() - 0.5) * 2,
          speedY: (Math.random() - 0.5) * 2,
          alpha,
          shape
        });
      }
    };

    // Main drawing function
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const { sentiment, motion } = optionsRef.current;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      
      if (sentiment === 'Positive') {
        gradient.addColorStop(0, 'rgba(100, 180, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(50, 200, 100, 0.5)');
      } else if (sentiment === 'Negative') {
        gradient.addColorStop(0, 'rgba(180, 50, 100, 0.5)');
        gradient.addColorStop(1, 'rgba(100, 50, 80, 0.5)');
      } else {
        gradient.addColorStop(0, 'rgba(100, 120, 180, 0.5)');
        gradient.addColorStop(1, 'rgba(120, 120, 150, 0.5)');
      }
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw simple landscape
      drawLandscape(ctx, sentiment);
      
      // Update and draw particles
      particlesRef.current.forEach(particle => {
        if (motion) {
          // Update position if motion is enabled
          particle.x += particle.speedX;
          particle.y += particle.speedY;
          
          // Wrap around edges
          if (particle.x < 0) particle.x = canvas.width;
          if (particle.x > canvas.width) particle.x = 0;
          if (particle.y < 0) particle.y = canvas.height;
          if (particle.y > canvas.height) particle.y = 0;
        }
        
        // Draw particle
        ctx.fillStyle = particle.color;
        
        if (particle.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (particle.shape === 'square') {
          ctx.fillRect(
            particle.x - particle.size / 2,
            particle.y - particle.size / 2,
            particle.size,
            particle.size
          );
        } else if (particle.shape === 'triangle') {
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y - particle.size / 2);
          ctx.lineTo(particle.x - particle.size / 2, particle.y + particle.size / 2);
          ctx.lineTo(particle.x + particle.size / 2, particle.y + particle.size / 2);
          ctx.closePath();
          ctx.fill();
        }
      });
      
      // Request next frame if component is still mounted
      if (isMountedRef.current) {
        animationRef.current = requestAnimationFrame(draw);
      }
    };
    
    // Draw landscape based on sentiment
    const drawLandscape = (ctx: CanvasRenderingContext2D, sentiment: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Draw simple mountains or hills
      if (sentiment === 'Positive') {
        // Gentle hills for positive sentiment
        drawHills(ctx, 'rgba(50, 120, 50, 0.7)', 0.3);
      } else if (sentiment === 'Negative') {
        // Jagged mountains for negative sentiment
        drawJaggedMountains(ctx, 'rgba(100, 30, 60, 0.7)', 0.4);
      } else {
        // Medium hills for neutral sentiment
        drawHills(ctx, 'rgba(60, 70, 120, 0.6)', 0.2);
      }
    };
    
    // Draw gentle hills
    const drawHills = (ctx: CanvasRenderingContext2D, color: string, heightFactor: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      
      const segments = 8;
      const segmentWidth = canvas.width / segments;
      
      for (let i = 0; i <= segments; i++) {
        const x = i * segmentWidth;
        const y = canvas.height - (Math.sin(i / segments * Math.PI) * canvas.height * heightFactor);
        ctx.lineTo(x, y);
      }
      
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fill();
    };
    
    // Draw jagged mountains
    const drawJaggedMountains = (ctx: CanvasRenderingContext2D, color: string, heightFactor: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      
      const segments = 15;
      const segmentWidth = canvas.width / segments;
      
      for (let i = 0; i <= segments; i++) {
        const x = i * segmentWidth;
        const randomHeight = Math.random() * (canvas.height * heightFactor);
        const y = canvas.height - randomHeight;
        ctx.lineTo(x, y);
      }
      
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fill();
    };

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      
      const canvas = canvasRef.current;
      canvas.width = containerRef.current.clientWidth;
      canvas.height = containerRef.current.clientHeight;
      
      // Reinitialize particles after resize
      initializeParticles();
    };

    // Setup visualization
    setupCanvas();
    
    // Start animation
    animationRef.current = requestAnimationFrame(draw);
    
    // Add resize handler
    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
      isMountedRef.current = false;
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      
      window.removeEventListener('resize', handleResize);
      
      // Remove canvas if it exists
      if (canvasRef.current && containerRef.current) {
        try {
          containerRef.current.removeChild(canvasRef.current);
          canvasRef.current = null;
        } catch (error) {
          console.error('Error removing canvas:', error);
        }
      }
    };
  }, []);

  // Function to save canvas to image
  const saveCanvas = async () => {
    if (!canvasRef.current) {
      console.error('Cannot save visualization: Canvas not found');
      return;
    }

    return new Promise<void>((resolve) => {
      try {
        // Get canvas data URL
        const dataURL = canvasRef.current!.toDataURL('image/png');
        
        // Save to localStorage
        localStorage.setItem('lastSavedVisualization', dataURL);
        console.log('Visualization saved to localStorage');
        
        resolve();
      } catch (error) {
        console.error('Error saving visualization:', error);
        resolve();
      }
    });
  };

  return {
    containerRef,
    saveCanvas
  };
}