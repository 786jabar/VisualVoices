// Types of creative transformations
export type CreativeTransformation = {
  id: string;
  name: string;
  description: string;
  modifySentiment?: (current: number) => number;
  modifyColors?: (colors: {
    primary: string;
    secondary: string;
    accent: string;
  }) => {
    primary: string;
    secondary: string;
    accent: string;
  };
  modifyMotion?: (current: boolean) => boolean;
  modifyIntensity?: (current: boolean) => boolean;
  specialEffect?: string;
  soundEffect?: 'sparkle' | 'whoosh' | 'chime' | 'magical';
};

// Helper to generate random colors with vibrant hues
const generateVibrantColor = (): string => {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 70 + Math.floor(Math.random() * 30); // 70-100%
  const lightness = 45 + Math.floor(Math.random() * 15); // 45-60%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

// Helper to shift existing colors
const shiftColor = (color: string, amount: number = 60): string => {
  // For simplicity, we'll just generate a new color if input is complex (like gradients)
  if (!color.startsWith('#') && !color.startsWith('hsl') && !color.startsWith('rgb')) {
    return generateVibrantColor();
  }
  
  try {
    // Handle HSL colors
    if (color.startsWith('hsl')) {
      const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
      if (match) {
        const h = (parseInt(match[1]) + amount) % 360;
        const s = parseInt(match[2]);
        const l = parseInt(match[3]);
        return `hsl(${h}, ${s}%, ${l}%)`;
      }
    }
    
    // Handle hex colors
    if (color.startsWith('#')) {
      // Convert hex to HSL, shift hue, convert back
      // This is a simplified approach - in a real app you'd implement proper color conversion
      return generateVibrantColor();
    }

    // Fallback
    return generateVibrantColor();
  } catch (e) {
    return generateVibrantColor();
  }
};

// List of creative transformations
export const transformations: CreativeTransformation[] = [
  {
    id: 'dream-amplifier',
    name: 'Dream Amplifier',
    description: 'Intensifies the dreamy qualities of your landscape with ethereal colors',
    modifySentiment: (current) => Math.min(1, current + 0.3),
    modifyColors: (colors) => ({
      primary: shiftColor(colors.primary, 30),
      secondary: shiftColor(colors.secondary, 45),
      accent: shiftColor(colors.accent, 60),
    }),
    modifyIntensity: () => true,
    soundEffect: 'sparkle',
  },
  {
    id: 'cosmic-twist',
    name: 'Cosmic Twist',
    description: 'Shifts your landscape toward cosmic dimensions and interstellar patterns',
    modifySentiment: (current) => current * 0.8 + 0.2,
    modifyColors: (colors) => ({
      primary: shiftColor(colors.primary, 120),
      secondary: shiftColor(colors.secondary, 160),
      accent: shiftColor(colors.accent, 200),
    }),
    modifyMotion: () => true,
    specialEffect: 'cosmic-particles',
    soundEffect: 'whoosh',
  },
  {
    id: 'emotional-reversal',
    name: 'Emotional Reversal',
    description: 'Flips the emotional tone of your landscape to its opposite',
    modifySentiment: (current) => -current,
    modifyColors: (colors) => ({
      primary: shiftColor(colors.primary, 180),
      secondary: shiftColor(colors.secondary, 180),
      accent: shiftColor(colors.accent, 180),
    }),
    soundEffect: 'chime',
  },
  {
    id: 'kaleidoscope-vision',
    name: 'Kaleidoscope Vision',
    description: 'Transforms your landscape into a symmetrical, fractal-like pattern',
    modifyColors: (colors) => ({
      primary: shiftColor(colors.primary, 90),
      secondary: shiftColor(colors.secondary, 90),
      accent: generateVibrantColor(),
    }),
    modifyMotion: () => true,
    modifyIntensity: () => true,
    specialEffect: 'kaleidoscope',
    soundEffect: 'magical',
  },
  {
    id: 'aurora-infusion',
    name: 'Aurora Infusion',
    description: 'Adds shimmering aurora effects across your landscape',
    modifySentiment: (current) => (current + 0.5) / 2,
    modifyColors: (colors) => ({
      primary: shiftColor(colors.primary, 210),
      secondary: shiftColor(colors.secondary, 240),
      accent: shiftColor(colors.accent, 270),
    }),
    modifyMotion: () => true,
    specialEffect: 'aurora',
    soundEffect: 'sparkle',
  },
  {
    id: 'abstract-remix',
    name: 'Abstract Remix',
    description: 'Turns your landscape into a bold, abstract composition',
    modifyColors: () => ({
      primary: generateVibrantColor(),
      secondary: generateVibrantColor(),
      accent: generateVibrantColor(),
    }),
    modifyIntensity: () => true,
    specialEffect: 'geometric',
    soundEffect: 'chime',
  },
  {
    id: 'mystical-fog',
    name: 'Mystical Fog',
    description: 'Adds layers of mystical fog and atmospheric depth',
    modifySentiment: (current) => current * 0.5,
    modifyColors: (colors) => ({
      primary: shiftColor(colors.primary, 30),
      secondary: shiftColor(colors.secondary, -30),
      accent: shiftColor(colors.accent, 15),
    }),
    specialEffect: 'fog',
    soundEffect: 'magical',
  },
  {
    id: 'electric-surge',
    name: 'Electric Surge',
    description: 'Infuses your landscape with electric energy and dynamic movement',
    modifySentiment: (current) => Math.min(1, Math.abs(current) + 0.4),
    modifyColors: (colors) => ({
      primary: shiftColor(colors.primary, 300),
      secondary: shiftColor(colors.secondary, 330),
      accent: '#00FFFF',
    }),
    modifyMotion: () => true,
    modifyIntensity: () => true,
    specialEffect: 'electric',
    soundEffect: 'whoosh',
  }
];

// Function to get a random transformation
export const getRandomTransformation = (): CreativeTransformation => {
  const index = Math.floor(Math.random() * transformations.length);
  return transformations[index];
};

// Function to apply a transformation
export const applyTransformation = (
  transformation: CreativeTransformation,
  currentState: {
    sentiment: number;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    motion: boolean;
    intensity: boolean;
  }
) => {
  const newState = { ...currentState };
  
  // Apply sentiment modification if defined
  if (transformation.modifySentiment) {
    newState.sentiment = transformation.modifySentiment(currentState.sentiment);
  }
  
  // Apply color modifications if defined
  if (transformation.modifyColors) {
    newState.colors = transformation.modifyColors(currentState.colors);
  }
  
  // Apply motion modification if defined
  if (transformation.modifyMotion) {
    newState.motion = transformation.modifyMotion(currentState.motion);
  }
  
  // Apply intensity modification if defined
  if (transformation.modifyIntensity) {
    newState.intensity = transformation.modifyIntensity(currentState.intensity);
  }
  
  return newState;
};