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
  const soundsRef = useRef<{
    synth?: Tone.PolySynth;
    ambient?: Tone.FeedbackDelay;
    notes?: string[];
  }>({});
  const optionsRef = useRef(options);

  // Update options ref when props change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Initialize Tone.js
  const initialize = useCallback(async () => {
    if (isInitialized) return;

    try {
      await Tone.start();
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize Tone.js', error);
    }
  }, [isInitialized]);

  // Setup audio elements
  useEffect(() => {
    if (!isInitialized) return;

    // Create synth
    const synth = new Tone.PolySynth(Tone.Synth).toDestination();
    synth.volume.value = -15; // Lower initial volume

    // Create ambient effect
    const ambient = new Tone.FeedbackDelay({
      delayTime: 0.5,
      feedback: 0.4,
    }).toDestination();
    
    synth.connect(ambient);
    
    // Store in ref
    soundsRef.current = {
      synth,
      ambient,
      notes: []
    };

    // Cleanup on unmount
    return () => {
      if (soundsRef.current.synth) {
        soundsRef.current.synth.dispose();
      }
      if (soundsRef.current.ambient) {
        soundsRef.current.ambient.dispose();
      }
    };
  }, [isInitialized]);

  // Start/stop playing based on options.isActive
  useEffect(() => {
    if (!isInitialized || !soundsRef.current.synth) return;

    if (options.isActive && !isPlaying) {
      startPlaying();
    } else if (!options.isActive && isPlaying) {
      stopPlaying();
    }
  }, [options.isActive, isInitialized, isPlaying]);

  // Update sound parameters when sentiment changes
  useEffect(() => {
    if (!isInitialized || !isPlaying || !soundsRef.current.synth || !soundsRef.current.ambient) return;
    
    updateSoundParameters();
  }, [options.sentiment, options.sentimentScore, isInitialized, isPlaying]);

  // Update volume when changed
  useEffect(() => {
    if (!isInitialized || !soundsRef.current.synth) return;

    // Volume is in decibels in Tone.js (logarithmic)
    // Convert linear 0-1 volume to decibels (roughly -60dB to 0dB)
    soundsRef.current.synth.volume.value = Tone.gainToDb(options.volume);
  }, [options.volume, isInitialized]);

  // Start playing ambient music
  const startPlaying = useCallback(() => {
    if (!soundsRef.current.synth) return;
    
    setIsPlaying(true);
    Tone.Transport.bpm.value = 70; // Set BPM
    
    // Define notes based on current sentiment
    updateSoundParameters();
    
    // Start transport
    Tone.Transport.start();
    
    // Set up repeating pattern
    const loop = new Tone.Loop(time => {
      if (!soundsRef.current.synth || !soundsRef.current.notes) return;
      
      // Play a random note from the current scale
      const note = soundsRef.current.notes[Math.floor(Math.random() * soundsRef.current.notes.length)];
      const duration = Math.random() > 0.7 ? "8n" : "4n";
      
      // Adjust volume based on sentiment intensity
      const velocity = Math.min(0.7, 0.3 + Math.abs(optionsRef.current.sentimentScore) * 0.4);
      
      soundsRef.current.synth.triggerAttackRelease(note, duration, time, velocity);
    }, "4n").start(0);
    
    return () => {
      loop.dispose();
    };
  }, []);

  // Stop playing ambient music
  const stopPlaying = useCallback(() => {
    setIsPlaying(false);
    Tone.Transport.stop();
  }, []);

  // Update sound parameters based on sentiment
  const updateSoundParameters = useCallback(() => {
    if (!soundsRef.current.synth || !soundsRef.current.ambient) return;

    const opts = optionsRef.current;
    
    // Adjust delay parameters based on sentiment
    if (soundsRef.current.ambient) {
      if (opts.sentiment === 'Positive') {
        soundsRef.current.ambient.delayTime.value = 0.3;
        soundsRef.current.ambient.feedback.value = 0.3;
      } else if (opts.sentiment === 'Negative') {
        soundsRef.current.ambient.delayTime.value = 0.7;
        soundsRef.current.ambient.feedback.value = 0.5;
      } else {
        soundsRef.current.ambient.delayTime.value = 0.5;
        soundsRef.current.ambient.feedback.value = 0.4;
      }
    }
    
    // Define different note sets based on sentiment
    if (opts.sentiment === 'Positive') {
      // Major scale (happier)
      soundsRef.current.notes = [
        'C4', 'D4', 'E4', 'G4', 'A4', 'C5',
        'D5', 'E5', 'G5'
      ];
      Tone.Transport.bpm.value = 80;
    } else if (opts.sentiment === 'Negative') {
      // Minor scale (sadder)
      soundsRef.current.notes = [
        'C4', 'D4', 'Eb4', 'G4', 'Ab4', 'C5',
        'D5', 'Eb5', 'G5'
      ];
      Tone.Transport.bpm.value = 60;
    } else {
      // Pentatonic scale (neutral)
      soundsRef.current.notes = [
        'C4', 'D4', 'E4', 'G4', 'A4', 'C5',
        'D5', 'E5'
      ];
      Tone.Transport.bpm.value = 70;
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
