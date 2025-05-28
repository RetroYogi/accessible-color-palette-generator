/**
 * WCAG Color Palette Generator v0.6
 * Main application entry point
 */

import { ColorUtil } from './core/ColorUtil.js';
import { colorHarmonies, getHarmonyDescription } from './core/ColorHarmonies.js';
import { StateManager, stateManager } from './core/StateManager.js';
import { PaletteGenerator } from './generators/PaletteGenerator.js';
import { UIComponents } from './ui/UIComponents.js';
import { ExportManager } from './utils/ExportManager.js';
import { HistoryManager } from './utils/HistoryManager.js';
import { AccessibilityUtils } from './utils/AccessibilityUtils.js';

/**
 * Main application class - Updated for simplified differentiation
 */
class ColorPaletteApp {
    constructor() {
        this.stateManager = stateManager;
        this.paletteGenerator = new PaletteGenerator();
        this.uiComponents = new UIComponents();
        this.exportManager = new ExportManager();
        this.historyManager = null;
        this.accessibilityUtils = new AccessibilityUtils();
        
        this.isInitialized = false;
        this.debounceTimeout = null;
        
        this.setupGlobalFunctions();
        this.setupEventListeners();
        this.setupStateSubscriptions();
    }

    /**
     * Initialize the application
     */
    async initialize() {
        if (this.isInitialized) return;
        
        try {
            console.log('Initializing WCAG Color Palette Generator v0.6...');
            
            await this.waitForDOM();
            
            this.historyManager = new HistoryManager(this.stateManager);
            this.setupHistoryFunctions();
            
            await this.loadInitialSettings();
            await this.generatePalette();
            
            this.isInitialized = true;
            console.log('✅ Application initialized successfully');
            
        } catch (error) {
            console.error('Initialization failed:', error);
            this.showErrorMessage('Failed to initialize application. Please refresh the page.');
        }
    }

