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
          
          <div>
            <h4 className="font-medium mb-3">Language Settings</h4>
            <div className="space-y-4">
              <div>
                <Label htmlFor="language-select" className="text-sm block mb-1">
                  Voice Recognition & AI Speech Language
                </Label>
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
                  <SelectTrigger className="w-full bg-dark-200 border-dark-300">
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-100 border-dark-300 max-h-[300px]">
                    {Object.entries(SUPPORTED_LANGUAGES).map(([code, { name, nativeName }]) => (
                      <SelectItem key={code} value={code}>
                        {name} {name !== nativeName ? `(${nativeName})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-dark-500 text-xs mt-1.5">
                  This will affect both voice recognition and AI narration language.
                </p>
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
