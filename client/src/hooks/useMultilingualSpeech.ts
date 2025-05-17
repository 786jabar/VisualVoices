import { useState, useCallback, useRef, useEffect } from 'react';

interface MultilingualSpeechOptions {
  defaultVoice?: string;
  defaultLanguage?: string;
  defaultRate?: number;
  defaultPitch?: number;
  defaultVolume?: number;
}

interface MultilingualSpeechHook {
  speak: (text: string, language?: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
  availableVoices: SpeechSynthesisVoice[];
  availableLanguages: { code: string; name: string }[];
  currentVoice: SpeechSynthesisVoice | null;
  setVoice: (voice: SpeechSynthesisVoice) => void;
  setRate: (rate: number) => void;
  setPitch: (pitch: number) => void;
  setVolume: (volume: number) => void;
  setLanguage: (languageCode: string) => void;
  speakingProgress: number; // 0-100
}

/**
 * Enhanced hook for multilingual text-to-speech with improved stability
 * Provides a robust way to speak text in different languages with natural voices
 */
export default function useMultilingualSpeech(options: MultilingualSpeechOptions = {}): MultilingualSpeechHook {
  // Check for browser support
  const isSupported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  
  // State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentVoice, setCurrentVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [speakingProgress, setSpeakingProgress] = useState(0);
  
  // Settings
  const [rate, setRate] = useState(options.defaultRate || 1);
  const [pitch, setPitch] = useState(options.defaultPitch || 1);
  const [volume, setVolume] = useState(options.defaultVolume || 1);
  const [language, setLanguage] = useState(options.defaultLanguage || 'en-US');
  
  // Refs to avoid state issues in callbacks
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isSpeakingRef = useRef(false);
  const isPausedRef = useRef(false);
  const progressIntervalRef = useRef<number | null>(null);
  const completeSentenceTimeoutRef = useRef<number | null>(null); // For complete sentence playback
  
  // Load available voices
  useEffect(() => {
    if (!isSupported) return;
    
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      
      // Set default voice based on language preference if provided
      if (voices.length > 0) {
        const preferredLanguage = options.defaultLanguage || language;
        let defaultVoice;
        
        // Try to find a female voice first for the preferred language
        defaultVoice = voices.find(voice => 
          voice.lang.includes(preferredLanguage) && 
          voice.name.toLowerCase().includes('female')
        );
        
        // If no female voice, try any voice for the language
        if (!defaultVoice) {
          defaultVoice = voices.find(voice => voice.lang.includes(preferredLanguage));
        }
        
        // If still no voice, use the first available
        if (!defaultVoice) {
          defaultVoice = voices[0];
        }
        
        setCurrentVoice(defaultVoice);
      }
    };
    
    // Load voices immediately and also set up the event handler
    loadVoices();
    
    // Chrome loads voices asynchronously, so we need an event listener
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [isSupported, language, options.defaultLanguage]);
  
  // Get unique available languages from voices
  const availableLanguages = availableVoices
    .map(voice => {
      const langCode = voice.lang.split('-')[0];
      let languageName;
      try {
        languageName = new Intl.DisplayNames([navigator.language], { type: 'language' })
          .of(langCode);
      } catch (error) {
        languageName = langCode; // Fallback to language code if display name can't be determined
      }
      return { code: langCode, name: languageName || langCode };
    })
    .filter((lang, index, self) => 
      index === self.findIndex(l => l.code === lang.code)
    )
    .sort((a, b) => (a.name && b.name) ? a.name.localeCompare(b.name) : 0);
  
  // Handle language selection
  const changeLanguage = useCallback((languageCode: string) => {
    setLanguage(languageCode);
    
    // Find a suitable voice for this language
    const voicesForLanguage = availableVoices.filter(voice => 
      voice.lang.startsWith(languageCode)
    );
    
    if (voicesForLanguage.length > 0) {
      // Prefer female voices when available
      const femaleVoice = voicesForLanguage.find(voice => 
        voice.name.toLowerCase().includes('female')
      );
      
      setCurrentVoice(femaleVoice || voicesForLanguage[0]);
    }
  }, [availableVoices]);
  
  // Helper to track speaking progress
  const startProgressTracking = useCallback((utterance: SpeechSynthesisUtterance) => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    const startTime = Date.now();
    const estimatedDuration = utterance.text.length * 50; // Rough estimate: 50ms per character
    
    progressIntervalRef.current = window.setInterval(() => {
      if (isSpeakingRef.current && !isPausedRef.current) {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(Math.floor((elapsed / estimatedDuration) * 100), 99);
        setSpeakingProgress(progress);
      }
    }, 100);
  }, []);
  
