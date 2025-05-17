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
 * Hook for managing multiple ambient soundscapes for different landscape types
 */
export function useMultipleSoundscapes(options: SoundscapeOptions): MultipleSoundscapesHook {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSoundscape, setCurrentSoundscape] = useState<SoundscapeType>(options.initialType);
  
  // Instruments and effects
  const [synth, setSynth] = useState<Tone.PolySynth | null>(null);
  const [noiseSynth, setNoiseSynth] = useState<Tone.NoiseSynth | null>(null);
  const [reverb, setReverb] = useState<Tone.Reverb | null>(null);
  const [delay, setDelay] = useState<Tone.FeedbackDelay | null>(null);
  const [filter, setFilter] = useState<Tone.Filter | null>(null);
  const [autoFilter, setAutoFilter] = useState<Tone.AutoFilter | null>(null);
  const [volume, setVolumeNode] = useState<Tone.Volume | null>(null);
  
  // Patterns and sequences
  const [mainLoop, setMainLoop] = useState<Tone.Loop | null>(null);
  const [ambienceLoop, setAmbienceLoop] = useState<Tone.Loop | null>(null);
  
  // Initialize Tone.js and instruments
  const initialize = useCallback(async () => {
    if (isInitialized) return;
    
    try {
      // Start audio context
      await Tone.start();
      
      // Create instruments with better sound quality settings
      const newSynth = new Tone.PolySynth(Tone.Synth, {
        envelope: {
          attack: 0.1,
          decay: 0.3,
          sustain: 0.4,
          release: 1.2,
        },
        oscillator: {
          type: "sine"  // Use sine wave for cleaner sound
        }
      });
      
      // Create noise synth with optimized settings to reduce distortion
      const newNoiseSynth = new Tone.NoiseSynth({
        noise: {
          type: "pink",  // Pink noise sounds more natural
          playbackRate: 0.5  // Slower playback rate for smoother sound
        },
        envelope: {
          attack: 0.2,
          decay: 0.3,
          sustain: 0.2,
          release: 0.8
        }
      });
      
      // Create effects with better audio quality settings
      const newReverb = new Tone.Reverb({
        decay: 2.5,  // Reduced from 4 to minimize muddiness
        wet: 0.3     // Lower wet level to reduce audio distortion
      });
      
      const newDelay = new Tone.FeedbackDelay({
        delayTime: 0.5,
        feedback: 0.2,  // Reduced from 0.4 to prevent audio buildup
        wet: 0.25       // Lower wet level for clarity
      });
      
      const newFilter = new Tone.Filter({
        frequency: 1500,  // Increased from 1000 for more clarity
        type: "lowpass",
        Q: 0.5  // Lower Q factor for smoother filtering
      });
      
      const newAutoFilter = new Tone.AutoFilter({
        frequency: 0.1,
        depth: 0.4,  // Reduced depth for less extreme modulation
        wet: 0.3     // Lower wet mix for subtle effect
      }).start();
      
      // Master volume control with limiter to prevent distortion
      const newLimiter = new Tone.Limiter(-3); // Add limiter to prevent clipping
      const newVolume = new Tone.Volume(options.volume);
      
      // Connect instruments to effects chain with improved signal flow
      newSynth.chain(newFilter, newDelay, newReverb, newLimiter, newVolume, Tone.Destination);
      newNoiseSynth.chain(newAutoFilter, newFilter, newReverb, newLimiter, newVolume, Tone.Destination);
      
      // Set state
      setSynth(newSynth);
      setNoiseSynth(newNoiseSynth);
      setReverb(newReverb);
      setDelay(newDelay);
      setFilter(newFilter);
      setAutoFilter(newAutoFilter);
      setVolumeNode(newVolume);
      
      // Initialize loops based on soundscape type
      initializeSoundscape(options.initialType, newSynth, newNoiseSynth);
      
      setIsInitialized(true);
      
      // Don't auto-play - require user interaction first
      // Even if isActive is true, we'll wait for explicit user control
      setIsPlaying(false);
      Tone.Transport.pause();
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }, [isInitialized, options.initialType, options.isActive, options.volume]);
  
  // Initialize soundscape based on type with improved performance and error handling
  const initializeSoundscape = useCallback((
    type: SoundscapeType, 
    synthInst: Tone.PolySynth, 
    noiseInst: Tone.NoiseSynth
  ) => {
    // First stop transport to ensure clean state
    if (Tone.Transport.state === 'started') {
      Tone.Transport.stop();
    }
    
    // Clear existing loops with proper error handling
    if (mainLoop) {
      try {
        mainLoop.stop();
        mainLoop.dispose();
        setMainLoop(null);
      } catch (e) {
        console.error("Error disposing main loop:", e);
      }
    }
    
    if (ambienceLoop) {
      try {
        ambienceLoop.stop();
        ambienceLoop.dispose();
        setAmbienceLoop(null);
      } catch (e) {
        console.error("Error disposing ambience loop:", e);
      }
    }
    
    // Make sure we release any held notes
    try {
      if (synthInst) {
        synthInst.releaseAll();
      }
    } catch (e) {
      console.error("Error releasing synth notes:", e);
    }
    
    let newMainLoop: Tone.Loop;
    let newAmbienceLoop: Tone.Loop;
    
    // Create loops based on soundscape type with better error handling
    switch (type) {
          case 'peaceful':
            // Peaceful soundscape - gentle arpeggios and soft ambient noise
            newMainLoop = new Tone.Loop((time) => {
              try {
                const notes = ['C4', 'E4', 'G4', 'B4', 'D5'];
                const randomNote = notes[Math.floor(Math.random() * notes.length)];
                synthInst.triggerAttackRelease(randomNote, '8n', time, 0.2);
              } catch (e) {
                console.error("Error in peaceful main loop:", e);
              }
            }, '4n');
            
            newAmbienceLoop = new Tone.Loop((time) => {
              try {
                noiseInst.triggerAttackRelease('8n', time, 0.02);
              } catch (e) {
                console.error("Error in peaceful ambience loop:", e);
              }
            }, '4n');
            break;
        
      case 'mysterious':
        // Mysterious soundscape - dissonant intervals and sparse textures
        newMainLoop = new Tone.Loop((time) => {
          try {
            const notes = ['D#3', 'G3', 'A#3', 'C4', 'F#4'];
            const randomNote = notes[Math.floor(Math.random() * notes.length)];
            synthInst.triggerAttackRelease(randomNote, '8n', time, 0.15);
          } catch (e) {
            console.error("Error in mysterious main loop:", e);
          }
        }, '4n');
        
        newAmbienceLoop = new Tone.Loop((time) => {
          try {
            if (Math.random() > 0.7) {
              noiseInst.triggerAttackRelease('16n', time, 0.05);
            }
          } catch (e) {
            console.error("Error in mysterious ambience loop:", e);
          }
        }, '8n');
        break;
        
      case 'dramatic':
        // Dramatic soundscape - intense pulsing and deep bass
        newMainLoop = new Tone.Loop((time) => {
          if (Math.random() > 0.6) {
            const notes = ['C2', 'G2', 'C3', 'D#3', 'G3'];
            const randomNote = notes[Math.floor(Math.random() * notes.length)];
            synthInst.triggerAttackRelease(randomNote, '2n', time, 0.3);
          }
        }, '2n');
        
        newAmbienceLoop = new Tone.Loop((time) => {
          noiseInst.triggerAttackRelease('4n', time, 0.1);
        }, '2n');
        break;
        
      case 'cheerful':
        // Cheerful soundscape - major key patterns and bright tones
        newMainLoop = new Tone.Loop((time) => {
          const notes = ['C4', 'E4', 'G4', 'A4', 'D5'];
          const randomNote = notes[Math.floor(Math.random() * notes.length)];
          synthInst.triggerAttackRelease(randomNote, '8n', time, 0.25);
        }, '8n');
        
        newAmbienceLoop = new Tone.Loop((time) => {
          if (Math.random() > 0.8) {
            noiseInst.triggerAttackRelease('32n', time, 0.03);
          }
        }, '8n');
        break;
        
      case 'melancholic':
        // Melancholic soundscape - minor key with slow evolving textures
        newMainLoop = new Tone.Loop((time) => {
          const notes = ['A3', 'C4', 'E4', 'G4', 'B4'];
          const randomNote = notes[Math.floor(Math.random() * notes.length)];
          synthInst.triggerAttackRelease(randomNote, '2n', time, 0.15);
        }, '2n');
        
        newAmbienceLoop = new Tone.Loop((time) => {
          if (Math.random() > 0.7) {
            noiseInst.triggerAttackRelease('4n', time, 0.04);
          }
        }, '4n');
        break;
        
      default:
        // Default to peaceful
        newMainLoop = new Tone.Loop((time) => {
          const notes = ['C4', 'E4', 'G4', 'B4', 'D5'];
          const randomNote = notes[Math.floor(Math.random() * notes.length)];
          synthInst.triggerAttackRelease(randomNote, '8n', time, 0.2);
        }, '4n');
        
        // Add time offset parameter to prevent timing conflicts
        newAmbienceLoop = new Tone.Loop((time) => {
          // Use a different offset time to avoid overlapping with the main loop
          const safeTime = time + 0.25;
          noiseInst.triggerAttackRelease('8n', safeTime, 0.02);
        }, '4n');
        break;
    }
    
    // Start loops with proper error handling and staggered timing to prevent conflicts
    try {
      // Track if loops were started successfully for better error handling
      let mainLoopStarted = false;
      let ambienceLoopStarted = false;
      
      if (newMainLoop) {
        // Use a small offset from 0 to ensure Tone.js is ready
        newMainLoop.start("+0.1");
        setMainLoop(newMainLoop);
        mainLoopStarted = true;
      }
      
      if (newAmbienceLoop) {
        // Use a different start time to avoid conflicts with main loop
        // This prevents the timing conflict error
        newAmbienceLoop.start("+0.35");
        setAmbienceLoop(newAmbienceLoop);
        ambienceLoopStarted = true;
      }
      
      // Log successful loop initialization for debugging
      console.log(`Loops initialized: main=${mainLoopStarted}, ambience=${ambienceLoopStarted}`);
    } catch (e) {
      console.error("Error starting audio loops:", e);
    }
  }, [mainLoop, ambienceLoop]);
  
  // Change soundscape type
  const changeSoundscape = useCallback((type: SoundscapeType) => {
    if (!isInitialized || !synth || !noiseSynth) return;
    
    setCurrentSoundscape(type);
    initializeSoundscape(type, synth, noiseSynth);
  }, [isInitialized, synth, noiseSynth, initializeSoundscape]);
  
  // Toggle play/pause with comprehensive error handling
  const togglePlay = useCallback(async () => {
    try {
      // If not initialized, do that first
      if (!isInitialized) {
        await initialize();
        // Wait a moment for initialization to complete
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      if (isPlaying) {
        // First, cleanup and release any held notes
        if (synth) {
          try {
            synth.releaseAll();
          } catch (e) {
            console.error("Error releasing synth notes:", e);
          }
        }
        
        // Try to pause transport gracefully
        try {
          Tone.Transport.pause();
        } catch (e) {
          console.error("Error pausing Tone.js transport:", e);
          // Force stop as fallback
          Tone.Transport.stop();
        }
        
        // Update state
        setIsPlaying(false);
      } else {
        // First, make sure audio context is running
        try {
          await Tone.start();
          
          if (Tone.context.state !== 'running') {
            await Tone.context.resume();
          }
        } catch (e) {
          console.error("Error starting Tone.js context:", e);
        }
        
        // Ensure transport is in a fresh state
        if (Tone.Transport.state === 'started') {
          Tone.Transport.stop();
          // Small delay to ensure clean restart
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        // Start transport with proper error handling
        try {
          Tone.Transport.start("+0.1");
          setIsPlaying(true);
        } catch (e) {
          console.error("Error starting Tone.js transport:", e);
        }
      }
    } catch (error) {
      console.error("Critical audio system error:", error);
    }
  }, [isInitialized, isPlaying, initialize, synth]);
  
  // Set volume
  const setVolume = useCallback((volumeLevel: number) => {
    if (!volume) return;
    volume.volume.value = Tone.gainToDb(volumeLevel);
  }, [volume]);
  
  // Update volume when options change
  useEffect(() => {
    if (volume && options.volume !== undefined) {
      setVolume(options.volume);
    }
  }, [options.volume, volume, setVolume]);
  
  // Update playing state when isActive changes with improved reliability
  useEffect(() => {
    if (isInitialized) {
      const handleStateChange = async () => {
        try {
          // When the component becomes active
          if (options.isActive && !isPlaying) {
            // Make sure audio context is running
            await Tone.start();
            
            // Ensure clean transport state
            if (Tone.Transport.state === 'started') {
              Tone.Transport.stop();
              // Small delay to ensure clean restart
              await new Promise(resolve => setTimeout(resolve, 50));
            }
            
            // Start loops explicitly to ensure they're running
            if (mainLoop && mainLoop.state !== 'started') {
              mainLoop.start(0);
            }
            
            if (ambienceLoop && ambienceLoop.state !== 'started') {
              ambienceLoop.start(0);
            }
            
            // Start transport
            Tone.Transport.start("+0.1");
            setIsPlaying(true);
          } 
          // When the component becomes inactive
          else if (!options.isActive && isPlaying) {
            // Release any held notes
            if (synth) {
              synth.releaseAll();
            }
            
            // Stop transport
            Tone.Transport.pause();
            setIsPlaying(false);
          }
        } catch (error) {
          console.error("Error handling active state change:", error);
        }
      };
      
      handleStateChange();
    }
  }, [options.isActive, isInitialized, isPlaying, synth, mainLoop, ambienceLoop]);
  
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