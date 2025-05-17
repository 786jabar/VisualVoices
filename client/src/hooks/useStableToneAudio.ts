import { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';

interface StableToneAudioOptions {
  sentiment: 'Negative' | 'Neutral' | 'Positive';
  sentimentScore: number;
  isActive: boolean;
  volume: number; // 0 to 1
}

/**
 * An improved hook for managing Tone.js audio with better stability and performance
 * Prevents the audio from automatically muting/unmuting
 */
export function useStableToneAudio(options: StableToneAudioOptions) {
  // State for tracking initialization and playback
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Refs for audio components and state tracking
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const mainLoopRef = useRef<Tone.Loop | null>(null);
  const ambienceLoopRef = useRef<Tone.Loop | null>(null);
  const volumeNodeRef = useRef<Tone.Volume | null>(null);
  
  // Tracking refs to prevent race conditions
  const isActiveRef = useRef(options.isActive);
  const autoStartTimerRef = useRef<number | null>(null);
  const volumeValueRef = useRef(options.volume);
  const mountedRef = useRef(true);
  const lastSentimentRef = useRef({
    sentiment: options.sentiment,
    score: options.sentimentScore
  });
  
  // Initialize audio engine and components
  const initialize = async () => {
    if (isInitialized) return true;
    
    try {
      console.log("Initializing audio system...");
      
      // Start audio context (must be triggered by user interaction)
      await Tone.start();
      console.log("Audio context started:", Tone.context.state);
      
      // Create main synth for melodies
      synthRef.current = new Tone.PolySynth(Tone.Synth, {
        volume: -12,
        oscillator: {
          type: "sine"
        },
        envelope: {
          attack: 0.05,
          decay: 0.2,
          sustain: 0.4,
          release: 2
        }
      });
      
      // Create volume control node
      volumeNodeRef.current = new Tone.Volume(-6);
      
      // Connect audio chain
      if (synthRef.current && volumeNodeRef.current) {
        synthRef.current.connect(volumeNodeRef.current);
        volumeNodeRef.current.toDestination();
        
        // Set volume based on options
        volumeNodeRef.current.volume.value = Tone.gainToDb(options.volume);
        volumeValueRef.current = options.volume;
      }
      
      // Create audio loops based on sentiment
      createAudioLoops();
      
      if (mountedRef.current) {
        setIsInitialized(true);
      }
      
      console.log("Audio system initialized successfully");
      return true;
    } catch (error) {
      console.error("Audio initialization error:", error);
      return false;
    }
  };
  
  // Create audio loops based on current sentiment
  const createAudioLoops = () => {
    if (!synthRef.current) return;
    
    // Clean up existing loops first to prevent duplicates
    if (mainLoopRef.current) {
      mainLoopRef.current.dispose();
      mainLoopRef.current = null;
    }
    
    if (ambienceLoopRef.current) {
      ambienceLoopRef.current.dispose();
      ambienceLoopRef.current = null;
    }
    
    const { sentiment, sentimentScore } = options;
    
    // Choose notes and pattern based on sentiment
    let mainNotes: string[] = [];
    let ambientNotes: string[] = [];
    let mainInterval = '4n';
    let ambientInterval = '1n';
    
    if (sentiment === 'Positive') {
      mainNotes = ['D4', 'F#4', 'A4', 'B4', 'E5'];
      ambientNotes = ['D3', 'A3', 'E4'];
      mainInterval = '4n';
      ambientInterval = '2n.';
    } else if (sentiment === 'Negative') {
      mainNotes = ['D3', 'F3', 'G#3', 'B3', 'C4'];
      ambientNotes = ['D2', 'F2', 'G#2'];
      mainInterval = '4n.';
      ambientInterval = '1n';
    } else {
      mainNotes = ['E3', 'A3', 'B3', 'D4', 'E4'];
      ambientNotes = ['E2', 'B2', 'D3'];
      mainInterval = '4n';
      ambientInterval = '2n';
    }
    
    // Create main melodic loop
    mainLoopRef.current = new Tone.Loop((time) => {
      try {
        if (!synthRef.current || !mountedRef.current) return;
        
        // Use stable timing with offset to prevent conflicts
        const noteTime = time + 0.01;
        const noteIndex = Math.floor(Math.random() * mainNotes.length);
        const note = mainNotes[noteIndex];
        
        // Randomize velocity slightly for more natural sound
        const velocity = 0.3 + (Math.random() * 0.2);
        
        // Calculate note duration based on sentiment
        let noteDuration = '8n';
        if (sentiment === 'Negative') {
          noteDuration = '8n.';
        } else if (sentiment === 'Positive') {
          noteDuration = '16n';
        }
        
        // Play the note with precise timing
        synthRef.current.triggerAttackRelease(note, noteDuration, noteTime, velocity);
      } catch (err) {
        console.error("Error in main audio loop:", err);
      }
    }, mainInterval);
    
    // Create ambient background loop
    ambienceLoopRef.current = new Tone.Loop((time) => {
      try {
        if (!synthRef.current || !mountedRef.current) return;
        
        // Use stable timing with larger offset to avoid collision with main loop
        const noteTime = time + 0.05;
        const noteIndex = Math.floor(Math.random() * ambientNotes.length);
        const note = ambientNotes[noteIndex];
        
        // Lower velocity for ambient sounds
        const velocity = 0.1 + (Math.random() * 0.1);
        
        // Play longer notes for ambient sounds
        synthRef.current.triggerAttackRelease(note, '2n', noteTime, velocity);
      } catch (err) {
        console.error(`Error in ${sentiment} ambience loop:`, err);
      }
    }, ambientInterval);
    
    console.log("Loops initialized: main=true, ambience=true");
  };
  
  // Start audio playback
  const startPlayback = () => {
    if (!isInitialized || isPlaying || !mountedRef.current) return;
    
    try {
      console.log("Starting audio playback...");
      
      // Make sure we have loops created
      if (!mainLoopRef.current || !ambienceLoopRef.current) {
        createAudioLoops();
      }
      
      // Start with a slight delay to avoid race conditions
      if (Tone.Transport.state !== 'started') {
        Tone.Transport.start("+0.1");
      }
      
      // Start loops with staggered timing to prevent conflicts
      if (mainLoopRef.current) {
        mainLoopRef.current.start("+0.2");
      }
      
      if (ambienceLoopRef.current) {
        ambienceLoopRef.current.start("+0.5");
      }
      
      if (mountedRef.current) {
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error starting audio playback:", error);
    }
  };
  
  // Stop audio playback
  const stopPlayback = () => {
    if (!isInitialized || !isPlaying || !mountedRef.current) return;
    
    try {
      console.log("Stopping audio playback...");
      
      // Stop all loops
      if (mainLoopRef.current) {
        mainLoopRef.current.stop();
      }
      
      if (ambienceLoopRef.current) {
        ambienceLoopRef.current.stop();
      }
      
      // Only stop transport if all loops are stopped
      Tone.Transport.stop();
      
      if (mountedRef.current) {
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Error stopping audio playback:", error);
    }
  };
  
  // Update audio when sentiment changes
  useEffect(() => {
    if (!isInitialized) return;
    
    const { sentiment, sentimentScore } = options;
    const lastSentiment = lastSentimentRef.current;
    
    // Only update if sentiment or score has changed significantly
    if (sentiment !== lastSentiment.sentiment || 
        Math.abs(sentimentScore - lastSentiment.score) > 0.2) {
      console.log(`Sentiment changed: ${lastSentiment.sentiment} -> ${sentiment}`);
      
      // Update audio loops
      createAudioLoops();
      
      // If already playing, restart loops with new settings
      if (isPlaying) {
        // Stop existing loops
        if (mainLoopRef.current) mainLoopRef.current.stop();
        if (ambienceLoopRef.current) ambienceLoopRef.current.stop();
        
        // Start new loops with slight delay to prevent timing conflicts
        if (mainLoopRef.current) mainLoopRef.current.start("+0.2");
        if (ambienceLoopRef.current) ambienceLoopRef.current.start("+0.5");
      }
      
      // Update last sentiment ref
      lastSentimentRef.current = { sentiment, score: sentimentScore };
    }
  }, [isInitialized, isPlaying, options.sentiment, options.sentimentScore]);
  
  // Update volume when it changes
  useEffect(() => {
    if (!isInitialized || !volumeNodeRef.current) return;
    
    const newVolume = options.volume;
    
    // Only update if volume has changed significantly
    if (Math.abs(newVolume - volumeValueRef.current) > 0.01) {
      volumeNodeRef.current.volume.value = Tone.gainToDb(newVolume);
      volumeValueRef.current = newVolume;
    }
  }, [isInitialized, options.volume]);
  
  // Start/stop playback based on isActive prop
  useEffect(() => {
    if (!isInitialized) return;
    
    // Check if active state actually changed
    if (options.isActive !== isActiveRef.current) {
      console.log(`Audio active state changed: ${isActiveRef.current} -> ${options.isActive}`);
      
      // Clear any pending auto-start timers
      if (autoStartTimerRef.current) {
        window.clearTimeout(autoStartTimerRef.current);
        autoStartTimerRef.current = null;
      }
      
      // Wait a moment before changing state to prevent rapid toggling
      autoStartTimerRef.current = window.setTimeout(() => {
        if (!mountedRef.current) return;
        
        if (options.isActive && !isPlaying) {
          startPlayback();
        } else if (!options.isActive && isPlaying) {
          stopPlayback();
        }
        
        autoStartTimerRef.current = null;
      }, 300);
      
      // Update the ref
      isActiveRef.current = options.isActive;
    }
  }, [isInitialized, isPlaying, options.isActive, startPlayback, stopPlayback]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      console.log("Cleaning up audio system...");
      mountedRef.current = false;
      
      // Clear any pending timers
      if (autoStartTimerRef.current) {
        window.clearTimeout(autoStartTimerRef.current);
        autoStartTimerRef.current = null;
      }
      
      // Stop and dispose audio components
      if (mainLoopRef.current) {
        mainLoopRef.current.stop();
        mainLoopRef.current.dispose();
      }
      
      if (ambienceLoopRef.current) {
        ambienceLoopRef.current.stop();
        ambienceLoopRef.current.dispose();
      }
      
      if (Tone.Transport.state === 'started') {
        Tone.Transport.stop();
      }
      
      if (volumeNodeRef.current) {
        volumeNodeRef.current.dispose();
      }
      
      if (synthRef.current) {
        synthRef.current.dispose();
      }
    };
  }, []);
  
  return {
    isInitialized,
    isPlaying,
    initialize,
    startPlayback,
    stopPlayback
  };
}