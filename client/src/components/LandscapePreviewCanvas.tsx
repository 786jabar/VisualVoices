import React, { useEffect, useRef } from 'react';
// Fix for p5.js type issues - using a more explicit import approach
import p5 from 'p5';
// @ts-ignore - Ignoring the type checking for p5 import issue

// Define prop types
interface LandscapePreviewCanvasProps {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  soundscapeType: 'peaceful' | 'mysterious' | 'dramatic' | 'cheerful' | 'melancholic';
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

  useEffect(() => {
    // Only create new instance if none exists and container is ready
    if (!canvasRef.current || p5InstanceRef.current) return;

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
      
      // Landscape style flags
      const isMountainous = soundscapeType === 'dramatic' || soundscapeType === 'peaceful';
      const isFlowing = soundscapeType === 'mysterious' || soundscapeType === 'cheerful';
      const useBlend = soundscapeType === 'melancholic';
      
      // Color objects - initialized in setup
      let primaryColor: any = null;
      let secondaryColor: any = null;
      let accentColor: any = null;

      // Initialize particles for atmospheric effects
      function initializeParticles() {
        for (let i = 0; i < numParticles; i++) {
          const pos = p.createVector(
            p.random(-p.width/2, p.width/2),
            p.random(-p.height/2, p.height/2),
            p.random(-100, 100)
          );
          
          const vel = p.createVector(
            p.random(-1, 1) * 0.3,
            p.random(-1, 1) * 0.3,
            p.random(-0.5, 0.5) * 0.4
          );
          
          let particleColor;
          try {
            particleColor = p.lerpColor(secondaryColor, accentColor, p.random());
          } catch (err) {
            particleColor = p.color(150, 150, 200);
          }
          
          particles.push({
            pos: pos,
            vel: vel,
            size: p.random(2, 6),
            color: particleColor,
            alpha: p.random(100, 200)
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
        
        // Create canvas that fills the container div
        const canvas = p.createCanvas(
          canvasRef.current.clientWidth || 300, 
          canvasRef.current.clientHeight || 200, 
          p.WEBGL
        );
        canvas.parent(canvasRef.current);
        
        // Set rendering parameters
        p.frameRate(30);
        
        // Initialize terrain grid
        cols = Math.ceil(p.width / scl) + 2;
        rows = Math.ceil(p.height / scl) + 2;
        
        // Safely initialize colors
        try {
          primaryColor = p.color(safeColors.primary);
          secondaryColor = p.color(safeColors.secondary);
          accentColor = p.color(safeColors.accent);
        } catch (err) {
          // Fallback to RGB values if hex parsing fails
          primaryColor = p.color(59, 89, 152);
          secondaryColor = p.color(25, 42, 86);
          accentColor = p.color(76, 209, 55);
        }
        
        // Initialize scene elements
        createFlowField();
        refreshTerrain();
        initializeParticles();
      };

      // Draw function - called every frame
      p.draw = () => {
        if (!isActive) return;
        
        // Clear background with gradient
        drawBackground();
        
        // Draw 3D terrain
        drawTerrain();
        
        // Update and draw atmospheric particles
        updateParticles();
        
        // Move through terrain if in flow mode
        if (isFlowing) {
          flying -= 0.015;
          refreshTerrain();
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
            
            if (soundscapeType === 'mysterious') {
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

  return (
    <div
      ref={canvasRef}
      className="w-full h-full overflow-hidden rounded-lg"
      style={{ minHeight: '300px' }}
    ></div>
  );
};

export default LandscapePreviewCanvas;