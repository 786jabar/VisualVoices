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
interface UniqueSoundscapeHook {
  isPlaying: boolean;
  isInitialized: boolean;
  currentSoundscape: SoundscapeType;
  changeSoundscape: (type: SoundscapeType) => void;
  togglePlay: () => Promise<void>;
  setVolume: (volume: number) => void;
  initialize: () => Promise<void>;
}

/**
 * Enhanced hook for unique soundscapes per landscape type
 * Ensures each landscape has its own distinct musical identity
 */
export function useUniqueSoundscapes(options: SoundscapeOptions): UniqueSoundscapeHook {
  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSoundscape, setCurrentSoundscape] = useState<SoundscapeType>(options.initialType);
  
  // Use refs for audio nodes to maintain stable references
  const melodySynthRef = useRef<Tone.PolySynth | null>(null);
  const bassSynthRef = useRef<Tone.PolySynth | null>(null);
  const padSynthRef = useRef<Tone.PolySynth | null>(null);
  const noiseSynthRef = useRef<Tone.NoiseSynth | null>(null);
  
  // Effects
  const reverbRef = useRef<Tone.Reverb | null>(null);
  const delayRef = useRef<Tone.FeedbackDelay | null>(null);
  const filterRef = useRef<Tone.Filter | null>(null);
  const chorusRef = useRef<Tone.Chorus | null>(null);
  const limiterRef = useRef<Tone.Limiter | null>(null);
  const volumeRef = useRef<Tone.Volume | null>(null);
  
  // Patterns and sequences for each soundscape type
  const patternsRef = useRef<Record<SoundscapeType, Tone.Pattern<any>[]>>({
    peaceful: [],
    mysterious: [],
    dramatic: [],
    cheerful: [],
    melancholic: [],
    cosmic: [],
    galactic: []
  });
  
  // Status tracking refs
  const isMountedRef = useRef(true);
  const initializingRef = useRef(false);
  const currentPatternRef = useRef<Tone.Pattern<any>[]>([]);
  
  // Soundscape-specific musical data
  const soundscapeData = {
    peaceful: {
      key: 'C',
      scale: ['C4', 'D4', 'E4', 'G4', 'A4', 'C5'],
      bassNotes: ['C2', 'G2', 'A2', 'G2'],
      padChords: [['C3', 'E3', 'G3'], ['A2', 'C3', 'E3'], ['F2', 'A2', 'C3'], ['G2', 'B2', 'D3']],
      tempo: 70,
      filterFreq: 1000,
      reverbDecay: 4,
      delayTime: 0.5
    },
    mysterious: {
      key: 'Eb',
      scale: ['Eb4', 'F4', 'G4', 'Bb4', 'C5', 'Eb5'],
      bassNotes: ['Eb2', 'Bb2', 'C3', 'G2'],
      padChords: [['Eb3', 'G3', 'Bb3'], ['C3', 'Eb3', 'G3'], ['G2', 'Bb2', 'D3'], ['Bb2', 'D3', 'F3']],
      tempo: 60,
      filterFreq: 800,
      reverbDecay: 6,
      delayTime: 0.75
    },
    dramatic: {
      key: 'D',
      scale: ['D4', 'E4', 'F#4', 'A4', 'B4', 'D5'],
      bassNotes: ['D2', 'A2', 'F#2', 'E2'],
      padChords: [['D3', 'F#3', 'A3'], ['B2', 'D3', 'F#3'], ['A2', 'C#3', 'E3'], ['E2', 'G2', 'B2']],
      tempo: 85,
      filterFreq: 1200,
      reverbDecay: 3,
      delayTime: 0.3
    },
    cheerful: {
      key: 'G',
      scale: ['G4', 'A4', 'B4', 'D5', 'E5', 'G5'],
      bassNotes: ['G2', 'D3', 'B2', 'C3'],
      padChords: [['G3', 'B3', 'D4'], ['D3', 'F#3', 'A3'], ['C3', 'E3', 'G3'], ['B2', 'D3', 'G3']],
      tempo: 110,
      filterFreq: 2000,
      reverbDecay: 2,
      delayTime: 0.25
    },
    melancholic: {
      key: 'A',
      scale: ['A3', 'B3', 'C4', 'E4', 'F4', 'A4'],
      bassNotes: ['A2', 'E2', 'F2', 'E2'],
      padChords: [['A2', 'C3', 'E3'], ['F2', 'A2', 'C3'], ['E2', 'G#2', 'B2'], ['D2', 'F2', 'A2']],
      tempo: 65,
      filterFreq: 700,
      reverbDecay: 5,
      delayTime: 0.6
    },
    cosmic: {
      key: 'B',
      scale: ['B3', 'C#4', 'D#4', 'F#4', 'G#4', 'B4'],
      bassNotes: ['B1', 'F#2', 'G#2', 'E2'],
      padChords: [['B2', 'D#3', 'F#3'], ['G#2', 'B2', 'D#3'], ['E2', 'G#2', 'B2'], ['F#2', 'A#2', 'C#3']],
      tempo: 50,
      filterFreq: 500,
      reverbDecay: 8,
      delayTime: 1.0
    },
    galactic: {
      key: 'F',
      scale: ['F3', 'G3', 'A3', 'C4', 'D4', 'F4'],
      bassNotes: ['F1', 'C2', 'D2', 'Bb1'],
      padChords: [['F2', 'A2', 'C3'], ['C2', 'E2', 'G2'], ['Bb1', 'D2', 'F2'], ['D2', 'F2', 'A2']],
      tempo: 55,
      filterFreq: 600,
      reverbDecay: 10,
      delayTime: 0.9
    }
  };
  
  // Initialize Tone.js and instruments
  const initialize = useCallback(async () => {
    if (isInitialized || initializingRef.current || !isMountedRef.current) return;
    
    initializingRef.current = true;
    console.log("Initializing unique soundscapes audio system...");
    
    try {
      // Start audio context with proper wakelock handling
      await Tone.start();
      console.log("Audio context started:", Tone.context.state);
      
      // Create melody synth with unique sound
      melodySynthRef.current = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: "sine"
        },
        envelope: {
          attack: 0.02,
          decay: 0.2,
          sustain: 0.2,
          release: 1.5
        }
      });
      
      // Create bass synth
      bassSynthRef.current = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: "triangle"
        },
        envelope: {
          attack: 0.05,
          decay: 0.3,
          sustain: 0.8,
          release: 2
        }
      });
      
      // Create pad synth
      padSynthRef.current = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: "sine"
        },
        envelope: {
          attack: 0.8,
          decay: 1.5,
          sustain: 0.8,
          release: 5
        }
      });
      
      // Create noise synth
      noiseSynthRef.current = new Tone.NoiseSynth({
        noise: {
          type: "pink"
        },
        envelope: {
          attack: 1,
          decay: 0.3,
          sustain: 0.2,
          release: 1.5
        }
      });
      
      // Create effects with high-quality settings
      reverbRef.current = new Tone.Reverb({
        decay: 5,
        wet: 0.5,
        preDelay: 0.02
      });
      
      delayRef.current = new Tone.FeedbackDelay({
        delayTime: 0.5,
        feedback: 0.3,
        wet: 0.3
      });
      
      filterRef.current = new Tone.Filter({
        frequency: 1000,
        type: "lowpass",
        rolloff: -24
      });
      
      chorusRef.current = new Tone.Chorus({
        frequency: 0.5,
        depth: 0.7,
        wet: 0.3
      }).start();
      
      limiterRef.current = new Tone.Limiter(-3);
      
      volumeRef.current = new Tone.Volume(options.volume);
      
      // Connect instruments to effects chain with proper routing for cleaner sound
      melodySynthRef.current.chain(
        filterRef.current, 
        delayRef.current, 
        reverbRef.current, 
        limiterRef.current, 
        volumeRef.current, 
        Tone.Destination
      );
      
      bassSynthRef.current.chain(
        filterRef.current, 
        limiterRef.current, 
        volumeRef.current, 
        Tone.Destination
      );
      
      padSynthRef.current.chain(
        chorusRef.current,
        reverbRef.current,
        limiterRef.current,
        volumeRef.current,
        Tone.Destination
      );
      
      noiseSynthRef.current.chain(
        filterRef.current,
        reverbRef.current,
        limiterRef.current,
        volumeRef.current,
        Tone.Destination
      );
      
      // Initialize patterns for each soundscape type
      await initializeAllPatterns();
      
      // Update state
      if (isMountedRef.current) {
        setIsInitialized(true);
        initializingRef.current = false;
      }
      
      console.log("Unique soundscapes audio system initialized successfully");
    } catch (error) {
      console.error("Failed to initialize unique soundscapes audio system:", error);
      initializingRef.current = false;
    }
  }, [options.volume]);
  
  // Initialize patterns for all soundscape types
  const initializeAllPatterns = useCallback(async () => {
    // Clear existing patterns
    Object.keys(patternsRef.current).forEach(key => {
      patternsRef.current[key as SoundscapeType].forEach(pattern => {
        pattern.stop();
        pattern.dispose();
      });
      patternsRef.current[key as SoundscapeType] = [];
    });
    
    // Initialize patterns for each soundscape type
    await Promise.all(
      Object.keys(soundscapeData).map(async (type) => {
        await createPatternsForSoundscape(type as SoundscapeType);
      })
    );
    
    // Set current pattern based on initial soundscape type
    currentPatternRef.current = patternsRef.current[options.initialType];
  }, [options.initialType]);
  
  // Create patterns for a specific soundscape type
  const createPatternsForSoundscape = useCallback(async (type: SoundscapeType) => {
    if (!melodySynthRef.current || !bassSynthRef.current || !padSynthRef.current || !noiseSynthRef.current) {
      return;
    }
    
    const data = soundscapeData[type];
    const patterns: Tone.Pattern<any>[] = [];
    
    // Set Tone.js transport tempo
    Tone.Transport.bpm.value = data.tempo;
    
    // Create melody pattern
    const melodyPattern = new Tone.Pattern({
      callback: (time, note) => {
        if (melodySynthRef.current) {
          melodySynthRef.current.triggerAttackRelease(
            note, 
            "8n", 
            time, 
            type === 'peaceful' || type === 'cheerful' ? 0.3 : 0.2
          );
        }
      },
      values: data.scale,
      pattern: type === 'cheerful' ? 'upDown' : 
               type === 'dramatic' ? 'randomWalk' :
               type === 'mysterious' ? 'randomOnce' : 'random'
    });
    
    // Create bass pattern
    const bassPattern = new Tone.Pattern({
      callback: (time, note) => {
        if (bassSynthRef.current) {
          bassSynthRef.current.triggerAttackRelease(
            note, 
            "2n", 
            time, 
            0.5
          );
        }
      },
      values: data.bassNotes,
      pattern: 'up',
      interval: "2n"
    });
    
    // Create pad chord pattern
    const padPattern = new Tone.Pattern({
      callback: (time, chord) => {
        if (padSynthRef.current) {
          padSynthRef.current.triggerAttackRelease(
            chord, 
            "2m", 
            time, 
            0.2
          );
        }
      },
      values: data.padChords,
      pattern: 'up',
      interval: "1m"
    });
    
    // Add noise for certain soundscape types
    if (type === 'mysterious' || type === 'cosmic' || type === 'galactic') {
      const noisePattern = new Tone.Loop({
        callback: (time) => {
          if (noiseSynthRef.current) {
            noiseSynthRef.current.triggerAttackRelease("8n", time);
          }
        },
        interval: type === 'cosmic' ? "2m" : "4m"
      });
      patterns.push(noisePattern);
    }
    
    // Add all patterns to the collection
    patterns.push(melodyPattern, bassPattern, padPattern);
    patternsRef.current[type] = patterns;
    
    // Configure effects based on soundscape type
    if (filterRef.current) {
      filterRef.current.frequency.value = data.filterFreq;
    }
    
    if (reverbRef.current) {
      await reverbRef.current.dispose();
      reverbRef.current = new Tone.Reverb({
        decay: data.reverbDecay,
        wet: type === 'cosmic' || type === 'galactic' ? 0.7 : 0.5
      }).toDestination();
      
      if (melodySynthRef.current) melodySynthRef.current.connect(reverbRef.current);
      if (padSynthRef.current) padSynthRef.current.connect(reverbRef.current);
      if (noiseSynthRef.current) noiseSynthRef.current.connect(reverbRef.current);
    }
    
    if (delayRef.current) {
      delayRef.current.delayTime.value = data.delayTime;
      delayRef.current.feedback.value = type === 'mysterious' || type === 'cosmic' ? 0.4 : 0.3;
    }
    
    return patterns;
  }, []);
  
  // Change the active soundscape
  const changeSoundscape = useCallback((type: SoundscapeType) => {
    if (type === currentSoundscape || !isInitialized) return;
    
    console.log(`Changing soundscape from ${currentSoundscape} to ${type}`);
    
    // Stop current patterns
    currentPatternRef.current.forEach(pattern => {
      pattern.stop();
    });
    
    // Update state
    setCurrentSoundscape(type);
    
    // Get patterns for new soundscape type
    const newPatterns = patternsRef.current[type];
    
    // Configure effects for the new soundscape
    const data = soundscapeData[type];
    
    if (filterRef.current) {
      filterRef.current.frequency.rampTo(data.filterFreq, 2);
    }
    
    if (delayRef.current) {
      delayRef.current.delayTime.rampTo(data.delayTime, 1);
    }
    
    // If currently playing, start the new patterns
    if (isPlaying) {
      newPatterns.forEach(pattern => {
        pattern.start("+0.1");
      });
    }
    
    // Update current pattern reference
    currentPatternRef.current = newPatterns;
  }, [currentSoundscape, isInitialized, isPlaying]);
  
  // Toggle playback
  const togglePlay = useCallback(async () => {
    if (!isInitialized) {
      await initialize();
    }
    
    if (isPlaying) {
      console.log("Stopping soundscape playback");
      
      // Stop all patterns
      currentPatternRef.current.forEach(pattern => {
        pattern.stop();
      });
      
      // Stop transport
      Tone.Transport.stop();
      setIsPlaying(false);
    } else {
      console.log("Starting soundscape playback");
      
      // Ensure audio context is running
      if (Tone.context.state !== 'running') {
        await Tone.start();
      }
      
      // Set transport state
      Tone.Transport.start();
      
      // Start current patterns
      currentPatternRef.current.forEach(pattern => {
        pattern.start("+0.1");
      });
      
      setIsPlaying(true);
    }
  }, [isInitialized, isPlaying, initialize]);
  
  // Set volume
  const setVolume = useCallback((volume: number) => {
    if (volumeRef.current) {
      volumeRef.current.volume.value = Tone.gainToDb(volume);
    }
  }, []);
  
  // Initialize on mount if active
  useEffect(() => {
    if (options.isActive && !isInitialized && !initializingRef.current) {
      initialize();
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, [options.isActive, isInitialized, initialize]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Stop and dispose all patterns
      Object.values(patternsRef.current).forEach(patterns => {
        patterns.forEach(pattern => {
          pattern.stop();
          pattern.dispose();
        });
      });
      
      // Dispose synths and effects
      if (melodySynthRef.current) melodySynthRef.current.dispose();
      if (bassSynthRef.current) bassSynthRef.current.dispose();
      if (padSynthRef.current) padSynthRef.current.dispose();
      if (noiseSynthRef.current) noiseSynthRef.current.dispose();
      if (reverbRef.current) reverbRef.current.dispose();
      if (delayRef.current) delayRef.current.dispose();
      if (filterRef.current) filterRef.current.dispose();
      if (chorusRef.current) chorusRef.current.dispose();
      if (limiterRef.current) limiterRef.current.dispose();
      if (volumeRef.current) volumeRef.current.dispose();
      
      // Stop transport
      if (Tone.Transport.state === 'started') {
        Tone.Transport.stop();
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