/**
 * WCAG Color Palette Generator v0.6
 * Core palette generation and optimization logic
 */

import { ColorUtil } from '../core/ColorUtil.js';
import { colorHarmonies } from '../core/ColorHarmonies.js';

/**
 * Main palette generator class - WITH IMPROVED SIMPLE DIFFERENTIATION
 */
export class PaletteGenerator {
    constructor() {
        this.whiteColor = new ColorUtil('#ffffff');
        this.darkBgColor = new ColorUtil('#2c3e50');
        this.harmonyType = 'triadic'; // Default value
    }

    /**
     * Generate complete palette with base and optimized versions
     * @param {Object} options - Generation options
     * @returns {Object} Generated palettes
     */
    generatePalette(options) {
        this.harmonyType = options.harmonyType || 'triadic';
        const {
            paletteSize = 5,
            wcagLevel = 'AA',
            harmonyType = 'triadic',
            baseColor = '#5500AA',
            differentiationSettings = {
                enabled: true,
                minHueDifference: 15,
                minLuminanceDifference: 10
            }
        } = options;

        const size = this.validateSize(paletteSize);
        console.log(`Generating palette with size: ${size}, harmony: ${harmonyType}, WCAG: ${wcagLevel}`);
        console.log('Differentiation settings:', differentiationSettings);

        const minContrastRatio = wcagLevel === 'AAA' ? 7 : 4.5;
        const baseColors = this.generateBaseColors(baseColor, harmonyType, size);
        
        // Generate optimized versions
        const lightColors = this.generateOptimizedPalette(baseColors, this.whiteColor, minContrastRatio);
        const darkColors = this.generateOptimizedPalette(baseColors, this.darkBgColor, minContrastRatio);

        // Apply IMPROVED simple differentiation to optimized palettes if enabled
        if (differentiationSettings.enabled) {
            console.log('Applying IMPROVED simple differentiation...');
            this.applySimpleDifferentiation(lightColors, this.whiteColor, minContrastRatio, differentiationSettings);
            this.applySimpleDifferentiation(darkColors, this.darkBgColor, minContrastRatio, differentiationSettings);
        } else {
            console.log('Color differentiation disabled');
        }

        const result = {
            base: baseColors,
            lightOptimized: lightColors,
            darkOptimized: darkColors
        };

        console.log('Generated palettes:', result);
        return result;
    }

    /**
     * Validate and sanitize palette size
     * @param {number|string} size - Requested size
     * @returns {number} Valid size (3 or 5)
     */
    validateSize(size) {
        const numSize = parseInt(size);
        if (numSize === 3 || numSize === 5) {
            return numSize;
        }
        console.warn(`Invalid palette size: ${size}, defaulting to 5`);
        return 5;
    }

    /**
     * Generate base color palette using harmony algorithm
     * @param {string} baseColor - Base color hex value
     * @param {string} harmonyType - Type of harmony to use
     * @param {number} size - Number of colors to generate
     * @returns {ColorUtil[]} Array of base colors
     */
    generateBaseColors(baseColor, harmonyType, size) {
        let color;
        try {
            color = new ColorUtil(baseColor);
        } catch (e) {
            console.warn('Invalid base color, using default:', baseColor);
            color = new ColorUtil('#5500AA');
        }
        
        const baseHue = color.hsl.h;
        const harmonyHues = colorHarmonies[harmonyType](baseHue);
        const colors = [];

        console.log(`Generating ${size} base colors for ${harmonyType} harmony`);

        for (let i = 0; i < size; i++) {
            let generatedColor;
            
            if (i === 0) {
                generatedColor = new ColorUtil(baseColor);
            } else {
                generatedColor = this.generateColorFromHarmony(
                    color, 
                    harmonyHues, 
                    harmonyType, 
                    i,
                    size
                );
            }
            
            colors.push(generatedColor);
        }

        console.log('Generated base colors:', colors.map(c => c.hex));
        return colors;
    }

