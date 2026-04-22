/*
 * Core application module for managing user interface interactions
 * and integrating third-party utilities.
 * This script ensures a smooth and responsive experience across devices.
 */
(function (globalScope, jQueryAlias, undefined) {
    "use strict"; // Enforce stricter parsing and error handling for robust code.

    // Centralized configuration object for various application constants and settings.
    const APPLICATION_CONFIG = {
        uiAnimationDurationMs: 400, // Standard duration for UI slide animations.
        initialFeatureLoadDelayMs: 1200, // Delay before attempting to initialize deferred features.
        bookmarkPromptHashKey: 'web_app_prompt_active', // URL hash parameter to track prompt state.
        enableDetailedLogging: true // Flag to control verbose console output.
    };

    /**
     * Provides conditional logging based on the 'enableDetailedLogging' setting.
     * @param {string} message - The primary message to log.
     * @param {any[]} additionalArgs - Any extra arguments to pass to the console log.
     */
    const logTrace = (message, ...additionalArgs) => {
        if (APPLICATION_CONFIG.enableDetailedLogging && globalScope.console && globalScope.console.debug) {
            globalScope.console.debug(`[APP_TRACE] ${message}`, ...additionalArgs);
        }
    };

    /**
     * Initializes interactive UI components once the Document Object Model is fully loaded.
     * This ensures that all required elements are present before attaching event handlers.
     */
    jQueryAlias(document).ready(function () {
        logTrace("DOM is ready. Attaching UI event handlers.");

        // Define a consistent CSS selector for elements that trigger content visibility toggles.
        const CONTENT_TOGGLE_TRIGGER_SELECTOR = '.product-section article h3';

        // Delegate click events for content toggle triggers to the document.
        // This approach handles dynamically added elements and improves performance.
        jQueryAlias(document).on('click', CONTENT_TOGGLE_TRIGGER_SELECTOR, function (interactionEvent) {
            // Prevent any default actions associated with the clicked element (e.g., navigation for links).
            interactionEvent.preventDefault();

            const currentTriggerElement = jQueryAlias(this);
            // Identify the content area immediately following the clicked trigger.
            const targetContentArea = currentTriggerElement.next();

            // Validate that a target content area exists before proceeding with the animation.
            if (targetContentArea.length > 0) {
                // Toggle the visibility of the content area using a slide animation.
                // The animation duration is retrieved from the application configuration.
                targetContentArea.slideToggle(APPLICATION_CONFIG.uiAnimationDurationMs, function () {
                    // Update a CSS class on the trigger element to reflect its new expanded/collapsed state.
                    currentTriggerElement.toggleClass('state-expanded', targetContentArea.is(':visible'));
                    logTrace(`Content area toggle completed for:`, currentTriggerElement[0], `Visibility now: ${targetContentArea.is(':visible')}`);
                });
            } else {
                logTrace("No adjacent content area found for toggle trigger:", currentTriggerElement[0]);
            }
        });
    });

    /**
     * Manages the initialization and display of a specialized "Add to Home Screen" prompt
     * for mobile web applications. This logic runs after all page resources have loaded.
     */
    globalScope.addEventListener('load', function () {
        logTrace("All page resources have loaded. Preparing to initialize deferred features.");

        // Introduce a delay to ensure the page is fully stable before presenting the prompt.
        globalScope.setTimeout(function () {
            // Verify the existence of the required prompt utility constructor.
            // This assumes a global 'app' namespace with a 'mobile' utility containing 'HomePromptAgent'.
            if (globalScope.app && globalScope.app.mobile && typeof globalScope.app.mobile.HomePromptAgent === 'function') {
                logTrace("Home screen prompt agent detected. Creating an instance.");
                const homePromptInstance = new globalScope.app.mobile.HomePromptAgent();

                // Override several default methods of the prompt agent to customize its behavior.

                // Custom logic to check for a specific hash parameter in the current URL.
                homePromptInstance.checkHashPresence = function () {
                    const currentUrlHash = globalScope.location.hash;
                    const isKeyPresent = currentUrlHash.includes(APPLICATION_CONFIG.bookmarkPromptHashKey);
                    logTrace(`Checking URL hash for '${APPLICATION_CONFIG.bookmarkPromptHashKey}': ${isKeyPresent}`);
                    return isKeyPresent;
                };

                // Custom logic to add the predefined hash parameter to the URL if it's missing.
                homePromptInstance.insertHashParameter = function () {
                    if (!this.checkHashPresence()) {
                        const existingHash = globalScope.location.hash;
                        // Append the new hash key, ensuring proper formatting if other hash content exists.
                        globalScope.location.hash += (existingHash.length > 0 && !existingHash.endsWith('&') ? '&' : '') + APPLICATION_CONFIG.bookmarkPromptHashKey;
                        globalScope.console.info(`URL hash parameter '${APPLICATION_CONFIG.bookmarkPromptHashKey}' has been added.`);
                    }
                };

                // Custom method to retrieve the current height of the browser's viewport.
                homePromptInstance.fetchViewportHeight = function () {
                    // Provide a fallback of 0 if innerHeight is not available.
                    const currentHeight = globalScope.innerHeight || 0;
                    return currentHeight;
                };

                // Custom method to retrieve the current vertical scroll position of the document.
                homePromptInstance.fetchViewportScrollPosition = function () {
                    // Provide a fallback of 0 if scroll position properties are not available.
                    const currentScrollY = globalScope.pageYOffset || globalScope.scrollY || 0;
                    return currentScrollY;
                };

                // Custom method to attach a scroll event handler to the window.
                homePromptInstance.attachScrollListener = function (scrollActionCallback) {
                    // Validate the provided callback before attempting to register.
                    if (typeof scrollActionCallback === 'function') {
                        try {
                            // Use a passive event listener for scroll performance optimization.
                            globalScope.addEventListener('scroll', scrollActionCallback, { passive: true });
                            logTrace("Scroll event listener attached successfully.");
                        } catch (error) {
                            globalScope.console.error("Failed to attach scroll event listener:", error);
                        }
                    } else {
                        logTrace("Attempted to attach an invalid scroll listener (not a function).");
                    }
                };

                // Custom method to detach a previously registered scroll event handler from the window.
                homePromptInstance.detachScrollListener = function (scrollActionCallback) {
                    // Validate the provided callback before attempting to deregister.
                    if (typeof scrollActionCallback === 'function') {
                        try {
                            // Ensure the same options are used for removal as for addition.
                            globalScope.removeEventListener('scroll', scrollActionCallback, { passive: true });
                            logTrace("Scroll event listener detached successfully.");
                        } catch (error) {
                            globalScope.console.error("Failed to detach scroll event listener:", error);
                        }
                    } else {
                        logTrace("Attempted to detach an invalid scroll listener (not a function).");
                    }
                };

                // After all customizations, attempt to display the home screen prompt.
                logTrace("Initiating display sequence for the home screen prompt.");
                homePromptInstance.displayIfConditionsMet();
                logTrace("Home screen prompt display sequence completed.");

            } else {
                globalScope.console.warn("Home screen prompt agent (app.mobile.HomePromptAgent) not found. Skipping initialization.");
            }
        }, APPLICATION_CONFIG.initialFeatureLoadDelayMs);
    }, { passive: true }); // Use a passive listener for the 'load' event for better performance.

})(window, window.jQuery); // Pass global objects as arguments for better module encapsulation.