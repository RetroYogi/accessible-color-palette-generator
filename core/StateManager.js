/**
 * WCAG Color Palette Generator v0.6
 * Centralized state management for the application
 */

/**
 * Application state manager using observable pattern
 */
export class StateManager {
    constructor() {
        this.state = {
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
                    enabled: true,
                    // Fixed values - maximum differentiation when enabled
                    minHueDifference: 60,        // Maximum hue separation
                    minLuminanceDifference: 30   // Maximum luminance separation
                }
            }
        };
        
        this.observers = new Map();
        this.maxHistorySize = 10;
    }

    /**
     * Subscribe to state changes
     * @param {string} key - State key to observe
     * @param {Function} callback - Callback function to execute on change
     * @returns {Function} Unsubscribe function
     */
    subscribe(key, callback) {
        if (!this.observers.has(key)) {
            this.observers.set(key, new Set());
        }
        
        this.observers.get(key).add(callback);
        
        // Return unsubscribe function
        return () => {
            const callbacks = this.observers.get(key);
            if (callbacks) {
                callbacks.delete(callback);
            }
        };
    }

    /**
     * Notify observers of state changes
     * @param {string} key - State key that changed
     * @param {*} newValue - New value
     * @param {*} oldValue - Previous value
     */
    notify(key, newValue, oldValue) {
        const callbacks = this.observers.get(key);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(newValue, oldValue);
                } catch (error) {
                    console.error(`Error in observer callback for ${key}:`, error);
                }
            });
        }
    }

    /**
     * Get current state value with enhanced path handling
     * @param {string} path - Dot notation path to state value
     * @returns {*} State value
     */
    getState(path) {
        try {
            return this.getValueByPath(this.state, path);
        } catch (error) {
            console.warn(`Failed to get state at path: ${path}`, error);
            return undefined;
        }
    }

    /**
     * Set state value and notify observers with validation
     * @param {string} path - Dot notation path to state value
     * @param {*} value - New value
     */
    setState(path, value) {
        try {
            const oldValue = this.getValueByPath(this.state, path);
            this.setValueByPath(this.state, path, value);
            this.notify(path, value, oldValue);
            console.log(`State updated: ${path} =`, value);
        } catch (error) {
            console.error(`Failed to set state at path: ${path}`, error);
        }
    }

    /**
     * Update multiple state values atomically
     * @param {Object} updates - Object with path: value pairs
     */
    updateState(updates) {
        const oldValues = {};
        
        // Store old values
        Object.keys(updates).forEach(path => {
            try {
                oldValues[path] = this.getValueByPath(this.state, path);
            } catch (error) {
                console.warn(`Failed to get old value for path: ${path}`, error);
                oldValues[path] = undefined;
            }
        });
        
        // Update state
        Object.entries(updates).forEach(([path, value]) => {
            try {
                this.setValueByPath(this.state, path, value);
            } catch (error) {
                console.error(`Failed to update state at path: ${path}`, error);
            }
        });
        
        // Notify observers
        Object.entries(updates).forEach(([path, value]) => {
            this.notify(path, value, oldValues[path]);
        });
    }

    /**
     * Add palette to history with enhanced validation
     * @param {Array} palette - Color palette array
     */
    addToHistory(palette) {
        if (!Array.isArray(palette) || palette.length === 0) {
            console.warn('Invalid palette for history:', palette);
            return;
        }

        const historyItem = {
            id: Date.now(),
            palette: [...palette],
            timestamp: new Date(),
            settings: this.deepClone(this.state.settings)
        };

        const newHistory = [historyItem, ...this.state.paletteHistory];
        
        // Keep only last N palettes
        if (newHistory.length > this.maxHistorySize) {
            newHistory.splice(this.maxHistorySize);
        }

        this.setState('paletteHistory', newHistory);
    }

    /**
     * Clear palette history
     */
    clearHistory() {
        this.setState('paletteHistory', []);
    }

    /**
     * Get palette from history by index with validation
     * @param {number} index - History index
     * @returns {Object|null} History item or null if not found
     */
    getHistoryItem(index) {
        const history = this.getState('paletteHistory');
        if (!Array.isArray(history) || index < 0 || index >= history.length) {
            console.warn(`Invalid history index: ${index}`);
            return null;
        }
        return history[index] || null;
    }

    /**
     * Update settings with enhanced validation
     * @param {Object} newSettings - Settings to update
     */
    updateSettings(newSettings) {
        if (!newSettings || typeof newSettings !== 'object') {
            console.warn('Invalid settings object:', newSettings);
            return;
        }

        const currentSettings = this.getState('settings');
        const updatedSettings = { ...currentSettings };

        // Validate and update each setting
        Object.entries(newSettings).forEach(([key, value]) => {
            if (this.validateSetting(key, value)) {
                updatedSettings[key] = value;
            } else {
                console.warn(`Invalid setting: ${key} = ${value}`);
            }
        });

        this.setState('settings', updatedSettings);
    }

    /**
     * Validate individual setting
     * @param {string} key - Setting key
     * @param {*} value - Setting value
     * @returns {boolean} Whether setting is valid
     */
    validateSetting(key, value) {
        switch (key) {
            case 'paletteSize':
                return value === 3 || value === 5;
            case 'wcagLevel':
                return value === 'AA' || value === 'AAA';
            case 'harmonyType':
                return ['complementary', 'triadic', 'analogous', 'monochromatic', 'tetradic'].includes(value);
            case 'baseColor':
                return typeof value === 'string' && /^#[0-9A-Fa-f]{6}$/.test(value);
            case 'differentiationSettings':
                return this.validateDifferentiationSettings(value);
            default:
                return true; // Allow unknown settings for future expansion
        }
    }

    /**
     * Validate differentiation settings (simplified - only enabled flag matters)
     * @param {Object} settings - Differentiation settings
     * @returns {boolean} Whether settings are valid
     */
    validateDifferentiationSettings(settings) {
        if (!settings || typeof settings !== 'object') return false;
        
        const { enabled } = settings;
        
        return typeof enabled === 'boolean';
    }

    /**
     * Update differentiation settings specifically (simplified)
     * @param {Object} newDifferentiationSettings - Differentiation settings to update
     */
    updateDifferentiationSettings(newDifferentiationSettings) {
        const currentSettings = this.getState('settings');
        const currentDiffSettings = currentSettings.differentiationSettings;
        
        // Only update the enabled flag, keep fixed values for hue/luminance
        const updatedDiffSettings = {
            ...currentDiffSettings,
            enabled: newDifferentiationSettings.enabled
            // minHueDifference and minLuminanceDifference remain fixed at 60 and 30
        };
        
        this.updateSettings({
            differentiationSettings: updatedDiffSettings
        });
    }

    /**
     * Set palettes (base, light optimized, dark optimized) with validation
     * @param {Object} palettes - Object containing palette arrays
     */
    setPalettes({ base, lightOptimized, darkOptimized }) {
        const updates = {};

        if (Array.isArray(base)) {
            updates['currentPalette'] = base;
        }
        if (Array.isArray(lightOptimized)) {
            updates['lightOptimizedPalette'] = lightOptimized;
        }
        if (Array.isArray(darkOptimized)) {
            updates['darkOptimizedPalette'] = darkOptimized;
        }

        if (Object.keys(updates).length > 0) {
            this.updateState(updates);
        }
    }

    /**
     * Set loading state
     * @param {boolean} isLoading - Loading state
     */
    setLoading(isLoading) {
        if (typeof isLoading === 'boolean') {
            this.setState('isLoading', isLoading);
        }
    }

    /**
     * Reset state to initial values
     */
    reset() {
        const initialState = {
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
                    enabled: true,
                    minHueDifference: 60,        // Fixed maximum value
                    minLuminanceDifference: 30   // Fixed maximum value
                }
            }
        };

        Object.keys(initialState).forEach(key => {
            this.setState(key, initialState[key]);
        });
    }

    /**
     * Export current state for debugging or persistence
     * @returns {Object} Current state object
     */
    exportState() {
        return this.deepClone(this.state);
    }

    /**
     * Deep clone an object
     * @param {*} obj - Object to clone
     * @returns {*} Cloned object
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (Array.isArray(obj)) return obj.map(item => this.deepClone(item));
        
        const cloned = {};
        Object.keys(obj).forEach(key => {
            cloned[key] = this.deepClone(obj[key]);
        });
        return cloned;
    }

    /**
     * Helper method to get value by dot notation path with error handling
     * @param {Object} obj - Object to traverse
     * @param {string} path - Dot notation path
     * @returns {*} Value at path
     */
    getValueByPath(obj, path) {
        if (!path || typeof path !== 'string') {
            throw new Error('Invalid path');
        }
        
        const keys = path.split('.');
        let current = obj;
        
        for (const key of keys) {
            if (current === null || current === undefined) {
                return undefined;
            }
            if (typeof current !== 'object') {
                throw new Error(`Cannot access property '${key}' of ${typeof current}`);
            }
            current = current[key];
        }
        
        return current;
    }

    /**
     * Helper method to set value by dot notation path with error handling
     * @param {Object} obj - Object to modify
     * @param {string} path - Dot notation path
     * @param {*} value - Value to set
     */
    setValueByPath(obj, path, value) {
        if (!path || typeof path !== 'string') {
            throw new Error('Invalid path');
        }
        
        const keys = path.split('.');
        const lastKey = keys.pop();
        
        if (!lastKey) {
            throw new Error('Invalid path: cannot be empty');
        }
        
        let current = obj;
        
        for (const key of keys) {
            if (current === null || current === undefined) {
                throw new Error(`Cannot set property on null/undefined`);
            }
            if (typeof current !== 'object') {
                throw new Error(`Cannot access property '${key}' of ${typeof current}`);
            }
            if (!(key in current)) {
                current[key] = {};
            }
            current = current[key];
        }
        
        if (current === null || current === undefined) {
            throw new Error(`Cannot set property on null/undefined`);
        }
        if (typeof current !== 'object') {
            throw new Error(`Cannot set property '${lastKey}' of ${typeof current}`);
        }
        
        current[lastKey] = value;
    }
}

// Create and export singleton instance
export const stateManager = new StateManager();