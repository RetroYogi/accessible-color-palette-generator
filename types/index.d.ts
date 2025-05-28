/**
 * WCAG Color Palette Generator v0.6
 * TypeScript type definitions for better type safety
 */

// Core color types
export interface RGBColor {
    r: number;
    g: number;
    b: number;
}

export interface HSLColor {
    h: number;
    s: number;
    l: number;
}

export interface ColorData {
    hex: string;
    rgb: RGBColor;
    hsl: HSLColor;
}

// Color utility types
export interface ColorUtilConstructorOptions {
    type: 'hsl';
    h: number;
    s: number;
    l: number;
}

// Differentiation settings types
export interface DifferentiationSettings {
    enabled: boolean;
    minHueDifference: number;      // 5-60 degrees
    minLuminanceDifference: number; // 5-30 percent
}

// Palette generation types
export interface PaletteGenerationOptions {
    size?: number;
    wcagLevel?: WCAGLevel;
    harmonyType?: HarmonyType;
    baseColor?: string;
    differentiationSettings?: DifferentiationSettings;
}

export interface GeneratedPalettes {
    base: ColorUtil[];
    lightOptimized: ColorUtil[];
    darkOptimized: ColorUtil[];
}

// WCAG and accessibility types
export type WCAGLevel = 'AA' | 'AAA';
export type AccessibilityLevel = 'AA' | 'AAA' | 'FAIL';

export interface ContrastInfo {
    ratio: number;
    level: AccessibilityLevel;
    compliant: boolean;
}

// Harmony types
export type HarmonyType = 'complementary' | 'triadic' | 'analogous' | 'monochromatic' | 'tetradic';

export interface HarmonyInfo {
    type: HarmonyType;
    description: string;
}

// Application state types
export interface ApplicationSettings {
    paletteSize: number;
    wcagLevel: WCAGLevel;
    harmonyType: HarmonyType;
    baseColor: string;
    differentiationSettings: DifferentiationSettings;
}

export interface HistoryItem {
    id: number;
    palette: ColorUtil[];
    timestamp: Date;
    settings: ApplicationSettings;
}

export interface ApplicationState {
    currentPalette: ColorUtil[];
    lightOptimizedPalette: ColorUtil[];
    darkOptimizedPalette: ColorUtil[];
    paletteHistory: HistoryItem[];
    isLoading: boolean;
    settings: ApplicationSettings;
}

// Export data types
export type ExportFormat = 'css' | 'json';

export interface ExportMetadata {
    generated: string;
    generator: string;
    wcagLevel: WCAGLevel;
    harmonyType: HarmonyType;
    baseColor: string;
    paletteSize: number;
    differentiationSettings: DifferentiationSettings;
}

export interface ColorExportData {
    index: number;
    name: string;
    hex: string;
    rgb: RGBColor;
    hsl: HSLColor;
    luminance: number;
}

export interface ContrastRatioData {
    colorIndex: number;
    ratio: number;
}

export interface ComplianceData {
    colorIndex: number;
    compliant: boolean;
    ratio: number;
    level: AccessibilityLevel;
}

export interface AccessibilityReport {
    contrastRatios: {
        lightBackground: ContrastRatioData[];
        darkBackground: ContrastRatioData[];
    };
    wcagCompliance: {
        lightBackground: ComplianceData[];
        darkBackground: ComplianceData[];
        overallCompliant: {
            light: boolean;
            dark: boolean;
        };
    };
    differentiationApplied: boolean;
    differentiationSettings: DifferentiationSettings;
}

export interface ExportData {
    metadata: ExportMetadata;
    palettes: {
        base: ColorExportData[];
        lightOptimized: ColorExportData[];
        darkOptimized: ColorExportData[];
    };
    accessibility: AccessibilityReport;
    usage: {
        css: Record<string, { base: string; light: string; dark: string }>;
        sassVariables: Record<string, { base: string; light: string; dark: string }>;
        designTokens: Record<string, { base: { value: string }; light: { value: string }; dark: { value: string } }>;
    };
}

// UI component types
export interface UIElements {
    basePalette?: HTMLElement;
    optimizedPalettes?: HTMLElement;
    harmonyInfo?: HTMLElement;
    copyNotification?: HTMLElement;
    differentiationEnabled?: HTMLInputElement;
    minHueDifference?: HTMLInputElement;
    minLuminanceDifference?: HTMLInputElement;
    hueValue?: HTMLElement;
    luminanceValue?: HTMLElement;
    differentiationStatus?: HTMLElement;
}

export type BackgroundType = 'light' | 'dark';

// Event types
export interface StateChangeEvent {
    key: string;
    newValue: any;
    oldValue: any;
}

export type StateObserver = (newValue: any, oldValue: any) => void;

