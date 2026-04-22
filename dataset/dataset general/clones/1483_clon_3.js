(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('jquery'));
    } else {
        // Browser globals (root is window)
        root.AdaptiveLayoutManager = factory(root.jQuery);
    }
}(typeof self !== 'undefined' ? self : this, function($) {

    // Ensure jQuery is available. This is a crucial dependency for the module.
    if (typeof $ === 'undefined') {
        console.error('AdaptiveLayoutManager requires jQuery to operate. Please ensure jQuery is loaded.');
        return; // Exit if jQuery is not present.
    }

    const AdaptiveLayoutManager = {
        // The HTML data attribute used to specify element-specific sizing rules.
        responsiveAttribute: 'data-dynamic-size',

        // Minimum delay in milliseconds between processing resize events.
        // This helps prevent performance issues during rapid window resizing.
        throttleDelayMs: 60,

        // Default configuration for how breakpoints (size classes) are generated.
        // These can be overridden on a per-element basis via the `responsiveAttribute`.
        defaultSettings: {
            // The starting width (in pixels) for generating 'lt' and 'gt' classes.
            minSize: 120,
            // The maximum width (in pixels) for generating 'lt' and 'gt' classes.
            maxSize: 1000,
            // The increment step (in pixels) between consecutive breakpoints.
            stepSize: 60
        },

        // Internal cache to store results of parsed attribute settings.
        // This avoids re-parsing the same string multiple times, improving efficiency.
        _parsedSettingsCache: {},

        // A collection of cached DOM elements, populated during initialization.
        domElements: null,

        /**
         * Initializes the AdaptiveLayoutManager module.
         * Sets up initial DOM references and registers event listeners.
         */
        init: function() {
            const moduleInstance = this;

            // Ensure the DOM is fully loaded before attempting to access elements or bind events.
            $(document).ready(function() {
                // Populate the DOM element cache.
                moduleInstance.domElements = {
                    viewport: $(window), // The browser window.
                    // Select all elements that possess the module's responsive data attribute.
                    watchedItems: $(`[${moduleInstance.responsiveAttribute}]`)
                };

                // Set up global event handlers.
                moduleInstance.attachEventListeners();

                // Perform an initial calculation and application of size classes to all watched elements.
                moduleInstance.refreshLayout();
            });
        },

        /**
         * Adds a new jQuery-wrapped DOM element to the list of elements being monitored.
         * The element will immediately be processed for size classes.
         * @param {jQuery} newElement - The jQuery object representing the DOM element to add.
         * @returns {boolean} True if the element was successfully registered, false otherwise.
         */
        registerElement: function(newElement) {
            // Validate the input element.
            if (!newElement || !newElement.jquery || newElement.length === 0) {
                console.warn('AdaptiveLayoutManager: Attempted to register an invalid or empty jQuery element.');
                return false;
            }
            // Add the element to the collection of watched items.
            this.domElements.watchedItems = this.domElements.watchedItems.add(newElement);
            // Immediately apply size classes to the newly registered element.
            this.processSingleElement(newElement);
            return true;
        },

        /**
         * Removes a jQuery-wrapped DOM element from the list of monitored elements.
         * Its size classes will also be cleared.
         * @param {jQuery} targetElement - The jQuery object representing the DOM element to remove.
         * @returns {boolean} True if the element was successfully unregistered, false otherwise.
         */
        unregisterElement: function(targetElement) {
            // Validate the input element.
            if (!targetElement || !targetElement.jquery || targetElement.length === 0) {
                console.warn('AdaptiveLayoutManager: Attempted to unregister an invalid or empty jQuery element.');
                return false;
            }
            const initialCount = this.domElements.watchedItems.length;
            // Remove the element from the collection.
            this.domElements.watchedItems = this.domElements.watchedItems.not(targetElement);
            // Clean up any previously applied size classes from the element.
            this.clearElementSizeClasses(targetElement);
            return this.domElements.watchedItems.length < initialCount;
        },

        /**
         * Parses a string of key-value pairs (e.g., "minSize: 100px; maxSize: 900;")
         * from an element's data attribute into a JavaScript object.
         * @param {string} settingsPayload - The attribute string to parse.
         * @returns {Object|undefined} An object containing the parsed settings, or undefined if the input is invalid.
         */
        parseElementSettings: function(settingsPayload) {
            // Return undefined for invalid input or if the settings string is empty after trimming.
            if (typeof settingsPayload !== 'string' || !settingsPayload.trim()) {
                return undefined;
            }
            // Check the cache first to avoid redundant parsing.
            if (this._parsedSettingsCache[settingsPayload]) {
                return this._parsedSettingsCache[settingsPayload];
            }

            const parsedOptions = {};
            // Normalize whitespace and split the string into individual "key:value" pairs.
            const optionPairs = settingsPayload.replace(/\s+/g, '').split(';');

            for (const pair of optionPairs) {
                if (!pair) continue; // Skip any empty strings resulting from trailing semicolons.

                const parts = pair.split(':');
                if (parts.length !== 2) {
                    console.warn(`AdaptiveLayoutManager: Malformed setting pair encountered: "${pair}". Skipping.`);
                    continue;
                }

                const key = parts[0].trim();
                let value = parts[1].trim();

                // If the value ends with 'px', remove the suffix and attempt to parse as an integer.
                if (value.endsWith('px')) {
                    value = value.slice(0, -2);
                }
                const numericValue = parseInt(value, 10);

                // Assign the numeric value if it's a valid number; otherwise, keep it as a string.
                parsedOptions[key] = isNaN(numericValue) ? value : numericValue;
            }

            // Store the parsed object in the cache for future lookups.
            this._parsedSettingsCache[settingsPayload] = parsedOptions;
            return parsedOptions;
        },

        /**
         * Triggers a re-evaluation and re-application of size classes for all currently watched elements.
         * This method is typically called on window resize events.
         */
        refreshLayout: function() {
            const moduleRef = this;
            // Ensure the module is properly initialized before attempting to refresh.
            if (!this.domElements || !this.domElements.watchedItems) {
                console.warn('AdaptiveLayoutManager: Module is not fully initialized. Cannot refresh layout.');
                return;
            }
            // Iterate over each watched element and process it individually.
            this.domElements.watchedItems.each(function(index, domElement) {
                moduleRef.processSingleElement($(domElement));
            });
        },

        /**
         * Calculates and applies the appropriate size-based CSS classes to a single DOM element.
         * @param {jQuery} targetElement - The jQuery object representing the DOM element to process.
         */
        processSingleElement: function(targetElement) {
            // Validate the input element.
            if (!targetElement || targetElement.length === 0) {
                console.warn('AdaptiveLayoutManager: Attempted to process an invalid or empty jQuery element.');
                return;
            }

            // Extract element-specific settings from its data attribute.
            const elementSettingsString = targetElement.attr(this.responsiveAttribute);
            const customSettings = this.parseElementSettings(elementSettingsString) || {};

            // Merge the global default settings with any custom settings defined on the element.
            // Custom settings take precedence over defaults.
            const effectiveSettings = { ...this.defaultSettings, ...customSettings };

            // Retrieve the current computed width of the element.
            const currentWidth = targetElement.width();

            // Generate the list of CSS classes (e.g., 'gt100', 'lt200') based on width and settings.
            const generatedClasses = this.generateSizeClasses(currentWidth, effectiveSettings);

            // First, remove any existing size-related classes to ensure a clean slate.
            this.clearElementSizeClasses(targetElement);

            // Then, apply the newly generated classes to the element.
            if (generatedClasses.length > 0) {
                targetElement.addClass(generatedClasses.join(' '));
            }
        },

        /**
         * Generates an array of CSS class names (e.g., 'gt100', 'lt200') based on an element's width
         * and a set of breakpoint settings.
         * 'gtX' means "greater than X", applied if `currentWidth > X`.
         * 'ltX' means "less than or equal to X", applied if `currentWidth <= X`.
         * @param {number} currentWidth - The current width of the element in pixels.
         * @param {Object} settings - An object containing `minSize`, `maxSize`, and `stepSize`.
         * @returns {string[]} An array of generated CSS class names.
         */
        generateSizeClasses: function(currentWidth, settings) {
            const { minSize, maxSize, stepSize } = settings;
            const sizeClasses = [];

            // Basic validation for settings values.
            if (isNaN(minSize) || isNaN(maxSize) || isNaN(stepSize) || stepSize <= 0) {
                console.error('AdaptiveLayoutManager: Invalid settings provided for size class generation:', settings);
                return sizeClasses;
            }
            if (minSize > maxSize) {
                console.warn('AdaptiveLayoutManager: minSize is greater than maxSize. No size classes will be generated.');
                return sizeClasses;
            }

            let currentBreakpoint = minSize;
            // Adjust the starting breakpoint to be a multiple of `stepSize`, if `minSize` isn't.
            if (minSize % stepSize !== 0) {
                currentBreakpoint = Math.ceil(minSize / stepSize) * stepSize;
            }

            // Loop from `minSize` up to `maxSize`, incrementing by `stepSize`.
            while (currentBreakpoint <= maxSize) {
                if (currentWidth > currentBreakpoint) {
                    sizeClasses.push(`gt${currentBreakpoint}`); // Add 'greater than' class.
                } else {
                    sizeClasses.push(`lt${currentBreakpoint}`); // Add 'less than or equal to' class.
                }
                currentBreakpoint += stepSize;
            }

            return sizeClasses;
        },

        /**
         * Filters a string of CSS classes, returning only those that match the module's
         * size-related class pattern (e.g., 'gtXXX' or 'ltXXX').
         * @param {string} allClassesString - A space-separated string of all CSS classes on an element.
         * @returns {string[]} An array of identified size-related class names.
         */
        filterSizeClasses: function(allClassesString) {
            // Return an empty array if the input is not a valid string or is empty.
            if (typeof allClassesString !== 'string' || !allClassesString.trim()) {
                return [];
            }
            const allCandidates = allClassesString.split(/\s+/);
            const filteredClasses = [];
            // Regular expression to match 'gt' or 'lt' followed by one or more digits.
            const sizeClassRegex = /^(gt|lt)\d+$/;

            for (const className of allCandidates) {
                if (sizeClassRegex.test(className)) {
                    filteredClasses.push(className);
                }
            }

            return filteredClasses;
        },

        /**
         * Removes all previously generated size-related CSS classes from a specified element.
         * @param {jQuery} elementToClean - The jQuery object representing the DOM element to clean.
         */
        clearElementSizeClasses: function(elementToClean) {
            // Validate the input element.
            if (!elementToClean || elementToClean.length === 0) {
                console.warn('AdaptiveLayoutManager: Attempted to clear classes from an invalid or empty jQuery element.');
                return;
            }
            // Get the list of size classes currently on the element.
            const classesToRemove = this.filterSizeClasses(elementToClean.attr('class') || '');
            // If any such classes are found, remove them.
            if (classesToRemove.length > 0) {
                elementToClean.removeClass(classesToRemove.join(' '));
            }
        },

        /**
         * Sets up all necessary event listeners for the module, primarily for window resizing.
         */
        attachEventListeners: function() {
            // Attach a debounced resize handler to the window.
            // `this.refreshLayout.bind(this)` ensures that `this` inside `refreshLayout` refers to `AdaptiveLayoutManager`.
            this.domElements.viewport.on('resize', this.utilityFunctions.debounce(
                this.refreshLayout.bind(this),
                this.throttleDelayMs
            ));
        },

        /**
         * Disables the module by removing all event listeners and clearing internal caches.
         * This should be called if the module is no longer needed to prevent memory leaks.
         */
        destroy: function() {
            if (this.domElements && this.domElements.viewport) {
                this.domElements.viewport.off('resize'); // Remove all resize handlers from the window.
            }
            this.domElements = null; // Clear cached DOM elements.
            this._parsedSettingsCache = {}; // Clear the settings cache.
            console.log('AdaptiveLayoutManager: Module successfully destroyed.');
        },

        /**
         * A collection of general utility functions, including debouncing.
         */
        utilityFunctions: {
            // Debounce function, adapted from Underscore.js.
            // Returns a new function that, when invoked, will not execute the original `callback`
            // until a specified `delayMs` has passed without any further invocations.
            // If `triggerImmediately` is true, the `callback` is invoked on the first call,
            // then waits for the `delayMs` before allowing subsequent immediate calls.
            debounce: function(callback, delayMs, triggerImmediately = false) {
                let timeoutId = null;
                let lastInvocationResult;

                return function(...args) {
                    const context = this; // Preserve the `this` context from the caller.

                    // Function to be executed after the delay.
                    const deferredExecution = function() {
                        timeoutId = null; // Clear the timeout ID once executed.
                        if (!triggerImmediately) {
                            lastInvocationResult = callback.apply(context, args);
                        }
                    };

                    // Determine if the callback should be executed immediately.
                    const shouldExecuteImmediately = triggerImmediately && !timeoutId;

                    // Clear any existing timeout to reset the delay.
                    clearTimeout(timeoutId);
                    // Set a new timeout.
                    timeoutId = setTimeout(deferredExecution, delayMs);

                    // If `triggerImmediately` is true and no timeout is active, execute now.
                    if (shouldExecuteImmediately) {
                        lastInvocationResult = callback.apply(context, args);
                    }

                    return lastInvocationResult; // Return the result of the last actual invocation.
                };
            }
        }
    };

    // Return the module object for use by AMD/CommonJS or direct browser access.
    return AdaptiveLayoutManager;
}));

// Initialize the AdaptiveLayoutManager once the script is loaded.
// For direct browser inclusion, this ensures the module starts working automatically.
// In AMD/CommonJS environments, the consumer will typically call `init()` explicitly.
AdaptiveLayoutManager.init();