    /**
     * Generate a color from harmony algorithm - COMPLETELY DETERMINISTIC
     * @param {ColorUtil} baseColor - Base color
     * @param {number[]} harmonyHues - Array of harmony hues
     * @param {string} harmonyType - Type of harmony
     * @param {number} index - Color index in palette
     * @param {number} totalSize - Total palette size
     * @returns {ColorUtil} Generated color
     */
    generateColorFromHarmony(baseColor, harmonyHues, harmonyType, index, totalSize) {
        let hue = harmonyHues[index % harmonyHues.length];
        let saturation, lightness;

        if (harmonyType === 'monochromatic') {
            const hueVariation = (index - 1) * 10; 
            hue = (baseColor.hsl.h + hueVariation) % 360;
            
            saturation = Math.max(30, Math.min(90, baseColor.hsl.s + (index - 2) * 15));
            
            if (totalSize === 3) {
                const lightnessLevels = [30, 50, 70];
                lightness = lightnessLevels[index - 1] || 50;
            } else {
                const lightnessLevels = [15, 35, 55, 75, 90]; 
                lightness = lightnessLevels[index - 1] || 50;
            }
        } else {
            // Add the missing non-monochromatic case
            if (totalSize === 3) {
                const saturationLevels = [75, 60, 85];
                const lightnessLevels = [50, 35, 70];
                
                saturation = saturationLevels[index - 1] || 70;
                lightness = lightnessLevels[index - 1] || 50;
            } else {
                const saturationLevels = [75, 60, 85, 50, 80];
                const lightnessLevels = [50, 35, 70, 20, 80];
                
                saturation = saturationLevels[index - 1] || 70;
                lightness = lightnessLevels[index - 1] || 50;
            }
            
            if (harmonyType === 'complementary') {
                if (index === 1) {
                    saturation = Math.min(85, saturation + 10);
                    lightness = Math.max(20, lightness - 5);
                }
            } else if (harmonyType === 'analogous') {
                saturation = Math.max(50, saturation - 5);
                if (index === 2) lightness = Math.min(80, lightness + 10);
            } else if (harmonyType === 'tetradic') {
                if (index % 2 === 1) {
                    lightness = Math.max(15, lightness - 10);
                } else {
                    lightness = Math.min(85, lightness + 10);
                }
            }
        }

        saturation = Math.max(20, Math.min(95, saturation));
        lightness = Math.max(10, Math.min(90, lightness));

        return ColorUtil.fromHsl(hue, saturation, lightness);
    }
    /**
     * Generate optimized palette for specific background
     * @param {ColorUtil[]} baseColors - Base color palette
     * @param {ColorUtil} backgroundColor - Background color
     * @param {number} minContrastRatio - Minimum contrast ratio
     * @returns {ColorUtil[]} Optimized color palette
     */
    generateOptimizedPalette(baseColors, backgroundColor, minContrastRatio) {
        return baseColors.map((color, index) => 
            this.optimizeColorForBackground(color, backgroundColor, minContrastRatio, index, baseColors.length)
        );
    }

    /**
     * Optimize a single color for a specific background
     * @param {ColorUtil} originalColor - Original color
     * @param {ColorUtil} backgroundColor - Background color
     * @param {number} targetRatio - Target contrast ratio
     * @param {number} colorIndex - Index in palette
     * @param {number} totalColors - Total colors in palette
     * @returns {ColorUtil} Optimized color
     */
    optimizeColorForBackground(originalColor, backgroundColor, targetRatio, colorIndex, totalColors) {
        const currentContrast = originalColor.getContrastRatio(backgroundColor);
        const upperBound = targetRatio === 4.5 ? 6.0 : 8.5;
        
        if (currentContrast >= targetRatio) {
            if (currentContrast <= upperBound) {
                return originalColor;
            }
            return originalColor;
        }
        
        return this.findOptimalColor(originalColor, backgroundColor, targetRatio, upperBound, colorIndex, totalColors);
    }

