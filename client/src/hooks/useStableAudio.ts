import { useState, useEffect, useCallback, useRef } from 'react';
import * as Tone from 'tone';

/**
 * A hook for stable audio playback, addressing common glitching issues
 */
export function useStableAudio() {
  // Track if audio system is ready
  const [isReady, setIsReady] = useState(false);
  
  // Track current play state
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Use refs to track internal state
  const audioContextRef = useRef<AudioContext | null>(null);
  const isMountedRef = useRef(true);
  const debounceTimerRef = useRef<number | null>(null);
  
  // Initialize the audio system
  const initialize = useCallback(async () => {
    try {
      if (isReady) return true;
      
      console.log("Initializing audio system...");
      await Tone.start();
      
      // Keep reference to audio context
      audioContextRef.current = Tone.context.rawContext;
      
      // Ensure context is running
      if (audioContextRef.current.state !== 'running') {
        await audioContextRef.current.resume();
      }
      
      // Set initial volume to prevent loud playback
      Tone.Destination.volume.value = -10;
      
      if (isMountedRef.current) {
        setIsReady(true);
      }
      
      console.log("Audio system initialized successfully");
      return true;
    } catch (error) {
      console.error("Failed to initialize audio:", error);
      return false;
    }
  }, [isReady]);
  
  // Start playing with debounce
  const play = useCallback(async () => {
    if (!isReady || isPlaying) return false;
    
    // Clear any existing timers
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
    }
    
    try {
      // Ensure context is running
      if (audioContextRef.current && audioContextRef.current.state !== 'running') {
        await audioContextRef.current.resume();
      }
      
      // Start Tone.js transport with debounce to prevent glitches
      debounceTimerRef.current = window.setTimeout(() => {
        try {
          if (Tone.Transport.state !== 'started') {
            console.log("Starting Tone.js transport");
            Tone.Transport.start("+0.1");
          }
          
          if (isMountedRef.current) {
            setIsPlaying(true);
          }
        } catch (error) {
          console.error("Error starting audio playback:", error);
        } finally {
          debounceTimerRef.current = null;
        }
      }, 200);
      
      return true;
    } catch (error) {
      console.error("Failed to start audio playback:", error);
      return false;
    }
  }, [isReady, isPlaying]);
  
  // Stop playing with debounce
  const stop = useCallback(async () => {
    if (!isReady || !isPlaying) return false;
    
    // Clear any existing timers
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
    }
    
    try {
      // Stop Tone.js transport with debounce to prevent glitches
      debounceTimerRef.current = window.setTimeout(() => {
        try {
          if (Tone.Transport.state === 'started') {
            console.log("Stopping Tone.js transport");
            Tone.Transport.stop();
          }
          
          if (isMountedRef.current) {
            setIsPlaying(false);
          }
        } catch (error) {
          console.error("Error stopping audio playback:", error);
        } finally {
          debounceTimerRef.current = null;
        }
      }, 200);
      
      return true;
    } catch (error) {
      console.error("Failed to stop audio playback:", error);
      return false;
    }
  }, [isReady, isPlaying]);
  
  // Toggle playback
  const toggle = useCallback(async () => {
    return isPlaying ? await stop() : await play();
  }, [isPlaying, play, stop]);
  
  // Set volume (0-1 range)
  const setVolume = useCallback((volume: number) => {
    try {
      const dbVolume = Tone.gainToDb(Math.max(0, Math.min(1, volume)));
      Tone.Destination.volume.value = dbVolume;
      return true;
    } catch (error) {
      console.error("Failed to set volume:", error);
      return false;
    }
  }, []);
  
  // Clean up on unmount
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      console.log("Cleaning up audio resources");
      isMountedRef.current = false;
      
      // Clear any pending timers
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      
      // Stop transport
      if (Tone.Transport.state === 'started') {
        try {
          Tone.Transport.stop();
        } catch (error) {
          console.error("Error stopping transport during cleanup:", error);
        }
      }
    };
  }, []);
  
  return {
    isReady,
    isPlaying,
    initialize,
    play,
    stop,
    toggle,
    setVolume,
  };
}