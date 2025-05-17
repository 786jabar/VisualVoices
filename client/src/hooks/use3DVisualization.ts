import { useEffect, useRef, useState, useCallback } from 'react';

interface Visualization3DOptions {
  sentiment: 'Negative' | 'Neutral' | 'Positive';
  sentimentScore: number;
  text: string;
  motion: boolean;
  colorIntensity: boolean;
}

interface Particle3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  color: string;
  alpha: number;
  rotation: number;
  rotationSpeed: number;
}

interface MountainPoint {
  x: number;
  y: number;
  z: number;
  height: number;
  color: string;
}

/**
 * Hook for creating beautiful 3D visualizations using the canvas API
 * Designed to continue animating reliably during speech recording
 */
export function use3DVisualization(options: Visualization3DOptions) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const particles = useRef<Particle3D[]>([]);
  const mountains = useRef<MountainPoint[]>([]);
  const lastRenderTimeRef = useRef<number>(0);
  const isMountedRef = useRef(true);
  
  // Track the camera position for smooth animated movements
  const cameraPositionRef = useRef({ x: 0, y: 0, z: -500 });
  const targetCameraPositionRef = useRef({ x: 0, y: 0, z: -500 });
  
  // Track canvas dimensions
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Generate colors based on sentiment
  const getColors = useCallback(() => {
    const { sentiment, sentimentScore, colorIntensity } = options;
    
    // Base colors
    let primaryColor = '#3a86ff';   // Default blue
    let secondaryColor = '#38b000'; // Default green
    let accentColor = '#ffbe0b';    // Default yellow
    let bgColor = '#001219';        // Default dark blue
    
    // Adjust based on sentiment
    if (sentiment === 'Positive') {
      primaryColor = colorIntensity ? '#00b4d8' : '#8ecae6';   // Bright blue
      secondaryColor = colorIntensity ? '#06d6a0' : '#95d5b2'; // Bright teal
      accentColor = colorIntensity ? '#ffdd00' : '#ffd166';    // Bright yellow
      bgColor = '#023047';                                     // Deep blue bg
    } else if (sentiment === 'Negative') {
      primaryColor = colorIntensity ? '#9b2226' : '#ae2012';   // Dark red
      secondaryColor = colorIntensity ? '#bb3e03' : '#ca6702'; // Dark orange
      accentColor = colorIntensity ? '#ee9b00' : '#e9c46a';    // Gold
      bgColor = '#001219';                                     // Very dark blue-green
    } else {
      // Neutral
      primaryColor = colorIntensity ? '#4895ef' : '#4cc9f0';   // Medium blue
      secondaryColor = colorIntensity ? '#4361ee' : '#4361ee'; // Medium purple
      accentColor = colorIntensity ? '#3f37c9' : '#3a0ca3';    // Deep purple
      bgColor = '#240046';                                     // Deep purple bg
    }
    
    // Adjust intensity based on sentiment score
    const adjustIntensity = (color: string, intensity: number): string => {
      // Parse the hex color to RGB
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      
      // Adjust RGB values based on intensity
      const adjustedR = Math.min(255, Math.max(0, r * intensity));
      const adjustedG = Math.min(255, Math.max(0, g * intensity));
      const adjustedB = Math.min(255, Math.max(0, b * intensity));
      
      // Convert back to hex
      return `#${Math.round(adjustedR).toString(16).padStart(2, '0')}${
        Math.round(adjustedG).toString(16).padStart(2, '0')}${
        Math.round(adjustedB).toString(16).padStart(2, '0')}`;
    };
    
    // Apply intensity based on sentiment score (0.5-1.5 range)
    const intensityFactor = colorIntensity ? 0.8 + Math.abs(sentimentScore) * 0.7 : 1.0;
    
    return {
      primary: adjustIntensity(primaryColor, intensityFactor),
      secondary: adjustIntensity(secondaryColor, intensityFactor),
      accent: adjustIntensity(accentColor, intensityFactor),
      background: bgColor
    };
  }, [options.sentiment, options.sentimentScore, options.colorIntensity]);
  
  // Initialize 3D scene
  const setupScene = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const { width, height } = canvas.getBoundingClientRect();
    
    // Set canvas dimensions to match display size
    canvas.width = width;
    canvas.height = height;
    setDimensions({ width, height });
    
    // Initialize 3D objects
    initializeParticles();
    initializeTerrain();
  }, []);
  
  // 3D projection function
  const project3D = useCallback((x: number, y: number, z: number, canvas: HTMLCanvasElement) => {
    const { width, height } = canvas;
    const fov = 500; // Field of view
    const viewZ = 300; // Viewer position
    
    const scale = fov / (viewZ + z);
    const projectedX = x * scale + width / 2;
    const projectedY = y * scale + height / 2;
    
    return { x: projectedX, y: projectedY, scale };
  }, []);
  
  // Initialize particles based on sentiment
  const initializeParticles = useCallback(() => {
    if (!canvasRef.current) return;
    
    const { sentiment, sentimentScore } = options;
    const canvas = canvasRef.current;
    const { width, height } = canvas;
    const colors = getColors();
    
    // Clear existing particles
    particles.current = [];
    
    // Determine particle count based on sentiment
    let particleCount = 50;
    if (sentiment === 'Positive') {
      particleCount = 100 + Math.floor(sentimentScore * 100);
    } else if (sentiment === 'Negative') {
      particleCount = 30 + Math.floor(Math.abs(sentimentScore) * 50);
    }
    
    // Create new particles
    for (let i = 0; i < particleCount; i++) {
      const particleColors = [colors.primary, colors.secondary, colors.accent];
      const color = particleColors[Math.floor(Math.random() * particleColors.length)];
      
      particles.current.push({
        x: (Math.random() - 0.5) * width * 2,
        y: (Math.random() - 0.5) * height * 2,
        z: Math.random() * 1000 - 800,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        vz: Math.random() * 3 + 1,
        size: Math.random() * 8 + 2,
        color,
        alpha: Math.random() * 0.5 + 0.5,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02
      });
    }
  }, [options.sentiment, options.sentimentScore, getColors]);
  
  // Initialize terrain based on sentiment
  const initializeTerrain = useCallback(() => {
    if (!canvasRef.current) return;
    
    const { sentiment, sentimentScore } = options;
    const canvas = canvasRef.current;
    const { width, height } = canvas;
    const colors = getColors();
    
    // Clear existing mountains
    mountains.current = [];
    
    // Set up the terrain grid
    const gridSize = 20;
    const terrainWidth = width * 3;
    const terrainDepth = height * 3;
    
    // Determine mountain characteristics based on sentiment
    let maxHeight = 100;
    let roughness = 0.5;
    
    if (sentiment === 'Positive') {
      // Smoother, rolling hills for positive sentiment
      maxHeight = 120 + sentimentScore * 80;
      roughness = 0.3;
    } else if (sentiment === 'Negative') {
      // Jagged, dramatic peaks for negative sentiment
      maxHeight = 150 + Math.abs(sentimentScore) * 100;
      roughness = 0.7;
    } else {
      // Balanced terrain for neutral sentiment
      maxHeight = 100;
      roughness = 0.5;
    }
    
    // Generate mountain points
    for (let x = -gridSize; x <= gridSize; x++) {
      for (let z = -gridSize; z <= gridSize; z++) {
        const xPos = (x / gridSize) * terrainWidth;
        const zPos = (z / gridSize) * terrainDepth;
        
        // Use coherent noise for terrain height
        const noiseX = x * 0.1;
        const noiseZ = z * 0.1;
        const noise = (Math.sin(noiseX) * Math.cos(noiseZ) + 
                      Math.sin(noiseX * 2) * Math.cos(noiseZ * 2) * 0.5) * 0.5 + 0.5;
        
        // Apply roughness and max height
        const height = noise * maxHeight * Math.pow(Math.random(), roughness);
        
        // Determine color based on height and sentiment
        let color;
        const heightRatio = height / maxHeight;
        
        if (heightRatio < 0.3) {
          color = colors.primary;
        } else if (heightRatio < 0.7) {
          color = colors.secondary;
        } else {
          color = colors.accent;
        }
        
        mountains.current.push({
          x: xPos,
          y: height,
          z: zPos - 800, // Push terrain back in z-space
          height,
          color
        });
      }
    }
  }, [options.sentiment, options.sentimentScore, getColors]);
  
  // Render the 3D scene
  const renderScene = useCallback((time: number) => {
    if (!canvasRef.current || !isMountedRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { width, height } = canvas;
    const colors = getColors();
    const deltaTime = (time - lastRenderTimeRef.current) / 1000;
    lastRenderTimeRef.current = time;
    
    // Update camera position with smooth interpolation
    const cameraPos = cameraPositionRef.current;
    const targetPos = targetCameraPositionRef.current;
    cameraPos.x += (targetPos.x - cameraPos.x) * 0.05;
    cameraPos.y += (targetPos.y - cameraPos.y) * 0.05;
    cameraPos.z += (targetPos.z - cameraPos.z) * 0.05;
    
    // Clear canvas with background
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, width, height);
    
    // Draw starry background
    drawBackground(ctx, width, height);
    
    // Update and draw terrain
    drawTerrain(ctx, width, height);
    
    // Update and draw particles
    updateParticles(deltaTime, width, height);
    drawParticles(ctx, width, height);
    
    // Continue animation loop
    requestRef.current = requestAnimationFrame(renderScene);
  }, [getColors]);
  
  // Draw the starry background
  const drawBackground = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const { sentiment } = options;
    
    // Draw some stars
    const starCount = sentiment === 'Positive' ? 100 : (sentiment === 'Negative' ? 30 : 60);
    
    for (let i = 0; i < starCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height * 0.8; // Stars mainly in upper part
      const size = Math.random() * 2 + 0.5;
      
      // Star color based on sentiment
      let alpha = Math.random() * 0.5 + 0.5;
      
      if (sentiment === 'Positive') {
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      } else if (sentiment === 'Negative') {
        ctx.fillStyle = `rgba(200, 120, 120, ${alpha})`;
      } else {
        ctx.fillStyle = `rgba(200, 200, 255, ${alpha})`;
      }
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      
      // Occasionally draw a bigger glowing star
      if (Math.random() < 0.1) {
        const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
        glow.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, size * 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [options.sentiment]);
  
  // Draw the 3D terrain
  const drawTerrain = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const cameraPos = cameraPositionRef.current;
    
    // Sort mountain points by z-coordinate (painter's algorithm)
    const sortedMountains = [...mountains.current].sort((a, b) => (b.z - a.z));
    
    // Draw the mountains
    for (const mountain of sortedMountains) {
      // Adjust for camera position
      const adjustedX = mountain.x - cameraPos.x;
      const adjustedY = -mountain.y - cameraPos.y; // Flip Y for correct orientation
      const adjustedZ = mountain.z - cameraPos.z;
      
      // Project 3D coordinates to 2D
      const projected = project3D(adjustedX, adjustedY, adjustedZ, canvas);
      
      // Skip if outside screen
      if (projected.x < -100 || projected.x > width + 100 || 
          projected.y < -100 || projected.y > height + 100) {
        continue;
      }
      
      // Calculate size based on distance
      const size = 10 * projected.scale;
      
      // Skip if too small
      if (size < 1) continue;
      
      // Draw mountain point with color gradient
      const gradient = ctx.createRadialGradient(
        projected.x, projected.y, 0,
        projected.x, projected.y, size
      );
      
      gradient.addColorStop(0, mountain.color);
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(projected.x, projected.y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [project3D]);
  
  // Update particle positions
  const updateParticles = useCallback((deltaTime: number, width: number, height: number) => {
    const { motion } = options;
    
    // Skip updates if motion is disabled
    if (!motion) return;
    
    for (const particle of particles.current) {
      // Update position
      particle.x += particle.vx * deltaTime * 30;
      particle.y += particle.vy * deltaTime * 30;
      particle.z += particle.vz * deltaTime * 30;
      
      // Update rotation
      particle.rotation += particle.rotationSpeed * deltaTime * 30;
      
      // Reset particles that go too far
      if (particle.z > 200) {
        particle.z = -800;
        particle.x = (Math.random() - 0.5) * width * 2;
        particle.y = (Math.random() - 0.5) * height * 2;
      }
    }
  }, [options.motion]);
  
  // Draw the 3D particles
  const drawParticles = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const cameraPos = cameraPositionRef.current;
    
    // Sort particles by z-coordinate (painter's algorithm)
    const sortedParticles = [...particles.current].sort((a, b) => (b.z - a.z));
    
    // Draw the particles
    for (const particle of sortedParticles) {
      // Adjust for camera position
      const adjustedX = particle.x - cameraPos.x;
      const adjustedY = particle.y - cameraPos.y;
      const adjustedZ = particle.z - cameraPos.z;
      
      // Project 3D coordinates to 2D
      const projected = project3D(adjustedX, adjustedY, adjustedZ, canvas);
      
      // Skip if outside screen
      if (projected.x < -50 || projected.x > width + 50 || 
          projected.y < -50 || projected.y > height + 50) {
        continue;
      }
      
      // Calculate size based on distance
      const size = particle.size * projected.scale;
      
      // Skip if too small
      if (size < 0.5) continue;
      
      // Save context for rotation
      ctx.save();
      
      // Translate to particle position, rotate, and draw
      ctx.translate(projected.x, projected.y);
      ctx.rotate(particle.rotation);
      
      // Draw particle with alpha
      ctx.globalAlpha = particle.alpha;
      ctx.fillStyle = particle.color;
      
      // Choose shape based on particle type
      const shapeType = Math.floor(particle.x * particle.y) % 3;
      
      if (shapeType === 0) {
        // Draw circle
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
      } else if (shapeType === 1) {
        // Draw square
        ctx.fillRect(-size, -size, size * 2, size * 2);
      } else {
        // Draw star
        drawStar(ctx, 0, 0, size, size / 2, 5);
      }
      
      ctx.globalAlpha = 1.0;
      ctx.restore();
    }
  }, [project3D]);
  
  // Helper function to draw a star shape
  const drawStar = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, outerRadius: number, innerRadius: number, points: number) => {
    let rot = Math.PI / 2 * 3;
    const step = Math.PI / points;
    
    ctx.beginPath();
    ctx.moveTo(x, y - outerRadius);
    
    for (let i = 0; i < points; i++) {
      ctx.lineTo(x + Math.cos(rot) * outerRadius, y + Math.sin(rot) * outerRadius);
      rot += step;
      ctx.lineTo(x + Math.cos(rot) * innerRadius, y + Math.sin(rot) * innerRadius);
      rot += step;
    }
    
    ctx.lineTo(x, y - outerRadius);
    ctx.closePath();
    ctx.fill();
  }, []);
  
  // Move the camera target based on mouse position
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Calculate mouse position relative to canvas center
    const mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    
    // Update camera target position based on mouse
    targetCameraPositionRef.current.x = mouseX * 100;
    targetCameraPositionRef.current.y = mouseY * 50;
  }, []);
  
  // Handle canvas resize
  const handleResize = useCallback(() => {
    if (!canvasRef.current || !isMountedRef.current) return;
    
    const canvas = canvasRef.current;
    const { width, height } = canvas.getBoundingClientRect();
    
    // Update canvas dimensions
    canvas.width = width;
    canvas.height = height;
    setDimensions({ width, height });
  }, []);
  
  // Setup event listeners
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);
  
  // Initialize and update visualization when parameters change
  useEffect(() => {
    if (!canvasRef.current || !isMountedRef.current) return;
    
    // Setup the scene
    setupScene();
    
    // Add mouse move listener to the canvas
    const canvas = canvasRef.current;
    canvas.addEventListener('mousemove', handleMouseMove);
    
    // Start animation loop
    requestRef.current = requestAnimationFrame(renderScene);
    
    return () => {
      // Clean up
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [
    setupScene, 
    renderScene, 
    handleMouseMove, 
    options.sentiment, 
    options.sentimentScore,
    options.colorIntensity,
    options.motion
  ]);
  
  // Setup cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    };
  }, []);
  
  return { 
    canvasRef,
    dimensions,
    getColors
  };
}