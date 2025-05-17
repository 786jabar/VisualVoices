# Vocal Earth Desktop UI/UX Design

## Desktop Home Screen

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ┌──────┐                                                    ⚙️  ℹ️             │ ← Header with logo and actions
│ │ Logo │                                                                     │
│ └──────┘                                                                     │
├─────────────────────────────────────────────────┬────────────────────────────┤
│                                                 │                            │
│                                                 │  Speech Controls           │ ← Control panel header
│                                                 │  ┌──────────────────────┐  │
│                                                 │  │  🎤 Start Speaking   │  │ ← Primary action button
│                                                 │  └──────────────────────┘  │
│         [Immersive 3D Cosmic Landscape]         │                            │
│                                                 │  Status: Ready to record   │ ← Status indicator
│                                                 │                            │
│                                                 │  Instructions:             │ ← Help text
│                                                 │  Speak to create a         │
│                                                 │  visualization that        │
│               Vocal Earth                       │  responds to your voice    │
│       Transform your voice into                 │  and emotions.             │
│       stunning visual landscapes                │                            │
│                                                 │  Settings                  │ ← Settings section
│            [Start Speaking]                     │  ┌──────────────────────┐  │
│                                                 │  │ Theme: Cosmic Blue ▼ │  │ ← Theme dropdown
│                                                 │  └──────────────────────┘  │
│                                                 │  ┌──────────────────────┐  │
│                                                 │  │ 🔊 Audio: On         │  │ ← Audio toggle
│                                                 │  └──────────────────────┘  │
│                                                 │                            │
│                                                 │  Actions                   │ ← Actions section
│                                                 │  ┌──────┐ ┌──────┐ ┌──────┐│
│                                                 │  │ Save │ │ 💾  │ │ 📤  ││ ← Action buttons
│                                                 │  └──────┘ └──────┘ └──────┘│
│                                                 │                            │
└─────────────────────────────────────────────────┴────────────────────────────┘
```

## Desktop Active Recording Screen

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ┌──────┐                                                    ⚙️  ℹ️             │
│ │ Logo │                                                                     │
│ └──────┘                                                                     │
├─────────────────────────────────────────────────┬────────────────────────────┤
│                                                 │                            │
│                                                 │  ● Recording...            │ ← Recording status
│                                                 │  ┌──────────────────────┐  │
│                                                 │  │  ⏹️ Stop Recording   │  │ ← Stop button
│                                                 │  └──────────────────────┘  │
│                                                 │                            │
│                                                 │  Transcription:            │ ← Live transcription
│       [Dynamic 3D Visualization                 │  "The mountains rise       │
│        responding to speech input]              │   majestically against     │
│                                                 │   the twilight sky,        │
│                                                 │   their peaks catching     │
│                                                 │   the last rays of         │
│  ✨                                            │   golden sunlight..."      │
│                                                 │                            │
│                                                 │  Sentiment Analysis:       │ ← Emotion tracking
│                                                 │  ┌──────────────────────┐  │
│                                                 │  │ Positive (0.78)      │  │
│                                                 │  └──────────────────────┘  │
│                                                 │  ┌──────────────────────┐  │
│                                                 │  │ 📊 ▁▃▅▇█▇▅▃▁        │  │ ← Emotion graph
│                                                 │  └──────────────────────┘  │
│                                                 │                            │
│                                                 │  Controls                  │ ← Additional controls
│                                                 │  ┌──────┐ ┌──────┐ ┌──────┐│
│  📊 Emotion: Positive (0.78)                   │  │ 🎨  │ │ 🔈  │ │ 👥  ││ ← Theme, audio, collaborate
│                                                 │  └──────┘ └──────┘ └──────┘│
└─────────────────────────────────────────────────┴────────────────────────────┘
```

