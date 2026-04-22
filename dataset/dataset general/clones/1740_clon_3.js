/*
This utility, formerly known as Stylefill.js, facilitates a connection between CSS declarations and JavaScript logic.
It enables scripts to interpret custom CSS properties and execute corresponding functions based on the assigned
selector and property value. This allows for dynamic behavior driven directly by stylesheet definitions.
*/

var cssProcessor = (function() { // Wrap in an IIFE for better encapsulation

    // Internal storage for all discovered CSS rules from stylesheets.
    // Maps selectors to an object of properties, e.g., { '.my-class': { 'custom-prop': { support: true, value: 'some-val' } } }
    const discoveredRules = {};

    // Internal storage for user-defined functions that handle custom CSS properties.
    // Maps custom property names to their respective handler functions.
    let customPropertyHandlers = {};

    // A flag to indicate if the processor has been initialized.
    let isInitialized = false;

    /**
     * Determines the number of enumerable properties an object possesses.
     * @param {object} targetObject The object to count properties for.
     * @returns {number} The count of enumerable properties.
     */
    function countObjectProperties(targetObject) {
        if (typeof targetObject !== 'object' || targetObject === null) {
            return 0;
        }
        return Object.keys(targetObject).length;
    }

    /**
     * Ensures Array.prototype.slice compatibility across various browsers,
     * specifically for environments where calling slice on host objects (like NodeList) fails.
     * This is a polyfill for older IE versions.
     */
    function patchArraySlice() {
        // Store a reference to the native slice method.
        const nativeSlice = Array.prototype.slice;

        try {
            // Test if native slice works on a host object (like document.documentElement).
            // If it throws an error, it needs patching.
            nativeSlice.call(document.documentElement);
        } catch (error) {
            // If an error occurs, patch Array.prototype.slice.
            // This new slice implementation handles both string-like and array-like objects.
            Array.prototype.slice = function(startIndex, endIndex) {
                const sourceLength = this.length;
                const resultBuffer = [];

                // Handle string-like objects (e.g., arguments object in older IE, or actual strings).
                if (typeof this.charAt === 'function') {
                    for (let charIndex = 0; charIndex < sourceLength; charIndex++) {
                        resultBuffer.push(this.charAt(charIndex));
                    }
                } else {
                    // Handle general array-like objects.
                    for (let itemIndex = 0; itemIndex < sourceLength; itemIndex++) {
                        resultBuffer.push(this[itemIndex]);
                    }
                }

                // Apply the native slice to the newly created array.
                // If endIndex is undefined, it defaults to the length of the buffer.
                return nativeSlice.call(resultBuffer, startIndex, endIndex === undefined ? resultBuffer.length : endIndex);
            };
        }
    }

    /**
     * Asynchronously fetches the content of an external CSS stylesheet.
     * @param {object} handlerDefinitions The custom property handlers defined by the user.
     * @param {string} stylesheetUrl The URL of the stylesheet to load.
     * @param {number} remainingSourcesCount The number of remaining stylesheets to process.
     */
    function retrieveExternalStylesheet(handlerDefinitions, stylesheetUrl, remainingSourcesCount) {
        const xhrRequest = new XMLHttpRequest();

        xhrRequest.open("GET", stylesheetUrl, true); // Asynchronous request.
        xhrRequest.onreadystatechange = function() {
            // Check for successful completion of the request.
            if (this.readyState === 4) {
                if (this.status === 200) {
                    // If successful, parse the stylesheet content.
                    processCssText(handlerDefinitions, this.responseText, remainingSourcesCount);
                } else {
                    // Log an error if fetching failed.
                    console.error(`Failed to load stylesheet from ${stylesheetUrl}. Status: ${this.status}`);
                    // Ensure the count is decremented even on failure to avoid blocking runFills.
                    if (remainingSourcesCount === 1) { // Check if this was the last source.
                        executeHandlers();
                    }
                }
            }
        };
        xhrRequest.send(null); // Send the request.
    }

    /**
     * Orchestrates the discovery and parsing of all available stylesheets (inline and external).
     * @param {object} userHandlers The map of custom property handlers provided by the user.
     */
    function gatherAndParseStylesheets(userHandlers) {
        if (!userHandlers || typeof userHandlers !== 'object' || Object.keys(userHandlers).length === 0) {
            console.warn("No custom property handlers provided for CSS processing.");
            return;
        }

        // Collect all <link> elements that reference stylesheets.
        const linkedStylesheets = Array.from(document.getElementsByTagName('link'))
            .filter(link => link.rel === 'stylesheet' && link.href);

        // Collect all <style> elements for inline CSS.
        const inlineStyleBlocks = Array.from(document.getElementsByTagName('style'));

        // Combine all style sources. Inline styles are processed first if possible.
        const allStyleSources = [...inlineStyleBlocks, ...linkedStylesheets];

        if (allStyleSources.length === 0) {
            console.info("No stylesheets found to process.");
            return;
        }

        let totalSourcesToProcess = allStyleSources.length;
        let processedSourcesCount = 0;

        // Process stylesheets. Iterate in reverse to match original logic's `scount--` behavior.
        for (let i = allStyleSources.length - 1; i >= 0; i--) {
            const currentSource = allStyleSources[i];
            const isLastSource = (i === 0); // This checks if it's the *last* iteration in the reverse loop.

            if (currentSource.innerHTML) {
                // For inline <style> tags, directly process their content.
                processCssText(userHandlers, currentSource.innerHTML, totalSourcesToProcess - processedSourcesCount);
                processedSourcesCount++;
            } else if (currentSource.href && currentSource.href.startsWith(window.location.origin)) {
                // For external <link> tags, if they are from the same origin, fetch them.
                retrieveExternalStylesheet(userHandlers, currentSource.href, totalSourcesToProcess - processedSourcesCount);
                processedSourcesCount++;
            } else {
                // Skip cross-origin stylesheets or those without href/innerHTML.
                // Ensure count is decremented even if skipped to avoid blocking runFills.
                console.warn(`Skipping stylesheet: ${currentSource.href || 'inline block without content'}. Cross-origin or malformed.`);
                processedSourcesCount++;
                if (processedSourcesCount === totalSourcesToProcess) { // If all sources processed/skipped.
                    executeHandlers();
                }
            }
        }
    }

    /**
     * Checks if a given CSS property is natively supported by the browser,
     * including vendor prefixes.
     * @param {string} propName The CSS property name (e.g., 'border-radius').
     * @returns {boolean} True if the property is supported, false otherwise.
     */
    function isPropertySupported(propName) {
        if (!propName || typeof propName !== 'string') return false;

        // Convert to camelCase for DOM style property checking.
        const camelCaseProp = propName.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());

        const testStyle = document.body.style;

        // Check for standard, Webkit, Moz, O, and MS prefixes.
        return (
            camelCaseProp in testStyle ||
            `Webkit${camelCaseProp.charAt(0).toUpperCase() + camelCaseProp.slice(1)}` in testStyle ||
            `Moz${camelCaseProp.charAt(0).toUpperCase() + camelCaseProp.slice(1)}` in testStyle ||
            `O${camelCaseProp.charAt(0).toUpperCase() + camelCaseProp.slice(1)}` in testStyle ||
            `ms${camelCaseProp.charAt(0).toUpperCase() + camelCaseProp.slice(1)}` in testStyle
        );
    }

    /**
     * Parses a block of CSS text to find custom property declarations
     * and stores them in the `discoveredRules` object.
     * @param {object} handlerDefinitions User-defined handler functions.
     * @param {string} cssContent The raw CSS text to parse.
     * @param {number} currentRemainingSources The count of stylesheets still pending processing.
     */
    function processCssText(handlerDefinitions, cssContent, currentRemainingSources) {
        if (!cssContent || typeof cssContent !== 'string') {
            console.warn("Attempted to process empty or invalid CSS content.");
            // Decrement remaining sources even if content is invalid.
            if (currentRemainingSources === 1) {
                executeHandlers();
            }
            return;
        }

        const customPropertyNames = Object.keys(handlerDefinitions);

        // Iterate over each custom property we're looking for.
        for (const targetPropertyName of customPropertyNames) {
            // Create a regular expression to find rules containing the custom property.
            // Matches: `selector { ... target-property: value; ... }`
            // Groups: [1] selectors, [3] property value.
            const ruleRegex = new RegExp(
                `([^}{]+){[^}]*?${targetPropertyName.replace(/-/g, '\\-')}\\s*:\\s*([^;]+)`,
                'gi'
            );

            let ruleMatch;
            const propertyNativeSupport = isPropertySupported(targetPropertyName);

            // Loop through all matches in the CSS content.
            while ((ruleMatch = ruleRegex.exec(cssContent)) !== null) {
                const rawSelectors = ruleMatch[1];
                const declaredValue = ruleMatch[2].trim();

                // Clean and split selectors (e.g., "div, p, .class").
                const individualSelectors = rawSelectors
                    .replace(/^[\s\n\r\t]+|[\s\n\r\t]+$/g, '') // Trim leading/trailing whitespace and newlines.
                    .split(',')
                    .map(s => s.trim()) // Trim each individual selector.
                    .filter(s => s.length > 0); // Remove empty selectors.

                if (individualSelectors.length === 0) {
                    continue; // Skip if no valid selectors were found.
                }

                // Store the discovered rule for each selector.
                for (const selector of individualSelectors) {
                    if (!discoveredRules[selector]) {
                        discoveredRules[selector] = {};
                    }
                    discoveredRules[selector][targetPropertyName] = {
                        support: propertyNativeSupport,
                        value: declaredValue
                    };
                }
            }
        }

        // If this was the last stylesheet to process, trigger the handlers.
        if (currentRemainingSources === 1) {
            executeHandlers();
        }
    }

    /**
     * Executes the registered handler functions for all discovered custom CSS rules.
     * This is called once all stylesheets have been parsed.
     */
    function executeHandlers() {
        if (Object.keys(discoveredRules).length === 0) {
            console.info("No custom CSS rules were discovered to process.");
            return;
        }
        if (Object.keys(customPropertyHandlers).length === 0) {
            console.warn("No custom property handlers are registered to execute.");
            return;
        }

        // Iterate through each selector that has custom rules.
        for (const selectorText in discoveredRules) {
            if (!Object.prototype.hasOwnProperty.call(discoveredRules, selectorText)) continue;

            const rulesForSelector = discoveredRules[selectorText];

            // Iterate through each custom property rule for the current selector.
            for (const propName in rulesForSelector) {
                if (!Object.prototype.hasOwnProperty.call(rulesForSelector, propName)) continue;

                const ruleDetails = rulesForSelector[propName];
                const handlerFn = customPropertyHandlers[propName];

                // Ensure a handler function exists for this custom property.
                if (typeof handlerFn === 'function') {
                    // Prepare a structured data object to pass to the handler.
                    const processedRulePayload = {
                        isNativeSupported: ruleDetails.support,
                        cssSelector: selectorText,
                        propertyName: propName,
                        propertyValue: ruleDetails.value
                    };

                    try {
                        // Execute the handler function.
                        handlerFn(processedRulePayload);
                    } catch (e) {
                        console.error(`Error executing handler for property '${propName}' on selector '${selectorText}':`, e);
                    }
                } else {
                    console.warn(`No handler function registered for custom property: '${propName}'`);
                }
            }
        }
    }

    /**
     * Attaches one or more event listeners to a DOM element,
     * providing cross-browser compatibility.
     * @param {EventTarget} targetElement The DOM element to attach the listener to.
     * @param {string} eventNames A comma-separated string of event types (e.g., 'click,mouseover').
     * @param {Function} handlerFunction The function to execute when the event occurs.
     * @param {boolean} [useCapture=false] Whether to use capture phase (default false).
     */
    function attachEventListener(targetElement, eventNames, handlerFunction, useCapture = false) {
        if (!targetElement || typeof handlerFunction !== 'function' || !eventNames) {
            console.error("Invalid arguments provided to attachEventListener.");
            return;
        }

        const eventTypes = eventNames.split(',').map(type => type.trim()).filter(type => type.length > 0);

        eventTypes.forEach(eventType => {
            if (targetElement.addEventListener) {
                targetElement.addEventListener(eventType, handlerFunction, useCapture);
            } else if (targetElement.attachEvent) { // IE < 9 support
                targetElement.attachEvent('on' + eventType, handlerFunction);
            } else {
                console.warn(`Cannot attach event '${eventType}' to target. Neither addEventListener nor attachEvent are available.`);
            }
        });
    }

    // Public API of the cssProcessor module.
    return {
        /**
         * Initializes the CSS processing system with user-defined custom property handlers.
         * This should be called once with an object mapping custom property names to handler functions.
         * @param {object} handlers An object where keys are custom CSS property names (e.g., 'my-custom-prop')
         *                          and values are functions that will be called when such a property is found.
         *                          The function receives an object { isNativeSupported, cssSelector, propertyName, propertyValue }.
         */
        initialize: function(handlers) {
            if (isInitialized) {
                console.warn("CSS processor already initialized. Skipping re-initialization.");
                return;
            }

            if (!handlers || typeof handlers !== 'object' || Object.keys(handlers).length === 0) {
                console.error("Initialization failed: A valid object of custom property handlers is required.");
                return;
            }

            customPropertyHandlers = handlers;
            isInitialized = true;

            // Ensure Array.prototype.slice is robust before proceeding.
            patchArraySlice();

            // Begin the process of finding and parsing stylesheets.
            gatherAndParseStylesheets(customPropertyHandlers);
        },

        // Expose a utility for event binding if needed externally.
        onEvent: attachEventListener,

        // For debugging or advanced use, expose discovered rules (optional, delete if not needed)
        getDiscoveredRules: function() {
            return { ...discoveredRules
            }; // Return a copy
        }
    };

})(); // End of IIFE