# Vocal Earth - Figma Component Library

## Component Library Overview

This document outlines the specific component styles, states, and variants to be implemented in Figma for the Vocal Earth application.

## Button Components

### Primary Button
- **Base Style:**
  - Height: 48px (desktop), 40px (mobile)
  - Border Radius: 24px (pill shape)
  - Background: Linear gradient (#0d47a1 to #00b0ff)
  - Text: White, 16px, Medium weight
  - Padding: 16px 24px (desktop), 12px 20px (mobile)
  - Shadow: 0px 4px 8px rgba(0, 0, 0, 0.2)

- **States:**
  - Hover: Opacity 90%, Scale 102%
  - Pressed: Scale 98%, Shadow reduced
  - Disabled: Opacity 50%, Grayscale filter

- **Variants:**
  - Default: As described above
  - Large: Height 56px, Text 18px
  - Small: Height 36px, Text 14px, Padding 12px 16px

### Secondary Button
- **Base Style:**
  - Height: 40px (desktop), 36px (mobile)
  - Border Radius: 8px
  - Background: rgba(0, 0, 0, 0.4)
  - Border: 1px solid rgba(255, 255, 255, 0.1)
  - Text: White, 14px, Medium weight
  - Padding: 12px 16px

- **States:**
  - Hover: Background rgba(255, 255, 255, 0.1)
  - Pressed: Background rgba(255, 255, 255, 0.15)
  - Disabled: Opacity 50%

### Icon Button
- **Base Style:**
  - Size: 40px (desktop), 32px (mobile)
  - Border Radius: 8px
  - Background: Transparent
  - Border: 1px solid rgba(255, 255, 255, 0.1)
  - Icon: White, 20px

- **States:**
  - Hover: Background rgba(255, 255, 255, 0.1)
  - Pressed: Background rgba(255, 255, 255, 0.15)
  - Disabled: Opacity 50%

- **Variants:**
  - Circle: Border Radius 50%
  - Filled: Background rgba(0, 0, 0, 0.4)
  - Colored: Background with theme colors

## Input Components

### Text Input
- **Base Style:**
  - Height: 48px (desktop), 40px (mobile)
  - Border Radius: 8px
  - Background: rgba(0, 0, 0, 0.3)
  - Border: 1px solid rgba(255, 255, 255, 0.2)
  - Text: White, 16px
  - Padding: 12px 16px
  - Placeholder: rgba(255, 255, 255, 0.5)

- **States:**
  - Focus: Border 2px solid #00b0ff, Shadow 0 0 0 2px rgba(0, 176, 255, 0.2)
  - Disabled: Opacity 50%
  - Error: Border 2px solid #ff3d71, Error message below

### Dropdown
- **Base Style:**
  - Same as Text Input
  - Dropdown Icon: Arrow, white, 16px
  - Menu Background: rgba(0, 0, 0, 0.8)
  - Menu Border: 1px solid rgba(255, 255, 255, 0.2)
  - Menu Item Height: 40px
  - Menu Item Hover: Background rgba(255, 255, 255, 0.1)
  - Menu Item Selected: Background #00b0ff, Text white

### Slider
- **Base Style:**
  - Track Height: 6px
  - Track Background: rgba(255, 255, 255, 0.2)
  - Track Border Radius: 3px
  - Thumb Size: 20px
  - Thumb Background: White
  - Thumb Border Radius: 50%
  - Thumb Shadow: 0 2px 4px rgba(0, 0, 0, 0.2)
  - Track Filled: Linear gradient matching theme

- **States:**
  - Hover Thumb: Scale 110%
  - Active Thumb: Scale 95%
  - Disabled: Opacity 50%

### Toggle
- **Base Style:**
  - Width: 52px
  - Height: 28px
  - Border Radius: 14px
  - Track Off: rgba(255, 255, 255, 0.2)
  - Track On: Linear gradient matching theme
  - Thumb Size: 24px
  - Thumb Color: White
  - Thumb Position Off: 2px
  - Thumb Position On: 26px

- **States:**
  - Hover: Thumb Scale 105%
  - Disabled: Opacity 50%

## Card Components

### Glass Card
- **Base Style:**
  - Background: rgba(0, 0, 0, 0.5)
  - Backdrop Filter: Blur 8px
  - Border: 1px solid rgba(255, 255, 255, 0.1)
  - Border Radius: 16px
  - Shadow: 0 4px 30px rgba(0, 0, 0, 0.1)
  - Padding: 24px

- **Variants:**
  - Large: Padding 32px, Border Radius 20px
  - Small: Padding 16px, Border Radius 12px
  - Interactive: Hover state with scaling/highlighting

### Gallery Card
- **Base Style:**
  - Width: 100% (responsive grid)
  - Aspect Ratio: 4:3 for image area
  - Background: rgba(0, 0, 0, 0.6)
  - Border: 1px solid rgba(255, 255, 255, 0.1)
  - Border Radius: 12px
  - Image Container: Border Radius 8px 8px 0 0
  - Title: 16px, Bold, White
  - Metadata: 12px, Light, rgba(255, 255, 255, 0.7)
  - Padding: 16px
  - Action Icons: 16px, White, right aligned

- **States:**
  - Hover: Scale 102%, Shadow enhanced
  - Selected: Border 2px solid theme accent color

### Control Panel
- **Base Style:**
  - Background: rgba(0, 0, 0, 0.7)
  - Border-Top: 1px solid rgba(255, 255, 255, 0.1)
  - Padding: 16px
  - Section Title: 14px, Bold, White
  - Section Spacing: 16px vertical

## Header Components

### Main Header
- **Base Style:**
  - Height: 64px (desktop), 56px (mobile)
  - Background: rgba(0, 0, 0, 0.7)
  - Border Bottom: 1px solid rgba(255, 255, 255, 0.1)
  - Logo Size: 32px
  - Title: 18px, Bold, White
  - Action Icons: 24px, White, right aligned
  - Padding: 0 24px (desktop), 0 16px (mobile)

### Section Header
- **Base Style:**
  - Font: 16px, Bold, White
  - Padding Bottom: 8px
  - Border Bottom: 1px solid rgba(255, 255, 255, 0.1)
  - Margin Bottom: 16px

## Modal Components

### Dialog Modal
- **Base Style:**
  - Background: rgba(0, 0, 0, 0.8)
  - Border: 1px solid rgba(255, 255, 255, 0.2)
  - Border Radius: 16px
  - Padding: 24px
  - Title: 20px, Bold, White
  - Description: 14px, Regular, rgba(255, 255, 255, 0.7)
  - Close Button: 24px, White, top-right
  - Max Width: 480px (small), 640px (medium), 960px (large)
  - Shadow: 0 8px 32px rgba(0, 0, 0, 0.5)

### Toast Notification
- **Base Style:**
  - Background: rgba(0, 0, 0, 0.8)
  - Border: 1px solid rgba(255, 255, 255, 0.2)
  - Border Radius: 8px
  - Padding: 12px 16px
  - Title: 16px, Bold, White
  - Description: 14px, Regular, rgba(255, 255, 255, 0.7)
  - Icon: 20px, theme color
  - Duration: 3000ms
  - Animation: Fade and slide up/down

- **Variants:**
  - Success: Border left 4px solid #00E096
  - Error: Border left 4px solid #FF3D71
  - Warning: Border left 4px solid #FFAA00
  - Info: Border left 4px solid #0095FF

## Specialized Components

### Emotion Tracker
- **Base Style:**
  - Background: rgba(0, 0, 0, 0.6)
  - Border: 1px solid rgba(255, 255, 255, 0.1)
  - Border Radius: 12px
  - Padding: 12px
  - Label: 14px, Medium, White
  - Value: 16px, Bold, theme color
  - Graph Height: 24px
  - Graph Colors: Red (negative) to Green (positive)

### Theme Toggle
- **Base Style:**
  - Height: 40px
  - Background: theme color
  - Border: 1px solid theme accent
  - Border Radius: 8px
  - Text: 14px, Medium, White
  - Icon: 16px, White
  - Dropdown Menu Width: 240px
  - Theme Preview Size: 24px circle
  - Theme Name: 14px, Medium, White
  - Theme Description: 12px, Regular, rgba(255, 255, 255, 0.7)

### Visualization Canvas
- **Base Style:**
  - Background: Black
  - Border Radius: 0
  - Aspect Ratio: 16:9 (can be adjusted)
  - Overlay Controls: Semi-transparent
  - Control Position: Top-right and bottom-left

## Layout Guidelines

### Mobile Layout
- Use stacked vertical layout
- 60vh for visualization area
- 40vh for control panel
- Bottom navigation pattern
- Collapsible panels where needed
- Single-column forms
- Grid columns: 2 (small screens), 4 (medium screens)

### Desktop Layout
- Use horizontal split layout
- 3:1 ratio for visualization to control panel
- Sidebar navigation pattern
- Multi-column forms where appropriate
- Grid columns: 3 (minimum), 4-6 (optimal)

## Responsive Breakpoints
- **Mobile S:** 320px
- **Mobile M:** 375px
- **Mobile L:** 425px
- **Tablet:** 768px
- **Laptop:** 1024px
- **Desktop:** 1440px
- **4K:** 2560px

## Icons
All icons should be consistent throughout the application. Use solid icons from a modern icon set like Lucide or Phosphor with the following sizing:
- **Large:** 24px
- **Medium:** 20px
- **Small:** 16px
- **Micro:** 12px

## Spacing System
Use a consistent spacing system throughout the design:
- **4px:** Minimal spacing, used for tight groups
- **8px:** Default spacer, used for related elements
- **16px:** Medium spacer, used between distinct elements
- **24px:** Large spacer, used between sections
- **32px:** Extra large spacer, used for major sections
- **48px:** Huge spacer, used for page-level sections

## Accessibility Considerations
- Ensure color contrast meets WCAG AA standards (4.5:1 for normal text)
- Touch targets should be at least 44px×44px on mobile
- Include focus states for all interactive elements
- Design with keyboard navigation in mind
- Add alt text fields for images in the design system