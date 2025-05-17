# Vocal Earth Mobile UI/UX Design

## Mobile Home Screen

```
┌────────────────────────────┐
│ ┌──────┐        ⚙️  ℹ️      │ ← Header with logo, settings, and info
│ │ Logo │                   │
│ └──────┘                   │
├────────────────────────────┤
│                            │
│                            │
│                            │
│          [3D Cosmic        │
│           Landscape]       │ ← Visualization area (60vh)
│                            │
│                            │
│                            │
│            Vocal Earth     │ ← Central welcome text when inactive
│        Transform your voice│
│        [Start Speaking]    │ ← Primary gradient button
│                            │
│                            │
├────────────────────────────┤
│ Status: Ready to record    │ ← Control panel area (40vh)
│ ┌──────────────────────┐   │
│ │  🎤 Start Speaking   │   │ ← Speech control button
│ └──────────────────────┘   │
│                            │
│ Theme: ┌─────────────┐     │
│        │ Cosmic Blue ▼│    │ ← Theme selector
│        └─────────────┘     │
│                            │
│ ┌──────┐ ┌──────┐ ┌──────┐ │
│ │ Save │ │ 💾  │ │ 📤  │ │ ← Action buttons
│ └──────┘ └──────┘ └──────┘ │
└────────────────────────────┘
```

## Mobile Active Recording Screen

```
┌────────────────────────────┐
│ ┌──────┐        ⚙️  ℹ️      │
│ │ Logo │                   │
│ └──────┘                   │
├────────────────────────────┤
│                            │
│       [Dynamic 3D          │
│        Visualization       │
│        responding to       │ ← Active visualization
│        speech input]       │
│                            │
│                            │
│                            │
│ ✨                         │ ← Creativity spark button
│                            │
│                            │
│                            │
│ 📊 Emotion: Positive (0.7) │ ← Emotion tracker
├────────────────────────────┤
│ ● Recording...             │ ← Status indicator
│ ┌──────────────────────┐   │
│ │  ⏹️ Stop Recording   │   │ ← Stop button
│ └──────────────────────┘   │
│                            │
│ "Your transcribed text     │ ← Live transcription
│  appears here as you       │
│  speak..."                 │
│                            │
│ ┌──────┐ ┌──────┐ ┌──────┐ │
│ │ 🎨  │ │ 🔈  │ │ 📤  │ │ ← Theme, audio, share controls
│ └──────┘ └──────┘ └──────┘ │
└────────────────────────────┘
```

## Mobile Gallery Screen

```
┌────────────────────────────┐
│ ← Gallery     ⚙️  ℹ️        │ ← Header with back button
├────────────────────────────┤
│ ┌──────────┐ ┌──────────┐  │
│ │   🔍    │ │  Filter ▼ │  │ ← Search and filter
│ └──────────┘ └──────────┘  │
│                            │
│ ┌────────┐ ┌────────┐      │
│ │My Gallery│Public Gallery│ │ ← Gallery tabs
│ └────────┘ └────────┘      │
│                            │
│ ┌────────────────────────┐ │
│ │ [Visualization 1]      │ │
│ │ "Desert Sunset"        │ │ ← Gallery item card
│ │ ★ Aug 15, 2023         │ │
│ │                 ⋮      │ │
│ └────────────────────────┘ │
│                            │
│ ┌────────────────────────┐ │
│ │ [Visualization 2]      │ │
│ │ "Ocean Dreams"         │ │ ← Gallery item card
│ │ ★ Aug 10, 2023         │ │
│ │                 ⋮      │ │
│ └────────────────────────┘ │
│                            │
│ ┌────────────────────────┐ │
│ │ [Visualization 3]      │ │
│ │ "Mountain Echo"        │ │ ← Gallery item card
│ │ ★ Aug 5, 2023          │ │
│ │                 ⋮      │ │
│ └────────────────────────┘ │
│                            │
│ ┌────────┐                 │
│ │ Create │                 │ ← Create new button
│ └────────┘                 │
└────────────────────────────┘
```

## Mobile Landscape Detail View

