import { useState, useEffect } from 'react';
import { analyzeSentiment, getSentimentLabel } from '@/lib/utils';

interface SentimentAnalysisResult {
  score: number;
  sentiment: 'Negative' | 'Neutral' | 'Positive';
  isAnalyzing: boolean;
  error: string | null;
}

export function useSentimentAnalysis(text: string): SentimentAnalysisResult {
  const [result, setResult] = useState<SentimentAnalysisResult>({
    score: 0,
    sentiment: 'Neutral',
    isAnalyzing: false,
    error: null
  });

  useEffect(() => {
    if (!text.trim()) {
      setResult({
        score: 0,
        sentiment: 'Neutral',
        isAnalyzing: false,
        error: null
      });
      return;
    }

    setResult(prev => ({ ...prev, isAnalyzing: true }));

    try {
      // Delay analysis slightly to avoid too frequent updates
      const timeoutId = setTimeout(() => {
        const score = analyzeSentiment(text);
        const sentiment = getSentimentLabel(score);
        
        setResult({
          score,
          sentiment,
          isAnalyzing: false,
          error: null
        });
      }, 300);

      return () => clearTimeout(timeoutId);
    } catch (error) {
      setResult({
        score: 0,
        sentiment: 'Neutral',
        isAnalyzing: false,
        error: error instanceof Error ? error.message : 'Error analyzing sentiment'
      });
    }
  }, [text]);

  return result;
}
