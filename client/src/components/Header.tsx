import { FC } from 'react';
import { Settings, HelpCircle, History, Save } from 'lucide-react';

interface HeaderProps {
  onHelpClick: () => void;
  onSettingsClick: () => void;
}

const Header: FC<HeaderProps> = ({ onHelpClick, onSettingsClick }) => {
  return (
    <header className="bg-dark-100 border-b border-dark-200 p-4 flex justify-between items-center z-10">
      <div className="flex items-center space-x-3">
        <div className="relative w-8 h-8 rounded-full bg-primary flex items-center justify-center animate-pulse-slow">
          <i className="ri-sound-module-line text-xl"></i>
        </div>
        <h1 className="text-xl sm:text-2xl font-poppins font-semibold text-white">Vocal<span className="text-primary">Earth</span></h1>
      </div>
      
      {/* Added back useful icons with modern design */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={onSettingsClick}
          className="p-2 text-gray-300 hover:text-white transition-colors"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
        <button 
          onClick={onHelpClick}
          className="p-2 text-gray-300 hover:text-white transition-colors"
          aria-label="Help"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;
