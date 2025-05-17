/**
 * Creativity transformations for the Vocal Earth app
 * 
 * These transformations create unexpected and inspiring changes to the visual landscape
 */

// Define the structure of a creative transformation
export interface CreativeTransformation {
  id: string;
  name: string;
  description: string;
  visualEffect: 'color' | 'shape' | 'motion' | 'particles' | 'hybrid';
  intensity: 'subtle' | 'moderate' | 'dramatic';
  applyToVisualizer: (
    canvas: HTMLCanvasElement | null, 
    container: HTMLDivElement | null
  ) => Promise<void>;
}

// Function to generate a random color with potential for vivid, unexpected hues
function getRandomVividColor(): string {
  const hue = Math.floor(Math.random() * 360); // Full hue spectrum
  const saturation = Math.floor(Math.random() * 30) + 70; // High saturation (70-100%)
  const lightness = Math.floor(Math.random() * 30) + 45; // Medium lightness (45-75%)
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Function to create a wave-like animation on the canvas
async function createWaveAnimation(canvas: HTMLCanvasElement): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // Store original canvas data
  const originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  // Create wave animation for 2 seconds
  const startTime = Date.now();
  const duration = 2000; // 2 seconds
  
  // Parameters for wave animation
  const amplitude = canvas.height * 0.05; // Wave height
  const period = canvas.width * 0.2; // Wave width
  const speed = 0.01; // Wave speed
  
  return new Promise((resolve) => {
    function animateWave() {
      // Calculate progress (0 to 1)
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // If animation is complete, restore original canvas and resolve
      if (progress >= 1) {
        ctx.putImageData(originalImageData, 0, 0);
        resolve();
        return;
      }
      
      // Create temporary canvas to work with
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) {
        resolve();
        return;
      }
      
      // Draw original image to temp canvas
      tempCtx.putImageData(originalImageData, 0, 0);
      
      // Clear main canvas and prepare for wave effect
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Create wave distortion
      for (let x = 0; x < canvas.width; x++) {
        // Calculate wave offset
        const waveOffset = Math.sin(x / period + progress * 10) * amplitude * progress;
        
        // Draw each vertical slice with offset
        ctx.drawImage(
          tempCanvas, 
          x, 0, 1, canvas.height, // Source rectangle (1px slice)
          x, waveOffset, 1, canvas.height // Destination rectangle with wave offset
        );
      }
      
      // Continue animation
      requestAnimationFrame(animateWave);
    }
    
    // Start animation
    animateWave();
  });
}

// Function to create a kaleidoscope effect on the canvas
async function createKaleidoscopeEffect(canvas: HTMLCanvasElement): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // Store original canvas data
  const originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  // Create kaleidoscope animation for 2 seconds
  const startTime = Date.now();
  const duration = 2000; // 2 seconds
  
  return new Promise((resolve) => {
    function animateKaleidoscope() {
      // Calculate progress (0 to 1)
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // If animation is complete, restore original canvas and resolve
      if (progress >= 1) {
        ctx.putImageData(originalImageData, 0, 0);
        resolve();
        return;
      }
      
      // Create temporary canvas
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) {
        resolve();
        return;
      }
      
      // Draw original image to temp canvas
      tempCtx.putImageData(originalImageData, 0, 0);
      
      // Clear main canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw kaleidoscope effect
      const segments = 6 + Math.floor(progress * 6); // 6 to 12 segments
      const angleStep = (Math.PI * 2) / segments;
      
      // Save context for transformations
      ctx.save();
      
      // Move to center of canvas
      ctx.translate(canvas.width / 2, canvas.height / 2);
      
      // Create segments
      for (let i = 0; i < segments; i++) {
        ctx.rotate(angleStep);
        
        // Draw slice of original image
        ctx.drawImage(
          tempCanvas,
          0, 0, canvas.width / 2, canvas.height,
          0, 0, canvas.width / 2, canvas.height
        );
        
        // Mirror for kaleidoscope effect
        ctx.scale(-1, 1);
        ctx.drawImage(
          tempCanvas,
          0, 0, canvas.width / 2, canvas.height,
          0, 0, canvas.width / 2, canvas.height
        );
        ctx.scale(-1, 1); // Reset scale
      }
      
      // Restore context
      ctx.restore();
      
      // Continue animation
      requestAnimationFrame(animateKaleidoscope);
    }
    
    // Start animation
    animateKaleidoscope();
  });
}

