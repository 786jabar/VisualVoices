import { useRef, useState, useEffect } from 'react';

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
 */
export function use3DVisualization(options: Visualization3DOptions) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const particles3DRef = useRef<Particle3D[]>([]);
  const mountainsRef = useRef<MountainPoint[]>([]);
  const optionsRef = useRef(options);
  
  // Animation parameters
  const [rotation, setRotation] = useState(0);
  const [cameraHeight, setCameraHeight] = useState(0);
  
  // Track if component is mounted
  const isMountedRef = useRef(true);
  
  // Update options ref when they change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);
  
  // Convert 3D coordinates to 2D screen coordinates
  const project3D = (x: number, y: number, z: number, canvas: HTMLCanvasElement) => {
    // Simple perspective projection
    const fov = 250; // Field of view
    const viewZ = 400; // Camera distance
    
    // Calculate perspective
    const scale = fov / (viewZ + z);
    
    // Convert to screen coordinates (centered)
    const screenX = canvas.width / 2 + x * scale;
    const screenY = canvas.height / 2 + y * scale;
    
    return { screenX, screenY, scale };
  };
  
  // Setup and manage canvas for 3D visualization
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
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        container.appendChild(canvas);
        canvasRef.current = canvas;
      }
      
      // Set canvas size to match container
      const canvas = canvasRef.current;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      
      // Initialize 3D elements
      initializeParticles();
      initializeTerrain();
      
      console.log('3D visualization canvas initialized');
    };
    
    // Create 3D particles based on current settings
    const initializeParticles = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const { sentiment, sentimentScore, text } = optionsRef.current;
      particles3DRef.current = [];
      
      // Calculate number of particles based on text length
      const particleCount = Math.min(Math.max(100, text.length * 2), 300);
      
      for (let i = 0; i < particleCount; i++) {
        // Generate particles in 3D space
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 400;
        const height = (Math.random() - 0.5) * 300;
        
        // Get color based on sentiment
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
        
        // Random rotation for 3D effect
        const rotation = Math.random() * Math.PI * 2;
        const rotationSpeed = (Math.random() - 0.5) * 0.03;
        
        // Create 3D particle
        particles3DRef.current.push({
          x: Math.cos(angle) * radius,
          y: height,
          z: Math.sin(angle) * radius,
          vx: (Math.random() - 0.5) * 1,
          vy: (Math.random() - 0.5) * 0.5,
          vz: (Math.random() - 0.5) * 1,
          size: Math.random() * 8 + 3,
          color: `rgba(${r}, ${g}, ${b}, ${alpha})`,
          alpha,
          rotation,
          rotationSpeed
        });
      }
    };
    
    // Initialize 3D terrain based on sentiment
    const initializeTerrain = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const { sentiment, sentimentScore } = optionsRef.current;
      mountainsRef.current = [];
      
      // Create a grid of points for the terrain
      const gridSize = 20;
      const terrainSize = 1000;
      const spacing = terrainSize / gridSize;
      
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          const x = (i - gridSize / 2) * spacing;
          const z = (j - gridSize / 2) * spacing;
          
          // Calculate height based on position and sentiment
          let height = 0;
          
          if (sentiment === 'Positive') {
            // Gentle, rolling hills for positive sentiment
            height = Math.sin(i / 5) * 50 + Math.cos(j / 5) * 50 + (Math.random() * 20);
            height *= (sentimentScore + 0.5);
          } else if (sentiment === 'Negative') {
            // Jagged, sharp peaks for negative sentiment
            height = (Math.random() * 100 - 30) * Math.abs(sentimentScore);
            if (Math.random() > 0.7) height *= 2; // Occasional sharp peaks
          } else {
            // Moderate, varied terrain for neutral
            height = (Math.sin(i / 8) * Math.cos(j / 8)) * 70 + (Math.random() * 30 - 15);
          }
          
          // Get color based on height and sentiment
          let color;
          if (sentiment === 'Positive') {
            // Greens and blues for positive
            const g = 150 + height / 2;
            const b = 100 + height / 3;
            color = `rgb(50, ${g}, ${b})`;
          } else if (sentiment === 'Negative') {
            // Reds and purples for negative
            const r = 150 + height / 2;
            const b = 100 + height / 4;
            color = `rgb(${r}, 40, ${b})`;
          } else {
            // Blues and purples for neutral
            const b = 180 + height / 3;
            const g = 100 + height / 4;
            color = `rgb(70, ${g}, ${b})`;
          }
          
          // Add point to terrain
          mountainsRef.current.push({
            x,
            y: height,
            z,
            height,
            color
          });
        }
      }
    };
    
    // Draw the 3D scene
    const draw3DScene = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update camera and scene parameters
      const { motion } = optionsRef.current;
      
      if (motion) {
        // Slowly rotate the scene for motion effect
        setRotation(prev => (prev + 0.003) % (Math.PI * 2));
        
        // Gentle camera height oscillation
        setCameraHeight(Math.sin(Date.now() / 5000) * 50);
      }
      
      // Sort terrain points by distance for painter's algorithm (furthest first)
      const sortedTerrain = [...mountainsRef.current].sort((a, b) => {
        // Apply rotation to calculate actual position
        const aRotX = a.x * Math.cos(rotation) - a.z * Math.sin(rotation);
        const aRotZ = a.x * Math.sin(rotation) + a.z * Math.cos(rotation);
        const bRotX = b.x * Math.cos(rotation) - b.z * Math.sin(rotation);
        const bRotZ = b.x * Math.sin(rotation) + b.z * Math.cos(rotation);
        
        // Calculate distance (z is depth)
        return bRotZ - aRotZ;
      });
      
      // Draw terrain
      drawTerrain(ctx, sortedTerrain);
      
      // Sort particles by distance (furthest first)
      const sortedParticles = [...particles3DRef.current].sort((a, b) => {
        // Apply rotation to calculate actual position
        const aRotX = a.x * Math.cos(rotation) - a.z * Math.sin(rotation);
        const aRotZ = a.x * Math.sin(rotation) + a.z * Math.cos(rotation);
        const bRotX = b.x * Math.cos(rotation) - b.z * Math.sin(rotation);
        const bRotZ = b.x * Math.sin(rotation) + b.z * Math.cos(rotation);
        
        // Calculate distance (z is depth)
        return bRotZ - aRotZ;
      });
      
      // Draw particles
      drawParticles(ctx, sortedParticles);
      
      // Update particle positions if motion is enabled
      if (motion) {
        updateParticles();
      }
    };
    
    // Draw 3D terrain with color and lighting
    const drawTerrain = (ctx: CanvasRenderingContext2D, terrain: MountainPoint[]) => {
      // Drawing terrain as connected triangles for better 3D effect
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Calculate a grid size assuming terrain is a square grid
      const gridSize = Math.sqrt(terrain.length);
      
      // Draw terrain triangles
      for (let i = 0; i < gridSize - 1; i++) {
        for (let j = 0; j < gridSize - 1; j++) {
          // Get the four corners of a grid cell
          const index = i * gridSize + j;
          const topLeft = terrain[index];
          const topRight = terrain[index + 1];
          const bottomLeft = terrain[index + gridSize];
          const bottomRight = terrain[index + gridSize + 1];
          
          // Skip if any point is missing
          if (!topLeft || !topRight || !bottomLeft || !bottomRight) continue;
          
          // Apply rotation to each point
          const rotatePoint = (point: MountainPoint) => {
            const x = point.x * Math.cos(rotation) - point.z * Math.sin(rotation);
            const z = point.x * Math.sin(rotation) + point.z * Math.cos(rotation);
            const y = point.y + cameraHeight; // Apply camera height offset
            
            return { x, y, z, color: point.color };
          };
          
          const tl = rotatePoint(topLeft);
          const tr = rotatePoint(topRight);
          const bl = rotatePoint(bottomLeft);
          const br = rotatePoint(bottomRight);
          
          // Project 3D points to 2D
          const tlp = project3D(tl.x, tl.y, tl.z, canvas);
          const trp = project3D(tr.x, tr.y, tr.z, canvas);
          const blp = project3D(bl.x, bl.y, bl.z, canvas);
          const brp = project3D(br.x, br.y, br.z, canvas);
          
          // Draw the two triangles that make up this grid cell
          // Triangle 1: top-left, bottom-left, bottom-right
          ctx.beginPath();
          ctx.moveTo(tlp.screenX, tlp.screenY);
          ctx.lineTo(blp.screenX, blp.screenY);
          ctx.lineTo(brp.screenX, brp.screenY);
          ctx.closePath();
          
          // Fill with gradient for better 3D effect
          const gradient1 = ctx.createLinearGradient(
            tlp.screenX, tlp.screenY,
            brp.screenX, brp.screenY
          );
          gradient1.addColorStop(0, topLeft.color);
          gradient1.addColorStop(1, bottomRight.color);
          ctx.fillStyle = gradient1;
          ctx.fill();
          
          // Triangle 2: top-left, bottom-right, top-right
          ctx.beginPath();
          ctx.moveTo(tlp.screenX, tlp.screenY);
          ctx.lineTo(brp.screenX, brp.screenY);
          ctx.lineTo(trp.screenX, trp.screenY);
          ctx.closePath();
          
          // Fill with gradient
          const gradient2 = ctx.createLinearGradient(
            tlp.screenX, tlp.screenY,
            brp.screenX, brp.screenY
          );
          gradient2.addColorStop(0, topLeft.color);
          gradient2.addColorStop(1, bottomRight.color);
          ctx.fillStyle = gradient2;
          ctx.fill();
        }
      }
    };
    
    // Draw 3D particles with perspective
    const drawParticles = (ctx: CanvasRenderingContext2D, particles: Particle3D[]) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      particles.forEach(particle => {
        // Apply rotation to particle
        const x = particle.x * Math.cos(rotation) - particle.z * Math.sin(rotation);
        const z = particle.x * Math.sin(rotation) + particle.z * Math.cos(rotation);
        const y = particle.y + cameraHeight; // Apply camera height offset
        
        // Project to 2D space
        const { screenX, screenY, scale } = project3D(x, y, z, canvas);
        
        // Skip if off screen
        if (screenX < -50 || screenX > canvas.width + 50 || 
            screenY < -50 || screenY > canvas.height + 50) {
          return;
        }
        
        // Calculate size based on distance (perspective)
        const size = particle.size * scale;
        
        // Skip if too small
        if (size < 0.5) return;
        
        // Apply particle rotation
        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.rotate(particle.rotation);
        
        // Draw particle
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.alpha * Math.min(1, scale * 2); // Fade out distant particles
        
        // Draw different shapes based on particle type
        const particleType = Math.floor(particle.size) % 4;
        
        if (particleType === 0) {
          // Circle
          ctx.beginPath();
          ctx.arc(0, 0, size, 0, Math.PI * 2);
          ctx.fill();
        } else if (particleType === 1) {
          // Square
          ctx.fillRect(-size/2, -size/2, size, size);
        } else if (particleType === 2) {
          // Triangle
          ctx.beginPath();
          ctx.moveTo(0, -size/2);
          ctx.lineTo(size/2, size/2);
          ctx.lineTo(-size/2, size/2);
          ctx.closePath();
          ctx.fill();
        } else {
          // Star
          drawStar(ctx, 0, 0, size, size/2, 5);
        }
        
        ctx.restore();
        ctx.globalAlpha = 1;
      });
    };
    
    // Draw a star shape
    const drawStar = (
      ctx: CanvasRenderingContext2D, 
      x: number, 
      y: number, 
      outerRadius: number, 
      innerRadius: number, 
      points: number
    ) => {
      ctx.beginPath();
      for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / points;
        ctx.lineTo(
          x + radius * Math.sin(angle),
          y + radius * Math.cos(angle)
        );
      }
      ctx.closePath();
      ctx.fill();
    };
    
    // Update particle positions and rotations
    const updateParticles = () => {
      particles3DRef.current.forEach(particle => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.z += particle.vz;
        
        // Update rotation
        particle.rotation += particle.rotationSpeed;
        
        // Contain particles within bounds
        const bound = 500;
        if (Math.abs(particle.x) > bound) particle.vx *= -1;
        if (Math.abs(particle.y) > bound/2) particle.vy *= -1;
        if (Math.abs(particle.z) > bound) particle.vz *= -1;
      });
    };
    
    // Animation loop
    const animate = () => {
      draw3DScene();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      
      canvasRef.current.width = containerRef.current.clientWidth;
      canvasRef.current.height = containerRef.current.clientHeight;
    };
    
    // Set up resize listener
    window.addEventListener('resize', handleResize);
    
    // Initialize canvas and start animation
    setupCanvas();
    animate();
    
    // Cleanup
    return () => {
      isMountedRef.current = false;
      window.removeEventListener('resize', handleResize);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [rotation, cameraHeight]);
  
  // Function to save canvas to image
  const saveCanvas = async (): Promise<string> => {
    return new Promise((resolve) => {
      if (!canvasRef.current) {
        resolve('');
        return;
      }
      
      try {
        // Get canvas data URL
        const dataURL = canvasRef.current.toDataURL('image/png');
        resolve(dataURL);
      } catch (error) {
        console.error('Error saving canvas:', error);
        resolve('');
      }
    });
  };
  
  return {
    containerRef,
    saveCanvas
  };
}