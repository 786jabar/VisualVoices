import React, { useEffect, useRef } from 'react';
import { SoundscapeType } from '@/hooks/stableSoundscapes';

interface SimpleDashboardCanvasProps {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  soundscapeType: SoundscapeType;
  isActive: boolean;
}

/**
 * A simple but effective canvas for dashboard visualization
 */
const SimpleDashboardCanvas: React.FC<SimpleDashboardCanvasProps> = ({
  colors,
  soundscapeType,
  isActive
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    color: string;
    alpha: number;
  }>>([]);
  
  // Set up and initialize the canvas when component mounts
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
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
    };
    
    // Handle window resize
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Initialize particles
    const initializeParticles = () => {
      particlesRef.current = [];
      const particleCount = soundscapeType === 'galactic' || soundscapeType === 'cosmic' ? 200 : 100;
      
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
          return `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.7)`;
        } else {
          return `rgba(${primary.r}, ${primary.g}, ${primary.b}, 0.5)`;
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
    
    // Animation time tracker
    let time = 0;
    
    // Draw a frame
    const drawFrame = () => {
      if (!ctx || !canvas) return;
      
      const width = canvas.width;
      const height = canvas.height;
      
      // Increment time for animations
      time += 0.01;
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Draw background gradient
      const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
      bgGradient.addColorStop(0, colors.primary);
      bgGradient.addColorStop(1, colors.secondary);
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);
      
      // Draw landscape based on soundscape type
      switch (soundscapeType) {
        case 'peaceful':
          drawPeacefulLandscape(ctx, width, height, time);
          break;
        case 'mysterious':
          drawMysteriousLandscape(ctx, width, height, time);
          break;
        case 'dramatic':
          drawDramaticLandscape(ctx, width, height, time);
          break;
        case 'cosmic':
          drawCosmicLandscape(ctx, width, height, time);
          break;
        case 'galactic':
          drawGalacticLandscape(ctx, width, height, time);
          break;
        default:
          drawDefaultLandscape(ctx, width, height, time);
      }
      
      // Draw and update particles
      updateParticles(ctx, width, height, time);
      
      // Continue animation loop
      animationRef.current = requestAnimationFrame(drawFrame);
    };
    
    // Update and draw particles
    const updateParticles = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += particle.speedX * (1 + Math.sin(time) * 0.2);
        particle.y += particle.speedY * (1 + Math.cos(time) * 0.2);
        
        // Wrap around edges
        if (particle.x < 0) particle.x = width;
        if (particle.x > width) particle.x = 0;
        if (particle.y < 0) particle.y = height;
        if (particle.y > height) particle.y = 0;
        
        // Draw particle
        ctx.globalAlpha = particle.alpha * (0.7 + Math.sin(time + particle.x * 0.01) * 0.3);
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Reset global alpha
      ctx.globalAlpha = 1;
    };
    
    // Draw peaceful landscape with mountains
    const drawPeacefulLandscape = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
      // Draw mountains
      const mountainLayers = 3;
      
      for (let i = 0; i < mountainLayers; i++) {
        const mountainHeight = height * (0.2 + i * 0.1);
        const yPos = height - mountainHeight;
        
        ctx.fillStyle = `rgba(${30 + i * 20}, ${40 + i * 15}, ${60 + i * 20}, ${0.8 - i * 0.2})`;
        ctx.beginPath();
        ctx.moveTo(0, height);
        
        // Draw mountain profile with randomness
        for (let x = 0; x < width; x += 20) {
          const heightVariation = Math.sin((x / width) * 5 + i + time) * 50 * (1 - i * 0.3);
          const y = yPos + heightVariation;
          ctx.lineTo(x, y);
        }
        
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
      }
      
      // Draw lake reflection
      const lakeLevel = height * 0.8;
      const lakeGradient = ctx.createLinearGradient(0, lakeLevel, 0, height);
      lakeGradient.addColorStop(0, `rgba(100, 150, 255, 0.7)`);
      lakeGradient.addColorStop(1, colors.secondary);
      
      ctx.fillStyle = lakeGradient;
      ctx.fillRect(0, lakeLevel, width, height - lakeLevel);
      
      // Add ripples to the lake
      const rippleCount = 3;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      
      for (let i = 0; i < rippleCount; i++) {
        const x = width * (0.3 + i * 0.2);
        const y = lakeLevel + (height - lakeLevel) * 0.3;
        const radius = 10 + Math.sin(time * 2 + i) * 5;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(x, y, radius * 1.5, 0, Math.PI * 2);
        ctx.stroke();
      }
    };
    
    // Draw mysterious landscape with fog and floating islands
    const drawMysteriousLandscape = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
      // Draw background fog
      const fogGradient = ctx.createRadialGradient(
        width * 0.5, height * 0.5, 0,
        width * 0.5, height * 0.5, height
      );
      
      fogGradient.addColorStop(0, `rgba(${parseInt(colors.primary.slice(1, 3), 16)}, ${parseInt(colors.primary.slice(3, 5), 16)}, ${parseInt(colors.primary.slice(5, 7), 16)}, 0.8)`);
      fogGradient.addColorStop(1, colors.secondary);
      
      ctx.fillStyle = fogGradient;
      ctx.fillRect(0, 0, width, height);
      
      // Draw floating islands
      const islandCount = 3;
      
      for (let i = 0; i < islandCount; i++) {
        const x = width * (0.3 + i * 0.2);
        const y = height * (0.4 + Math.sin(time + i) * 0.05);
        const size = width * (0.1 + i * 0.05);
        
        // Island base
        ctx.fillStyle = `rgba(40, 40, 70, 0.8)`;
        ctx.beginPath();
        ctx.ellipse(x, y, size, size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Island top
        ctx.fillStyle = `rgba(60, 60, 100, 0.9)`;
        ctx.beginPath();
        ctx.ellipse(x, y - size * 0.1, size * 0.9, size * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Add mystical structure
        if (i % 2 === 0) {
          const structureHeight = size * 1.2;
          ctx.fillStyle = `rgba(30, 30, 60, 0.9)`;
          ctx.fillRect(x - size * 0.1, y - structureHeight, size * 0.2, structureHeight);
          
          // Add glowing window
          ctx.fillStyle = `rgba(200, 170, 255, ${0.5 + Math.sin(time * 2) * 0.2})`;
          ctx.fillRect(x - size * 0.05, y - structureHeight * 0.3, size * 0.1, size * 0.1);
        }
      }
      
      // Add fog wisps
      const wispCount = 5;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      
      for (let i = 0; i < wispCount; i++) {
        const x = (width * i / wispCount + time * 20) % width;
        const y = height * (0.3 + i * 0.1);
        const wispWidth = width * 0.2;
        const wispHeight = 20 + Math.sin(time + i) * 10;
        
        ctx.beginPath();
        ctx.ellipse(x, y, wispWidth, wispHeight, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    
    // Draw dramatic landscape with harsh mountains and lava
    const drawDramaticLandscape = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
      // Draw dramatic sky with light rays
      const rayCount = 5;
      const rayY = height * 0.3;
      
      for (let i = 0; i < rayCount; i++) {
        const x = width * (0.2 + i * 0.15);
        const rayWidth = width * 0.02;
        const rayHeight = height * 0.7;
        
        ctx.fillStyle = `rgba(255, 200, 100, ${0.1 + Math.sin(time + i) * 0.05})`;
        ctx.beginPath();
        ctx.moveTo(x, rayY);
        ctx.lineTo(x + rayWidth, rayY);
        ctx.lineTo(x + rayWidth * 2, rayY + rayHeight);
        ctx.lineTo(x - rayWidth, rayY + rayHeight);
        ctx.closePath();
        ctx.fill();
      }
      
      // Draw rocky mountains
      const peakCount = 10;
      ctx.fillStyle = 'rgba(50, 30, 20, 0.9)';
      
      ctx.beginPath();
      ctx.moveTo(0, height);
      
      for (let i = 0; i <= peakCount; i++) {
        const x = width * (i / peakCount);
        const peakHeight = height * (0.3 + Math.sin(i * 0.5 + time * 0.2) * 0.1);
        const y = height - peakHeight;
        
        if (i === 0) {
          ctx.lineTo(x, y);
        } else {
          const prevX = width * ((i - 1) / peakCount);
          const controlX = (prevX + x) / 2;
          const controlY = height - (Math.random() * height * 0.2 + peakHeight * 0.7);
          
          ctx.quadraticCurveTo(controlX, controlY, x, y);
        }
      }
      
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();
      
      // Draw lava flows
      const lavaCount = 3;
      
      for (let i = 0; i < lavaCount; i++) {
        const startX = width * (0.2 + i * 0.3);
        const startY = height * 0.4;
        
        const gradient = ctx.createLinearGradient(startX, startY, startX, height);
        gradient.addColorStop(0, 'rgba(255, 100, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(200, 50, 0, 0.4)');
        
        ctx.fillStyle = gradient;
        
        // Draw flowing lava
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        
        let prevX = startX;
        let prevY = startY;
        
        for (let y = startY; y < height; y += 20) {
          const flowWidth = 5 + Math.sin(y * 0.1 + time * 3) * 10;
          const x = startX + Math.sin((y - startY) * 0.05 + time * 2 + i) * 30;
          
          ctx.quadraticCurveTo(
            prevX + flowWidth, (prevY + y) / 2,
            x, y
          );
          
          prevX = x;
          prevY = y;
        }
        
        ctx.lineTo(prevX, height);
        ctx.lineTo(startX - 20, height);
        ctx.closePath();
        ctx.fill();
        
        // Add lava glow
        ctx.shadowColor = 'rgba(255, 100, 0, 0.5)';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };
    
    // Draw cosmic landscape with nebula and energy flows
    const drawCosmicLandscape = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
      // Draw cosmic background with stars
      drawStarField(ctx, width, height, time);
      
      // Draw nebula clouds
      const nebulaCount = 3;
      
      for (let i = 0; i < nebulaCount; i++) {
        const x = width * (0.3 + i * 0.2);
        const y = height * (0.3 + i * 0.2);
        const size = width * (0.2 + i * 0.1);
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
        
        if (i % 3 === 0) {
          // Purple nebula
          gradient.addColorStop(0, 'rgba(180, 100, 255, 0.4)');
          gradient.addColorStop(0.5, 'rgba(100, 50, 150, 0.2)');
        } else if (i % 3 === 1) {
          // Blue nebula
          gradient.addColorStop(0, 'rgba(100, 150, 255, 0.4)');
          gradient.addColorStop(0.5, 'rgba(50, 100, 150, 0.2)');
        } else {
          // Pink nebula
          gradient.addColorStop(0, 'rgba(255, 100, 200, 0.4)');
          gradient.addColorStop(0.5, 'rgba(150, 50, 100, 0.2)');
        }
        
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Draw energy flows
      const flowCount = 5;
      ctx.strokeStyle = 'rgba(200, 220, 255, 0.4)';
      ctx.lineWidth = 2;
      
      for (let i = 0; i < flowCount; i++) {
        const startX = width * 0.1;
        const startY = height * (0.2 + i * 0.15);
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        
        for (let j = 1; j <= 10; j++) {
          const t = j / 10;
          const x = startX + t * width * 0.8;
          const y = startY + Math.sin(t * 5 + time * 2 + i) * height * 0.1;
          
          ctx.lineTo(x, y);
        }
        
        ctx.stroke();
        
        // Add glow effect
        ctx.shadowColor = 'rgba(150, 200, 255, 0.5)';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    };
    
    // Draw starfield for cosmic backgrounds
    const drawStarField = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
      const starCount = 100;
      
      for (let i = 0; i < starCount; i++) {
        const x = (width * i / starCount + time * 10) % width;
        const y = height * (i / starCount);
        const size = 1 + Math.random() * 2;
        
        const brightness = 0.5 + Math.sin(time * 3 + i) * 0.5;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow to brighter stars
        if (brightness > 0.8 && size > 1.5) {
          ctx.shadowColor = 'rgba(200, 220, 255, 0.8)';
          ctx.shadowBlur = 5;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    };
    
    // Draw galactic landscape with spiral galaxy
    const drawGalacticLandscape = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
      // Draw star background
      drawStarField(ctx, width, height, time);
      
      // Draw spiral galaxy
      const centerX = width * 0.5;
      const centerY = height * 0.5;
      const galaxySize = width * 0.3;
      
      // Galaxy core
      const coreGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, galaxySize * 0.1
      );
      
      coreGradient.addColorStop(0, 'rgba(255, 240, 200, 0.8)');
      coreGradient.addColorStop(1, 'rgba(200, 150, 100, 0.1)');
      
      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, galaxySize * 0.1, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw spiral arms
      const armCount = 3;
      
      for (let arm = 0; arm < armCount; arm++) {
        const armOffset = (arm / armCount) * Math.PI * 2;
        
        for (let i = 0; i < 300; i++) {
          const distance = (i / 300) * galaxySize;
          const angle = armOffset + (i / 50) * Math.PI + time * 0.05;
          
          const x = centerX + Math.cos(angle) * distance;
          const y = centerY + Math.sin(angle) * distance;
          
          const particleSize = 1 + (1 - i / 300) * 2;
          const alpha = 0.8 * (1 - (i / 300) * 0.5);
          
          // Different colors for each arm
          let color;
          if (arm === 0) {
            color = `rgba(200, 200, 255, ${alpha})`;
          } else if (arm === 1) {
            color = `rgba(255, 200, 200, ${alpha})`;
          } else {
            color = `rgba(200, 255, 200, ${alpha})`;
          }
          
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(x, y, particleSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // Add some planets
      const planetCount = 2;
      
      for (let i = 0; i < planetCount; i++) {
        const orbitRadius = galaxySize * 1.5;
        const angle = time * 0.2 + i * Math.PI;
        
        const x = centerX + Math.cos(angle) * orbitRadius;
        const y = centerY + Math.sin(angle) * orbitRadius;
        
        const planetSize = width * 0.02;
        
        // Draw planet
        const planetGradient = ctx.createRadialGradient(
          x - planetSize * 0.3, y - planetSize * 0.3, 0,
          x, y, planetSize
        );
        
        if (i === 0) {
          // Blue planet
          planetGradient.addColorStop(0, 'rgba(150, 200, 255, 0.9)');
          planetGradient.addColorStop(1, 'rgba(70, 100, 150, 0.7)');
        } else {
          // Red planet
          planetGradient.addColorStop(0, 'rgba(255, 150, 100, 0.9)');
          planetGradient.addColorStop(1, 'rgba(150, 70, 50, 0.7)');
        }
        
        ctx.fillStyle = planetGradient;
        ctx.beginPath();
        ctx.arc(x, y, planetSize, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    
    // Draw default landscape
    const drawDefaultLandscape = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
      // Draw rolling hills
      const hillLayers = 3;
      
      for (let i = 0; i < hillLayers; i++) {
        const hillHeight = height * 0.2;
        const baseY = height * (0.6 + i * 0.1);
        
        const shade = 100 - i * 20;
        ctx.fillStyle = `rgb(${shade}, ${shade + 20}, ${shade + 40})`;
        
        ctx.beginPath();
        ctx.moveTo(0, height);
        
        for (let x = 0; x <= width; x += 30) {
          const y = baseY + Math.sin((x / width) * 5 + time + i) * hillHeight;
          ctx.lineTo(x, y);
        }
        
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
      }
      
      // Draw some clouds
      const cloudCount = 3;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      
      for (let i = 0; i < cloudCount; i++) {
        const x = (width * i / cloudCount + time * 20) % width;
        const y = height * 0.3;
        const cloudWidth = width * 0.2;
        const cloudHeight = height * 0.05;
        
        ctx.beginPath();
        ctx.ellipse(x, y, cloudWidth, cloudHeight, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.ellipse(x + cloudWidth * 0.5, y - cloudHeight * 0.5, cloudWidth * 0.7, cloudHeight * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.ellipse(x - cloudWidth * 0.4, y - cloudHeight * 0.3, cloudWidth * 0.5, cloudHeight * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    
    // Start animation if component is active
    if (isActive) {
      initializeParticles();
      drawFrame();
    }
    
    // Clean up on unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [colors, soundscapeType, isActive]);
  
  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{
        display: 'block'
      }}
    />
  );
};

export default SimpleDashboardCanvas;