// Function to create a color shift/pulse effect
async function createColorPulseEffect(canvas: HTMLCanvasElement): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // Store original canvas data
  const originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  // Create color pulse animation for 2 seconds
  const startTime = Date.now();
  const duration = 2000; // 2 seconds
  
  // Random target hue shift
  const hueShift = Math.floor(Math.random() * 180); // 0-180 degree hue shift
  
  return new Promise((resolve) => {
    function animateColorPulse() {
      // Calculate progress (0 to 1)
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // If animation is complete, restore original canvas and resolve
      if (progress >= 1) {
        ctx.putImageData(originalImageData, 0, 0);
        resolve();
        return;
      }
      
      // Create temporary canvas
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) {
        resolve();
        return;
      }
      
      // Draw original image to temp canvas
      tempCtx.putImageData(originalImageData, 0, 0);
      
      // Get image data for manipulation
      const imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Calculate current hue shift (wave pattern)
      const currentShift = hueShift * Math.sin(progress * Math.PI);
      
      // Apply color manipulation to each pixel
      for (let i = 0; i < data.length; i += 4) {
        // Convert RGB to HSL
        const r = data[i] / 255;
        const g = data[i + 1] / 255;
        const b = data[i + 2] / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
          h = s = 0; // achromatic
        } else {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          
          switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
            default: h = 0;
          }
          
          h /= 6;
        }
        
        // Apply hue shift
        h = (h * 360 + currentShift) % 360 / 360;
        
        // Convert back to RGB
        let r1, g1, b1;
        
        if (s === 0) {
          r1 = g1 = b1 = l; // achromatic
        } else {
          const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
          };
          
          const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          const p = 2 * l - q;
          
          r1 = hue2rgb(p, q, h + 1/3);
          g1 = hue2rgb(p, q, h);
          b1 = hue2rgb(p, q, h - 1/3);
        }
        
        // Update pixel data
        data[i] = Math.round(r1 * 255);
        data[i + 1] = Math.round(g1 * 255);
        data[i + 2] = Math.round(b1 * 255);
      }
      
      // Draw modified image data to main canvas
      ctx.putImageData(imageData, 0, 0);
      
      // Continue animation
      requestAnimationFrame(animateColorPulse);
    }
    
    // Start animation
    animateColorPulse();
  });
}

// Function to create a particle explosion effect
async function createParticleExplosion(canvas: HTMLCanvasElement): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // Store original canvas data
  const originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  // Create explosion animation for 2 seconds
  const startTime = Date.now();
  const duration = 2000; // 2 seconds
  
  // Create particles
  const particleCount = 200;
  const particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    alpha: number;
  }> = [];
  
  // Initialize particles at center
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  
  for (let i = 0; i < particleCount; i++) {
    // Random angle and velocity
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 5;
    
    particles.push({
      x: centerX,
      y: centerY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: Math.random() * 8 + 2,
      color: getRandomVividColor(),
      alpha: 0.8 + Math.random() * 0.2
    });
  }
  
  return new Promise((resolve) => {
    function animateExplosion() {
      // Calculate progress (0 to 1)
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // If animation is complete, restore original canvas and resolve
      if (progress >= 1) {
        ctx.putImageData(originalImageData, 0, 0);
        resolve();
        return;
      }
      
      // Clear canvas and draw original image with reduced opacity
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1 - progress * 0.5; // Fade out original image
      ctx.putImageData(originalImageData, 0, 0);
      ctx.globalCompositeOperation = 'lighter'; // Additive blending for particles
      
      // Update and draw particles
      particles.forEach(particle => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Reduce alpha over time
        const particleAlpha = particle.alpha * (1 - progress);
        
        // Draw particle
        ctx.globalAlpha = particleAlpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Reset composite operation and alpha
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      
      // Continue animation
      requestAnimationFrame(animateExplosion);
    }
    
    // Start animation
    animateExplosion();
  });
}

