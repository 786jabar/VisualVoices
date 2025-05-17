import React, { useEffect, useRef, useCallback } from 'react';
// Fix for p5.js type issues - using a more explicit import approach
// @ts-ignore - Suppressing TypeScript errors for p5 import
import p5 from 'p5';

// Define prop types
interface LandscapePreviewCanvasProps {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  soundscapeType: 'peaceful' | 'mysterious' | 'dramatic' | 'cheerful' | 'melancholic' | 'cosmic' | 'galactic';
  isActive: boolean;
}

// Default colors for fallback scenarios
const DEFAULT_COLORS = {
  primary: '#3b5998',
  secondary: '#192a56',
  accent: '#4cd137'
};

const LandscapePreviewCanvas: React.FC<LandscapePreviewCanvasProps> = ({ 
  colors, 
  soundscapeType,
  isActive
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);

  // Cleanup p5 instance when component unmounts
  useEffect(() => {
    return () => {
      if (p5InstanceRef.current) {
        try {
          p5InstanceRef.current.remove();
          p5InstanceRef.current = null;
        } catch (err) {
          console.error("Error removing p5 instance:", err);
        }
      }
    };
  }, []);
  
  useEffect(() => {
    // Only create new instance if none exists and container is ready
    if (!canvasRef.current) return;
    
    console.log(`Creating landscape canvas for ${soundscapeType} landscape. isActive:`, isActive);
    
    // If a p5 instance already exists, remove it before creating a new one
    if (p5InstanceRef.current) {
      try {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      } catch (err) {
        console.error("Error removing existing p5 instance:", err);
      }
    }

    // Safely extract colors with fallbacks
    const safeColors = {
      primary: colors?.primary || DEFAULT_COLORS.primary,
      secondary: colors?.secondary || DEFAULT_COLORS.secondary,
      accent: colors?.accent || DEFAULT_COLORS.accent
    };

    // Create new p5 instance for rendering 3D landscape visualization
    const sketch = (p: p5) => {
      // Canvas setup variables
      const particles: any[] = [];
      const numParticles = 100;
      let terrain: number[][] = [];
      let cols: number, rows: number;
      let flying = 0;
      let flowField: p5.Vector[] = [];
      const scl = 20;
      
      // Canvas dimensions
      let canvasWidth = 0;
      let canvasHeight = 0;
      
      // Landscape style flags
      const isMountainous = soundscapeType === 'dramatic' || soundscapeType === 'peaceful';
      const isFlowing = soundscapeType === 'mysterious' || soundscapeType === 'cheerful';
      const useBlend = soundscapeType === 'melancholic';
      const isGalactic = soundscapeType === 'galactic';
      const isCosmic = soundscapeType === 'cosmic';
      
      // Color objects - initialized in setup
      let primaryColor: any = null;
      let secondaryColor: any = null;
      let accentColor: any = null;
      
      console.log(`Setting up ${soundscapeType} landscape`);

      // Initialize particles for atmospheric effects
      function initializeParticles() {
        // Adjust number of particles based on visualization type
        const particleCount = isGalactic || isCosmic ? numParticles * 1.5 : numParticles;
        
        for (let i = 0; i < particleCount; i++) {
          let pos, vel, particleColor, particleType, particleSize, particleAlpha, orbitRadius, orbitSpeed;
          
          // Create different types of particles based on landscape type
          if (isGalactic) {
            // For galactic landscapes, create spiral galaxy distribution
            const angle = p.random(p.TWO_PI);
            const distance = p.random(50, p.width/2 * 0.8);
            const spiralOffset = p.random(0, 15) * (Math.random() > 0.5 ? 1 : -1);
            
            // Spiral galaxy coordinates
            pos = p.createVector(
              Math.cos(angle + spiralOffset/100 * distance) * distance,
              Math.sin(angle + spiralOffset/100 * distance) * distance * 0.3, // Flatten the galaxy
              p.random(-30, 30)
            );
            
            // Orbital velocity for spiral galaxy
            vel = p.createVector(
              -pos.y * 0.01, // Orbital velocity
              pos.x * 0.01,
              0
            );
            
            // Stars in the spiral galaxy have different colors based on position
            try {
              const starColorRandom = p.random();
              if (starColorRandom > 0.97) {
                // Red giant stars
                particleColor = p.color(255, 100, 50);
                particleSize = p.random(4, 8);
                particleType = 'redgiant';
              } else if (starColorRandom > 0.93) {
                // Blue bright stars
                particleColor = p.color(100, 150, 255);
                particleSize = p.random(3, 6);
                particleType = 'bluestar';
              } else if (starColorRandom > 0.85) {
                // Yellow stars like our sun
                particleColor = p.color(255, 230, 150);
                particleSize = p.random(2, 4);
                particleType = 'yellowstar';
              } else {
                // Common white/dim stars
                particleColor = p.lerpColor(
                  p.color(200, 200, 255),
                  p.color(255, 255, 255),
                  p.random()
                );
                particleSize = p.random(1, 3);
                particleType = 'whitestar';
              }
            } catch (err) {
              particleColor = p.color(200, 200, 255);
              particleSize = p.random(1, 3);
              particleType = 'default';
            }
            
            particleAlpha = p.random(150, 230);
            
          } else if (isCosmic) {
            // For cosmic landscapes, create a nebula with dust and stars
            pos = p.createVector(
              p.random(-p.width/2, p.width/2),
              p.random(-p.height/2, p.height/2),
              p.random(-80, 80)
            );
            
            vel = p.createVector(
              p.random(-0.5, 0.5) * 0.2,
              p.random(-0.5, 0.5) * 0.2,
              p.random(-0.1, 0.1) * 0.1
            );
            
            // Colors for nebula particles
            try {
              const nebulaType = p.random();
              if (nebulaType > 0.7) {
                // Purple/blue nebula dust
                particleColor = p.lerpColor(
                  p.color(80, 50, 120), 
                  p.color(50, 70, 180),
                  p.random()
                );
                particleType = 'nebuladust';
                particleSize = p.random(5, 12);
                particleAlpha = p.random(30, 100); // More transparent
              } else if (nebulaType > 0.4) {
                // Red/orange nebula dust
                particleColor = p.lerpColor(
                  p.color(180, 60, 30), 
                  p.color(220, 100, 40),
                  p.random()
                );
                particleType = 'nebuladust';
                particleSize = p.random(4, 10);
                particleAlpha = p.random(30, 100); // More transparent
              } else {
                // Stars within the nebula
                particleColor = p.color(255, 255, 255);
                particleType = 'star';
                particleSize = p.random(1, 3);
                particleAlpha = p.random(150, 250); // Brighter
              }
            } catch (err) {
              particleColor = p.color(150, 150, 200);
              particleType = 'default';
              particleSize = p.random(2, 6);
              particleAlpha = p.random(100, 200);
            }
          } else {
            // Regular landscape particles
            pos = p.createVector(
              p.random(-p.width/2, p.width/2),
              p.random(-p.height/2, p.height/2),
              p.random(-100, 100)
            );
            
            vel = p.createVector(
              p.random(-1, 1) * 0.3,
              p.random(-1, 1) * 0.3,
              p.random(-0.5, 0.5) * 0.4
            );
            
            try {
              particleColor = p.lerpColor(secondaryColor, accentColor, p.random());
            } catch (err) {
              particleColor = p.color(150, 150, 200);
            }
            
            particleSize = p.random(2, 6);
            particleAlpha = p.random(100, 200);
            particleType = 'regular';
          }
          
          // Add the particle with all properties
          particles.push({
            pos: pos,
            vel: vel,
            size: particleSize || p.random(2, 6),
            color: particleColor,
            alpha: particleAlpha || p.random(100, 200),
            type: particleType || 'regular',
            // Additional properties for special particles
            orbitAngle: p.random(p.TWO_PI), // Starting angle for orbital motion
            pulseFactor: p.random(0.01, 0.05), // For pulsating stars
            pulseSpeed: p.random(0.02, 0.06) // Speed of pulsation
          });
        }
      }

      // Create flow field for dynamic particle movement
      function createFlowField() {
        flowField = [];
        const resolution = 20;
        const cols = Math.ceil(p.width / resolution);
        const rows = Math.ceil(p.height / resolution);
        
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const angle = p.noise(x * 0.1, y * 0.1) * p.TWO_PI * 2;
            const v = p5.Vector.fromAngle(angle);
            v.setMag(0.5);
            flowField.push(v);
          }
        }
      }
      
      // Generate terrain heightmap using Perlin noise
      function refreshTerrain() {
        terrain = [];
        for (let x = 0; x < cols; x++) {
          terrain[x] = [];
          for (let y = 0; y < rows; y++) {
            let noiseVal;
            
            if (isMountainous) {
              noiseVal = p.noise(x * 0.1, y * 0.1, flying) * 70;
              if (noiseVal > 30) noiseVal *= 1.5;
            } else if (useBlend) {
              noiseVal = p.noise(x * 0.07, y * 0.07, flying) * 50;
            } else {
              noiseVal = p.noise(x * 0.1, y * 0.1, flying) * 60;
            }
            
            terrain[x][y] = noiseVal;
          }
        }
      }

      // Setup function - p5.js initialization
      p.setup = () => {
        if (!canvasRef.current) return;
        
        try {
          console.log("Setting up landscape canvas:", soundscapeType);
          
          // Force clear any existing canvas to prevent stacking
          if (canvasRef.current) {
            while (canvasRef.current.firstChild) {
              canvasRef.current.removeChild(canvasRef.current.firstChild);
            }
          }
          
          // Create canvas that fills the container div with error handling
          let canvasWidth = 300, canvasHeight = 200;
          
          // Make sure we get valid dimensions
          if (canvasRef.current) {
            canvasWidth = canvasRef.current.offsetWidth || 300;
            canvasHeight = canvasRef.current.offsetHeight || 200;
            
            // Log dimensions for debugging
            console.log(`Canvas dimensions: ${canvasWidth}x${canvasHeight}`);
            
            // Ensure minimum size to prevent rendering issues
            canvasWidth = Math.max(canvasWidth, 100);
            canvasHeight = Math.max(canvasHeight, 100);
          }
          
          // Create canvas with P2D renderer instead of WebGL to avoid shader errors
          const canvas = p.createCanvas(canvasWidth, canvasHeight);
          
          // Set the canvas to fill its container
          canvas.style('width', '100%');
          canvas.style('height', '100%');
          
          // Only attach to parent if it exists
          if (canvasRef.current) {
            canvas.parent(canvasRef.current);
          }
          
          // Set rendering parameters - lower framerate for better performance
          p.frameRate(24);
          
          // Initialize terrain grid with validation
          cols = Math.ceil(p.width / scl) + 2;
          rows = Math.ceil(p.height / scl) + 2;
          
          // Ensure cols and rows are valid numbers
          cols = isNaN(cols) ? 20 : cols;
          rows = isNaN(rows) ? 20 : rows;
          
          // Safely initialize colors with validation checks
          try {
            // Make sure all color strings are valid
            const validPrimary = typeof safeColors.primary === 'string' ? safeColors.primary : '#3b5998';
            const validSecondary = typeof safeColors.secondary === 'string' ? safeColors.secondary : '#192a56';
            const validAccent = typeof safeColors.accent === 'string' ? safeColors.accent : '#4cd137';
            
            primaryColor = p.color(validPrimary);
            secondaryColor = p.color(validSecondary);
            accentColor = p.color(validAccent);
          } catch (err) {
            console.error('Error creating colors:', err);
            // Fallback to RGB values if hex parsing fails
            primaryColor = p.color(59, 89, 152);
            secondaryColor = p.color(25, 42, 86);
            accentColor = p.color(76, 209, 55);
          }
          
          // Initialize scene elements with try-catch blocks
          try {
            createFlowField();
            refreshTerrain();
            initializeParticles();
          } catch (err) {
            console.error('Error initializing p5.js scene:', err);
          }
        } catch (setupErr) {
          console.error('Critical error in p5.js setup:', setupErr);
        }
      };

      // Draw function - called every frame
      p.draw = () => {
        // Skip rendering if visualization isn't supposed to be active
        if (!isActive) return;
        
        try {
          // Set lower framerate for better performance
          p.frameRate(20);
          
          // Clear background with gradient
          drawBackground();
          
          // Performance optimization: Only update terrain periodically
          const shouldUpdateTerrain = p.frameCount % 3 === 0;
          
          // Special rendering for galaxy landscapes
          if (isGalactic || isCosmic) {
            // For galaxy landscapes, we'll render differently
            // Slowly rotate the entire view to simulate galaxy rotation
            p.push();
            p.rotateZ(p.frameCount * 0.0005);
            
            // Add a subtle camera movement for cosmic effect
            const cameraMovement = p.sin(p.frameCount * 0.01) * 5;
            p.translate(0, cameraMovement, 0);
            
            // Draw 3D terrain (this function will exit early for galaxy types)
            drawTerrain();
            
            // Update particles every frame for smoother galaxy movement
            updateParticles();
            
            // Draw a central glow for galactic core
            if (isGalactic) {
              p.push();
              p.noStroke();
              // Glowing core with pulsating size
              const coreSize = 50 + p.sin(p.frameCount * 0.02) * 10;
              const coreGlow = 120 + p.sin(p.frameCount * 0.03) * 30;
              
              // Outer glow
              p.fill(255, 255, 220, 30);
              p.ellipse(0, 0, coreGlow);
              
              // Inner core
              p.fill(255, 240, 200, 70);
              p.ellipse(0, 0, coreSize);
              p.pop();
            }
            // For cosmic nebula, add dust cloud effects
            else if (isCosmic) {
              p.push();
              p.noStroke();
              
              // Create nebula dust clouds
              for (let i = 0; i < 3; i++) {
                const angle = p.TWO_PI * i / 3 + p.frameCount * 0.001;
                const distance = 100 + p.sin(p.frameCount * 0.01 + i) * 20;
                const x = p.cos(angle) * distance;
                const y = p.sin(angle) * distance;
                
                const dustSize = 80 + p.sin(p.frameCount * 0.02 + i * 0.5) * 20;
                
                // Use colors from the theme
                const nebulaBrightness = 0.6 + p.sin(p.frameCount * 0.02 + i) * 0.2;
                p.fill(p.red(accentColor), p.green(accentColor), p.blue(accentColor), 40 * nebulaBrightness);
                
                p.push();
                p.translate(x, y);
                p.beginShape();
                // Create irregular cloud shape
                for (let j = 0; j < 10; j++) {
                  const a = j * p.TWO_PI / 10;
                  const r = dustSize * (0.7 + p.noise(i, j, p.frameCount * 0.01) * 0.5);
                  p.vertex(p.cos(a) * r, p.sin(a) * r);
                }
                p.endShape(p.CLOSE);
                p.pop();
              }
              p.pop();
            }
            
            p.pop(); // End galaxy rotation transform
          } 
          else {
            // Regular landscape rendering for non-galaxy types
            // Draw 3D terrain
            drawTerrain();
            
            // Update particles less frequently to improve performance
            if (p.frameCount % 2 === 0) {
              updateParticles();
            }
            
            // Move through terrain if in flow mode, but at reduced rate
            if (isFlowing && shouldUpdateTerrain) {
              flying -= 0.008; // Reduced from 0.015 for smoother animation
              try {
                refreshTerrain();
              } catch (err) {
                console.error('Error refreshing terrain:', err);
              }
            }
          }
        } catch (drawError) {
          // Log errors but don't crash the component
          console.error('Error in p5.js draw cycle:', drawError);
          
          // Attempt basic recovery - clear the canvas
          try {
            p.background(0);
          } catch (e) {
            // Critical failure - can't even clear background
          }
        }
      };
      
      // Draw gradient background
      function drawBackground() {
        p.background(0);
        p.push();
        p.noStroke();
        
        // Draw gradient sky
        p.push();
        p.translate(0, 0, -500);
        p.rotateX(p.PI/2);
        
        let skyColorTop, skyColorBottom;
        
        try {
          skyColorTop = p.color(p.red(primaryColor), p.green(primaryColor), p.blue(primaryColor));
          skyColorBottom = p.color(p.red(secondaryColor), p.green(secondaryColor), p.blue(secondaryColor));
          
          // Adjust colors based on soundscape type
          if (soundscapeType === 'dramatic') {
            skyColorTop.setAlpha(180);
            skyColorBottom.setAlpha(220);
          } else if (soundscapeType === 'mysterious') {
            skyColorTop.setAlpha(150);
            skyColorBottom.setAlpha(200);
          } else if (soundscapeType === 'galactic') {
            // Deep space black with hints of blue
            skyColorTop = p.color(5, 10, 30, 255);
            skyColorBottom = p.color(0, 0, 10, 255);
          } else if (soundscapeType === 'cosmic') {
            // Nebula-like background
            skyColorTop = p.color(40, 0, 60, 220);  // Deep purple
            skyColorBottom = p.color(5, 0, 20, 255); // Almost black
          } else {
            skyColorTop.setAlpha(200);
            skyColorBottom.setAlpha(240);
          }
        } catch (err) {
          // Default fallback colors
          skyColorTop = p.color(50, 100, 150, 200);
          skyColorBottom = p.color(20, 40, 80, 240);
        }
        
        // Draw sky gradient lines
        for (let y = -p.height/2; y < p.height/2; y += 5) {
          try {
            const inter = p.map(y, -p.height/2, p.height/2, 0, 1);
            const c = p.lerpColor(skyColorTop, skyColorBottom, inter);
            p.stroke(c);
          } catch (err) {
            // Fallback if color lerping fails
            const brightness = p.map(y, -p.height/2, p.height/2, 100, 40);
            p.stroke(50, 70, brightness, 200);
          }
          p.line(-p.width/2, y, p.width/2, y);
        }
        p.pop();
        p.pop();
      }
      
      // Draw 3D terrain
      function drawTerrain() {
        p.push();
        
        // Position the terrain in the canvas
        p.translate(-p.width/2, 0);
        p.rotateX(p.PI/3); // Tilt the terrain
        p.translate(0, 50);
        
        try {
          // Apply different rendering styles based on soundscape
          if (soundscapeType === 'peaceful') {
            p.stroke(255, 100);
            p.noFill();
          } else if (soundscapeType === 'dramatic') {
            p.stroke(accentColor);
            p.fill(primaryColor);
            p.strokeWeight(0.5);
          } else if (soundscapeType === 'mysterious') {
            p.noStroke();
            p.fill(primaryColor);
          } else if (soundscapeType === 'cheerful') {
            p.stroke(accentColor);
            p.fill(secondaryColor);
            p.strokeWeight(0.7);
          } else if (soundscapeType === 'galactic' || soundscapeType === 'cosmic') {
            // For galaxy landscapes, don't render terrain normally
            // We'll handle special rendering in updateParticles
            p.noStroke();
            p.noFill();
            
            // Skip terrain rendering for galaxy and return early
            p.pop();
            return;
          } else { // melancholic
            p.stroke(50);
            p.fill(primaryColor);
            p.strokeWeight(0.3);
          }
        } catch (err) {
          // Fallback style if colors aren't available
          p.stroke(200, 100);
          p.fill(30, 40, 80);
          p.strokeWeight(0.5);
        }
        
        // Draw terrain as triangle strips
        for (let y = 0; y < rows-1; y++) {
          p.beginShape(p.TRIANGLE_STRIP);
          for (let x = 0; x < cols; x++) {
            if (useBlend && x % 2 === 0) {
              try {
                p.fill(p.lerpColor(primaryColor, secondaryColor, p.noise(x*0.1, y*0.1)));
              } catch (err) {
                // Fallback if color lerp fails
                p.fill(30, 40, 80);
              }
            }
            
            // Add vertices for current row and next row
            p.vertex(x * scl, y * scl, terrain[x]?.[y] || 0);
            p.vertex(x * scl, (y + 1) * scl, terrain[x]?.[y + 1] || 0);
          }
          p.endShape();
        }
        p.pop();
      }
      
      // Update and draw particles
      function updateParticles() {
        p.push();
        p.noStroke();
        
        for (let i = 0; i < particles.length; i++) {
          const particle = particles[i];
          
          // Move particles
          if (isFlowing && flowField.length > 0) {
            try {
              // Follow flow field for more organic movement
              const index = Math.floor(
                ((particle.pos.x + p.width/2) / p.width * (flowField.length/(rows || 1))) + 
                ((particle.pos.y + p.height/2) / p.height * (rows || 1))
              ) % flowField.length;
              
              if (index >= 0 && index < flowField.length) {
                const force = flowField[index].copy();
                force.mult(0.1);
                particle.vel.add(force);
              }
              
              particle.vel.limit(0.7);
            } catch (err) {
              // Simple movement if flow field fails
              particle.vel.add(p.createVector(p.random(-0.01, 0.01), p.random(-0.01, 0.01)));
            }
          }
          
          // Update position
          particle.pos.add(particle.vel);
          
          // Wrap particles around canvas edges
          if (particle.pos.x < -p.width/2) particle.pos.x = p.width/2;
          if (particle.pos.x > p.width/2) particle.pos.x = -p.width/2;
          if (particle.pos.y < -p.height/2) particle.pos.y = p.height/2;
          if (particle.pos.y > p.height/2) particle.pos.y = -p.height/2;
          if (particle.pos.z < -100) particle.pos.z = 100;
          if (particle.pos.z > 100) particle.pos.z = -100;
          
          try {
            // Draw particle with custom style based on soundscape
            let r = 150, g = 150, b = 200, a = 150;
            
            // More robust color extraction with fallbacks
            if (particle && particle.color && particle.color.levels && 
                Array.isArray(particle.color.levels) && particle.color.levels.length >= 3) {
              r = particle.color.levels[0];
              g = particle.color.levels[1];
              b = particle.color.levels[2];
              a = particle.alpha || 150;
            }
            
            // Special rendering for different particle types in Galaxy modes
            if (isGalactic || isCosmic) {
              // Apply different rendering based on particle type
              if (particle.type === 'redgiant') {
                // Red giant stars - larger with glow effect
                const glowSize = (particle.size || 4) * (1.5 + p.sin(p.frameCount * 0.03) * 0.2);
                
                // Outer glow
                p.fill(255, 100, 50, 40);
                p.push();
                p.translate(particle.pos.x, particle.pos.y, particle.pos.z);
                p.ellipse(0, 0, glowSize * 3);
                p.pop();
                
                // Inner star
                p.fill(255, 100, 50, 180);
                p.push();
                p.translate(particle.pos.x, particle.pos.y, particle.pos.z);
                p.ellipse(0, 0, glowSize);
                p.pop();
              } 
              else if (particle.type === 'bluestar') {
                // Blue star with shimmer
                const shimmerFactor = 1 + p.sin(p.frameCount * 0.05 + i * 0.1) * 0.3;
                p.fill(100, 150, 255, 180 * shimmerFactor);
                p.push();
                p.translate(particle.pos.x, particle.pos.y, particle.pos.z);
                p.ellipse(0, 0, particle.size || 3);
                
                // Add rays for blue stars
                if (shimmerFactor > 1.2) {
                  p.stroke(100, 150, 255, 100);
                  p.strokeWeight(0.5);
                  for (let ray = 0; ray < 4; ray++) {
                    const angle = ray * p.PI/2;
                    const length = (particle.size || 3) * 2.5;
                    p.line(0, 0, p.cos(angle) * length, p.sin(angle) * length);
                  }
                }
                p.pop();
              }
              else if (particle.type === 'yellowstar') {
                // Yellow sun-like star
                p.fill(255, 230, 150, 170);
                p.push();
                p.translate(particle.pos.x, particle.pos.y, particle.pos.z);
                p.ellipse(0, 0, particle.size || 2.5);
                p.pop();
              }
              else if (particle.type === 'whitestar') {
                // Small white stars
                const twinkleFactor = 0.7 + p.noise(particle.pos.x * 0.1, particle.pos.y * 0.1, p.frameCount * 0.01) * 0.6;
                p.fill(240, 240, 255, 150 * twinkleFactor);
                p.push();
                p.translate(particle.pos.x, particle.pos.y, particle.pos.z);
                p.ellipse(0, 0, (particle.size || 1.5) * twinkleFactor);
                p.pop();
              }
              else if (particle.type === 'nebuladust') {
                // Nebula dust clouds - semi-transparent
                p.fill(r, g, b, (a || 100) * 0.5);
                p.push();
                p.translate(particle.pos.x, particle.pos.y, particle.pos.z);
                // Draw cloud-like shape
                p.beginShape();
                const cloudSize = particle.size || 8;
                for (let j = 0; j < 8; j++) {
                  const angle = j * p.TWO_PI / 8;
                  const radius = cloudSize * (0.7 + p.noise(p.frameCount * 0.01, j * 0.3) * 0.6);
                  p.vertex(p.cos(angle) * radius, p.sin(angle) * radius);
                }
                p.endShape(p.CLOSE);
                p.pop();
              }
              else {
                // Default cosmic particles
                p.fill(r || 200, g || 200, b || 255, a || 120);
                p.push();
                p.translate(particle.pos.x, particle.pos.y, particle.pos.z);
                p.ellipse(0, 0, particle.size || 2);
                p.pop();
              }
            }
            // Original particle types for other soundscapes
            else if (soundscapeType === 'mysterious') {
              // Mysterious particles as cubes with pulsing transparency
              p.fill(
                r || 100, 
                g || 100, 
                b || 200, 
                (a || 150) * 0.7 * (1 + p.sin(p.frameCount * 0.02 + i * 0.1) * 0.3)
              );
              p.push();
              p.translate(particle.pos.x, particle.pos.y, particle.pos.z);
              p.rotateY(p.frameCount * 0.01);
              p.box(particle.size || 4);
              p.pop();
            } else if (soundscapeType === 'dramatic') {
              // Dramatic particles as stars
              p.fill(
                r || 200, 
                g || 150, 
                b || 100, 
                a || 150
              );
              p.push();
              p.translate(particle.pos.x, particle.pos.y, particle.pos.z);
              drawStar(0, 0, particle.size || 3, (particle.size || 3) * 2, 4);
              p.pop();
            } else {
              // Default particles as circles
              p.fill(
                r || 150, 
                g || 150, 
                b || 200, 
                a || 150
              );
              p.push();
              p.translate(particle.pos.x, particle.pos.y, particle.pos.z);
              p.ellipse(0, 0, particle.size || 4);
              p.pop();
            }
          } catch (err) {
            // Fallback rendering if color extraction fails
            p.fill(150, 150, 200, 150);
            p.push();
            p.translate(particle.pos.x, particle.pos.y, particle.pos.z);
            p.ellipse(0, 0, particle.size || 4);
            p.pop();
          }
        }
        p.pop();
      }
      
      // Draw a star shape for dramatic particles
      function drawStar(x: number, y: number, radius1: number, radius2: number, npoints: number) {
        p.beginShape();
        for (let i = 0; i < npoints * 2; i++) {
          const radius = i % 2 === 0 ? radius1 : radius2;
          const ang = p.map(i, 0, npoints * 2, 0, p.TWO_PI);
          const px = x + p.cos(ang) * radius;
          const py = y + p.sin(ang) * radius;
          p.vertex(px, py);
        }
        p.endShape(p.CLOSE);
      }
      
      // Handle window resize
      p.windowResized = () => {
        if (!canvasRef.current) return;
        try {
          p.resizeCanvas(canvasRef.current.clientWidth || 300, canvasRef.current.clientHeight || 200);
          
          // Reinitialize terrain grid on resize
          cols = Math.ceil(p.width / scl) + 2;
          rows = Math.ceil(p.height / scl) + 2;
          refreshTerrain();
          createFlowField();
        } catch (err) {
          console.log('Error resizing canvas');
        }
      };
    };

    // Create the p5 instance
    try {
      p5InstanceRef.current = new p5(sketch);
    } catch (err) {
      console.error('Error creating p5 instance');
    }

    // Cleanup function
    return () => {
      if (p5InstanceRef.current) {
        try {
          p5InstanceRef.current.remove();
        } catch (err) {
          console.error('Error removing p5 instance');
        }
        p5InstanceRef.current = null;
      }
    };
  }, [colors, soundscapeType]);

  // If soundscape type changes, update the visualization
  useEffect(() => {
    if (p5InstanceRef.current) {
      try {
        p5InstanceRef.current.remove();
      } catch (err) {
        console.error('Error removing p5 instance');
      }
      p5InstanceRef.current = null;
      
      // Short delay to ensure clean removal before new instance
      setTimeout(() => {
        if (canvasRef.current) {
          canvasRef.current.innerHTML = '';
        }
      }, 50);
    }
  }, [soundscapeType]);

  // Create direct reference to the sketch function for reinstantiation
  const getSketch = useCallback(() => {
    return (p: p5) => {
      // Canvas setup variables
      const particles: any[] = [];
      const numParticles = 100;
      let terrain: number[][] = [];
      let cols: number, rows: number;
      let flying = 0;
      let flowField: p5.Vector[] = [];
      const scl = 20;
      
      // Canvas dimensions
      let canvasWidth = 0;
      let canvasHeight = 0;
      
      // Landscape style flags
      const isMountainous = soundscapeType === 'dramatic' || soundscapeType === 'peaceful';
      const isFlowing = soundscapeType === 'mysterious' || soundscapeType === 'cheerful';
      const useBlend = soundscapeType === 'melancholic';
      const isGalactic = soundscapeType === 'galactic';
      const isCosmic = soundscapeType === 'cosmic';
      
      // Color objects - initialized in setup
      let primaryColor: any = null;
      let secondaryColor: any = null;
      let accentColor: any = null;
      
      console.log(`Setting up ${soundscapeType} landscape`);
      
      // Setup function
      p.setup = () => {
        if (!canvasRef.current) return;
        
        console.log("Setting up p5 canvas for", soundscapeType);
        
        // Get container dimensions
        const parentWidth = canvasRef.current.clientWidth || window.innerWidth;
        const parentHeight = canvasRef.current.clientHeight || window.innerHeight;
        
        canvasWidth = parentWidth;
        canvasHeight = parentHeight;
        
        console.log("Canvas dimensions:", canvasWidth + "x" + canvasHeight);
        
        // Create canvas sized to container - using P2D instead of WebGL to avoid shader errors
        p.createCanvas(canvasWidth, canvasHeight);
        
        // Initialize colors from props
        primaryColor = p.color(colors.primary);
        secondaryColor = p.color(colors.secondary);
        accentColor = p.color(colors.accent);
        
        // Initialize particles
        initializeParticles();
        
        // Set frame rate to stabilize performance
        p.frameRate(30);
      };
      
      // Function to initialize particles
      function initializeParticles() {
        particles.length = 0;
        
        for (let i = 0; i < numParticles; i++) {
          // Common particle properties
          let pos;
          let vel;
          let particleColor;
          let particleSize;
          let particleAlpha;
          let particleType;
          
          if (isGalactic) {
            // For galactic landscapes, create orbiting particles
            const angle = p.random(p.TWO_PI);
            const radius = p.random(50, 300);
            
            pos = p.createVector(
              p.cos(angle) * radius,
              p.sin(angle) * radius,
              p.random(-50, 50)
            );
            
            vel = p.createVector(
              p.random(-0.2, 0.2),
              p.random(-0.2, 0.2),
              p.random(-0.1, 0.1)
            );
            
            try {
              // Galactic colors
              if (p.random() > 0.8) {
                // Stars
                particleColor = p.color(255, 255, 255);
                particleSize = p.random(1, 3);
                particleType = 'star';
              } else {
                // Nebula colors
                particleColor = p.lerpColor(
                  primaryColor,
                  accentColor,
                  p.random()
                );
                particleSize = p.random(1, 3);
                particleType = 'whitestar';
              }
            } catch (err) {
              particleColor = p.color(200, 200, 255);
              particleSize = p.random(1, 3);
              particleType = 'default';
            }
            
            particleAlpha = p.random(150, 230);
            
          } else if (isCosmic) {
            // For cosmic landscapes, create a nebula with dust and stars
            pos = p.createVector(
              p.random(-p.width/2, p.width/2),
              p.random(-p.height/2, p.height/2),
              p.random(-80, 80)
            );
            
            vel = p.createVector(
              p.random(-0.5, 0.5) * 0.2,
              p.random(-0.5, 0.5) * 0.2,
              p.random(-0.1, 0.1) * 0.1
            );
            
            // Colors for nebula particles
            try {
              const nebulaType = p.random();
              if (nebulaType > 0.7) {
                // Purple/blue nebula dust
                particleColor = p.color(80, 50, 120);
                particleType = 'nebuladust';
                particleSize = p.random(5, 12);
                particleAlpha = p.random(30, 100); // More transparent
              } else if (nebulaType > 0.4) {
                // Red/orange nebula dust
                particleColor = p.color(180, 60, 30);
                particleType = 'nebuladust';
                particleSize = p.random(4, 10);
                particleAlpha = p.random(30, 100); // More transparent
              } else {
                // Stars within the nebula
                particleColor = p.color(255, 255, 255);
                particleType = 'star';
                particleSize = p.random(1, 3);
                particleAlpha = p.random(150, 250); // Brighter
              }
            } catch (err) {
              particleColor = p.color(150, 150, 200);
              particleType = 'default';
              particleSize = p.random(2, 6);
              particleAlpha = p.random(100, 200);
            }
          } else {
            // Regular landscape particles
            pos = p.createVector(
              p.random(-p.width/2, p.width/2),
              p.random(-p.height/2, p.height/2),
              p.random(-100, 100)
            );
            
            vel = p.createVector(
              p.random(-1, 1) * 0.3,
              p.random(-1, 1) * 0.3,
              p.random(-0.5, 0.5) * 0.4
            );
            
            try {
              particleColor = p.lerpColor(
                primaryColor, 
                accentColor, 
                p.random()
              );
            } catch (err) {
              particleColor = p.color(150, 150, 200);
            }
            
            particleSize = p.random(2, 6);
            particleAlpha = p.random(100, 200);
            particleType = 'regular';
          }
          
          // Add the particle with all properties
          particles.push({
            pos: pos,
            vel: vel,
            size: particleSize || p.random(2, 6),
            color: particleColor,
            alpha: particleAlpha || p.random(100, 200),
            type: particleType || 'regular',
            // Additional properties for special particles
            orbitAngle: p.random(p.TWO_PI), // Starting angle for orbital motion
            pulseFactor: p.random(0.01, 0.05), // For pulsating stars
            pulseSpeed: p.random(0.02, 0.06) // Speed of pulsation
          });
        }
      }
      
      // Draw function
      p.draw = () => {
        if (!isActive) return;
        
        // Clear background
        p.background(0, 0, 0);
        
        // Set basic viewing angle
        p.translate(0, 0, -200);
        p.rotateX(p.PI * 0.2);
        
        // Different landscape types have different visual styles
        if (isGalactic) {
          drawGalacticLandscape();
        } else if (isCosmic) {
          drawCosmicLandscape();
        } else if (isMountainous) {
          drawMountainousLandscape();
        } else if (isFlowing) {
          drawFlowingLandscape();
        } else if (useBlend) {
          drawDefaultLandscape(); // Fallback
        } else {
          drawDefaultLandscape();
        }
      };
      
      // Specialized landscape drawing functions
      function drawGalacticLandscape() {
        p.background(0, 2, 15);
        
        // Draw stars
        for (let i = 0; i < 200; i++) {
          const x = p.random(-canvasWidth, canvasWidth);
          const y = p.random(-canvasHeight, canvasHeight);
          const z = p.random(-400, -100);
          
          p.push();
          p.translate(x, y, z);
          p.fill(255, p.random(100, 200));
          p.noStroke();
          p.ellipse(0, 0, p.random(1, 2), p.random(1, 2));
          p.pop();
        }
        
        // Draw galactic center
        p.push();
        p.translate(0, 0, -50);
        p.noStroke();
        
        // Galaxy core
        for (let i = 0; i < 5; i++) {
          const size = p.map(i, 0, 5, 100, 20);
          const alpha = p.map(i, 0, 5, 100, 20);
          p.fill(p.red(accentColor), p.green(accentColor), p.blue(accentColor), alpha);
          p.ellipse(0, 0, size, size);
        }
        p.pop();
        
        // Draw particles
        for (let i = 0; i < particles.length; i++) {
          const particle = particles[i];
          
          // Update particle position with slight movement
          particle.orbitAngle += 0.002;
          particle.pos.x = p.cos(particle.orbitAngle) * (particle.pos.x < 0 ? -1 : 1) * 
                          p.abs(particle.pos.x);
          particle.pos.y = p.sin(particle.orbitAngle) * (particle.pos.y < 0 ? -1 : 1) * 
                          p.abs(particle.pos.y);
          
          // Draw particle
          p.push();
          p.translate(particle.pos.x, particle.pos.y, particle.pos.z);
          p.noStroke();
          p.fill(p.red(particle.color), p.green(particle.color), p.blue(particle.color), particle.alpha);
          
          if (particle.type === 'star') {
            // Stars pulse
            const pulse = p.sin(p.frameCount * particle.pulseSpeed) * particle.pulseFactor;
            p.ellipse(0, 0, particle.size * (1 + pulse), particle.size * (1 + pulse));
          } else {
            p.ellipse(0, 0, particle.size, particle.size);
          }
          p.pop();
        }
      }
      
      function drawCosmicLandscape() {
        p.background(10, 5, 25);
        
        // Draw nebula background
        p.push();
        p.noStroke();
        for (let i = 0; i < 3; i++) {
          p.fill(p.red(secondaryColor), p.green(secondaryColor), p.blue(secondaryColor), 5);
          const size = 300 + i * 50;
          p.ellipse(0, 0, size, size);
        }
        p.pop();
        
        // Draw particles
        for (let i = 0; i < particles.length; i++) {
          const particle = particles[i];
          
          // Update particle position
          const noiseVal = p.noise(particle.pos.x * 0.01, particle.pos.y * 0.01, p.frameCount * 0.01);
          const angle = noiseVal * p.TWO_PI;
          
          particle.vel.x += p.cos(angle) * 0.05;
          particle.vel.y += p.sin(angle) * 0.05;
          particle.vel.mult(0.95);
          particle.pos.add(particle.vel);
          
          // Boundary check with wrapping
          if (particle.pos.x < -canvasWidth/2) particle.pos.x = canvasWidth/2;
          if (particle.pos.x > canvasWidth/2) particle.pos.x = -canvasWidth/2;
          if (particle.pos.y < -canvasHeight/2) particle.pos.y = canvasHeight/2;
          if (particle.pos.y > canvasHeight/2) particle.pos.y = -canvasHeight/2;
          
          // Draw particle based on type
          p.push();
          p.translate(particle.pos.x, particle.pos.y, particle.pos.z);
          p.noStroke();
          
          if (particle.type === 'nebuladust') {
            // Draw nebula dust with blur effect
            for (let j = 0; j < 3; j++) {
              const fadeAlpha = particle.alpha * (1 - j * 0.3);
              const fadeSize = particle.size * (1 + j * 0.5);
              p.fill(p.red(particle.color), p.green(particle.color), p.blue(particle.color), fadeAlpha);
              p.ellipse(0, 0, fadeSize, fadeSize);
            }
          } else {
            // Draw normal particles/stars
            p.fill(p.red(particle.color), p.green(particle.color), p.blue(particle.color), particle.alpha);
            p.ellipse(0, 0, particle.size, particle.size);
          }
          p.pop();
        }
      }
      
      function drawMountainousLandscape() {
        // Simple mountains background
        p.background(p.red(primaryColor), p.green(primaryColor), p.blue(primaryColor));
        
        // Draw distant mountains
        p.push();
        p.noStroke();
        p.fill(p.red(secondaryColor), p.green(secondaryColor), p.blue(secondaryColor), 150);
        
        p.beginShape();
        p.vertex(-canvasWidth/2, canvasHeight/2);
        
        for (let x = -canvasWidth/2; x <= canvasWidth/2; x += 20) {
          const xOffset = p.map(x, -canvasWidth/2, canvasWidth/2, 0, 10);
          const y = p.map(p.noise(xOffset * 0.1, p.frameCount * 0.001), 0, 1, 0, -canvasHeight/2);
          p.vertex(x, y);
        }
        
        p.vertex(canvasWidth/2, canvasHeight/2);
        p.endShape(p.CLOSE);
        p.pop();
        
        // Draw particles
        for (let i = 0; i < particles.length; i++) {
          const particle = particles[i];
          
          // Update particle position
          particle.vel.add(p.random(-0.05, 0.05), p.random(-0.05, 0.05), p.random(-0.02, 0.02));
          particle.vel.mult(0.95);
          particle.pos.add(particle.vel);
          
          // Boundary check with wrapping
          if (particle.pos.x < -canvasWidth/2) particle.pos.x = canvasWidth/2;
          if (particle.pos.x > canvasWidth/2) particle.pos.x = -canvasWidth/2;
          if (particle.pos.y < -canvasHeight/2) particle.pos.y = canvasHeight/2;
          if (particle.pos.y > canvasHeight/2) particle.pos.y = -canvasHeight/2;
          
          // Draw particle
          p.push();
          p.translate(particle.pos.x, particle.pos.y, particle.pos.z);
          p.noStroke();
          p.fill(p.red(particle.color), p.green(particle.color), p.blue(particle.color), particle.alpha);
          p.ellipse(0, 0, particle.size, particle.size);
          p.pop();
        }
      }
      
      function drawFlowingLandscape() {
        p.background(p.red(primaryColor), p.green(primaryColor), p.blue(primaryColor));
        
        // Draw flowing landscape elements
        p.push();
        p.noFill();
        p.stroke(p.red(secondaryColor), p.green(secondaryColor), p.blue(secondaryColor), 100);
        p.strokeWeight(1);
        
        for (let y = -canvasHeight/2; y < canvasHeight/2; y += 30) {
          p.beginShape();
          for (let x = -canvasWidth/2; x <= canvasWidth/2; x += 10) {
            const xOffset = p.map(x, -canvasWidth/2, canvasWidth/2, 0, 10);
            const yOffset = p.map(y, -canvasHeight/2, canvasHeight/2, 0, 10);
            const waveHeight = p.map(p.noise(xOffset * 0.1, yOffset * 0.1, p.frameCount * 0.01), 0, 1, -20, 20);
            p.vertex(x, y + waveHeight);
          }
          p.endShape();
        }
        p.pop();
        
        // Draw particles with trails
        for (let i = 0; i < particles.length; i++) {
          const particle = particles[i];
          
          // Update particle position with flow field effect
          const xOffset = p.map(particle.pos.x, -canvasWidth/2, canvasWidth/2, 0, 10);
          const yOffset = p.map(particle.pos.y, -canvasHeight/2, canvasHeight/2, 0, 10);
          const angle = p.noise(xOffset * 0.1, yOffset * 0.1, p.frameCount * 0.01) * p.TWO_PI;
          
          particle.vel.add(p.cos(angle) * 0.1, p.sin(angle) * 0.1, 0);
          particle.vel.mult(0.95);
          particle.pos.add(particle.vel);
          
          // Boundary check with wrapping
          if (particle.pos.x < -canvasWidth/2) particle.pos.x = canvasWidth/2;
          if (particle.pos.x > canvasWidth/2) particle.pos.x = -canvasWidth/2;
          if (particle.pos.y < -canvasHeight/2) particle.pos.y = canvasHeight/2;
          if (particle.pos.y > canvasHeight/2) particle.pos.y = -canvasHeight/2;
          
          // Draw particle with trail
          p.push();
          p.translate(particle.pos.x, particle.pos.y, particle.pos.z);
          
          // Trail
          p.stroke(p.red(particle.color), p.green(particle.color), p.blue(particle.color), particle.alpha * 0.5);
          p.strokeWeight(1);
          p.line(0, 0, -particle.vel.x * 10, -particle.vel.y * 10);
          
          // Particle
          p.noStroke();
          p.fill(p.red(particle.color), p.green(particle.color), p.blue(particle.color), particle.alpha);
          p.ellipse(0, 0, particle.size, particle.size);
          p.pop();
        }
      }
      
      function drawDefaultLandscape() {
        p.background(p.red(primaryColor), p.green(primaryColor), p.blue(primaryColor));
        
        // Draw particles
        for (let i = 0; i < particles.length; i++) {
          const particle = particles[i];
          
          // Simple particle movement
          particle.vel.add(p.random(-0.02, 0.02), p.random(-0.02, 0.02), p.random(-0.01, 0.01));
          particle.vel.mult(0.98);
          particle.pos.add(particle.vel);
          
          // Boundary check with wrapping
          if (particle.pos.x < -canvasWidth/2) particle.pos.x = canvasWidth/2;
          if (particle.pos.x > canvasWidth/2) particle.pos.x = -canvasWidth/2;
          if (particle.pos.y < -canvasHeight/2) particle.pos.y = canvasHeight/2;
          if (particle.pos.y > canvasHeight/2) particle.pos.y = -canvasHeight/2;
          
          // Draw particle
          p.push();
          p.translate(particle.pos.x, particle.pos.y, particle.pos.z);
          p.noStroke();
          p.fill(p.red(particle.color), p.green(particle.color), p.blue(particle.color), particle.alpha);
          p.ellipse(0, 0, particle.size, particle.size);
          p.pop();
        }
      }
      
      // Handle window resizing
      p.windowResized = () => {
        if (!canvasRef.current) return;
        
        const parentWidth = canvasRef.current.clientWidth;
        const parentHeight = canvasRef.current.clientHeight;
        
        if (parentWidth > 0 && parentHeight > 0) {
          p.resizeCanvas(parentWidth, parentHeight);
          canvasWidth = parentWidth;
          canvasHeight = parentHeight;
        }
      };
    };
  }, [colors, soundscapeType, isActive]);

  // Force restart if component props change
  useEffect(() => {
    // Restart p5 instance when component props change
    if (p5InstanceRef.current) {
      try {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      } catch (err) {
        console.error('Error removing p5 instance on prop change');
      }
      
      // Force remount the canvas with a slight delay
      setTimeout(() => {
        try {
          if (canvasRef.current) {
            // Clear existing content
            canvasRef.current.innerHTML = '';
            
            // Create new p5 instance with a fresh sketch function
            const sketchFn = getSketch();
            p5InstanceRef.current = new p5(sketchFn);
          }
        } catch (error) {
          console.error('Error recreating p5 instance:', error);
        }
      }, 100);
    }
  }, [colors, soundscapeType, isActive, getSketch]);

  return (
    <div
      ref={canvasRef}
      className="w-full h-full overflow-hidden rounded-lg"
      style={{ 
        minHeight: '100vh', 
        position: 'relative',
        background: 'rgba(0,0,0,0.2)',
        display: 'block', 
        visibility: 'visible'
      }}
      data-landscape-type={soundscapeType}
      data-active={isActive.toString()}
    ></div>
  );
};

export default LandscapePreviewCanvas;