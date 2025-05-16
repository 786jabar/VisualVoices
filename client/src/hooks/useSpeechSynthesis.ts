import { useState, useEffect, useCallback } from 'react';

interface SpeechSynthesisOptions {
  voice?: SpeechSynthesisVoice | null;
  rate?: number;
  pitch?: number;
  volume?: number;
}

interface SpeechSynthesisHook {
  speak: (text: string) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  setVoice: (voice: SpeechSynthesisVoice) => void;
  setRate: (rate: number) => void;
  setPitch: (pitch: number) => void;
  setVolume: (volume: number) => void;
}

/**
 * A hook to utilize the Web Speech API for text-to-speech functionality
 */
export function useSpeechSynthesis(options: SpeechSynthesisOptions = {}): SpeechSynthesisHook {
  // Check if the browser supports speech synthesis
  const isSupported = 'speechSynthesis' in window;
  
  // State for speech properties
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentVoice, setCurrentVoice] = useState<SpeechSynthesisVoice | null>(options.voice || null);
  const [rate, setRate] = useState(options.rate || 1);
  const [pitch, setPitch] = useState(options.pitch || 1);
  const [volume, setVolume] = useState(options.volume || 1);
  
  // State for speech status
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Load available voices when the component mounts
  useEffect(() => {
    if (!isSupported) return;
    
    // Function to get voices
    const getVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        
        // Set a default voice if not already set
        if (!currentVoice) {
          // Get preferred language from localStorage (default to English)
          const preferredLanguage = localStorage.getItem('preferredLanguage') || 'en-US';
          const languageCode = preferredLanguage.split('-')[0]; // Extract base language code
          
          // Try to find a female voice in the user's preferred language
          const preferredFemaleLangVoice = availableVoices.find(
            voice => voice.lang.includes(languageCode) && 
                    (voice.name.toLowerCase().includes('female') || 
                     voice.name.toLowerCase().includes('woman') ||
                     voice.name.includes('f') || 
                     voice.name.includes('F'))
          );
          
          // Try any voice in the preferred language
          const preferredLangVoice = availableVoices.find(
            voice => voice.lang.includes(languageCode)
          );
          
          // Fallbacks: Female English voice, any English voice, then first available voice
          const femaleEnglishVoice = availableVoices.find(
            voice => voice.lang.includes('en') && 
                    (voice.name.toLowerCase().includes('female') || 
                     voice.name.toLowerCase().includes('woman'))
          );
          
          const englishVoice = availableVoices.find(
            voice => voice.lang.includes('en')
          );
          
          // Set voice with appropriate fallbacks
          setCurrentVoice(
            preferredFemaleLangVoice || 
            preferredLangVoice || 
            femaleEnglishVoice || 
            englishVoice || 
            availableVoices[0]
          );
        }
      }
    };
    
    // Get voices on mount
    getVoices();
    
    // Chrome loads voices asynchronously, so we need this event
    window.speechSynthesis.onvoiceschanged = getVoices;
    
    // Cleanup
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [isSupported, currentVoice]);
  
  // Handle speech ending
  useEffect(() => {
    if (!isSupported) return;
    
    const handleSpeechEnd = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    
    // Add event listeners
    window.speechSynthesis.addEventListener('end', handleSpeechEnd);
    
    // Cleanup
    return () => {
      window.speechSynthesis.removeEventListener('end', handleSpeechEnd);
    };
  }, [isSupported]);
  
  // Function to speak text
  const speak = useCallback((text: string) => {
    if (!isSupported || !text) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Create a new speech utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set speech properties
    if (currentVoice) utterance.voice = currentVoice;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    
    // Start speaking
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    setIsPaused(false);
  }, [isSupported, currentVoice, rate, pitch, volume]);
  
  // Function to stop speaking
  const stop = useCallback(() => {
    if (!isSupported) return;
    
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, [isSupported]);
  
  // Function to pause speaking
  const pause = useCallback(() => {
    if (!isSupported || !isSpeaking || isPaused) return;
    
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, [isSupported, isSpeaking, isPaused]);
  
  // Function to resume speaking
  const resume = useCallback(() => {
    if (!isSupported || !isPaused) return;
    
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, [isSupported, isPaused]);
  
  // Return the hook's API
  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isPaused,
    isSupported,
    voices,
    setVoice: setCurrentVoice,
    setRate,
    setPitch,
    setVolume
  };
}