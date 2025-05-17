import { useState, useEffect, useCallback, useRef } from 'react';
import * as Tone from 'tone';

interface Audio3DOptions {
  sentiment: 'Negative' | 'Neutral' | 'Positive';
  sentimentScore: number;
  isActive: boolean;
  volume: number; // 0 to 1
}

/**
 * A completely rewritten audio system that resolves glitching issues
 * and ensures stable audio playback that continues during voice recording
 */
export function use3DAudio(options: Audio3DOptions) {
  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Refs for audio components
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const reverbRef = useRef<Tone.Reverb | null>(null);
  const delayRef = useRef<Tone.FeedbackDelay | null>(null);
  const volumeNodeRef = useRef<Tone.Volume | null>(null);
  const mainLoopRef = useRef<Tone.Loop | null>(null);
  const padLoopRef = useRef<Tone.Loop | null>(null);
  
  // Operational state refs
  const isMountedRef = useRef(true);
  const isAudioReadyRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const loopInitializedRef = useRef(false);
  
  // Cache the previous state to detect changes
  const prevStateRef = useRef({
    sentiment: options.sentiment,
    sentimentScore: options.sentimentScore,
    isActive: options.isActive,
    volume: options.volume
  });
  
  // Initialize the audio system
  const initialize = useCallback(async () => {
    if (isInitialized || !isMountedRef.current) return true;
    
    console.log("Initializing 3D audio system...");
    
    try {
      // Start Tone.js context (this must be triggered by a user gesture)
      await Tone.start();
      console.log("Audio context started:", Tone.context.state);
      
      // Create main synth with improved settings for stable performance
      synthRef.current = new Tone.PolySynth(Tone.Synth, {
        volume: -15, // Lower default volume
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
      
      // Create reverb effect for spaciousness
      reverbRef.current = new Tone.Reverb({
        decay: 2,
        wet: 0.3,
        preDelay: 0.01
      });
      
      // Create delay for more interesting texture
      delayRef.current = new Tone.FeedbackDelay({
        delayTime: "8n",
        feedback: 0.2,
        wet: 0.2
      });
      
      // Create volume control
      volumeNodeRef.current = new Tone.Volume(Tone.gainToDb(options.volume));
      
      // Connect everything in the audio chain
      if (synthRef.current && reverbRef.current && delayRef.current && volumeNodeRef.current) {
        synthRef.current.chain(reverbRef.current, delayRef.current, volumeNodeRef.current, Tone.Destination);
      }
      
      // Mark as initialized
      isAudioReadyRef.current = true;
      if (isMountedRef.current) {
        setIsInitialized(true);
      }
      
      console.log("3D audio system initialized successfully");
      return true;
    } catch (error) {
      console.error("Failed to initialize audio system:", error);
      return false;
    }
  }, [isInitialized, options.volume]);
  
  // Create or update the audio loops with a specific pattern based on sentiment
  const createAudioLoops = useCallback(() => {
    if (!isInitialized || !isAudioReadyRef.current || !isMountedRef.current) return;
    
    // Gracefully dispose existing loops first
    if (mainLoopRef.current) {
      mainLoopRef.current.stop();
      mainLoopRef.current.dispose();
      mainLoopRef.current = null;
    }
    
    if (padLoopRef.current) {
      padLoopRef.current.stop();
      padLoopRef.current.dispose();
      padLoopRef.current = null;
    }
    
    // Prevent race conditions with a small delay
    setTimeout(() => {
      if (!synthRef.current || !isMountedRef.current || !isAudioReadyRef.current) return;
      
      const { sentiment, sentimentScore } = options;
      let notes: string[] = [];
      let padNotes: string[] = [];
      let mainInterval = '4n';
      let padInterval = '2n.';
      
      console.log(`Creating audio loops for ${sentiment} (${sentimentScore})`);
      
      // Choose notes based on sentiment
      if (sentiment === 'Positive') {
        // Major/lydian scales for positive emotions
        notes = ['C4', 'E4', 'G4', 'B4', 'D5', 'F#5'];
        padNotes = ['C3', 'G3', 'E3', 'A3', 'D3', 'B3'];
        mainInterval = '4n';
        padInterval = '2n.';
      } else if (sentiment === 'Negative') {
        // Minor/phrygian scales for negative emotions
        notes = ['A3', 'C4', 'E4', 'G4', 'B♭3', 'D4'];
        padNotes = ['A2', 'E3', 'G2', 'C3', 'F3', 'D3'];
        mainInterval = '4n.';
        padInterval = '1n';
      } else {
        // Pentatonic scale for neutral
        notes = ['D4', 'F4', 'G4', 'A4', 'C5', 'D5'];
        padNotes = ['D3', 'A3', 'G3', 'C4', 'E3', 'B♭3'];
        mainInterval = '4n';
        padInterval = '2n';
      }
      
      // Create main melody loop
      mainLoopRef.current = new Tone.Loop((time) => {
        try {
          // Randomly select notes with weighted probability
          const randomNote = notes[Math.floor(Math.random() * notes.length)];
          const velocity = 0.3 + Math.random() * 0.3; // 0.3-0.6 for natural dynamics
          
          // Schedule note with precise timing to prevent glitches
          // The + offset prevents conflicts between loops
          const noteTime = time + 0.01;
          synthRef.current?.triggerAttackRelease(randomNote, '8n', noteTime, velocity);
          
          // Occasionally play a second note for more complex patterns
          if (Math.random() > 0.7) {
            const secondNote = notes[Math.floor(Math.random() * notes.length)];
            const secondTime = noteTime + 0.12; // offset from first note
            synthRef.current?.triggerAttackRelease(secondNote, '16n', secondTime, velocity * 0.7);
          }
        } catch (e) {
          console.warn("Error in main audio loop:", e);
        }
      }, mainInterval);
      
      // Create atmospheric pad loop
      padLoopRef.current = new Tone.Loop((time) => {
        try {
          // Play longer sustained notes for pads
          const padNote = padNotes[Math.floor(Math.random() * padNotes.length)];
          const padTime = time + 0.15; // offset to avoid main loop collision
          
          synthRef.current?.triggerAttackRelease(padNote, '2n', padTime, 0.2);
        } catch (e) {
          console.warn("Error in pad audio loop:", e);
        }
      }, padInterval);
      
      // Flag that we've initialized the loops
      loopInitializedRef.current = true;
      
      // Start loops if we should be playing
      if (isPlaying && isAudioReadyRef.current) {
        const startOffset = "+0.1";
        mainLoopRef.current.start(startOffset);
        padLoopRef.current.start(startOffset);
      }
    }, 100);
  }, [isInitialized, options, isPlaying]);
  
  // Start playback with improved reliability
  const startPlayback = useCallback(async () => {
    if (!isInitialized || isPlaying || !isAudioReadyRef.current || !isMountedRef.current) return;
    
    console.log("Starting audio playback...");
    
    try {
      // Cancel any pending timers
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      
      // Make sure audio context is running
      if (Tone.context.state !== "running") {
        await Tone.context.resume();
        console.log("Audio context resumed:", Tone.context.state);
      }
      
      // Create audio loops if not already created
      if (!loopInitializedRef.current) {
        createAudioLoops();
      }
      
      // Start Transport with a slight delay for stability
      timerRef.current = window.setTimeout(() => {
        if (!isMountedRef.current || !isAudioReadyRef.current) return;
        
        // Start Tone.js Transport if it's not already running
        if (Tone.Transport.state !== "started") {
          Tone.Transport.start("+0.1");
        }
        
        // Start the loops with staggered timing
        if (mainLoopRef.current) {
          mainLoopRef.current.start("+0.1");
        }
        
        if (padLoopRef.current) {
          padLoopRef.current.start("+0.25");
        }
        
        // Update state
        if (isMountedRef.current) {
          setIsPlaying(true);
        }
        
        timerRef.current = null;
        console.log("Audio playback started successfully");
      }, 200);
    } catch (error) {
      console.error("Error starting audio playback:", error);
    }
  }, [isInitialized, isPlaying, createAudioLoops]);
  
  // Stop playback reliably
  const stopPlayback = useCallback(() => {
    if (!isInitialized || !isPlaying || !isAudioReadyRef.current || !isMountedRef.current) return;
    
    console.log("Stopping audio playback...");
    
    try {
      // Cancel any pending timers
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      
      // Use a timer to prevent glitches
      timerRef.current = window.setTimeout(() => {
        if (!isMountedRef.current) return;
        
        // Stop loops first
        if (mainLoopRef.current) {
          mainLoopRef.current.stop();
        }
        
        if (padLoopRef.current) {
          padLoopRef.current.stop();
        }
        
        // Then stop the transport
        if (Tone.Transport.state === "started") {
          Tone.Transport.stop();
        }
        
        // Update state
        if (isMountedRef.current) {
          setIsPlaying(false);
        }
        
        timerRef.current = null;
        console.log("Audio playback stopped successfully");
      }, 100);
    } catch (error) {
      console.error("Error stopping audio playback:", error);
    }
  }, [isInitialized, isPlaying]);
  
  // Update audio parameters when settings change
  useEffect(() => {
    if (!isInitialized || !isAudioReadyRef.current) return;
    
    const { sentiment, sentimentScore, volume } = options;
    const prevState = prevStateRef.current;
    
    // Update volume
    if (volume !== prevState.volume && volumeNodeRef.current) {
      volumeNodeRef.current.volume.value = Tone.gainToDb(volume);
    }
    
    // Update reverb/delay settings based on sentiment
    if (sentiment !== prevState.sentiment || 
        Math.abs(sentimentScore - prevState.sentimentScore) > 0.2) {
      
      // Adjust effects based on sentiment
      if (reverbRef.current && delayRef.current) {
        if (sentiment === 'Positive') {
          // Brighter, cleaner sound for positive
          reverbRef.current.wet.value = 0.3;
          delayRef.current.wet.value = 0.2;
          delayRef.current.feedback.value = 0.2;
        } else if (sentiment === 'Negative') {
          // More reverb and delay for negative, moodier sound
          reverbRef.current.wet.value = 0.5;
          delayRef.current.wet.value = 0.3;
          delayRef.current.feedback.value = 0.3;
        } else {
          // Medium settings for neutral
          reverbRef.current.wet.value = 0.35;
          delayRef.current.wet.value = 0.25;
          delayRef.current.feedback.value = 0.25;
        }
      }
      
      // Recreate the audio loops with new sentiment-based patterns
      createAudioLoops();
    }
    
    // Update previous state reference
    prevStateRef.current = {
      sentiment,
      sentimentScore,
      isActive: options.isActive,
      volume
    };
  }, [
    isInitialized, 
    options.sentiment, 
    options.sentimentScore, 
    options.volume, 
    createAudioLoops
  ]);
  
  // Start/stop playback based on isActive prop
  useEffect(() => {
    if (!isInitialized || !isAudioReadyRef.current) return;
    
    const { isActive } = options;
    const prevIsActive = prevStateRef.current.isActive;
    
    // Only toggle if the state actually changed
    if (isActive !== prevIsActive) {
      console.log(`Audio active state changing: ${prevIsActive} -> ${isActive}`);
      
      if (isActive && !isPlaying) {
        startPlayback();
      } else if (!isActive && isPlaying) {
        stopPlayback();
      }
      
      // Update previous state
      prevStateRef.current.isActive = isActive;
    }
  }, [isInitialized, isPlaying, options.isActive, startPlayback, stopPlayback]);
  
  // Clean up on unmount
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      console.log("Cleaning up 3D audio system...");
      isMountedRef.current = false;
      isAudioReadyRef.current = false;
      
      // Clear any pending timers
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      
      // Stop and clean up loops
      if (mainLoopRef.current) {
        try {
          mainLoopRef.current.stop();
          mainLoopRef.current.dispose();
          mainLoopRef.current = null;
        } catch (e) {
          console.warn("Error disposing main loop:", e);
        }
      }
      
      if (padLoopRef.current) {
        try {
          padLoopRef.current.stop();
          padLoopRef.current.dispose();
          padLoopRef.current = null;
        } catch (e) {
          console.warn("Error disposing pad loop:", e);
        }
      }
      
      // Stop transport
      if (Tone.Transport.state === "started") {
        try {
          Tone.Transport.stop();
        } catch (e) {
          console.warn("Error stopping transport:", e);
        }
      }
      
      // Dispose audio nodes in reverse connection order
      if (volumeNodeRef.current) {
        try {
          volumeNodeRef.current.dispose();
          volumeNodeRef.current = null;
        } catch (e) {
          console.warn("Error disposing volume:", e);
        }
      }
      
      if (delayRef.current) {
        try {
          delayRef.current.dispose();
          delayRef.current = null;
        } catch (e) {
          console.warn("Error disposing delay:", e);
        }
      }
      
      if (reverbRef.current) {
        try {
          reverbRef.current.dispose();
          reverbRef.current = null;
        } catch (e) {
          console.warn("Error disposing reverb:", e);
        }
      }
      
      if (synthRef.current) {
        try {
          synthRef.current.dispose();
          synthRef.current = null;
        } catch (e) {
          console.warn("Error disposing synth:", e);
        }
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