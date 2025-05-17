import React, { useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { CreativeTransformation } from '@/lib/creativityTransformations';

interface TransformationToastProps {
  transformation: CreativeTransformation | null;
  isVisible: boolean;
  onClose: () => void;
}

/**
 * Toast notification that appears when a creativity transformation is applied
 */
const TransformationToast: React.FC<TransformationToastProps> = ({
  transformation,
  isVisible,
  onClose
}) => {
  // Close toast automatically after 5 seconds
  useEffect(() => {
    if (isVisible && transformation) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, transformation, onClose]);
  
  // If no transformation or not visible, don't render
  if (!isVisible || !transformation) {
    return null;
  }
  
  // Get color based on transformation intensity
  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'subtle': return 'bg-indigo-100 border-indigo-300 text-indigo-800';
      case 'moderate': return 'bg-purple-100 border-purple-300 text-purple-800';
      case 'dramatic': return 'bg-pink-100 border-pink-300 text-pink-800';
      default: return 'bg-blue-100 border-blue-300 text-blue-800';
    }
  };
  
  // Get icon color based on transformation effect
  const getEffectColor = (effect: string) => {
    switch (effect) {
      case 'color': return 'text-rose-500';
      case 'shape': return 'text-violet-500';
      case 'motion': return 'text-blue-500';
      case 'particles': return 'text-amber-500';
      case 'hybrid': return 'text-emerald-500';
      default: return 'text-purple-500';
    }
  };
  
  return (
    <div 
      className={`
        fixed top-6 right-6 z-50 flex max-w-md transform items-center justify-between 
        rounded-lg border px-4 py-3 shadow-lg transition-all duration-500
        ${getIntensityColor(transformation.intensity)}
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
      role="alert"
    >
      <div className="flex items-center">
        <div className="mr-3 flex-shrink-0">
          <Sparkles className={`h-6 w-6 ${getEffectColor(transformation.visualEffect)}`} />
        </div>
        <div>
          <p className="font-bold">{transformation.name}</p>
          <p className="text-sm">{transformation.description}</p>
        </div>
      </div>
      <button 
        type="button"
        onClick={onClose}
        className="ml-4 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-gray-200 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        <span className="sr-only">Close</span>
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

export default TransformationToast;