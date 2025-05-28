/**
 * WCAG Color Palette Generator v0.6
 * Export functionality for palettes in different formats
 */

/**
 * Export manager for handling palette exports
 */
export class ExportManager {
    /**
     * Export palette in specified format
     * @param {string} format - Export format ('css' or 'json')
     * @param {Object} palettes - Palette data
     * @param {Object} settings - Generation settings
     * @returns {boolean} Success status
     */
    exportPalette(format, palettes, settings) {
        if (!palettes.base || palettes.base.length === 0) {
            this.showError('Please generate a palette first!');
            return false;
        }

        try {
            switch (format.toLowerCase()) {
                case 'css':
                    return this.exportCSS(palettes, settings);
                case 'json':
                    return this.exportJSON(palettes, settings);
                default:
                    this.showError('Unsupported export format');
                    return false;
            }
        } catch (error) {
            console.error('Export error:', error);
            this.showError('Failed to export palette. Please try again.');
            return false;
        }
    }

    /**
     * Export palette as CSS custom properties
     * @param {Object} palettes - Palette data
     * @param {Object} settings - Generation settings
     * @returns {boolean} Success status
     */
    exportCSS(palettes, settings) {
        const css = this.generateCSSContent(palettes, settings);
        return this.downloadFile(css, 'color-palette.css', 'text/css');
    }

    /**
     * Export palette as JSON data
     * @param {Object} palettes - Palette data
     * @param {Object} settings - Generation settings
     * @returns {boolean} Success status
     */
    exportJSON(palettes, settings) {
        const jsonData = this.generateJSONContent(palettes, settings);
        const jsonString = JSON.stringify(jsonData, null, 2);
        return this.downloadFile(jsonString, 'color-palette.json', 'application/json');
    }

    /**
     * Generate CSS content for export
     * @param {Object} palettes - Palette data
     * @param {Object} settings - Generation settings
     * @returns {string} CSS content
     */
    generateCSSContent(palettes, settings) {
        const timestamp = new Date().toISOString();
        const { base, lightOptimized, darkOptimized } = palettes;
        const { differentiationSettings } = settings;
        
        let css = `/* WCAG Accessible Color Palette */\n`;
        css += `/* Generated: ${timestamp} */\n`;
        css += `/* Settings: ${settings.wcagLevel} level, ${settings.harmonyType} harmony */\n`;
        css += `/* Color Differentiation: ${differentiationSettings.enabled ? 'Enabled' : 'Disabled'} */\n`;
        if (differentiationSettings.enabled) {
            css += `/* Hue Difference: ${differentiationSettings.minHueDifference}°, Luminance: ${differentiationSettings.minLuminanceDifference}% */\n`;
        }
        css += '\n';
        
        css += ':root {\n';
        
        // Base palette
        css += '  /* Base Palette (Original Harmony) */\n';
        base.forEach((color, index) => {
            css += `  --color-${index + 1}: ${color.hex};\n`;
        });
        
        // Light background optimized
        css += '\n  /* Light Background Optimized */\n';
        lightOptimized.forEach((color, index) => {
            css += `  --color-${index + 1}-light: ${color.hex};\n`;
        });
        
        // Dark background optimized
        css += '\n  /* Dark Background Optimized */\n';
        darkOptimized.forEach((color, index) => {
            css += `  --color-${index + 1}-dark: ${color.hex};\n`;
        });
        
        css += '}\n\n';
        
        // Usage examples
        css += this.generateCSSUsageExamples();
        
        return css;
    }

