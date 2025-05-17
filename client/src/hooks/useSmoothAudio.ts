import { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';

// Types for the soundscape system
export type SoundscapeType = 'peaceful' | 'mysterious' | 'dramatic' | 'cheerful' | 'melancholic' | 'cosmic' | 'galactic';

interface SoundscapeOptions {
  initialType: SoundscapeType;
  isActive: boolean;
  volume: number;
}

interface SoundscapeHook {
  isPlaying: boolean;
  isInitialized: boolean;
  currentSoundscape: SoundscapeType;
  changeSoundscape: (type: SoundscapeType) => void;
  togglePlay: () => Promise<void>;
  setVolume: (volume: number) => void;
  initialize: () => Promise<void>;
}

/**
 * Improved hook for managing audio soundscapes with fixes for glitching
 */
export function useSmoothAudio(options: SoundscapeOptions): SoundscapeHook {
  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSoundscape, setCurrentSoundscape] = useState<SoundscapeType>(options.initialType);
  
  // Refs to track state between renders
  const isMountedRef = useRef(true);
  const isTransitioningRef = useRef(false);
  const debounceTimerRef = useRef<number | null>(null);
  
  // Refs for Tone.js objects
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const noiseSynthRef = useRef<Tone.NoiseSynth | null>(null);
  const volumeNodeRef = useRef<Tone.Volume | null>(null);
  const mainLoopRef = useRef<Tone.Loop | null>(null);
  const ambienceLoopRef = useRef<Tone.Loop | null>(null);
  
  // Initialize audio system
  const initialize = useCallback(async () => {
    if (isInitialized || !isMountedRef.current) return;
    
    console.log("Initializing audio system...");
    
    try {
      // Start Tone.js audio context
      await Tone.start();
      
      // Create synth with better settings for stability
      synthRef.current = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: "sine"
        },
        envelope: {
          attack: 0.05,
          decay: 0.2,
          sustain: 0.5,
          release: 1.5
        }
      });
      
      // Create noise synth
      noiseSynthRef.current = new Tone.NoiseSynth({
        noise: {
          type: "pink"
        },
        envelope: {
          attack: 0.1,
          decay: 0.2,
          sustain: 0.5,
          release: 1.5
        }
      });
      
      // Create volume control
      volumeNodeRef.current = new Tone.Volume(Tone.gainToDb(options.volume));
      
      // Connect components with proper chain
      synthRef.current.connect(volumeNodeRef.current);
      noiseSynthRef.current.connect(volumeNodeRef.current);
      volumeNodeRef.current.toDestination();
      
      // Update state
      if (isMountedRef.current) {
        setIsInitialized(true);
      }
      
      console.log("Audio system initialized successfully");
    } catch (error) {
      console.error("Failed to initialize audio system:", error);
    }
  }, [isInitialized, options.volume]);
  
  // Configure soundscape based on the selected type
  const configureSoundscape = useCallback(() => {
    if (!isInitialized || !isMountedRef.current || isTransitioningRef.current) return;
    
    isTransitioningRef.current = true;
    console.log(`Configuring soundscape: ${currentSoundscape}`);
    
    try {
      // Safety check
      if (!synthRef.current || !noiseSynthRef.current) {
        console.error("Synths not initialized");
        isTransitioningRef.current = false;
        return;
      }
      
      // Stop existing loops
      const stopExistingLoops = () => {
        return new Promise<void>((resolve) => {
          // Clean up main loop
          if (mainLoopRef.current) {
            try {
              mainLoopRef.current.stop();
              mainLoopRef.current.dispose();
              mainLoopRef.current = null;
            } catch (e) {
              console.warn("Error stopping main loop:", e);
            }
          }
          
          // Clean up ambience loop
          if (ambienceLoopRef.current) {
            try {
              ambienceLoopRef.current.stop();
              ambienceLoopRef.current.dispose();
              ambienceLoopRef.current = null;
            } catch (e) {
              console.warn("Error stopping ambience loop:", e);
            }
          }
          
          // Use small delay to ensure proper cleanup
          setTimeout(resolve, 100);
        });
      };
      
      // Stop existing loops and then create new ones
      stopExistingLoops().then(() => {
        if (!isMountedRef.current || !synthRef.current || !noiseSynthRef.current) {
          isTransitioningRef.current = false;
          return;
        }
        
        // Temporarily store refs for stability
        const synth = synthRef.current;
        const noiseSynth = noiseSynthRef.current;
        
        // Different loop configurations based on soundscape type
        switch (currentSoundscape) {
          case 'peaceful':
            // Peaceful, calming soundscape
            mainLoopRef.current = new Tone.Loop((time) => {
              try {
                const notes = ['C4', 'E4', 'G4', 'B4', 'D5'];
                const randomNote = notes[Math.floor(Math.random() * notes.length)];
                synth.triggerAttackRelease(randomNote, '8n', time, 0.2);
              } catch (e) {
                console.warn("Error in peaceful main loop:", e);
              }
            }, '4n');
            
            // Add offset to ambience timing to prevent conflicts
            ambienceLoopRef.current = new Tone.Loop((time) => {
              try {
                // Using time offset to prevent timing conflicts
                noiseSynth.triggerAttackRelease('8n', time + 0.1, 0.02);
              } catch (e) {
                console.warn("Error in peaceful ambience loop:", e);
              }
            }, '2n');
            break;
            
          case 'mysterious':
            // Mysterious, eerie soundscape
            mainLoopRef.current = new Tone.Loop((time) => {
              try {
                const notes = ['D3', 'F#3', 'A3', 'C4', 'E4'];
                const randomNote = notes[Math.floor(Math.random() * notes.length)];
                synth.triggerAttackRelease(randomNote, '8n', time, 0.15);
              } catch (e) {
                console.warn("Error in mysterious main loop:", e);
              }
            }, '4n');
            
            ambienceLoopRef.current = new Tone.Loop((time) => {
              try {
                noiseSynth.triggerAttackRelease('16n', time + 0.15, 0.03);
              } catch (e) {
                console.warn("Error in mysterious ambience loop:", e);
              }
            }, '2n');
            break;
            
          case 'dramatic':
            // Dramatic, intense soundscape
            mainLoopRef.current = new Tone.Loop((time) => {
              try {
                const notes = ['A2', 'C3', 'E3', 'G3', 'B3'];
                const randomNote = notes[Math.floor(Math.random() * notes.length)];
                synth.triggerAttackRelease(randomNote, '8n', time, 0.25);
              } catch (e) {
                console.warn("Error in dramatic main loop:", e);
              }
            }, '4n');
            
            ambienceLoopRef.current = new Tone.Loop((time) => {
              try {
                noiseSynth.triggerAttackRelease('8n', time + 0.2, 0.05);
              } catch (e) {
                console.warn("Error in dramatic ambience loop:", e);
              }
            }, '2n');
            break;
            
          case 'cheerful':
            // Cheerful, upbeat soundscape
            mainLoopRef.current = new Tone.Loop((time) => {
              try {
                const notes = ['G4', 'B4', 'D5', 'F#5', 'A5'];
                const randomNote = notes[Math.floor(Math.random() * notes.length)];
                synth.triggerAttackRelease(randomNote, '16n', time, 0.2);
              } catch (e) {
                console.warn("Error in cheerful main loop:", e);
              }
            }, '4n');
            
            ambienceLoopRef.current = new Tone.Loop((time) => {
              try {
                noiseSynth.triggerAttackRelease('16n', time + 0.25, 0.01);
              } catch (e) {
                console.warn("Error in cheerful ambience loop:", e);
              }
            }, '2n');
            break;
            
          case 'melancholic':
            // Melancholic, sad soundscape
            mainLoopRef.current = new Tone.Loop((time) => {
              try {
                const notes = ['E3', 'G3', 'B3', 'D4', 'F4'];
                const randomNote = notes[Math.floor(Math.random() * notes.length)];
                synth.triggerAttackRelease(randomNote, '4n', time, 0.2);
              } catch (e) {
                console.warn("Error in melancholic main loop:", e);
              }
            }, '2n');
            
            ambienceLoopRef.current = new Tone.Loop((time) => {
              try {
                noiseSynth.triggerAttackRelease('4n', time + 0.3, 0.02);
              } catch (e) {
                console.warn("Error in melancholic ambience loop:", e);
              }
            }, '4n');
            break;
            
          case 'cosmic':
            // Cosmic, ethereal soundscape
            mainLoopRef.current = new Tone.Loop((time) => {
              try {
                const notes = ['C5', 'D5', 'E5', 'G5', 'A5', 'C6'];
                const randomNote = notes[Math.floor(Math.random() * notes.length)];
                synth.triggerAttackRelease(randomNote, '4n', time, 0.15);
              } catch (e) {
                console.warn("Error in cosmic main loop:", e);
              }
            }, '2n');
            
            ambienceLoopRef.current = new Tone.Loop((time) => {
              try {
                noiseSynth.triggerAttackRelease('8n', time + 0.35, 0.04);
              } catch (e) {
                console.warn("Error in cosmic ambience loop:", e);
              }
            }, '4n');
            break;
            
          case 'galactic':
            // Galactic, deep space soundscape
            mainLoopRef.current = new Tone.Loop((time) => {
              try {
                const notes = ['B2', 'F#3', 'B3', 'C#4', 'F#4', 'B4'];
                const randomNote = notes[Math.floor(Math.random() * notes.length)];
                synth.triggerAttackRelease(randomNote, '4n', time, 0.18);
              } catch (e) {
                console.warn("Error in galactic main loop:", e);
              }
            }, '2n');
            
            ambienceLoopRef.current = new Tone.Loop((time) => {
              try {
                noiseSynth.triggerAttackRelease('8n', time + 0.4, 0.03);
              } catch (e) {
                console.warn("Error in galactic ambience loop:", e);
              }
            }, '4n');
            break;
            
          default:
            // Default to peaceful as a fallback
            mainLoopRef.current = new Tone.Loop((time) => {
              try {
                const notes = ['C4', 'E4', 'G4', 'B4', 'D5'];
                const randomNote = notes[Math.floor(Math.random() * notes.length)];
                synth.triggerAttackRelease(randomNote, '8n', time, 0.2);
              } catch (e) {
                console.warn("Error in default main loop:", e);
              }
            }, '4n');
            
            ambienceLoopRef.current = new Tone.Loop((time) => {
              try {
                noiseSynth.triggerAttackRelease('8n', time + 0.45, 0.02);
              } catch (e) {
                console.warn("Error in default ambience loop:", e);
              }
            }, '2n');
        }
        
        // Start loops if currently playing
        if (isPlaying && isMountedRef.current) {
          // Wait a moment before starting to avoid glitches
          setTimeout(() => {
            if (mainLoopRef.current && ambienceLoopRef.current && isMountedRef.current) {
              try {
                // Start with offsets to prevent timing conflicts
                mainLoopRef.current.start("+0.1");
                ambienceLoopRef.current.start("+0.3");
                console.log("Loops started for soundscape:", currentSoundscape);
              } catch (e) {
                console.error("Error starting loops:", e);
              }
            }
            isTransitioningRef.current = false;
          }, 150);
        } else {
          isTransitioningRef.current = false;
        }
      });
    } catch (error) {
      console.error("Error configuring soundscape:", error);
      isTransitioningRef.current = false;
    }
  }, [currentSoundscape, isInitialized, isPlaying]);
  
  // Toggle play/pause audio
  const togglePlay = useCallback(async () => {
    if (!isInitialized || !isMountedRef.current) return;
    
    // Prevent rapid toggles
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    
    // Use debounce to prevent rapid toggles that cause glitches
    debounceTimerRef.current = window.setTimeout(async () => {
      try {
        if (!isPlaying) {
          console.log("Starting audio playback...");
          
          // Make sure audio context is running
          if (Tone.context.state !== "running") {
            await Tone.context.resume();
          }
          
          // Start transport
          if (Tone.Transport.state !== "started") {
            Tone.Transport.start("+0.1");
          }
          
          // Start loops
          if (mainLoopRef.current && ambienceLoopRef.current) {
            // Use staggered timing to prevent glitches
            mainLoopRef.current.start("+0.1");
            // Add slight delay for second loop to avoid timing conflicts
            ambienceLoopRef.current.start("+0.3");
          }
          
          if (isMountedRef.current) {
            setIsPlaying(true);
          }
        } else {
          console.log("Stopping audio playback...");
          
          // Stop loops
          if (mainLoopRef.current) {
            mainLoopRef.current.stop();
          }
          
          if (ambienceLoopRef.current) {
            ambienceLoopRef.current.stop();
          }
          
          // Stop transport
          if (Tone.Transport.state === "started") {
            Tone.Transport.stop();
          }
          
          if (isMountedRef.current) {
            setIsPlaying(false);
          }
        }
      } catch (error) {
        console.error("Error toggling audio playback:", error);
      }
      
      debounceTimerRef.current = null;
    }, 300);
  }, [isInitialized, isPlaying]);
  
  // Set volume
  const setVolume = useCallback((volume: number) => {
    if (!volumeNodeRef.current || !isInitialized) return;
    
    try {
      volumeNodeRef.current.volume.value = Tone.gainToDb(Math.max(0, Math.min(1, volume)));
    } catch (error) {
      console.error("Error setting volume:", error);
    }
  }, [isInitialized]);
  
  // Change soundscape type
  const changeSoundscape = useCallback((type: SoundscapeType) => {
    if (type === currentSoundscape || isTransitioningRef.current) return;
    
    console.log(`Changing soundscape from ${currentSoundscape} to ${type}`);
    setCurrentSoundscape(type);
  }, [currentSoundscape]);
  
  // Reconfigure when soundscape type changes
  useEffect(() => {
    if (isInitialized && isMountedRef.current && !isTransitioningRef.current) {
      configureSoundscape();
    }
  }, [isInitialized, currentSoundscape, configureSoundscape]);
  
  // Update volume when options change
  useEffect(() => {
    if (isInitialized && volumeNodeRef.current) {
      volumeNodeRef.current.volume.value = Tone.gainToDb(options.volume);
    }
  }, [isInitialized, options.volume]);
  
  // Start/stop playback based on options.isActive
  useEffect(() => {
    if (!isInitialized || !isMountedRef.current) return;
    
    if (options.isActive && !isPlaying) {
      // Add small delay to prevent rapid state changes
      setTimeout(() => {
        if (isMountedRef.current && options.isActive && !isPlaying) {
          togglePlay();
        }
      }, 300);
    } else if (!options.isActive && isPlaying) {
      // Add small delay to prevent rapid state changes
      setTimeout(() => {
        if (isMountedRef.current && !options.isActive && isPlaying) {
          togglePlay();
        }
      }, 300);
    }
  }, [options.isActive, isInitialized, isPlaying, togglePlay]);
  
  // Clean up on unmount
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      console.log("Cleaning up audio resources");
      isMountedRef.current = false;
      
      // Clear any debounce timers
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
      }
      
      // Stop all loops
      if (mainLoopRef.current) {
        try {
          mainLoopRef.current.stop();
          mainLoopRef.current.dispose();
        } catch (e) {
          console.warn("Error disposing main loop:", e);
        }
      }
      
      if (ambienceLoopRef.current) {
        try {
          ambienceLoopRef.current.stop();
          ambienceLoopRef.current.dispose();
        } catch (e) {
          console.warn("Error disposing ambience loop:", e);
        }
      }
      
      // Stop transport
      if (Tone.Transport.state === "started") {
        Tone.Transport.stop();
      }
      
      // Dispose synths
      if (synthRef.current) {
        try {
          synthRef.current.dispose();
        } catch (e) {
          console.warn("Error disposing synth:", e);
        }
      }
      
      if (noiseSynthRef.current) {
        try {
          noiseSynthRef.current.dispose();
        } catch (e) {
          console.warn("Error disposing noise synth:", e);
        }
      }
      
      if (volumeNodeRef.current) {
        try {
          volumeNodeRef.current.dispose();
        } catch (e) {
          console.warn("Error disposing volume node:", e);
        }
      }
    };
  }, []);
  
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