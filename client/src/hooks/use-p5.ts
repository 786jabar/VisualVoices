import { useRef, useState, useEffect } from 'react';

// Use simpler type definition for p5
type P5 = any;

interface UseP5Options {
  sketch: (p: P5) => void;
}

export function useP5(options: UseP5Options) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [p5Instance, setP5Instance] = useState<any>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Dynamically import p5 to avoid SSR issues
    import('p5').then((p5Module) => {
      const p5 = p5Module.default;
      
      // Create new p5 instance
      const instance = new p5(options.sketch, containerRef.current);
      setP5Instance(instance);
      
      // Cleanup on unmount
      return () => {
        if (instance && typeof instance.remove === 'function') {
          instance.remove();
        }
        setP5Instance(null);
      };
    });
  }, [options.sketch]);
  
  return {
    containerRef,
    p5Instance
  };
}