    /**
     * Find optimal color that meets contrast requirements
     * @param {ColorUtil} originalColor - Original color
     * @param {ColorUtil} backgroundColor - Background color
     * @param {number} targetRatio - Target contrast ratio
     * @param {number} upperBound - Upper bound for contrast
     * @param {number} colorIndex - Index in palette
     * @param {number} totalColors - Total colors in palette
     * @returns {ColorUtil} Optimal color
     */
    findOptimalColor(originalColor, backgroundColor, targetRatio, upperBound, colorIndex, totalColors) {
        const originalHsl = originalColor.hsl;
        const isLightBackground = backgroundColor.getLuminance() > 0.5;
        
        const targetLightnessRange = this.getTargetLightnessRange(
            isLightBackground, 
            colorIndex, 
            totalColors,
            this.harmonyType
        );
        
        let bestColor = originalColor;
        let bestContrast = originalColor.getContrastRatio(backgroundColor);
        
        for (let l = targetLightnessRange[0]; l <= targetLightnessRange[1]; l += 2) {
            const testColor = ColorUtil.fromHsl(originalHsl.h, originalHsl.s, l);
            const testContrast = testColor.getContrastRatio(backgroundColor);
            
            if (testContrast >= targetRatio && testContrast <= upperBound) {
                return testColor;
            }
            
            if (Math.abs(testContrast - targetRatio) < Math.abs(bestContrast - targetRatio)) {
                bestColor = testColor;
                bestContrast = testContrast;
            }
        }
        
        return this.expandedColorSearch(originalHsl, backgroundColor, targetRatio, isLightBackground, targetLightnessRange, bestColor);
    }

    /**
     * Get target lightness range for color position based on palette size
     * @param {boolean} isLightBackground - Whether background is light
     * @param {number} colorIndex - Index of color in palette
     * @param {number} totalColors - Total colors in palette
     * @returns {number[]} [min, max] lightness range
     */
    getTargetLightnessRange(isLightBackground, colorIndex, totalColors, harmonyType) {
        if (isLightBackground) {
            if (harmonyType === 'monochromatic') {
                // Return [min,max] ranges for monochromatic
                if (totalColors === 3) {
                    const base = 10 + (colorIndex * 20);
                    return [base, base + 15];
                } else {
                    const base = 10 + (colorIndex * 15);
                    return [base, base + 15];
                }
            } else {
                const ranges = [
                    [15, 35], [25, 45], [35, 55], [20, 40], [10, 30]
                ];
                return ranges[colorIndex % ranges.length];
            }
        } else {
            if (totalColors === 3) {
                const ranges = [
                    [70, 95], [60, 80], [75, 90]
                ];
                return ranges[colorIndex % ranges.length];
            } else {
                const ranges = [
                    [70, 90], [60, 80], [50, 70], [65, 85], [75, 95]
                ];
                return ranges[colorIndex % ranges.length];
            }
        }
    }

    /**
     * Expanded color search when initial range doesn't work
     * @param {Object} originalHsl - Original HSL values
     * @param {ColorUtil} backgroundColor - Background color
     * @param {number} targetRatio - Target contrast ratio
     * @param {boolean} isLightBackground - Whether background is light
     * @param {number[]} targetLightnessRange - Target lightness range
     * @param {ColorUtil} bestColor - Current best color
     * @returns {ColorUtil} Found color or best alternative
     */
    expandedColorSearch(originalHsl, backgroundColor, targetRatio, isLightBackground, targetLightnessRange, bestColor) {
        const step = targetRatio >= 7 ? 1 : 2;
        const searchDirection = isLightBackground ? -1 : 1;
        let targetLightness = (targetLightnessRange[0] + targetLightnessRange[1]) / 2;
        let bestContrast = bestColor.getContrastRatio(backgroundColor);
        
        for (let i = 0; i < 45; i++) {
            targetLightness += searchDirection * step;
            
            if (targetLightness < 5 || targetLightness > 95) {
                break;
            }
            
            const testColor = ColorUtil.fromHsl(originalHsl.h, originalHsl.s, targetLightness);
            const testContrast = testColor.getContrastRatio(backgroundColor);
            
            if (testContrast >= targetRatio) {
                return testColor;
            }
            
            if (testContrast > bestContrast) {
                bestColor = testColor;
                bestContrast = testContrast;
            }
        }
        
        return bestColor;
    }

