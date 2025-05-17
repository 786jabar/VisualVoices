import { FC } from 'react';

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
      
      {/* Removed icons per design update */}
    </header>
  );
};

export default Header;
