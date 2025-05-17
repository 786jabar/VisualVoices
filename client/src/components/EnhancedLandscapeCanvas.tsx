import React, { useEffect, useRef } from 'react';
import { SoundscapeType } from '@/hooks/stableSoundscapes';
import { fbm3D, ridgedMultifractal, generateTerrain } from '@/lib/noise3D';

interface EnhancedLandscapeCanvasProps {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  soundscapeType: SoundscapeType;
  isActive: boolean;
}

/**
 * Enhanced landscape canvas with more advanced 3D terrain generation and animations
 */
const EnhancedLandscapeCanvas: React.FC<EnhancedLandscapeCanvasProps> = ({
  colors,
  soundscapeType,
  isActive
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const terrainRef = useRef<number[][]>([]);
  const timeRef = useRef<number>(0);
  
  // Particles for atmospheric effects
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    z: number;
    size: number;
    speedX: number;
    speedY: number;
    speedZ: number;
    color: string;
    alpha: number;
  }>>([]);
  
  // Set up and initialize the canvas when component mounts or when active state changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Get the canvas context
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions - increase size for better quality
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      
      // Use larger dimensions for high-quality rendering
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      
      canvas.width = width;
      canvas.height = height;
      
      // Generate new terrain when resizing
      generateTerrainData();
    };
    
    // Handle window resize
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Generate terrain data
    const generateTerrainData = () => {
      const terrainWidth = 100;
      const terrainHeight = 50;
      
      // Use different terrain generation options based on soundscape type
      const options = {
        scale: 0.02,
        octaves: 6,
        persistence: 0.5,
        lacunarity: 2.0,
        elevation: 1.0,
        seed: Math.random() * 100,
        warp: soundscapeType === 'mysterious' || soundscapeType === 'cosmic',
        ridged: soundscapeType === 'dramatic' || soundscapeType === 'galactic'
      };
      
      // Generate terrain using improved noise algorithms
      terrainRef.current = generateTerrain(terrainWidth, terrainHeight, options);
    };
    
    // Initialize particles with 3D positions for depth effect
    const initializeParticles = () => {
      particlesRef.current = [];
      let particleCount = 150; // More particles for richer visuals
      
      // Add more particles for cosmic and galactic soundscapes
      if (soundscapeType === 'galactic' || soundscapeType === 'cosmic') {
        particleCount = 300;
      }
      
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          z: Math.random() * 5, // Z-depth for parallax effect
          size: Math.random() * 4 + 1,
          speedX: (Math.random() - 0.5) * 0.8,
          speedY: (Math.random() - 0.5) * 0.8,
          speedZ: (Math.random() - 0.5) * 0.2,
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
      
      // Enhanced color schemes based on landscape type
      if (soundscapeType === 'galactic') {
        // Galaxy-like star colors
        if (index % 20 === 0) {
          return 'rgba(255, 255, 255, 0.95)'; // Bright stars
        } else if (index % 15 === 0) {
          return `rgba(${accent.r}, ${accent.g}, ${accent.b + 30}, 0.8)`;
        } else if (index % 10 === 0) {
          return `rgba(${primary.r + 30}, ${primary.g}, ${primary.b + 50}, 0.6)`;
        } else {
          return `rgba(${secondary.r}, ${secondary.g + 20}, ${secondary.b + 40}, 0.5)`;
        }
      } else if (soundscapeType === 'cosmic') {
        // Nebula-like colors
        if (index % 17 === 0) {
          return 'rgba(255, 255, 255, 0.9)'; // Bright stars
        } else if (index % 12 === 0) {
          return `rgba(${accent.r + 20}, ${accent.g}, ${accent.b + 40}, 0.7)`;
        } else if (index % 7 === 0) {
          return `rgba(${primary.r + 40}, ${primary.g}, ${primary.b + 30}, 0.6)`;
        } else {
          return `rgba(${secondary.r}, ${secondary.g + 10}, ${secondary.b + 30}, 0.5)`;
        }
      } else if (soundscapeType === 'dramatic') {
        // Intense dramatic colors
        if (index % 8 === 0) {
          return `rgba(${accent.r + 20}, ${accent.g - 10}, ${accent.b - 20}, 0.8)`;
        } else if (index % 6 === 0) {
          return `rgba(${primary.r + 30}, ${primary.g}, ${primary.b - 20}, 0.7)`;
        } else {
          return `rgba(${secondary.r + 20}, ${secondary.g + 10}, ${secondary.b - 10}, 0.6)`;
        }
      } else if (soundscapeType === 'peaceful') {
        // Serene blues and greens
        if (index % 9 === 0) {
          return `rgba(${accent.r - 20}, ${accent.g + 10}, ${accent.b + 20}, 0.7)`;
        } else if (index % 7 === 0) {
          return `rgba(${secondary.r - 10}, ${secondary.g + 20}, ${secondary.b + 30}, 0.6)`;
        } else {
          return `rgba(${primary.r}, ${primary.g + 15}, ${primary.b + 25}, 0.5)`;
        }
      } else if (soundscapeType === 'mysterious') {
        // Ethereal purples and blues
        if (index % 11 === 0) {
          return `rgba(${accent.r + 10}, ${accent.g - 10}, ${accent.b + 40}, 0.75)`;
        } else if (index % 7 === 0) {
          return `rgba(${primary.r + 20}, ${primary.g - 5}, ${primary.b + 30}, 0.65)`;
        } else {
          return `rgba(${secondary.r + 10}, ${secondary.g}, ${secondary.b + 20}, 0.55)`;
        }
      } else {
        // Default colors with enhancements
        const colorChoice = index % 4;
        if (colorChoice === 0) {
          return `rgba(${primary.r + 10}, ${primary.g + 10}, ${primary.b + 10}, 0.7)`;
        } else if (colorChoice === 1) {
          return `rgba(${secondary.r - 5}, ${secondary.g + 15}, ${secondary.b + 5}, 0.65)`;
        } else if (colorChoice === 2) {
          return `rgba(${accent.r}, ${accent.g - 5}, ${accent.b + 15}, 0.7)`;
        } else {
          return `rgba(255, 255, 255, 0.8)`;
        }
      }
    };
    
    // Draw the entire scene
    const drawScene = () => {
      if (!ctx || !canvas) return;
      
      const width = canvas.width;
      const height = canvas.height;
      timeRef.current += 0.005; // Increment time for animations
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Draw dynamic background gradient with animated color shift
      drawBackground(ctx, width, height);
      
      // Draw terrain or landscape elements based on type
      switch (soundscapeType) {
        case 'peaceful':
          drawPeacefulLandscape(ctx, width, height);
          break;
        case 'mysterious':
          drawMysteriousLandscape(ctx, width, height);
          break;
        case 'dramatic':
          drawDramaticLandscape(ctx, width, height);
          break;
        case 'cosmic':
          drawCosmicLandscape(ctx, width, height);
          break;
        case 'galactic':
          drawGalacticLandscape(ctx, width, height);
          break;
        default:
          drawDefaultLandscape(ctx, width, height);
      }
      
      // Draw particles with parallax effect
      drawParticles(ctx, width, height);
      
      // Add atmospheric effects
      drawAtmosphericEffects(ctx, width, height);
      
      // Apply subtle post-processing effects
      applyPostProcessing(ctx, width, height);
    };
    
    // Draw background with animated gradient
    const drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      // Animate color shift based on time
      const time = timeRef.current;
      const shiftAmount = Math.sin(time * 0.5) * 0.08; // Subtle shift
      
      // Get colors with shift applied
      const primaryShifted = shiftColor(colors.primary, shiftAmount);
      const secondaryShifted = shiftColor(colors.secondary, shiftAmount);
      
      // Create gradient based on soundscape type
      let gradient;
      if (soundscapeType === 'mysterious' || soundscapeType === 'cosmic') {
        gradient = ctx.createRadialGradient(
          width * (0.5 + Math.sin(time * 0.2) * 0.2),
          height * (0.3 + Math.cos(time * 0.1) * 0.1),
          height * 0.1,
          width * 0.5,
          height * 0.5,
          height * 1.2
        );
      } else {
        gradient = ctx.createLinearGradient(
          0, 0,
          0, height
        );
      }
      
      // Add color stops
      gradient.addColorStop(0, primaryShifted);
      gradient.addColorStop(1, secondaryShifted);
      
      // Fill background
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      // Add subtle noise texture for atmosphere
      addNoiseTexture(ctx, width, height, 0.03);
    };
    
    // Add subtle noise texture to create atmosphere
    const addNoiseTexture = (ctx: CanvasRenderingContext2D, width: number, height: number, opacity: number) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      
      // Create a small noise pattern
      const size = 100;
      const noiseData = new ImageData(size, size);
      const data = noiseData.data;
      
      for (let i = 0; i < size * size; i++) {
        const value = Math.floor(Math.random() * 255);
        const index = i * 4;
        data[index] = value;
        data[index + 1] = value;
        data[index + 2] = value;
        data[index + 3] = Math.random() * 80; // Semi-transparent
      }
      
      // Create temporary canvas for noise
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = size;
      tempCanvas.height = size;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;
      
      tempCtx.putImageData(noiseData, 0, 0);
      
      // Tile the noise pattern
      const pattern = ctx.createPattern(tempCanvas, 'repeat');
      if (!pattern) return;
      
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, width, height);
      
      ctx.restore();
    };
    
    // Draw particles with depth effect
    const drawParticles = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      // Update and draw each particle
      particlesRef.current.forEach((particle, index) => {
        // Update position with time-based animation
        particle.x += particle.speedX * (1 + Math.sin(timeRef.current * 0.5) * 0.2);
        particle.y += particle.speedY * (1 + Math.cos(timeRef.current * 0.3) * 0.2);
        particle.z += particle.speedZ;
        
        // Calculate size based on z-position for parallax effect
        const parallaxSize = particle.size * (1 + particle.z * 0.1);
        
        // Wrap around screen edges
        if (particle.x < -parallaxSize) particle.x = width + parallaxSize;
        if (particle.x > width + parallaxSize) particle.x = -parallaxSize;
        if (particle.y < -parallaxSize) particle.y = height + parallaxSize;
        if (particle.y > height + parallaxSize) particle.y = -parallaxSize;
        
        // Reset z if out of bounds
        if (particle.z < 0 || particle.z > 10) {
          particle.z = Math.random() * 5;
        }
        
        // Animate opacity based on time and position
        const animatedAlpha = particle.alpha * (0.7 + Math.sin(timeRef.current + index * 0.1) * 0.3);
        
        // Draw particle with glow effect
        ctx.save();
        
        // Apply glow for larger particles (stars)
        if (parallaxSize > 2.5) {
          const glow = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, parallaxSize * 3
          );
          
          // Parse the particle color to get RGB
          const colorMatch = particle.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
          if (colorMatch) {
            const r = parseInt(colorMatch[1]);
            const g = parseInt(colorMatch[2]);
            const b = parseInt(colorMatch[3]);
            
            glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${animatedAlpha})`);
            glow.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${animatedAlpha * 0.5})`);
            glow.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
            
            ctx.fillStyle = glow;
            ctx.fillRect(
              particle.x - parallaxSize * 3,
              particle.y - parallaxSize * 3,
              parallaxSize * 6,
              parallaxSize * 6
            );
          }
        }
        
        // Draw the particle
        ctx.globalAlpha = animatedAlpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, parallaxSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      });
    };
    
    // Draw peaceful landscape with mountain silhouettes and gentle terrain
    const drawPeacefulLandscape = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      // Create mountain layers
      const mountainLayers = 3;
      
      ctx.save();
      
      for (let layer = 0; layer < mountainLayers; layer++) {
        const layerHeight = height * (0.4 + layer * 0.1);
        const offsetY = height - layerHeight;
        const mountains = terrainRef.current;
        
        // Create gradient for mountains
        const mountainColor = shiftColor(colors.secondary, -0.2 - layer * 0.1);
        const gradient = ctx.createLinearGradient(0, offsetY, 0, height);
        gradient.addColorStop(0, mountainColor);
        gradient.addColorStop(1, shiftColor(colors.primary, -0.3 - layer * 0.1));
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(0, height);
        
        // Draw mountain profile
        const scaleFactor = 1 - layer * 0.15;
        const xOffset = Math.sin(timeRef.current * 0.1 + layer) * width * 0.05;
        
        for (let x = 0; x < width; x += 5) {
          const mountainIndex = Math.floor((x / width) * (mountains[0]?.length || 1));
          const layerOffset = Math.sin((x / width) * Math.PI * 2 + timeRef.current * 0.2 + layer * Math.PI) * 20 * scaleFactor;
          
          // Get height from terrain data
          const mountainHeight = mountains[layer]?.[mountainIndex] || 0.5;
          const y = offsetY + layerHeight * (1 - mountainHeight * 0.7 * scaleFactor) + layerOffset;
          
          ctx.lineTo(x + xOffset, y);
        }
        
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
      }
      
      // Draw a peaceful lake reflection
      const lakeLevel = height * 0.9;
      const lakeGradient = ctx.createLinearGradient(0, lakeLevel, 0, height);
      
      // Lake colors with subtle animation
      const lakeColor = shiftColor(colors.accent, Math.sin(timeRef.current * 0.3) * 0.1);
      lakeGradient.addColorStop(0, lakeColor);
      lakeGradient.addColorStop(1, shiftColor(colors.primary, -0.2));
      
      ctx.fillStyle = lakeGradient;
      ctx.fillRect(0, lakeLevel, width, height - lakeLevel);
      
      // Draw ripples on the lake
      drawWaterRipples(ctx, width, height, lakeLevel);
      
      ctx.restore();
    };
    
    // Draw water ripples for lakes
    const drawWaterRipples = (ctx: CanvasRenderingContext2D, width: number, height: number, waterLevel: number) => {
      ctx.save();
      ctx.globalAlpha = 0.2;
      ctx.strokeStyle = colors.accent;
      
      const rippleCount = 5;
      const time = timeRef.current;
      
      for (let i = 0; i < rippleCount; i++) {
        const x = width * (0.2 + Math.sin(time * 0.2 + i) * 0.3);
        const y = waterLevel + Math.random() * (height - waterLevel) * 0.5;
        const radius = 5 + Math.sin(time + i * 2) * 10;
        
        // Draw concentric ripples
        for (let j = 0; j < 3; j++) {
          ctx.beginPath();
          ctx.arc(x, y, radius * (j + 1) * 0.7, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      
      ctx.restore();
    };
    
    // Draw mysterious landscape with fog and floating elements
    const drawMysteriousLandscape = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.save();
      
      // Misty background
      const fogLevel = height * 0.6;
      const fogGradient = ctx.createLinearGradient(0, fogLevel - 100, 0, fogLevel + 100);
      
      // Fog colors with animation
      const fogColor = shiftColor(colors.secondary, Math.sin(timeRef.current * 0.2) * 0.1);
      fogGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      fogGradient.addColorStop(0.5, fogColor + '80'); // Semi-transparent
      fogGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = fogGradient;
      ctx.fillRect(0, fogLevel - 100, width, 200);
      
      // Floating islands
      const islandCount = 4;
      for (let i = 0; i < islandCount; i++) {
        const size = width * (0.1 + (i / islandCount) * 0.2);
        const x = width * (0.1 + (i / islandCount) * 0.8);
        const baseY = height * (0.5 - (i / islandCount) * 0.1);
        const y = baseY + Math.sin(timeRef.current * 0.5 + i) * 20;
        
        // Island gradient
        const islandGradient = ctx.createRadialGradient(
          x, y, 0,
          x, y, size
        );
        
        islandGradient.addColorStop(0, shiftColor(colors.accent, 0.1));
        islandGradient.addColorStop(0.7, shiftColor(colors.secondary, -0.1));
        islandGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = islandGradient;
        
        // Draw floating island shape
        ctx.beginPath();
        ctx.ellipse(x, y, size, size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Add mysterious structures on islands
        const structureHeight = size * 0.8;
        const structureWidth = size * 0.2;
        
        ctx.fillStyle = shiftColor(colors.primary, 0.05);
        ctx.fillRect(x - structureWidth / 2, y - structureHeight, structureWidth, structureHeight);
        
        // Add glowing runes or symbols
        drawMysteriousSymbols(ctx, x, y - structureHeight / 2, size * 0.1);
      }
      
      ctx.restore();
    };
    
    // Draw mysterious glowing symbols
    const drawMysteriousSymbols = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      const time = timeRef.current;
      const symbolsCount = 3;
      
      ctx.save();
      ctx.strokeStyle = shiftColor(colors.accent, Math.sin(time * 0.5) * 0.3);
      ctx.lineWidth = 2;
      
      for (let i = 0; i < symbolsCount; i++) {
        const symbolX = x - size + (i * size);
        const symbolY = y + Math.sin(time + i) * 5;
        
        ctx.beginPath();
        
        // Different symbol shapes
        if (i % 3 === 0) {
          // Circle with inner details
          ctx.arc(symbolX, symbolY, size * 0.5, 0, Math.PI * 2);
          ctx.moveTo(symbolX, symbolY - size * 0.5);
          ctx.lineTo(symbolX, symbolY + size * 0.5);
        } else if (i % 3 === 1) {
          // Triangle
          ctx.moveTo(symbolX, symbolY - size * 0.5);
          ctx.lineTo(symbolX + size * 0.5, symbolY + size * 0.5);
          ctx.lineTo(symbolX - size * 0.5, symbolY + size * 0.5);
          ctx.closePath();
        } else {
          // Square with diagonal
          ctx.rect(symbolX - size * 0.4, symbolY - size * 0.4, size * 0.8, size * 0.8);
          ctx.moveTo(symbolX - size * 0.4, symbolY - size * 0.4);
          ctx.lineTo(symbolX + size * 0.4, symbolY + size * 0.4);
        }
        
        ctx.stroke();
        
        // Add a glow effect
        ctx.shadowColor = colors.accent;
        ctx.shadowBlur = 10 + Math.sin(time * 2 + i) * 5;
        ctx.stroke();
      }
      
      ctx.restore();
    };
    
    // Draw dramatic landscape with harsh mountains and lava
    const drawDramaticLandscape = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.save();
      
      // Dramatic sky with light rays
      drawLightRays(ctx, width, height);
      
      // Harsh, jagged mountains
      const mountainLayers = 2;
      
      for (let layer = 0; layer < mountainLayers; layer++) {
        const baseHeight = height * (0.5 + layer * 0.2);
        const mountains = terrainRef.current;
        
        // Mountain gradient with dramatic colors
        const gradient = ctx.createLinearGradient(0, height * 0.5, 0, height);
        gradient.addColorStop(0, shiftColor(colors.primary, -0.1));
        gradient.addColorStop(1, shiftColor(colors.secondary, -0.2));
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(0, height);
        
        // Draw jagged mountain profile
        const pointCount = width / 5;
        for (let i = 0; i < pointCount; i++) {
          const x = (i / pointCount) * width;
          const mountainIndex = Math.floor((i / pointCount) * (mountains[0]?.length || 1));
          
          // Get height from terrain with more extreme values
          const terrainHeight = mountains[layer]?.[mountainIndex] || 0.5;
          const jaggedness = Math.sin(i * 0.8 + timeRef.current + layer) * 0.1;
          const y = baseHeight - (terrainHeight * 0.8 + jaggedness) * height * 0.4;
          
          ctx.lineTo(x, y);
        }
        
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
      }
      
      // Draw lava flows
      drawLavaFlows(ctx, width, height);
      
      ctx.restore();
    };
    
    // Draw light rays for dramatic skies
    const drawLightRays = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const time = timeRef.current;
      const rayCount = 5;
      const raySource = {
        x: width * (0.5 + Math.sin(time * 0.1) * 0.3),
        y: height * 0.3
      };
      
      ctx.save();
      
      for (let i = 0; i < rayCount; i++) {
        const angle = (i / rayCount) * Math.PI + time * 0.1;
        const length = height * (0.5 + Math.sin(time + i) * 0.2);
        const width = 50 + Math.sin(time * 0.5 + i) * 20;
        
        const endX = raySource.x + Math.cos(angle) * length;
        const endY = raySource.y + Math.sin(angle) * length;
        
        // Create ray gradient
        const gradient = ctx.createLinearGradient(
          raySource.x, raySource.y,
          endX, endY
        );
        
        gradient.addColorStop(0, colors.accent + 'cc'); // Semi-transparent
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        
        // Draw ray
        ctx.beginPath();
        ctx.moveTo(raySource.x, raySource.y);
        ctx.lineTo(
          raySource.x + Math.cos(angle - 0.1) * width,
          raySource.y + Math.sin(angle - 0.1) * width
        );
        ctx.lineTo(endX, endY);
        ctx.lineTo(
          raySource.x + Math.cos(angle + 0.1) * width,
          raySource.y + Math.sin(angle + 0.1) * width
        );
        ctx.closePath();
        
        ctx.globalAlpha = 0.3 + Math.sin(time * 0.5 + i) * 0.1;
        ctx.fill();
      }
      
      ctx.restore();
    };
    
    // Draw lava flows for dramatic landscapes
    const drawLavaFlows = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const time = timeRef.current;
      const lavaCount = 3;
      
      ctx.save();
      
      for (let i = 0; i < lavaCount; i++) {
        const x = width * (0.2 + (i / lavaCount) * 0.6);
        const startY = height * 0.6;
        const amplitude = 30 + Math.sin(time + i) * 10;
        
        // Lava gradient
        const gradient = ctx.createLinearGradient(x, startY, x, height);
        gradient.addColorStop(0, colors.accent + 'cc');
        gradient.addColorStop(1, shiftColor(colors.secondary, 0.1) + '80');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        
        // Draw flowing lava
        ctx.moveTo(x - 10, startY);
        
        for (let y = startY; y < height; y += 10) {
          const waveOffset = Math.sin((y / height) * 10 + time * 2 + i) * amplitude;
          const flowWidth = 20 + Math.sin((y / height) * 5 + time + i) * 10;
          
          ctx.quadraticCurveTo(
            x + waveOffset, y + 5,
            x + waveOffset + flowWidth, y + 10
          );
        }
        
        ctx.lineTo(x + 10, height);
        ctx.lineTo(x - 10, height);
        ctx.closePath();
        ctx.fill();
        
        // Add pulsing glow effect
        ctx.shadowColor = colors.accent;
        ctx.shadowBlur = 10 + Math.sin(time * 2) * 5;
        ctx.globalAlpha = 0.6 + Math.sin(time * 3 + i) * 0.2;
        ctx.fill();
      }
      
      ctx.restore();
    };
    
    // Draw cosmic landscape with nebulae and energy flows
    const drawCosmicLandscape = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.save();
      
      // Draw nebula clouds
      drawNebulaClouds(ctx, width, height);
      
      // Draw cosmic energy flows
      drawCosmicEnergyFlows(ctx, width, height);
      
      // Draw distant stars
      drawStarfield(ctx, width, height);
      
      ctx.restore();
    };
    
    // Draw nebula clouds
    const drawNebulaClouds = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const time = timeRef.current;
      const cloudCount = 3;
      
      ctx.save();
      
      for (let i = 0; i < cloudCount; i++) {
        const size = width * (0.3 + (i / cloudCount) * 0.4);
        const x = width * (0.2 + (i / cloudCount) * 0.6);
        const y = height * (0.3 + (i / cloudCount) * 0.4);
        
        // Create cloud gradient
        const gradient = ctx.createRadialGradient(
          x, y, 0,
          x, y, size
        );
        
        // Cloud colors with animation
        const baseColor = i % 2 === 0 ? colors.primary : colors.accent;
        const animFactor = 0.1 + Math.sin(time * 0.5 + i) * 0.05;
        
        gradient.addColorStop(0, shiftColor(baseColor, animFactor) + 'aa');
        gradient.addColorStop(0.6, shiftColor(colors.secondary, -animFactor) + '55');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        
        // Draw nebula cloud with distortion
        ctx.beginPath();
        for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
          const distortion = Math.sin(angle * 5 + time + i) * 0.2;
          const radius = size * (1 + distortion);
          
          const cloudX = x + Math.cos(angle) * radius;
          const cloudY = y + Math.sin(angle) * radius;
          
          if (angle === 0) {
            ctx.moveTo(cloudX, cloudY);
          } else {
            ctx.lineTo(cloudX, cloudY);
          }
        }
        
        ctx.closePath();
        ctx.globalAlpha = 0.7;
        ctx.fill();
      }
      
      ctx.restore();
    };
    
    // Draw cosmic energy flows
    const drawCosmicEnergyFlows = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const time = timeRef.current;
      const flowCount = 5;
      
      ctx.save();
      
      for (let i = 0; i < flowCount; i++) {
        const startX = width * (0.2 + (i / flowCount) * 0.6);
        const startY = height * 0.2;
        
        ctx.strokeStyle = shiftColor(colors.accent, Math.sin(time + i) * 0.2);
        ctx.lineWidth = 2;
        ctx.shadowColor = colors.accent;
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        
        // Create flowing cosmic energy
        const pointCount = 20;
        for (let j = 1; j <= pointCount; j++) {
          const t = j / pointCount;
          const amplitude = width * 0.2 * (1 - t); // Decreasing amplitude
          
          const x = startX + Math.sin(t * 10 + time * 2 + i) * amplitude;
          const y = startY + t * height * 0.6;
          
          ctx.lineTo(x, y);
        }
        
        // Animate opacity
        ctx.globalAlpha = 0.5 + Math.sin(time * 3 + i) * 0.3;
        ctx.stroke();
      }
      
      ctx.restore();
    };
    
    // Draw starfield for cosmic and galactic landscapes
    const drawStarfield = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const time = timeRef.current;
      const starCount = 200;
      
      ctx.save();
      
      for (let i = 0; i < starCount; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height * 0.7; // Stars in upper part
        const size = Math.random() * 2 + 1;
        
        // Star twinkle effect
        const twinkle = 0.5 + Math.sin(time * 3 + i * 0.5) * 0.5;
        
        // Star color based on size
        let starColor;
        if (size > 2) {
          // Colorful stars
          const hue = (i * 30) % 360;
          starColor = `hsla(${hue}, 80%, 80%, ${twinkle})`;
        } else {
          // White stars
          starColor = `rgba(255, 255, 255, ${twinkle})`;
        }
        
        ctx.fillStyle = starColor;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow to larger stars
        if (size > 1.8) {
          ctx.shadowColor = starColor;
          ctx.shadowBlur = 5;
          ctx.fill();
        }
      }
      
      ctx.restore();
    };
    
    // Draw galactic landscape with spiral galaxy and planetary bodies
    const drawGalacticLandscape = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.save();
      
      // Draw starfield background
      drawStarfield(ctx, width, height);
      
      // Draw spiral galaxy
      drawSpiralGalaxy(ctx, width, height);
      
      // Draw distant planets
      drawPlanets(ctx, width, height);
      
      ctx.restore();
    };
    
    // Draw spiral galaxy
    const drawSpiralGalaxy = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const time = timeRef.current;
      const centerX = width * 0.5;
      const centerY = height * 0.4;
      const galaxySize = width * 0.3;
      
      ctx.save();
      
      // Galaxy core glow
      const coreGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, galaxySize * 0.2
      );
      
      coreGradient.addColorStop(0, colors.accent);
      coreGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, galaxySize * 0.2, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw spiral arms
      const armCount = 3;
      const particlesPerArm = 300;
      
      for (let arm = 0; arm < armCount; arm++) {
        const armOffset = (arm / armCount) * Math.PI * 2;
        
        for (let i = 0; i < particlesPerArm; i++) {
          const distance = (i / particlesPerArm) * galaxySize;
          const angle = armOffset + (i / particlesPerArm) * Math.PI * 4 + time * 0.05;
          
          // Apply spiral shape with distance-based rotation
          const x = centerX + Math.cos(angle) * distance;
          const y = centerY + Math.sin(angle) * distance;
          
          // Particle size and opacity based on distance from center
          const particleSize = 1 + (1 - i / particlesPerArm) * 2;
          const alpha = 0.8 * (1 - (i / particlesPerArm) * 0.7);
          
          // Determine color
          let particleColor;
          if (arm === 0) {
            particleColor = shiftColor(colors.accent, 0.2);
          } else if (arm === 1) {
            particleColor = shiftColor(colors.primary, 0.1);
          } else {
            particleColor = shiftColor(colors.secondary, 0.1);
          }
          
          // Draw star in the spiral arm
          ctx.globalAlpha = alpha;
          ctx.fillStyle = particleColor;
          ctx.beginPath();
          ctx.arc(x, y, particleSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      ctx.restore();
    };
    
    // Draw planets
    const drawPlanets = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const time = timeRef.current;
      const planetCount = 3;
      
      ctx.save();
      
      for (let i = 0; i < planetCount; i++) {
        // Planet position with subtle animation
        const orbitRadius = width * (0.2 + (i / planetCount) * 0.3);
        const orbitSpeed = 0.05 / (i + 1);
        const orbitAngle = time * orbitSpeed + (i / planetCount) * Math.PI * 2;
        
        const x = width * 0.5 + Math.cos(orbitAngle) * orbitRadius;
        const y = height * 0.5 + Math.sin(orbitAngle) * orbitRadius * 0.4;
        
        const planetSize = width * (0.02 + (i / planetCount) * 0.03);
        
        // Create planet gradient
        const planetGradient = ctx.createRadialGradient(
          x - planetSize * 0.3, y - planetSize * 0.3, 0,
          x, y, planetSize
        );
        
        // Different colors for each planet
        if (i === 0) {
          // Earth-like
          planetGradient.addColorStop(0, shiftColor(colors.accent, 0.3));
          planetGradient.addColorStop(1, shiftColor(colors.primary, -0.1));
        } else if (i === 1) {
          // Gas giant
          planetGradient.addColorStop(0, shiftColor(colors.secondary, 0.2));
          planetGradient.addColorStop(0.7, shiftColor(colors.primary, 0.1));
          planetGradient.addColorStop(1, shiftColor(colors.primary, -0.2));
        } else {
          // Rocky planet
          planetGradient.addColorStop(0, shiftColor(colors.accent, -0.1));
          planetGradient.addColorStop(1, shiftColor(colors.secondary, -0.2));
        }
        
        // Draw planet
        ctx.fillStyle = planetGradient;
        ctx.beginPath();
        ctx.arc(x, y, planetSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Add ring to middle planet
        if (i === 1) {
          drawPlanetRing(ctx, x, y, planetSize);
        }
      }
      
      ctx.restore();
    };
    
    // Draw rings around a planet
    const drawPlanetRing = (ctx: CanvasRenderingContext2D, x: number, y: number, planetSize: number) => {
      const time = timeRef.current;
      const ringWidth = planetSize * 1.5;
      
      ctx.save();
      
      // Create ring gradient
      const ringGradient = ctx.createLinearGradient(
        x - ringWidth, y,
        x + ringWidth, y
      );
      
      ringGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      ringGradient.addColorStop(0.2, shiftColor(colors.accent, 0.1) + '80');
      ringGradient.addColorStop(0.5, shiftColor(colors.secondary, 0.2) + 'a0');
      ringGradient.addColorStop(0.8, shiftColor(colors.accent, 0.1) + '80');
      ringGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      // Draw elliptical ring
      ctx.strokeStyle = ringGradient;
      ctx.lineWidth = planetSize * 0.2;
      
      // Apply rotation for 3D effect
      ctx.translate(x, y);
      ctx.rotate(Math.sin(time * 0.1) * 0.2);
      ctx.scale(1, 0.3); // Make the circle appear as an ellipse
      
      ctx.beginPath();
      ctx.arc(0, 0, planetSize * 1.8, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.restore();
    };
    
    // Draw default landscape with gentle hills and atmosphere
    const drawDefaultLandscape = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.save();
      
      // Draw gentle hills
      const hillLayers = 3;
      
      for (let layer = 0; layer < hillLayers; layer++) {
        const baseline = height * (0.6 + layer * 0.1);
        const amplitude = height * 0.1 * (1 - layer * 0.2);
        
        // Hill gradient
        const gradient = ctx.createLinearGradient(0, baseline - amplitude, 0, height);
        gradient.addColorStop(0, shiftColor(colors.secondary, -0.1 * layer));
        gradient.addColorStop(1, shiftColor(colors.primary, -0.15 * layer));
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(0, height);
        
        // Draw smooth hills
        for (let x = 0; x <= width; x += 10) {
          const frequency = 0.003 * (layer + 1);
          const hillHeight = Math.sin(x * frequency + timeRef.current * 0.2 + layer) * amplitude;
          const y = baseline - hillHeight;
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
      }
      
      // Draw atmospheric haze
      const hazeGradient = ctx.createLinearGradient(0, 0, 0, height * 0.6);
      hazeGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      hazeGradient.addColorStop(1, colors.secondary + '30');
      
      ctx.fillStyle = hazeGradient;
      ctx.fillRect(0, 0, width, height * 0.6);
      
      ctx.restore();
    };
    
    // Draw atmospheric effects like light rays, fog or dust
    const drawAtmosphericEffects = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const time = timeRef.current;
      
      ctx.save();
      
      if (soundscapeType === 'cosmic' || soundscapeType === 'galactic') {
        // Space dust particles
        const dustCount = 300;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        
        for (let i = 0; i < dustCount; i++) {
          const x = Math.random() * width;
          const y = Math.random() * height;
          const size = Math.random() * 1;
          
          ctx.globalAlpha = Math.random() * 0.2;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (soundscapeType === 'peaceful') {
        // Gentle floating particles (pollen/seeds)
        const particleCount = 40;
        
        for (let i = 0; i < particleCount; i++) {
          const x = width * Math.sin(time * 0.2 + i) * 0.5 + width * 0.5;
          const y = height * 0.7 - i * (height * 0.01) + Math.sin(time + i) * 20;
          const size = 1 + Math.random() * 2;
          
          ctx.globalAlpha = 0.3 + Math.sin(time + i) * 0.1;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (soundscapeType === 'dramatic') {
        // Ash particles
        const ashCount = 100;
        
        for (let i = 0; i < ashCount; i++) {
          const x = (width * i / ashCount + time * 5) % width;
          const y = (height * 0.5 + i * 5 + Math.sin(time + i) * 20) % height;
          const size = 1 + Math.random() * 2;
          
          ctx.globalAlpha = 0.2 + Math.random() * 0.1;
          ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (soundscapeType === 'mysterious') {
        // Fog wisps
        const wispCount = 5;
        
        for (let i = 0; i < wispCount; i++) {
          const startX = width * (i / wispCount);
          const startY = height * 0.6 + Math.sin(time * 0.5 + i) * 50;
          
          const gradient = ctx.createLinearGradient(
            startX, startY,
            startX + width * 0.2, startY
          );
          
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
          gradient.addColorStop(0.5, `rgba(255, 255, 255, ${0.1 + Math.sin(time + i) * 0.05})`);
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          
          ctx.fillStyle = gradient;
          ctx.fillRect(startX, startY, width * 0.2, 20 + Math.sin(time * 0.7 + i) * 10);
        }
      }
      
      ctx.restore();
    };
    
    // Apply post-processing effects for enhanced visuals
    const applyPostProcessing = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.save();
      
      // Vignette effect
      const vignetteGradient = ctx.createRadialGradient(
        width * 0.5, height * 0.5, 0,
        width * 0.5, height * 0.5, width * 0.7
      );
      
      vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignetteGradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
      
      ctx.fillStyle = vignetteGradient;
      ctx.fillRect(0, 0, width, height);
      
      // Add subtle color overlay based on soundscape
      let overlayColor;
      let opacity;
      
      switch (soundscapeType) {
        case 'peaceful':
          overlayColor = 'rgba(100, 200, 255, 0.1)';
          opacity = 0.05;
          break;
        case 'mysterious':
          overlayColor = 'rgba(100, 50, 150, 0.15)';
          opacity = 0.1;
          break;
        case 'dramatic':
          overlayColor = 'rgba(255, 100, 50, 0.1)';
          opacity = 0.08;
          break;
        case 'cosmic':
          overlayColor = 'rgba(50, 0, 100, 0.15)';
          opacity = 0.12;
          break;
        case 'galactic':
          overlayColor = 'rgba(0, 0, 50, 0.2)';
          opacity = 0.15;
          break;
        default:
          overlayColor = 'rgba(0, 50, 100, 0.1)';
          opacity = 0.05;
      }
      
      // Apply color tint
      ctx.globalAlpha = opacity + Math.sin(timeRef.current * 0.5) * 0.03;
      ctx.fillStyle = overlayColor;
      ctx.fillRect(0, 0, width, height);
      
      ctx.restore();
    };
    
    // Shift a hex color by a percentage amount
    const shiftColor = (hexColor: string, shift: number): string => {
      // Parse the color
      const r = parseInt(hexColor.slice(1, 3), 16);
      const g = parseInt(hexColor.slice(3, 5), 16);
      const b = parseInt(hexColor.slice(5, 7), 16);
      
      // Apply shift (positive brightens, negative darkens)
      const newR = Math.min(255, Math.max(0, Math.round(r * (1 + shift))));
      const newG = Math.min(255, Math.max(0, Math.round(g * (1 + shift))));
      const newB = Math.min(255, Math.max(0, Math.round(b * (1 + shift))));
      
      // Convert back to hex
      return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    };
    
    // Animation loop
    const animate = () => {
      drawScene();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Start or stop animation based on active state
    if (isActive) {
      generateTerrainData();
      initializeParticles();
      animate();
    }
    
    // Clean up
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
      style={{ display: 'block' }}
    />
  );
};

export default EnhancedLandscapeCanvas;