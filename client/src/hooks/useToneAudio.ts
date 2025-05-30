import { useState, useEffect, useCallback, useRef } from 'react';
import * as Tone from 'tone';

interface ToneAudioOptions {
  sentiment: 'Negative' | 'Neutral' | 'Positive';
  sentimentScore: number;
  isActive: boolean;
  volume: number; // 0 to 1
}

export function useToneAudio(options: ToneAudioOptions) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Use ref for synth to avoid re-creation
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const ambientRef = useRef<Tone.FeedbackDelay | null>(null);
  const notesRef = useRef<string[]>([]);
  const loopRef = useRef<Tone.Loop | null>(null);
  const optionsRef = useRef(options);
  
  // Track if component is mounted
  const isMountedRef = useRef<boolean>(true);

  // Update options ref when props change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);
  
  // Set mounted flag for cleanup
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      
      // Clean up all tone.js resources on unmount
      if (loopRef.current) {
        try {
          loopRef.current.dispose();
          loopRef.current = null;
        } catch (e) {
          console.log('Error disposing loop:', e);
        }
      }
      
      // Dispose Tone.js resources
      if (synthRef.current) {
        try {
          synthRef.current.disconnect();
          synthRef.current.dispose();
          synthRef.current = null;
        } catch (e) {
          console.log('Error disposing synth:', e);
        }
      }
      
      if (ambientRef.current) {
        try {
          ambientRef.current.disconnect();
          ambientRef.current.dispose();
          ambientRef.current = null;
        } catch (e) {
          console.log('Error disposing ambient effect:', e);
        }
      }
      
      // Stop transport
      if (Tone.Transport.state !== 'stopped') {
        Tone.Transport.stop();
      }
    };
  }, []);

  // Update sound parameters based on sentiment
  const updateSoundParameters = useCallback(() => {
    if (!synthRef.current || !ambientRef.current || !isMountedRef.current) return;

    const opts = optionsRef.current;
    
    // Adjust delay parameters based on sentiment
    if (ambientRef.current) {
      if (opts.sentiment === 'Positive') {
        ambientRef.current.delayTime.value = 0.3;
        ambientRef.current.feedback.value = 0.3;
      } else if (opts.sentiment === 'Negative') {
        ambientRef.current.delayTime.value = 0.7;
        ambientRef.current.feedback.value = 0.5;
      } else {
        ambientRef.current.delayTime.value = 0.5;
        ambientRef.current.feedback.value = 0.4;
      }
    }
    
    // Define different note sets based on sentiment
    if (opts.sentiment === 'Positive') {
      // Major scale (happier)
      notesRef.current = [
        'C4', 'D4', 'E4', 'G4', 'A4', 'C5',
        'D5', 'E5', 'G5'
      ];
      Tone.Transport.bpm.value = 80;
    } else if (opts.sentiment === 'Negative') {
      // Minor scale (sadder)
      notesRef.current = [
        'C4', 'D4', 'Eb4', 'G4', 'Ab4', 'C5',
        'D5', 'Eb5', 'G5'
      ];
      Tone.Transport.bpm.value = 60;
    } else {
      // Pentatonic scale (neutral)
      notesRef.current = [
        'C4', 'D4', 'E4', 'G4', 'A4', 'C5',
        'D5', 'E5'
      ];
      Tone.Transport.bpm.value = 70;
    }
  }, []);

  // Helper function to start the transport
  const startTransport = useCallback(() => {
    if (!isMountedRef.current || !synthRef.current) return;
    
    // Start transport with explicit time to avoid "start time must be greater" errors
    try {
      Tone.Transport.start("+0.1");
      
      // Set up repeating pattern with better error handling
      try {
        loopRef.current = new Tone.Loop(time => {
          // Verify we still have access to the synth and it's not disposed
          if (!synthRef.current || !isMountedRef.current || !notesRef.current || notesRef.current.length === 0) return;
          
          try {
            // Play a random note from the current scale
            const note = notesRef.current[Math.floor(Math.random() * notesRef.current.length)];
            const duration = Math.random() > 0.7 ? "8n" : "4n";
            
            // Adjust volume based on sentiment intensity (with limits)
            const sentimentValue = typeof optionsRef.current.sentimentScore === 'number' 
              ? optionsRef.current.sentimentScore 
              : 0;
            const velocity = Math.min(0.7, 0.3 + Math.abs(sentimentValue) * 0.4);
            
            // Check if synth is still available before triggering note
            if (synthRef.current) {
              // Add a tiny offset to avoid timing conflicts
              synthRef.current.triggerAttackRelease(note, duration, time + 0.01, velocity);
            }
          } catch (error) {
            console.log('Error in tone loop callback:', error);
          }
        }, "4n");
        
        // Start with explicit time to avoid "start time must be greater" errors
        loopRef.current.start("+0.1");
      } catch (error) {
        console.error('Failed to create Tone.js loop:', error);
      }
      
      if (isMountedRef.current) {
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Error starting Tone.js transport:', err);
    }
  }, []);

  // Initialize Tone.js
  const initialize = useCallback(async () => {
    if (isInitialized || !isMountedRef.current) return;

    try {
      await Tone.start();
      
      // Only create synth if it doesn't exist and component is still mounted
      if (!synthRef.current && isMountedRef.current) {
        // Create synth
        synthRef.current = new Tone.PolySynth(Tone.Synth).toDestination();
        synthRef.current.volume.value = -15; // Lower initial volume

        // Create ambient effect
        ambientRef.current = new Tone.FeedbackDelay({
          delayTime: 0.5,
          feedback: 0.4,
        }).toDestination();
        
        if (synthRef.current && ambientRef.current) {
          synthRef.current.connect(ambientRef.current);
        }
      }
      
      if (isMountedRef.current) {
        setIsInitialized(true);
      }
    } catch (error) {
      console.error('Failed to initialize Tone.js', error);
    }
  }, [isInitialized]);

  // Start playing ambient music
  const startPlaying = useCallback(() => {
    if (!synthRef.current || !isMountedRef.current) return;
    
    // Prevent retriggering if already playing
    if (isPlaying) return;
    
    // Clean up any existing loop before creating a new one
    if (loopRef.current) {
      try {
        loopRef.current.dispose();
        loopRef.current = null;
      } catch (e) {
        console.log('Error disposing existing loop:', e);
      }
    }
    
    // Make sure Tone is started properly, with user interaction
    Tone.start().then(() => {
      // Safety check - ensure we're still mounted after async operation
      if (!isMountedRef.current || !synthRef.current) return;
      
      // Update soundscape parameters
      updateSoundParameters();
      
      // Start transport with proper timing
      try {
        if (Tone.Transport.state === 'started') {
          Tone.Transport.stop();
          setTimeout(() => {
            if (isMountedRef.current) startTransport();
          }, 100);
        } else {
          startTransport();
        }
      } catch (error) {
        console.error('Error starting audio playback:', error);
      }
    }).catch(err => {
      console.error('Error starting Tone.js:', err);
    });
  }, [isPlaying, updateSoundParameters, startTransport]);

  // Stop playing ambient music
  const stopPlaying = useCallback(() => {
    if (!isMountedRef.current) return;
    
    // Prevent unnecessary stops
    if (!isPlaying) return;
    
    // Clean up audio resources
    try {
      if (loopRef.current) {
        loopRef.current.dispose();
        loopRef.current = null;
      }
      
      if (Tone.Transport && Tone.Transport.state !== 'stopped') {
        Tone.Transport.stop();
        Tone.Transport.cancel();
      }
      
      if (synthRef.current) {
        synthRef.current.releaseAll();
      }
      
      setIsPlaying(false);
    } catch (error) {
      console.error('Error stopping audio playback:', error);
    }
  }, [isPlaying]);

  // Start/stop playing based on options.isActive with debounce
  useEffect(() => {
    if (!isInitialized || !synthRef.current || !isMountedRef.current) return;
    
    // Add debouncing to prevent rapid toggling of audio in galaxy view
    const debounceTimer = setTimeout(() => {
      if (options.isActive && !isPlaying) {
        console.log("Starting audio playback (debounced)");
        startPlaying();
      } else if (!options.isActive && isPlaying) {
        console.log("Stopping audio playback (debounced)");
        stopPlaying();
      }
    }, 300); // 300ms debounce
    
    return () => clearTimeout(debounceTimer);
  }, [options.isActive, isInitialized, isPlaying, startPlaying, stopPlaying]);

  // Update sound parameters when sentiment changes
  useEffect(() => {
    if (!isInitialized || !isPlaying || !synthRef.current || !ambientRef.current || !isMountedRef.current) return;
    
    // Add debounce for parameter updates to prevent audio glitches
    const paramUpdateTimer = setTimeout(() => {
      updateSoundParameters();
    }, 200);
    
    return () => clearTimeout(paramUpdateTimer);
  }, [options.sentiment, options.sentimentScore, isInitialized, isPlaying, updateSoundParameters]);

  // Update volume when changed
  useEffect(() => {
    if (!isInitialized || !synthRef.current || !isMountedRef.current) return;

    // Volume is in decibels in Tone.js (logarithmic)
    // Convert linear 0-1 volume to decibels (roughly -60dB to 0dB)
    synthRef.current.volume.value = Tone.gainToDb(options.volume);
  }, [options.volume, isInitialized]);

  // Toggle playback
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stopPlaying();
    } else {
      startPlaying();
    }
  }, [isPlaying, startPlaying, stopPlaying]);

  return {
    isPlaying,
    isInitialized,
    initialize,
    start: startPlaying,
    stop: stopPlaying,
    toggle: togglePlay,
    updateSoundParameters,
  };
}