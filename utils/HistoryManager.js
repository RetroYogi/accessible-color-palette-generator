/**
 * WCAG Color Palette Generator v0.6
 * History management for palette generation
 */

/**
 * History manager for palette history functionality
 */
export class HistoryManager {
    constructor(stateManager) {
        this.stateManager = stateManager;
        this.elements = {
            historyPanel: document.getElementById('historyPanel'),
            historyContent: document.getElementById('historyContent'),
            historyToggle: document.querySelector('.history-toggle')
        };
        
        console.log('HistoryManager initialized');
        console.log('Elements found:', {
            panel: !!this.elements.historyPanel,
            content: !!this.elements.historyContent,
            toggle: !!this.elements.historyToggle
        });
        
        // Don't setup event listeners here - they're handled by main app
        this.setupStateSubscriptions();
        this.isHistoryVisible = false;
    }

    /**
     * Setup state subscriptions for automatic updates
     */
    setupStateSubscriptions() {
        if (this.stateManager) {
            this.stateManager.subscribe('paletteHistory', (newHistory) => {
                console.log('History state changed, updating display');
                this.updateHistoryDisplay();
            });
        }
    }

    /**
     * Toggle history panel visibility - called by global function
     */
    toggleHistory() {
        console.log('HistoryManager.toggleHistory() called');
        
        if (!this.elements.historyPanel) {
            console.error('History panel element not found');
            return;
        }
        
        this.isHistoryVisible = !this.isHistoryVisible;
        console.log('Toggling to:', this.isHistoryVisible ? 'visible' : 'hidden');
        
        if (this.isHistoryVisible) {
            this.showHistory();
        } else {
            this.hideHistory();
        }
    }

    /**
     * Show history panel
     */
    showHistory() {
        console.log('Showing history panel');
        
        if (!this.elements.historyPanel) return;
        
        // Add class and set style for maximum compatibility
        this.elements.historyPanel.classList.add('show');
        this.elements.historyPanel.style.right = '0px';
        this.elements.historyPanel.style.display = 'block';
        
        this.isHistoryVisible = true;
        
        // Update content when showing
        this.updateHistoryDisplay();
        
        // Setup click outside to close
        setTimeout(() => {
            document.addEventListener('click', this.handleClickOutside.bind(this));
        }, 100);
        
        console.log('History panel shown');
    }

    /**
     * Hide history panel
     */
    hideHistory() {
        console.log('Hiding history panel');
        
        if (!this.elements.historyPanel) return;
        
        // Remove class and set style
        this.elements.historyPanel.classList.remove('show');
        this.elements.historyPanel.style.right = '-300px';
        
        this.isHistoryVisible = false;
        
        // Remove click outside listener
        document.removeEventListener('click', this.handleClickOutside.bind(this));
        
        console.log('History panel hidden');
    }

    /**
     * Handle clicks outside the panel
     */
    handleClickOutside(event) {
        if (!this.isHistoryVisible) return;
        
        const panel = this.elements.historyPanel;
        const toggle = this.elements.historyToggle;
        
        if (panel && !panel.contains(event.target) && 
            toggle && !toggle.contains(event.target)) {
            console.log('Clicked outside history panel, hiding');
            this.hideHistory();
        }
    }

    /**
     * Update history display with current history data
     */
    updateHistoryDisplay() {
        console.log('Updating history display');
        
        if (!this.elements.historyContent) {
            console.error('History content element not found');
            return;
        }
        
        const history = this.stateManager ? 
            this.stateManager.getState('paletteHistory') : [];
        
        console.log(`Found ${history.length} history items`);
        
        if (history.length === 0) {
            this.elements.historyContent.innerHTML = 
                '<p class="text-muted">No palettes generated yet.</p>';
            return;
        }

        const historyHTML = history.map((item, index) => 
            this.createHistoryItemHTML(item, index)
        ).join('');

        this.elements.historyContent.innerHTML = historyHTML;
        
        // Add event listeners to history items
        this.attachHistoryItemListeners();
        
        console.log('History display updated');
    }

    /**
     * Create HTML for a single history item
     * @param {Object} item - History item data
     * @param {number} index - Item index
     * @returns {string} HTML string
     */
    createHistoryItemHTML(item, index) {
        const colorSwatches = item.palette.map(color => 
            `<div class="history-color" style="background-color: ${color.hex};" title="${color.hex}"></div>`
        ).join('');

        const timeString = this.formatTime(item.timestamp);
        const settingsInfo = this.formatSettingsInfo(item.settings);

        return `
            <div class="history-item" 
                 data-index="${index}"
                 role="button" 
                 tabindex="0" 
                 aria-label="Load palette from ${timeString}. ${settingsInfo}"
                 title="Click to load this palette">
                <div class="history-colors">${colorSwatches}</div>
                <div class="history-info">
                    <div class="time">${timeString}</div>
                    <div class="settings">${settingsInfo}</div>
                </div>
            </div>
        `;
    }

