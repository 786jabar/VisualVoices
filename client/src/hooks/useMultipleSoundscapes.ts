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
  
  // Initialize soundscape based on type
  const initializeSoundscape = useCallback((
    type: SoundscapeType, 
    synthInst: Tone.PolySynth, 
    noiseInst: Tone.NoiseSynth
  ) => {
    // Clear existing loops
    if (mainLoop) {
      mainLoop.dispose();
      setMainLoop(null);
    }
    if (ambienceLoop) {
      ambienceLoop.dispose();
      setAmbienceLoop(null);
    }
    
    let newMainLoop: Tone.Loop;
    let newAmbienceLoop: Tone.Loop;
    
    // Create loops based on soundscape type
    switch (type) {
      case 'peaceful':
        // Peaceful soundscape - gentle arpeggios and soft ambient noise
        newMainLoop = new Tone.Loop((time) => {
          const notes = ['C4', 'E4', 'G4', 'B4', 'D5'];
          const randomNote = notes[Math.floor(Math.random() * notes.length)];
          synthInst.triggerAttackRelease(randomNote, '8n', time, 0.2);
        }, '4n');
        
        newAmbienceLoop = new Tone.Loop((time) => {
          noiseInst.triggerAttackRelease('8n', time, 0.02);
        }, '4n');
        break;
        
      case 'mysterious':
        // Mysterious soundscape - dissonant intervals and sparse textures
        newMainLoop = new Tone.Loop((time) => {
          const notes = ['D#3', 'G3', 'A#3', 'C4', 'F#4'];
          const randomNote = notes[Math.floor(Math.random() * notes.length)];
          synthInst.triggerAttackRelease(randomNote, '8n', time, 0.15);
        }, '4n');
        
        newAmbienceLoop = new Tone.Loop((time) => {
          if (Math.random() > 0.7) {
            noiseInst.triggerAttackRelease('16n', time, 0.05);
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
    
    // Start loops
    newMainLoop.start(0);
    newAmbienceLoop.start(0);
    
    setMainLoop(newMainLoop);
    setAmbienceLoop(newAmbienceLoop);
    
  }, [mainLoop, ambienceLoop]);
  
  // Change soundscape type
  const changeSoundscape = useCallback((type: SoundscapeType) => {
    if (!isInitialized || !synth || !noiseSynth) return;
    
    setCurrentSoundscape(type);
    initializeSoundscape(type, synth, noiseSynth);
  }, [isInitialized, synth, noiseSynth, initializeSoundscape]);
  
  // Toggle play/pause
  const togglePlay = useCallback(async () => {
    if (!isInitialized) {
      await initialize();
      return;
    }
    
    if (isPlaying) {
      Tone.Transport.pause();
    } else {
      Tone.Transport.start();
    }
    
    setIsPlaying(!isPlaying);
  }, [isInitialized, isPlaying, initialize]);
  
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