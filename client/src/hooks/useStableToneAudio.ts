import { useState, useEffect, useCallback, useRef } from 'react';
import * as Tone from 'tone';

interface StableToneAudioOptions {
  sentiment: 'Negative' | 'Neutral' | 'Positive';
  sentimentScore: number;
  isActive: boolean;
  volume: number; // 0 to 1
}

/**
 * An improved hook for managing Tone.js audio with better stability and performance
 */
export function useStableToneAudio(options: StableToneAudioOptions) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Use refs for all Tone.js objects
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const filterRef = useRef<Tone.Filter | null>(null);
  const reverbRef = useRef<Tone.Reverb | null>(null);
  const volumeRef = useRef<Tone.Volume | null>(null);
  const loopRef = useRef<Tone.Loop | null>(null);
  
  // Track state between renders
  const optionsRef = useRef(options);
  const isMountedRef = useRef<boolean>(true);
  const isTransitioningRef = useRef<boolean>(false);
  const debounceTimerRef = useRef<number | null>(null);

  // Update options ref when props change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);
  
  // Set mounted flag for cleanup
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      
      // Clear any debounce timers
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      
      // Stop and dispose all Tone.js resources on unmount
      cleanup();
    };
  }, []);
  
  // Cleanup function to properly dispose of all Tone.js resources
  const cleanup = useCallback(() => {
    // Clean up loop
    if (loopRef.current) {
      try {
        loopRef.current.stop();
        loopRef.current.dispose();
        loopRef.current = null;
      } catch (e) {
        console.warn('Error disposing loop:', e);
      }
    }
    
    // Stop transport if it's still running
    if (Tone.Transport.state === 'started') {
      try {
        Tone.Transport.stop();
      } catch (e) {
        console.warn('Error stopping transport:', e);
      }
    }
    
    // Dispose all audio nodes in reverse connection order
    if (volumeRef.current) {
      try {
        volumeRef.current.dispose();
        volumeRef.current = null;
      } catch (e) {
        console.warn('Error disposing volume:', e);
      }
    }
    
    if (reverbRef.current) {
      try {
        reverbRef.current.dispose();
        reverbRef.current = null;
      } catch (e) {
        console.warn('Error disposing reverb:', e);
      }
    }
    
    if (filterRef.current) {
      try {
        filterRef.current.dispose();
        filterRef.current = null;
      } catch (e) {
        console.warn('Error disposing filter:', e);
      }
    }
    
    if (synthRef.current) {
      try {
        synthRef.current.dispose();
        synthRef.current = null;
      } catch (e) {
        console.warn('Error disposing synth:', e);
      }
    }
  }, []);
  
  // Initialize audio system
  const initialize = useCallback(async () => {
    if (isInitialized || !isMountedRef.current) return;
    
    console.log('Initializing Tone.js audio system...');
    
    try {
      // Start audio context
      await Tone.start();
      
      // Create synth with good performance settings
      synthRef.current = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: "sine"
        },
        envelope: {
          attack: 0.05,
          decay: 0.1,
          sustain: 0.3,
          release: 1
        }
      });
      
      // Create filter for tone shaping
      filterRef.current = new Tone.Filter({
        frequency: 1000,
        type: "lowpass",
        rolloff: -12
      });
      
      // Create reverb for spaciousness
      reverbRef.current = new Tone.Reverb({
        decay: 2,
        wet: 0.3
      });
      
      // Create volume control
      volumeRef.current = new Tone.Volume(Tone.gainToDb(options.volume));
      
      // Connect the audio chain
      synthRef.current.connect(filterRef.current);
      filterRef.current.connect(reverbRef.current);
      reverbRef.current.connect(volumeRef.current);
      volumeRef.current.toDestination();
      
      // Set as initialized
      if (isMountedRef.current) {
        setIsInitialized(true);
      }
      
      console.log('Audio system initialized successfully');
    } catch (error) {
      console.error('Failed to initialize audio system:', error);
    }
  }, [isInitialized]);
  
  // Configure audio based on current sentiment
  const configureToneColor = useCallback(() => {
    if (!isInitialized || !isMountedRef.current || !synthRef.current || !filterRef.current || !reverbRef.current) return;
    
    const { sentiment, sentimentScore } = optionsRef.current;
    
    try {
      // Adjust filter based on sentiment
      if (filterRef.current) {
        if (sentiment === 'Positive') {
          // Brighter sound for positive sentiment
          filterRef.current.frequency.value = 4000 + sentimentScore * 2000;
        } else if (sentiment === 'Negative') {
          // Darker sound for negative sentiment
          filterRef.current.frequency.value = 800 - Math.abs(sentimentScore) * 400;
        } else {
          // Neutral sound
          filterRef.current.frequency.value = 2000;
        }
      }
      
      // Adjust reverb based on sentiment
      if (reverbRef.current) {
        if (sentiment === 'Positive') {
          // Less reverb for positive for clarity
          reverbRef.current.wet.value = 0.2;
        } else if (sentiment === 'Negative') {
          // More reverb for negative for moodiness
          reverbRef.current.wet.value = 0.6;
        } else {
          // Medium reverb for neutral
          reverbRef.current.wet.value = 0.3;
        }
      }
    } catch (error) {
      console.error('Error configuring tone color:', error);
    }
  }, [isInitialized]);
  
  // Create musical pattern based on sentiment
  const createTonePattern = useCallback(() => {
    if (!isInitialized || !isMountedRef.current || !synthRef.current || isTransitioningRef.current) return;
    
    isTransitioningRef.current = true;
    
    try {
      // Remove previous loop if exists
      if (loopRef.current) {
        loopRef.current.stop();
        loopRef.current.dispose();
        loopRef.current = null;
      }
      
      const { sentiment, sentimentScore } = optionsRef.current;
      let notes: string[] = [];
      let loopInterval = '4n';
      
      // Choose notes based on sentiment
      if (sentiment === 'Positive') {
        // Major scale (happier)
        notes = ['C4', 'E4', 'G4', 'B4', 'C5', 'D5', 'E5'];
        loopInterval = '4n';
      } else if (sentiment === 'Negative') {
        // Minor scale (sadder)
        notes = ['A3', 'C4', 'E4', 'G4', 'B4', 'D4'];
        loopInterval = '2n';
      } else {
        // Pentatonic scale (neutral)
        notes = ['C4', 'D4', 'F4', 'G4', 'A4', 'C5'];
        loopInterval = '4n';
      }
      
      // Create a new loop with staggered note playback to prevent audio glitches
      loopRef.current = new Tone.Loop((time) => {
        try {
          // Add randomness to create more interesting patterns
          const randomNote = notes[Math.floor(Math.random() * notes.length)];
          const velocityVariation = Math.random() * 0.2 + 0.4; // 0.4 to 0.6 for natural variation
          
          // Use a safer approach to scheduling notes
          synthRef.current?.triggerAttackRelease(
            randomNote, 
            '8n', 
            time, 
            velocityVariation
          );
          
          // Occasionally play a second note for more complex patterns
          if (Math.random() > 0.7) {
            const secondNote = notes[Math.floor(Math.random() * notes.length)];
            const secondTime = time + Tone.Time('16n').toSeconds();
            
            synthRef.current?.triggerAttackRelease(
              secondNote, 
              '16n', 
              secondTime, 
              velocityVariation * 0.8
            );
          }
        } catch (e) {
          console.warn('Error in tone pattern loop:', e);
        }
      }, loopInterval);
      
    } catch (error) {
      console.error('Error creating tone pattern:', error);
    } finally {
      isTransitioningRef.current = false;
    }
  }, [isInitialized]);
  
  // Start playback
  const startPlayback = useCallback(async () => {
    if (!isInitialized || isPlaying || !isMountedRef.current) return;
    
    // Prevent rapid start/stop calls
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = window.setTimeout(async () => {
      try {
        console.log('Starting audio playback...');
        
        // Ensure the audio context is running
        if (Tone.context.state !== 'running') {
          await Tone.context.resume();
        }
        
        // Create the pattern if needed
        if (!loopRef.current) {
          createTonePattern();
        }
        
        // Configure the tone color
        configureToneColor();
        
        // Start the transport and loop with slight offset to prevent glitches
        if (loopRef.current) {
          // Start transport first
          if (Tone.Transport.state !== 'started') {
            Tone.Transport.start('+0.1');
          }
          
          // Then start the loop with a small delay
          loopRef.current.start('+0.2');
        }
        
        // Update state
        if (isMountedRef.current) {
          setIsPlaying(true);
        }
      } catch (error) {
        console.error('Error starting playback:', error);
      }
      
      debounceTimerRef.current = null;
    }, 300);
  }, [isInitialized, isPlaying, createTonePattern, configureToneColor]);
  
  // Stop playback
  const stopPlayback = useCallback(() => {
    if (!isInitialized || !isPlaying || !isMountedRef.current) return;
    
    // Prevent rapid start/stop calls
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = window.setTimeout(() => {
      try {
        console.log('Stopping audio playback...');
        
        // Stop the loop first
        if (loopRef.current) {
          loopRef.current.stop();
        }
        
        // Then stop the transport
        if (Tone.Transport.state === 'started') {
          Tone.Transport.stop();
        }
        
        // Update state
        if (isMountedRef.current) {
          setIsPlaying(false);
        }
      } catch (error) {
        console.error('Error stopping playback:', error);
      }
      
      debounceTimerRef.current = null;
    }, 300);
  }, [isInitialized, isPlaying]);
  
  // Update volume when it changes
  useEffect(() => {
    if (!isInitialized || !volumeRef.current) return;
    
    try {
      volumeRef.current.volume.value = Tone.gainToDb(options.volume);
    } catch (error) {
      console.error('Error updating volume:', error);
    }
  }, [isInitialized, options.volume]);
  
  // Update tone color when sentiment changes
  useEffect(() => {
    if (!isInitialized) return;
    
    configureToneColor();
  }, [isInitialized, configureToneColor, options.sentiment, options.sentimentScore]);
  
  // Update pattern when sentiment changes significantly
  useEffect(() => {
    if (!isInitialized || !isPlaying) return;
    
    // Only recreate pattern if sentiment changes significantly
    const prevSentiment = optionsRef.current.sentiment;
    const prevScore = optionsRef.current.sentimentScore;
    const scoreDiff = Math.abs(prevScore - options.sentimentScore);
    
    if (prevSentiment !== options.sentiment || scoreDiff > 0.3) {
      createTonePattern();
      
      // If already playing, restart the loop
      if (loopRef.current && isPlaying) {
        loopRef.current.stop();
        loopRef.current.start('+0.1');
      }
    }
  }, [isInitialized, isPlaying, createTonePattern, options.sentiment, options.sentimentScore]);
  
  // Start/stop playback based on isActive option
  useEffect(() => {
    if (!isInitialized || !isMountedRef.current) return;
    
    if (options.isActive && !isPlaying) {
      startPlayback();
    } else if (!options.isActive && isPlaying) {
      stopPlayback();
    }
  }, [isInitialized, isPlaying, options.isActive, startPlayback, stopPlayback]);
  
  return {
    isInitialized,
    isPlaying,
    initialize,
    startPlayback,
    stopPlayback
  };
}