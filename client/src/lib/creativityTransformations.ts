/**
 * Creativity Transformations Library
 * 
 * Provides a set of visual transformations that can be applied to the visualization
 * to create unexpected, inspiring effects when the user clicks the "Creativity Spark" button.
 */

import { getRandomElement } from '@/lib/utils';

// Types of creative transformations available
export type TransformationType = 
  | 'kaleidoscope'
  | 'vortex'
  | 'crystalize'
  | 'neon'
  | 'watercolor'
  | 'pixelate'
  | 'galaxySwirl'
  | 'dreamWave'
  | 'prism'
  | 'aurora';

// Transformation result with metadata
export interface CreativeTransformation {
  type: TransformationType;
  name: string;
  description: string;
  intensity: number; // 0-1 value
}

// Apply a random transformation to the current canvas
export async function applyRandomTransformation(
  canvas: HTMLCanvasElement | null,
  container: HTMLDivElement | null
): Promise<CreativeTransformation> {
  if (!canvas || !container) {
    throw new Error('Canvas or container not found');
  }
  
  // Choose a random transformation type
  const transformationTypes: TransformationType[] = [
    'kaleidoscope', 'vortex', 'crystalize', 'neon', 'watercolor',
    'pixelate', 'galaxySwirl', 'dreamWave', 'prism', 'aurora'
  ];
  
  const type = getRandomElement(transformationTypes);
  const intensity = 0.3 + Math.random() * 0.7; // Random intensity between 0.3-1.0
  
  // Apply the selected transformation
  switch (type) {
    case 'kaleidoscope':
      await applyKaleidoscopeEffect(canvas, intensity);
      break;
    case 'vortex':
      await applyVortexEffect(canvas, intensity);
      break;
    case 'crystalize':
      await applyCrystalizeEffect(canvas, intensity);
      break;
    case 'neon':
      await applyNeonEffect(canvas, intensity);
      break;
    case 'watercolor':
      await applyWatercolorEffect(canvas, intensity);
      break;
    case 'pixelate':
      await applyPixelateEffect(canvas, intensity);
      break;
    case 'galaxySwirl':
      await applyGalaxySwirlEffect(canvas, intensity);
      break;
    case 'dreamWave':
      await applyDreamWaveEffect(canvas, intensity);
      break;
    case 'prism':
      await applyPrismEffect(canvas, intensity);
      break;
    case 'aurora':
      await applyAuroraEffect(canvas, intensity);
      break;
  }
  
  // Return metadata about the transformation
  return {
    type,
    name: getTransformationName(type),
    description: getTransformationDescription(type),
    intensity
  };
}

// Get a human-readable name for a transformation type
function getTransformationName(type: TransformationType): string {
  const names: Record<TransformationType, string> = {
    kaleidoscope: 'Kaleidoscopic Vision',
    vortex: 'Cosmic Vortex',
    crystalize: 'Crystal Formation',
    neon: 'Neon Glow',
    watercolor: 'Watercolor Wash',
    pixelate: 'Pixel Dream',
    galaxySwirl: 'Galactic Spiral',
    dreamWave: 'Dream Wave',
    prism: 'Prismatic Light',
    aurora: 'Aurora Borealis'
  };
  
  return names[type];
}

// Get a description for a transformation type
function getTransformationDescription(type: TransformationType): string {
  const descriptions: Record<TransformationType, string> = {
    kaleidoscope: 'A mesmerizing reflection of geometric patterns that unfold in perfect symmetry',
    vortex: 'A spiraling cosmic whirlpool pulling elements toward its center',
    crystalize: 'Fractured geometric facets catch and reflect light in unexpected ways',
    neon: 'Vibrant glowing edges illuminate the darkness with electric energy',
    watercolor: 'Gentle flowing pigments blend at the edges creating ephemeral textures',
    pixelate: 'Reality breaks into discrete blocks of color revealing the digital beneath',
    galaxySwirl: 'Celestial bodies dance in spiraling arms of star-filled cosmic dust',
    dreamWave: 'Flowing currents of consciousness ripple across the dreamscape',
    prism: 'Light splits into its component colors, revealing hidden spectrums',
    aurora: 'Shimmering veils of luminous color dance across the northern sky'
  };
  
  return descriptions[type];
}

