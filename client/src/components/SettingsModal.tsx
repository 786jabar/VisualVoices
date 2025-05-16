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

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    audioEnabled: boolean;
    audioVolume: number;
    colorIntensity: boolean;
    motionEffects: boolean;
    language: string;
  };
  onSettingsChange: (settings: {
    audioEnabled: boolean;
    audioVolume: number;
    colorIntensity: boolean;
    motionEffects: boolean;
    language: string;
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
                  onValueChange={(value) => {
                    setLocalSettings({...localSettings, language: value});
                    // Store language preference in localStorage for speech recognition and synthesis
                    localStorage.setItem('preferredLanguage', value);
                  }}
                >
                  <SelectTrigger className="w-full bg-dark-200 border-dark-300">
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-100 border-dark-300 max-h-[300px]">
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="en-GB">English (UK)</SelectItem>
                    <SelectItem value="en-AU">English (Australia)</SelectItem>
                    <SelectItem value="en-CA">English (Canada)</SelectItem>
                    <SelectItem value="es-ES">Spanish (Spain)</SelectItem>
                    <SelectItem value="es-MX">Spanish (Mexico)</SelectItem>
                    <SelectItem value="fr-FR">French</SelectItem>
                    <SelectItem value="de-DE">German</SelectItem>
                    <SelectItem value="it-IT">Italian</SelectItem>
                    <SelectItem value="pt-BR">Portuguese (Brazil)</SelectItem>
                    <SelectItem value="pt-PT">Portuguese (Portugal)</SelectItem>
                    <SelectItem value="zh-CN">Chinese (Mandarin)</SelectItem>
                    <SelectItem value="ja-JP">Japanese</SelectItem>
                    <SelectItem value="ko-KR">Korean</SelectItem>
                    <SelectItem value="hi-IN">Hindi</SelectItem>
                    <SelectItem value="ar-SA">Arabic</SelectItem>
                    <SelectItem value="ru-RU">Russian</SelectItem>
                    <SelectItem value="nl-NL">Dutch</SelectItem>
                    <SelectItem value="sv-SE">Swedish</SelectItem>
                    <SelectItem value="no-NO">Norwegian</SelectItem>
                    <SelectItem value="da-DK">Danish</SelectItem>
                    <SelectItem value="fi-FI">Finnish</SelectItem>
                    <SelectItem value="pl-PL">Polish</SelectItem>
                    <SelectItem value="tr-TR">Turkish</SelectItem>
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
