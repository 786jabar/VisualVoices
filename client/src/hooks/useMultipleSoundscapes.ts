import { useState, useEffect, useCallback } from 'react';
import * as Tone from 'tone';

// Define possible soundscape types
export type SoundscapeType = 'peaceful' | 'mysterious' | 'dramatic' | 'cheerful' | 'melancholic';

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
      
      // Create instruments
      const newSynth = new Tone.PolySynth(Tone.Synth);
      const newNoiseSynth = new Tone.NoiseSynth();
      
      // Create effects
      const newReverb = new Tone.Reverb(4);
      const newDelay = new Tone.FeedbackDelay(0.5, 0.4);
      const newFilter = new Tone.Filter(1000, "lowpass");
      const newAutoFilter = new Tone.AutoFilter(0.1).start();
      const newVolume = new Tone.Volume(options.volume);
      
      // Connect instruments to effects chain
      newSynth.chain(newFilter, newReverb, newDelay, newVolume, Tone.Destination);
      newNoiseSynth.chain(newAutoFilter, newReverb, newVolume, Tone.Destination);
      
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
        
        newAmbienceLoop = new Tone.Loop((time) => {
          noiseInst.triggerAttackRelease('8n', time, 0.02);
        }, '4n');
        break;
    }
    
    // Start loops with proper error handling
    try {
      if (newMainLoop) {
        newMainLoop.start(0);
        setMainLoop(newMainLoop);
      }
      
      if (newAmbienceLoop) {
        newAmbienceLoop.start(0);
        setAmbienceLoop(newAmbienceLoop);
      }
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
  
  // Update playing state when isActive changes
  useEffect(() => {
    if (isInitialized) {
      if (options.isActive && !isPlaying) {
        Tone.Transport.start();
        setIsPlaying(true);
      } else if (!options.isActive && isPlaying) {
        Tone.Transport.pause();
        setIsPlaying(false);
      }
    }
  }, [options.isActive, isInitialized, isPlaying]);
  
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