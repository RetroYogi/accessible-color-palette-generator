/**
 * WCAG Color Palette Generator v0.6
 * Accessibility utilities and keyboard navigation
 */

/**
 * Accessibility utilities class
 */
export class AccessibilityUtils {
    constructor() {
        this.isKeyboardUser = false;
        this.setupKeyboardDetection();
        this.setupKeyboardShortcuts();
        this.setupFocusManagement();
    }

    /**
     * Setup keyboard user detection for enhanced focus indicators
     */
    setupKeyboardDetection() {
        // Detect keyboard navigation
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-user');
            this.isKeyboardUser = false;
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-user');
                this.isKeyboardUser = true;
            }
        });
    }

    /**
     * Setup keyboard shortcuts for the application
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only process shortcuts when not in form inputs
            if (this.isInFormElement(e.target)) return;

            const shortcuts = {
                'h': () => this.toggleHistory(),
                'g': () => this.generatePalette(),
                'e': () => this.exportPalette(e.shiftKey ? 'json' : 'css'),
                'c': () => this.copyFirstColor(),
                '?': () => this.showKeyboardShortcuts(),
                'Escape': () => this.handleEscape()
            };

            const handler = shortcuts[e.key.toLowerCase()] || shortcuts[e.key];
            if (handler) {
                e.preventDefault();
                handler();
            }
        });
    }

    /**
     * Setup focus management for better accessibility
     */
    setupFocusManagement() {
        // Ensure skip link functionality
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) {
            skipLink.addEventListener('click', (e) => {
                e.preventDefault();
                const mainContent = document.getElementById('main-content');
                if (mainContent) {
                    mainContent.focus();
                    mainContent.scrollIntoView();
                }
            });
        }

        // Manage focus for dynamically generated content
        this.setupDynamicFocusManagement();
    }

    /**
     * Setup focus management for dynamic content
     */
    setupDynamicFocusManagement() {
        // Create mutation observer to handle focus for new content
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    this.enhanceNewElements(mutation.addedNodes);
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Enhance newly added elements with accessibility features
     * @param {NodeList} nodes - Added nodes
     */
    enhanceNewElements(nodes) {
        nodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                // Add keyboard support to clickable elements
                const clickables = node.querySelectorAll('[onclick]:not([tabindex])');
                clickables.forEach(el => {
                    if (!el.getAttribute('tabindex')) {
                        el.setAttribute('tabindex', '0');
                    }
                    
                    if (!el.hasAttribute('onkeypress')) {
                        el.addEventListener('keypress', (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                el.click();
                            }
                        });
                    }
                });

                // Enhance color swatches with better accessibility
                const colorSwatches = node.querySelectorAll('.color-swatch');
                colorSwatches.forEach(swatch => this.enhanceColorSwatch(swatch));
            }
        });
    }

    /**
     * Enhance color swatch accessibility
     * @param {HTMLElement} swatch - Color swatch element
     */
    enhanceColorSwatch(swatch) {
        // Ensure proper ARIA attributes
        if (!swatch.getAttribute('role')) {
            swatch.setAttribute('role', 'button');
        }

        // Add keyboard navigation
        if (!swatch.getAttribute('tabindex')) {
            swatch.setAttribute('tabindex', '0');
        }

        // Enhance aria-label with color information
        const backgroundColor = swatch.style.backgroundColor;
        if (backgroundColor) {
            const currentLabel = swatch.getAttribute('aria-label') || '';
            if (!currentLabel.includes('background')) {
                swatch.setAttribute('aria-label', 
                    `${currentLabel}. Background color: ${backgroundColor}`.trim());
            }
        }

        // Add keyboard event handling if not present
        if (!swatch.dataset.keyboardEnhanced) {
            swatch.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    swatch.click();
                }
            });
            swatch.dataset.keyboardEnhanced = 'true';
        }
    }

    /**
     * Check if element is a form input element
     * @param {HTMLElement} element - Element to check
     * @returns {boolean} Whether element is a form input
     */
    isInFormElement(element) {
        const formElements = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'];
        return formElements.includes(element.tagName) || 
               element.contentEditable === 'true';
    }

    /**
     * Toggle history panel via keyboard shortcut
     */
    toggleHistory() {
        if (window.toggleHistory && typeof window.toggleHistory === 'function') {
            window.toggleHistory();
        } else {
            const event = new CustomEvent('toggleHistory');
            document.dispatchEvent(event);
        }
    }

    /**
     * Generate palette via keyboard shortcut
     */
    generatePalette() {
        if (window.generatePalette && typeof window.generatePalette === 'function') {
            window.generatePalette();
        } else {
            const event = new CustomEvent('generatePalette');
            document.dispatchEvent(event);
        }
    }

    /**
     * Export palette via keyboard shortcut
     * @param {string} format - Export format
     */
    exportPalette(format) {
        if (window.exportPalette && typeof window.exportPalette === 'function') {
            window.exportPalette(format);
        } else {
            const event = new CustomEvent('exportPalette', { detail: { format } });
            document.dispatchEvent(event);
        }
    }

    /**
     * Copy first color via keyboard shortcut
     */
    copyFirstColor() {
        const firstSwatch = document.querySelector('.color-swatch');
        if (firstSwatch) {
            firstSwatch.click();
        }
    }

    /**
     * Handle Escape key press
     */
    handleEscape() {
        // Close any open panels
        const historyPanel = document.getElementById('historyPanel');
        if (historyPanel?.classList.contains('show')) {
            if (window.toggleHistory) {
                window.toggleHistory();
            }
            return;
        }

        // Remove focus from current element
        if (document.activeElement && document.activeElement !== document.body) {
            document.activeElement.blur();
        }
    }

    /**
     * Show keyboard shortcuts dialog
     */
    showKeyboardShortcuts() {
        const shortcuts = `
Keyboard Shortcuts for WCAG Color Palette Generator:

Navigation:
• Tab: Navigate through interactive elements
• Shift+Tab: Navigate backwards
• Enter/Space: Activate buttons and controls
• Arrow keys: Navigate dropdown menus
• Escape: Close panels or remove focus

Application Shortcuts:
• H: Toggle palette history panel
• G: Generate new palette
• E: Export palette as CSS
• Shift+E: Export palette as JSON
• C: Copy first color to clipboard
• ?: Show this help dialog

Accessibility Features:
• Skip link (Tab from top): Jump to main content
• High contrast mode support
• Screen reader compatible
• Keyboard-only navigation
• Focus indicators for keyboard users

Form Controls:
• All dropdowns and inputs support keyboard navigation
• Color picker opens with Enter/Space
• Settings auto-save and regenerate palette

Tips:
• Use Tab to discover all interactive elements
• Color swatches have enhanced keyboard support
• History items can be navigated and activated with keyboard
• All functionality available without mouse
        `;

        // Create accessible modal dialog
        this.showAccessibleDialog('Keyboard Shortcuts', shortcuts);
    }

    /**
     * Show accessibility information
     */
    showAccessibilityInfo() {
        const info = `
Accessibility Statement for WCAG Color Palette Generator:

This tool is designed to be fully accessible and includes:

Standards Compliance:
• WCAG 2.1 AA compliant interface design
• Section 508 compatible
• Full keyboard navigation support
• Screen reader compatible with ARIA labels

Navigation Features:
• Skip link to main content
• Logical tab order throughout interface
• Keyboard shortcuts for common actions
• Focus indicators for keyboard users
• Semantic HTML structure with proper headings

Interactive Elements:
• All buttons and controls keyboard accessible
• Form labels and help text for all inputs
• ARIA roles and properties where needed
• Live regions for dynamic content updates
• High contrast mode support

Generated Colors:
• All generated colors meet specified WCAG contrast requirements
• Color information provided in multiple formats (HEX, RGB, HSL)
• Visual and text-based contrast ratio information
• Accessibility level badges (AA/AAA/FAIL)
• Text previews showing actual contrast

Export Features:
• Accessible file export in CSS and JSON formats
• Color information preserved in multiple formats
• Usage examples included in CSS exports

Browser Support:
• Works across all modern browsers
• Progressive enhancement approach
• Graceful fallbacks for edge cases
• Mobile and desktop responsive design

If you encounter any accessibility issues, please report them through our feedback system.
        `;

        this.showAccessibleDialog('Accessibility Statement', info);
    }

    /**
     * Show accessible dialog
     * @param {string} title - Dialog title
     * @param {string} content - Dialog content
     */
    showAccessibleDialog(title, content) {
        // Simple alert fallback - in a real implementation, 
        // you'd want a proper modal dialog with proper ARIA attributes
        alert(`${title}\n\n${content}`);
        
        // TODO: Implement proper modal dialog with:
        // - role="dialog"
        // - aria-labelledby and aria-describedby
        // - focus trap
        // - escape key handling
        // - focus return to trigger element
    }

    /**
     * Announce content to screen readers
     * @param {string} message - Message to announce
     * @param {string} priority - Announcement priority ('polite' or 'assertive')
     */
    announceToScreenReader(message, priority = 'polite') {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', priority);
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        // Remove after announcement
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    /**
     * Manage focus for palette generation
     */
    managePaletteGenerationFocus() {
        // Announce palette generation completion
        this.announceToScreenReader(
            'New color palette generated successfully. Navigate to view colors.',
            'assertive'
        );

        // Optionally focus first color for immediate interaction
        setTimeout(() => {
            const firstColor = document.querySelector('.color-swatch');
            if (firstColor && this.isKeyboardUser) {
                firstColor.focus();
            }
        }, 500);
    }

    /**
     * Enhance copy feedback for accessibility
     * @param {string} copiedText - Text that was copied
     */
    enhanceCopyFeedback(copiedText) {
        // Visual notification is handled elsewhere
        // This adds screen reader announcement
        this.announceToScreenReader(
            `Color ${copiedText} copied to clipboard`,
            'assertive'
        );
    }
}

/**
 * Copy color to clipboard with accessibility enhancements
 * @param {string} text - Text to copy
 */
export function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Show visual notification
        const notification = document.getElementById('copyNotification');
        if (notification) {
            notification.textContent = `${text} copied to clipboard!`;
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }

        // Announce to screen readers
        if (window.accessibilityUtils) {
            window.accessibilityUtils.enhanceCopyFeedback(text);
        }
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy color. Please try again.');
    });
}

// Make copyToClipboard globally available for inline event handlers
window.copyToClipboard = copyToClipboard;