    /**
     * Wait for DOM to be ready
     */
    async waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve);
            }
        });
    }

    /**
     * Setup simplified global functions
     */
    setupGlobalFunctions() {
        // Enhanced history toggle with proper mobile support
        window.toggleHistory = () => {
            const panel = document.getElementById('historyPanel');
            const toggle = document.querySelector('.history-toggle');
            
            if (!panel) {
                console.error('History panel not found');
                return;
            }
            
            const isCurrentlyVisible = panel.classList.contains('show');
            const isMobile = window.innerWidth <= 768;
            
            console.log(`Toggle history - Currently visible: ${isCurrentlyVisible}, Mobile: ${isMobile}`);
            
            if (isCurrentlyVisible) {
                // Hide the panel
                panel.classList.remove('show');
                panel.setAttribute('aria-hidden', 'true');
                
                if (toggle) {
                    toggle.setAttribute('aria-expanded', 'false');
                }
                
                console.log('History panel hidden');
            } else {
                // Show the panel - update content first
                this.updateHistoryDisplay();
                
                // Add show class
                panel.classList.add('show');
                panel.setAttribute('aria-hidden', 'false');
                
                if (toggle) {
                    toggle.setAttribute('aria-expanded', 'true');
                }
                
                console.log('History panel shown');
            }
        };

        // Simplified click outside handler
        let clickOutsideHandler = null;
        
        const setupClickOutside = () => {
            if (clickOutsideHandler) {
                document.removeEventListener('click', clickOutsideHandler);
                document.removeEventListener('touchend', clickOutsideHandler);
            }
            
            clickOutsideHandler = (event) => {
                const panel = document.getElementById('historyPanel');
                const toggle = document.querySelector('.history-toggle');
                
                if (!panel || !toggle) return;
                
                const isVisible = panel.classList.contains('show');
                
                // Only close if panel is visible and click is outside both panel and toggle
                if (isVisible && 
                    !panel.contains(event.target) && 
                    !toggle.contains(event.target)) {
                    
                    console.log('Clicked outside history panel, closing');
                    window.toggleHistory();
                }
            };
            
            document.addEventListener('click', clickOutsideHandler);
            document.addEventListener('touchend', clickOutsideHandler);
        };
        
        setupClickOutside();

        // Viewport resize handler
        window.addEventListener('resize', () => {
            // Re-setup click outside handler on resize
            setupClickOutside();
        });

        // Existing global functions...
        window.generatePalette = () => this.generatePalette();
        window.exportPalette = (format) => this.handleExport(format);
        window.updateBaseColorPreview = (color) => this.uiComponents.updateBaseColorPreview(color);
        window.showKeyboardShortcuts = () => this.accessibilityUtils.showKeyboardShortcuts();
        window.showAccessibilityInfo = () => this.accessibilityUtils.showAccessibilityInfo();
        
        window.colorPaletteApp = this;
    }


    /**
     * Setup simplified history functions
     */
    setupHistoryFunctions() {
        window.loadHistoryItem = (index) => {
            const history = this.stateManager.getState('paletteHistory') || [];
            const item = history[index];
            
            if (!item) {
                console.error(`History item ${index} not found`);
                return;
            }
            
            this.updateFormFromSettings(item.settings);
            this.stateManager.updateSettings(item.settings);
            
            window.toggleHistory();
            setTimeout(() => this.generatePalette(), 100);
            
            this.showNotification('Palette loaded from history', 'success');
        };
    }

    /**
     * Simplified history display update
     */
    updateHistoryDisplay() {
        const historyContent = document.getElementById('historyContent');
        if (!historyContent) return;
        
        const history = this.stateManager.getState('paletteHistory') || [];
        
        if (history.length === 0) {
            historyContent.innerHTML = '<p class="text-muted small">No palettes generated yet.</p>';
            return;
        }
        
        const historyHTML = history.map((item, index) => {
            const colorSwatches = item.palette.map(color => 
                `<div class="history-color" style="background-color: ${color.hex};" title="${color.hex}"></div>`
            ).join('');
            
            const timeAgo = this.formatTimeAgo(item.timestamp);
            const settings = `${item.settings.harmonyType} • ${item.settings.wcagLevel} • ${item.settings.paletteSize}`;
            
            return `
                <div class="history-item" 
                    data-index="${index}" 
                    onclick="window.loadHistoryItem(${index})"
                    style="cursor: pointer; user-select: none;"
                    role="button"
                    tabindex="0"
                    aria-label="Load palette from ${timeAgo}"
                    onkeypress="if(event.key==='Enter' || event.key===' ') { event.preventDefault(); window.loadHistoryItem(${index}); }">
                    <div class="history-colors">${colorSwatches}</div>
                    <div class="history-info">
                        <div class="time">${timeAgo}</div>
                        <div class="settings">${settings}</div>
                    </div>
                </div>
            `;
        }).join('');
        
        historyContent.innerHTML = historyHTML;
        
        console.log(`History display updated with ${history.length} items`);
}
    /**
     * Format timestamp to relative time
     */
    formatTimeAgo(timestamp) {
        const now = new Date();
        const diffMs = now - new Date(timestamp);
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return new Date(timestamp).toLocaleDateString();
    }

    /**
     * Load initial settings from form
     */
    async loadInitialSettings() {
        const formSettings = this.getFormSettings();
        this.stateManager.updateSettings(formSettings);
        this.updateUIFromState();
    }

    /**
     * Get current form settings (simplified - no sliders)
     */
    getFormSettings() {
        return {
            paletteSize: parseInt(document.getElementById('paletteSize')?.value || 5),
            wcagLevel: document.getElementById('wcagLevel')?.value || 'AA',
            harmonyType: document.getElementById('harmonyType')?.value || 'triadic',
            baseColor: document.getElementById('baseColor')?.value || '#5500AA',
            differentiationSettings: {
                enabled: document.getElementById('differentiationEnabled')?.checked ?? true,
                minHueDifference: 60,        // Fixed maximum value
                minLuminanceDifference: 30   // Fixed maximum value
            }
        };
    }

    /**
     * Update form from settings object (simplified)
     */
    updateFormFromSettings(settings) {
        const elements = {
            paletteSize: document.getElementById('paletteSize'),
            wcagLevel: document.getElementById('wcagLevel'),
            harmonyType: document.getElementById('harmonyType'),
            baseColor: document.getElementById('baseColor'),
            differentiationEnabled: document.getElementById('differentiationEnabled')
        };

        // Update basic settings
        Object.entries(settings).forEach(([key, value]) => {
            if (key === 'differentiationSettings') return;
            const element = elements[key];
            if (element && value !== undefined) {
                element.value = value;
            }
        });

        // Update differentiation settings (only enabled flag)
        if (settings.differentiationSettings && elements.differentiationEnabled) {
            elements.differentiationEnabled.checked = settings.differentiationSettings.enabled;
            this.updateDifferentiationStatus(settings.differentiationSettings.enabled);
        }

        // Update base color preview
        if (settings.baseColor) {
            this.uiComponents.updateBaseColorPreview(settings.baseColor);
        }
    }

    /**
     * Update differentiation status display
     */
    updateDifferentiationStatus(enabled) {
        const statusElement = document.getElementById('differentiationStatus');
        if (statusElement) {
            statusElement.textContent = enabled ? 'Active' : 'Disabled';
            statusElement.className = enabled ? 
                'fw-semibold differentiation-status-active' : 
                'fw-semibold differentiation-status-inactive';
        }
    }

    /**
     * Update UI from current state
     */
    updateUIFromState() {
        const settings = this.stateManager.getState('settings');
        
        const elements = {
            paletteSize: document.getElementById('paletteSize'),
            wcagLevel: document.getElementById('wcagLevel'),
            harmonyType: document.getElementById('harmonyType'),
            baseColor: document.getElementById('baseColor')
        };

        Object.entries(settings).forEach(([key, value]) => {
            if (key === 'differentiationSettings') return;
            const element = elements[key];
            if (element && element.value !== value) {
                element.value = value;
            }
        });

        this.updateDifferentiationUI(settings.differentiationSettings);
        this.uiComponents.updateBaseColorPreview(settings.baseColor);
    }

    /**
     * Update differentiation UI elements (simplified)
     */
    updateDifferentiationUI(differentiationSettings) {
        const enabledToggle = document.getElementById('differentiationEnabled');

        if (enabledToggle) {
            enabledToggle.checked = differentiationSettings.enabled;
        }

        this.updateDifferentiationStatus(differentiationSettings.enabled);
    }

    /**
     * Setup streamlined event listeners (no sliders)
     */
    setupEventListeners() {
        // Basic form controls
        const controlIds = ['paletteSize', 'wcagLevel', 'harmonyType'];
        controlIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.handleSettingsChange());
            }
        });

        // Base color with debouncing
        const baseColorInput = document.getElementById('baseColor');
        if (baseColorInput) {
            baseColorInput.addEventListener('input', (e) => {
                this.uiComponents.updateBaseColorPreview(e.target.value);
                this.debouncedSettingsChange();
            });
        }

        // Differentiation toggle (simplified - no sliders)
        this.setupDifferentiationEventListeners();
    }

    /**
     * Setup differentiation event listeners (simplified - toggle only)
     */
    setupDifferentiationEventListeners() {
        const enabledToggle = document.getElementById('differentiationEnabled');
        if (enabledToggle) {
            enabledToggle.addEventListener('change', () => this.handleDifferentiationChange());
        }
    }

    /**
     * Setup state subscriptions
     */
    setupStateSubscriptions() {
        // Subscribe to palette history changes
        this.stateManager.subscribe('paletteHistory', () => {
            const panel = document.getElementById('historyPanel');
            if (panel && panel.classList.contains('show')) {
                this.updateHistoryDisplay();
            }
        });

        // Subscribe to loading state
        this.stateManager.subscribe('isLoading', (isLoading) => {
            this.uiComponents.showLoading(isLoading);
        });
    }

    /**
     * Handle settings changes (generates new palette and adds to history)
     */
    async handleSettingsChange() {
        try {
            const newSettings = this.getFormSettings();
            this.stateManager.updateSettings(newSettings);
            await this.generatePalette();
        } catch (error) {
            console.error('Settings change error:', error);
            this.showErrorMessage('Failed to update settings');
        }
    }

    /**
     * Handle differentiation changes (NO HISTORY UPDATE)
     */
    handleDifferentiationChange() {
        const differentiationSettings = {
            enabled: document.getElementById('differentiationEnabled')?.checked ?? true,
            minHueDifference: 60,        // Fixed maximum value
            minLuminanceDifference: 30   // Fixed maximum value
        };
        
        this.stateManager.updateDifferentiationSettings(differentiationSettings);
        this.updateDifferentiationStatus(differentiationSettings.enabled);
        
        // Generate palette but DON'T add to history
        this.generatePaletteWithoutHistory();
    }

    /**
     * Generate palette without adding to history (for differentiation toggle)
     */
    async generatePaletteWithoutHistory() {
        const settings = this.stateManager.getState('settings');
        
        this.stateManager.setLoading(true);
        
        try {
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const palettes = this.paletteGenerator.generatePalette(settings);
            
            this.stateManager.setPalettes(palettes);
            this.displayPalettes(palettes, settings.wcagLevel);
            
            const harmonyDescription = getHarmonyDescription(settings.harmonyType);
            this.uiComponents.updateHarmonyInfo(settings.harmonyType, harmonyDescription);
            
            // NOTE: NO history addition here - that's the key difference
            
        } catch (error) {
            console.error('Palette generation error:', error);
            this.showErrorMessage('Failed to generate palette');
        } finally {
            this.stateManager.setLoading(false);
        }
    }

    /**
     * Debounced settings change
     */
    debouncedSettingsChange() {
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }
        
        this.debounceTimeout = setTimeout(() => {
            this.handleSettingsChange();
        }, 300);
    }

    /**
     * Generate new palette (with history update)
     */
    async generatePalette() {
        const settings = this.stateManager.getState('settings');
        
        this.stateManager.setLoading(true);
        
        try {
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const palettes = this.paletteGenerator.generatePalette(settings);
            
            this.stateManager.setPalettes(palettes);
            this.displayPalettes(palettes, settings.wcagLevel);
            
            const harmonyDescription = getHarmonyDescription(settings.harmonyType);
            this.uiComponents.updateHarmonyInfo(settings.harmonyType, harmonyDescription);
            
            // Add to history (this is what differentiation toggle skips)
            this.stateManager.addToHistory(palettes.base);
            
        } catch (error) {
            console.error('Palette generation error:', error);
            this.showErrorMessage('Failed to generate palette');
        } finally {
            this.stateManager.setLoading(false);
        }
    }

    /**
     * Display generated palettes
     */
    displayPalettes(palettes, wcagLevel) {
        this.uiComponents.displayBasePalette(palettes.base, wcagLevel);
        this.uiComponents.displayOptimizedPalettes(
            palettes.base,
            palettes.lightOptimized,
            palettes.darkOptimized,
            wcagLevel
        );
    }

    /**
     * Handle export
     */
    handleExport(format) {
        const palettes = {
            base: this.stateManager.getState('currentPalette'),
            lightOptimized: this.stateManager.getState('lightOptimizedPalette'),
            darkOptimized: this.stateManager.getState('darkOptimizedPalette')
        };
        
        const settings = this.stateManager.getState('settings');
        this.exportManager.exportPalette(format, palettes, settings);
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#198754' : '#0d6efd'};
            color: white;
            padding: 8px 16px;
            border-radius: 6px;
            z-index: 1060;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            transform: translateX(400px);
            transition: transform 0.3s;
            font-size: 0.875rem;
        `;

        document.body.appendChild(notification);
        
        setTimeout(() => notification.style.transform = 'translateX(0)', 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentElement) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 2000);
    }

    /**
     * Show error message
     */
    showErrorMessage(message) {
        console.error(message);
        this.showNotification(message, 'error');
    }

    /**
     * Get debug information
     */
    getDebugInfo() {
        return {
            version: '2.5',
            initialized: this.isInitialized,
            state: this.stateManager.exportState(),
            modules: {
                stateManager: !!this.stateManager,
                paletteGenerator: !!this.paletteGenerator,
                uiComponents: !!this.uiComponents,
                exportManager: !!this.exportManager,
                historyManager: !!this.historyManager,
                accessibilityUtils: !!this.accessibilityUtils
            }
        };
    }
}

// Initialize application
function initializeApp() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
        return;
    }
    
    try {
        const app = new ColorPaletteApp();
        app.initialize();
        window.colorPaletteApp = app;
    } catch (error) {
        console.error('Failed to create application:', error);
        const container = document.querySelector('.container');
        if (container) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-danger mt-3';
            errorDiv.innerHTML = `
                <h4>Application Error</h4>
                <p>Failed to initialize. Please refresh the page.</p>
            `;
            container.insertBefore(errorDiv, container.firstChild);
        }
    }
}

// Start initialization
initializeApp();

export { ColorPaletteApp };