// Class interfaces
export interface ColorUtil {
    hex: string;
    rgb: RGBColor;
    hsl: HSLColor;
    getLuminance(): number;
    getContrastRatio(otherColor: ColorUtil): number;
    meetsWCAGContrast(backgroundColor: ColorUtil, level?: WCAGLevel): boolean;
    toString(): string;
}

export interface StateManager {
    subscribe(key: string, callback: StateObserver): () => void;
    getState(path: string): any;
    setState(path: string, value: any): void;
    updateState(updates: Record<string, any>): void;
    addToHistory(palette: ColorUtil[]): void;
    clearHistory(): void;
    getHistoryItem(index: number): HistoryItem | null;
    updateSettings(newSettings: Partial<ApplicationSettings>): void;
    updateDifferentiationSettings(newDifferentiationSettings: Partial<DifferentiationSettings>): void;
    setPalettes(palettes: Partial<GeneratedPalettes>): void;
    setLoading(isLoading: boolean): void;
    reset(): void;
    exportState(): ApplicationState;
}

export interface PaletteGenerator {
    generatePalette(options: PaletteGenerationOptions): GeneratedPalettes;
    generateBaseColors(baseColor: string, harmonyType: HarmonyType, size: number): ColorUtil[];
    generateOptimizedPalette(baseColors: ColorUtil[], backgroundColor: ColorUtil, minContrastRatio: number): ColorUtil[];
    optimizeColorForBackground(originalColor: ColorUtil, backgroundColor: ColorUtil, targetRatio: number, colorIndex: number, totalColors: number): ColorUtil;
    ensureColorDifferentiation(palette: ColorUtil[], backgroundColor: ColorUtil, minContrastRatio: number, differentiationSettings?: DifferentiationSettings): void;
    getCircularHueDistance(hue1: number, hue2: number): number;
}

export interface UIComponents {
    displayBasePalette(colors: ColorUtil[], wcagLevel: WCAGLevel): void;
    displayOptimizedPalettes(baseColors: ColorUtil[], lightColors: ColorUtil[], darkColors: ColorUtil[], wcagLevel: WCAGLevel): void;
    updateHarmonyInfo(harmonyType: HarmonyType, description: string): void;
    showCopyNotification(text: string): void;
    showLoading(show: boolean): void;
    updateBaseColorPreview(color: string): void;
}

export interface ExportManager {
    exportPalette(format: ExportFormat, palettes: GeneratedPalettes, settings: ApplicationSettings): boolean;
    exportCSS(palettes: GeneratedPalettes, settings: ApplicationSettings): boolean;
    exportJSON(palettes: GeneratedPalettes, settings: ApplicationSettings): boolean;
}

export interface HistoryManager {
    toggleHistory(): void;
    showHistory(): void;
    hideHistory(): void;
    updateHistoryDisplay(): void;
    loadFromHistory(index: number): void;
    clearHistory(): void;
    exportHistory(): HistoryItem[];
    importHistory(historyData: HistoryItem[]): void;
}

export interface AccessibilityUtils {
    toggleHistory(): void;
    generatePalette(): void;
    exportPalette(format: ExportFormat): void;
    copyFirstColor(): void;
    showKeyboardShortcuts(): void;
    showAccessibilityInfo(): void;
    announceToScreenReader(message: string, priority?: 'polite' | 'assertive'): void;
    managePaletteGenerationFocus(): void;
    enhanceCopyFeedback(copiedText: string): void;
}

export interface ColorPaletteApp {
    initialize(): Promise<void>;
    generatePalette(): Promise<void>;
    handleExport(format: ExportFormat): void;
    getDifferentiationSettings(): DifferentiationSettings;
    updateDifferentiationUI(differentiationSettings: DifferentiationSettings): void;
    handleDifferentiationChange(): void;
    debouncedDifferentiationChange(): void;
    getDebugInfo(): {
        version: string;
        initialized: boolean;
        state: ApplicationState;
        modules: Record<string, boolean>;
    };
}

// Global window extensions
declare global {
    interface Window {
        generatePalette: () => Promise<void>;
        exportPalette: (format: ExportFormat) => void;
        toggleHistory: () => void;
        updateBaseColorPreview: (color: string) => void;
        showKeyboardShortcuts: () => void;
        showAccessibilityInfo: () => void;
        copyToClipboard: (text: string) => void;
        accessibilityUtils: AccessibilityUtils;
        colorPaletteApp: ColorPaletteApp;
    }
}

// Utility types
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Error types
export interface AppError extends Error {
    code?: string;
    context?: Record<string, any>;
}

// Configuration types
export interface AppConfig {
    maxHistorySize: number;
    debounceDelay: number;
    defaultSettings: ApplicationSettings;
    supportedFormats: ExportFormat[];
    wcagLevels: WCAGLevel[];
    harmonyTypes: HarmonyType[];
    differentiationLimits: {
        hue: { min: number; max: number; step: number };
        luminance: { min: number; max: number; step: number };
    };
}

export default {};