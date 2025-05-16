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

  // Start/stop playing based on options.isActive
  useEffect(() => {
    if (!isInitialized || !synthRef.current || !isMountedRef.current) return;

    if (options.isActive && !isPlaying) {
      startPlaying();
    } else if (!options.isActive && isPlaying) {
      stopPlaying();
    }
  }, [options.isActive, isInitialized, isPlaying]);

  // Update sound parameters when sentiment changes
  useEffect(() => {
    if (!isInitialized || !isPlaying || !synthRef.current || !ambientRef.current || !isMountedRef.current) return;
    
    updateSoundParameters();
  }, [options.sentiment, options.sentimentScore, isInitialized, isPlaying]);

  // Update volume when changed
  useEffect(() => {
    if (!isInitialized || !synthRef.current || !isMountedRef.current) return;

    // Volume is in decibels in Tone.js (logarithmic)
    // Convert linear 0-1 volume to decibels (roughly -60dB to 0dB)
    synthRef.current.volume.value = Tone.gainToDb(options.volume);
  }, [options.volume, isInitialized]);

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

  // Start playing ambient music
  const startPlaying = useCallback(() => {
    if (!synthRef.current || !isMountedRef.current) return;
    
    // Clean up any existing loop before creating a new one
    if (loopRef.current) {
      try {
        loopRef.current.dispose();
        loopRef.current = null;
      } catch (e) {
        console.log('Error disposing existing loop:', e);
      }
    }
    
    // Define notes based on current sentiment
    updateSoundParameters();
    
    // Start transport if not already started
    if (Tone.Transport.state !== 'started') {
      Tone.Transport.start();
    }
    
    // Set up repeating pattern
    try {
      loopRef.current = new Tone.Loop(time => {
        // Verify we still have access to the synth and it's not disposed
        if (!synthRef.current || !isMountedRef.current || notesRef.current.length === 0) return;
        
        try {
          // Play a random note from the current scale
          const note = notesRef.current[Math.floor(Math.random() * notesRef.current.length)];
          const duration = Math.random() > 0.7 ? "8n" : "4n";
          
          // Adjust volume based on sentiment intensity
          const velocity = Math.min(0.7, 0.3 + Math.abs(optionsRef.current.sentimentScore) * 0.4);
          
          // Check if synth is still available before triggering note
          if (synthRef.current) {
            synthRef.current.triggerAttackRelease(note, duration, time, velocity);
          }
        } catch (error) {
          console.log('Error in tone loop callback:', error);
        }
      }, "4n").start(0);
    } catch (error) {
      console.error('Failed to create Tone.js loop:', error);
    }
    
    if (isMountedRef.current) {
      setIsPlaying(true);
    }
  }, [updateSoundParameters]);

  // Stop playing ambient music
  const stopPlaying = useCallback(() => {
    // Clean up loop
    if (loopRef.current) {
      try {
        loopRef.current.dispose();
        loopRef.current = null;
      } catch (e) {
        console.log('Error disposing loop on stop:', e);
      }
    }
    
    // If Transport is running, stop it
    if (Tone.Transport.state !== 'stopped') {
      Tone.Transport.stop();
    }
    
    if (isMountedRef.current) {
      setIsPlaying(false);
    }
  }, []);

  // Toggle playback
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stopPlaying();
    } else {
      startPlaying();
    }
  }, [isPlaying, startPlaying, stopPlaying]);

  return {
    initialize,
    isInitialized,
    isPlaying,
    togglePlay
  };
}