## Desktop Gallery Screen

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ┌──────┐  Gallery                                           ⚙️  ℹ️             │ ← Header with title
│ │ Logo │                                                                     │
│ └──────┘                                                                     │
├──────────────────────────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌────────────┐ ┌────────────────────────┐ ┌──────┐ │
│ │My Gallery│ │Public Gallery│ Sort: Newest ▼ │ 🔍 Search visualizations │ │Create│ │ ← Navigation and controls
│ └──────────┘ └──────────┘ └────────────┘ └────────────────────────┘ └──────┘ │
│                                                                              │
│ ┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐        │
│ │ ┌────────────────┐ │ │ ┌────────────────┐ │ │ ┌────────────────┐ │        │
│ │ │                │ │ │ │                │ │ │ │                │ │        │
│ │ │  [Visualization│ │ │ │  [Visualization│ │ │ │  [Visualization│ │        │
│ │ │   1]           │ │ │ │   2]           │ │ │ │   3]           │ │        │ ← Gallery item cards (row 1)
│ │ │                │ │ │ │                │ │ │ │                │ │        │
│ │ └────────────────┘ │ │ └────────────────┘ │ │ └────────────────┘ │        │
│ │ "Desert Sunset"    │ │ "Ocean Dreams"     │ │ "Mountain Echo"    │        │
│ │ Aug 15, 2023 👁️ ⋮  │ │ Aug 10, 2023 👁️ ⋮  │ │ Aug 5, 2023 👁️ ⋮   │        │
│ └────────────────────┘ └────────────────────┘ └────────────────────┘        │
│                                                                              │
│ ┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐        │
│ │ ┌────────────────┐ │ │ ┌────────────────┐ │ │ ┌────────────────┐ │        │
│ │ │                │ │ │ │                │ │ │ │                │ │        │
│ │ │  [Visualization│ │ │ │  [Visualization│ │ │ │  [Visualization│ │        │
│ │ │   4]           │ │ │ │   5]           │ │ │ │   6]           │ │        │ ← Gallery item cards (row 2)
│ │ │                │ │ │ │                │ │ │ │                │ │        │
│ │ └────────────────┘ │ │ └────────────────┘ │ │ └────────────────┘ │        │
│ │ "Cosmic Journey"   │ │ "Forest Whispers"  │ │ "Urban Symphony"   │        │
│ │ Aug 1, 2023 👁️ ⋮   │ │ Jul 28, 2023 👁️ ⋮  │ │ Jul 25, 2023 👁️ ⋮  │        │
│ └────────────────────┘ └────────────────────┘ └────────────────────┘        │
│                                                                              │
│ ← Previous                                                         Next →    │ ← Pagination
└──────────────────────────────────────────────────────────────────────────────┘
```

## Desktop Landscape Detail View

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ┌──────┐  Gallery > Desert Sunset                           💾  📤  ⋮         │ ← Header with breadcrumbs and actions
│ │ Logo │                                                                     │
│ └──────┘                                                                     │
├──────────────────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────┐ ┌──────────────────────────┐  │
│ │                                            │ │                          │  │
│ │                                            │ │ Created: Aug 15, 2023    │  │ ← Metadata
│ │                                            │ │ Mood: Positive (0.82)    │  │
│ │                                            │ │                          │  │
│ │         [Full Visualization                │ │ Audio Controls:          │  │
│ │          Image Display]                    │ │ ┌──────┐┌──────┐┌──────┐ │  │ ← Audio controls
│ │                                            │ │ │ 🎵  ││ 🔊  ││ ⏯️   │ │  │
│ │                                            │ │ └──────┘└──────┘└──────┘ │  │
│ │                                            │ │                          │  │
│ └────────────────────────────────────────────┘ │ Volume:                  │  │
│                                                │ [━━━━━━━━━●━━━━━]        │  │ ← Volume slider
│ ┌────────────────────────────────┐ ┌──────────┤                          │  │
│ │ Transcription:                 │ │ Share:   │ Tags:                    │  │
│ │                                │ │ ┌──────┐ │ ┌──────┐┌──────┐┌──────┐ │  │ ← Tags
│ │ "The desert sun sets slowly    │ │ │Twitter│ │ │Desert││Sunset││Warm  │ │  │
│ │  over red dunes, casting       │ │ └──────┘ │ └──────┘└──────┘└──────┘ │  │
│ │  long shadows across the       │ │ ┌──────┐ │                          │  │
│ │  ancient sands. The sky        │ │ │Facebook│ Description:             │  │
│ │  transforms into a canvas      │ │ └──────┘ │ An evocative desert     │  │ ← Description
│ │  of oranges and purples,       │ │ ┌──────┐ │ landscape at sunset,    │  │
│ │  while the cool night air      │ │ │Email  │ │ created during my      │  │
│ │  begins to embrace the         │ │ └──────┘ │ virtual journey through │  │
│ │  warm earth..."                │ │          │ imaginative worlds.     │  │
│ └────────────────────────────────┘ └──────────┴──────────────────────────┘  │
│                                                                              │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ AI-Generated Poetic Summary:                                             │ │
│ │                                                                          │ │
│ │ "A poetic journey through crimson sands, where time stands still and     │ │ ← AI summary
│ │  the sky embraces the earth in a dance of color. As day surrenders to    │ │
│ │  night, the desert reveals its ancient wisdom through whispers carried   │ │
│ │  on the cooling breeze. This moment of transition captures the eternal   │ │
│ │  cycle of endings and beginnings, painted across the vast canvas of      │ │
│ │  nature's most stunning gallery."                                        │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Desktop Settings Panel

```
┌──────────────────────────────────────────────────┐
│ Settings                                    ✕    │ ← Header with close button
├──────────────────────────────────────────────────┤
│                                                  │
│ ┌────────────────┐ ┌────────────────┐ ┌─────────┐│
│ │Audio           │ │Visuals         │ │Language ││ ← Section tabs
│ └────────────────┘ └────────────────┘ └─────────┘│
│                                                  │
│ Audio Settings                                   │ ← Current section title
│                                                  │
│ ┌────────────────────────────────────────────┐   │
│ │ Enable Audio                         [✓]   │   │ ← Toggle
│ └────────────────────────────────────────────┘   │
│                                                  │
│ ┌────────────────────────────────────────────┐   │
│ │ Master Volume                   [━━━━●━━━] │   │ ← Slider
│ └────────────────────────────────────────────┘   │
│                                                  │
│ ┌────────────────────────────────────────────┐   │
│ │ Ambient Soundscape Volume       [━━━●━━━━] │   │ ← Slider
│ └────────────────────────────────────────────┘   │
│                                                  │
│ ┌────────────────────────────────────────────┐   │
│ │ Speech Narration Volume         [━━━━━●━━] │   │ ← Slider
│ └────────────────────────────────────────────┘   │
│                                                  │
│ ┌────────────────────────────────────────────┐   │
│ │ Enable Sound Effects                 [✓]   │   │ ← Toggle
│ └────────────────────────────────────────────┘   │
│                                                  │
│ ┌────────────────────────────────────────────┐   │
│ │ Auto-play in Gallery                 [✓]   │   │ ← Toggle
│ └────────────────────────────────────────────┘   │
│                                                  │
│ ┌──────────────┐                                 │
│ │    Apply     │                                 │ ← Apply button
│ └──────────────┘                                 │
│                                                  │
│ Version 1.2.0                  © 2023 Vocal Earth│ ← Version and copyright
└──────────────────────────────────────────────────┘
```

## Desktop Collaboration Interface

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ┌──────┐                                                    ⚙️  ℹ️  ✕          │ ← Header with controls
│ │ Logo │  Collaborative Session: Galaxy-7842                                 │
│ └──────┘                                                                     │
├────────────────────────────────────┬─────────────────────────────────────────┤
│                                    │ ┌─────────────────────────────────────┐ │
│                                    │ │ Participants                        │ │
│                                    │ │ ● You (Host)                        │ │ ← Participants panel
│                                    │ │ ● Alex                              │ │
│                                    │ │ ● Maya                              │ │
│                                    │ │                                     │ │
│                                    │ │ ┌─────────────┐                     │ │
│                                    │ │ │ Invite User │                     │ │ ← Invite button
│                                    │ │ └─────────────┘                     │ │
│      [Collaborative Visualization  │ └─────────────────────────────────────┘ │
│       that all participants        │                                         │
│       can view and interact with]  │ ┌─────────────────────────────────────┐ │
│                                    │ │ Chat                                │ │
│                                    │ │ ┌─────────────────────────────────┐ │ │
│                                    │ │ │ Alex: I love how the mountains  │ │ │
│                                    │ │ │ shimmer in purple!              │ │ │
│                                    │ │ │                                 │ │ │ ← Chat panel
│                                    │ │ │ Maya: Try saying something about│ │ │
│                                    │ │ │ water or oceans.               │ │ │
│                                    │ │ │                                 │ │ │
│                                    │ │ │ You: Watch what happens when I  │ │ │
│                                    │ │ │ mention galaxies and stars!     │ │ │
│                                    │ │ └─────────────────────────────────┘ │ │
│                                    │ │ ┌───────────────────────┐ ┌───────┐ │ │
│                                    │ │ │Type a message...      │ │ Send  │ │ │ ← Message input
│                                    │ │ └───────────────────────┘ └───────┘ │ │
│                                    │ └─────────────────────────────────────┘ │
│                                    │                                         │
│                                    │ ┌─────────────────────────────────────┐ │
│                                    │ │ Controls                            │ │
│                                    │ │ ┌──────────┐ ┌──────────┐ ┌────────┐│ │ ← Control buttons
│                                    │ │ │Take Turn │ │Share Link│ │Settings││ │
│                                    │ │ └──────────┘ └──────────┘ └────────┘│ │
│                                    │ └─────────────────────────────────────┘ │
└────────────────────────────────────┴─────────────────────────────────────────┘
```