    /**
     * Generate CSS usage examples
     * @returns {string} CSS usage examples
     */
    generateCSSUsageExamples() {
        return `/* Usage Examples */

/* Basic color usage */
.text-primary { color: var(--color-1); }
.bg-primary { background-color: var(--color-1); }

/* Light theme (white/light backgrounds) */
.light-theme {
  background-color: #ffffff;
  color: var(--color-1-light);
}

.light-theme .accent { color: var(--color-2-light); }
.light-theme .secondary { color: var(--color-3-light); }

/* Dark theme (dark backgrounds) */
.dark-theme {
  background-color: #2c3e50;
  color: var(--color-1-dark);
}

.dark-theme .accent { color: var(--color-2-dark); }
.dark-theme .secondary { color: var(--color-3-dark); }

/* Component examples */
.button-primary {
  background-color: var(--color-1);
  color: #ffffff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
}

.alert-info {
  background-color: var(--color-2-light);
  color: #000000;
  padding: 1rem;
  border-radius: 0.25rem;
}

/* Responsive design consideration */
@media (prefers-color-scheme: dark) {
  :root {
    --text-primary: var(--color-1-dark);
    --text-secondary: var(--color-2-dark);
    --bg-primary: #2c3e50;
  }
}

@media (prefers-color-scheme: light) {
  :root {
    --text-primary: var(--color-1-light);
    --text-secondary: var(--color-2-light);
    --bg-primary: #ffffff;
  }
}
`;
    }

    /**
     * Generate JSON content for export
     * @param {Object} palettes - Palette data
     * @param {Object} settings - Generation settings
     * @returns {Object} JSON data structure
     */
    generateJSONContent(palettes, settings) {
        const { base, lightOptimized, darkOptimized } = palettes;
        
        return {
            metadata: {
                generated: new Date().toISOString(),
                generator: 'WCAG Color Palette Generator v0.6',
                wcagLevel: settings.wcagLevel,
                harmonyType: settings.harmonyType,
                baseColor: settings.baseColor,
                paletteSize: settings.paletteSize,
                differentiationSettings: settings.differentiationSettings
            },
            palettes: {
                base: this.convertPaletteToJSON(base, 'base'),
                lightOptimized: this.convertPaletteToJSON(lightOptimized, 'light-optimized'),
                darkOptimized: this.convertPaletteToJSON(darkOptimized, 'dark-optimized')
            },
            accessibility: {
                contrastRatios: this.calculateContrastRatios(lightOptimized, darkOptimized),
                wcagCompliance: this.checkWCAGCompliance(lightOptimized, darkOptimized, settings.wcagLevel),
                differentiationApplied: settings.differentiationSettings.enabled,
                differentiationSettings: settings.differentiationSettings
            },
            usage: {
                css: this.generateCSSVariableNames(base.length),
                sassVariables: this.generateSassVariableNames(base.length),
                designTokens: this.generateDesignTokens(base, lightOptimized, darkOptimized)
            }
        };
    }

    /**
     * Convert palette to JSON format
     * @param {ColorUtil[]} palette - Color palette
     * @param {string} type - Palette type
     * @returns {Object[]} JSON palette data
     */
    convertPaletteToJSON(palette, type) {
        return palette.map((color, index) => ({
            index: index + 1,
            name: `color-${index + 1}-${type}`,
            hex: color.hex,
            rgb: {
                r: Math.round(color.rgb.r),
                g: Math.round(color.rgb.g),
                b: Math.round(color.rgb.b)
            },
            hsl: {
                h: Math.round(color.hsl.h),
                s: Math.round(color.hsl.s),
                l: Math.round(color.hsl.l)
            },
            luminance: color.getLuminance()
        }));
    }

    /**
     * Calculate contrast ratios for accessibility report
     * @param {ColorUtil[]} lightOptimized - Light optimized palette
     * @param {ColorUtil[]} darkOptimized - Dark optimized palette
     * @returns {Object} Contrast ratio data
     */
    calculateContrastRatios(lightOptimized, darkOptimized) {
        const whiteColor = { getLuminance: () => 1 };
        const darkColor = { getLuminance: () => 0.133 }; // #2c3e50 approximate
        
        return {
            lightBackground: lightOptimized.map((color, index) => ({
                colorIndex: index + 1,
                ratio: this.calculateContrast(color.getLuminance(), whiteColor.getLuminance())
            })),
            darkBackground: darkOptimized.map((color, index) => ({
                colorIndex: index + 1,
                ratio: this.calculateContrast(color.getLuminance(), darkColor.getLuminance())
            }))
        };
    }