```
┌────────────────────────────┐
│ ← Gallery    💾  📤        │ ← Header with actions
├────────────────────────────┤
│                            │
│                            │
│    [Full Visualization     │
│     Image Display]         │ ← Landscape visualization
│                            │
│                            │
│                            │
├────────────────────────────┤
│ "Desert Sunset"            │ ← Title
│ Created Aug 15, 2023       │ ← Metadata
│                            │
│ ┌──────┐ ┌──────┐ ┌──────┐ │
│ │ 🎵  │ │ 🔊  │ │ ⏯️   │ │ ← Audio controls
│ └──────┘ └──────┘ └──────┘ │
│ ┌──────────────────────────│
│ │  Mood: Positive (0.82)  ││ ← Sentiment display
│ └──────────────────────────│
│                            │
│ Transcription:             │ ← Original speech
│ "The desert sun sets      │
│  slowly over red dunes,    │
│  casting long shadows..."  │
│                            │
│ AI Summary:                │ ← AI-generated summary
│ "A poetic journey through  │
│  crimson sands, where time │
│  stands still and the sky  │
│  embraces the earth..."    │
└────────────────────────────┘
```

## Mobile Settings Panel

```
┌────────────────────────────┐
│ Settings         ✕         │ ← Header with close button
├────────────────────────────┤
│                            │
│ Audio                      │ ← Section header
│ ┌────────────────────────┐ │
│ │ Enable Audio     [✓]   │ │ ← Toggle
│ └────────────────────────┘ │
│ ┌────────────────────────┐ │
│ │ Volume          [━━━●━] │ │ ← Slider
│ └────────────────────────┘ │
│                            │
│ Visuals                    │ ← Section header
│ ┌────────────────────────┐ │
│ │ Color Intensity  [✓]   │ │ ← Toggle
│ └────────────────────────┘ │
│ ┌────────────────────────┐ │
│ │ Motion Effects   [✓]   │ │ ← Toggle
│ └────────────────────────┘ │
│                            │
│ Language                   │ ← Section header
│ ┌────────────────────────┐ │
│ │ English (US)      ▼    │ │ ← Dropdown
│ └────────────────────────┘ │
│                            │
│ About                      │ ← Section header
│ Version 1.2.0              │ ← Version info
│ © 2023 Vocal Earth         │ ← Copyright
│                            │
└────────────────────────────┘
```

## Mobile Collaboration Modal

```
┌────────────────────────────┐
│ Collaborate       ✕        │ ← Header with close button
├────────────────────────────┤
│                            │
│ ┌────────────────────────┐ │
│ │ Create Room           >│ │ ← Option
│ └────────────────────────┘ │
│ ┌────────────────────────┐ │
│ │ Join Room             >│ │ ← Option
│ └────────────────────────┘ │
│                            │
│ Active Room: Galaxy-7842   │ ← Room info
│                            │
│ Participants (3):          │ ← Participants list
│ ● You (Host)               │
│ ● Alex                     │
│ ● Maya                     │
│                            │
│ ┌────────────────────────┐ │
│ │ Share Room Link       >│ │ ← Share button
│ └────────────────────────┘ │
│                            │
│ Chat                       │ ← Chat section
│ ┌────────────────────────┐ │
│ │ Alex: Beautiful colors! │ │
│ │ Maya: Try speaking slower│ │
│ │ You: Thanks for joining │ │
│ └────────────────────────┘ │
│ ┌──────────────────┐ ┌───┐ │
│ │Type a message... │ │Send│ │ ← Chat input
│ └──────────────────┘ └───┘ │
└────────────────────────────┘
```

## Mobile Theme Toggle Component

```
┌───────────────────────────┐
│ Change Theme    ✕         │ ← Header
├───────────────────────────┤
│                           │
│ ┌─────────────────────┐   │
│ │ ● Cosmic Blue      │   │ ← Selected theme
│ └─────────────────────┘   │
│ ┌─────────────────────┐   │
│ │ ○ Aurora Green     │   │ ← Theme option
│ └─────────────────────┘   │
│ ┌─────────────────────┐   │
│ │ ○ Sunset Orange    │   │ ← Theme option
│ └─────────────────────┘   │
│ ┌─────────────────────┐   │
│ │ ○ Galaxy Purple    │   │ ← Theme option
│ └─────────────────────┘   │
│ ┌─────────────────────┐   │
│ │ ○ Ocean Depths     │   │ ← Theme option
│ └─────────────────────┘   │
│ ┌─────────────────────┐   │
│ │ ○ Solar Storm      │   │ ← Theme option
│ └─────────────────────┘   │
│                           │
│ ┌─────────────────────┐   │
│ │       Apply         │   │ ← Apply button
│ └─────────────────────┘   │
└───────────────────────────┘
```