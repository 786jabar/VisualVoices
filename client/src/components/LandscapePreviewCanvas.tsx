import React, { useEffect, useRef, useState } from 'react';
import p5 from 'p5';

// Type definition for p5.Color to fix typing issues
type P5Color = any;

interface LandscapePreviewCanvasProps {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  soundscapeType: 'peaceful' | 'mysterious' | 'dramatic' | 'cheerful' | 'melancholic';
  isActive: boolean;
}

const LandscapePreviewCanvas: React.FC<LandscapePreviewCanvasProps> = ({ 
  colors, 
  soundscapeType,
  isActive
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);

  useEffect(() => {
    if (!canvasRef.current || p5InstanceRef.current) return;

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
      let isMountainous = soundscapeType === 'dramatic' || soundscapeType === 'peaceful';
      let isFlowing = soundscapeType === 'mysterious' || soundscapeType === 'cheerful';
      let useBlend = soundscapeType === 'melancholic';
      
      // Decode color hex values
      let primaryColor: P5Color;
      let secondaryColor: P5Color;
      let accentColor: P5Color;
      
      // Initialize with default colors first
      primaryColor = p.color(50, 100, 150);
      secondaryColor = p.color(20, 40, 80);
      accentColor = p.color(200, 150, 100);
      
      // Try to apply custom colors if they exist
      if (colors && typeof colors === 'object') {
        if (colors.primary) primaryColor = p.color(colors.primary);
        if (colors.secondary) secondaryColor = p.color(colors.secondary);
        if (colors.accent) accentColor = p.color(colors.accent);
      }
      
      // Setup function
      p.setup = () => {
        if (!canvasRef.current) return;
        
        // Create canvas that fills the containing div
        const canvas = p.createCanvas(canvasRef.current.clientWidth, canvasRef.current.clientHeight, p.WEBGL);
        canvas.parent(canvasRef.current);
        
        // Set initial rendering values based on soundscape type
        p.frameRate(30);
        
        // Initialize terrain grid
        cols = Math.ceil(p.width / scl) + 2;
        rows = Math.ceil(p.height / scl) + 2;
        
        // Create initial terrain heightmap
        refreshTerrain();
        
        // Initialize particles for atmospheric effects
        for (let i = 0; i < numParticles; i++) {
          particles.push({
            pos: p.createVector(
              p.random(-p.width/2, p.width/2),
              p.random(-p.height/2, p.height/2),
              p.random(-100, 100)
            ),
            vel: p.createVector(
              p.random(-1, 1) * 0.3,
              p.random(-1, 1) * 0.3,
              p.random(-0.5, 0.5) * 0.4
            ),
            size: p.random(2, 6),
            color: p.lerpColor(secondaryColor, accentColor, p.random()),
            alpha: p.random(100, 200)
          });
        }
        
        // Create flow field for particle movement
        createFlowField();
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
      
      // Handle window resize
      p.windowResized = () => {
        if (!canvasRef.current) return;
        p.resizeCanvas(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
        
        // Reinitialize terrain grid on resize
        cols = Math.ceil(p.width / scl) + 2;
        rows = Math.ceil(p.height / scl) + 2;
        refreshTerrain();
        createFlowField();
      };
      
      // Create flow field for particle movement
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
      
      // Draw gradient background based on colors
      function drawBackground() {
        p.background(0);
        p.push();
        p.noStroke();
        
        // Draw gradient sky
        p.push();
        p.translate(0, 0, -500);
        p.rotateX(p.PI/2);
        
        let skyColorTop = p.color(p.red(primaryColor), p.green(primaryColor), p.blue(primaryColor));
        let skyColorBottom = p.color(p.red(secondaryColor), p.green(secondaryColor), p.blue(secondaryColor));
        
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
        
        // Draw sky dome
        for (let y = -p.height/2; y < p.height/2; y += 5) {
          const inter = p.map(y, -p.height/2, p.height/2, 0, 1);
          const c = p.lerpColor(skyColorTop, skyColorBottom, inter);
          p.stroke(c);
          p.line(-p.width/2, y, p.width/2, y);
        }
        p.pop();
      }
      
      // Generate new terrain heightmap based on noise
      function refreshTerrain() {
        terrain = [];
        for (let x = 0; x < cols; x++) {
          terrain[x] = [];
          for (let y = 0; y < rows; y++) {
            // Use Perlin noise to generate height map with flying offset
            let noiseVal;
            
            if (isMountainous) {
              // More dramatic peaks for mountainous landscapes
              noiseVal = p.noise(x * 0.1, y * 0.1, flying) * 70;
              if (noiseVal > 30) noiseVal *= 1.5;
            } else if (useBlend) {
              // Gentler rolling terrain
              noiseVal = p.noise(x * 0.07, y * 0.07, flying) * 50;
            } else {
              // Standard terrain
              noiseVal = p.noise(x * 0.1, y * 0.1, flying) * 60;
            }
            
            terrain[x][y] = noiseVal;
          }
        }
      }
      
      // Draw the 3D terrain
      function drawTerrain() {
        p.push();
        
        // Position the terrain in the canvas
        p.translate(-p.width/2, 0);
        p.rotateX(p.PI/3); // Tilt the terrain
        p.translate(0, 50);
        
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
        
        // Draw terrain as triangle strips
        for (let y = 0; y < rows-1; y++) {
          p.beginShape(p.TRIANGLE_STRIP);
          for (let x = 0; x < cols; x++) {
            if (useBlend && x % 2 === 0) {
              p.fill(p.lerpColor(primaryColor, secondaryColor, p.noise(x*0.1, y*0.1)));
            }
            
            // Add vertices for current row and next row
            p.vertex(x * scl, y * scl, terrain[x][y]);
            p.vertex(x * scl, (y + 1) * scl, terrain[x][y + 1]);
          }
          p.endShape();
        }
        p.pop();
      }
      
      // Update and draw particles for atmospheric effects
      function updateParticles() {
        p.push();
        p.noStroke();
        
        for (let i = 0; i < particles.length; i++) {
          const particle = particles[i];
          
          // Move particles
          if (isFlowing) {
            // Follow flow field for more organic movement
            const index = Math.floor(
              ((particle.pos.x + p.width/2) / p.width * (flowField.length/rows)) + 
              ((particle.pos.y + p.height/2) / p.height * rows)
            ) % flowField.length;
            
            if (index >= 0 && index < flowField.length) {
              const force = flowField[index].copy();
              force.mult(0.1);
              particle.vel.add(force);
            }
            
            particle.vel.limit(0.7);
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
          
          // Draw particle with custom style based on soundscape
          if (soundscapeType === 'mysterious') {
            p.fill(particle.color.levels[0], particle.color.levels[1], particle.color.levels[2], 
              particle.alpha * 0.7 * (1 + p.sin(p.frameCount * 0.02 + i * 0.1) * 0.3));
            p.push();
            p.translate(particle.pos.x, particle.pos.y, particle.pos.z);
            p.rotateY(p.frameCount * 0.01);
            p.box(particle.size);
            p.pop();
          } else if (soundscapeType === 'dramatic') {
            // Star-like particles for dramatic scenes
            p.fill(particle.color.levels[0], particle.color.levels[1], particle.color.levels[2], particle.alpha);
            p.push();
            p.translate(particle.pos.x, particle.pos.y, particle.pos.z);
            drawStar(0, 0, particle.size, particle.size * 2, 4);
            p.pop();
          } else {
            // Default circular particles
            p.fill(particle.color.levels[0], particle.color.levels[1], particle.color.levels[2], particle.alpha);
            p.push();
            p.translate(particle.pos.x, particle.pos.y, particle.pos.z);
            p.ellipse(0, 0, particle.size);
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
    };

    // Create the p5 instance
    p5InstanceRef.current = new p5(sketch);

    // Cleanup function
    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, [colors, soundscapeType]);

  // If soundscape type changes, update the visualization
  useEffect(() => {
    // Force canvas redraw if soundscapeType changes
    if (p5InstanceRef.current) {
      p5InstanceRef.current.remove();
      p5InstanceRef.current = null;
      
      // Short delay to ensure clean removal before new instance
      setTimeout(() => {
        const canvasElement = canvasRef.current;
        if (canvasElement) {
          canvasElement.innerHTML = '';
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