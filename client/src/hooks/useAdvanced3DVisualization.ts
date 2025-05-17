import { useEffect, useRef, useState, useCallback } from 'react';

interface Advanced3DVisualizationOptions {
  sentiment: 'Negative' | 'Neutral' | 'Positive';
  sentimentScore: number;
  text: string;
  motion: boolean;
  colorIntensity: boolean;
  interactivity?: boolean; // Optional flag for interactive features
  keepAnimating?: boolean; // Flag to continue animation during voice recording
}

// 3D terrain point
interface TerrainPoint {
  x: number;
  y: number;
  z: number;
  height: number;
  color: string;
  normal: { x: number; y: number; z: number };
}

// 3D particle
interface Particle3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  ax: number;
  ay: number;
  az: number;
  size: number;
  baseSize: number;
  color: string;
  alpha: number;
  rotation: number;
  rotationSpeed: number;
  life: number;
  maxLife: number;
  type: 'dust' | 'star' | 'energy' | 'flare';
}

// Emotion data point for tracking
interface EmotionDataPoint {
  time: number;
  score: number;
  sentiment: 'Negative' | 'Neutral' | 'Positive';
}

// Light source for enhanced shading
interface LightSource {
  x: number;
  y: number;
  z: number;
  intensity: number;
  color: string;
  moving: boolean;
  angle: number;
  radius: number;
}

/**
 * Advanced 3D visualization hook for creating realistic landscapes
 * with enhanced lighting, particle effects, and interactivity
 */
