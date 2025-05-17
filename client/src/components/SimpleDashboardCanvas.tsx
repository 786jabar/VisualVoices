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
 * A simplified and stable canvas for dashboard visualization
 * Guaranteed to always display immediately upon initialization
 */
const SimpleDashboardCanvas: React.FC<SimpleDashboardCanvasProps> = ({
  colors,
  soundscapeType,
  isActive
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const timeRef = useRef<number>(0);
  
  // Effect to initialize and cleanup animation
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Ensure canvas size matches container
    const resizeObserver = new ResizeObserver(entries => {
      if (!canvasRef.current) return;
      
      const { width, height } = entries[0].contentRect;
      canvasRef.current.width = width;
      canvasRef.current.height = height;
    });
    
    resizeObserver.observe(canvas.parentElement || canvas);
    
    // Initial size setting
    if (canvas.parentElement) {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    }
    
    // Animation function
    const animate = (time: number) => {
      if (!canvasRef.current || !ctx) return;
      
      // Calculate delta time for smooth animation
      const deltaTime = (time - timeRef.current) / 1000;
      timeRef.current = time;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw landscape based on soundscape type
      if (isActive) {
        drawLandscape(ctx, canvas.width, canvas.height, deltaTime);
      }
      
      // Continue animation loop
      requestRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    if (isActive) {
      requestRef.current = requestAnimationFrame(animate);
    }
    
    // Cleanup
    return () => {
      resizeObserver.disconnect();
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isActive, soundscapeType, colors]);
  
  // Draw landscape based on soundscape type
  const drawLandscape = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    deltaTime: number
  ) => {
    // Choose drawing method based on soundscape type
    switch (soundscapeType) {
      case 'peaceful':
        drawPeacefulLandscape(ctx, width, height, deltaTime);
        break;
      case 'mysterious':
        drawMysteriousLandscape(ctx, width, height, deltaTime);
        break;
      case 'dramatic':
        drawDramaticLandscape(ctx, width, height, deltaTime);
        break;
      case 'cosmic':
        drawCosmicLandscape(ctx, width, height, deltaTime);
        break;
      case 'galactic':
        drawGalacticLandscape(ctx, width, height, deltaTime);
        break;
      case 'cheerful':
        drawCheerfulLandscape(ctx, width, height, deltaTime);
        break;
      case 'melancholic':
        drawMelancholicLandscape(ctx, width, height, deltaTime);
        break;
      default:
        drawDefaultLandscape(ctx, width, height, deltaTime);
    }
  };
  
  // Draw peaceful landscape (mountains, lakes)
  const drawPeacefulLandscape = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    deltaTime: number
  ) => {
    // Create gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, colors.secondary);
    bgGradient.addColorStop(1, colors.primary);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Draw stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height * 0.6;
      const size = Math.random() * 2 + 0.5;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw mountains
    ctx.fillStyle = '#1a2b3c';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.7);
    
    // Create mountain range
    let x = 0;
    while (x < width) {
      const peakHeight = Math.random() * height * 0.3 + height * 0.2;
      const peakWidth = Math.random() * width * 0.2 + width * 0.05;
      
      ctx.lineTo(x + peakWidth / 2, height - peakHeight);
      ctx.lineTo(x + peakWidth, height * 0.7);
      
      x += peakWidth;
    }
    
    ctx.lineTo(width, height * 0.7);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
    
    // Draw lake
    ctx.fillStyle = colors.accent;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.8);
    ctx.lineTo(width, height * 0.8);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
    
    // Draw sun/moon
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(width * 0.8, height * 0.2, width * 0.08, 0, Math.PI * 2);
    ctx.fill();
  };
  
  // Draw mysterious landscape (foggy forest)
  const drawMysteriousLandscape = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    deltaTime: number
  ) => {
    // Dark gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#121212');
    bgGradient.addColorStop(1, colors.primary);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Draw stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height * 0.7;
      const size = Math.random() * 1.5 + 0.2;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw forest silhouette
    for (let i = 0; i < 20; i++) {
      const x = i * (width / 20);
      const treeHeight = Math.random() * height * 0.3 + height * 0.3;
      
      ctx.fillStyle = 'rgba(10, 10, 20, 0.8)';
      ctx.beginPath();
      ctx.moveTo(x, height);
      ctx.lineTo(x, height - treeHeight);
      ctx.lineTo(x + width/40, height - treeHeight);
      ctx.lineTo(x + width/40, height);
      ctx.fill();
    }
    
    // Draw fog
    ctx.fillStyle = 'rgba(80, 90, 120, 0.3)';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.7);
    
    for (let x = 0; x < width; x += 20) {
      const y = height * 0.7 + Math.sin(x / 100 + timeRef.current / 5000) * 20;
      ctx.lineTo(x, y);
    }
    
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
  };
  
  // Draw dramatic landscape (stormy mountains)
  const drawDramaticLandscape = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    deltaTime: number
  ) => {
    // Stormy sky gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#1a1a2e');
    bgGradient.addColorStop(0.5, colors.primary);
    bgGradient.addColorStop(1, colors.secondary);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Draw lightning (occasional)
    if (Math.random() > 0.95) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      
      const startX = Math.random() * width;
      let x = startX;
      let y = 0;
      
      while (y < height * 0.6) {
        x += (Math.random() - 0.5) * 30;
        y += 10 + Math.random() * 20;
        ctx.lineTo(x, y);
      }
      
      ctx.stroke();
    }
    
    // Draw jagged mountains
    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.6);
    
    let x = 0;
    while (x < width) {
      const peakHeight = Math.random() * height * 0.4 + height * 0.1;
      const peakWidth = Math.random() * width * 0.1 + width * 0.03;
      
      ctx.lineTo(x + peakWidth / 2, height - peakHeight);
      ctx.lineTo(x + peakWidth, height * 0.6);
      
      x += peakWidth;
    }
    
    ctx.lineTo(width, height * 0.6);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
    
    // Draw clouds
    for (let i = 0; i < 5; i++) {
      const cloudX = (i * width / 5 + timeRef.current / 100) % width;
      const cloudY = height * 0.2 + i * 20;
      
      ctx.fillStyle = 'rgba(50, 50, 70, 0.6)';
      for (let j = 0; j < 5; j++) {
        ctx.beginPath();
        ctx.arc(cloudX + j * 15, cloudY, 20, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };
  
  // Draw cosmic landscape (nebula)
  const drawCosmicLandscape = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    deltaTime: number
  ) => {
    // Space background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    
    // Draw stars
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 1.5 + 0.5;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw nebula
    const nebulaGradient = ctx.createRadialGradient(
      width / 2, height / 2, 0,
      width / 2, height / 2, height
    );
    
    nebulaGradient.addColorStop(0, 'rgba(120, 0, 120, 0.1)');
    nebulaGradient.addColorStop(0.5, 'rgba(0, 50, 100, 0.05)');
    nebulaGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = nebulaGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Draw cosmic dust clouds
    for (let i = 0; i < 5; i++) {
      const cloudX = width * (0.2 + i * 0.15);
      const cloudY = height * (0.3 + i * 0.1);
      
      const cloudGradient = ctx.createRadialGradient(
        cloudX, cloudY, 0,
        cloudX, cloudY, 100
      );
      
      cloudGradient.addColorStop(0, 'rgba(180, 120, 200, 0.3)');
      cloudGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = cloudGradient;
      ctx.beginPath();
      ctx.arc(cloudX, cloudY, 100, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  
  // Draw galactic landscape (spiral galaxy)
  const drawGalacticLandscape = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    deltaTime: number
  ) => {
    // Space background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    
    // Draw stars
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 300; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 1.2 + 0.3;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw galaxy
    const centerX = width / 2;
    const centerY = height / 2;
    const galaxyRadius = Math.min(width, height) * 0.4;
    
    // Draw galaxy core
    const coreGradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, galaxyRadius * 0.3
    );
    
    coreGradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
    coreGradient.addColorStop(1, 'rgba(255, 200, 100, 0)');
    
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, galaxyRadius * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw spiral arms
    const time = timeRef.current / 10000;
    const armCount = 2;
    
    for (let arm = 0; arm < armCount; arm++) {
      const armAngle = (arm / armCount) * Math.PI * 2 + time;
      
      for (let i = 0; i < galaxyRadius; i += 3) {
        const distance = i / galaxyRadius;
        const angle = armAngle + distance * Math.PI * 4;
        
        const x = centerX + Math.cos(angle) * i;
        const y = centerY + Math.sin(angle) * i;
        
        const size = Math.random() * 2 + 1;
        const opacity = 0.7 - distance * 0.5;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };
  
  // Draw cheerful landscape (sunny meadow)
  const drawCheerfulLandscape = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    deltaTime: number
  ) => {
    // Sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
    skyGradient.addColorStop(0, '#87CEEB');
    skyGradient.addColorStop(1, '#E0F7FA');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Draw sun
    ctx.fillStyle = '#FFEB3B';
    ctx.beginPath();
    ctx.arc(width * 0.8, height * 0.2, width * 0.08, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    
    for (let i = 0; i < 5; i++) {
      const cloudX = ((i * width / 5) + timeRef.current / 200) % width;
      const cloudY = height * 0.3;
      
      // Draw cloud puffs
      for (let j = 0; j < 5; j++) {
        ctx.beginPath();
        ctx.arc(cloudX + j * 20, cloudY + (j % 3) * 10, 20, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Draw meadow
    const grassGradient = ctx.createLinearGradient(0, height * 0.6, 0, height);
    grassGradient.addColorStop(0, '#81C784');
    grassGradient.addColorStop(1, '#2E7D32');
    ctx.fillStyle = grassGradient;
    
    ctx.beginPath();
    ctx.moveTo(0, height * 0.6);
    ctx.lineTo(width, height * 0.7);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
    
    // Draw flowers
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * width;
      const y = height * 0.7 + Math.random() * (height * 0.3);
      
      // Draw stem
      ctx.strokeStyle = '#2E7D32';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y - 20);
      ctx.stroke();
      
      // Draw flower
      ctx.fillStyle = ['#FF5722', '#E91E63', '#9C27B0', '#FFEB3B'][Math.floor(Math.random() * 4)];
      ctx.beginPath();
      ctx.arc(x, y - 20, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  
  // Draw melancholic landscape (rainy scene)
  const drawMelancholicLandscape = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    deltaTime: number
  ) => {
    // Overcast sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
    skyGradient.addColorStop(0, '#37474F');
    skyGradient.addColorStop(1, '#607D8B');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Draw distant hills
    ctx.fillStyle = '#263238';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.7);
    
    for (let x = 0; x < width; x += 50) {
      const y = height * 0.7 + Math.sin(x / 200) * 20;
      ctx.lineTo(x, y);
    }
    
    ctx.lineTo(width, height * 0.7);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
    
    // Draw rain
    ctx.strokeStyle = 'rgba(200, 200, 220, 0.5)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * width;
      const y = (Math.random() * height * 0.7 + timeRef.current / 10) % height;
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 1, y + 10);
      ctx.stroke();
    }
    
    // Draw puddle
    ctx.fillStyle = 'rgba(100, 120, 150, 0.3)';
    ctx.beginPath();
    ctx.ellipse(width * 0.5, height * 0.9, width * 0.3, height * 0.05, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw raindrops in puddle
    for (let i = 0; i < 5; i++) {
      if (Math.random() > 0.7) {
        const x = width * 0.5 + (Math.random() - 0.5) * width * 0.5;
        const y = height * 0.9;
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(x, y, 5 + Math.random() * 10, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  };
  
  // Default landscape when no specific type is matched
  const drawDefaultLandscape = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    deltaTime: number
  ) => {
    // Simple gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, colors.secondary);
    bgGradient.addColorStop(1, colors.primary);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Draw horizon line
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.7);
    ctx.lineTo(width, height * 0.7);
    ctx.stroke();
    
    // Draw simple shapes
    ctx.fillStyle = colors.accent;
    ctx.beginPath();
    ctx.arc(width * 0.5, height * 0.3, 30, 0, Math.PI * 2);
    ctx.fill();
  };
  
  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{
        display: 'block',
        backgroundColor: colors.primary
      }}
    />
  );
};

export default SimpleDashboardCanvas;