    /**
     * Calculate contrast ratio between two luminance values
     * @param {number} lum1 - First luminance value
     * @param {number} lum2 - Second luminance value
     * @returns {number} Contrast ratio
     */
    calculateContrast(lum1, lum2) {
        const brightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);
        return (brightest + 0.05) / (darkest + 0.05);
    }

    /**
     * Check WCAG compliance for palettes
     * @param {ColorUtil[]} lightOptimized - Light optimized palette
     * @param {ColorUtil[]} darkOptimized - Dark optimized palette
     * @param {string} wcagLevel - WCAG level
     * @returns {Object} Compliance data
     */
    checkWCAGCompliance(lightOptimized, darkOptimized, wcagLevel) {
        const requiredRatio = wcagLevel === 'AAA' ? 7 : 4.5;
        const whiteColor = { getLuminance: () => 1 };
        const darkColor = { getLuminance: () => 0.133 };
        
        const lightCompliance = lightOptimized.map((color, index) => {
            const ratio = this.calculateContrast(color.getLuminance(), whiteColor.getLuminance());
            return {
                colorIndex: index + 1,
                compliant: ratio >= requiredRatio,
                ratio: ratio,
                level: ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'FAIL'
            };
        });
        
        const darkCompliance = darkOptimized.map((color, index) => {
            const ratio = this.calculateContrast(color.getLuminance(), darkColor.getLuminance());
            return {
                colorIndex: index + 1,
                compliant: ratio >= requiredRatio,
                ratio: ratio,
                level: ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'FAIL'
            };
        });
        
        return {
            lightBackground: lightCompliance,
            darkBackground: darkCompliance,
            overallCompliant: {
                light: lightCompliance.every(c => c.compliant),
                dark: darkCompliance.every(c => c.compliant)
            }
        };
    }

    /**
     * Generate CSS variable names
     * @param {number} count - Number of colors
     * @returns {Object} CSS variable reference
     */
    generateCSSVariableNames(count) {
        const variables = {};
        for (let i = 1; i <= count; i++) {
            variables[`color${i}`] = {
                base: `--color-${i}`,
                light: `--color-${i}-light`,
                dark: `--color-${i}-dark`
            };
        }
        return variables;
    }

    /**
     * Generate Sass variable names
     * @param {number} count - Number of colors
     * @returns {Object} Sass variable reference
     */
    generateSassVariableNames(count) {
        const variables = {};
        for (let i = 1; i <= count; i++) {
            variables[`color${i}`] = {
                base: `$color-${i}`,
                light: `$color-${i}-light`,
                dark: `$color-${i}-dark`
            };
        }
        return variables;
    }

    /**
     * Generate design tokens structure
     * @param {ColorUtil[]} base - Base palette
     * @param {ColorUtil[]} lightOptimized - Light optimized palette
     * @param {ColorUtil[]} darkOptimized - Dark optimized palette
     * @returns {Object} Design tokens structure
     */
    generateDesignTokens(base, lightOptimized, darkOptimized) {
        const tokens = {};
        
        for (let i = 0; i < base.length; i++) {
            const colorName = `color-${i + 1}`;
            tokens[colorName] = {
                base: { value: base[i].hex },
                light: { value: lightOptimized[i].hex },
                dark: { value: darkOptimized[i].hex }
            };
        }
        
        return tokens;
    }

    /**
     * Download file helper function
     * @param {string} content - File content
     * @param {string} filename - File name
     * @param {string} mimeType - MIME type
     * @returns {boolean} Success status
     */
    downloadFile(content, filename, mimeType) {
        try {
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
            return true;
        } catch (error) {
            console.error('Download failed:', error);
            this.showError('Failed to download file. Please try again.');
            return false;
        }
    }

    /**
     * Show error message to user
     * @param {string} message - Error message
     */
    showError(message) {
        // Use browser alert as fallback, can be enhanced with custom UI
        alert(message);
    }
}