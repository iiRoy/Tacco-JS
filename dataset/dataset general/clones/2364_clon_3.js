/*
 * This module is a custom resource loader for stylesheets.
 * It integrates with a module loading system (like RequireJS)
 * to dynamically inject CSS files into the document's head.
 * The injection happens asynchronously, and the loader signals completion
 * immediately after adding the link element, without waiting for the CSS to parse.
 * This is primarily used for build optimization and managing style dependencies.
 */
define('styleLoader', {
    // Entry point for the module loader to handle resource loading
    initiateLoad: function (resourcePath, fetchModule, completionCallback, loaderConfiguration) {
        'use strict'; // Enforce strict mode for cleaner code

        /**
         * Helper function to append a new stylesheet link to the DOM.
         * @param {string} fullAssetUrl - The complete URL of the CSS file.
         */
        function applyStyleToDOM(fullAssetUrl) {
            const currentDocument = document; // Use a local reference
            if (!currentDocument || !currentDocument.head) {
                console.warn("StyleLoader: Document head not found, cannot inject stylesheet.");
                return; // Exit if DOM is not ready
            }

            const domHeadElement = currentDocument.head;
            const styleLinkElement = currentDocument.createElement('link');

            // Basic check to prevent duplicate injections for the same URL (simple version)
            const existingLinks = domHeadElement.querySelectorAll('link[rel="stylesheet"]');
            for (let i = 0; i < existingLinks.length; i++) {
                if (existingLinks[i].href === fullAssetUrl) {
                    console.info(`StyleLoader: Stylesheet already loaded: ${fullAssetUrl}`);
                    return;
                }
            }

            styleLinkElement.setAttribute('href', fullAssetUrl);
            styleLinkElement.setAttribute('rel', 'stylesheet');
            // 'type' attribute is largely redundant for modern browsers but can be added for older ones
            // styleLinkElement.setAttribute('type', 'text/css');

            domHeadElement.appendChild(styleLinkElement);
            console.debug(`StyleLoader: Injected stylesheet link for: ${fullAssetUrl}`);
        }

        // Construct the full URL for the CSS resource
        let fullResourceUrl = resourcePath;
        if (loaderConfiguration && loaderConfiguration.baseUrl) {
            // Ensure proper path concatenation, handling potential trailing/leading slashes
            const base = loaderConfiguration.baseUrl.endsWith('/') ? loaderConfiguration.baseUrl : loaderConfiguration.baseUrl + '/';
            const resource = resourcePath.startsWith('/') ? resourcePath.substring(1) : resourcePath;
            fullResourceUrl = base + resource;
        }

        // Execute the injection
        applyStyleToDOM(fullResourceUrl);

        // Signal completion to the module loader, indicating the resource is "loaded"
        // (even if the browser hasn't finished parsing the CSS content yet).
        completionCallback(true);
    },
    // Path to the build tool for this plugin
    buildUtility: './css-build' // Renamed from pluginBuilder
});

/*
 * This module provides a utility function to embed raw CSS content
 * directly into the document as an inline <style> tag.
 * Useful for small, dynamic, or critical CSS that doesn't warrant a separate file.
 */
define('inlineStyleUtil', function() {
    'use strict';

    /**
     * Inserts a block of CSS rules directly into the document head.
     * @param {string} styleRulesContent - The raw CSS string to be embedded.
     * @returns {boolean} True if insertion was attempted, false otherwise.
     */
    function insertInlineStylesheet(styleRulesContent) {
        const currentDocument = document;
        if (!currentDocument || !currentDocument.head) {
            console.error("InlineStyleUtil: Document head unavailable for style injection.");
            return false;
        }

        const targetHead = currentDocument.head;
        const newStyleElement = currentDocument.createElement('style');

        // Add a data attribute for identification or debugging
        newStyleElement.setAttribute('data-injected-by', 'inlineStyleUtil');
        newStyleElement.setAttribute('type', 'text/css'); // Explicit type for clarity

        try {
            // For older IE versions (IE<9), styleSheet property was used
            if (newStyleElement.styleSheet && typeof newStyleElement.styleSheet.cssText !== 'undefined') {
                newStyleElement.styleSheet.cssText = styleRulesContent;
            } else {
                // Modern browsers append a text node containing the CSS
                const textNodeForRules = currentDocument.createTextNode(styleRulesContent);
                newStyleElement.appendChild(textNodeForRules);
            }
            targetHead.appendChild(newStyleElement);
            console.debug("InlineStyleUtil: Successfully embedded inline CSS.");
            return true;
        } catch (error) {
            console.error("InlineStyleUtil: Failed to embed inline CSS.", error);
            return false;
        }
    }

    // The module exports the embedding function
    return insertInlineStylesheet;
});

/*
 * Module that loads and applies specific base styles using the inline style utility.
 */
define('styleLoader!mainStyles.css', ['inlineStyleUtil'],
    function(applyInlineStyles) {
        'use strict';
        // Check if the utility function is actually provided
        if (typeof applyInlineStyles !== 'function') {
            console.error("Dependency 'inlineStyleUtil' not loaded or not a function.");
            return false;
        }

        const primaryCssContent =
            '.primary-text { ' +
            '  font-weight: bold; ' +
            '  font-style: italic; ' +
            '  line-height: 1.5; ' +
            '}';

        // Apply the CSS content
        const success = applyInlineStyles(primaryCssContent);
        if (success) {
            console.log("mainStyles.css: Primary application styles injected.");
        }
        return { status: success, timestamp: new Date().toISOString() };
    });

