# Animated Wavy Paths

This directory contains enhanced animated wavy path components with advanced interactive features.

## Components

### WavyPaths
The enhanced version of the original wavy paths component with additional features:

**Props:**
- `speed?: number` - Animation speed multiplier (default: 1)
- `intensity?: number` - Visual intensity multiplier (default: 1)
- `colors?: string[]` - Array of colors for the paths (default: ["#6B7280", "#9CA3AF", "#D1D5DB"])
- `interactive?: boolean` - Enable mouse interaction effects (default: true)
- `pulseEffect?: boolean` - Enable pulsing stroke width animation (default: true)

**Features:**
- ✅ Stroke-dasharray animation
- ✅ Interactive hover effects
- ✅ Mouse-following particles
- ✅ Dynamic color application
- ✅ Performance optimizations
- ✅ Safari compatibility

### AdvancedWavyPaths
An advanced version with morphing capabilities:

**Additional Props:**
- `morphing?: boolean` - Enable dynamic path morphing (default: true)
- `particleCount?: number` - Number of interactive particles (default: 8)
- `waveAmplitude?: number` - Amplitude of morphing waves (default: 20)
- `waveFrequency?: number` - Frequency of morphing waves (default: 0.02)

**Additional Features:**
- ✅ Dynamic path generation
- ✅ Real-time morphing
- ✅ Orbital particle motion
- ✅ Multiple animation layers
- ✅ Enhanced visual effects

### WavyPathsDemo
A comprehensive demo component showcasing all variations and configurations.

## Usage Examples

### Basic Usage
```tsx
import { WavyPaths } from "./WavyPaths";

<WavyPaths />
```

### Custom Configuration
```tsx
<WavyPaths 
  speed={1.5}
  intensity={1.2}
  colors={["#EF4444", "#F97316", "#EAB308"]}
  interactive={true}
  pulseEffect={true}
/>
```

### Advanced Morphing
```tsx
import { AdvancedWavyPaths } from "./AdvancedWavyPaths";

<AdvancedWavyPaths 
  speed={1.2}
  intensity={1}
  colors={["#8B5CF6", "#A78BFA", "#C4B5FD"]}
  interactive={true}
  morphing={true}
  particleCount={12}
  waveAmplitude={25}
  waveFrequency={0.03}
/>
```

### Demo Component
```tsx
import { WavyPathsDemo } from "./WavyPathsDemo";

<WavyPathsDemo />
```

## Performance Considerations

- Uses `will-change` CSS property for optimized animations
- Implements `transform: translateZ(0)` for hardware acceleration
- Includes `backface-visibility: hidden` for better rendering
- Optimized GSAP timelines with proper cleanup
- Conditional rendering based on browser capabilities

## Browser Compatibility

- ✅ Chrome/Edge (full features)
- ✅ Firefox (full features)
- ✅ Safari (fallback mode)
- ✅ Mobile browsers (optimized performance)

## Integration

The components are already integrated into the `InteractiveSkateboard` component and can be easily added to other parts of the application by importing and using them with custom props.