  // Speak text with specified voice and language
  const speak = useCallback((text: string, specificLanguage?: string) => {
    if (!isSupported || !text.trim()) return;
    
    // Cancel any current speech
    stop();
    
    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;
    
    // Apply settings
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    
    // Set language and voice
    if (specificLanguage) {
      utterance.lang = specificLanguage;
      const voiceForLanguage = availableVoices.find(voice => 
        voice.lang.startsWith(specificLanguage)
      );
      if (voiceForLanguage) {
        utterance.voice = voiceForLanguage;
      }
    } else if (currentVoice) {
      utterance.voice = currentVoice;
      utterance.lang = currentVoice.lang;
    } else {
      utterance.lang = language;
    }
    
    // Event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
      isSpeakingRef.current = true;
      setSpeakingProgress(0);
      startProgressTracking(utterance);
    };
    
    utterance.onpause = () => {
      setIsPaused(true);
      isPausedRef.current = true;
    };
    
    utterance.onresume = () => {
      setIsPaused(false);
      isPausedRef.current = false;
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      setIsPaused(false);
      isPausedRef.current = false;
      setSpeakingProgress(100);
      
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      setIsPaused(false);
      isPausedRef.current = false;
      
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
    
    // Add artificial pause at the end to prevent cutting off speech
    // This ensures the speech ends naturally with proper prosody
    if (completeSentenceTimeoutRef.current) {
      clearTimeout(completeSentenceTimeoutRef.current);
    }
    
    // Add a small, imperceptible pause at the end to ensure complete playback
    const pausedText = text + ', .';
    utterance.text = pausedText;
    
    // Start speaking
    window.speechSynthesis.speak(utterance);
  }, [
    isSupported, rate, pitch, volume, language, 
    currentVoice, availableVoices, startProgressTracking
  ]);
  
  // Pause speaking
  const pause = useCallback(() => {
    if (!isSupported || !isSpeakingRef.current || isPausedRef.current) return;
    
    window.speechSynthesis.pause();
    setIsPaused(true);
    isPausedRef.current = true;
  }, [isSupported]);
  
  // Resume speaking
  const resume = useCallback(() => {
    if (!isSupported || !isSpeakingRef.current || !isPausedRef.current) return;
    
    window.speechSynthesis.resume();
    setIsPaused(false);
    isPausedRef.current = false;
  }, [isSupported]);
  
  // Stop speaking
  const stop = useCallback(() => {
    if (!isSupported) return;
    
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    setIsPaused(false);
    isPausedRef.current = false;
    setSpeakingProgress(0);
    
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    
    if (completeSentenceTimeoutRef.current) {
      clearTimeout(completeSentenceTimeoutRef.current);
      completeSentenceTimeoutRef.current = null;
    }
  }, [isSupported]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);
  
  return {
    speak,
    pause,
    resume,
    stop,
    isSpeaking,
    isPaused,
    isSupported,
    availableVoices,
    availableLanguages,
    currentVoice,
    setVoice: setCurrentVoice,
    setRate,
    setPitch,
    setVolume,
    setLanguage: changeLanguage,
    speakingProgress
  };
}