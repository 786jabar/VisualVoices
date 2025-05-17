import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Globe } from 'lucide-react';

interface AIAssistantProps {
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  transcript?: string;
  aiStatus: 'idle' | 'listening' | 'thinking' | 'speaking';
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
}

export default function AIAssistant({
  isListening,
  onStartListening,
  onStopListening,
  transcript = '',
  aiStatus = 'idle',
  selectedLanguage,
  onLanguageChange
}: AIAssistantProps) {
  const [waveformBars, setWaveformBars] = useState<number[]>([]);
  
  // Generate random waveform values when listening
  useEffect(() => {
    if (isListening) {
      const interval = setInterval(() => {
        const bars = Array.from({ length: 30 }, () => 
          Math.floor(Math.random() * 40) + 5
        );
        setWaveformBars(bars);
      }, 150);
      
      return () => clearInterval(interval);
    } else {
      setWaveformBars(Array(30).fill(5));
    }
  }, [isListening]);

  // Supported languages
  const languages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
    { code: 'ja-JP', name: 'Japanese' },
    { code: 'zh-CN', name: 'Chinese (Simplified)' }
  ];
  
  return (
    <div className="ai-assistant">
      {/* Language selector */}
      <div className="form-group mb-md">
        <label className="form-label">Language</label>
        <div className="flex items-center">
          <Globe className="h-5 w-5 mr-2 text-gray-400" />
          <select 
            className="form-select"
            value={selectedLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Microphone button with pulse effect */}
      <button 
        className="mic-button"
        onClick={isListening ? onStopListening : onStartListening}
        aria-label={isListening ? "Stop listening" : "Start listening"}
      >
        {isListening ? (
          <>
            <MicOff className="mic-button__icon" />
            <div className="mic-button__pulse"></div>
          </>
        ) : (
          <Mic className="mic-button__icon" />
        )}
      </button>
      
      {/* Status indicator */}
      <div className={`ai-status ai-status--${aiStatus} mt-md`}>
        <span className="ai-status__dot"></span>
        <span>
          {aiStatus === 'idle' ? 'Ready' : 
           aiStatus === 'listening' ? 'Listening...' : 
           aiStatus === 'thinking' ? 'Processing...' : 
           'Speaking...'}
        </span>
      </div>
      
      {/* Waveform visualization */}
      {isListening && (
        <div className="waveform">
          {waveformBars.map((height, index) => (
            <div 
              key={index}
              className="waveform__bar"
              style={{ 
                height: `${height}px`, 
                animationDelay: `${index * 0.05}s`
              }}
            ></div>
          ))}
        </div>
      )}
      
      {/* AI output area */}
      {transcript && (
        <div className="ai-output">
          <p>{transcript}</p>
        </div>
      )}
    </div>
  );
}