    /**
     * Format timestamp for display
     * @param {Date} timestamp - Timestamp
     * @returns {string} Formatted time string
     */
    formatTime(timestamp) {
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
     * Format settings information for display
     * @param {Object} settings - Settings object
     * @returns {string} Formatted settings string
     */
    formatSettingsInfo(settings) {
        const diffStatus = settings.differentiationSettings?.enabled ? 'diff' : 'no-diff';
        return `${settings.harmonyType} • ${settings.wcagLevel} • ${settings.paletteSize} colors • ${diffStatus}`;
    }

    /**
     * Attach event listeners to history items
     */
    attachHistoryItemListeners() {
        const historyItems = this.elements.historyContent?.querySelectorAll('.history-item');
        if (!historyItems) return;

        console.log(`Attaching listeners to ${historyItems.length} history items`);

        historyItems.forEach(item => {
            const index = parseInt(item.dataset.index);
            
            // Click handler
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log(`History item ${index} clicked`);
                this.loadFromHistory(index);
            });
            
            // Keyboard handler
            item.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`History item ${index} activated via keyboard`);
                    this.loadFromHistory(index);
                }
            });

            // Hover effect for better UX
            item.addEventListener('mouseenter', () => {
                item.style.backgroundColor = '#f8f9fa';
                item.style.borderColor = '#5500AA';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.backgroundColor = '';
                item.style.borderColor = '#ddd';
            });
        });
    }

    /**
     * Load palette from history
     * @param {number} index - History index
     */
    loadFromHistory(index) {
        console.log(`Loading from history index: ${index}`);
        
        if (!this.stateManager) {
            console.error('No state manager available');
            return;
        }
        
        const historyItem = this.stateManager.getHistoryItem(index);
        if (!historyItem) {
            console.error('History item not found:', index);
            return;
        }

        console.log('Loading history item:', historyItem);

        // Update settings in state
        this.stateManager.updateSettings(historyItem.settings);
        
        // Update form elements using global function
        if (window.loadHistoryItem) {
            // Use the global function from main app
            window.loadHistoryItem(index);
        } else {
            // Fallback: manual update
            this.updateFormElementsManually(historyItem.settings);
            this.hideHistory();
            
            // Trigger regeneration
            if (window.generatePalette) {
                window.generatePalette();
            }
            
            this.showLoadSuccess();
        }
    }

    /**
     * Manual form update fallback
     * @param {Object} settings - Settings to apply
     */
    updateFormElementsManually(settings) {
        console.log('Updating form elements manually');
        
        const elements = {
            paletteSize: document.getElementById('paletteSize'),
            wcagLevel: document.getElementById('wcagLevel'),
            harmonyType: document.getElementById('harmonyType'),
            baseColor: document.getElementById('baseColor'),
            differentiationEnabled: document.getElementById('differentiationEnabled'),
            minHueDifference: document.getElementById('minHueDifference'),
            minLuminanceDifference: document.getElementById('minLuminanceDifference')
        };

        // Update basic settings
        Object.entries(settings).forEach(([key, value]) => {
            if (key === 'differentiationSettings') return;
            
            const element = elements[key];
            if (element && value !== undefined) {
                element.value = value;
                console.log(`Updated ${key} to ${value}`);
            }
        });

        // Update differentiation settings
        if (settings.differentiationSettings) {
            const diff = settings.differentiationSettings;
            
            if (elements.differentiationEnabled) {
                elements.differentiationEnabled.checked = diff.enabled;
            }
            
            if (elements.minHueDifference) {
                elements.minHueDifference.value = diff.minHueDifference;
                const hueValue = document.getElementById('hueValue');
                if (hueValue) hueValue.textContent = `${diff.minHueDifference}°`;
            }
            
            if (elements.minLuminanceDifference) {
                elements.minLuminanceDifference.value = diff.minLuminanceDifference;
                const luminanceValue = document.getElementById('luminanceValue');
                if (luminanceValue) luminanceValue.textContent = `${diff.minLuminanceDifference}%`;
            }
        }

        // Update base color preview
        if (window.updateBaseColorPreview && settings.baseColor) {
            window.updateBaseColorPreview(settings.baseColor);
        }
    }

    /**
     * Show success feedback when loading from history
     */
    showLoadSuccess() {
        console.log('Showing load success notification');
        
        // Create temporary notification
        const notification = document.createElement('div');
        notification.className = 'history-load-notification';
        notification.textContent = 'Palette loaded from history';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #198754;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1060;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            transform: translateX(400px);
            transition: transform 0.3s;
        `;

        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Hide and remove notification
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
     * Clear all history
     */
    clearHistory() {
        if (this.stateManager) {
            this.stateManager.clearHistory();
        }
        this.updateHistoryDisplay();
    }

    /**
     * Get current visibility state
     */
    isVisible() {
        return this.isHistoryVisible;
    }

    /**
     * Export history data
     * @returns {Array} History data
     */
    exportHistory() {
        return this.stateManager ? 
            this.stateManager.getState('paletteHistory') : [];
    }

    /**
     * Import history data
     * @param {Array} historyData - History data to import
     */
    importHistory(historyData) {
        if (!Array.isArray(historyData) || !this.stateManager) return;
        
        // Validate history data structure
        const validHistory = historyData.filter(item => 
            item.palette && 
            item.timestamp && 
            item.settings
        );

        this.stateManager.setState('paletteHistory', validHistory);
    }
}