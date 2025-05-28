/**
 * WCAG Color Palette Generator v0.6
 * Color harmony algorithms based on color theory
 */

/**
 * Color harmony algorithms based on color theory
 * Generate hue relationships for different harmony types
 */
export const colorHarmonies = {
    /**
     * Generate complementary color harmony (opposite colors on color wheel)
     * @param {number} hue - Base hue value (0-360)
     * @returns {number[]} Array of hue values
     */
    complementary: (hue) => [hue, (hue + 180) % 360],

    /**
     * Generate triadic color harmony (three colors 120° apart)
     * @param {number} hue - Base hue value (0-360)
     * @returns {number[]} Array of hue values
     */
    triadic: (hue) => [hue, (hue + 120) % 360, (hue + 240) % 360],

    /**
     * Generate analogous color harmony (adjacent colors on color wheel)
     * @param {number} hue - Base hue value (0-360)
     * @returns {number[]} Array of hue values
     */
    analogous: (hue) => [
        hue, 
        (hue + 25) % 360, 
        (hue + 50) % 360, 
        (hue - 25 + 360) % 360, 
        (hue - 50 + 360) % 360
    ],

    /**
     * Generate monochromatic color harmony (same hue, different saturation/lightness)
     * @param {number} hue - Base hue value (0-360)
     * @returns {number[]} Array of hue values (all same)
     */
    monochromatic: (hue) => [hue, hue, hue, hue, hue],

    /**
     * Generate tetradic color harmony (four colors 90° apart)
     * @param {number} hue - Base hue value (0-360)
     * @returns {number[]} Array of hue values
     */
    tetradic: (hue) => [hue, (hue + 90) % 360, (hue + 180) % 360, (hue + 270) % 360]
};

/**
 * Get description for a harmony type
 * @param {string} harmonyType - Type of harmony
 * @returns {string} Description of the harmony
 */
export function getHarmonyDescription(harmonyType) {
    const descriptions = {
        complementary: "Colors opposite each other on the color wheel, creating high contrast and vibrant looks. Perfect for drawing attention and creating visual impact.",
        triadic: "Three colors evenly spaced around the color wheel (120° apart), offering strong visual contrast while retaining harmony and balance.",
        analogous: "Colors adjacent on the color wheel (25-50° apart), creating serene and comfortable designs with natural flow and subtle variations.",
        monochromatic: "Variations of a single hue using different lightness and saturation levels, creating sophisticated, cohesive designs with strong unity.",
        tetradic: "Four colors forming a rectangle on the color wheel (90° apart), offering rich contrasts with balanced harmony for complex color schemes."
    };

    return descriptions[harmonyType] || "Unknown harmony type";
}

/**
 * Get all available harmony types
 * @returns {string[]} Array of harmony type names
 */
export function getAvailableHarmonyTypes() {
    return Object.keys(colorHarmonies);
}