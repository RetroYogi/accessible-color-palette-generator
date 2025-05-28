# Accessibler Color Palette Generator v0.6 - Technical Documentation

## Application Overview

The WCAG Color Palette Generator is a web-based tool that creates accessible color palettes meeting WCAG accessibility standards. The application generates color harmonies using color theory algorithms and provides optimized versions for light and dark backgrounds with advanced harmony-preserving color differentiation.

## Core Architecture

### File Structure
```
project/
├── index.html                 # Main HTML with merged differentiation interface
├── styles.css                 # Complete styling with responsive design
├── app.js                     # Main application coordinator with dual generation logic
├── core/
│   ├── ColorUtil.js           # Color manipulation and calculations
│   ├── ColorHarmonies.js      # Color theory algorithms
│   └── StateManager.js        # Application state management
├── generators/
│   └── PaletteGenerator.js    # Palette generation and differentiation algorithm
├── ui/
│   └── UIComponents.js        # UI rendering with merged section support
├── utils/
│   ├── ExportManager.js       # CSS/JSON export functionality
│   ├── HistoryManager.js      # Palette history management
│   └── AccessibilityUtils.js  # Keyboard navigation & accessibility
└── types/
    └── index.d.ts             # TypeScript definitions
```

### Processing Flow

#### 1. Application Initialization
```javascript
const app = new ColorPaletteApp();
await app.initialize();
```

Process:
- Module loading and instantiation
- Event binding for form controls and differentiation toggle
- State manager setup with simplified differentiation settings
- UI preparation with merged harmony/differentiation section

#### 2. Base Palette Generation
```javascript
const baseColors = paletteGenerator.generateBaseColors(baseColor, harmonyType, size);
```

Process:
- First color: Exact user-selected base color
- Subsequent colors: Generated using harmony algorithms
- No contrast optimization or differentiation applied
- Purpose: Display original color theory relationships

#### 3. Optimized Palette Generation
```javascript
const lightColors = paletteGenerator.generateOptimizedPalette(baseColors, whiteBackground, minContrastRatio);
const darkColors = paletteGenerator.generateOptimizedPalette(baseColors, darkBackground, minContrastRatio);
```

Optimization process:
- Light Background: Target 4.5-6.0:1 (AA) or 7.0-8.5:1 (AAA)
- Dark Background: Target 4.5-6.0:1 (AA) or 7.0-8.5:1 (AAA)
- Strategic lightness distribution for each position
- Colors already meeting requirements are preserved

#### 4. Advanced Color Differentiation
```javascript
if (settings.differentiationSettings.enabled) {
    paletteGenerator.applySimpleDifferentiation(lightColors, whiteBackground, minContrastRatio, settings);
    paletteGenerator.applySimpleDifferentiation(darkColors, darkBackground, minContrastRatio, settings);
}
```

Three-stage harmony-preserving process:
1. **Strategic lightness distribution** (primary differentiation method)
2. **Minimal saturation adjustments** (secondary method)
3. **Limited hue changes** (≤10°, last resort only)

## User Interface Components

### Basic Configuration Controls
- **Palette Size**: 3 or 5 colors
- **WCAG Level**: AA (4.5:1) or AAA (7:1) contrast requirements
- **Color Harmony**: complementary, triadic, analogous, monochromatic, tetradic
- **Base Color**: Color picker for starting color

### Merged Harmony & Differentiation Section
Responsive two-column layout:

#### Left Column: Harmony Information
- Dynamic harmony type display and description
- Centered content in highlighted background area

#### Right Column: Advanced Color Differentiation
- **Enable/Disable Toggle**: Simple on/off control
- **Status Indicator**: Shows "Active" (green) or "Disabled" (gray)
- **Information Panel**: Explains harmony-preserving algorithm
- **Responsive**: Stacks on mobile devices

### Differentiation Features
- **Harmony Preservation**: Maintains original color theory relationships
- **Predictable Results**: Same inputs produce consistent outputs
- **WCAG Compliant**: All adjustments improve contrast ratios
- **No History Pollution**: Toggle changes don't create history entries

## State Management System

### State Structure
```javascript
state = {
    currentPalette: [],
    lightOptimizedPalette: [],
    darkOptimizedPalette: [],
    paletteHistory: [],
    isLoading: false,
    settings: {
        paletteSize: 5,
        wcagLevel: 'AA',
        harmonyType: 'triadic',
        baseColor: '#5500AA',
        differentiationSettings: {
            enabled: true,                    // User-controllable toggle
            minHueDifference: 60,            // Fixed optimal value
            minLuminanceDifference: 30       // Fixed optimal value
        }
    }
}
```

### Dual Generation Logic
```javascript
// Settings changes: Generate palette + add to history
handleSettingsChange() → generatePalette() → addToHistory()

// Differentiation toggle: Generate palette without history
handleDifferentiationChange() → generatePaletteWithoutHistory() → no history
```

## Technical Implementation

### Color Harmony Algorithms

#### Complementary
```javascript
complementary: (hue) => [hue, (hue + 180) % 360]
```

#### Triadic
```javascript
triadic: (hue) => [hue, (hue + 120) % 360, (hue + 240) % 360]
```

#### Analogous
```javascript
analogous: (hue) => [hue, (hue + 25) % 360, (hue + 50) % 360, (hue - 25 + 360) % 360, (hue - 50 + 360) % 360]
```

#### Monochromatic
```javascript
monochromatic: (hue) => [hue, hue, hue, hue, hue]
```

#### Tetradic
```javascript
tetradic: (hue) => [hue, (hue + 90) % 360, (hue + 180) % 360, (hue + 270) % 360]
```

