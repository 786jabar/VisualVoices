import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, Wand2 } from 'lucide-react';

interface CreativitySparkButtonProps {
  onSpark: () => void;
  className?: string;
  disabled?: boolean;
}

const CreativitySparkButton: React.FC<CreativitySparkButtonProps> = ({
  onSpark,
  className = '',
  disabled = false
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  
  const handleClick = () => {
    setIsSpinning(true);
    
    // Trigger the spark effect
    onSpark();
    
    // Reset the spinning animation after 1.5 seconds
    setTimeout(() => {
      setIsSpinning(false);
    }, 1500);
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isSpinning}
      className={`relative group overflow-hidden transition-all duration-300 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 text-white font-medium rounded-full px-5 py-2 shadow-lg hover:shadow-xl ${className} ${isSpinning ? 'animate-pulse' : ''}`}
    >
      <span className="relative z-10 flex items-center gap-2">
        {isSpinning ? (
          <Wand2 className="h-5 w-5 animate-spin" />
        ) : (
          <Sparkles className="h-5 w-5 transition-transform group-hover:scale-110" />
        )}
        <span>Creativity Spark</span>
        <Zap className={`h-5 w-5 transition-all duration-300 ${isSpinning ? 'rotate-45 scale-125' : 'group-hover:rotate-12'}`} />
      </span>
      
      {/* Background sparkles */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className={`absolute top-1/4 left-1/4 h-2 w-2 rounded-full bg-white ${isSpinning ? 'animate-ping' : ''}`}></div>
        <div className={`absolute top-1/2 right-1/4 h-2 w-2 rounded-full bg-white ${isSpinning ? 'animate-ping delay-100' : ''}`}></div>
        <div className={`absolute bottom-1/4 left-1/3 h-2 w-2 rounded-full bg-white ${isSpinning ? 'animate-ping delay-200' : ''}`}></div>
      </div>
    </Button>
  );
};

export default CreativitySparkButton;