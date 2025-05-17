# Vocal Earth - Figma UI/UX Design System

## Design System Overview

### Color Palette
- **Primary Colors:**
  - Deep Blue: #0a1029
  - Royal Blue: #0d47a1
  - Accent Blue: #00b0ff
  
- **Secondary Color Sets:**
  - Aurora Green: #053225, #1b5e20, #4caf50
  - Sunset Orange: #3e2723, #bf360c, #ff9800
  - Galaxy Purple: #1a0033, #4a148c, #e040fb
  - Ocean Depths: #01579b, #006064, #26c6da
  - Solar Storm: #311b92, #bf360c, #fdd835
  
- **UI Colors:**
  - Background: #000000
  - Card Background: rgba(0, 0, 0, 0.5)
  - Border: rgba(255, 255, 255, 0.1)
  - Text: #FFFFFF
  - Secondary Text: rgba(255, 255, 255, 0.7)
  - Disabled: rgba(255, 255, 255, 0.3)

### Typography
- **Headings:**
  - Font: Inter
  - Weights: Bold (700), Semi-Bold (600)
  - Sizes: 
    - H1: 2.5rem/40px (mobile: 1.875rem/30px)
    - H2: 2rem/32px (mobile: 1.5rem/24px)
    - H3: 1.5rem/24px (mobile: 1.25rem/20px)
    
- **Body:**
  - Font: Inter
  - Weights: Regular (400), Medium (500)
  - Sizes:
    - Body Large: 1.125rem/18px (mobile: 1rem/16px)
    - Body: 1rem/16px (mobile: 0.875rem/14px)
    - Body Small: 0.875rem/14px (mobile: 0.75rem/12px)
    
- **Special:**
  - Gradient Text: Linear gradient from primary-light to accent

### Component Styles

#### Buttons
- **Primary Button:**
  - Background: Gradient from primary to accent
  - Text: White
  - Border Radius: 9999px (pill)
  - Padding: 12px 24px (mobile: 8px 16px)
  - Hover: Opacity 90%
  - Active: Scale 95%
  
- **Secondary Button:**
  - Background: rgba(0, 0, 0, 0.4)
  - Border: 1px solid rgba(255, 255, 255, 0.1)
  - Text: White
  - Border Radius: 8px
  - Padding: 8px 16px (mobile: 6px 12px)
  
- **Icon Button:**
  - Size: 40px (mobile: 32px)
  - Background: Transparent
  - Border: 1px solid rgba(255, 255, 255, 0.1)
  - Border Radius: 8px
  - Icon Color: White
  - Hover: Background rgba(255, 255, 255, 0.1)

#### Panels & Cards
- **Main Panel:**
  - Background: rgba(0, 0, 0, 0.5)
  - Backdrop Filter: Blur 8px
  - Border: 1px solid rgba(255, 255, 255, 0.1)
  - Border Radius: 16px
  - Shadow: 0 4px 30px rgba(0, 0, 0, 0.1)
  
- **Card:**
  - Background: rgba(0, 0, 0, 0.4)
  - Border: 1px solid rgba(255, 255, 255, 0.1)
  - Border Radius: 12px
  - Padding: 16px
  
- **Control Panel:**
  - Background: rgba(0, 0, 0, 0.7)
  - Border-Top: 1px solid rgba(255, 255, 255, 0.1)
  - Padding: 16px

#### Forms & Inputs
- **Input Field:**
  - Background: rgba(0, 0, 0, 0.3)
  - Border: 1px solid rgba(255, 255, 255, 0.2)
  - Border Radius: 8px
  - Text Color: White
  - Placeholder Color: rgba(255, 255, 255, 0.5)
  - Focus: Border color accent
  
- **Dropdown:**
  - Same styling as Input Field
  - Dropdown Menu: 
    - Background: rgba(0, 0, 0, 0.8)
    - Border: 1px solid rgba(255, 255, 255, 0.2)
    - Border Radius: 8px
    - Shadow: 0 4px 30px rgba(0, 0, 0, 0.2)

## Screens

### 1. Home Screen / Dashboard
- **Layout:** 
  - Mobile: Vertical stack (60% visualization, 40% controls)
  - Desktop: Horizontal split (75% visualization, 25% controls)
  
- **Components:**
  - Header with logo and settings icons
  - Main visualization canvas
  - Welcome message with start button (when inactive)
  - Control panel with speech controls
  - Theme toggle
  - Emotion tracker
  - Creativity spark button (when active)

### 2. Active Visualization Screen
- **Layout:**
  - Same as Home Screen but with active visualization
  
- **Components:**
  - Dynamic visualization canvas responding to speech
  - Recording status indicator
  - Stop recording button
  - Real-time emotion tracker
  - Theme toggle and creativity buttons
  - Poetic summary area (after recording)

### 3. Gallery Browser
- **Layout:**
  - Grid layout with filtering options at top
  
- **Components:**
  - Gallery header with search and filters
  - Visualization cards (thumbnails)
  - Card actions (view, share, delete)
  - Tabs for "My Gallery" and "Public Gallery"

### 4. Gallery Item View
- **Layout:**
  - Full-width visualization at top
  - Details and controls below
  
- **Components:**
  - Large visualization image
  - Item title and description
  - Audio controls (play ambient, narration)
  - Transcription and poetic summary
  - Share and download buttons

### 5. Settings Panel
- **Layout:**
  - Modal overlay with sections
  
- **Components:**
  - Audio settings (toggle, volume)
  - Visual settings (color intensity, motion)
  - Language selection
  - App information

### 6. Collaboration Modal
- **Layout:**
  - Dialog with options
  
- **Components:**
  - Join room options
  - Create room options
  - Share controls
  - Participant list
  - Chat panel

## Mobile Responsiveness Guidelines

### Breakpoints
- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

### Mobile Adaptations
- Stack layouts vertically
- Reduce button text or show icons only
- Scale down font sizes
- Ensure touch targets are minimum 44x44px
- Use 60vh/40vh split for visualization/controls
- Collapse multi-column grids to fewer columns

### Desktop Enhancements
- Use horizontal layouts for better screen utilization
- Show more detailed controls and information
- Display richer visualizations
- Maintain proper spacing for mouse interactions

## Animation and Transition Guidelines

### Transitions
- Opacity changes: 500ms duration, ease transition
- Scale changes: 300ms duration, ease-out transition
- Color changes: 300ms duration, ease transition

### Animations
- Button hover: Scale to 105%
- Button active: Scale to 95%
- Loading indicators: Subtle pulse or spin
- Visualization transitions: Smooth cross-fades between states

## Implementation Notes

- Use glassmorphism effects for UI elements over visualizations
- Ensure sufficient contrast for text readability
- Provide visual feedback for all interactive elements
- Design with accessibility in mind (color contrast, focus states)
- Ensure touch targets are sized appropriately for mobile