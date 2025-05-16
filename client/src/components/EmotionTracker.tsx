import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { getSentimentLabel } from '@/lib/utils';

interface EmotionDataPoint {
  timestamp: number;
  score: number;
  sentiment: 'Negative' | 'Neutral' | 'Positive';
  text: string;
}

interface EmotionTrackerProps {
  sentimentScore: number;
  transcript: string;
  isListening: boolean;
  className?: string;
}

const EmotionTracker: React.FC<EmotionTrackerProps> = ({
  sentimentScore,
  transcript,
  isListening,
  className = ''
}) => {
  const [emotionHistory, setEmotionHistory] = useState<EmotionDataPoint[]>([]);
  const [showTooltip, setShowTooltip] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastUpdateRef = useRef<number>(0);
  const updateIntervalMs = 2000; // Minimum time between updates in milliseconds
  
  // Update emotion history with new data points as sentiment changes
  useEffect(() => {
    if (!isListening) return;
    
    const now = Date.now();
    
    // Only add new data points if:
    // 1. There's a significant time passed since last update
    // 2. There's transcript text
    // 3. We have a valid sentiment score
    if (
      now - lastUpdateRef.current > updateIntervalMs && 
      transcript.trim() && 
      !isNaN(sentimentScore) && 
      isFinite(sentimentScore)
    ) {
      const sentiment = getSentimentLabel(sentimentScore);
      
      // Create a new data point
      const newDataPoint: EmotionDataPoint = {
        timestamp: now,
        score: sentimentScore,
        sentiment,
        text: transcript.trim().split(' ').slice(-10).join(' ') // Last 10 words
      };
      
      // Add to history (keeping most recent 20 points)
      setEmotionHistory(prevHistory => {
        const combinedHistory = [...prevHistory, newDataPoint];
        // Keep only the last 20 items to avoid excessive history
        return combinedHistory.slice(-20);
      });
      
      lastUpdateRef.current = now;
    }
  }, [sentimentScore, transcript, isListening]);
  
  // Get color for sentiment value
  const getSentimentColor = (sentiment: 'Negative' | 'Neutral' | 'Positive'): string => {
    switch(sentiment) {
      case 'Positive': return 'rgb(52, 211, 153)'; // Green
      case 'Negative': return 'rgb(248, 113, 113)'; // Red
      case 'Neutral': return 'rgb(148, 163, 184)'; // Gray
      default: return 'rgb(148, 163, 184)';
    }
  };
  
  // Get y-position based on sentiment score (-1 to 1 mapped to the container height)
  const getYPosition = (score: number): number => {
    // Map score from -1...1 to 100%...0% (inverted for y-axis)
    return 50 - (score * 50);
  };
  
  // No data yet
  if (emotionHistory.length === 0) {
    return (
      <div className={`bg-gray-800/50 border border-gray-700 rounded-lg flex flex-col items-center justify-center p-4 h-40 ${className}`}>
        <p className="text-gray-400 text-sm">
          {isListening ? 'Start speaking to track emotional journey...' : 'Press record to begin tracking emotions'}
        </p>
      </div>
    );
  }
  
  return (
    <div 
      ref={containerRef}
      className={`relative bg-gray-800/50 border border-gray-700 rounded-lg p-3 ${className}`}
      style={{ height: '200px' }}
    >
      <div className="absolute inset-0 p-3">
        {/* Background grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          <div className="border-b border-gray-700/50 h-1/3 text-xs text-gray-500 flex items-end pb-1">
            <span>Positive</span>
          </div>
          <div className="border-b border-gray-700/50 h-1/3 text-xs text-gray-500 flex items-end pb-1">
            <span>Neutral</span>
          </div>
          <div className="h-1/3 text-xs text-gray-500 flex items-end">
            <span>Negative</span>
          </div>
        </div>
        
        {/* Current Sentiment Indicator */}
        <div 
          className="absolute right-3 h-full w-px bg-indigo-600/30"
          style={{ top: 0 }}
        >
          <motion.div 
            className="w-3 h-3 bg-indigo-500 rounded-full -ml-1.5"
            animate={{ 
              y: `${getYPosition(sentimentScore)}%`,
              backgroundColor: getSentimentColor(getSentimentLabel(sentimentScore)) 
            }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          />
        </div>
        
        {/* Emotion path/line */}
        <svg className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineGradient" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100%" y2="0">
              {emotionHistory.map((point, i) => (
                <stop 
                  key={`stop-${i}`}
                  offset={`${(i / (emotionHistory.length - 1)) * 100}%`} 
                  stopColor={getSentimentColor(point.sentiment)}
                />
              ))}
            </linearGradient>
          </defs>
          
          {/* Line connecting points */}
          {emotionHistory.length > 1 && (
            <path
              d={`M ${emotionHistory.map((point, i) => {
                const x = (i / (emotionHistory.length - 1)) * 100;
                const y = getYPosition(point.score);
                return `${x}% ${y}%`;
              }).join(' L ')}`}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          
          {/* Data points */}
          {emotionHistory.map((point, i) => {
            const x = (i / (emotionHistory.length - 1)) * 100;
            const y = getYPosition(point.score);
            
            return (
              <g key={`point-${i}`}>
                <circle 
                  cx={`${x}%`} 
                  cy={`${y}%`} 
                  r="4"
                  fill={getSentimentColor(point.sentiment)}
                  className="cursor-pointer hover:stroke-white hover:stroke-2"
                  onMouseEnter={() => setShowTooltip(i)}
                  onMouseLeave={() => setShowTooltip(null)}
                />
              </g>
            );
          })}
        </svg>
        
        {/* Tooltips */}
        {showTooltip !== null && (
          <div 
            className="absolute bg-gray-900 p-2 rounded-md text-xs border border-gray-700 z-10 shadow-lg max-w-[180px]"
            style={{
              left: `${(showTooltip / (emotionHistory.length - 1)) * 100}%`,
              top: `${getYPosition(emotionHistory[showTooltip].score)}%`,
              transform: 'translate(-50%, -130%)'
            }}
          >
            <div className="font-semibold mb-1 flex items-center gap-1">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: getSentimentColor(emotionHistory[showTooltip].sentiment) }}
              />
              {emotionHistory[showTooltip].sentiment}
              <span className="font-normal text-gray-400">
                ({emotionHistory[showTooltip].score.toFixed(2)})
              </span>
            </div>
            <p className="text-gray-300 line-clamp-2">"{emotionHistory[showTooltip].text}"</p>
          </div>
        )}
      </div>
      
      {/* Labels */}
      <div className="absolute bottom-0 left-0 w-full text-center text-xs text-gray-500 pt-1">
        <span>Emotion Tracker - Time</span>
      </div>
    </div>
  );
};

export default EmotionTracker;