    /**
     * Simple differentiation algorithm that preserves harmony
     * 
     * 
     * @param {ColorUtil[]} palette - Color palette to adjust
     * @param {ColorUtil} backgroundColor - Background color
     * @param {number} minContrastRatio - Minimum contrast ratio
     * @param {Object} differentiationSettings - Differentiation configuration
     */
    applySimpleDifferentiation(palette, backgroundColor, minContrastRatio, differentiationSettings = {}) {
        const MIN_LIGHTNESS_DIFFERENCE = differentiationSettings.minLuminanceDifference || 10;
        const MIN_SATURATION_DIFFERENCE = 20; // Increased from 15
        const MAX_HUE_ADJUSTMENT = 10;

        const isLightBackground = backgroundColor.getLuminance() > 0.5;

        const isMonochromatic = palette.every(c => 
            this.getCircularHueDistance(c.hsl.h, palette[0].hsl.h) < 5
        );

        if (isMonochromatic) {
            console.log('Monochromatic palette detected - applying enhanced differentiation');
            this.enhanceMonochromaticDifferentiation(palette, backgroundColor, minContrastRatio);
            return;
        }
        
        console.log(`Applying simple differentiation: lightness ${MIN_LIGHTNESS_DIFFERENCE}%, saturation ${MIN_SATURATION_DIFFERENCE}%`);
        console.log(`Background type: ${isLightBackground ? 'light' : 'dark'}`);
        
        // Step 1: Create optimal lightness distribution
        this.distributeColorsOptimally(palette, backgroundColor, minContrastRatio, MIN_LIGHTNESS_DIFFERENCE);
        
        // Step 2: Apply minimal saturation adjustments if needed
        this.adjustSaturationForDifferentiation(palette, MIN_SATURATION_DIFFERENCE);
        
        // Step 3: Final minimal hue adjustments only if absolutely necessary
        this.applyMinimalHueAdjustments(palette, backgroundColor, minContrastRatio, MAX_HUE_ADJUSTMENT);
    }

    /**
     * Distribute colors optimally using lightness differences
     * @param {ColorUtil[]} palette - Color palette
     * @param {ColorUtil} backgroundColor - Background color
     * @param {number} minContrastRatio - Minimum contrast ratio
     * @param {number} minLightnessDiff - Minimum lightness difference
     */
    distributeColorsOptimally(palette, backgroundColor, minContrastRatio, minLightnessDiff) {
        const isLightBackground = backgroundColor.getLuminance() > 0.5;
        const paletteSize = palette.length;
        
        // Create optimal lightness distribution based on palette size
        const optimalLightness = this.getOptimalLightnessDistribution(paletteSize, isLightBackground);
        
        console.log('Optimal lightness distribution:', optimalLightness);
        
        for (let i = 0; i < palette.length; i++) {
            const originalColor = palette[i];
            const targetLightness = optimalLightness[i];
            
            // Try to adjust to target lightness while maintaining contrast
            const adjustedColor = this.adjustColorToTargetLightness(
                originalColor, 
                backgroundColor, 
                minContrastRatio, 
                targetLightness
            );
            
            if (adjustedColor && adjustedColor !== originalColor) {
                palette[i] = adjustedColor;
                console.log(`Lightness adjusted color ${i}: ${originalColor.hex} → ${adjustedColor.hex}`);
            }
        }
    }

