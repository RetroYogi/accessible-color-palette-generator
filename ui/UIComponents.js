/**
 * WCAG Color Palette Generator v0.6
 * UI component generation and management
 */

import { ColorUtil } from '../core/ColorUtil.js';

/**
 * UI component generator class
 */
export class UIComponents {
    constructor() {
        this.elements = {
            basePalette: document.getElementById('basePalette'),
            optimizedPalettes: document.getElementById('optimizedPalettes'),
            harmonyInfo: document.getElementById('harmonyInfo'),
            copyNotification: document.getElementById('copyNotification')
        };
    }

    /**
     * Display simplified base palette (only HEX values, no RGB/HSL)
     * @param {ColorUtil[]} colors - Array of base colors
     * @param {string} wcagLevel - WCAG level for display
     */
    displayBasePalette(colors, wcagLevel) {
        if (!this.elements.basePalette) return;
        
        this.elements.basePalette.innerHTML = '';

        colors.forEach((color, index) => {
            const colorCard = this.createSimplifiedBaseColorCard(color, index);
            colorCard.classList.add('palette-item');
            this.elements.basePalette.appendChild(colorCard);
        });
    }

    /**
     * Create simplified base color card with only essential information
     * @param {ColorUtil} color - Color object
     * @param {number} index - Color index
     * @returns {HTMLElement} Color card element
     */
    createSimplifiedBaseColorCard(color, index) {
        const hex = color.hex;

        const cardCol = document.createElement('div');
        cardCol.className = 'col';
        cardCol.innerHTML = `
            <div class="card h-100 shadow-sm base-palette-card">
                <div class="color-swatch" 
                     style="background-color: ${hex}" 
                     onclick="copyToClipboard('${hex}')"
                     role="button"
                     tabindex="0"
                     aria-label="Color ${index + 1}: ${hex}. Click to copy"
                     onkeypress="if(event.key==='Enter') copyToClipboard('${hex}')">
                </div>
                <div class="card-body">
                    <h3 class="card-title h6"><code>${hex}</code></h3>
                </div>
            </div>
        `;

        return cardCol;
    }

    /**
     * Display optimized palettes with compact layout
     * @param {ColorUtil[]} baseColors - Base color palette
     * @param {ColorUtil[]} lightColors - Light optimized palette
     * @param {ColorUtil[]} darkColors - Dark optimized palette
     * @param {string} wcagLevel - WCAG level
     */
    displayOptimizedPalettes(baseColors, lightColors, darkColors, wcagLevel) {
        if (!this.elements.optimizedPalettes) return;
        
        const container = this.elements.optimizedPalettes;
        container.innerHTML = '';

        const targetRatio = wcagLevel === 'AAA' ? 7 : 4.5;

        // Create light optimized section
        const lightSection = this.createCompactOptimizedSection(
            'Light Background Optimized',
            'lightOptimizedColors',
            baseColors,
            lightColors,
            targetRatio,
            'light'
        );
        container.appendChild(lightSection);

        // Create dark optimized section
        const darkSection = this.createCompactOptimizedSection(
            'Dark Background Optimized',
            'darkOptimizedColors',
            baseColors,
            darkColors,
            targetRatio,
            'dark'
        );
        container.appendChild(darkSection);
    }

    /**
     * Create compact optimized section for light or dark background
     * @param {string} title - Section title
     * @param {string} containerId - Container ID
     * @param {ColorUtil[]} baseColors - Base colors
     * @param {ColorUtil[]} optimizedColors - Optimized colors
     * @param {number} targetRatio - Target contrast ratio
     * @param {string} backgroundType - 'light' or 'dark'
     * @returns {HTMLElement} Section element
     */
    createCompactOptimizedSection(title, containerId, baseColors, optimizedColors, targetRatio, backgroundType) {
        const section = document.createElement('div');
        section.className = 'col-12 mb-3';
        section.innerHTML = `
            <h3 class="h6 mb-2 text-primary">${title}</h3>
            <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-5 g-2" id="${containerId}"></div>
        `;

        const container = section.querySelector(`#${containerId}`);
        
        optimizedColors.forEach((optimizedColor, index) => {
            const baseColor = baseColors[index];
            const cardCol = document.createElement('div');
            cardCol.className = 'col';
            cardCol.innerHTML = this.createCompactOptimizedColorCard(
                baseColor, 
                optimizedColor, 
                index, 
                targetRatio, 
                backgroundType
            );
            cardCol.classList.add('palette-item');
            container.appendChild(cardCol);
        });

        return section;
    }

