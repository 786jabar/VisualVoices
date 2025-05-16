import { useState, useEffect, useCallback } from 'react';

/**
 * A singleton coordinator for global audio state management
 * This prevents conflicts between different parts of the app playing audio simultaneously
 */
class AudioCoordinator {
  private static instance: AudioCoordinator;
  private activeAudioSources: Map<string, boolean> = new Map();
  private listeners: Map<string, Set<() => void>> = new Map();

  private constructor() {
    // Initialize with all audio sources as inactive
    this.activeAudioSources = new Map();
    this.listeners = new Map();
  }

  public static getInstance(): AudioCoordinator {
    if (!AudioCoordinator.instance) {
      AudioCoordinator.instance = new AudioCoordinator();
    }
    return AudioCoordinator.instance;
  }

  /**
   * Register a new audio source
   * @param sourceId Unique identifier for the audio source
   */
  public registerSource(sourceId: string): void {
    if (!this.activeAudioSources.has(sourceId)) {
      this.activeAudioSources.set(sourceId, false);
      this.listeners.set(sourceId, new Set());
    }
  }

  /**
   * Unregister an audio source when it's no longer needed
   * @param sourceId Unique identifier for the audio source
   */
  public unregisterSource(sourceId: string): void {
    this.activeAudioSources.delete(sourceId);
    this.listeners.delete(sourceId);
  }

  /**
   * Request to start playing audio from a specific source
   * This will stop all other active sources first
   * @param sourceId Unique identifier for the audio source
   * @returns Whether the request was granted
   */
  public requestPlayback(sourceId: string): boolean {
    // Stop all other active sources
    // Convert Map to array to avoid iterator issues
    const entries = Array.from(this.activeAudioSources.entries());
    for (const [id, isActive] of entries) {
      if (id !== sourceId && isActive) {
        this.activeAudioSources.set(id, false);
        this.notifyListeners(id);
      }
    }

    // Set this source as active
    this.activeAudioSources.set(sourceId, true);
    this.notifyListeners(sourceId);
    return true;
  }

  /**
   * Stop playback from a specific source
   * @param sourceId Unique identifier for the audio source
   */
  public stopPlayback(sourceId: string): void {
    if (this.activeAudioSources.has(sourceId)) {
      this.activeAudioSources.set(sourceId, false);
      this.notifyListeners(sourceId);
    }
  }

  /**
   * Check if a specific source is currently active
   * @param sourceId Unique identifier for the audio source
   * @returns Whether the source is active
   */
  public isSourceActive(sourceId: string): boolean {
    return this.activeAudioSources.get(sourceId) || false;
  }

  /**
   * Add a listener for a specific source's state changes
   * @param sourceId Unique identifier for the audio source
   * @param listener Callback function to call when the source's state changes
   */
  public addListener(sourceId: string, listener: () => void): void {
    if (!this.listeners.has(sourceId)) {
      this.listeners.set(sourceId, new Set());
    }
    this.listeners.get(sourceId)?.add(listener);
  }

  /**
   * Remove a listener for a specific source's state changes
   * @param sourceId Unique identifier for the audio source
   * @param listener Callback function to remove
   */
  public removeListener(sourceId: string, listener: () => void): void {
    this.listeners.get(sourceId)?.delete(listener);
  }

  /**
   * Notify all listeners for a specific source
   * @param sourceId Unique identifier for the audio source
   */
  private notifyListeners(sourceId: string): void {
    this.listeners.get(sourceId)?.forEach(listener => listener());
  }
}

/**
 * Hook for using the global audio coordinator
 * @param sourceId Unique identifier for this audio source
 * @returns Object with functions to control audio playback
 */
export function useAudioCoordinator(sourceId: string) {
  const [isActive, setIsActive] = useState(false);
  const coordinator = AudioCoordinator.getInstance();

  // Register this source when the component mounts
  useEffect(() => {
    coordinator.registerSource(sourceId);
    
    // Update state if our active status changes from elsewhere
    const updateActiveStatus = () => {
      setIsActive(coordinator.isSourceActive(sourceId));
    };
    
    coordinator.addListener(sourceId, updateActiveStatus);
    
    // Cleanup when unmounting
    return () => {
      coordinator.removeListener(sourceId, updateActiveStatus);
      coordinator.unregisterSource(sourceId);
    };
  }, [sourceId]);

  // Request to start playback
  const requestPlayback = useCallback(() => {
    const granted = coordinator.requestPlayback(sourceId);
    if (granted) {
      setIsActive(true);
    }
    return granted;
  }, [sourceId]);

  // Stop playback
  const stopPlayback = useCallback(() => {
    coordinator.stopPlayback(sourceId);
    setIsActive(false);
  }, [sourceId]);

  return {
    isActive,
    requestPlayback,
    stopPlayback
  };
}