    /**
     * Get optimal lightness distribution for palette size and background
     * @param {number} paletteSize - Size of palette
     * @param {boolean} isLightBackground - Whether background is light
     * @returns {number[]} Array of optimal lightness values
     */
    getOptimalLightnessDistribution(paletteSize, isLightBackground) {
        if (isLightBackground) {
            // For light backgrounds: distribute from dark to medium
            if (paletteSize === 3) {
                return [15, 35, 55]; // Well-spaced dark colors
            } else {
                return [10, 25, 40, 55, 70]; // Progressive lightness increase
            }
        } else {
            // For dark backgrounds: distribute from medium to light
            if (paletteSize === 3) {
                return [60, 75, 90]; // Well-spaced light colors
            } else {
                return [50, 65, 80, 90, 95]; // Progressive lightness increase
            }
        }
    }

    /**
     * Adjust color to target lightness while maintaining contrast
     * @param {ColorUtil} originalColor - Original color
     * @param {ColorUtil} backgroundColor - Background color
     * @param {number} minContrastRatio - Minimum contrast ratio
     * @param {number} targetLightness - Target lightness value
     * @returns {ColorUtil|null} Adjusted color or null
     */
    adjustColorToTargetLightness(originalColor, backgroundColor, minContrastRatio, targetLightness) {
        const originalHsl = originalColor.hsl;
        
        // Try exact target lightness first
        let testColor = ColorUtil.fromHsl(originalHsl.h, originalHsl.s, targetLightness);
        let testContrast = testColor.getContrastRatio(backgroundColor);
        
        if (testContrast >= minContrastRatio) {
            return testColor;
        }
        
        // If exact target doesn't work, find nearest that meets contrast
        const isLightBackground = backgroundColor.getLuminance() > 0.5;
        const searchDirection = isLightBackground ? -1 : 1; // Darker for light bg, lighter for dark bg
        
        for (let adjustment = 5; adjustment <= 25; adjustment += 5) {
            const adjustedLightness = Math.max(5, Math.min(95, targetLightness + (searchDirection * adjustment)));
            
            testColor = ColorUtil.fromHsl(originalHsl.h, originalHsl.s, adjustedLightness);
            testContrast = testColor.getContrastRatio(backgroundColor);
            
            if (testContrast >= minContrastRatio) {
                return testColor;
            }
        }
        
        return originalColor; // Return original if no good adjustment found
    }

    /**
     * Apply minimal saturation adjustments for differentiation
     * @param {ColorUtil[]} palette - Color palette
     * @param {number} minSaturationDiff - Minimum saturation difference
     */
    adjustSaturationForDifferentiation(palette, minSaturationDiff) {
        const similarSaturationPairs = [];
        
        for (let i = 0; i < palette.length; i++) {
            for (let j = i + 1; j < palette.length; j++) {
                const satDiff = Math.abs(palette[i].hsl.s - palette[j].hsl.s);
                const lightDiff = Math.abs(palette[i].hsl.l - palette[j].hsl.l);
                
                if (satDiff < minSaturationDiff && lightDiff < 15) {
                    similarSaturationPairs.push({ index1: i, index2: j, satDiff });
                }
            }
        }
        
        console.log(`Found ${similarSaturationPairs.length} similar saturation pairs`);
        
        for (const pair of similarSaturationPairs) {
            const color1 = palette[pair.index1];
            const color2 = palette[pair.index2];
            
            const adjustment = minSaturationDiff + 10; // Single declaration
            const newSat = color2.hsl.s > color1.hsl.s ? 
                Math.min(95, color2.hsl.s + adjustment) :
                Math.max(20, color2.hsl.s - adjustment);
            
            const adjustedColor = ColorUtil.fromHsl(color2.hsl.h, newSat, color2.hsl.l);
            palette[pair.index2] = adjustedColor;
            console.log(`Saturation adjusted color ${pair.index2}: ${color2.hex} → ${adjustedColor.hex}`);
        }
    }