    /**
     * Create compact optimized color card
     * @param {ColorUtil} baseColor - Base color
     * @param {ColorUtil} optimizedColor - Optimized color
     * @param {number} index - Color index
     * @param {number} targetRatio - Target contrast ratio
     * @param {string} backgroundType - 'light' or 'dark'
     * @returns {string} HTML string for color card
     */
    createCompactOptimizedColorCard(baseColor, optimizedColor, index, targetRatio, backgroundType) {
        const backgroundColor = backgroundType === 'light' ? '#ffffff' : '#2c3e50';
        const backgroundColorObj = new ColorUtil(backgroundColor);
        
        const contrast = optimizedColor.getContrastRatio(backgroundColorObj);
        const level = this.getAccessibilityLevel(contrast);
        const badgeClass = this.getBadgeClass(level);

        return `
            <div class="card h-100 shadow-sm">
                <div class="color-swatch" 
                     style="background-color: ${optimizedColor.hex}" 
                     onclick="copyToClipboard('${optimizedColor.hex}')"
                     role="button"
                     tabindex="0"
                     aria-label="${backgroundType} optimized color ${index + 1}: ${optimizedColor.hex}. Click to copy"
                     onkeypress="if(event.key==='Enter') copyToClipboard('${optimizedColor.hex}')">
                    <div class="accessibility-badge ${badgeClass}">${level}</div>
                </div>
                
                <div class="card-body">
                    ${this.createCompactPreviewSection(backgroundColor, optimizedColor)}
                    ${this.createCompactContrastInfo(optimizedColor, contrast, targetRatio)}
                </div>
            </div>
        `;
    }

    /**
     * Create compact preview section for color card
     * @param {string} backgroundColor - Background color hex
     * @param {ColorUtil} optimizedColor - Optimized color
     * @returns {string} HTML string for preview section
     */
    createCompactPreviewSection(backgroundColor, optimizedColor) {
        return `
            <div class="optimized-preview" style="background-color: ${backgroundColor}; color: ${optimizedColor.hex}; border: 1px solid #dee2e6; padding: 0.5rem; border-radius: 0.25rem; margin-bottom: 0.5rem;">
                <p class="preview-text preview-heading" style="font-size: 1rem; font-weight: bold; margin: 0 0 0.2rem 0;">Heading</p>
                <p class="preview-text preview-body" style="font-size: 0.875rem; margin: 0 0 0.2rem 0;">Body text</p>
                <p class="preview-text preview-small" style="font-size: 0.75rem; margin: 0;">Small text</p>
            </div>
        `;
    }

    /**
     * Create compact contrast information section
     * @param {ColorUtil} optimizedColor - Optimized color
     * @param {number} contrast - Contrast ratio
     * @param {number} targetRatio - Target contrast ratio
     * @returns {string} HTML string for contrast info
     */
    createCompactContrastInfo(optimizedColor, contrast, targetRatio) {
        const contrastStatus = contrast >= targetRatio ? '✓' : `(${targetRatio}:1)`;
        
        return `
            <div class="contrast-info">
                <strong>${optimizedColor.hex}</strong><br>
                <strong>Contrast:</strong> ${contrast.toFixed(1)}:1 ${contrastStatus}
            </div>
        `;
    }

    /**
     * Get accessibility level based on contrast ratio
     * @param {number} contrast - Contrast ratio
     * @returns {string} Accessibility level ('AAA', 'AA', or 'FAIL')
     */
    getAccessibilityLevel(contrast) {
        if (contrast >= 7) return 'AAA';
        if (contrast >= 4.5) return 'AA';
        return 'FAIL';
    }

    /**
     * Get CSS class for accessibility badge
     * @param {string} level - Accessibility level
     * @returns {string} CSS class name
     */
    getBadgeClass(level) {
        const classes = {
            'AAA': 'aaa-badge',
            'AA': 'aa-badge',
            'FAIL': 'fail-badge'
        };
        return classes[level] || 'fail-badge';
    }

    /**
     * Update harmony information display (UPDATED for merged layout)
     * @param {string} harmonyType - Type of harmony
     * @param {string} description - Harmony description
     */
    updateHarmonyInfo(harmonyType, description) {
        if (!this.elements.harmonyInfo) return;
        
        // Updated for the new merged layout structure
        this.elements.harmonyInfo.innerHTML = `
            <div class="harmony-type">${harmonyType.charAt(0).toUpperCase() + harmonyType.slice(1)} Harmony</div>
            <div class="harmony-description">${description}</div>
        `;
    }

    /**
     * Show copy notification with compact styling
     * @param {string} text - Text that was copied
     */
    showCopyNotification(text) {
        if (!this.elements.copyNotification) return;
        
        const notification = this.elements.copyNotification;
        notification.textContent = `${text} copied!`;
        notification.classList.add('show');
        
        notification.setAttribute('aria-live', 'assertive');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    }

    /**
     * Show loading indicator
     * @param {boolean} show - Whether to show loading
     */
    showLoading(show) {
        const loading = document.querySelector('.loading');
        if (!loading) return;
        
        if (show) {
            loading.classList.add('show');
        } else {
            loading.classList.remove('show');
        }
    }

    /**
     * Update base color preview
     * @param {string} color - Color hex value
     */
    updateBaseColorPreview(color) {
        const preview = document.getElementById('baseColorPreview');
        const value = document.getElementById('baseColorValue');
        
        if (preview) {
            preview.style.backgroundColor = color;
        }
        if (value) {
            value.textContent = color.toUpperCase();
        }
    }
}