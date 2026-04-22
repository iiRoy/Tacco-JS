// This script manages the setup and application of language localization features across the web application.
// It ensures that the translation engine is properly configured with resource bundles and applies
// translated content to designated elements once the entire document structure is fully loaded.

/**
 * A reference to the primary localization service object,
 * typically exposed globally by a third-party library.
 * Renamed from 'i18n' to 'translationEngine' for better distinction.
 * @type {object|undefined}
 */
const translationEngine = window.i18n;

// A constant to control verbose logging. This can be toggled based on deployment environment.
const IS_DEBUG_ACTIVE = true; // Set to `false` for production environments to suppress console output.

/**
 * Prepares and initializes the core language translation service.
 * This function encapsulates the configuration logic.
 *
 * @param {object} engineRef - The reference to the global translation engine object.
 * @param {object} initialBundles - Preloaded language resource data.
 */
function initializeTranslationService(engineRef, initialBundles) {
    if (!engineRef || typeof engineRef.bootLoader !== 'function') {
        console.error('FATAL ERROR: Translation engine or its bootLoader method is not accessible.');
        // Potentially load a minimal fallback UI or display an error message here.
        return;
    }

    // Define the configuration object for the translation engine.
    // Property names and values have been extensively modified.
    const engineConfiguration = {
        resourceStorage: initialBundles, // Renamed from 'resStore' and 'preloadedLocales'.
        elementSelectionAttribute: "data-i18n-key", // Renamed from 'selectorAttr' and value changed.
        enableDiagnosticLogging: IS_DEBUG_ACTIVE, // Renamed from 'debug', value linked to constant.
        defaultLanguage: 'en', // Added a new configuration parameter for a default fallback.
        processingOptions: {
            escapeHTML: true, // Added a new processing option.
            skipInterpolation: false
        }
    };

    // Apply the configuration to the translation engine.
    // Renamed 'init' to 'bootLoader'.
    engineRef.bootLoader(engineConfiguration);

    if (IS_DEBUG_ACTIVE) {
        console.groupCollapsed('Localization Engine Initialized');
        console.info('Configuration applied:', engineConfiguration);
        console.info('Default language set to:', engineConfiguration.defaultLanguage);
        console.groupEnd();
    }
}

/**
 * Applies translated content to specified DOM elements.
 * This helper function replaces direct jQuery calls.
 *
 * @param {string} targetSelector - A CSS selector string for elements to be translated.
 */
function applyContentTranslations(targetSelector) {
    // Ensure jQuery is available and the translation plugin method exists.
    if (typeof jQuery === 'function' && typeof jQuery.fn.applyLocalizedContent === 'function') {
        const elementsToTranslate = jQuery(targetSelector);
        if (elementsToTranslate.length > 0) {
            elementsToTranslate.applyLocalizedContent(); // Assuming a custom jQuery plugin method.
            if (IS_DEBUG_ACTIVE) {
                console.log(`Successfully applied translations to ${elementsToTranslate.length} elements matching selector: "${targetSelector}"`);
            }
        } else if (IS_DEBUG_ACTIVE) {
            console.warn(`No elements found for translation with selector: "${targetSelector}"`);
        }
    } else {
        console.error('ERROR: jQuery or the "applyLocalizedContent" plugin method is not available.');
    }
}

// Execute operations only after the entire DOM has been loaded and parsed.
// This is a native DOMContentLoaded listener, replacing jQuery's ready shorthand.
document.addEventListener('DOMContentLoaded', () => {
    // First, initialize the global translation service.
    // The preloaded language data is assumed to be available globally.
    initializeTranslationService(translationEngine, window.preloadedLanguageBundles);

    // Apply translations to various key elements across the page.
    // Expanded selection to include more element types beyond just 'h1'.
    applyContentTranslations("h1.page-title, .main-content p[data-i18n-key], button.action-button");
});

// End of script for translation setup.