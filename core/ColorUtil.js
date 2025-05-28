/**
 * WCAG Color Palette Generator v0.6
 * Color utility class for color manipulation and calculations
 */

/**
 * Color utility class for color manipulation and calculations
 * Handles conversion between color formats and contrast calculations
 */
export class ColorUtil {
    constructor(color) {
        if (typeof color === 'string') {
            if (color.startsWith('#')) {
                this.hex = color;
                this.rgb = this.hexToRgb(color);
                this.hsl = this.rgbToHsl(this.rgb.r, this.rgb.g, this.rgb.b);
            }
        } else if (color.type === 'hsl') {
            this.hsl = color;
            this.rgb = this.hslToRgb(color.h, color.s, color.l);
            this.hex = this.rgbToHex(this.rgb.r, this.rgb.g, this.rgb.b);
        }
    }

    static fromHsl(h, s, l) {
        return new ColorUtil({type: 'hsl', h, s, l});
    }

    /**
     * Convert hex color to RGB
     * @param {string} hex - Hex color value
     * @returns {Object} RGB color object
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    /**
     * Convert RGB to hex color
     * @param {number} r - Red value (0-255)
     * @param {number} g - Green value (0-255)
     * @param {number} b - Blue value (0-255)
     * @returns {string} Hex color value
     */
    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1);
    }

    /**
     * Convert RGB to HSL
     * @param {number} r - Red value (0-255)
     * @param {number} g - Green value (0-255)
     * @param {number} b - Blue value (0-255)
     * @returns {Object} HSL color object
     */
    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return {h: h * 360, s: s * 100, l: l * 100};
    }

    /**
     * Convert HSL to RGB
     * @param {number} h - Hue (0-360)
     * @param {number} s - Saturation (0-100)
     * @param {number} l - Lightness (0-100)
     * @returns {Object} RGB color object
     */
    hslToRgb(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;
        
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        let r, g, b;
        if (s === 0) {
            r = g = b = l;
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return {r: r * 255, g: g * 255, b: b * 255};
    }

    /**
     * Calculate relative luminance according to WCAG guidelines
     * @returns {number} Relative luminance value
     */
    getLuminance() {
        const {r, g, b} = this.rgb;
        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }

    /**
     * Calculate contrast ratio between two colors according to WCAG
     * @param {ColorUtil} otherColor - The other color to compare against
     * @returns {number} Contrast ratio
     */
    getContrastRatio(otherColor) {
        const lum1 = this.getLuminance();
        const lum2 = otherColor.getLuminance();
        const brightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);
        return (brightest + 0.05) / (darkest + 0.05);
    }

    /**
     * Check if color meets WCAG contrast requirements
     * @param {ColorUtil} backgroundColor - Background color
     * @param {string} level - WCAG level ('AA' or 'AAA')
     * @returns {boolean} Whether contrast requirement is met
     */
    meetsWCAGContrast(backgroundColor, level = 'AA') {
        const ratio = this.getContrastRatio(backgroundColor);
        const requiredRatio = level === 'AAA' ? 7 : 4.5;
        return ratio >= requiredRatio;
    }

    toString() {
        return this.hex;
    }
}