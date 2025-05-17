import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Palette, ChevronDown, Check } from 'lucide-react';
import { SoundscapeType } from '@/hooks/stableSoundscapes';

// Predefined visualization themes
export interface VisualizationTheme {
  id: string;
  name: string;
  description: string;
  soundscapeType: SoundscapeType;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

// Available theme presets
const VISUALIZATION_THEMES: VisualizationTheme[] = [
  {
    id: 'cosmic-blue',
    name: 'Cosmic Blue',
    description: 'Deep blues with accents of purple and cyan',
    soundscapeType: 'cosmic',
    colors: {
      primary: '#0a1029',
      secondary: '#0d47a1',
      accent: '#00b0ff'
    }
  },
  {
    id: 'aurora-green',
    name: 'Aurora Green',
    description: 'Mystical greens and teals with northern light effects',
    soundscapeType: 'peaceful',
    colors: {
      primary: '#053225',
      secondary: '#1b5e20',
      accent: '#4caf50'
    }
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    description: 'Warm oranges and reds reminiscent of a desert sunset',
    soundscapeType: 'dramatic',
    colors: {
      primary: '#3e2723',
      secondary: '#bf360c',
      accent: '#ff9800'
    }
  },
  {
    id: 'galaxy-purple',
    name: 'Galaxy Purple',
    description: 'Rich purples and pinks that evoke distant galaxies',
    soundscapeType: 'galactic',
    colors: {
      primary: '#1a0033',
      secondary: '#4a148c',
      accent: '#e040fb'
    }
  },
  {
    id: 'ocean-depths',
    name: 'Ocean Depths',
    description: 'Deep blues and teals inspired by the ocean abyss',
    soundscapeType: 'mysterious',
    colors: {
      primary: '#01579b',
      secondary: '#006064',
      accent: '#26c6da'
    }
  },
  {
    id: 'solar-storm',
    name: 'Solar Storm',
    description: 'Intense yellows and oranges like a solar flare',
    soundscapeType: 'dramatic',
    colors: {
      primary: '#311b92',
      secondary: '#bf360c',
      accent: '#fdd835'
    }
  },
  {
    id: 'twilight-forest',
    name: 'Twilight Forest',
    description: 'Dusky purples and greens of a forest at twilight',
    soundscapeType: 'melancholic',
    colors: {
      primary: '#1b5e20',
      secondary: '#4a148c',
      accent: '#7cb342'
    }
  },
  {
    id: 'neon-city',
    name: 'Neon City',
    description: 'Bright neon colors against a dark cyberpunk backdrop',
    soundscapeType: 'cheerful',
    colors: {
      primary: '#0d1117',
      secondary: '#2c2c54',
      accent: '#fd79a8'
    }
  }
];

interface VisualizationThemeToggleProps {
  onSelectTheme: (theme: VisualizationTheme) => void;
  currentTheme?: string; // Current theme ID
  className?: string;
}

const VisualizationThemeToggle: React.FC<VisualizationThemeToggleProps> = ({
  onSelectTheme,
  currentTheme,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Get current theme name for display
  const getCurrentThemeName = () => {
    const theme = VISUALIZATION_THEMES.find(t => t.id === currentTheme);
    return theme ? theme.name : 'Theme';
  };
  
  // Handle theme selection
  const handleThemeSelect = (theme: VisualizationTheme) => {
    onSelectTheme(theme);
    setIsOpen(false);
  };
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className={`flex items-center gap-2 ${className}`}
                aria-label="Change visualization theme"
              >
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline-block">{getCurrentThemeName()}</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Change visualization theme</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Visualization Themes</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {VISUALIZATION_THEMES.map((theme) => (
          <DropdownMenuItem
            key={theme.id}
            className="flex items-center justify-between cursor-pointer py-2"
            onClick={() => handleThemeSelect(theme)}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-6 h-6 rounded-full flex-shrink-0 border"
                style={{ 
                  backgroundImage: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                  borderColor: theme.colors.accent
                }}
              />
              <div>
                <div className="font-medium">{theme.name}</div>
                <div className="text-xs text-muted-foreground">{theme.soundscapeType}</div>
              </div>
            </div>
            
            {currentTheme === theme.id && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default VisualizationThemeToggle;