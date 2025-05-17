import { useState, useEffect, useCallback, useRef } from 'react';
import * as Tone from 'tone';

// Types of soundscapes available in the app
export type SoundscapeType = 'peaceful' | 'mysterious' | 'dramatic' | 'cheerful' | 'melancholic' | 'cosmic' | 'galactic';

// Options for the soundscape hook
interface SoundscapeOptions {
  initialType: SoundscapeType;
  isActive: boolean;
  volume: number;
}

// Hook return type
interface MultipleSoundscapesHook {
  isPlaying: boolean;
  isInitialized: boolean;
  currentSoundscape: SoundscapeType;
  changeSoundscape: (type: SoundscapeType) => void;
  togglePlay: () => Promise<void>;
  setVolume: (volume: number) => void;
  initialize: () => Promise<void>;
}

/**
 * Improved hook for managing multiple ambient soundscapes with stability fixes
 * - Fixed audio glitching during transitions
 * - Removed mute/unmute system for continuous playback
 * - Added better error handling and resource management
 * - Improved performance with proper cleanup
 */
export function useStableSoundscapes(options: SoundscapeOptions): MultipleSoundscapesHook {
  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSoundscape, setCurrentSoundscape] = useState<SoundscapeType>(options.initialType);
  
  // Use refs for audio nodes to maintain stable references
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const padSynthRef = useRef<Tone.PolySynth | null>(null);
  const noiseSynthRef = useRef<Tone.NoiseSynth | null>(null);
  const reverbRef = useRef<Tone.Reverb | null>(null);
  const delayRef = useRef<Tone.FeedbackDelay | null>(null);
  const filterRef = useRef<Tone.Filter | null>(null);
  const autoFilterRef = useRef<Tone.AutoFilter | null>(null);
  const limiterRef = useRef<Tone.Limiter | null>(null);
  const volumeRef = useRef<Tone.Volume | null>(null);
  
  // Refs for patterns and sequences
  const mainLoopRef = useRef<Tone.Loop | null>(null);
  const secondaryLoopRef = useRef<Tone.Loop | null>(null);
  const ambienceLoopRef = useRef<Tone.Loop | null>(null);
  
  // Status tracking refs
  const isMountedRef = useRef(true);
  const initializingRef = useRef(false);
  const changingRef = useRef(false);
  const lastNoteTimeRef = useRef(0);
  
  // Initialize Tone.js and audio components
  const initialize = useCallback(async () => {
    // Don't initialize twice or if component unmounted
    if (isInitialized || !isMountedRef.current || initializingRef.current) return;
    
    initializingRef.current = true;
    console.log("Initializing 3D audio system...");
    
    try {
      // Workaround for Safari/iOS first-touch issue
      const audioContext = Tone.getContext().rawContext;
      const checkStarted = async () => {
        if (audioContext.state !== 'running') {
          await Tone.start();
        }
        console.log("Audio context started:", audioContext.state);
      };
      await checkStarted();
      
      // Create synth with stability optimizations
      synthRef.current = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: "sine"
        },
        envelope: {
          attack: 0.2,   // Slower attack prevents clicks
          decay: 0.3,
          sustain: 0.4,
          release: 2.0   // Longer release for smoother transitions
        },
        volume: -10      // Lower base volume to prevent clipping
      });
      
      // Create pad synth for sustained ambient tones
      padSynthRef.current = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: "sine"
        },
        envelope: {
          attack: 0.8,   // Very slow attack for pad sounds
          decay: 1.5,
          sustain: 0.8,
          release: 5.0   // Very long release for sustained sound
        },
        volume: -15      // Even lower volume for background sound
      });
      
      // Create noise synth for texture
      noiseSynthRef.current = new Tone.NoiseSynth({
        noise: {
          type: "pink"   // More natural sounding noise
        },
        envelope: {
          attack: 1.0,   // Slow attack
          decay: 0.3,
          sustain: 0.5,
          release: 3.0   // Long release to prevent clicks
        },
        volume: -25      // Much lower volume for background texture
      });
      
      // Create effects with improved settings
      reverbRef.current = new Tone.Reverb({
        decay: 5.0,      // Longer reverb for atmosphere
        wet: 0.5,        // 50% wet/dry mix
        preDelay: 0.1    // Small predelay for clarity
      });
      await reverbRef.current.generate(); // Generate IR now, not during playback
      
      delayRef.current = new Tone.FeedbackDelay({
        delayTime: "8n", // Musical timing
        feedback: 0.2,   // Moderate feedback
        wet: 0.3         // 30% wet/dry mix
      });
      
      filterRef.current = new Tone.Filter({
        frequency: 2000, // Base frequency
        type: "lowpass", // Remove harsh frequencies
        rolloff: -24,    // More gradual slope
        Q: 0.5           // Lower resonance prevents peaks
      });
      
      autoFilterRef.current = new Tone.AutoFilter({
        frequency: 0.1,  // Very slow modulation
        depth: 0.5,      // Moderate depth
        type: "sine",    // Smooth modulation
        wet: 0.3         // Subtle effect amount
      });
      autoFilterRef.current.start();
      
      // Add limiter to prevent clipping and digital artifacts
      limiterRef.current = new Tone.Limiter(-3);
      
      // Volume control
      volumeRef.current = new Tone.Volume(Tone.gainToDb(options.volume));
      
      // Create optimized signal chain to reduce audio glitches
      if (synthRef.current && padSynthRef.current && noiseSynthRef.current && 
          reverbRef.current && delayRef.current && filterRef.current && 
          autoFilterRef.current && limiterRef.current && volumeRef.current) {
        
        // Main melodic synth chain
        synthRef.current.chain(
          filterRef.current,
          delayRef.current,
          reverbRef.current,
          limiterRef.current, 
          volumeRef.current,
          Tone.Destination
        );
        
        // Pad synth chain (simpler for performance)
        padSynthRef.current.chain(
          filterRef.current,
          reverbRef.current, 
          limiterRef.current,
          volumeRef.current,
          Tone.Destination
        );
        
        // Noise synth chain
        noiseSynthRef.current.chain(
          autoFilterRef.current,
          filterRef.current,
          limiterRef.current,
          volumeRef.current,
          Tone.Destination
        );
        
        // Configure soundscape based on type
        await configureSoundscape();
        
        if (isMountedRef.current) {
          setIsInitialized(true);
          console.log("3D audio system initialized successfully");
        }
      }
    } catch (error) {
      console.error('Failed to initialize audio system:', error);
    } finally {
      initializingRef.current = false;
    }
  }, [options.volume]);
  
  // Configure soundscape based on type
  const configureSoundscape = useCallback(async () => {
    if (!synthRef.current || !padSynthRef.current || !noiseSynthRef.current || 
        !filterRef.current || changingRef.current || !isMountedRef.current) {
      return;
    }
    
    // Prevent simultaneous reconfiguration
    changingRef.current = true;
    console.log(`Configuring soundscape: ${currentSoundscape}`);
    
    try {
      // Clean up existing patterns
      if (mainLoopRef.current) {
        mainLoopRef.current.stop();
        mainLoopRef.current.dispose();
        mainLoopRef.current = null;
      }
      
      if (secondaryLoopRef.current) {
        secondaryLoopRef.current.stop();
        secondaryLoopRef.current.dispose();
        secondaryLoopRef.current = null;
      }
      
      if (ambienceLoopRef.current) {
        ambienceLoopRef.current.stop();
        ambienceLoopRef.current.dispose();
        ambienceLoopRef.current = null;
      }
      
      // Configure filter and effects based on soundscape type
      if (filterRef.current && autoFilterRef.current && reverbRef.current && delayRef.current) {
        // Reset base settings
        Tone.Transport.bpm.value = 70; // Default tempo
        
        // Apply soundscape-specific settings
        switch (currentSoundscape) {
          case 'peaceful':
            // Gentle, relaxing settings
            filterRef.current.frequency.value = 2000;
            autoFilterRef.current.frequency.value = 0.08;
            autoFilterRef.current.depth.value = 0.3;
            reverbRef.current.wet.value = 0.6;
            delayRef.current.wet.value = 0.2;
            Tone.Transport.bpm.value = 60;
            
            // Create peaceful melodic pattern
            createPeacefulSoundscape();
            break;
            
          case 'mysterious':
            // Enigmatic, atmospheric settings
            filterRef.current.frequency.value = 1800;
            autoFilterRef.current.frequency.value = 0.1;
            autoFilterRef.current.depth.value = 0.6;
            reverbRef.current.wet.value = 0.7;
            delayRef.current.wet.value = 0.4;
            Tone.Transport.bpm.value = 65;
            
            // Create mysterious melodic pattern
            createMysteriousSoundscape();
            break;
            
          case 'dramatic':
            // Bold, intense settings
            filterRef.current.frequency.value = 3000;
            autoFilterRef.current.frequency.value = 0.15;
            autoFilterRef.current.depth.value = 0.5;
            reverbRef.current.wet.value = 0.5;
            delayRef.current.wet.value = 0.3;
            Tone.Transport.bpm.value = 75;
            
            // Create dramatic melodic pattern
            createDramaticSoundscape();
            break;
            
          case 'cosmic':
            // Spacious, ethereal settings
            filterRef.current.frequency.value = 2500;
            autoFilterRef.current.frequency.value = 0.05;
            autoFilterRef.current.depth.value = 0.7;
            reverbRef.current.wet.value = 0.8;
            delayRef.current.wet.value = 0.5;
            Tone.Transport.bpm.value = 55;
            
            // Create cosmic melodic pattern
            createCosmicSoundscape();
            break;
            
          case 'galactic':
            // Vast, spacey settings
            filterRef.current.frequency.value = 2200;
            autoFilterRef.current.frequency.value = 0.03;
            autoFilterRef.current.depth.value = 0.8;
            reverbRef.current.wet.value = 0.9;
            delayRef.current.wet.value = 0.6;
            Tone.Transport.bpm.value = 50;
            
            // Create galactic melodic pattern
            createGalacticSoundscape();
            break;
            
          case 'cheerful':
            // Bright, uplifting settings
            filterRef.current.frequency.value = 3500;
            autoFilterRef.current.frequency.value = 0.2;
            autoFilterRef.current.depth.value = 0.4;
            reverbRef.current.wet.value = 0.4;
            delayRef.current.wet.value = 0.25;
            Tone.Transport.bpm.value = 85;
            
            // Create cheerful melodic pattern
            createCheerfulSoundscape();
            break;
            
          case 'melancholic':
            // Soft, wistful settings
            filterRef.current.frequency.value = 1500;
            autoFilterRef.current.frequency.value = 0.07;
            autoFilterRef.current.depth.value = 0.4;
            reverbRef.current.wet.value = 0.7;
            delayRef.current.wet.value = 0.3;
            Tone.Transport.bpm.value = 55;
            
            // Create melancholic melodic pattern
            createMelancholicSoundscape();
            break;
            
          default:
            // Fallback to peaceful
            createPeacefulSoundscape();
        }
        
        // Start transport if playing
        if (isPlaying && Tone.Transport.state !== 'started') {
          Tone.Transport.start();
        }
      }
    } catch (error) {
      console.error(`Error configuring ${currentSoundscape} soundscape:`, error);
    } finally {
      changingRef.current = false;
    }
  }, [currentSoundscape, isPlaying]);
  
  // Create peaceful soundscape patterns
  const createPeacefulSoundscape = useCallback(() => {
    if (!synthRef.current || !padSynthRef.current || !noiseSynthRef.current) return;
    
    // Pentatonic scale for peaceful harmony
    const notes = ['G3', 'A3', 'C4', 'D4', 'E4', 'G4', 'A4', 'C5'];
    const padNotes = ['G2', 'D3', 'G3', 'C3', 'E3'];
    
    // Create main melodic pattern
    mainLoopRef.current = new Tone.Loop((time) => {
      try {
        // Prevent note overlaps by checking timing
        const currentTime = Tone.Transport.seconds;
        if (currentTime - lastNoteTimeRef.current < 0.1) return;
        lastNoteTimeRef.current = currentTime;
        
        // Play random note from scale
        const note = notes[Math.floor(Math.random() * notes.length)];
        synthRef.current?.triggerAttackRelease(note, "4n", time, 0.2 + Math.random() * 0.3);
      } catch (e) {
        console.error("Error in peaceful melody loop:", e);
      }
    }, "2n");
    
    // Create pad chord pattern
    secondaryLoopRef.current = new Tone.Loop((time) => {
      try {
        // Play sustained pad chord
        const note = padNotes[Math.floor(Math.random() * padNotes.length)];
        padSynthRef.current?.triggerAttackRelease(note, "1m", time, 0.1);
      } catch (e) {
        console.error("Error in peaceful pad loop:", e);
      }
    }, "2m");
    
    // Subtle ambient noise
    ambienceLoopRef.current = new Tone.Loop((time) => {
      try {
        if (Math.random() > 0.7) {
          noiseSynthRef.current?.triggerAttackRelease("16n", time, 0.03);
        }
      } catch (e) {
        console.error("Error in peaceful ambience loop:", e);
      }
    }, "4n");
    
    // Start loops with offset timing to prevent simultaneous triggers
    mainLoopRef.current.start("+0.1");
    secondaryLoopRef.current.start("+1.3");
    ambienceLoopRef.current.start("+2.7");
  }, []);
  
  // Create mysterious soundscape patterns
  const createMysteriousSoundscape = useCallback(() => {
    if (!synthRef.current || !padSynthRef.current || !noiseSynthRef.current) return;
    
    // Mysterious scale with dissonant notes
    const notes = ['D3', 'F3', 'G3', 'Bb3', 'C4', 'D4', 'F4', 'G4'];
    const padNotes = ['D2', 'G2', 'Bb2', 'F2'];
    
    // Create main melodic pattern
    mainLoopRef.current = new Tone.Loop((time) => {
      try {
        const currentTime = Tone.Transport.seconds;
        if (currentTime - lastNoteTimeRef.current < 0.1) return;
        lastNoteTimeRef.current = currentTime;
        
        if (Math.random() > 0.5) {
          const note = notes[Math.floor(Math.random() * notes.length)];
          synthRef.current?.triggerAttackRelease(note, "8n", time, 0.1 + Math.random() * 0.2);
        }
      } catch (e) {
        console.error("Error in mysterious melody loop:", e);
      }
    }, "3n");
    
    // Create pad chord pattern
    secondaryLoopRef.current = new Tone.Loop((time) => {
      try {
        const note = padNotes[Math.floor(Math.random() * padNotes.length)];
        padSynthRef.current?.triggerAttackRelease(note, "2m", time, 0.08);
      } catch (e) {
        console.error("Error in mysterious pad loop:", e);
      }
    }, "2m");
    
    // Mysterious ambient noise
    ambienceLoopRef.current = new Tone.Loop((time) => {
      try {
        if (Math.random() > 0.6) {
          noiseSynthRef.current?.triggerAttackRelease("8n", time, 0.05);
        }
      } catch (e) {
        console.error("Error in mysterious ambience loop:", e);
      }
    }, "2n");
    
    // Start loops with offset timing
    mainLoopRef.current.start("+0.2");
    secondaryLoopRef.current.start("+1.5");
    ambienceLoopRef.current.start("+3.1");
  }, []);
  
  // Create dramatic soundscape patterns
  const createDramaticSoundscape = useCallback(() => {
    if (!synthRef.current || !padSynthRef.current || !noiseSynthRef.current) return;
    
    // Dramatic minor scale
    const notes = ['C3', 'D#3', 'F3', 'G3', 'G#3', 'C4', 'D#4', 'F4'];
    const padNotes = ['C2', 'G2', 'C3', 'D#3'];
    
    // Create main melodic pattern
    mainLoopRef.current = new Tone.Loop((time) => {
      try {
        const currentTime = Tone.Transport.seconds;
        if (currentTime - lastNoteTimeRef.current < 0.1) return;
        lastNoteTimeRef.current = currentTime;
        
        // More frequent notes for dramatic effect
        const note = notes[Math.floor(Math.random() * notes.length)];
        synthRef.current?.triggerAttackRelease(note, "8n", time, 0.3 + Math.random() * 0.3);
      } catch (e) {
        console.error("Error in dramatic melody loop:", e);
      }
    }, "4n");
    
    // Create pad chord pattern
    secondaryLoopRef.current = new Tone.Loop((time) => {
      try {
        // Stronger pad sounds
        const note = padNotes[Math.floor(Math.random() * padNotes.length)];
        padSynthRef.current?.triggerAttackRelease(note, "1m", time, 0.15);
      } catch (e) {
        console.error("Error in dramatic pad loop:", e);
      }
    }, "1m");
    
    // Dramatic noise bursts
    ambienceLoopRef.current = new Tone.Loop((time) => {
      try {
        if (Math.random() > 0.6) {
          noiseSynthRef.current?.triggerAttackRelease("16n", time, 0.1);
        }
      } catch (e) {
        console.error("Error in dramatic ambience loop:", e);
      }
    }, "2n");
    
    // Start loops with offset timing
    mainLoopRef.current.start("+0.1");
    secondaryLoopRef.current.start("+0.7");
    ambienceLoopRef.current.start("+1.3");
  }, []);
  
  // Create cosmic soundscape patterns
  const createCosmicSoundscape = useCallback(() => {
    if (!synthRef.current || !padSynthRef.current || !noiseSynthRef.current) return;
    
    // Ethereal, wide-interval scale
    const notes = ['E3', 'A3', 'B3', 'E4', 'F#4', 'B4', 'E5'];
    const padNotes = ['E2', 'B2', 'E3', 'A2'];
    
    // Create main melodic pattern
    mainLoopRef.current = new Tone.Loop((time) => {
      try {
        const currentTime = Tone.Transport.seconds;
        if (currentTime - lastNoteTimeRef.current < 0.15) return;
        lastNoteTimeRef.current = currentTime;
        
        // Sparse, echoing notes
        if (Math.random() > 0.5) {
          const note = notes[Math.floor(Math.random() * notes.length)];
          synthRef.current?.triggerAttackRelease(note, "2n", time, 0.1 + Math.random() * 0.15);
        }
      } catch (e) {
        console.error("Error in cosmic melody loop:", e);
      }
    }, "2n");
    
    // Create pad chord pattern
    secondaryLoopRef.current = new Tone.Loop((time) => {
      try {
        // Very long, evolving pad sounds
        const note = padNotes[Math.floor(Math.random() * padNotes.length)];
        padSynthRef.current?.triggerAttackRelease(note, "4m", time, 0.07);
      } catch (e) {
        console.error("Error in cosmic pad loop:", e);
      }
    }, "3m");
    
    // Subtle cosmic noise
    ambienceLoopRef.current = new Tone.Loop((time) => {
      try {
        if (Math.random() > 0.7) {
          noiseSynthRef.current?.triggerAttackRelease("8n", time, 0.03);
        }
      } catch (e) {
        console.error("Error in cosmic ambience loop:", e);
      }
    }, "4n");
    
    // Start loops with generous offset timing
    mainLoopRef.current.start("+0.5");
    secondaryLoopRef.current.start("+4.5");
    ambienceLoopRef.current.start("+8.0");
  }, []);
  
  // Create galactic soundscape patterns
  const createGalacticSoundscape = useCallback(() => {
    if (!synthRef.current || !padSynthRef.current || !noiseSynthRef.current) return;
    
    // Wide-range scale for space-like sounds
    const notes = ['G2', 'D3', 'G3', 'D4', 'G4', 'B4', 'D5', 'G5'];
    const padNotes = ['G1', 'D2', 'G2', 'B2'];
    
    // Create main melodic pattern
    mainLoopRef.current = new Tone.Loop((time) => {
      try {
        const currentTime = Tone.Transport.seconds;
        if (currentTime - lastNoteTimeRef.current < 0.2) return;
        lastNoteTimeRef.current = currentTime;
        
        // Very sparse, high-register notes like distant stars
        if (Math.random() > 0.7) {
          const note = notes[Math.floor(Math.random() * notes.length)];
          synthRef.current?.triggerAttackRelease(note, "4n", time, 0.05 + Math.random() * 0.1);
        }
      } catch (e) {
        console.error("Error in galactic melody loop:", e);
      }
    }, "1n");
    
    // Create pad chord pattern
    secondaryLoopRef.current = new Tone.Loop((time) => {
      try {
        // Extremely long, evolving pad sounds like gravitational waves
        const note = padNotes[Math.floor(Math.random() * padNotes.length)];
        padSynthRef.current?.triggerAttackRelease(note, "8m", time, 0.05);
      } catch (e) {
        console.error("Error in galactic pad loop:", e);
      }
    }, "4m");
    
    // Very subtle cosmic background radiation
    ambienceLoopRef.current = new Tone.Loop((time) => {
      try {
        if (Math.random() > 0.8) {
          noiseSynthRef.current?.triggerAttackRelease("16n", time, 0.02);
        }
      } catch (e) {
        console.error("Error in galactic ambience loop:", e);
      }
    }, "2n");
    
    // Start loops with extensive offset timing
    mainLoopRef.current.start("+1.0");
    secondaryLoopRef.current.start("+8.0");
    ambienceLoopRef.current.start("+16.0");
  }, []);
  
  // Create cheerful soundscape patterns
  const createCheerfulSoundscape = useCallback(() => {
    if (!synthRef.current || !padSynthRef.current || !noiseSynthRef.current) return;
    
    // Major scale for cheerful mood
    const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'C5', 'D5', 'E5'];
    const padNotes = ['C3', 'G3', 'C4', 'E3', 'F3'];
    
    // Create main melodic pattern
    mainLoopRef.current = new Tone.Loop((time) => {
      try {
        const currentTime = Tone.Transport.seconds;
        if (currentTime - lastNoteTimeRef.current < 0.08) return;
        lastNoteTimeRef.current = currentTime;
        
        // Frequent, bright notes
        const note = notes[Math.floor(Math.random() * notes.length)];
        synthRef.current?.triggerAttackRelease(note, "8n", time, 0.2 + Math.random() * 0.2);
      } catch (e) {
        console.error("Error in cheerful melody loop:", e);
      }
    }, "8n");
    
    // Create pad chord pattern
    secondaryLoopRef.current = new Tone.Loop((time) => {
      try {
        // Brighter pad sounds
        const note = padNotes[Math.floor(Math.random() * padNotes.length)];
        padSynthRef.current?.triggerAttackRelease(note, "2n", time, 0.1);
      } catch (e) {
        console.error("Error in cheerful pad loop:", e);
      }
    }, "1m");
    
    // Almost no noise for clarity
    ambienceLoopRef.current = new Tone.Loop((time) => {
      try {
        if (Math.random() > 0.9) {
          noiseSynthRef.current?.triggerAttackRelease("32n", time, 0.01);
        }
      } catch (e) {
        console.error("Error in cheerful ambience loop:", e);
      }
    }, "2n");
    
    // Start loops with offset timing
    mainLoopRef.current.start("+0.1");
    secondaryLoopRef.current.start("+0.5");
    ambienceLoopRef.current.start("+1.1");
  }, []);
  
  // Create melancholic soundscape patterns
  const createMelancholicSoundscape = useCallback(() => {
    if (!synthRef.current || !padSynthRef.current || !noiseSynthRef.current) return;
    
    // Minor scale for melancholy
    const notes = ['A3', 'C4', 'D4', 'E4', 'G4', 'A4', 'C5'];
    const padNotes = ['A2', 'E3', 'A3', 'C3', 'D3'];
    
    // Create main melodic pattern
    mainLoopRef.current = new Tone.Loop((time) => {
      try {
        const currentTime = Tone.Transport.seconds;
        if (currentTime - lastNoteTimeRef.current < 0.15) return;
        lastNoteTimeRef.current = currentTime;
        
        // Slower, thoughtful notes
        if (Math.random() > 0.4) {
          const note = notes[Math.floor(Math.random() * notes.length)];
          synthRef.current?.triggerAttackRelease(note, "2n", time, 0.15 + Math.random() * 0.15);
        }
      } catch (e) {
        console.error("Error in melancholic melody loop:", e);
      }
    }, "2n");
    
    // Create pad chord pattern
    secondaryLoopRef.current = new Tone.Loop((time) => {
      try {
        // Sustained, emotional pad sounds
        const note = padNotes[Math.floor(Math.random() * padNotes.length)];
        padSynthRef.current?.triggerAttackRelease(note, "2m", time, 0.12);
      } catch (e) {
        console.error("Error in melancholic pad loop:", e);
      }
    }, "2m");
    
    // Gentle rain-like ambience
    ambienceLoopRef.current = new Tone.Loop((time) => {
      try {
        if (Math.random() > 0.6) {
          noiseSynthRef.current?.triggerAttackRelease("16n", time, 0.04);
        }
      } catch (e) {
        console.error("Error in melancholic ambience loop:", e);
      }
    }, "8n");
    
    // Start loops with offset timing
    mainLoopRef.current.start("+0.3");
    secondaryLoopRef.current.start("+2.1");
    ambienceLoopRef.current.start("+3.7");
  }, []);
  
  // Change the current soundscape
  const changeSoundscape = useCallback((type: SoundscapeType) => {
    if (changingRef.current || type === currentSoundscape) return;
    
    setCurrentSoundscape(type);
    
    // Reconfigure soundscape for the new type
    if (isInitialized) {
      configureSoundscape();
    }
  }, [configureSoundscape, currentSoundscape, isInitialized]);
  
  // Toggle playback state
  const togglePlay = useCallback(async () => {
    if (!isInitialized) {
      // Initialize if not already done
      await initialize();
      setIsPlaying(true);
      
      if (Tone.Transport.state !== 'started') {
        Tone.Transport.start();
      }
      return;
    }
    
    // Toggle playback state
    if (isPlaying) {
      // Only pause, don't stop (to maintain patterns)
      Tone.Transport.pause();
      setIsPlaying(false);
    } else {
      try {
        // Resume playback
        if (Tone.Transport.state !== 'started') {
          Tone.Transport.start();
        }
        setIsPlaying(true);
      } catch (error) {
        console.error('Error starting audio playback:', error);
      }
    }
  }, [initialize, isInitialized, isPlaying]);
  
  // Set volume level
  const setVolume = useCallback((volume: number) => {
    if (volumeRef.current) {
      volumeRef.current.volume.value = Tone.gainToDb(volume);
    }
  }, []);
  
  // When component unmounts, clean up all audio resources
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      console.log("Cleaning up 3D audio system...");
      
      // Clean up all patterns
      if (mainLoopRef.current) {
        mainLoopRef.current.stop();
        mainLoopRef.current.dispose();
      }
      
      if (secondaryLoopRef.current) {
        secondaryLoopRef.current.stop();
        secondaryLoopRef.current.dispose();
      }
      
      if (ambienceLoopRef.current) {
        ambienceLoopRef.current.stop();
        ambienceLoopRef.current.dispose();
      }
      
      // Clean up all audio nodes to prevent memory leaks
      [
        synthRef.current,
        padSynthRef.current,
        noiseSynthRef.current,
        reverbRef.current,
        delayRef.current,
        filterRef.current,
        autoFilterRef.current,
        limiterRef.current,
        volumeRef.current
      ].forEach(node => {
        if (node) {
          node.dispose();
        }
      });
      
      // Pause transport but don't stop it - this is less disruptive
      if (Tone.Transport.state === 'started') {
        Tone.Transport.pause();
      }
    };
  }, []);
  
  // Effect to handle isActive changes from props
  useEffect(() => {
    if (isInitialized) {
      if (options.isActive && !isPlaying) {
        // If component should be active but audio isn't playing, start it
        togglePlay();
      } else if (!options.isActive && isPlaying) {
        // If component should not be active but audio is playing, pause it
        togglePlay();
      }
    }
  }, [options.isActive, isInitialized, isPlaying, togglePlay]);
  
  // Effect to handle volume changes from props
  useEffect(() => {
    if (isInitialized && volumeRef.current) {
      volumeRef.current.volume.value = Tone.gainToDb(options.volume);
    }
  }, [options.volume, isInitialized]);
  
  // Apply soundscape changes when initialized or soundscape type changes
  useEffect(() => {
    if (isInitialized && !changingRef.current) {
      configureSoundscape();
    }
  }, [configureSoundscape, currentSoundscape, isInitialized]);
  
  return {
    isPlaying,
    isInitialized,
    currentSoundscape,
    changeSoundscape,
    togglePlay,
    setVolume,
    initialize
  };
}