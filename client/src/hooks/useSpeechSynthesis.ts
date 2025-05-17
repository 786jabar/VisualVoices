import { useState, useEffect, useCallback } from 'react';

// Add supported languages for the app
export type SupportedLanguage = 
  'en-US' | 'en-GB' | 'es-ES' | 'fr-FR' | 'de-DE' | 'it-IT' | 
  'ja-JP' | 'ko-KR' | 'zh-CN' | 'zh-TW' | 'ru-RU' | 'pt-BR' | 
  'ar-SA' | 'hi-IN' | 'nl-NL' | 'pl-PL' | 'sv-SE' | 'tr-TR';

// Language metadata for better display and selection
export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, {name: string, nativeName: string}> = {
  'en-US': { name: 'English (US)', nativeName: 'English (US)' },
  'en-GB': { name: 'English (UK)', nativeName: 'English (UK)' },
  'es-ES': { name: 'Spanish', nativeName: 'Español' },
  'fr-FR': { name: 'French', nativeName: 'Français' },
  'de-DE': { name: 'German', nativeName: 'Deutsch' },
  'it-IT': { name: 'Italian', nativeName: 'Italiano' },
  'ja-JP': { name: 'Japanese', nativeName: '日本語' },
  'ko-KR': { name: 'Korean', nativeName: '한국어' },
  'zh-CN': { name: 'Chinese (Simplified)', nativeName: '中文 (简体)' },
  'zh-TW': { name: 'Chinese (Traditional)', nativeName: '中文 (繁體)' },
  'ru-RU': { name: 'Russian', nativeName: 'Русский' },
  'pt-BR': { name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)' },
  'ar-SA': { name: 'Arabic', nativeName: 'العربية' },
  'hi-IN': { name: 'Hindi', nativeName: 'हिन्दी' },
  'nl-NL': { name: 'Dutch', nativeName: 'Nederlands' },
  'pl-PL': { name: 'Polish', nativeName: 'Polski' },
  'sv-SE': { name: 'Swedish', nativeName: 'Svenska' },
  'tr-TR': { name: 'Turkish', nativeName: 'Türkçe' }
};

interface SpeechSynthesisOptions {
  voice?: SpeechSynthesisVoice | null;
  rate?: number;
  pitch?: number;
  volume?: number;
  language?: SupportedLanguage;
}

interface SpeechSynthesisHook {
  speak: (text: string) => void;
  speakInLanguage: (text: string, language: SupportedLanguage) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  availableLanguages: SupportedLanguage[];
  currentLanguage: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
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
  
  // Get default language from localStorage or use en-US as fallback
  const defaultLanguage = (localStorage.getItem('preferredLanguage') as SupportedLanguage) || 'en-US';
  