### Advanced Differentiation Algorithm

**Key Features:**
- **Lightness-First Approach**: Primary differentiation through strategic brightness distribution
- **Harmony Preservation**: Minimal hue changes (≤10°) to maintain color relationships
- **All-Pairs Comparison**: Every color compared against every other color
- **WCAG Direction**: Adjustments always improve contrast ratios

#### Three-Stage Process

**Stage 1: Strategic Lightness Distribution**
```javascript
// Light backgrounds: Progressive dark-to-medium distribution
if (paletteSize === 3) return [15, 35, 55];
if (paletteSize === 5) return [10, 25, 40, 55, 70];

// Dark backgrounds: Progressive medium-to-light distribution  
if (paletteSize === 3) return [60, 75, 90];
if (paletteSize === 5) return [50, 65, 80, 90, 95];
```

**Stage 2: Saturation Adjustments**
- Identifies colors similar in both saturation AND lightness
- Applies 15% minimum saturation difference
- Only adjusts when lightness differences are insufficient

**Stage 3: Minimal Hue Adjustments (Last Resort)**
- **Trigger**: Hue diff <15°, lightness diff <10%, saturation diff <10%
- **Maximum change**: 10° (preserves harmony)
- **Safety**: Maintains WCAG contrast requirements

### WCAG Contrast Calculation
```javascript
getContrastRatio(otherColor) {
    const lum1 = this.getLuminance();
    const lum2 = otherColor.getLuminance();
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
}
```

### Event Handling
```javascript
// Settings affecting palette composition
['paletteSize', 'wcagLevel', 'harmonyType'].forEach(id => {
    element.addEventListener('change', () => this.handleSettingsChange());
});

// Base color with debouncing
baseColorInput.addEventListener('input', () => this.debouncedSettingsChange());

// Differentiation toggle (immediate response)
differentiationToggle.addEventListener('change', () => this.handleDifferentiationChange());
```

## History Management

### History Structure
```javascript
const historyItem = {
    id: Date.now(),
    palette: [...palette],
    timestamp: new Date(),
    settings: deepClone(this.state.settings)
};
```

### History Behavior
- **Settings changes**: Create history entries
- **Differentiation toggle**: No history entries (experimentation-friendly)
- **Loading from history**: Restores complete settings including differentiation state

## Export Functionality

### CSS Export
```css
:root {
  /* Base Palette (Original Harmony) */
  --color-1: #5500AA;
  --color-2: #AA5500;
  
  /* Light Background Optimized */
  --color-1-light: #440088;
  --color-2-light: #884400;
  
  /* Dark Background Optimized */
  --color-1-dark: #7722CC;
  --color-2-dark: #CC7722;
}
```

### JSON Export
```json
{
  "metadata": {
    "generated": "2024-01-20T15:30:00.000Z",
    "generator": "WCAG Color Palette Generator v0.6",
    "differentiationSettings": {
      "enabled": true,
      "minHueDifference": 60,
      "minLuminanceDifference": 30
    }
  },
  "palettes": {
    "base": [...],
    "lightOptimized": [...],
    "darkOptimized": [...]
  },
  "accessibility": {
    "contrastRatios": {...},
    "wcagCompliance": {...},
    "differentiationApplied": true
  }
}
```

## Performance & Accessibility

### Performance Features
- **Simplified Algorithm**: Three sequential stages vs. complex iterative loops
- **Predictable Execution**: Consistent performance regardless of input colors
- **Bounded Operations**: Maximum 10° hue changes vs. unlimited modifications
- **Efficient DOM Updates**: Merged sections reduce complexity

### Accessibility Features
- **Keyboard Navigation**: Full keyboard support with logical tab order
- **Screen Reader Support**: ARIA labels and live regions
- **Focus Management**: Enhanced indicators for keyboard users
- **Skip Links**: Quick navigation to main content

## Browser Compatibility

### Requirements
- ES6 module support
- CSS custom properties
- HTML5 form controls
- CSS Grid and Flexbox

### Progressive Enhancement
- Graceful fallbacks for older browsers
- Mobile-first responsive design
- Feature detection for advanced capabilities

## Development Guidelines

### Code Standards
- ES6 modules with proper imports/exports
- JSDoc documentation for all public methods
- Proper error handling and validation
- Maintain backward compatibility

### Testing Considerations
- Responsive layout across all screen sizes
- Keyboard navigation paths
- Screen reader compatibility
- Harmony preservation across all harmony types
- Predictable results with identical inputs
- Export functionality across browsers

### Debugging Tools
```javascript
// Application state inspection
const debugInfo = window.colorPaletteApp.getDebugInfo();

// Algorithm behavior monitoring
console.log('Lightness distribution:', palette.map(c => c.hsl.l));
console.log('Max hue change:', Math.max(...hueChanges.map(Math.abs)));

// Module access
window.stateManager.exportState();
window.historyManager.exportHistory();
```

## Key Features

### Harmony-Preserving Differentiation
- Strategic lightness distribution as primary differentiation method
- Maximum 10° hue adjustments to preserve color relationships
- All-pairs comparison for comprehensive distinctiveness
- WCAG-compliant adjustment directions

### Simplified User Experience
- Single toggle control for differentiation
- Predictable, consistent results
- Merged responsive interface design
- Experimentation-friendly (no history pollution)

### Robust Architecture
- Observable pattern for state management
- Dual generation logic for different update scenarios
- Comprehensive error handling and validation
- Full accessibility compliance

The application provides a reliable, user-friendly experience for generating accessible color palettes while maintaining color harmony and ensuring WCAG compliance.