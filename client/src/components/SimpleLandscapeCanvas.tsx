import React, { useEffect, useRef } from 'react';
import { SoundscapeType } from '@/hooks/stableSoundscapes';

interface SimpleLandscapeCanvasProps {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  soundscapeType: SoundscapeType;
  isActive: boolean;
}

// A simpler, non-3D canvas component that uses standard HTML5 Canvas API
const SimpleLandscapeCanvas: React.FC<SimpleLandscapeCanvasProps> = ({
  colors,
  soundscapeType,
  isActive
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<any[]>([]);
  
  // Set up and initialize the canvas when component mounts
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    console.log(`Initializing simple canvas for ${soundscapeType} landscape`);
    
    // Get the canvas context
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      
      canvas.width = width;
      canvas.height = height;
      
      console.log(`Canvas sized to ${width}x${height}`);
    };
    
    // Initialize particles
    const initializeParticles = () => {
      particlesRef.current = [];
      const particleCount = 100;
      
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 1,
          speedY: (Math.random() - 0.5) * 1,
          color: getParticleColor(i),
          alpha: Math.random() * 0.7 + 0.3
        });
      }
    };
    
    // Get color based on landscape type and particle index
    const getParticleColor = (index: number) => {
      // Parse the color strings
      const parseColor = (color: string) => {
        if (color.startsWith('#')) {
          const r = parseInt(color.slice(1, 3), 16);
          const g = parseInt(color.slice(3, 5), 16);
          const b = parseInt(color.slice(5, 7), 16);
          return { r, g, b };
        }
        return { r: 100, g: 100, b: 255 }; // Fallback color
      };
      
      const primary = parseColor(colors.primary);
      const secondary = parseColor(colors.secondary);
      const accent = parseColor(colors.accent);
      
      // Different color schemes based on landscape type
      if (soundscapeType === 'galactic' || soundscapeType === 'cosmic') {
        // More stars and cosmic colors
        if (index % 10 === 0) {
          return 'rgba(255, 255, 255, 0.9)'; // Bright stars
        } else if (index % 7 === 0) {
          return `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.7)`; // Accent stars
        } else {
          return `rgba(${primary.r}, ${primary.g}, ${primary.b}, 0.5)`; // Background stars
        }
      } else if (soundscapeType === 'dramatic') {
        // Dramatic reds and oranges
        if (index % 5 === 0) {
          return `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.8)`;
        } else {
          return `rgba(${primary.r}, ${primary.g}, ${primary.b}, 0.6)`;
        }
      } else if (soundscapeType === 'peaceful') {
        // Blues and greens
        if (index % 8 === 0) {
          return `rgba(${secondary.r}, ${secondary.g}, ${secondary.b}, 0.7)`;
        } else {
          return `rgba(${primary.r}, ${primary.g}, ${primary.b}, 0.5)`;
        }
      } else {
        // Default colors
        const colorChoice = index % 3;
        if (colorChoice === 0) {
          return `rgba(${primary.r}, ${primary.g}, ${primary.b}, 0.6)`;
        } else if (colorChoice === 1) {
          return `rgba(${secondary.r}, ${secondary.g}, ${secondary.b}, 0.6)`;
        } else {
          return `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.6)`;
        }
      }
    };
    
    // Draw background gradient based on landscape type
    const drawBackground = () => {
      const width = canvas.width;
      const height = canvas.height;
      
      // Parse colors
      const parseColor = (color: string) => {
        if (color.startsWith('#')) {
          return color;
        }
        return '#000000'; // Fallback
      };
      
      const primary = parseColor(colors.primary);
      const secondary = parseColor(colors.secondary);
      
      // Create gradient based on landscape type
      let gradient;
      if (soundscapeType === 'galactic' || soundscapeType === 'cosmic') {
        // Space gradient
        gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#000000');
        gradient.addColorStop(0.5, primary);
        gradient.addColorStop(1, '#000000');
      } else if (soundscapeType === 'dramatic') {
        // Dramatic gradient
        gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, primary);
        gradient.addColorStop(1, secondary);
      } else if (soundscapeType === 'peaceful') {
        // Calm gradient
        gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, primary);
        gradient.addColorStop(1, secondary);
      } else {
        // Default gradient
        gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, primary);
        gradient.addColorStop(1, secondary);
      }
      
      // Fill background
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    };
    
    // Draw foreground elements based on landscape type
    const drawForeground = () => {
      const width = canvas.width;
      const height = canvas.height;
      
      if (soundscapeType === 'dramatic' || soundscapeType === 'peaceful') {
        // Draw mountain silhouette
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.moveTo(0, height);
        
        // Generate mountain shapes
        const segments = 10;
        const segmentWidth = width / segments;
        
        for (let i = 0; i <= segments; i++) {
          const x = i * segmentWidth;
          const randomHeight = Math.sin(i / segments * Math.PI) * (height * 0.4) + 
                               Math.random() * (height * 0.1);
          ctx.lineTo(x, height - randomHeight);
        }
        
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
      } else if (soundscapeType === 'galactic' || soundscapeType === 'cosmic') {
        // Draw cosmic elements - nebula clouds
        const accent = colors.accent;
        
        // Parse accent color
        const parseColor = (color: string) => {
          if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return { r, g, b };
          }
          return { r: 100, g: 50, b: 200 }; // Fallback
        };
        
        const accentColor = parseColor(accent);
        
        // Draw cosmic nebula
        for (let i = 0; i < 3; i++) {
          const radius = Math.random() * (width * 0.3) + width * 0.1;
          const x = Math.random() * width;
          const y = Math.random() * height;
          
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
          gradient.addColorStop(0, `rgba(${accentColor.r}, ${accentColor.g}, ${accentColor.b}, 0.1)`);
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };
    
    // Update and draw particles
    const updateParticles = () => {
      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        // Draw particle
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.alpha;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });
    };
    
    // Main animation loop
    const animate = () => {
      if (!isActive) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw scene elements
      drawBackground();
      drawForeground();
      updateParticles();
      
      // Request next frame
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Set up resize listener
    window.addEventListener('resize', resizeCanvas);
    
    // Initialize canvas and start animation
    resizeCanvas();
    initializeParticles();
    
    if (isActive) {
      animationRef.current = requestAnimationFrame(animate);
    }
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [colors, soundscapeType, isActive]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full block" 
      data-landscape-type={soundscapeType}
      data-active={isActive.toString()}
    />
  );
};

export default SimpleLandscapeCanvas;