// Apply kaleidoscope effect to canvas
async function applyKaleidoscopeEffect(canvas: HTMLCanvasElement, intensity: number): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // Save original image data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const originalData = new Uint8ClampedArray(imageData.data);
  
  // Number of segments (more segments = more complex kaleidoscope)
  const segments = Math.floor(3 + intensity * 10);
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) * 0.9;
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw kaleidoscope segments
  for (let segment = 0; segment < segments; segment++) {
    const angle = (segment / segments) * Math.PI * 2;
    
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);
    
    // Create an off-screen canvas for the segment
    const offCanvas = document.createElement('canvas');
    offCanvas.width = canvas.width;
    offCanvas.height = canvas.height;
    const offCtx = offCanvas.getContext('2d');
    
    if (offCtx) {
      // Draw a wedge of the original image
      const segmentImageData = ctx.createImageData(canvas.width, canvas.height);
      const data = segmentImageData.data;
      
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const dx = x - centerX;
          const dy = y - centerY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Only draw within the wedge and radius
          const wedgeAngle = Math.atan2(dy, dx);
          const segmentAngle = Math.PI * 2 / segments;
          
          if (wedgeAngle > -segmentAngle/2 && wedgeAngle < segmentAngle/2 && distance < radius) {
            const srcIdx = (y * canvas.width + x) * 4;
            const destIdx = (y * canvas.width + x) * 4;
            
            data[destIdx] = originalData[srcIdx];
            data[destIdx + 1] = originalData[srcIdx + 1];
            data[destIdx + 2] = originalData[srcIdx + 2];
            data[destIdx + 3] = originalData[srcIdx + 3];
          }
        }
      }
      
      offCtx.putImageData(segmentImageData, 0, 0);
      
      // Draw the segment onto the main canvas
      ctx.drawImage(offCanvas, -centerX, -centerY);
    }
    
    ctx.restore();
  }
  
  // Apply a subtle bloom effect for glow
  applyBloomEffect(ctx, canvas.width, canvas.height, intensity * 0.3);
  
  // Add a radial transition back to normal at the edges
  const gradientRadius = radius * 1.2;
  const edgeTransition = ctx.createRadialGradient(
    centerX, centerY, radius * 0.8, 
    centerX, centerY, gradientRadius
  );
  edgeTransition.addColorStop(0, 'rgba(0,0,0,0)');
  edgeTransition.addColorStop(1, 'rgba(0,0,0,0.8)');
  
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = edgeTransition;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = 'source-over';
}

