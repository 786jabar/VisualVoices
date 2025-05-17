/**
 * Advanced 3D noise generation for terrain and particle effects
 * Based on Improved Perlin Noise algorithm with 3D support
 */

// Permutation table
const permutation: number[] = [
  151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36,
  103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0,
  26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56,
  87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166,
  77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55,
  46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132,
  187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109,
  198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126,
  255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183,
  170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43,
  172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112,
  104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162,
  241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106,
  157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205,
  93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180
];

// Double permutation array to avoid overflow
const p: number[] = Array(512);
for (let i = 0; i < 256; i++) {
  p[i] = p[i + 256] = permutation[i];
}

// Fade function for smoother interpolation
function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

// Linear interpolation
function lerp(t: number, a: number, b: number): number {
  return a + t * (b - a);
}

// Gradient function for 3D noise
function grad(hash: number, x: number, y: number, z: number): number {
  // Convert lower 4 bits of hash into 12 gradient directions
  const h = hash & 15;
  const u = h < 8 ? x : y;
  const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

/**
 * 3D Perlin noise implementation
 * @param x X coordinate
 * @param y Y coordinate
 * @param z Z coordinate
 * @returns Noise value in range [-1, 1]
 */
export function noise3D(x: number, y: number, z: number): number {
  // Find unit cube that contains the point
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  const Z = Math.floor(z) & 255;
  
  // Find relative x, y, z of point in cube
  x -= Math.floor(x);
  y -= Math.floor(y);
  z -= Math.floor(z);
  
  // Compute fade curves for each coordinate
  const u = fade(x);
  const v = fade(y);
  const w = fade(z);
  
  // Hash coordinates of the 8 cube corners
  const A = p[X] + Y;
  const AA = p[A] + Z;
  const AB = p[A + 1] + Z;
  const B = p[X + 1] + Y;
  const BA = p[B] + Z;
  const BB = p[B + 1] + Z;
  
  // Add blended results from 8 corners of cube
  return lerp(w, lerp(v, lerp(u, grad(p[AA], x, y, z),
                                 grad(p[BA], x - 1, y, z)),
                         lerp(u, grad(p[AB], x, y - 1, z),
                                 grad(p[BB], x - 1, y - 1, z))),
                 lerp(v, lerp(u, grad(p[AA + 1], x, y, z - 1),
                                 grad(p[BA + 1], x - 1, y, z - 1)),
                         lerp(u, grad(p[AB + 1], x, y - 1, z - 1),
                                 grad(p[BB + 1], x - 1, y - 1, z - 1))));
}

/**
 * Generate fractal Brownian motion (fBm) noise for more natural terrain
 * @param x X coordinate
 * @param y Y coordinate
 * @param z Z coordinate
 * @param octaves Number of layers of noise
 * @param persistence How much each octave contributes
 * @param lacunarity Frequency multiplier for each octave
 * @returns Noise value in range [-1, 1]
 */
export function fbm3D(
  x: number, 
  y: number, 
  z: number, 
  octaves: number = 6, 
  persistence: number = 0.5, 
  lacunarity: number = 2
): number {
  let total = 0;
  let frequency = 1;
  let amplitude = 1;
  let maxValue = 0;  // Used for normalizing result
  
  for (let i = 0; i < octaves; i++) {
    total += noise3D(x * frequency, y * frequency, z * frequency) * amplitude;
    
    maxValue += amplitude;
    
    amplitude *= persistence;
    frequency *= lacunarity;
  }
  
  // Normalize the result
  return total / maxValue;
}

/**
 * Generate ridged multifractal noise (for mountains & ridges)
 * @param x X coordinate
 * @param y Y coordinate
 * @param z Z coordinate
 * @param octaves Number of layers of noise
 * @param persistence How much each octave contributes
 * @param lacunarity Frequency multiplier for each octave
 * @param gain Controls the height of the ridges
 * @returns Noise value in range [0, 1]
 */
export function ridgedMultifractal(
  x: number, 
  y: number, 
  z: number, 
  octaves: number = 6, 
  persistence: number = 0.5,
  lacunarity: number = 2.0,
  gain: number = 2.0
): number {
  let sum = 0;
  let frequency = 1.0;
  let amplitude = 0.5;
  let prev = 1.0;
  let maxValue = 0;
  
  for (let i = 0; i < octaves; i++) {
    // Get absolute value of noise and invert it to create ridges
    const n = Math.abs(noise3D(x * frequency, y * frequency, z * frequency));
    const signal = 1.0 - n;
    
    // Square the signal to increase the ridge sharpness
    const signalSq = signal * signal;
    
    // Add weighted signal to sum
    sum += signalSq * amplitude * prev;
    
    // Weight successive contributions by previous signal
    prev = signalSq * gain;
    if (prev > 1.0) prev = 1.0;
    if (prev < 0.0) prev = 0.0;
    
    maxValue += amplitude;
    
    frequency *= lacunarity;
    amplitude *= persistence;
  }
  
  // Normalize the result
  return sum / maxValue;
}

/**
 * Generate domain-warped noise for even more natural terrain
 * @param x X coordinate
 * @param y Y coordinate
 * @param z Z coordinate
 * @param warpStrength How much to distort the domain
 * @returns Warped noise value in range [-1, 1]
 */
export function domainWarpedNoise(
  x: number, 
  y: number, 
  z: number, 
  warpStrength: number = 1.0
): number {
  // Create domain distortion
  const warpX = noise3D(x * 0.5, y * 0.5, z * 0.5) * warpStrength;
  const warpY = noise3D(x * 0.5 + 100, y * 0.5 + 100, z * 0.5) * warpStrength;
  const warpZ = noise3D(x * 0.5 + 200, y * 0.5 + 200, z * 0.5 + 200) * warpStrength;
  
  // Sample noise at warped coordinates
  return fbm3D(x + warpX, y + warpY, z + warpZ);
}

/**
 * Create a 2D terrain heightmap using various noise techniques
 * @param width Width of the terrain in points
 * @param height Height of the terrain in points
 * @param options Various terrain generation options
 * @returns 2D array of height values
 */
export function generateTerrain(
  width: number,
  height: number,
  options: {
    scale?: number;
    octaves?: number;
    persistence?: number;
    lacunarity?: number;
    elevation?: number;
    warp?: boolean;
    ridged?: boolean;
    seed?: number;
  } = {}
): number[][] {
  // Set default options
  const {
    scale = 0.01,
    octaves = 6,
    persistence = 0.5,
    lacunarity = 2.0,
    elevation = 1.0,
    warp = false,
    ridged = false,
    seed = 0
  } = options;
  
  const terrain: number[][] = Array(height)
    .fill(0)
    .map(() => Array(width).fill(0));
  
  // Generate terrain heights
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Calculate noise coordinates with scaling
      const nx = x * scale + seed;
      const ny = y * scale + seed;
      const nz = seed * 0.1;
      
      let value: number;
      
      if (ridged) {
        // Use ridged multifractal noise for dramatic terrain
        value = ridgedMultifractal(nx, ny, nz, octaves, persistence, lacunarity);
      } else if (warp) {
        // Use domain warping for complex terrain
        value = domainWarpedNoise(nx, ny, nz, 2.5);
      } else {
        // Use fBm for smoother terrain
        value = fbm3D(nx, ny, nz, octaves, persistence, lacunarity);
      }
      
      // Normalize value to 0-1 range and apply elevation scaling
      terrain[y][x] = ((value + 1) * 0.5) * elevation;
    }
  }
  
  return terrain;
}