    /**
     * Apply minimal hue adjustments only when absolutely necessary
     * @param {ColorUtil[]} palette - Color palette  
     * @param {ColorUtil} backgroundColor - Background color
     * @param {number} minContrastRatio - Minimum contrast ratio
     * @param {number} maxHueAdjustment - Maximum allowed hue adjustment
     */
    applyMinimalHueAdjustments(palette, backgroundColor, minContrastRatio, maxHueAdjustment) {
        // Only apply hue adjustments if colors are still too similar after lightness and saturation adjustments
        const veryClosePairs = [];
        
        for (let i = 0; i < palette.length; i++) {
            for (let j = i + 1; j < palette.length; j++) {
                const color1 = palette[i];
                const color2 = palette[j];
                
                const hueDiff = this.getCircularHueDistance(color1.hsl.h, color2.hsl.h);
                const lightDiff = Math.abs(color1.hsl.l - color2.hsl.l);
                const satDiff = Math.abs(color1.hsl.s - color2.hsl.s);
                
                // Only adjust hue if colors are very similar in all aspects
                if (hueDiff < 15 && lightDiff < 10 && satDiff < 10) {
                    veryClosePairs.push({ index1: i, index2: j, hueDiff });
                }
            }
        }
        
        console.log(`Found ${veryClosePairs.length} pairs needing minimal hue adjustment`);
        
        // Apply very limited hue adjustments
        for (const pair of veryClosePairs) {
            const color = palette[pair.index2]; // Adjust second color
            const originalHsl = color.hsl;
            
            // Try small hue adjustments in both directions
            for (const direction of [1, -1]) {
                const newHue = (originalHsl.h + (direction * maxHueAdjustment) + 360) % 360;
                const testColor = ColorUtil.fromHsl(newHue, originalHsl.s, originalHsl.l);
                const testContrast = testColor.getContrastRatio(backgroundColor);
                
                if (testContrast >= minContrastRatio) {
                    palette[pair.index2] = testColor;
                    console.log(`Minimal hue adjusted color ${pair.index2}: ${color.hex} → ${testColor.hex}`);
                    break;
                }
            }
        }
    }

    /**
     * Calculate proper circular hue distance on color wheel
     * @param {number} hue1 - First hue value
     * @param {number} hue2 - Second hue value
     * @returns {number} Circular distance between hues
     */
    getCircularHueDistance(hue1, hue2) {
        // Ensure hues are in 0-360 range
        const h1 = ((hue1 % 360) + 360) % 360;
        const h2 = ((hue2 % 360) + 360) % 360;
        
        const diff = Math.abs(h1 - h2);
        return Math.min(diff, 360 - diff);
    }
    /**
     * Special handling for monochromatic palettes
     */
    enhanceMonochromaticDifferentiation(palette, backgroundColor, minContrastRatio) {
        const isLightBackground = backgroundColor.getLuminance() > 0.5;
        const baseHue = palette[0].hsl.h;
        
        // Wider lightness distribution for monochromatic
        const lightnessValues = palette.length === 3 ? 
            [15, 50, 85] : [10, 30, 50, 70, 90];
        
        // Add slight hue variations (5° steps)
        palette.forEach((color, i) => {
            const hueVariation = i * 5;
            const newHue = (baseHue + hueVariation) % 360;
            const newLightness = isLightBackground ? 
                lightnessValues[i] : 
                100 - lightnessValues[i];
                
            palette[i] = ColorUtil.fromHsl(
                newHue,
                Math.max(40, color.hsl.s), // Ensure minimum saturation
                newLightness
            );
        });
        
        // Final check to ensure contrast
        this.ensureMinimumContrast(palette, backgroundColor, minContrastRatio);
    }
    /**
     * Ensure all colors meet minimum contrast requirements
     */
    ensureMinimumContrast(palette, backgroundColor, minContrastRatio) {
        palette.forEach((color, i) => {
            const contrast = color.getContrastRatio(backgroundColor);
            if (contrast < minContrastRatio) {
                // Find nearest color that meets contrast
                palette[i] = this.findOptimalColor(
                    color, 
                    backgroundColor, 
                    minContrastRatio,
                    minContrastRatio * 1.5, // Upper bound
                    i,
                    palette.length
                );
            }
        });
    }
}