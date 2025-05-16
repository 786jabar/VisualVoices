import { useRef, useState, useEffect } from 'react';
import p5 from 'p5';

interface VisualizationOptions {
  sentiment: 'Negative' | 'Neutral' | 'Positive';
  sentimentScore: number;
  text: string;
  motion: boolean;
  colorIntensity: boolean;
}

interface P5VisualizationHook {
  canvasRef: React.RefObject<HTMLDivElement>;
  p5Instance: p5 | null;
  saveCanvas: () => Promise<void>;
}

export function useP5Visualization(options: VisualizationOptions): P5VisualizationHook {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [p5Instance, setP5Instance] = useState<p5 | null>(null);
  const optionsRef = useRef(options);

  // Update the ref when options change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Create and destroy p5 instance
  useEffect(() => {
    if (!canvasRef.current) return;

    // Create new p5 instance
    const sketch = (p: p5) => {
      // Particles for visual elements
      let particles: Array<{
        x: number;
        y: number;
        size: number;
        color: p5.Color;
        speedX: number;
        speedY: number;
        alpha: number;
        shape: 'circle' | 'square' | 'triangle' | 'star';
        rotation: number;
        rotationSpeed: number;
      }> = [];
      
      // Background elements (landscape features)
      let bgElements: Array<{
        x: number;
        y: number;
        width: number;
        height: number;
        color: p5.Color;
        type: 'mountain' | 'wave' | 'cloud' | 'tree' | 'crystal';
        offset: number;
      }> = [];

      // Audio-reactive waves
      let waves: Array<{
        amplitude: number;
        frequency: number;
        phase: number;
        color: p5.Color;
        thickness: number;
      }> = [];
      
      // Celestial bodies (sun/moon, stars)
      let celestialBodies: Array<{
        x: number;
        y: number;
        size: number;
        color: p5.Color;
        type: 'sun' | 'moon' | 'star' | 'planet';
        orbit?: number;
        orbitSpeed?: number;
        orbitCenter?: {x: number, y: number};
        orbitAngle?: number;
        glow?: number;
      }> = [];

      // Words from speech that appear in the landscape
      let floatingWords: Array<{
        word: string;
        x: number;
        y: number;
        size: number;
        color: p5.Color;
        alpha: number;
        speedX: number;
        speedY: number;
        fadeRate: number;
      }> = [];

      // Setup function
      p.setup = () => {
        // Create canvas with container dimensions
        const canvas = p.createCanvas(canvasRef.current!.clientWidth, canvasRef.current!.clientHeight);
        canvas.parent(canvasRef.current!);
        
        // Initialize particles
        resetParticles();
        
        // Initialize background elements
        resetBackgroundElements();
        
        // Initialize waves
        resetWaves();
        
        // Initialize celestial bodies
        resetCelestialBodies();
        
        // Disable stroke for most shapes
        p.noStroke();
        
        // Extract words from text for visualization
        updateFloatingWords();
      };
      
      // Draw function
      p.draw = () => {
        const opts = optionsRef.current;
        
        // Set background color based on sentiment
        let bgColor;
        if (opts.sentiment === 'Positive') {
          bgColor = p.color(18, 28, 48, 240);  // Deep blue for positive
          p.background(bgColor);
          
          // Add gradient effect
          drawGradient(
            p.color(18, 28, 48, 240),
            p.color(60, 20, 80, 240),
            'positive'
          );
        } else if (opts.sentiment === 'Negative') {
          bgColor = p.color(40, 15, 25, 240);  // Dark red for negative
          p.background(bgColor);
          
          // Add gradient effect
          drawGradient(
            p.color(40, 15, 25, 240),
            p.color(20, 10, 30, 240),
            'negative'
          );
        } else {
          bgColor = p.color(25, 25, 35, 240);  // Neutral gray-blue
          p.background(bgColor);
          
          // Add gradient effect
          drawGradient(
            p.color(25, 25, 35, 240),
            p.color(35, 35, 45, 240),
            'neutral'
          );
        }
        
        // Draw stars or celestial objects
        drawCelestialBodies();
        
        // Draw background elements (landscape features)
        drawBackgroundElements();
        
        // Draw audio-reactive waves
        drawWaves();
        
        // Draw floating words from speech text
        drawFloatingWords();
        
        // Draw and update particles
        updateAndDrawParticles();
        
        // Generate new particles randomly
        if (p.frameCount % 10 === 0 && particles.length < 100) {
          addParticle();
        }
        
        // Add subtle vignette effect
        drawVignette();
      };

      // Draw gradient background
      function drawGradient(colorTop: p5.Color, colorBottom: p5.Color, sentimentType: string) {
        for (let y = 0; y < p.height; y++) {
          const interColor = p.lerpColor(colorTop, colorBottom, y / p.height);
          p.stroke(interColor);
          p.line(0, y, p.width, y);
        }
        p.noStroke();
        
        // Add star-like dots for positive sentiment
        if (sentimentType === 'positive' && optionsRef.current.colorIntensity) {
          p.fill(255, 255, 255, 40);
          for (let i = 0; i < 100; i++) {
            const starSize = p.random(1, 2);
            p.ellipse(p.random(p.width), p.random(p.height * 0.7), starSize, starSize);
          }
        }
      }
      
      // Draw vignette effect
      function drawVignette() {
        const opts = optionsRef.current;
        let vignetteStrength = 150;
        
        // Adjust vignette based on sentiment
        if (opts.sentiment === 'Positive') {
          vignetteStrength = 120;
        } else if (opts.sentiment === 'Negative') {
          vignetteStrength = 180;
        }
        
        // Create gradient from transparent to dark
        p.noFill();
        for (let i = 0; i < 100; i++) {
          const alpha = p.map(i, 0, 100, 0, vignetteStrength);
          p.stroke(0, 0, 0, alpha);
          const size = p.map(i, 0, 100, p.width * 1.5, 0);
          p.ellipse(p.width / 2, p.height / 2, size, size);
        }
        p.noStroke();
      }

      // Window resize handler
      p.windowResized = () => {
        if (canvasRef.current) {
          p.resizeCanvas(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
          resetBackgroundElements();
          resetCelestialBodies();
        }
      };
      
      // Reset all particles
      function resetParticles() {
        particles = [];
        for (let i = 0; i < 40; i++) {
          addParticle();
        }
      }
      
      // Add a new particle
      function addParticle() {
        const opts = optionsRef.current;
        let particleColor;
        
        // Color based on sentiment
        if (opts.sentiment === 'Positive') {
          particleColor = p.color(
            p.random(50, 100),
            p.random(opts.colorIntensity ? 180 : 140, opts.colorIntensity ? 220 : 180),
            p.random(140, 255),
            p.random(150, 200)
          );
        } else if (opts.sentiment === 'Negative') {
          particleColor = p.color(
            p.random(opts.colorIntensity ? 180 : 140, opts.colorIntensity ? 255 : 180),
            p.random(20, 80),
            p.random(50, 100),
            p.random(150, 200)
          );
        } else {
          particleColor = p.color(
            p.random(100, 150),
            p.random(100, 150),
            p.random(opts.colorIntensity ? 180 : 140, opts.colorIntensity ? 220 : 180),
            p.random(150, 200)
          );
        }
        
        // Select random shape
        const shapes: Array<'circle' | 'square' | 'triangle' | 'star'> = ['circle', 'square', 'triangle', 'star'];
        const shape = shapes[Math.floor(p.random(shapes.length))];
        
        particles.push({
          x: p.random(p.width),
          y: p.random(p.height),
          size: p.random(3, 12),
          color: particleColor,
          speedX: p.random(-1, 1) * (opts.motion ? 1 : 0.3),
          speedY: p.random(-1, 1) * (opts.motion ? 1 : 0.3),
          alpha: p.random(150, 200),
          shape: shape,
          rotation: p.random(p.TWO_PI),
          rotationSpeed: p.random(-0.05, 0.05) * (opts.motion ? 1 : 0.2)
        });
      }
      
      // Draw a star shape
      function drawStar(x: number, y: number, radius1: number, radius2: number, npoints: number) {
        let angle = p.TWO_PI / npoints;
        let halfAngle = angle / 2.0;
        p.beginShape();
        for (let a = 0; a < p.TWO_PI; a += angle) {
          let sx = x + p.cos(a) * radius2;
          let sy = y + p.sin(a) * radius2;
          p.vertex(sx, sy);
          sx = x + p.cos(a + halfAngle) * radius1;
          sy = y + p.sin(a + halfAngle) * radius1;
          p.vertex(sx, sy);
        }
        p.endShape(p.CLOSE);
      }
      
      // Update and draw all particles
      function updateAndDrawParticles() {
        const opts = optionsRef.current;
        
        for (let i = particles.length - 1; i >= 0; i--) {
          const particle = particles[i];
          
          // Update position with motion if enabled
          if (opts.motion) {
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            particle.rotation += particle.rotationSpeed;
            
            // Bounce off edges
            if (particle.x < 0 || particle.x > p.width) {
              particle.speedX *= -1;
            }
            if (particle.y < 0 || particle.y > p.height) {
              particle.speedY *= -1;
            }
          }
          
          // Draw particle based on shape
          p.fill(particle.color);
          p.push();
          p.translate(particle.x, particle.y);
          p.rotate(particle.rotation);
          
          if (particle.shape === 'circle') {
            p.ellipse(0, 0, particle.size);
          } else if (particle.shape === 'square') {
            p.rect(-particle.size/2, -particle.size/2, particle.size, particle.size);
          } else if (particle.shape === 'triangle') {
            p.triangle(
              0, -particle.size/2,
              -particle.size/2, particle.size/2,
              particle.size/2, particle.size/2
            );
          } else if (particle.shape === 'star') {
            drawStar(0, 0, particle.size/2, particle.size, 5);
          }
          
          p.pop();
          
          // Remove particles occasionally
          if (p.random(1000) < 1) {
            particles.splice(i, 1);
          }
        }
      }
      
      // Reset background elements
      function resetBackgroundElements() {
        const opts = optionsRef.current;
        
        bgElements = [];
        
        // Create mountains or hills
        for (let i = 0; i < 5; i++) {
          let elementColor;
          
          // Color based on sentiment
          if (opts.sentiment === 'Positive') {
            elementColor = p.color(20, p.random(80, 120), p.random(80, 120), p.random(100, 150));
          } else if (opts.sentiment === 'Negative') {
            elementColor = p.color(p.random(60, 100), 20, p.random(60, 100), p.random(100, 150));
          } else {
            elementColor = p.color(p.random(40, 80), p.random(40, 80), p.random(60, 100), p.random(100, 150));
          }
          
          bgElements.push({
            x: p.random(p.width),
            y: p.height - p.random(100, 300),
            width: p.random(200, 500),
            height: p.random(100, 300),
            color: elementColor,
            type: 'mountain',
            offset: p.random(1000)
          });
        }
        
        // Create waves
        for (let i = 0; i < 3; i++) {
          let elementColor;
          
          // Color based on sentiment
          if (opts.sentiment === 'Positive') {
            elementColor = p.color(20, p.random(100, 140), p.random(100, 140), p.random(50, 100));
          } else if (opts.sentiment === 'Negative') {
            elementColor = p.color(p.random(80, 120), 20, p.random(80, 120), p.random(50, 100));
          } else {
            elementColor = p.color(p.random(60, 100), p.random(60, 100), p.random(80, 120), p.random(50, 100));
          }
          
          bgElements.push({
            x: 0,
            y: p.height - p.random(50, 150) * (i + 1),
            width: p.width,
            height: p.random(20, 50),
            color: elementColor,
            type: 'wave',
            offset: p.random(1000)
          });
        }
        
        // Create clouds
        for (let i = 0; i < 8; i++) {
          let elementColor;
          
          // Color based on sentiment
          if (opts.sentiment === 'Positive') {
            elementColor = p.color(p.random(180, 220), p.random(180, 220), p.random(200, 250), p.random(30, 60));
          } else if (opts.sentiment === 'Negative') {
            elementColor = p.color(p.random(60, 100), p.random(60, 100), p.random(60, 100), p.random(30, 60));
          } else {
            elementColor = p.color(p.random(120, 160), p.random(120, 160), p.random(150, 200), p.random(30, 60));
          }
          
          bgElements.push({
            x: p.random(p.width),
            y: p.random(50, 200),
            width: p.random(100, 300),
            height: p.random(40, 100),
            color: elementColor,
            type: 'cloud',
            offset: p.random(1000)
          });
        }
        
        // Create trees (only in positive or neutral sentiment)
        if (opts.sentiment !== 'Negative') {
          for (let i = 0; i < 4; i++) {
            let elementColor = p.color(
              p.random(20, 60),
              p.random(opts.sentiment === 'Positive' ? 80 : 60, opts.sentiment === 'Positive' ? 120 : 80),
              p.random(40, 70),
              p.random(100, 150)
            );
            
            bgElements.push({
              x: p.random(p.width),
              y: p.height - p.random(50, 100),
              width: p.random(40, 80),
              height: p.random(100, 200),
              color: elementColor,
              type: 'tree',
              offset: p.random(1000)
            });
          }
        }
        
        // Create crystals (most common in negative sentiment)
        if (opts.sentiment === 'Negative' || p.random() > 0.5) {
          const crystalCount = opts.sentiment === 'Negative' ? 5 : 2;
          for (let i = 0; i < crystalCount; i++) {
            let elementColor;
            
            if (opts.sentiment === 'Positive') {
              elementColor = p.color(p.random(100, 150), p.random(120, 200), p.random(150, 220), p.random(150, 200));
            } else if (opts.sentiment === 'Negative') {
              elementColor = p.color(p.random(120, 180), p.random(20, 80), p.random(100, 150), p.random(150, 200));
            } else {
              elementColor = p.color(p.random(80, 120), p.random(80, 120), p.random(120, 180), p.random(150, 200));
            }
            
            bgElements.push({
              x: p.random(p.width),
              y: p.height - p.random(50, 150),
              width: p.random(20, 60),
              height: p.random(60, 120),
              color: elementColor,
              type: 'crystal',
              offset: p.random(1000)
            });
          }
        }
      }
      
      // Draw background elements
      function drawBackgroundElements() {
        const opts = optionsRef.current;
        
        for (const element of bgElements) {
          p.fill(element.color);
          
          if (element.type === 'mountain') {
            p.beginShape();
            p.vertex(element.x - element.width / 2, p.height);
            p.vertex(element.x - element.width / 2, element.y);
            
            // Create mountain peaks
            for (let i = 0; i <= 20; i++) {
              const x = element.x - element.width / 2 + (element.width / 20) * i;
              const noiseVal = p.noise(x * 0.01, element.offset);
              const y = element.y - noiseVal * element.height * 0.5;
              p.vertex(x, y);
            }
            
            p.vertex(element.x + element.width / 2, element.y);
            p.vertex(element.x + element.width / 2, p.height);
            p.endShape(p.CLOSE);
            
            // Add snow caps to mountains if positive sentiment
            if (opts.sentiment === 'Positive') {
              p.fill(255, 255, 255, 120);
              p.beginShape();
              
              for (let i = 0; i <= 20; i++) {
                const x = element.x - element.width / 2 + (element.width / 20) * i;
                const noiseVal = p.noise(x * 0.01, element.offset);
                const y = element.y - noiseVal * element.height * 0.5;
                const snowHeight = element.height * 0.2; // Height of snow
                
                if (y < element.y - element.height * 0.2) { // Only add snow to highest points
                  p.vertex(x, y);
                }
              }
              
              for (let i = 20; i >= 0; i--) {
                const x = element.x - element.width / 2 + (element.width / 20) * i;
                const noiseVal = p.noise(x * 0.01, element.offset);
                const y = element.y - noiseVal * element.height * 0.5;
                const snowHeight = element.height * 0.1;
                
                if (y < element.y - element.height * 0.2) { // Only add snow to highest points
                  p.vertex(x, y + snowHeight);
                }
              }
              
              p.endShape(p.CLOSE);
            }
          } else if (element.type === 'wave') {
            p.beginShape();
            p.vertex(0, p.height);
            
            // Create wave pattern
            for (let x = 0; x <= p.width; x += 20) {
              const noiseVal = p.noise(x * 0.01, p.frameCount * 0.005 + element.offset);
              const y = element.y + noiseVal * element.height;
              p.vertex(x, y);
            }
            
            p.vertex(p.width, p.height);
            p.endShape(p.CLOSE);
            
            // Add highlights to waves in positive settings
            if (opts.sentiment === 'Positive') {
              p.stroke(255, 255, 255, 40);
              p.strokeWeight(2);
              p.beginShape();
              for (let x = 0; x <= p.width; x += 20) {
                const noiseVal = p.noise(x * 0.01, p.frameCount * 0.005 + element.offset);
                const y = element.y + noiseVal * element.height - 2;
                p.vertex(x, y);
              }
              p.endShape();
              p.noStroke();
            }
          } else if (element.type === 'cloud') {
            if (opts.motion) {
              // Slowly move clouds
              element.x += p.map(p.noise(element.offset + p.frameCount * 0.01), 0, 1, -0.5, 0.5);
              if (element.x > p.width + element.width / 2) {
                element.x = -element.width / 2;
              } else if (element.x < -element.width / 2) {
                element.x = p.width + element.width / 2;
              }
            }
            
            // Draw cloud as a collection of circles
            for (let i = 0; i < 5; i++) {
              const offsetX = p.map(i, 0, 4, -element.width / 2, element.width / 2);
              const offsetY = p.map(p.noise(i, element.offset), 0, 1, -element.height / 3, element.height / 3);
              const size = p.map(p.noise(i, element.offset + 10), 0, 1, element.height * 0.6, element.height * 1.2);
              p.ellipse(element.x + offsetX, element.y + offsetY, size);
            }
          } else if (element.type === 'tree') {
            // Draw tree trunk
            p.fill(100, 70, 40);
            p.rect(element.x - element.width * 0.1, element.y - element.height, element.width * 0.2, element.height);
            
            // Draw tree foliage
            p.fill(element.color);
            p.ellipse(element.x, element.y - element.height * 1.1, element.width, element.width * 1.2);
            p.ellipse(element.x - element.width * 0.3, element.y - element.height * 0.9, element.width * 0.7, element.width * 0.8);
            p.ellipse(element.x + element.width * 0.3, element.y - element.height * 0.9, element.width * 0.7, element.width * 0.8);
            p.ellipse(element.x, element.y - element.height * 1.3, element.width * 0.7, element.width * 0.8);
            
            // Add highlights to trees if positive
            if (opts.sentiment === 'Positive' && opts.colorIntensity) {
              p.fill(255, 255, 100, 20);
              p.ellipse(element.x, element.y - element.height * 1.1, element.width * 0.8, element.width);
            }
          } else if (element.type === 'crystal') {
            // Draw crystal with unique geometry
            p.push();
            p.translate(element.x, element.y);
            
            // Crystal base shape
            p.beginShape();
            p.vertex(0, -element.height);
            p.vertex(-element.width / 2, 0);
            p.vertex(-element.width / 4, element.height / 3);
            p.vertex(element.width / 4, element.height / 3);
            p.vertex(element.width / 2, 0);
            p.endShape(p.CLOSE);
            
            // Add inner glow effect to crystals
            let innerColor = element.color;
            if (opts.sentiment === 'Positive') {
              innerColor = p.color(200, 230, 255, 100);
            } else if (opts.sentiment === 'Negative') {
              innerColor = p.color(255, 100, 150, 100);
            } else {
              innerColor = p.color(180, 180, 220, 100);
            }
            
            p.fill(innerColor);
            p.beginShape();
            p.vertex(0, -element.height * 0.7);
            p.vertex(-element.width / 4, -element.height * 0.2);
            p.vertex(0, 0);
            p.vertex(element.width / 4, -element.height * 0.2);
            p.endShape(p.CLOSE);
            
            // Add glow effect if color intensity is on
            if (opts.colorIntensity) {
              p.noFill();
              p.stroke(p.red(innerColor), p.green(innerColor), p.blue(innerColor), 50);
              p.strokeWeight(3);
              p.ellipse(0, -element.height/2, element.width * 0.8, element.height * 0.5);
              p.noStroke();
            }
            
            p.pop();
          }
        }
      }
      
      // Reset audio-reactive waves
      function resetWaves() {
        const opts = optionsRef.current;
        
        waves = [];
        
        for (let i = 0; i < 5; i++) {
          let waveColor;
          
          // Color based on sentiment
          if (opts.sentiment === 'Positive') {
            waveColor = p.color(
              30, 
              p.random(opts.colorIntensity ? 150 : 100, opts.colorIntensity ? 220 : 180),
              p.random(140, 255),
              p.random(100, 150)
            );
          } else if (opts.sentiment === 'Negative') {
            waveColor = p.color(
              p.random(opts.colorIntensity ? 150 : 100, opts.colorIntensity ? 220 : 180),
              30,
              p.random(100, 140),
              p.random(100, 150)
            );
          } else {
            waveColor = p.color(
              p.random(80, 120),
              p.random(80, 120),
              p.random(opts.colorIntensity ? 150 : 100, opts.colorIntensity ? 220 : 180),
              p.random(100, 150)
            );
          }
          
          waves.push({
            amplitude: p.random(10, 50),
            frequency: p.random(0.001, 0.01),
            phase: p.random(0, p.TWO_PI),
            color: waveColor,
            thickness: p.random(1, 4)
          });
        }
      }
      
      // Draw audio-reactive waves
      function drawWaves() {
        const opts = optionsRef.current;
        
        for (let j = 0; j < waves.length; j++) {
          const wave = waves[j];
          
          // Adjust wave amplitude based on sentiment score
          const amplitude = wave.amplitude * (1 + Math.abs(opts.sentimentScore));
          
          p.stroke(wave.color);
          p.strokeWeight(wave.thickness);
          p.noFill();
          
          p.beginShape();
          for (let x = 0; x < p.width; x += 5) {
            // Calculate height based on sine wave
            const y = p.height * 0.7 + 
                     amplitude * 
                     p.sin(wave.frequency * x + wave.phase + p.frameCount * (opts.motion ? 0.05 : 0.01));
            p.vertex(x, y);
          }
          p.endShape();
          
          p.noStroke();
        }
      }
      
      // Reset celestial bodies
      function resetCelestialBodies() {
        const opts = optionsRef.current;
        
        celestialBodies = [];
        
        // Add sun or moon based on sentiment
        if (opts.sentiment === 'Positive') {
          // Add sun for positive sentiment
          celestialBodies.push({
            x: p.width * 0.8,
            y: p.height * 0.2,
            size: p.random(80, 120),
            color: p.color(255, 240, 180, 200),
            type: 'sun',
            glow: 30
          });
        } else if (opts.sentiment === 'Negative') {
          // Add moon for negative sentiment
          celestialBodies.push({
            x: p.width * 0.2,
            y: p.height * 0.15,
            size: p.random(60, 90),
            color: p.color(200, 200, 220, 180),
            type: 'moon',
            glow: 20
          });
        } else {
          // Add smaller sun or moon for neutral sentiment
          if (p.random() > 0.5) {
            celestialBodies.push({
              x: p.width * 0.7,
              y: p.height * 0.25,
              size: p.random(50, 80),
              color: p.color(220, 220, 180, 150),
              type: 'sun',
              glow: 15
            });
          } else {
            celestialBodies.push({
              x: p.width * 0.3,
              y: p.height * 0.2,
              size: p.random(40, 70),
              color: p.color(180, 180, 200, 150),
              type: 'moon',
              glow: 10
            });
          }
        }
        
        // Add stars
        for (let i = 0; i < 20; i++) {
          celestialBodies.push({
            x: p.random(p.width),
            y: p.random(p.height * 0.5),
            size: p.random(1, 4),
            color: p.color(255, 255, 255, p.random(150, 220)),
            type: 'star'
          });
        }
        
        // Add planets (only in positive or neutral sentiment)
        if (opts.sentiment !== 'Negative') {
          const planetCount = opts.sentiment === 'Positive' ? 2 : 1;
          for (let i = 0; i < planetCount; i++) {
            let planetColor;
            if (opts.sentiment === 'Positive') {
              planetColor = p.color(
                p.random(100, 180),
                p.random(150, 220),
                p.random(180, 255),
                p.random(150, 200)
              );
            } else {
              planetColor = p.color(
                p.random(120, 180),
                p.random(120, 180),
                p.random(150, 220),
                p.random(120, 170)
              );
            }
            
            const orbitCenter = {
              x: p.width * 0.5,
              y: p.height * 0.3
            };
            
            celestialBodies.push({
              x: 0, // Will be set by orbit calculation
              y: 0, // Will be set by orbit calculation
              size: p.random(15, 30),
              color: planetColor,
              type: 'planet',
              orbit: p.random(150, 300),
              orbitSpeed: p.random(0.001, 0.003),
              orbitCenter: orbitCenter,
              orbitAngle: p.random(p.TWO_PI)
            });
          }
        }
      }
      
      // Draw celestial bodies
      function drawCelestialBodies() {
        const opts = optionsRef.current;
        
        for (const body of celestialBodies) {
          // Update orbiting planets
          if (body.type === 'planet' && body.orbit && body.orbitCenter && body.orbitSpeed && body.orbitAngle !== undefined) {
            if (opts.motion) {
              body.orbitAngle += body.orbitSpeed;
            }
            body.x = body.orbitCenter.x + Math.cos(body.orbitAngle) * body.orbit;
            body.y = body.orbitCenter.y + Math.sin(body.orbitAngle) * body.orbit;
          }
          
          // Draw glow effect for sun, moon, planets
          if ((body.type === 'sun' || body.type === 'moon' || body.type === 'planet') && body.glow) {
            p.fill(p.red(body.color), p.green(body.color), p.blue(body.color), 30);
            p.ellipse(body.x, body.y, body.size * 2);
            p.fill(p.red(body.color), p.green(body.color), p.blue(body.color), 20);
            p.ellipse(body.x, body.y, body.size * 2.5);
            
            // Extra glow for sun or positive sentiment
            if (body.type === 'sun' || (opts.sentiment === 'Positive' && opts.colorIntensity)) {
              p.fill(p.red(body.color), p.green(body.color), p.blue(body.color), 10);
              p.ellipse(body.x, body.y, body.size * 3);
              
              // Rays for the sun
              if (body.type === 'sun') {
                p.stroke(p.red(body.color), p.green(body.color), p.blue(body.color), 40);
                p.strokeWeight(2);
                for (let i = 0; i < 8; i++) {
                  const angle = i * p.TWO_PI / 8;
                  const rayLength = body.size * 2;
                  p.line(
                    body.x + Math.cos(angle) * body.size,
                    body.y + Math.sin(angle) * body.size,
                    body.x + Math.cos(angle) * (body.size + rayLength),
                    body.y + Math.sin(angle) * (body.size + rayLength)
                  );
                }
                p.noStroke();
              }
            }
          }
          
          // Draw the celestial body
          p.fill(body.color);
          
          if (body.type === 'sun') {
            p.ellipse(body.x, body.y, body.size);
          } else if (body.type === 'moon') {
            // Moon with craters
            p.ellipse(body.x, body.y, body.size);
            
            // Draw some craters
            p.fill(p.red(body.color) - 20, p.green(body.color) - 20, p.blue(body.color) - 20);
            for (let i = 0; i < 5; i++) {
              const craterX = body.x + p.random(-body.size/3, body.size/3);
              const craterY = body.y + p.random(-body.size/3, body.size/3);
              const craterSize = p.random(body.size/10, body.size/6);
              p.ellipse(craterX, craterY, craterSize);
            }
          } else if (body.type === 'star') {
            // Make stars twinkle
            const twinkle = p.map(p.noise(body.x, body.y, p.frameCount * 0.01), 0, 1, 0.5, 1.5);
            p.ellipse(body.x, body.y, body.size * twinkle);
          } else if (body.type === 'planet') {
            p.ellipse(body.x, body.y, body.size);
            
            // Add ring to planet
            if (p.random() > 0.5) {
              p.push();
              p.translate(body.x, body.y);
              p.rotate(p.PI/4);
              p.noFill();
              p.stroke(body.color);
              p.strokeWeight(2);
              p.ellipse(0, 0, body.size * 1.8, body.size * 0.5);
              p.noStroke();
              p.pop();
            }
          }
        }
      }
      
      // Update floating words from speech text
      function updateFloatingWords() {
        const opts = optionsRef.current;
        const text = opts.text;
        
        // Clear old words occasionally
        if (floatingWords.length > 20) {
          floatingWords = floatingWords.slice(-10);
        }
        
        // Process new words from text
        if (text) {
          const words = text.split(/\s+/);
          if (words.length > 0) {
            // Add a new word randomly
            if (p.frameCount % 30 === 0 && words.length > 0) {
              const randomWord = words[Math.floor(p.random(words.length))].trim();
              
              if (randomWord.length > 2) { // Only display words with at least 3 characters
                let wordColor;
                
                // Color based on sentiment
                if (opts.sentiment === 'Positive') {
                  wordColor = p.color(220, 255, 220, 180);
                } else if (opts.sentiment === 'Negative') {
                  wordColor = p.color(255, 200, 200, 180);
                } else {
                  wordColor = p.color(220, 220, 255, 180);
                }
                
                floatingWords.push({
                  word: randomWord,
                  x: p.random(p.width * 0.2, p.width * 0.8),
                  y: p.random(p.height * 0.3, p.height * 0.7),
                  size: p.map(randomWord.length, 3, 10, 14, 28),
                  color: wordColor,
                  alpha: 255,
                  speedX: p.random(-0.5, 0.5) * (opts.motion ? 1 : 0.2),
                  speedY: p.random(-0.5, 0.5) * (opts.motion ? 1 : 0.2),
                  fadeRate: p.random(0.2, 0.8)
                });
              }
            }
          }
        }
      }
      
      // Draw floating words
      function drawFloatingWords() {
        p.textAlign(p.CENTER, p.CENTER);
        
        for (let i = floatingWords.length - 1; i >= 0; i--) {
          const word = floatingWords[i];
          
          // Update position
          word.x += word.speedX;
          word.y += word.speedY;
          
          // Fade out gradually
          word.alpha -= word.fadeRate;
          
          if (word.alpha <= 0) {
            floatingWords.splice(i, 1);
            continue;
          }
          
          // Draw word
          p.fill(p.red(word.color), p.green(word.color), p.blue(word.color), word.alpha);
          p.textSize(word.size);
          p.text(word.word, word.x, word.y);
        }
      }
    };

    const instance = new p5(sketch);
    setP5Instance(instance);

    // Cleanup on unmount
    return () => {
      instance.remove();
      setP5Instance(null);
    };
  }, []);

  // Function to save canvas as image
  const saveCanvas = async () => {
    return new Promise<void>((resolve, reject) => {
      if (!p5Instance) {
        reject(new Error('Canvas not initialized'));
        return;
      }

      try {
        p5Instance.saveCanvas('vocal-earth-landscape', 'png');
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };

  return { canvasRef, p5Instance, saveCanvas };
}