/**
 * Generate normals for a terrain heightmap
 * @param terrain Terrain heightmap
 * @returns Array of normal vectors for terrain
 */
export function calculateTerrainNormals(terrain: number[][]): { x: number; y: number; z: number; }[][] {
  const height = terrain.length;
  const width = terrain[0].length;
  const normals: { x: number; y: number; z: number; }[][] = [];
  
  for (let y = 0; y < height; y++) {
    normals[y] = [];
    for (let x = 0; x < width; x++) {
      // Get heights of neighboring points
      const left = x > 0 ? terrain[y][x - 1] : terrain[y][x];
      const right = x < width - 1 ? terrain[y][x + 1] : terrain[y][x];
      const top = y > 0 ? terrain[y - 1][x] : terrain[y][x];
      const bottom = y < height - 1 ? terrain[y + 1][x] : terrain[y][x];
      
      // Calculate derivatives
      const dZdX = (right - left) / 2;
      const dZdY = (bottom - top) / 2;
      
      // Calculate normal vector using cross product
      const normal = normalizeVector({
        x: -dZdX,
        y: -dZdY,
        z: 1
      });
      
      normals[y][x] = normal;
    }
  }
  
  return normals;
}

/**
 * Normalize a 3D vector
 * @param vector Vector to normalize
 * @returns Normalized vector
 */
function normalizeVector(vector: { x: number; y: number; z: number; }): { x: number; y: number; z: number; } {
  const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
  
  if (length === 0) {
    return { x: 0, y: 0, z: 1 }; // Default normal if length is zero
  }
  
  return {
    x: vector.x / length,
    y: vector.y / length,
    z: vector.z / length
  };
}