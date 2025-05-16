import { useState, useEffect, useCallback, useRef } from 'react';

interface SpeechRecognitionHook {
  isListening: boolean;
  transcript: string;
  finalTranscript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  browserSupportsSpeechRecognition: boolean;
}

export function useSpeechRecognition(): SpeechRecognitionHook {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [finalTranscript, setFinalTranscript] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [browserSupportsSpeechRecognition, setBrowserSupportsSpeechRecognition] = useState<boolean>(false);

  useEffect(() => {
    // Check if browser supports SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    // Detect browser for better user guidance
    const isFirefox = typeof window !== 'undefined' && 
      navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    const isSafari = typeof window !== 'undefined' && 
      /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    if (!SpeechRecognition) {
      if (isFirefox) {
        setError('Firefox requires enabling speech recognition in about:config. Search for media.webspeech.recognition.enable and set it to true.');
      } else if (isSafari) {
        setError('Safari has limited speech recognition support. For best results, use Chrome or Edge.');
      } else {
        setError('Your browser does not support speech recognition. Please try Chrome, Edge, or Safari.');
      }
    } else {
      setBrowserSupportsSpeechRecognition(true);
    }
  }, []);

  const startListening = useCallback(() => {
    if (!browserSupportsSpeechRecognition) {
      setError('Speech recognition is not supported by your browser.');
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;

      recognition.continuous = true;
      recognition.interimResults = true;
      
      // Get language from localStorage if available, default to English
      const storedLanguage = localStorage.getItem('preferredLanguage') || 'en-US';
      recognition.lang = storedLanguage;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscriptValue = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscriptValue += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscriptValue + interimTranscript);
        if (finalTranscriptValue) {
          setFinalTranscript(finalTranscriptValue);
        }
      };

      recognition.onerror = (event) => {
        setError(`Speech recognition error: ${event.error}`);
        if (event.error === 'not-allowed') {
          setError('Microphone access denied. Please enable microphone permissions.');
        }
      };

      recognition.onend = () => {
        if (isListening) {
          // If still listening, restart recognition (since continuous might still stop sometimes)
          recognition.start();
        }
      };

      recognition.start();
    } catch (error) {
      setError(`Failed to start speech recognition: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsListening(false);
    }
  }, [browserSupportsSpeechRecognition, isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setFinalTranscript('');
  }, []);

  // Clean up recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    finalTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
    browserSupportsSpeechRecognition
  };
}

// Add TypeScript declarations for the Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
