import { FC, useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';
import { SupportedLanguage, SUPPORTED_LANGUAGES } from '../hooks/useSpeechSynthesis';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    audioEnabled: boolean;
    audioVolume: number;
    colorIntensity: boolean;
    motionEffects: boolean;
    language: SupportedLanguage;
  };
  onSettingsChange: (settings: {
    audioEnabled: boolean;
    audioVolume: number;
    colorIntensity: boolean;
    motionEffects: boolean;
    language: SupportedLanguage;
  }) => void;
}

const SettingsModal: FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  settings,
  onSettingsChange
}) => {
  const [localSettings, setLocalSettings] = useState(settings);
  
  // Update local settings when props change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);
  
  // Handle save settings
  const handleSaveSettings = () => {
    onSettingsChange(localSettings);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-dark-100 text-white border-dark-200 sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-lg font-poppins font-semibold">Settings</DialogTitle>
            <button onClick={onClose} className="text-dark-500 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>
        
        <div className="space-y-5 py-2">
          <div>
            <h4 className="font-medium mb-3">Audio Settings</h4>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="volume-slider" className="text-sm">Ambient Music Volume</Label>
                  <span className="text-xs text-dark-500">{Math.round(localSettings.audioVolume * 100)}%</span>
                </div>
                <Slider
                  id="volume-slider"
                  min={0}
                  max={1}
                  step={0.01}
                  value={[localSettings.audioVolume]}
                  onValueChange={(value) => setLocalSettings({...localSettings, audioVolume: value[0]})}
                  className="w-full"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="toggle-music" className="text-sm cursor-pointer">
                  Enable Ambient Music
                </Label>
                <Switch
                  id="toggle-music"
                  checked={localSettings.audioEnabled}
                  onCheckedChange={(checked) => setLocalSettings({...localSettings, audioEnabled: checked})}
                />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Visual Settings</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="toggle-color-intensity" className="text-sm cursor-pointer">
                  High Color Intensity
                </Label>
                <Switch
                  id="toggle-color-intensity"
                  checked={localSettings.colorIntensity}
                  onCheckedChange={(checked) => setLocalSettings({...localSettings, colorIntensity: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="toggle-motion-effects" className="text-sm cursor-pointer">
                  Motion Effects
                </Label>
                <Switch
                  id="toggle-motion-effects"
                  checked={localSettings.motionEffects}
                  onCheckedChange={(checked) => setLocalSettings({...localSettings, motionEffects: checked})}
                />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-dark-300/50 to-dark-200/30 p-4 rounded-lg border border-dark-300/60">
            <h4 className="font-medium mb-3 text-primary-light flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 8 6 6 6-6"/>
                <path d="M12 2v12"/>
                <path d="M5 14a5 5 0 0 0 7 7 5 5 0 0 0 7-7H5Z"/>
              </svg>
              Language Settings
            </h4>
            <div className="space-y-4">
              <div>
                <Label htmlFor="language-select" className="text-sm block mb-1 font-medium">
                  Voice Recognition & AI Speech Language
                </Label>
                <div className="relative">
                  <Select 
                    value={localSettings.language}
                    onValueChange={(value: string) => {
                      // Validate that the selected language is in our supported list
                      if (Object.keys(SUPPORTED_LANGUAGES).includes(value)) {
                        const supportedLang = value as SupportedLanguage;
                        setLocalSettings({...localSettings, language: supportedLang});
                        // Store language preference in localStorage for speech recognition and synthesis
                        localStorage.setItem('preferredLanguage', supportedLang);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full bg-dark-200 border-dark-300 pr-10">
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-100 border-dark-300 max-h-[300px]">
                      <div className="p-2 bg-primary/10 border-b border-dark-300 mb-1">
                        <p className="text-xs font-medium text-primary-light">18 languages available</p>
                      </div>
                      {Object.entries(SUPPORTED_LANGUAGES).map(([code, { name, nativeName }]) => (
                        <SelectItem key={code} value={code} className="focus:bg-primary/20 focus:text-white">
                          <div className="flex items-center justify-between w-full">
                            <span>{name}</span>
                            {name !== nativeName && (
                              <span className="ml-2 text-dark-500 text-xs">{nativeName}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="bg-dark-300/30 p-2 rounded mt-2 border border-dark-300/50">
                  <p className="text-dark-400 text-xs">
                    Vocal Earth supports 18 languages for both voice recognition and AI narration. 
                    The AI will speak using a natural female voice in your selected language.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="border-t border-dark-200 pt-4">
          <Button
            onClick={handleSaveSettings}
            className="bg-primary hover:bg-primary-light text-white"
          >
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