## Desktop Theme Selector Component

```
┌─────────────────────────────────────────────────────────┐
│ Theme Gallery                                    ✕      │ ← Header with close
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│ │Current Theme│ │Featured     │ │Custom       │        │ ← Tab navigation
│ └─────────────┘ └─────────────┘ └─────────────┘        │
│                                                         │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│ │             │ │             │ │             │        │
│ │ [Cosmic     │ │ [Aurora     │ │ [Sunset     │        │
│ │  Blue]      │ │  Green]     │ │  Orange]    │        │ ← Theme previews (row 1)
│ │             │ │             │ │             │        │
│ │ Selected    │ │ Select      │ │ Select      │        │
│ └─────────────┘ └─────────────┘ └─────────────┘        │
│                                                         │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│ │             │ │             │ │             │        │
│ │ [Galaxy     │ │ [Ocean      │ │ [Solar      │        │
│ │  Purple]    │ │  Depths]    │ │  Storm]     │        │ ← Theme previews (row 2)
│ │             │ │             │ │             │        │
│ │ Select      │ │ Select      │ │ Select      │        │
│ └─────────────┘ └─────────────┘ └─────────────┘        │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │               Create Custom Theme                  >│ │ ← Custom theme option
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Current theme: Cosmic Blue                              │ ← Theme info
│ Description: Deep blues with accents of purple and cyan │
│ Soundscape: Cosmic                                      │
│                                                         │
│ ┌───────────────────┐ ┌─────────────────────────────┐  │
│ │     Apply         │ │   Preview in Visualization  │  │ ← Action buttons
│ └───────────────────┘ └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```