export function useAdvanced3DVisualization(options: Advanced3DVisualizationOptions) {
  // Canvas reference
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Animation frame reference
  const requestRef = useRef<number | null>(null);
  
  // 3D objects
  const particles = useRef<Particle3D[]>([]);
  const terrain = useRef<TerrainPoint[][]>([]);
  const emotionHistory = useRef<EmotionDataPoint[]>([]);
  
  // Camera and viewpoint
  const camera = useRef({
    x: 0,
    y: 100,
    z: -400,
    targetX: 0,
    targetY: 50,
    targetZ: 0,
    rotationX: 0.2,
    rotationY: 0,
    fov: 500
  });
  
  // Lighting system
  const lights = useRef<LightSource[]>([
    {
      x: 200,
      y: 300,
      z: -200,
      intensity: 1.0,
      color: '#ffffff',
      moving: true,
      angle: 0,
      radius: 400
    },
    {
      x: -300,
      y: 200,
      z: -100,
      intensity: 0.6,
      color: '#b3e5fc',
      moving: false,
      angle: 0,
      radius: 0
    }
  ]);
  
  // Mouse interaction state
  const mouse = useRef({
    x: 0,
    y: 0,
    isDown: false,
    lastX: 0,
    lastY: 0
  });
  
  // Fog and atmosphere
  const atmosphere = useRef({
    fogDensity: 0.001,
    fogColor: '#000000',
    skyGradientTop: '#000000',
    skyGradientBottom: '#000000',
    ambientLight: 0.2
  });
  
  // Canvas dimensions
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Animation timing
  const timeRef = useRef({
    lastUpdate: 0,
    elapsed: 0
  });
  
  // Generate color palette based on sentiment
  const getColorPalette = useCallback(() => {
    const { sentiment, sentimentScore, colorIntensity } = options;
    
    // Base colors for each sentiment
    let primary, secondary, accent, ambient, highlight, shadow;
    
    if (sentiment === 'Positive') {
      // Positive: Bright, warm colors
      primary = colorIntensity ? '#00b4d8' : '#8ecae6';     // Bright blue
      secondary = colorIntensity ? '#06d6a0' : '#95d5b2';   // Bright teal
      accent = colorIntensity ? '#ffdd00' : '#ffd166';      // Bright yellow
      ambient = '#023047';                                 // Deep blue
      highlight = '#ffdd00';                               // Golden highlight
      shadow = '#184e77';                                  // Deep blue shadow
    } else if (sentiment === 'Negative') {
      // Negative: Dark, intense colors
      primary = colorIntensity ? '#9b2226' : '#ae2012';     // Dark red
      secondary = colorIntensity ? '#bb3e03' : '#ca6702';   // Dark orange
      accent = colorIntensity ? '#ee9b00' : '#e9c46a';      // Gold accent
      ambient = '#001219';                                 // Very dark blue-green
      highlight = '#f48c06';                               // Amber highlight
      shadow = '#370617';                                  // Deep maroon shadow
    } else {
      // Neutral: Balanced colors
      primary = colorIntensity ? '#4895ef' : '#4cc9f0';     // Medium blue
      secondary = colorIntensity ? '#4361ee' : '#4361ee';   // Medium purple
      accent = colorIntensity ? '#3f37c9' : '#3a0ca3';      // Deep purple
      ambient = '#240046';                                 // Deep purple
      highlight = '#7209b7';                               // Bright purple highlight
      shadow = '#10002b';                                  // Deep violet shadow
    }
    
    // Adjust intensity based on sentiment score (0.5-1.5 range)
    const intensityFactor = colorIntensity ? 0.8 + Math.abs(sentimentScore) * 0.7 : 1.0;
    
    // Update atmosphere colors based on sentiment
    atmosphere.current.fogColor = ambient;
    atmosphere.current.skyGradientTop = primary;
    atmosphere.current.skyGradientBottom = secondary;
    atmosphere.current.fogDensity = sentiment === 'Positive' ? 0.0005 : 
                                   (sentiment === 'Negative' ? 0.002 : 0.001);
    atmosphere.current.ambientLight = sentiment === 'Positive' ? 0.4 : 
                                     (sentiment === 'Negative' ? 0.15 : 0.25);
    
    // Update light colors based on sentiment
    lights.current[0].color = highlight;
    lights.current[0].intensity = sentiment === 'Positive' ? 1.2 : 
                                 (sentiment === 'Negative' ? 0.8 : 1.0);
    lights.current[1].color = accent;
    
    return {
      primary,
      secondary,
      accent,
      ambient,
      highlight,
      shadow,
      intensityFactor
    };
  }, [options.sentiment, options.sentimentScore, options.colorIntensity]);
  
  // Initialize the 3D scene
  const initializeScene = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const { width, height } = canvas.getBoundingClientRect();
    
    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;
    setDimensions({ width, height });
    
    // Initialize 3D terrain
    initializeTerrain();
    
    // Initialize particle systems
    initializeParticles();
    
    // Add current emotion to history
    addEmotionDataPoint();
    
  }, [options.sentiment, options.sentimentScore]);
  
  // Initialize the terrain with advanced features
  const initializeTerrain = useCallback(() => {
    if (!canvasRef.current) return;
    
    const { sentiment, sentimentScore } = options;
    const canvas = canvasRef.current;
    const { width, height } = canvas;
    const colors = getColorPalette();
    
    // Clear existing terrain
    terrain.current = [];
    
    // Determine terrain resolution and characteristics - increased for 4K quality
    const resolution = 60; // Grid size doubled for higher quality
    const terrainWidth = width * 4; // Wider terrain for more detail
    const terrainDepth = height * 4; // Deeper terrain for more detail
    const gridSizeX = terrainWidth / resolution;
    const gridSizeZ = terrainDepth / resolution;
    
    // Terrain characteristics based on sentiment
    let maxHeight, roughness, variation, smoothing;
    
    if (sentiment === 'Positive') {
      // Positive: Smooth rolling hills
      maxHeight = 120 + sentimentScore * 80;
      roughness = 0.25;
      variation = 0.8;
      smoothing = 0.4;
    } else if (sentiment === 'Negative') {
      // Negative: Jagged, dramatic peaks
      maxHeight = 180 + Math.abs(sentimentScore) * 120;
      roughness = 0.7;
      variation = 1.5;
      smoothing = 0.1;
    } else {
      // Neutral: Balanced terrain
      maxHeight = 100;
      roughness = 0.4;
      variation = 1.0;
      smoothing = 0.25;
    }
    
    // Generate Perlin noise-based heightmap
    const terrainNoise = generatePerlinNoise(resolution, resolution, roughness);
    
    // Build terrain
    for (let z = 0; z < resolution; z++) {
      terrain.current[z] = [];
      for (let x = 0; x < resolution; x++) {
        // Calculate position in 3D space
        const posX = (x - resolution/2) * gridSizeX;
        const posZ = (z - resolution/2) * gridSizeZ;
        
        // Get height from noise
        const noiseVal = terrainNoise[z][x];
        
        // Apply variation and maxHeight to get the actual terrain height
        const height = noiseVal * maxHeight * variation;
        
        // Determine color based on height
        let pointColor;
        const heightRatio = noiseVal;
        
        if (heightRatio < 0.4) {
          // Low areas - use primary color
          pointColor = colors.primary;
        } else if (heightRatio < 0.7) {
          // Mid areas - use secondary color
          pointColor = colors.secondary;
        } else {
          // High peaks - use accent color
          pointColor = colors.accent;
        }
        
        // Calculate surface normal for lighting
        const normal = calculateNormal(x, z, terrainNoise, resolution, maxHeight * variation);
        
        // Add terrain point
        terrain.current[z][x] = {
          x: posX,
          y: height,
          z: posZ,
          height,
          color: pointColor,
          normal
        };
      }
    }
    
    // Post-process terrain for smoothing if needed
    if (smoothing > 0) {
      smoothTerrain(smoothing);
    }
    
  }, [options.sentiment, options.sentimentScore, getColorPalette]);
  
  // Generate coherent Perlin noise
  const generatePerlinNoise = useCallback((width: number, height: number, roughness: number) => {
    const noise = Array(height).fill(0).map(() => Array(width).fill(0));
    
    // Initial random seed
    let seed = Math.random() * 1000;
    
    // Recursive function to generate fractal noise
    const generateNoise = (startX: number, startY: number, width: number, height: number, scale: number) => {
      if (width < 2 || height < 2) return;
      
      const halfWidth = Math.floor(width / 2);
      const halfHeight = Math.floor(height / 2);
      
      // Add random displacement scaled by roughness
      for (let y = startY; y < startY + height; y += halfHeight) {
        for (let x = startX; x < startX + width; x += halfWidth) {
          if (x < noise[0].length && y < noise.length) {
            noise[y][x] += (Math.sin(x * 0.1 + seed) * Math.cos(y * 0.1 + seed) + 1) * 0.5 * scale * roughness;
            noise[y][x] = Math.max(0, Math.min(1, noise[y][x])); // Clamp to 0-1
          }
        }
      }
      
      // Recursive subdivision
      generateNoise(startX, startY, halfWidth, halfHeight, scale * 0.5);
      generateNoise(startX + halfWidth, startY, halfWidth, halfHeight, scale * 0.5);
      generateNoise(startX, startY + halfHeight, halfWidth, halfHeight, scale * 0.5);
      generateNoise(startX + halfWidth, startY + halfHeight, halfWidth, halfHeight, scale * 0.5);
    };
    
    // Start the recursive noise generation
    generateNoise(0, 0, width, height, 0.5);
    
    // Normalize the noise values to 0-1 range
    let min = 1, max = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        min = Math.min(min, noise[y][x]);
        max = Math.max(max, noise[y][x]);
      }
    }
    
    // Normalize
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        noise[y][x] = (noise[y][x] - min) / (max - min);
      }
    }
    
    return noise;
  }, []);
  
  // Calculate surface normal at a point for realistic lighting
  const calculateNormal = useCallback((x: number, z: number, heightMap: number[][], resolution: number, maxHeight: number) => {
    const getHeight = (x: number, z: number) => {
      x = Math.max(0, Math.min(resolution - 1, x));
      z = Math.max(0, Math.min(resolution - 1, z));
      return heightMap[z][x] * maxHeight;
    };
    
    // Sample heights at neighboring points
    const hL = getHeight(x - 1, z);
    const hR = getHeight(x + 1, z);
    const hD = getHeight(x, z - 1);
    const hU = getHeight(x, z + 1);
    
    // Calculate the normal using cross product
    const dx = (hL - hR) / 2;
    const dz = (hD - hU) / 2;
    
    // Calculate the normal vector
    const length = Math.sqrt(dx * dx + 1 + dz * dz);
    return {
      x: dx / length,
      y: 1 / length,
      z: dz / length
    };
  }, []);
  
  // Smooth the terrain by averaging neighboring points
  const smoothTerrain = useCallback((factor: number) => {
    if (!terrain.current.length) return;
    
    const resolution = terrain.current.length;
    const smoothed = JSON.parse(JSON.stringify(terrain.current)); // Deep copy
    
    for (let z = 1; z < resolution - 1; z++) {
      for (let x = 1; x < resolution - 1; x++) {
        // Average the height with its neighbors
        let sum = 0;
        let count = 0;
        
        for (let dz = -1; dz <= 1; dz++) {
          for (let dx = -1; dx <= 1; dx++) {
            sum += terrain.current[z + dz][x + dx].height;
            count++;
          }
        }
        
        // Apply smoothing gradually
        const average = sum / count;
        smoothed[z][x].height = terrain.current[z][x].height * (1 - factor) + average * factor;
        
        // Update the normal
        smoothed[z][x].normal = {
          x: (terrain.current[z][x - 1].height - terrain.current[z][x + 1].height) / 2,
          y: 1,
          z: (terrain.current[z - 1][x].height - terrain.current[z + 1][x].height) / 2
        };
        
        // Normalize the normal vector
        const length = Math.sqrt(
          smoothed[z][x].normal.x * smoothed[z][x].normal.x +
          smoothed[z][x].normal.y * smoothed[z][x].normal.y +
          smoothed[z][x].normal.z * smoothed[z][x].normal.z
        );
        
        smoothed[z][x].normal.x /= length;
        smoothed[z][x].normal.y /= length;
        smoothed[z][x].normal.z /= length;
      }
    }
    
    terrain.current = smoothed;
  }, []);
  
  // Initialize particle systems that respond to sentiment
  const initializeParticles = useCallback(() => {
    if (!canvasRef.current) return;
    
    const { sentiment, sentimentScore } = options;
    const canvas = canvasRef.current;
    const { width, height } = canvas;
    const colors = getColorPalette();
    
    // Clear existing particles
    particles.current = [];
    
    // Determine particle count and characteristics based on sentiment
    let particleCount, energyParticleCount, starParticleCount;
    
    if (sentiment === 'Positive') {
      // Positive: More bright particles, stars
      particleCount = 150 + Math.floor(sentimentScore * 100);
      energyParticleCount = 40 + Math.floor(sentimentScore * 30);
      starParticleCount = 80 + Math.floor(sentimentScore * 50);
    } else if (sentiment === 'Negative') {
      // Negative: More dust particles, fewer stars
      particleCount = 100 + Math.floor(Math.abs(sentimentScore) * 80);
      energyParticleCount = 10 + Math.floor(Math.abs(sentimentScore) * 20);
      starParticleCount = 30 + Math.floor(Math.abs(sentimentScore) * 20);
    } else {
      // Neutral: Balanced particles
      particleCount = 120;
      energyParticleCount = 25;
      starParticleCount = 50;
    }
    
    // Create regular dust particles
    for (let i = 0; i < particleCount; i++) {
      createParticle('dust', colors, width, height);
    }
    
    // Create energy particles
    for (let i = 0; i < energyParticleCount; i++) {
      createParticle('energy', colors, width, height);
    }
    
    // Create star particles
    for (let i = 0; i < starParticleCount; i++) {
      createParticle('star', colors, width, height);
    }
    
    // Create a few flare particles
    for (let i = 0; i < 10; i++) {
      createParticle('flare', colors, width, height);
    }
    
  }, [options.sentiment, options.sentimentScore, getColorPalette]);
  
  // Create a single particle with specified type
  const createParticle = useCallback((
    type: 'dust' | 'star' | 'energy' | 'flare',
    colors: ReturnType<typeof getColorPalette>,
    width: number,
    height: number
  ) => {
    let size, speed, color, alpha, life, rotationSpeed;
    
    switch (type) {
      case 'dust':
        // Regular floating dust particles
        size = Math.random() * 3 + 1;
        speed = Math.random() * 0.3 + 0.1;
        color = colors.primary;
        alpha = Math.random() * 0.5 + 0.2;
        life = Math.random() * 200 + 100;
        rotationSpeed = (Math.random() - 0.5) * 0.02;
        break;
        
      case 'energy':
        // Glowing energy particles that move faster
        size = Math.random() * 5 + 2;
        speed = Math.random() * 0.8 + 0.3;
        color = colors.accent;
        alpha = Math.random() * 0.7 + 0.3;
        life = Math.random() * 100 + 50;
        rotationSpeed = (Math.random() - 0.5) * 0.05;
        break;
        
      case 'star':
        // Star-like particles that twinkle
        size = Math.random() * 2 + 0.5;
        speed = Math.random() * 0.1 + 0.05;
        color = colors.highlight;
        alpha = Math.random() * 0.9 + 0.6;
        life = Math.random() * 300 + 200;
        rotationSpeed = Math.random() * 0.03;
        break;
        
      case 'flare':
        // Bright flare particles
        size = Math.random() * 7 + 3;
        speed = Math.random() * 0.4 + 0.2;
        color = colors.highlight;
        alpha = Math.random() * 0.8 + 0.7;
        life = Math.random() * 150 + 50;
        rotationSpeed = Math.random() * 0.1;
        break;
    }
    
    // Create the particle with random position and velocity
    const particle: Particle3D = {
      x: (Math.random() - 0.5) * width * 2,
      y: (Math.random() - 0.5) * height,
      z: Math.random() * 800 - 400,
      vx: (Math.random() - 0.5) * speed * 2,
      vy: (Math.random() - 0.5) * speed,
      vz: Math.random() * speed * 2 - speed,
      ax: 0,
      ay: 0,
      az: 0,
      size,
      baseSize: size,
      color,
      alpha,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed,
      life,
      maxLife: life,
      type
    };
    
    particles.current.push(particle);
  }, [getColorPalette]);
  
  // Add current emotion to history for tracking
  const addEmotionDataPoint = useCallback(() => {
    const { sentiment, sentimentScore } = options;
    
    emotionHistory.current.push({
      time: Date.now(),
      score: sentimentScore,
      sentiment
    });
    
    // Keep only the last 100 data points
    if (emotionHistory.current.length > 100) {
      emotionHistory.current.shift();
    }
  }, [options.sentiment, options.sentimentScore]);
  
  // Project 3D point to 2D screen coordinates
  const project3D = useCallback((x: number, y: number, z: number, canvas: HTMLCanvasElement) => {
    const { width, height } = canvas;
    const cam = camera.current;
    
    // Adjust coordinates relative to camera position
    const dx = x - cam.x;
    const dy = y - cam.y;
    const dz = z - cam.z;
    
    // Apply camera rotation (simplified)
    const cosY = Math.cos(cam.rotationY);
    const sinY = Math.sin(cam.rotationY);
    const cosX = Math.cos(cam.rotationX);
    const sinX = Math.sin(cam.rotationX);
    
    const x1 = cosY * dx - sinY * dz;
    const z1 = sinY * dx + cosY * dz;
    
    const y2 = cosX * dy - sinX * z1;
    const z2 = sinX * dy + cosX * z1;
    
    // Perspective projection
    const scale = cam.fov / (cam.fov + z2);
    const projectedX = x1 * scale + width / 2;
    const projectedY = y2 * scale + height / 2;
    
    // Distance for z-sorting and fog
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    return {
      x: projectedX,
      y: projectedY,
      scale,
      distance,
      visible: z2 > -cam.fov // Only visible if in front of the camera
    };
  }, []);
  
  // Calculate the illumination at a point using all light sources
  const calculateLighting = useCallback((point: TerrainPoint, lights: LightSource[]) => {
    const ambient = atmosphere.current.ambientLight;
    let totalLight = ambient;
    
    // Calculate contribution from each light source
    for (const light of lights) {
      // Vector from point to light
      const lightVec = {
        x: light.x - point.x,
        y: light.y - point.y,
        z: light.z - point.z
      };
      
      // Distance to light
      const distance = Math.sqrt(
        lightVec.x * lightVec.x +
        lightVec.y * lightVec.y +
        lightVec.z * lightVec.z
      );
      
      // Normalize light vector
      const lightDirX = lightVec.x / distance;
      const lightDirY = lightVec.y / distance;
      const lightDirZ = lightVec.z / distance;
      
      // Dot product for diffuse lighting (normal dot light direction)
      const diffuse = point.normal.x * lightDirX +
                      point.normal.y * lightDirY +
                      point.normal.z * lightDirZ;
      
      // Only add light contribution if the surface faces the light
      if (diffuse > 0) {
        // Attenuate light based on distance
        const attenuation = 1 / (1 + 0.0005 * distance * distance);
        
        // Add contribution from this light source
        totalLight += diffuse * light.intensity * attenuation;
      }
    }
    
    // Clamp lighting to a reasonable range
    return Math.min(1.2, Math.max(0.1, totalLight));
  }, []);
  
  // Apply fog effect based on distance
  const applyFog = useCallback((color: string, distance: number) => {
    const fogDensity = atmosphere.current.fogDensity;
    const fogColor = atmosphere.current.fogColor;
    
    // Parse the original color
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    // Parse the fog color
    const fogR = parseInt(fogColor.slice(1, 3), 16);
    const fogG = parseInt(fogColor.slice(3, 5), 16);
    const fogB = parseInt(fogColor.slice(5, 7), 16);
    
    // Calculate fog factor based on distance
    const fogFactor = Math.min(1, Math.exp(-fogDensity * distance));
    
    // Mix the colors based on fog factor
    const mixedR = Math.round(r * fogFactor + fogR * (1 - fogFactor));
    const mixedG = Math.round(g * fogFactor + fogG * (1 - fogFactor));
    const mixedB = Math.round(b * fogFactor + fogB * (1 - fogFactor));
    
    // Convert back to hex
    return `#${mixedR.toString(16).padStart(2, '0')}${mixedG.toString(16).padStart(2, '0')}${mixedB.toString(16).padStart(2, '0')}`;
  }, []);
  
  // Adjust light positions for animation
  const updateLights = useCallback((deltaTime: number) => {
    for (const light of lights.current) {
      if (light.moving) {
        // Update angle for circular motion
        light.angle += deltaTime * 0.2;
        
        // Calculate new position
        light.x = Math.cos(light.angle) * light.radius;
        light.z = Math.sin(light.angle) * light.radius;
      }
    }
  }, []);
  
  // Update particle positions and properties
  const updateParticles = useCallback((deltaTime: number) => {
    if (!options.motion) return;
    
    const { sentiment, sentimentScore } = options;
    
    // Emotional modifiers for particles
    let speedMod, sizeMod, lifeMod;
    if (sentiment === 'Positive') {
      speedMod = 1.2 + sentimentScore * 0.4;
      sizeMod = 1.1 + sentimentScore * 0.3;
      lifeMod = 1.2;
    } else if (sentiment === 'Negative') {
      speedMod = 0.8 + Math.abs(sentimentScore) * 0.5;
      sizeMod = 0.9 + Math.abs(sentimentScore) * 0.2;
      lifeMod = 0.8;
    } else {
      speedMod = 1.0;
      sizeMod = 1.0;
      lifeMod = 1.0;
    }
    
    for (let i = particles.current.length - 1; i >= 0; i--) {
      const p = particles.current[i];
      
      // Update life
      p.life -= deltaTime * 10;
      
      // Remove dead particles
      if (p.life <= 0) {
        particles.current.splice(i, 1);
        continue;
      }
      
      // Apply different behavior based on particle type
      switch (p.type) {
        case 'dust':
          // Basic movement with slight drift
          p.vx += (Math.random() - 0.5) * 0.01;
          p.vy += (Math.random() - 0.5) * 0.01 - 0.002; // slight gravity
          p.vz += (Math.random() - 0.5) * 0.01;
          break;
          
        case 'energy':
          // More erratic movement
          p.vx += (Math.random() - 0.5) * 0.05;
          p.vy += (Math.random() - 0.5) * 0.05;
          p.vz += (Math.random() - 0.5) * 0.05;
          
          // Limit max velocity
          const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy + p.vz * p.vz);
          if (speed > 1.5) {
            p.vx = (p.vx / speed) * 1.5;
            p.vy = (p.vy / speed) * 1.5;
            p.vz = (p.vz / speed) * 1.5;
          }
          break;
          
        case 'star':
          // Minimal movement, mostly twinkling
          p.vx *= 0.98;
          p.vy *= 0.98;
          p.vz *= 0.98;
          
          // Twinkle by varying size
          p.size = p.baseSize * (0.8 + Math.sin(Date.now() * 0.005 + i) * 0.4);
          break;
          
        case 'flare':
          // Flashy movement
          p.vx += (Math.random() - 0.5) * 0.03;
          p.vy += (Math.random() - 0.5) * 0.03;
          p.vz += (Math.random() - 0.5) * 0.03;
          
          // Pulsate size
          p.size = p.baseSize * (0.7 + Math.sin(Date.now() * 0.01 + i * 0.5) * 0.5);
          break;
      }
      
      // Apply velocity modifiers based on sentiment
      p.vx *= speedMod;
      p.vy *= speedMod;
      p.vz *= speedMod;
      
      // Update position
      p.x += p.vx * deltaTime * 30;
      p.y += p.vy * deltaTime * 30;
      p.z += p.vz * deltaTime * 30;
      
      // Update rotation
      p.rotation += p.rotationSpeed * deltaTime * 30;
      
      // Apply size modifier
      p.size = p.baseSize * sizeMod * (0.5 + p.life / p.maxLife * 0.5);
      
      // Boundary checks - wrap around for continuous effect
      const bound = 1000;
      if (p.x < -bound) p.x = bound;
      if (p.x > bound) p.x = -bound;
      if (p.y < -bound) p.y = bound;
      if (p.y > bound) p.y = -bound;
      if (p.z < -bound) p.z = bound;
      if (p.z > bound) p.z = -bound;
    }
    
    // Create new particles to replace the ones that died
    const colors = getColorPalette();
    if (!canvasRef.current) return;
    const { width, height } = canvasRef.current;
    
    // Add new particles based on sentiment intensity
    const newParticleCount = Math.round(deltaTime * 20 * Math.abs(sentimentScore) * lifeMod);
    
    for (let i = 0; i < newParticleCount; i++) {
      // Determine particle type based on sentiment
      let type: 'dust' | 'star' | 'energy' | 'flare';
      
      if (sentiment === 'Positive') {
        // More energetic and bright particles for positive
        const rand = Math.random();
        type = rand < 0.4 ? 'energy' : 
               rand < 0.7 ? 'star' : 
               rand < 0.9 ? 'dust' : 'flare';
      } else if (sentiment === 'Negative') {
        // More dust and flares for negative
        const rand = Math.random();
        type = rand < 0.6 ? 'dust' : 
               rand < 0.8 ? 'energy' : 
               rand < 0.95 ? 'flare' : 'star';
      } else {
        // Balanced mix for neutral
        const rand = Math.random();
        type = rand < 0.4 ? 'dust' : 
               rand < 0.7 ? 'star' : 
               rand < 0.9 ? 'energy' : 'flare';
      }
      
      createParticle(type, colors, width, height);
    }
    
  }, [options.motion, options.sentiment, options.sentimentScore, createParticle, getColorPalette]);
  
  // Update camera position based on mouse movement
  const updateCamera = useCallback((deltaTime: number) => {
    const cam = camera.current;
    
    // If interactivity is enabled, update camera target based on mouse
    if (options.interactivity && canvasRef.current) {
      const { width, height } = canvasRef.current;
      
      // Calculate normalized mouse position (-1 to 1)
      const normalizedX = (mouse.current.x / width) * 2 - 1;
      const normalizedY = (mouse.current.y / height) * 2 - 1;
      
      // Update camera target with smooth damping
      cam.targetX = normalizedX * 100;
      cam.targetY = 50 - normalizedY * 50;
      
      // Adjust rotation based on mouse movement when dragging
      if (mouse.current.isDown) {
        const dx = mouse.current.x - mouse.current.lastX;
        const dy = mouse.current.y - mouse.current.lastY;
        
        cam.rotationY -= dx * 0.003;
        cam.rotationX -= dy * 0.003;
        
        // Clamp rotation to prevent flipping
        cam.rotationX = Math.max(-0.5, Math.min(0.5, cam.rotationX));
      }
      
      // Update last mouse position
      mouse.current.lastX = mouse.current.x;
      mouse.current.lastY = mouse.current.y;
    }
    
    // Apply dampened movement to camera position
    cam.x += (cam.targetX - cam.x) * deltaTime * 2;
    cam.y += (cam.targetY - cam.y) * deltaTime * 2;
    
    // Add slight autonomous movement for dynamic feeling
    const time = Date.now() * 0.001;
    cam.x += Math.sin(time * 0.2) * 0.5;
    cam.y += Math.cos(time * 0.3) * 0.3;
    
  }, [options.interactivity]);
  
  // Render the entire 3D scene
  const renderScene = useCallback((time: number) => {
    if (!canvasRef.current || !isMounted.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { width, height } = canvas;
    const deltaTime = Math.min(0.05, (time - timeRef.current.lastUpdate) / 1000);
    timeRef.current.lastUpdate = time;
    timeRef.current.elapsed += deltaTime;
    
    // Update components
    updateLights(deltaTime);
    updateParticles(deltaTime);
    updateCamera(deltaTime);
    
    // Clear the canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw sky gradient background
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
    skyGradient.addColorStop(0, atmosphere.current.skyGradientTop);
    skyGradient.addColorStop(1, atmosphere.current.skyGradientBottom);
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Collect all renderable objects for z-sorting
    const renderables: { type: string; z: number; render: () => void }[] = [];
    
    // Add terrain segments
    if (terrain.current.length > 0) {
      // Render terrain triangles
      const resolution = terrain.current.length;
      
      for (let z = 0; z < resolution - 1; z++) {
        for (let x = 0; x < resolution - 1; x++) {
          // Get the four corners of this grid cell
          const p1 = terrain.current[z][x];
          const p2 = terrain.current[z][x + 1];
          const p3 = terrain.current[z + 1][x];
          const p4 = terrain.current[z + 1][x + 1];
          
          // Calculate the average Z depth for sorting
          const avgZ = (p1.z + p2.z + p3.z + p4.z) / 4;
          
          // Add to renderables
          renderables.push({
            type: 'terrain',
            z: avgZ,
            render: () => {
              // Render this terrain quad
              renderTerrainQuad(ctx, p1, p2, p3, p4);
            }
          });
        }
      }
    }
    
    // Add particles
    for (const particle of particles.current) {
      renderables.push({
        type: 'particle',
        z: particle.z,
        render: () => {
          renderParticle(ctx, particle);
        }
      });
    }
    
    // Z-sort everything (painter's algorithm)
    renderables.sort((a, b) => b.z - a.z);
    
    // Render everything in order
    for (const renderable of renderables) {
      renderable.render();
    }
    
    // Render emotion graph overlay if showing patterns over time
    if (emotionHistory.current.length > 1) {
      renderEmotionGraph(ctx);
    }
    
    // Continue animation loop
    requestRef.current = requestAnimationFrame(renderScene);
  }, [updateLights, updateParticles, updateCamera]);
  
  // Render a terrain quadrilateral with lighting
  const renderTerrainQuad = useCallback((
    ctx: CanvasRenderingContext2D,
    p1: TerrainPoint,
    p2: TerrainPoint,
    p3: TerrainPoint,
    p4: TerrainPoint
  ) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    
    // Project all four points to 2D
    const pp1 = project3D(p1.x, p1.y, p1.z, canvas);
    const pp2 = project3D(p2.x, p2.y, p2.z, canvas);
    const pp3 = project3D(p3.x, p3.y, p3.z, canvas);
    const pp4 = project3D(p4.x, p4.y, p4.z, canvas);
    
    // Skip if any point is not visible
    if (!pp1.visible || !pp2.visible || !pp3.visible || !pp4.visible) return;
    
    // Calculate lighting for each point
    const light1 = calculateLighting(p1, lights.current);
    const light2 = calculateLighting(p2, lights.current);
    const light3 = calculateLighting(p3, lights.current);
    const light4 = calculateLighting(p4, lights.current);
    
    // Apply fog based on distance
    const c1 = applyFog(p1.color, pp1.distance);
    const c2 = applyFog(p2.color, pp2.distance);
    const c3 = applyFog(p3.color, pp3.distance);
    const c4 = applyFog(p4.color, pp4.distance);
    
    // Draw triangle 1 (p1, p2, p3)
    ctx.beginPath();
    ctx.moveTo(pp1.x, pp1.y);
    ctx.lineTo(pp2.x, pp2.y);
    ctx.lineTo(pp3.x, pp3.y);
    ctx.closePath();
    
    // Create gradient for the terrain triangle
    const gradient1 = ctx.createLinearGradient(pp1.x, pp1.y, (pp2.x + pp3.x) / 2, (pp2.y + pp3.y) / 2);
    gradient1.addColorStop(0, applyLighting(c1, light1));
    gradient1.addColorStop(0.5, applyLighting(c2, light2));
    gradient1.addColorStop(1, applyLighting(c3, light3));
    
    ctx.fillStyle = gradient1;
    ctx.fill();
    
    // Draw triangle 2 (p2, p3, p4)
    ctx.beginPath();
    ctx.moveTo(pp2.x, pp2.y);
    ctx.lineTo(pp3.x, pp3.y);
    ctx.lineTo(pp4.x, pp4.y);
    ctx.closePath();
    
    // Create gradient for the second terrain triangle
    const gradient2 = ctx.createLinearGradient((pp2.x + pp3.x) / 2, (pp2.y + pp3.y) / 2, pp4.x, pp4.y);
    gradient2.addColorStop(0, applyLighting(c2, light2));
    gradient2.addColorStop(0.5, applyLighting(c3, light3));
    gradient2.addColorStop(1, applyLighting(c4, light4));
    
    ctx.fillStyle = gradient2;
    ctx.fill();
  }, [project3D, calculateLighting, applyFog]);
  
  // Apply lighting to a color
  const applyLighting = useCallback((color: string, lightFactor: number) => {
    // Parse the color
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    // Apply lighting factor
    const lr = Math.min(255, Math.round(r * lightFactor));
    const lg = Math.min(255, Math.round(g * lightFactor));
    const lb = Math.min(255, Math.round(b * lightFactor));
    
    // Return as hex color
    return `#${lr.toString(16).padStart(2, '0')}${lg.toString(16).padStart(2, '0')}${lb.toString(16).padStart(2, '0')}`;
  }, []);
  
  // Render a single particle
  const renderParticle = useCallback((ctx: CanvasRenderingContext2D, particle: Particle3D) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    
    // Project 3D coordinates to 2D
    const projected = project3D(particle.x, particle.y, particle.z, canvas);
    
    // Skip if not visible
    if (!projected.visible) return;
    
    // Adjust for distance (perspective and fog)
    const sizeFactor = projected.scale;
    const size = particle.size * sizeFactor;
    
    // Skip if too small
    if (size < 0.5) return;
    
    // Apply fog based on distance
    const foggedColor = applyFog(particle.color, projected.distance);
    
    // Set alpha based on life and distance
    const lifeAlpha = particle.life / particle.maxLife;
    const alpha = particle.alpha * lifeAlpha;
    
    // Save context for rotation
    ctx.save();
    ctx.translate(projected.x, projected.y);
    ctx.rotate(particle.rotation);
    
    // Draw according to particle type
    switch (particle.type) {
      case 'dust':
        // Simple circle
        ctx.beginPath();
        ctx.fillStyle = `${foggedColor}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'energy':
        // Glowing circle with gradient
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
        gradient.addColorStop(0, `${foggedColor}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, `${foggedColor}00`);
        
        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(0, 0, size * 2, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'star':
        // Star shape
        const outerRadius = size;
        const innerRadius = size * 0.4;
        const spikes = 5;
        
        ctx.beginPath();
        ctx.fillStyle = `${foggedColor}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
        
        // Draw star shape
        for (let i = 0; i < spikes * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (Math.PI * i) / spikes;
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.closePath();
        ctx.fill();
        
        // Add glow effect
        const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 3);
        glowGradient.addColorStop(0, `${foggedColor}${Math.round(alpha * 0.3 * 255).toString(16).padStart(2, '0')}`);
        glowGradient.addColorStop(1, `${foggedColor}00`);
        
        ctx.beginPath();
        ctx.fillStyle = glowGradient;
        ctx.arc(0, 0, size * 3, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'flare':
        // Lens flare effect
        const flareGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
        flareGradient.addColorStop(0, `${foggedColor}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`);
        flareGradient.addColorStop(0.3, `${foggedColor}${Math.round(alpha * 0.7 * 255).toString(16).padStart(2, '0')}`);
        flareGradient.addColorStop(1, `${foggedColor}00`);
        
        ctx.beginPath();
        ctx.fillStyle = flareGradient;
        ctx.arc(0, 0, size * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Add cross shape
        ctx.beginPath();
        ctx.strokeStyle = `${foggedColor}${Math.round(alpha * 0.7 * 255).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = size / 4;
        ctx.moveTo(-size * 2, 0);
        ctx.lineTo(size * 2, 0);
        ctx.moveTo(0, -size * 2);
        ctx.lineTo(0, size * 2);
        ctx.stroke();
        break;
    }
    
    ctx.restore();
  }, [project3D, applyFog]);
  
  // Render the emotion graph overlay
  const renderEmotionGraph = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!canvasRef.current || emotionHistory.current.length < 2) return;
    
    const canvas = canvasRef.current;
    const { width, height } = canvas;
    
    // Set up the graph area
    const graphHeight = 60;
    const graphWidth = width * 0.8;
    const graphX = width * 0.1;
    const graphY = height - graphHeight - 20;
    
    // Draw graph background
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = '#000000';
    ctx.fillRect(graphX, graphY, graphWidth, graphHeight);
    ctx.globalAlpha = 1.0;
    
    // Draw graph border
    ctx.strokeStyle = '#ffffff44';
    ctx.lineWidth = 1;
    ctx.strokeRect(graphX, graphY, graphWidth, graphHeight);
    
    // Calculate time range
    const data = emotionHistory.current;
    const latestTime = data[data.length - 1].time;
    const earliestTime = data[0].time;
    const timeRange = latestTime - earliestTime;
    
    // Draw the emotion line
    ctx.beginPath();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    
    // Map data points to graph coordinates
    for (let i = 0; i < data.length; i++) {
      const point = data[i];
      
      // Calculate x coordinate based on time
      const timeRatio = (point.time - earliestTime) / timeRange;
      const x = graphX + timeRatio * graphWidth;
      
      // Calculate y coordinate based on sentiment score (-1 to 1)
      // Map -1 to bottom, 0 to middle, 1 to top
      const y = graphY + graphHeight * (1 - (point.score + 1) / 2);
      
      // Draw point
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      
      // Color points based on sentiment
      let pointColor;
      if (point.sentiment === 'Positive') {
        pointColor = '#06d6a0';
      } else if (point.sentiment === 'Negative') {
        pointColor = '#ef476f';
      } else {
        pointColor = '#118ab2';
      }
      
      ctx.fillStyle = pointColor;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw the connecting line
    ctx.stroke();
    
    // Draw baseline
    ctx.beginPath();
    ctx.strokeStyle = '#ffffff44';
    ctx.setLineDash([5, 5]);
    ctx.moveTo(graphX, graphY + graphHeight / 2);
    ctx.lineTo(graphX + graphWidth, graphY + graphHeight / 2);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw label
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.fillText('Emotion Timeline', graphX, graphY - 5);
  }, []);
  
  // Handle mouse move event
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!canvasRef.current || !options.interactivity) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Calculate mouse position relative to canvas
    mouse.current.x = e.clientX - rect.left;
    mouse.current.y = e.clientY - rect.top;
  }, [options.interactivity]);
  
  // Handle mouse down event
  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (!options.interactivity) return;
    
    // Set mouse down state
    mouse.current.isDown = true;
    mouse.current.lastX = mouse.current.x;
    mouse.current.lastY = mouse.current.y;
  }, [options.interactivity]);
  
  // Handle mouse up event
  const handleMouseUp = useCallback(() => {
    if (!options.interactivity) return;
    
    // Clear mouse down state
    mouse.current.isDown = false;
  }, [options.interactivity]);
  
  // Track component mount state
  const isMounted = useRef(true);
  
  // Setup event listeners
  useEffect(() => {
    // Only add mouse events if interactivity is enabled
    if (options.interactivity && canvasRef.current) {
      const canvas = canvasRef.current;
      
      // Add event listeners
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mouseup', handleMouseUp);
      
      // Clean up on unmount
      return () => {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [options.interactivity, handleMouseMove, handleMouseDown, handleMouseUp]);
  
  // Handle window resize
  const handleResize = useCallback(() => {
    if (!canvasRef.current || !isMounted.current) return;
    
    const canvas = canvasRef.current;
    const { width, height } = canvas.getBoundingClientRect();
    
    // Update canvas dimensions
    canvas.width = width;
    canvas.height = height;
    setDimensions({ width, height });
  }, []);
  
  // Initialize and update scene
  useEffect(() => {
    if (!canvasRef.current || !isMounted.current) return;
    
    // Setup window resize listener
    window.addEventListener('resize', handleResize);
    
    // Initialize the scene
    initializeScene();
    
    // Start the animation loop
    timeRef.current.lastUpdate = performance.now();
    requestRef.current = requestAnimationFrame(renderScene);
    
    // Clean up on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    };
  }, [
    initializeScene,
    renderScene,
    handleResize,
    options.sentiment,
    options.sentimentScore,
    options.colorIntensity,
    options.motion
  ]);
  
  // Add current emotion to history when sentiment changes
  useEffect(() => {
    addEmotionDataPoint();
  }, [options.sentiment, options.sentimentScore, addEmotionDataPoint]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    };
  }, []);
  
  return {
    canvasRef,
    dimensions,
    emotionHistory: emotionHistory.current
  };
}