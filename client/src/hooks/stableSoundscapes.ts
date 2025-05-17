import { useState, useEffect, useCallback, useRef } from 'react';
import * as Tone from 'tone';

// Define possible soundscape types
export type SoundscapeType = 'peaceful' | 'mysterious' | 'dramatic' | 'cheerful' | 'melancholic' | 'cosmic' | 'galactic';

interface SoundscapeOptions {
  initialType: SoundscapeType;
  isActive: boolean;
  volume: number;
}

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
 */
export function useStableSoundscapes(options: SoundscapeOptions): MultipleSoundscapesHook {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSoundscape, setCurrentSoundscape] = useState<SoundscapeType>(options.initialType);
  
  // Use refs for audio elements to prevent recreation issues
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const noiseSynthRef = useRef<Tone.NoiseSynth | null>(null);
  const reverbRef = useRef<Tone.Reverb | null>(null);
  const delayRef = useRef<Tone.FeedbackDelay | null>(null);
  const filterRef = useRef<Tone.Filter | null>(null);
  const autoFilterRef = useRef<Tone.AutoFilter | null>(null);
  const volumeRef = useRef<Tone.Volume | null>(null);
  
  // Refs for loops and sequences
  const mainLoopRef = useRef<Tone.Loop | null>(null);
  const ambienceLoopRef = useRef<Tone.Loop | null>(null);
  
  // Ref to track component mounted state
  const isMountedRef = useRef(true);
  
  // Ref to track initialization in progress
  const initializingRef = useRef(false);
  
  // Track if soundscape change is in progress
  const changingRef = useRef(false);
  
  // Debounce state to prevent rapid audio changes
  const debounceTimerRef = useRef<number | null>(null);
  
  // Track audio context state
  const contextStateRef = useRef<string>('suspended');
  
  // Clean up resources on unmount
  useEffect(() => {
    isMountedRef.current = true;
    
    // Track context state changes
    contextStateRef.current = Tone.context.state;
    console.log("Tone.js context initial state:", Tone.context.state);
    
    return () => {
      console.log("Soundscape component unmounting, cleaning up resources");
      isMountedRef.current = false;
      
      // Clear any pending debounce timers
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      
      // Remove state change listener
      Tone.context.onstatechange = null;
      
      // Clean up all audio resources
      const disposeLoop = (loop: Tone.Loop | null) => {
        if (loop) {
          try {
            loop.stop("+0.1");
            loop.dispose();
          } catch (e) {
            console.log('Error disposing loop:', e);
          }
        }
      };
      
      disposeLoop(mainLoopRef.current);
      disposeLoop(ambienceLoopRef.current);
      
      // Clean up instruments and effects
      if (synthRef.current) {
        try {
          synthRef.current.dispose();
        } catch (e) {
          console.log('Error disposing synth:', e);
        }
      }
      
      if (noiseSynthRef.current) {
        try {
          noiseSynthRef.current.dispose();
        } catch (e) {
          console.log('Error disposing noise synth:', e);
        }
      }
      
      // Stop transport
      if (Tone.Transport.state !== 'stopped') {
        Tone.Transport.stop();
      }
    };
  }, []);
  
  // Initialize Tone.js and instruments
  const initialize = useCallback(async () => {
    if (isInitialized || initializingRef.current || !isMountedRef.current) return;
    
    initializingRef.current = true;
    
    try {
      // Start audio context
      await Tone.start();
      
      // Create instruments with proper error handling
      if (!synthRef.current && isMountedRef.current) {
        synthRef.current = new Tone.PolySynth(Tone.Synth).toDestination();
      }
      
      if (!noiseSynthRef.current && isMountedRef.current) {
        noiseSynthRef.current = new Tone.NoiseSynth().toDestination();
      }
      
      if (!reverbRef.current && isMountedRef.current) {
        reverbRef.current = new Tone.Reverb({
          decay: 5,
          wet: 0.5
        }).toDestination();
      }
      
      if (!delayRef.current && isMountedRef.current) {
        delayRef.current = new Tone.FeedbackDelay({
          delayTime: 0.5,
          feedback: 0.3
        }).toDestination();
      }
      
      if (!filterRef.current && isMountedRef.current) {
        filterRef.current = new Tone.Filter({
          frequency: 700,
          type: "lowpass"
        }).toDestination();
      }
      
      if (!volumeRef.current && isMountedRef.current) {
        volumeRef.current = new Tone.Volume(options.volume).toDestination();
      }
      
      // Connect instruments to effects chain
      if (isMountedRef.current) {
        if (synthRef.current && volumeRef.current) {
          synthRef.current.disconnect();
          synthRef.current.chain(volumeRef.current);
          
          if (reverbRef.current && filterRef.current) {
            synthRef.current.chain(filterRef.current, reverbRef.current, volumeRef.current);
          }
        }
        
        if (noiseSynthRef.current && volumeRef.current) {
          noiseSynthRef.current.disconnect();
          noiseSynthRef.current.chain(volumeRef.current);
          
          if (filterRef.current) {
            noiseSynthRef.current.chain(filterRef.current, volumeRef.current);
          }
        }
        
        // Update volume
        if (volumeRef.current) {
          volumeRef.current.volume.value = Tone.gainToDb(options.volume);
        }
        
        if (isMountedRef.current) {
          setIsInitialized(true);
        }
      }
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    } finally {
      initializingRef.current = false;
    }
  }, [isInitialized, options.volume]);
  
  // Configure different soundscapes
  const configureSoundscape = useCallback(() => {
    if (!isInitialized || 
        !synthRef.current || 
        !noiseSynthRef.current || 
        !volumeRef.current || 
        changingRef.current || 
        !isMountedRef.current) {
      return;
    }
    
    changingRef.current = true;
    
    try {
      // Clean up existing loops
      const cleanupExistingLoops = () => {
        if (mainLoopRef.current) {
          try {
            mainLoopRef.current.stop();
            mainLoopRef.current.dispose();
            mainLoopRef.current = null;
          } catch (e) {
            console.log('Error cleaning up main loop:', e);
          }
        }
        
        if (ambienceLoopRef.current) {
          try {
            ambienceLoopRef.current.stop();
            ambienceLoopRef.current.dispose();
            ambienceLoopRef.current = null;
          } catch (e) {
            console.log('Error cleaning up ambience loop:', e);
          }
        }
      };
      
      // Create loops with better rate limiting
      const createPeacefulLoops = () => {
        // Start with a clean slate
        cleanupExistingLoops();
        
        if (!synthRef.current || !noiseSynthRef.current || !isMountedRef.current) return;
        
        // Peaceful main melody - major pentatonic scale
        mainLoopRef.current = new Tone.Loop((time) => {
          try {
            if (Math.random() > 0.4) { // Only play 60% of the time for more natural feel
              const notes = ['C4', 'D4', 'E4', 'G4', 'A4'];
              const randomNote = notes[Math.floor(Math.random() * notes.length)];
              synthRef.current?.triggerAttackRelease(randomNote, '8n', time, 0.2);
            }
          } catch (e) {
            console.error("Error in peaceful main loop:", e);
          }
        }, '4n').start(0);
        
        // Subtle ambient noise
        ambienceLoopRef.current = new Tone.Loop((time) => {
          try {
            if (Math.random() > 0.7) { // Only play 30% of the time
              noiseSynthRef.current?.triggerAttackRelease('16n', time, 0.02);
            }
          } catch (e) {
            console.error("Error in peaceful ambience loop:", e);
          }
        }, '2n').start(0);
      };
      
      const createMysteriousLoops = () => {
        cleanupExistingLoops();
        
        if (!synthRef.current || !noiseSynthRef.current || !isMountedRef.current) return;
        
        // Mysterious soundscape - dissonant intervals and sparse textures
        mainLoopRef.current = new Tone.Loop((time) => {
          try {
            if (Math.random() > 0.6) { // Only play 40% of the time
              const notes = ['D#3', 'G3', 'A#3', 'C4', 'F#4'];
              const randomNote = notes[Math.floor(Math.random() * notes.length)];
              synthRef.current?.triggerAttackRelease(randomNote, '8n', time, 0.15);
            }
          } catch (e) {
            console.error("Error in mysterious main loop:", e);
          }
        }, '4n').start(0);
        
        ambienceLoopRef.current = new Tone.Loop((time) => {
          try {
            if (Math.random() > 0.8) { // Only play 20% of the time
              noiseSynthRef.current?.triggerAttackRelease('16n', time, 0.04);
            }
          } catch (e) {
            console.error("Error in mysterious ambience loop:", e);
          }
        }, '8n').start(0);
      };
      
      const createDramaticLoops = () => {
        cleanupExistingLoops();
        
        if (!synthRef.current || !noiseSynthRef.current || !isMountedRef.current) return;
        
        // Dramatic soundscape - intense pulsing and deep bass
        mainLoopRef.current = new Tone.Loop((time) => {
          try {
            if (Math.random() > 0.7) { // Only play 30% of the time
              const notes = ['C2', 'G2', 'C3', 'D#3', 'G3'];
              const randomNote = notes[Math.floor(Math.random() * notes.length)];
              synthRef.current?.triggerAttackRelease(randomNote, '2n', time, 0.25);
            }
          } catch (e) {
            console.error("Error in dramatic main loop:", e);
          }
        }, '2n').start(0);
        
        ambienceLoopRef.current = new Tone.Loop((time) => {
          try {
            if (Math.random() > 0.6) { // Only play 40% of the time
              noiseSynthRef.current?.triggerAttackRelease('4n', time, 0.08);
            }
          } catch (e) {
            console.error("Error in dramatic ambience loop:", e);
          }
        }, '2n').start(0);
      };
      
      const createCosmicLoops = () => {
        cleanupExistingLoops();
        
        if (!synthRef.current || !noiseSynthRef.current || !isMountedRef.current) return;
        
        // Cosmic soundscape - ethereal spacey sounds
        mainLoopRef.current = new Tone.Loop((time) => {
          try {
            if (Math.random() > 0.5) { // 50% chance to play
              const notes = ['C5', 'D5', 'E5', 'G5', 'A5', 'C6'];
              const randomNote = notes[Math.floor(Math.random() * notes.length)];
              synthRef.current?.triggerAttackRelease(randomNote, '4n', time, 0.15);
            }
          } catch (e) {
            console.error("Error in cosmic main loop:", e);
          }
        }, '2n').start(0);
        
        ambienceLoopRef.current = new Tone.Loop((time) => {
          try {
            if (Math.random() > 0.7) { // Only 30% chance to play
              noiseSynthRef.current?.triggerAttackRelease('8n', time, 0.04);
            }
          } catch (e) {
            console.error("Error in cosmic ambience loop:", e);
          }
        }, '4n').start(0);
      };
      
      const createGalacticLoops = () => {
        cleanupExistingLoops();
        
        if (!synthRef.current || !noiseSynthRef.current || !isMountedRef.current) return;
        
        // Galactic soundscape - deep space ambience
        mainLoopRef.current = new Tone.Loop((time) => {
          try {
            if (Math.random() > 0.6) { // 40% chance to play
              const notes = ['B2', 'F#3', 'B3', 'C#4', 'F#4', 'B4'];
              const randomNote = notes[Math.floor(Math.random() * notes.length)];
              synthRef.current?.triggerAttackRelease(randomNote, '4n', time, 0.18);
            }
          } catch (e) {
            console.error("Error in galactic main loop:", e);
          }
        }, '4n').start(0);
        
        ambienceLoopRef.current = new Tone.Loop((time) => {
          try {
            if (Math.random() > 0.75) { // 25% chance to play
              noiseSynthRef.current?.triggerAttackRelease('16n', time, 0.03);
            }
          } catch (e) {
            console.error("Error in galactic ambience loop:", e);
          }
        }, '2n').start(0);
      };
      
      // Stop the transport first
      if (Tone.Transport.state === 'started') {
        Tone.Transport.stop();
      }
      
      // Configure based on current soundscape type
      switch (currentSoundscape) {
        case 'peaceful':
          createPeacefulLoops();
          break;
        case 'mysterious':
          createMysteriousLoops();
          break;
        case 'dramatic':
          createDramaticLoops();
          break;
        case 'cosmic':
          createCosmicLoops();
          break;
        case 'galactic':
          createGalacticLoops();
          break;
        default:
          createPeacefulLoops();
          break;
      }
      
      if (isPlaying && isMountedRef.current) {
        // Wait a moment before restarting to avoid glitches
        setTimeout(() => {
          if (isMountedRef.current && isPlaying) {
            Tone.Transport.start("+0.1");
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error configuring soundscape:', error);
    } finally {
      changingRef.current = false;
    }
  }, [isInitialized, currentSoundscape, isPlaying]);
  
  // Effect to setup soundscape when initialized or type changes
  useEffect(() => {
    if (isInitialized && isMountedRef.current && !changingRef.current) {
      configureSoundscape();
    }
  }, [isInitialized, currentSoundscape, configureSoundscape]);
  
  // Update volume when changed in options
  useEffect(() => {
    if (!isInitialized || !volumeRef.current) return;
    
    try {
      volumeRef.current.volume.value = Tone.gainToDb(options.volume);
    } catch (error) {
      console.error('Error updating volume:', error);
    }
  }, [options.volume, isInitialized]);
  
  // Start/stop playback based on options.isActive
  useEffect(() => {
    if (!isInitialized || !isMountedRef.current) return;
    
    if (options.isActive && !isPlaying) {
      togglePlay();
    } else if (!options.isActive && isPlaying) {
      togglePlay();
    }
  }, [options.isActive, isInitialized, isPlaying]);
  
  // Change soundscape type
  const changeSoundscape = useCallback((type: SoundscapeType) => {
    if (type !== currentSoundscape && isMountedRef.current) {
      setCurrentSoundscape(type);
    }
  }, [currentSoundscape]);
  
  // Set volume
  const setVolume = useCallback((volume: number) => {
    if (!volumeRef.current || !isInitialized) return;
    
    try {
      volumeRef.current.volume.value = Tone.gainToDb(volume);
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  }, [isInitialized]);
  
  // Toggle play/pause with improved stability
  const togglePlay = useCallback(async () => {
    if (!isInitialized || !isMountedRef.current) return;
    
    // Prevent multiple rapid toggles
    if (debounceTimerRef.current !== null) {
      return;
    }
    
    try {
      // First time playing - need to initialize audio context
      if (!isPlaying) {
        console.log("Starting audio playback...");
        
        // Ensure audio context is running
        if (Tone.context.state !== 'running') {
          await Tone.context.resume();
          console.log("Tone context resumed:", Tone.context.state);
        }
        
        // Add a small delay to ensure context is fully resumed
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Start transport with a delay to prevent glitches
        debounceTimerRef.current = window.setTimeout(() => {
          if (!isMountedRef.current) return;
          
          try {
            if (Tone.Transport.state !== 'started') {
              Tone.Transport.start("+0.1");
              console.log("Transport started");
            }
            
            if (isMountedRef.current) {
              setIsPlaying(true);
            }
          } catch (error) {
            console.error("Error starting transport:", error);
          } finally {
            debounceTimerRef.current = null;
          }
        }, 200);
      } else {
        console.log("Stopping audio playback...");
        
        // Already playing - pause with debounce
        debounceTimerRef.current = window.setTimeout(() => {
          if (!isMountedRef.current) return;
          
          try {
            if (Tone.Transport.state === 'started') {
              Tone.Transport.stop();
              console.log("Transport stopped");
            }
            
            if (isMountedRef.current) {
              setIsPlaying(false);
            }
          } catch (error) {
            console.error("Error stopping transport:", error);
          } finally {
            debounceTimerRef.current = null;
          }
        }, 200);
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  }, [isInitialized, isPlaying]);
  
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