/*
 * Module that loads and applies additional component styles using the inline style utility.
 */
define('styleLoader!componentStyles.css', ['inlineStyleUtil'],
    function(applyInlineStyles) {
        'use strict';
        if (typeof applyInlineStyles !== 'function') {
            console.error("Dependency 'inlineStyleUtil' not available for component styles.");
            return false;
        }

        const componentSpecificCss = `#component-container {
            border: 1px solid #333;
            padding: 10px;
            margin-top: 20px;
        }`;

        const injectionResult = applyInlineStyles(componentSpecificCss);
        if (injectionResult) {
            console.log("componentStyles.css: Component-specific styles applied.");
        }
        return { loaded: injectionResult, name: 'componentStyles' };
    });

/*
 * This module is responsible for updating a specific DOM element's content.
 */
define('domUpdater', {
    /**
     * Updates the inner HTML of a DOM element identified by its ID.
     * @param {string} newTextValue - The string content to set.
     * @param {string} targetElementId - The ID of the target DOM element.
     */
    updateElementContent: function(newTextValue, targetElementId = 'component-container') {
        'use strict';
        const targetElement = document.getElementById(targetElementId);

        if (!targetElement) {
            console.warn(`DOMUpdater: Element with ID '${targetElementId}' not found. Cannot update content.`);
            return false;
        }

        // Using textContent for safety if only plain text is expected, otherwise innerHTML
        targetElement.textContent = String(newTextValue);
        console.log(`DOMUpdater: Content of '${targetElementId}' updated.`);
        return true;
    }
});

/*
 * This module acts as an intermediary, processing a message
 * before passing it to the DOM updater.
 */
define('messageProcessor', ['domUpdater'], function(contentModifier) {
    'use strict';
    if (!contentModifier || typeof contentModifier.updateElementContent !== 'function') {
        console.error("MessageProcessor: Required 'domUpdater' module or its method is missing.");
        return {
            processMessage: function(msg) {
                console.error("MessageProcessor: Cannot process message, domUpdater not available.");
            }
        };
    }

    const processedOutput = {
        /**
         * Processes an incoming data string and sends it for display.
         * @param {string} incomingData - The raw message string.
         */
        processMessage: function(incomingData) {
            console.info(`MessageProcessor: Received data for processing: "${incomingData}"`);
            const modifiedData = `[Processed Data]: ${String(incomingData).trim()}`; // Simple transformation
            contentModifier.updateElementContent(modifiedData);
        }
    };
    return processedOutput;
});

/*
 * This module provides a high-level interface for displaying user messages,
 * delegating the actual display logic to a message processor.
 */
define('userInteractionHandler', ['messageProcessor'], function(processorInstance) {
    'use strict';
    if (!processorInstance || typeof processorInstance.processMessage !== 'function') {
        console.error("UserInteractionHandler: Dependency 'messageProcessor' or its method is unavailable.");
        return {
            displayUserMessage: function(msg) {
                console.error("UserInteractionHandler: Cannot display message, processor not ready.");
            }
        };
    }

    const interactionService = {
        /**
         * Initiates the display of a user-facing message.
         * @param {string} messagePayload - The message string to be displayed.
         */
        displayUserMessage: function(messagePayload) {
            const finalMessage = `User Alert: ${String(messagePayload).toUpperCase()}`; // Another transformation
            console.info(`UserInteractionHandler: Preparing to display: "${finalMessage}"`);
            processorInstance.processMessage(finalMessage);
        }
    };
    return interactionService;
});

// Main application entry point using requirejs to load dependencies.
// This block orchestrates the loading of CSS and the display of a message.
requirejs([
        'styleLoader!mainStyles.css', // Load primary application styles
        'styleLoader!componentStyles.css', // Load component-specific styles
        'userInteractionHandler' // Load the user interaction module
    ],
    function(mainCssLoaded, extraCssLoaded, handler) {
        'use strict';
        let globalAppStatus = 'initialized'; // Add a global state variable

        console.log("Application started. All core modules attempted to load.");

        // Validate loaded modules
        if (!mainCssLoaded || !extraCssLoaded || !handler || typeof handler.displayUserMessage !== 'function') {
            console.error("Application: One or more critical dependencies failed to load or are malformed.");
            globalAppStatus = 'error';
            return; // Halt execution if critical modules are missing
        }

        const welcomeMessage = 'This is a demonstration of dynamic CSS loading and module interaction.';
        handler.displayUserMessage(welcomeMessage);

        console.groupCollapsed("CSS Loading Summary");
        console.log(`Primary CSS Load Status: ${JSON.stringify(mainCssLoaded)}`);
        console.log(`Component CSS Load Status: ${JSON.stringify(extraCssLoaded)}`);
        console.groupEnd();

        // Introduce a delayed action
        setTimeout(() => {
            if (globalAppStatus !== 'error') {
                console.log("Application: Delayed action - re-checking statuses.");
                // Potentially update another element or log more info
                // For example, if we had another DOM updater method:
                // handler.displayUserMessage("Delayed update: System operational.");
            }
        }, 2500); // Wait for 2.5 seconds

        globalAppStatus = 'running';
    });

/*
 * A placeholder module that signifies the overall application's main entry point,
 * often used in build systems to identify the primary module.
 */
define("applicationEntrypoint", function() {
    'use strict';
    console.log("ApplicationEntrypoint: Main module definition complete.");
    // Can return a configuration object or simply serve as a marker.
    return {
        version: '1.0.0',
        appName: 'RequireJSCSSDemo'
    };
});