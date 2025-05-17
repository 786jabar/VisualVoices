import React, { useEffect } from 'react';
import { Sparkles, Zap } from 'lucide-react';
import { CreativeTransformation } from '@/lib/creativityTransformations';

interface TransformationToastProps {
  transformation: CreativeTransformation | null;
  isVisible: boolean;
  onClose: () => void;
}

const TransformationToast: React.FC<TransformationToastProps> = ({
  transformation,
  isVisible,
  onClose
}) => {
  // Auto-hide the toast after 4 seconds
  useEffect(() => {
    if (isVisible && transformation) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, transformation]);
  
  if (!isVisible || !transformation) return null;
  
  return (
    <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
      <div className="relative bg-gradient-to-r from-indigo-500/90 via-purple-500/90 to-pink-500/90 rounded-lg shadow-xl p-4 max-w-md">
        {/* Sparkle effects */}
        <div className="absolute -top-2 -left-2 animate-pulse">
          <Sparkles className="h-5 w-5 text-yellow-300" />
        </div>
        <div className="absolute -bottom-2 -right-2 animate-pulse">
          <Sparkles className="h-5 w-5 text-yellow-300" />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full">
            <Zap className="h-6 w-6 text-yellow-300" />
          </div>
          
          <div>
            <h3 className="text-white font-bold text-lg">{transformation.name}</h3>
            <p className="text-white/80 text-sm">{transformation.description}</p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 h-1 w-full bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white/60 rounded-full animate-progress-shrink" style={{ width: '100%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default TransformationToast;