// Apply vortex spiral effect
async function applyVortexEffect(canvas: HTMLCanvasElement, intensity: number): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // Save original image
  const original = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  
  // Create a temporary canvas
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return;
  
  tempCtx.putImageData(original, 0, 0);
  
  // Clear the original canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Set up the vortex effect
  const maxRadius = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height) / 2;
  const spiralFactor = 4 + intensity * 8; // Adjust spiral tightness
  
  // Apply the vortex transformation
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      // Distance from center
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Angle from center
      let angle = Math.atan2(dy, dx);
      
      // Apply the spiral distortion based on distance
      const distortionAmount = (1 - distance / maxRadius) * spiralFactor * intensity;
      angle += distortionAmount;
      
      // Calculate source position
      const srcX = centerX + Math.cos(angle) * distance;
      const srcY = centerY + Math.sin(angle) * distance;
      
      // Only copy pixels that are in bounds
      if (srcX >= 0 && srcX < canvas.width && srcY >= 0 && srcY < canvas.height) {
        const pixelData = tempCtx.getImageData(srcX, srcY, 1, 1).data;
        ctx.fillStyle = `rgba(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]}, ${pixelData[3] / 255})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
  
  // Add a subtle glow
  applyBloomEffect(ctx, canvas.width, canvas.height, intensity * 0.2);
  
  // Add a radial gradient overlay
  const gradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, maxRadius
  );
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
  
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = 'source-over';
}

// Apply crystallize effect
async function applyCrystalizeEffect(canvas: HTMLCanvasElement, intensity: number): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // Save original image
  const original = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const originalData = original.data;
  
  // Create output image data
  const output = ctx.createImageData(canvas.width, canvas.height);
  const outputData = output.data;
  
  // Generate Voronoi-like cells (points)
  const numCells = Math.floor(20 + intensity * 80);
  const cells = [];
  
  for (let i = 0; i < numCells; i++) {
    cells.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      color: [0, 0, 0, 0] // Will store average color
    });
  }
  
  // Calculate the cell for each point and gather colors
  const cellAssignments = new Array(canvas.width * canvas.height).fill(-1);
  
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      let closestCell = 0;
      let closestDist = Number.MAX_VALUE;
      
      // Find closest cell
      for (let i = 0; i < cells.length; i++) {
        const dx = cells[i].x - x;
        const dy = cells[i].y - y;
        const dist = dx * dx + dy * dy;
        
        if (dist < closestDist) {
          closestDist = dist;
          closestCell = i;
        }
      }
      
      cellAssignments[y * canvas.width + x] = closestCell;
      
      // Add color to the cell's total
      const pixelIndex = (y * canvas.width + x) * 4;
      const cell = cells[closestCell];
      
      cell.color[0] += originalData[pixelIndex];
      cell.color[1] += originalData[pixelIndex + 1];
      cell.color[2] += originalData[pixelIndex + 2];
      cell.color[3] += originalData[pixelIndex + 3];
    }
  }
  
  // Calculate average colors for cells
  let cellCounts = new Array(cells.length).fill(0);
  
  for (let i = 0; i < cellAssignments.length; i++) {
    cellCounts[cellAssignments[i]]++;
  }
  
  for (let i = 0; i < cells.length; i++) {
    if (cellCounts[i] > 0) {
      cells[i].color[0] = Math.floor(cells[i].color[0] / cellCounts[i]);
      cells[i].color[1] = Math.floor(cells[i].color[1] / cellCounts[i]);
      cells[i].color[2] = Math.floor(cells[i].color[2] / cellCounts[i]);
      cells[i].color[3] = Math.floor(cells[i].color[3] / cellCounts[i]);
    }
  }
  
  // Fill the output with cell colors
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const cell = cells[cellAssignments[y * canvas.width + x]];
      const pixelIndex = (y * canvas.width + x) * 4;
      
      outputData[pixelIndex] = cell.color[0];
      outputData[pixelIndex + 1] = cell.color[1];
      outputData[pixelIndex + 2] = cell.color[2];
      outputData[pixelIndex + 3] = cell.color[3];
    }
  }
  
  // Draw cell edges for crystal effect
  for (let y = 1; y < canvas.height - 1; y++) {
    for (let x = 1; x < canvas.width - 1; x++) {
      const idx = y * canvas.width + x;
      const pixelIndex = idx * 4;
      
      // Check if this pixel is at a cell boundary
      if (
        cellAssignments[idx] !== cellAssignments[idx - 1] ||
        cellAssignments[idx] !== cellAssignments[idx + 1] ||
        cellAssignments[idx] !== cellAssignments[idx - canvas.width] ||
        cellAssignments[idx] !== cellAssignments[idx + canvas.width]
      ) {
        // Make boundary pixels brighter for crystal-like effect
        outputData[pixelIndex] = Math.min(255, outputData[pixelIndex] * 1.5);
        outputData[pixelIndex + 1] = Math.min(255, outputData[pixelIndex + 1] * 1.5);
        outputData[pixelIndex + 2] = Math.min(255, outputData[pixelIndex + 2] * 1.5);
      }
    }
  }
  
  // Apply the effect
  ctx.putImageData(output, 0, 0);
  
  // Add a subtle highlight effect
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = 'source-over';
}

// Apply neon glow effect
async function applyNeonEffect(canvas: HTMLCanvasElement, intensity: number): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // Save original image
  const original = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  // Create edge detection kernel
  const edgeDetection = [
    -1, -1, -1,
    -1,  8, -1,
    -1, -1, -1
  ];
  
  // Apply edge detection
  const edgeImage = applyConvolution(original, canvas.width, canvas.height, edgeDetection);
  
  // Enhance edges
  const enhancedEdges = ctx.createImageData(canvas.width, canvas.height);
  for (let i = 0; i < edgeImage.data.length; i += 4) {
    // Get edge intensity
    const edgeIntensity = Math.max(edgeImage.data[i], edgeImage.data[i + 1], edgeImage.data[i + 2]);
    
    // Apply threshold for more prominent edges
    const threshold = 30 - intensity * 20; // Adjust threshold by intensity
    if (edgeIntensity > threshold) {
      // Create glowing edge
      enhancedEdges.data[i] = 255; // Bright white edge
      enhancedEdges.data[i + 1] = 255;
      enhancedEdges.data[i + 2] = 255;
      enhancedEdges.data[i + 3] = Math.min(255, edgeIntensity * 2); // Opacity based on edge strength
    } else {
      // Keep dark/black for non-edge pixels
      enhancedEdges.data[i] = 0;
      enhancedEdges.data[i + 1] = 0;
      enhancedEdges.data[i + 2] = 0;
      enhancedEdges.data[i + 3] = 255;
    }
  }
  
  // Draw a darkened version of the original
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.putImageData(original, 0, 0);
  
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = 'source-over';
  
  // Draw the edges with glow effect
  ctx.putImageData(enhancedEdges, 0, 0);
  
  // Apply bloom for the glow effect
  applyBloomEffect(ctx, canvas.width, canvas.height, intensity * 0.5);
  
  // Add colored overlay
  const colors = [
    'rgba(255, 50, 200, 0.2)', // Pink
    'rgba(50, 200, 255, 0.2)', // Cyan
    'rgba(255, 200, 50, 0.2)'  // Yellow
  ];
  
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = 'source-over';
}

// Apply watercolor paint effect
async function applyWatercolorEffect(canvas: HTMLCanvasElement, intensity: number): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // Save original image
  const original = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  // Create a temporary canvas for processing
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return;
  
  tempCtx.putImageData(original, 0, 0);
  
  // Apply multiple passes of subtle blur with different radiuses
  const passes = Math.floor(3 + intensity * 4);
  
  // First pass - maintain some detail
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(tempCanvas, 0, 0);
  
  for (let i = 0; i < passes; i++) {
    // Create distorted copy with varying radius
    const radius = 1 + Math.random() * (intensity * 8);
    applyBilateralBlur(ctx, canvas.width, canvas.height, radius, 25);
    
    // Vary opacity for each pass
    const opacity = 0.2 + Math.random() * 0.3;
    
    // Draw the distorted copy with reduced opacity
    ctx.globalAlpha = opacity;
    ctx.drawImage(tempCanvas, 0, 0);
    ctx.globalAlpha = 1;
  }
  
  // Add paper texture
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = 'rgba(240, 235, 225, 0.3)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add color bleeding effect
  const colorBleedAmount = intensity * 0.3;
  
  ctx.globalCompositeOperation = 'screen';
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, `rgba(30, 144, 255, ${colorBleedAmount})`); // Light blue
  gradient.addColorStop(0.5, `rgba(255, 255, 255, 0)`);
  gradient.addColorStop(1, `rgba(240, 128, 128, ${colorBleedAmount})`); // Light red
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Reset composite operation
  ctx.globalCompositeOperation = 'source-over';
  
  // Add color variations
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    // Random color variation
    const variation = (Math.random() * 2 - 1) * (intensity * 20);
    
    data[i] = Math.max(0, Math.min(255, data[i] + variation));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + variation));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + variation));
  }
  
  ctx.putImageData(imageData, 0, 0);
}

// Apply pixelation effect
async function applyPixelateEffect(canvas: HTMLCanvasElement, intensity: number): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // Save original image
  const original = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  // Calculate pixel size (higher intensity = larger pixels)
  const pixelSize = Math.max(2, Math.floor(3 + intensity * 15));
  
  // Create pixelated image
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Pixelate by drawing small squares for each pixel region
  for (let y = 0; y < canvas.height; y += pixelSize) {
    for (let x = 0; x < canvas.width; x += pixelSize) {
      // Get the color of one pixel from the region
      const pixelIndex = (y * canvas.width + x) * 4;
      
      // Calculate average color of the pixel block
      let r = 0, g = 0, b = 0, a = 0, count = 0;
      
      for (let py = 0; py < pixelSize && y + py < canvas.height; py++) {
        for (let px = 0; px < pixelSize && x + px < canvas.width; px++) {
          const idx = ((y + py) * canvas.width + (x + px)) * 4;
          r += original.data[idx];
          g += original.data[idx + 1];
          b += original.data[idx + 2];
          a += original.data[idx + 3];
          count++;
        }
      }
      
      // Average the colors
      r = Math.floor(r / count);
      g = Math.floor(g / count);
      b = Math.floor(b / count);
      a = Math.floor(a / count);
      
      // Draw the pixelated block
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
      ctx.fillRect(x, y, pixelSize, pixelSize);
    }
  }
  
  // Add a subtle grid pattern
  if (intensity > 0.5) {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    
    for (let y = 0; y < canvas.height; y += pixelSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    for (let x = 0; x < canvas.width; x += pixelSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
  }
  
  // Add color shift effect
  const rgbShiftDistance = Math.floor(intensity * pixelSize * 0.3);
  
  if (rgbShiftDistance > 0) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newImageData = ctx.createImageData(canvas.width, canvas.height);
    
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const i = (y * canvas.width + x) * 4;
        
        // Red channel from shifted position
        const rX = Math.min(canvas.width - 1, x + rgbShiftDistance);
        const rI = (y * canvas.width + rX) * 4;
        
        // Blue channel from oppositely shifted position
        const bX = Math.max(0, x - rgbShiftDistance);
        const bI = (y * canvas.width + bX) * 4;
        
        // Apply the RGB shift
        newImageData.data[i] = imageData.data[rI];     // R
        newImageData.data[i + 1] = imageData.data[i + 1]; // G (unchanged)
        newImageData.data[i + 2] = imageData.data[bI + 2]; // B
        newImageData.data[i + 3] = imageData.data[i + 3]; // Alpha
      }
    }
    
    ctx.putImageData(newImageData, 0, 0);
  }
}

// Apply galaxy swirl effect
async function applyGalaxySwirlEffect(canvas: HTMLCanvasElement, intensity: number): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // Save original image
  const original = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  // Create two temporary canvases for layer effects
  const bgCanvas = document.createElement('canvas');
  bgCanvas.width = canvas.width;
  bgCanvas.height = canvas.height;
  const bgCtx = bgCanvas.getContext('2d');
  
  const fgCanvas = document.createElement('canvas');
  fgCanvas.width = canvas.width;
  fgCanvas.height = canvas.height;
  const fgCtx = fgCanvas.getContext('2d');
  
  if (!bgCtx || !fgCtx) return;
  
  // Draw original to background canvas
  bgCtx.putImageData(original, 0, 0);
  
  // Apply vortex effect to background with higher intensity
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const swirlIntensity = intensity * 1.5;
  
  // Get the background image data
  const bgImageData = bgCtx.getImageData(0, 0, canvas.width, canvas.height);
  const newBgData = ctx.createImageData(canvas.width, canvas.height);
  
  // Parameters for the spiral
  const maxRadius = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height) / 2;
  const spiralFactor = intensity * 15;
  
  // Create swirl effect
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const normalizedDistance = distance / maxRadius;
      
      // Calculate angle
      let angle = Math.atan2(dy, dx);
      
      // Apply spiral distortion - more at the edges
      const distortion = (normalizedDistance * spiralFactor) * swirlIntensity;
      angle += distortion;
      
      // Calculate source coordinates
      const srcX = Math.floor(centerX + Math.cos(angle) * distance);
      const srcY = Math.floor(centerY + Math.sin(angle) * distance);
      
      // Only copy pixels in bounds
      if (srcX >= 0 && srcX < canvas.width && srcY >= 0 && srcY < canvas.height) {
        const srcIdx = (srcY * canvas.width + srcX) * 4;
        const destIdx = (y * canvas.width + x) * 4;
        
        newBgData.data[destIdx] = bgImageData.data[srcIdx];
        newBgData.data[destIdx + 1] = bgImageData.data[srcIdx + 1];
        newBgData.data[destIdx + 2] = bgImageData.data[srcIdx + 2];
        newBgData.data[destIdx + 3] = bgImageData.data[srcIdx + 3];
      }
    }
  }
  
  bgCtx.putImageData(newBgData, 0, 0);
  
  // Add stars and cosmic dust to foreground
  const starCount = Math.floor(200 + intensity * 300);
  fgCtx.fillStyle = 'black';
  fgCtx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Create stars
  for (let i = 0; i < starCount; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = Math.random() * 2 + 0.5;
    
    // Distance from center for color and opacity
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const normalizedDistance = distance / maxRadius;
    
    // Star colors
    const colors = [
      'rgba(255, 255, 255, 0.9)',  // White
      'rgba(173, 216, 230, 0.8)',  // Light blue
      'rgba(255, 223, 186, 0.8)',  // Light orange
      'rgba(200, 200, 255, 0.7)'   // Light purple
    ];
    
    fgCtx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    fgCtx.beginPath();
    fgCtx.arc(x, y, size, 0, Math.PI * 2);
    fgCtx.fill();
    
    // Add glow to some stars
    if (Math.random() > 0.7) {
      const glowSize = size * (2 + Math.random() * 3);
      const glow = fgCtx.createRadialGradient(x, y, 0, x, y, glowSize);
      glow.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      fgCtx.fillStyle = glow;
      fgCtx.beginPath();
      fgCtx.arc(x, y, glowSize, 0, Math.PI * 2);
      fgCtx.fill();
    }
  }
  
  // Add spiral arms dust
  const armCount = 2 + Math.floor(intensity * 3);
  
  for (let arm = 0; arm < armCount; arm++) {
    const armAngle = (arm / armCount) * Math.PI * 2;
    const armWidth = 0.3 + intensity * 0.5;
    const armParticles = 300 + Math.floor(intensity * 500);
    
    for (let i = 0; i < armParticles; i++) {
      // Position along spiral arm
      const distance = Math.random() * maxRadius * 0.9;
      const spiralOffset = distance / 50 * (4 + intensity * 8);
      const angle = armAngle + spiralOffset + (Math.random() - 0.5) * armWidth;
      
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      // Skip if outside canvas
      if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue;
      
      // Dust color and opacity
      const opacity = 0.1 + Math.random() * 0.3;
      const size = Math.random() * 2 + 0.5;
      
      // Different colors for different arms
      const colors = [
        `rgba(173, 216, 230, ${opacity})`, // Light blue
        `rgba(255, 223, 186, ${opacity})`, // Light orange
        `rgba(230, 230, 255, ${opacity})`, // Light purple
        `rgba(255, 200, 255, ${opacity})`  // Pink
      ];
      
      fgCtx.fillStyle = colors[arm % colors.length];
      fgCtx.beginPath();
      fgCtx.arc(x, y, size, 0, Math.PI * 2);
      fgCtx.fill();
    }
  }
  
  // Composite the layers onto the main canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw background with reduced opacity
  ctx.globalAlpha = 0.7;
  ctx.drawImage(bgCanvas, 0, 0);
  
  // Add stars and cosmic dust with screen blend
  ctx.globalAlpha = 0.8;
  ctx.globalCompositeOperation = 'screen';
  ctx.drawImage(fgCanvas, 0, 0);
  
  // Reset composite operations
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1.0;
  
  // Add a subtle vignette effect
  const gradient = ctx.createRadialGradient(
    centerX, centerY, maxRadius * 0.5,
    centerX, centerY, maxRadius
  );
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Apply dream wave effect
async function applyDreamWaveEffect(canvas: HTMLCanvasElement, intensity: number): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // Get original image data
  const original = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  // Create temporary canvas
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return;
  
  tempCtx.putImageData(original, 0, 0);
  
  // Wave parameters
  const waveCount = Math.floor(5 + intensity * 10);
  const waveAmplitude = intensity * 20;
  const wavePeriod = 100 + Math.random() * 100;
  
  // Apply wave distortion
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Apply multiple overlapping waves with different parameters
  for (let wave = 0; wave < waveCount; wave++) {
    const tempImageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
    const output = ctx.createImageData(canvas.width, canvas.height);
    
    // Random wave direction and parameters
    const horizontal = Math.random() > 0.5;
    const amplitude = waveAmplitude * (0.5 + Math.random() * 0.5);
    const period = wavePeriod * (0.8 + Math.random() * 0.4);
    const phase = Math.random() * Math.PI * 2;
    
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const destIdx = (y * canvas.width + x) * 4;
        
        // Calculate wave offset
        let offset;
        if (horizontal) {
          offset = Math.sin((y / period * Math.PI * 2) + phase) * amplitude;
          const srcX = Math.floor(x + offset);
          if (srcX >= 0 && srcX < canvas.width) {
            const srcIdx = (y * canvas.width + srcX) * 4;
            output.data[destIdx] = tempImageData.data[srcIdx];
            output.data[destIdx + 1] = tempImageData.data[srcIdx + 1];
            output.data[destIdx + 2] = tempImageData.data[srcIdx + 2];
            output.data[destIdx + 3] = tempImageData.data[srcIdx + 3];
          }
        } else {
          offset = Math.sin((x / period * Math.PI * 2) + phase) * amplitude;
          const srcY = Math.floor(y + offset);
          if (srcY >= 0 && srcY < canvas.height) {
            const srcIdx = (srcY * canvas.width + x) * 4;
            output.data[destIdx] = tempImageData.data[srcIdx];
            output.data[destIdx + 1] = tempImageData.data[srcIdx + 1];
            output.data[destIdx + 2] = tempImageData.data[srcIdx + 2];
            output.data[destIdx + 3] = tempImageData.data[srcIdx + 3];
          }
        }
      }
    }
    
    // Update temporary canvas with the wave distortion
    tempCtx.putImageData(output, 0, 0);
  }
  
  // Apply a dreamy blur effect
  const blurRadius = intensity * 6;
  applyGaussianBlur(tempCtx, canvas.width, canvas.height, blurRadius);
  
  // Add a soft bloom effect
  applyBloomEffect(tempCtx, canvas.width, canvas.height, intensity * 0.4);
  
  // Draw the processed image onto the main canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(tempCanvas, 0, 0);
  
  // Add dreamy color grading
  ctx.globalCompositeOperation = 'color';
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, 'rgba(100, 150, 255, 0.3)'); // Blue tint
  gradient.addColorStop(1, 'rgba(255, 150, 250, 0.3)'); // Pink tint
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Reset composite operation
  ctx.globalCompositeOperation = 'source-over';
}

// Apply prism light effect
async function applyPrismEffect(canvas: HTMLCanvasElement, intensity: number): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // Get original image data
  const original = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  // Create temporary canvas for RGB splitting
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return;
  
  // RGB separation amount based on intensity
  const separation = Math.floor(5 + intensity * 15);
  
  // Create separate R, G, B channel images
  const rChannel = ctx.createImageData(canvas.width, canvas.height);
  const gChannel = ctx.createImageData(canvas.width, canvas.height);
  const bChannel = ctx.createImageData(canvas.width, canvas.height);
  
  // Split the channels
  for (let i = 0; i < original.data.length; i += 4) {
    // Red channel
    rChannel.data[i] = original.data[i];     // R
    rChannel.data[i + 1] = 0;                // G
    rChannel.data[i + 2] = 0;                // B
    rChannel.data[i + 3] = original.data[i + 3]; // A
    
    // Green channel
    gChannel.data[i] = 0;                      // R
    gChannel.data[i + 1] = original.data[i + 1]; // G
    gChannel.data[i + 2] = 0;                    // B
    gChannel.data[i + 3] = original.data[i + 3]; // A
    
    // Blue channel
    bChannel.data[i] = 0;                      // R
    bChannel.data[i + 1] = 0;                    // G
    bChannel.data[i + 2] = original.data[i + 2]; // B
    bChannel.data[i + 3] = original.data[i + 3]; // A
  }
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw the red channel shifted
  tempCtx.putImageData(rChannel, 0, 0);
  ctx.globalCompositeOperation = 'screen';
  ctx.drawImage(tempCanvas, -separation, 0);
  
  // Draw the green channel
  tempCtx.putImageData(gChannel, 0, 0);
  ctx.drawImage(tempCanvas, 0, 0);
  
  // Draw the blue channel shifted in the opposite direction
  tempCtx.putImageData(bChannel, 0, 0);
  ctx.drawImage(tempCanvas, separation, 0);
  
  // Reset composite operation
  ctx.globalCompositeOperation = 'source-over';
  
  // Add rainbow highlights
  const prismAngle = Math.random() * Math.PI * 2;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const prismLength = Math.min(canvas.width, canvas.height) * 0.8;
  
  // Calculate prism beam endpoints
  const startX = centerX - Math.cos(prismAngle) * prismLength / 2;
  const startY = centerY - Math.sin(prismAngle) * prismLength / 2;
  const endX = centerX + Math.cos(prismAngle) * prismLength / 2;
  const endY = centerY + Math.sin(prismAngle) * prismLength / 2;
  
  // Create rainbow beam
  const beamWidth = 20 + intensity * 60;
  const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
  
  // Rainbow colors
  gradient.addColorStop(0, 'rgba(255, 0, 0, 0.2)');    // Red
  gradient.addColorStop(0.17, 'rgba(255, 165, 0, 0.2)'); // Orange
  gradient.addColorStop(0.33, 'rgba(255, 255, 0, 0.2)'); // Yellow
  gradient.addColorStop(0.5, 'rgba(0, 255, 0, 0.2)');    // Green
  gradient.addColorStop(0.67, 'rgba(0, 0, 255, 0.2)');   // Blue
  gradient.addColorStop(0.83, 'rgba(75, 0, 130, 0.2)');  // Indigo
  gradient.addColorStop(1, 'rgba(238, 130, 238, 0.2)');  // Violet
  
  // Draw rainbow beam
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = gradient;
  
  // Calculate beam points
  const dx = endX - startX;
  const dy = endY - startY;
  const length = Math.sqrt(dx * dx + dy * dy);
  const unitX = dx / length;
  const unitY = dy / length;
  const perpendicularX = -unitY;
  const perpendicularY = unitX;
  
  // Draw beam as a quad
  ctx.beginPath();
  ctx.moveTo(startX + perpendicularX * beamWidth / 2, startY + perpendicularY * beamWidth / 2);
  ctx.lineTo(endX + perpendicularX * beamWidth / 2, endY + perpendicularY * beamWidth / 2);
  ctx.lineTo(endX - perpendicularX * beamWidth / 2, endY - perpendicularY * beamWidth / 2);
  ctx.lineTo(startX - perpendicularX * beamWidth / 2, startY - perpendicularY * beamWidth / 2);
  ctx.closePath();
  ctx.fill();
  
  // Add lens flare effect
  if (intensity > 0.5) {
    const flareGradient = ctx.createRadialGradient(
      endX, endY, 0,
      endX, endY, beamWidth * 2
    );
    flareGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    flareGradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.4)');
    flareGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = flareGradient;
    ctx.beginPath();
    ctx.arc(endX, endY, beamWidth * 2, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Reset composite operation
  ctx.globalCompositeOperation = 'source-over';
}

// Apply aurora borealis effect
async function applyAuroraEffect(canvas: HTMLCanvasElement, intensity: number): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // Get original image
  const original = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  // Create temporary canvas
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return;
  
  // Draw original image with reduced opacity
  tempCtx.putImageData(original, 0, 0);
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw original with reduced opacity
  ctx.globalAlpha = 0.6;
  ctx.drawImage(tempCanvas, 0, 0);
  ctx.globalAlpha = 1.0;
  
  // Generate aurora layers
  const layerCount = Math.floor(3 + intensity * 7);
  
  for (let layer = 0; layer < layerCount; layer++) {
    // Aurora characteristics based on layer
    const yPosition = canvas.height * (0.5 + (layer * 0.1) - 0.4);
    const height = canvas.height * (0.1 + Math.random() * 0.3);
    const waveFrequency = 1 + Math.random() * 3;
    const waveAmplitude = 20 + intensity * 50;
    
    // Aurora colors - greens and blues for lower intensity, adding purples and pinks for higher
    let color;
    const colorRoll = Math.random();
    
    if (intensity < 0.3) {
      // Mostly greens
      color = `rgba(0, ${150 + Math.floor(Math.random() * 100)}, ${50 + Math.floor(Math.random() * 50)}, 0.2)`;
    } else if (intensity < 0.6) {
      // Greens and blues
      if (colorRoll > 0.5) {
        color = `rgba(0, ${150 + Math.floor(Math.random() * 100)}, ${50 + Math.floor(Math.random() * 50)}, 0.2)`;
      } else {
        color = `rgba(0, ${100 + Math.floor(Math.random() * 50)}, ${150 + Math.floor(Math.random() * 100)}, 0.2)`;
      }
    } else {
      // Full spectrum including purples and pinks
      if (colorRoll > 0.7) {
        color = `rgba(0, ${150 + Math.floor(Math.random() * 100)}, ${50 + Math.floor(Math.random() * 50)}, 0.2)`;
      } else if (colorRoll > 0.4) {
        color = `rgba(0, ${100 + Math.floor(Math.random() * 50)}, ${150 + Math.floor(Math.random() * 100)}, 0.2)`;
      } else if (colorRoll > 0.2) {
        color = `rgba(${80 + Math.floor(Math.random() * 60)}, 0, ${150 + Math.floor(Math.random() * 100)}, 0.2)`;
      } else {
        color = `rgba(${150 + Math.floor(Math.random() * 100)}, ${50 + Math.floor(Math.random() * 30)}, ${150 + Math.floor(Math.random() * 100)}, 0.2)`;
      }
    }
    
    // Draw aurora wave
    ctx.fillStyle = color;
    ctx.globalCompositeOperation = 'screen';
    
    // Draw multiple passes for a more vibrant effect
    const passes = 3 + Math.floor(intensity * 5);
    for (let pass = 0; pass < passes; pass++) {
      // Vary the wave slightly for each pass
      const phaseOffset = Math.random() * Math.PI * 2;
      const yOffset = (Math.random() - 0.5) * 10;
      
      ctx.beginPath();
      ctx.moveTo(0, yPosition + yOffset + height);
      
      // Draw the top of the wave
      for (let x = 0; x < canvas.width; x += 5) {
        const y = yPosition + yOffset + Math.sin((x / canvas.width) * Math.PI * 2 * waveFrequency + phaseOffset) * waveAmplitude;
        ctx.lineTo(x, y);
      }
      
      // Complete the shape
      ctx.lineTo(canvas.width, yPosition + yOffset + height);
      ctx.lineTo(0, yPosition + yOffset + height);
      ctx.closePath();
      ctx.fill();
    }
  }
  
  // Add stars if more intense
  if (intensity > 0.5) {
    const starCount = Math.floor(intensity * 200);
    
    for (let i = 0; i < starCount; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * (canvas.height * 0.6); // Only in top portion
      const size = 0.5 + Math.random() * 1.5;
      
      // Star opacity stronger at top of image
      const opacity = 0.3 + (1 - y / canvas.height) * 0.6;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      
      // Add glow to some stars
      if (Math.random() > 0.8) {
        const glowRadius = size * 3;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
        glow.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
        glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  
  // Reset composite operation
  ctx.globalCompositeOperation = 'source-over';
  
  // Add a subtle vignette
  const gradient = ctx.createRadialGradient(
    canvas.width / 2, canvas.height / 2, canvas.height * 0.3,
    canvas.width / 2, canvas.height / 2, canvas.height * 0.9
  );
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Helper functions for visual effects

// Apply convolution filter (for edge detection, blur, etc)
function applyConvolution(
  imageData: ImageData,
  width: number,
  height: number,
  kernel: number[]
): ImageData {
  const output = new ImageData(width, height);
  const data = imageData.data;
  const outputData = output.data;
  
  const kSize = Math.sqrt(kernel.length);
  const kHalfSize = Math.floor(kSize / 2);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dstIdx = (y * width + x) * 4;
      
      let r = 0, g = 0, b = 0;
      
      // Apply kernel
      for (let ky = 0; ky < kSize; ky++) {
        for (let kx = 0; kx < kSize; kx++) {
          const srcY = Math.min(height - 1, Math.max(0, y + ky - kHalfSize));
          const srcX = Math.min(width - 1, Math.max(0, x + kx - kHalfSize));
          const srcIdx = (srcY * width + srcX) * 4;
          const kernelValue = kernel[ky * kSize + kx];
          
          r += data[srcIdx] * kernelValue;
          g += data[srcIdx + 1] * kernelValue;
          b += data[srcIdx + 2] * kernelValue;
        }
      }
      
      // Set output pixel
      outputData[dstIdx] = Math.min(255, Math.max(0, r));
      outputData[dstIdx + 1] = Math.min(255, Math.max(0, g));
      outputData[dstIdx + 2] = Math.min(255, Math.max(0, b));
      outputData[dstIdx + 3] = data[dstIdx + 3]; // Keep original alpha
    }
  }
  
  return output;
}

// Apply gaussian blur effect
function applyGaussianBlur(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  radius: number
): void {
  // Create a smaller blur kernel for performance
  const size = Math.ceil(radius) * 2 + 1;
  const sigma = radius / 3;
  
  // Generate 1D Gaussian kernel
  const kernel: number[] = new Array(size);
  let sum = 0;
  const center = Math.floor(size / 2);
  
  for (let i = 0; i < size; i++) {
    const x = i - center;
    // Gaussian function
    kernel[i] = Math.exp(-(x * x) / (2 * sigma * sigma));
    sum += kernel[i];
  }
  
  // Normalize kernel
  for (let i = 0; i < size; i++) {
    kernel[i] /= sum;
  }
  
  // Get current image data
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const tempData = new Uint8ClampedArray(data.length);
  
  // Apply horizontal blur pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      
      for (let i = 0; i < size; i++) {
        const sampleX = Math.min(width - 1, Math.max(0, x + i - center));
        const idx = (y * width + sampleX) * 4;
        
        r += data[idx] * kernel[i];
        g += data[idx + 1] * kernel[i];
        b += data[idx + 2] * kernel[i];
        a += data[idx + 3] * kernel[i];
      }
      
      const idx = (y * width + x) * 4;
      tempData[idx] = r;
      tempData[idx + 1] = g;
      tempData[idx + 2] = b;
      tempData[idx + 3] = a;
    }
  }
  
  // Apply vertical blur pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      
      for (let i = 0; i < size; i++) {
        const sampleY = Math.min(height - 1, Math.max(0, y + i - center));
        const idx = (sampleY * width + x) * 4;
        
        r += tempData[idx] * kernel[i];
        g += tempData[idx + 1] * kernel[i];
        b += tempData[idx + 2] * kernel[i];
        a += tempData[idx + 3] * kernel[i];
      }
      
      const idx = (y * width + x) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = a;
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
}

// Apply bloom/glow effect
function applyBloomEffect(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  intensity: number
): void {
  // Get current image data
  const original = ctx.getImageData(0, 0, width, height);
  
  // Create a temporary canvas for bloom processing
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return;
  
  // Copy original image to temp canvas
  tempCtx.putImageData(original, 0, 0);
  
  // Apply threshold to keep only bright areas
  const threshold = 1 - intensity * 0.5;
  const imageData = tempCtx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    // Calculate brightness - weighted RGB average
    const brightness = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
    
    // Keep only bright pixels for bloom
    if (brightness < threshold) {
      data[i] = 0;      // R
      data[i + 1] = 0;  // G
      data[i + 2] = 0;  // B
      data[i + 3] = 0;  // A
    }
  }
  
  tempCtx.putImageData(imageData, 0, 0);
  
  // Apply gaussian blur to the bright areas
  const blurRadius = 5 + intensity * 15;
  applyGaussianBlur(tempCtx, width, height, blurRadius);
  
  // Composite the bloom back onto the original image
  ctx.globalCompositeOperation = 'screen';
  ctx.drawImage(tempCanvas, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
}

// Apply bilateral blur (edge-preserving blur)
function applyBilateralBlur(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  radius: number,
  colorThreshold: number
): void {
  const original = ctx.getImageData(0, 0, width, height);
  const output = ctx.createImageData(width, height);
  
  const origData = original.data;
  const outData = output.data;
  
  const radiusSq = radius * radius;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const centerIdx = (y * width + x) * 4;
      const centerR = origData[centerIdx];
      const centerG = origData[centerIdx + 1];
      const centerB = origData[centerIdx + 2];
      
      let totalR = 0, totalG = 0, totalB = 0, totalA = 0;
      let weightSum = 0;
      
      // Process pixels in kernel
      for (let ky = Math.max(0, y - radius); ky <= Math.min(height - 1, y + radius); ky++) {
        for (let kx = Math.max(0, x - radius); kx <= Math.min(width - 1, x + radius); kx++) {
          // Skip if outside radius
          const distSq = (kx - x) * (kx - x) + (ky - y) * (ky - y);
          if (distSq > radiusSq) continue;
          
          const idx = (ky * width + kx) * 4;
          const r = origData[idx];
          const g = origData[idx + 1];
          const b = origData[idx + 2];
          const a = origData[idx + 3];
          
          // Calculate color difference
          const colorDiff = Math.abs(r - centerR) + Math.abs(g - centerG) + Math.abs(b - centerB);
          
          // Spatial weight (based on distance)
          const spatialWeight = Math.exp(-distSq / (2 * radiusSq));
          
          // Color weight (based on color similarity)
          const colorWeight = Math.exp(-(colorDiff * colorDiff) / (2 * colorThreshold * colorThreshold));
          
          // Combined weight
          const weight = spatialWeight * colorWeight;
          
          // Accumulate
          totalR += r * weight;
          totalG += g * weight;
          totalB += b * weight;
          totalA += a * weight;
          weightSum += weight;
        }
      }
      
      // Normalize and set output pixel
      if (weightSum > 0) {
        outData[centerIdx] = Math.round(totalR / weightSum);
        outData[centerIdx + 1] = Math.round(totalG / weightSum);
        outData[centerIdx + 2] = Math.round(totalB / weightSum);
        outData[centerIdx + 3] = Math.round(totalA / weightSum);
      } else {
        outData[centerIdx] = centerR;
        outData[centerIdx + 1] = centerG;
        outData[centerIdx + 2] = centerB;
        outData[centerIdx + 3] = origData[centerIdx + 3];
      }
    }
  }
  
  ctx.putImageData(output, 0, 0);
}