  // State for speech properties
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentVoice, setCurrentVoice] = useState<SpeechSynthesisVoice | null>(options.voice || null);
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(options.language || defaultLanguage);
  const [availableLanguages, setAvailableLanguages] = useState<SupportedLanguage[]>([]);
  const [rate, setRate] = useState(options.rate || 1);
  const [pitch, setPitch] = useState(options.pitch || 1);
  const [volume, setVolume] = useState(options.volume || 1);
  
  // State for speech status
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Load available voices when the component mounts
  useEffect(() => {
    if (!isSupported) return;
    
    // Function to get voices and detect available languages
    const getVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        
        // Build list of supported languages that have voices available
        const detectedLanguages = new Set<SupportedLanguage>();
        
        // Map browser voices to our supported languages
        for (const voice of availableVoices) {
          // Extract the base language code (e.g., 'en' from 'en-US')
          const langCode = voice.lang.substring(0, 2).toLowerCase();
          
          // Check against our supported languages
          Object.keys(SUPPORTED_LANGUAGES).forEach(supportedCode => {
            const supportedLang = supportedCode as SupportedLanguage;
            if (supportedCode.toLowerCase().startsWith(langCode)) {
              detectedLanguages.add(supportedLang);
            }
          });
        }
        
        // Always ensure English is available as a fallback
        if (!detectedLanguages.has('en-US')) {
          detectedLanguages.add('en-US');
        }
        
        // Update available languages state
        setAvailableLanguages(Array.from(detectedLanguages));
        console.log("Available languages:", Array.from(detectedLanguages));
        
        // Set a default voice if not already set
        if (!currentVoice) {
          // Extract base language code
          const languageCode = currentLanguage.split('-')[0].toLowerCase();
          
          // Try to find a female voice in the user's preferred language
          // Prioritize female voices for better narration
          const preferredFemaleLangVoice = availableVoices.find(
            voice => voice.lang.toLowerCase().startsWith(languageCode) && 
                    (voice.name.toLowerCase().includes('female') || 
                     voice.name.toLowerCase().includes('woman') ||
                     voice.name.toLowerCase().includes('girl') ||
                     (voice.name.toLowerCase().includes('google') && !voice.name.toLowerCase().includes('male')) ||
                     voice.name.toLowerCase().includes('samantha') ||
                     voice.name.toLowerCase().includes('lisa') ||
                     voice.name.toLowerCase().includes('karen') ||
                     voice.name.toLowerCase().includes('tessa') ||
                     voice.name.toLowerCase().includes('monica') ||
                     voice.name.toLowerCase().includes('f '))
          );
          
          // Try any voice in the preferred language
          const preferredLangVoice = availableVoices.find(
            voice => voice.lang.toLowerCase().startsWith(languageCode)
          );
          
          // Fallbacks: Female English voice, any English voice, then first available voice
          const femaleEnglishVoice = availableVoices.find(
            voice => voice.lang.toLowerCase().startsWith('en') && 
                    (voice.name.toLowerCase().includes('female') || 
                     voice.name.toLowerCase().includes('woman') ||
                     voice.name.toLowerCase().includes('girl') ||
                     (voice.name.toLowerCase().includes('google') && !voice.name.toLowerCase().includes('male')) ||
                     voice.name.toLowerCase().includes('samantha') ||
                     voice.name.toLowerCase().includes('lisa') ||
                     voice.name.toLowerCase().includes('karen') ||
                     voice.name.toLowerCase().includes('tessa') ||
                     voice.name.toLowerCase().includes('monica') ||
                     voice.name.toLowerCase().includes('f '))
          );
          
          const englishVoice = availableVoices.find(
            voice => voice.lang.toLowerCase().startsWith('en')
          );
          
          // Log available voices for debugging
          console.log("Available voices:", availableVoices.map(v => `${v.name} (${v.lang})`));
          
          // Always prioritize female voices for narration
          const selectedVoice = preferredFemaleLangVoice || 
            preferredLangVoice || 
            femaleEnglishVoice || 
            englishVoice || 
            availableVoices[0];
            
          console.log("Selected voice:", selectedVoice ? `${selectedVoice.name} (${selectedVoice.lang})` : "No voice selected");
          setCurrentVoice(selectedVoice);
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
  }, [isSupported, currentVoice, currentLanguage]);
  
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
  
  // Function to find the best voice for a language
  const findBestVoiceForLanguage = useCallback((language: SupportedLanguage): SpeechSynthesisVoice | null => {
    if (!voices.length) return null;
    
    const langCode = language.split('-')[0].toLowerCase();
    
    // Try to find a female voice in the specified language
    const femaleVoice = voices.find(
      voice => voice.lang.toLowerCase().startsWith(langCode) && 
              (voice.name.toLowerCase().includes('female') || 
               voice.name.toLowerCase().includes('woman') ||
               voice.name.toLowerCase().includes('girl') ||
               (voice.name.toLowerCase().includes('google') && !voice.name.toLowerCase().includes('male')) ||
               voice.name.toLowerCase().includes('samantha') ||
               voice.name.toLowerCase().includes('lisa') ||
               voice.name.toLowerCase().includes('karen') ||
               voice.name.toLowerCase().includes('tessa') ||
               voice.name.toLowerCase().includes('monica') ||
               voice.name.toLowerCase().includes('f '))
    );
    
    // Try any voice in the language
    const anyVoice = voices.find(
      voice => voice.lang.toLowerCase().startsWith(langCode)
    );
    
    // Fallback to current voice or English voice if available
    return femaleVoice || anyVoice || currentVoice || 
           voices.find(v => v.lang.toLowerCase().startsWith('en')) || 
           voices[0];
  }, [voices, currentVoice]);

  // Set the language and find an appropriate voice
  const setLanguage = useCallback((language: SupportedLanguage) => {
    setCurrentLanguage(language);
    
    // Store the preference for future sessions
    localStorage.setItem('preferredLanguage', language);
    
    // Find and set the best voice for this language
    const bestVoice = findBestVoiceForLanguage(language);
    if (bestVoice) {
      setCurrentVoice(bestVoice);
    }
  }, [findBestVoiceForLanguage]);
  
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
  
  // Function to speak text in a specific language
  const speakInLanguage = useCallback((text: string, language: SupportedLanguage) => {
    if (!isSupported || !text) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Find the best voice for this language
    const voiceForLanguage = findBestVoiceForLanguage(language);
    
    // Create a new speech utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set speech properties, using language-specific voice if available
    if (voiceForLanguage) utterance.voice = voiceForLanguage;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    
    // Start speaking
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    setIsPaused(false);
  }, [isSupported, rate, pitch, volume, findBestVoiceForLanguage]);
  
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
  
  // Return the hook's API with all required functionality
  return {
    speak,
    speakInLanguage,
    stop,
    pause,
    resume,
    isSpeaking,
    isPaused,
    isSupported,
    voices,
    availableLanguages,
    currentLanguage,
    setLanguage,
    setVoice: setCurrentVoice,
    setRate,
    setPitch,
    setVolume
  };
}