// Function to create a ripple effect
async function createRippleEffect(canvas: HTMLCanvasElement): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // Store original canvas data
  const originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  // Create ripple animation for 2 seconds
  const startTime = Date.now();
  const duration = 2000; // 2 seconds
  
  // Ripple parameters
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const maxRadius = Math.max(canvas.width, canvas.height);
  const rippleWidth = 50;
  
  return new Promise((resolve) => {
    function animateRipple() {
      // Calculate progress (0 to 1)
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // If animation is complete, restore original canvas and resolve
      if (progress >= 1) {
        ctx.putImageData(originalImageData, 0, 0);
        resolve();
        return;
      }
      
      // Draw original image
      ctx.putImageData(originalImageData, 0, 0);
      
      // Draw ripple effect
      for (let i = 0; i < 3; i++) { // Multiple ripples
        const rippleProgress = (progress + i * 0.2) % 1; // Stagger ripples
        const radius = rippleProgress * maxRadius;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.lineWidth = rippleWidth * (1 - rippleProgress); // Thinner as it expands
        ctx.strokeStyle = `hsla(${60 + i * 120}, 80%, 60%, ${0.7 * (1 - rippleProgress)})`; // Fade out as it expands
        ctx.stroke();
      }
      
      // Continue animation
      requestAnimationFrame(animateRipple);
    }
    
    // Start animation
    animateRipple();
  });
}

// Apply creativity transformation to the canvas
async function applyCanvasTransformation(
  canvas: HTMLCanvasElement | null, 
  transformation: CreativeTransformation
): Promise<void> {
  if (!canvas) return;
  
  // Apply the specific transformation effect
  switch (transformation.id) {
    case 'wave':
      await createWaveAnimation(canvas);
      break;
    case 'kaleidoscope':
      await createKaleidoscopeEffect(canvas);
      break;
    case 'colorShift':
      await createColorPulseEffect(canvas);
      break;
    case 'particleExplosion':
      await createParticleExplosion(canvas);
      break;
    case 'ripple':
      await createRippleEffect(canvas);
      break;
    default:
      console.warn(`Unknown transformation: ${transformation.id}`);
  }
}

// Available creativity transformations
export const creativityTransformations: CreativeTransformation[] = [
  {
    id: 'wave',
    name: 'Dreamwave',
    description: 'Sends gentle waves rippling through your landscape, creating fluid motion and dynamic perspective shifts.',
    visualEffect: 'motion',
    intensity: 'moderate',
    applyToVisualizer: async (canvas, container) => {
      if (canvas) {
        await createWaveAnimation(canvas);
      }
    }
  },
  {
    id: 'kaleidoscope',
    name: 'Prismatic Vision',
    description: 'Transforms your landscape into a mesmerizing kaleidoscope pattern, revealing hidden symmetries and visual harmonies.',
    visualEffect: 'shape',
    intensity: 'dramatic',
    applyToVisualizer: async (canvas, container) => {
      if (canvas) {
        await createKaleidoscopeEffect(canvas);
      }
    }
  },
  {
    id: 'colorShift',
    name: 'Chroma Pulse',
    description: 'Shifts the color spectrum of your landscape, revealing unexpected color relationships and emotional tones.',
    visualEffect: 'color',
    intensity: 'moderate',
    applyToVisualizer: async (canvas, container) => {
      if (canvas) {
        await createColorPulseEffect(canvas);
      }
    }
  },
  {
    id: 'particleExplosion',
    name: 'Stardust Burst',
    description: 'Erupts your landscape in a shower of particles, creating a magical moment of transformation and renewal.',
    visualEffect: 'particles',
    intensity: 'dramatic',
    applyToVisualizer: async (canvas, container) => {
      if (canvas) {
        await createParticleExplosion(canvas);
      }
    }
  },
  {
    id: 'ripple',
    name: 'Ethereal Ripple',
    description: 'Sends concentric rings of energy across your landscape, creating a sense of cosmic resonance and harmony.',
    visualEffect: 'hybrid',
    intensity: 'subtle',
    applyToVisualizer: async (canvas, container) => {
      if (canvas) {
        await createRippleEffect(canvas);
      }
    }
  }
];

// Get a random transformation
export function getRandomTransformation(): CreativeTransformation {
  const index = Math.floor(Math.random() * creativityTransformations.length);
  return creativityTransformations[index];
}

// Apply a random transformation to the canvas
export async function applyRandomTransformation(
  canvas: HTMLCanvasElement | null, 
  container: HTMLDivElement | null
): Promise<CreativeTransformation> {
  const transformation = getRandomTransformation();
  
  if (canvas) {
    await transformation.applyToVisualizer(canvas, container);
  }
  
  return transformation;
}