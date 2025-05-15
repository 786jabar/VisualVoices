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
      }> = [];
      
      // Background elements (landscape features)
      let bgElements: Array<{
        x: number;
        y: number;
        width: number;
        height: number;
        color: p5.Color;
        type: 'mountain' | 'wave' | 'cloud';
        offset: number;
      }> = [];

      // Audio-reactive waves
      let waves: Array<{
        amplitude: number;
        frequency: number;
        phase: number;
        color: p5.Color;
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
        
        // Disable stroke for most shapes
        p.noStroke();
      };
      
      // Draw function
      p.draw = () => {
        const opts = optionsRef.current;
        
        // Set background color based on sentiment
        let bgColor;
        if (opts.sentiment === 'Positive') {
          bgColor = p.color(18, 18, 18, 220);
          p.background(bgColor);
        } else if (opts.sentiment === 'Negative') {
          bgColor = p.color(20, 18, 26, 220);
          p.background(bgColor);
        } else {
          bgColor = p.color(18, 18, 18, 220);
          p.background(bgColor);
        }
        
        // Draw background elements (landscape features)
        drawBackgroundElements();
        
        // Draw audio-reactive waves
        drawWaves();
        
        // Draw and update particles
        updateAndDrawParticles();
        
        // Generate new particles randomly
        if (p.frameCount % 10 === 0 && particles.length < 100) {
          addParticle();
        }
      };

      // Window resize handler
      p.windowResized = () => {
        if (canvasRef.current) {
          p.resizeCanvas(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
          resetBackgroundElements();
        }
      };
      
      // Reset all particles
      function resetParticles() {
        particles = [];
        for (let i = 0; i < 30; i++) {
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
            p.random(140, 200),
            p.random(150, 200)
          );
        } else if (opts.sentiment === 'Negative') {
          particleColor = p.color(
            p.random(opts.colorIntensity ? 180 : 140, opts.colorIntensity ? 220 : 180),
            p.random(50, 100),
            p.random(100, 140),
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
        
        particles.push({
          x: p.random(p.width),
          y: p.random(p.height),
          size: p.random(5, 15),
          color: particleColor,
          speedX: p.random(-1, 1) * (opts.motion ? 1 : 0.3),
          speedY: p.random(-1, 1) * (opts.motion ? 1 : 0.3),
          alpha: p.random(150, 200)
        });
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
            
            // Bounce off edges
            if (particle.x < 0 || particle.x > p.width) {
              particle.speedX *= -1;
            }
            if (particle.y < 0 || particle.y > p.height) {
              particle.speedY *= -1;
            }
          }
          
          // Draw particle
          p.fill(particle.color);
          p.ellipse(particle.x, particle.y, particle.size);
          
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
            for (let i = 0; i <= 10; i++) {
              const x = element.x - element.width / 2 + (element.width / 10) * i;
              const noiseVal = p.noise(x * 0.01, element.offset);
              const y = element.y - noiseVal * element.height * 0.5;
              p.vertex(x, y);
            }
            
            p.vertex(element.x + element.width / 2, element.y);
            p.vertex(element.x + element.width / 2, p.height);
            p.endShape(p.CLOSE);
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
              p.random(140, 200),
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
            color: waveColor
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
          p.strokeWeight(2);
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
