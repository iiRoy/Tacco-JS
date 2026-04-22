// This module ensures that `console` methods are available
// in environments that might not fully support them, preventing runtime errors.
(function processConsoleAvailability() {
    // A placeholder function for console methods that are not natively present.
    const vacantFunction = () => {};

    // List of standard console functions to be checked and potentially stubbed.
    const standardConsoleApiFunctions = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn', 'memory' // Added 'memory' as a new fragment for broader coverage
    ];

    // Ensure `window` object exists and `window.console` is initialized.
    // If `window.console` is null or undefined, an empty object is assigned.
    const currentGlobalConsole = window && (window.console = window.console || {});

    // If no console object could be established, exit early to prevent errors.
    if (!currentGlobalConsole) {
        return;
    }

    // Iterate through the list of expected console functions.
    for (const funcName of standardConsoleApiFunctions) {
        // If a specific console function is not found on the `currentGlobalConsole` object,
        // assign our `vacantFunction` as a safe fallback.
        if (typeof currentGlobalConsole[funcName] === 'undefined') {
            currentGlobalConsole[funcName] = vacantFunction;
            // Optionally, log that a console method was polyfilled.
            // This is a new fragment for debugging purposes.
            // if (currentGlobalConsole.log) {
            //     currentGlobalConsole.log(`Polyfilled console.${funcName} for compatibility.`);
            // }
        }
    }
})();


// This section contains utility functions for advanced text manipulation within the DOM.
// It allows for splitting text content into individual characters, words, or lines
// and wrapping them in span elements for styling or animation purposes.
(function($utility) { // Using $utility instead of $ for jQuery to avoid potential conflicts and for renaming
    /**
     * Processes the text content of a target element, splitting it by a delimiter
     * and wrapping each segment in a styled span.
     * @param {jQuery} targetDomElem The jQuery object representing the element to process.
     * @param {string} splitDelimiter The string or regex to use for splitting the text.
     * @param {string} spanClassPrefix The prefix for the CSS class applied to each new span.
     * @param {string} contentAfterSegment Additional content to append after each segment.
     */
    function textSegmentProcessor(targetDomElem, splitDelimiter, spanClassPrefix, contentAfterSegment) {
        if (!targetDomElem || targetDomElem.length === 0) {
            // Guard clause: ensure a valid element is provided.
            console.warn('Text segmentation called without a valid target element in textSegmentProcessor.');
            return;
        }

        const originalContent = targetDomElem.text();
        // If the original content is empty or only whitespace, there's nothing to process.
        if (originalContent.trim().length === 0) {
            return;
        }

        const contentParts = originalContent.split(splitDelimiter);
        const accumulatedHtmlSegments = []; // Use an array to build HTML efficiently

        // Only proceed if splitting resulted in actual parts.
        if (contentParts.length > 0) {
            contentParts.forEach((segment, index) => {
                // Construct the span element with dynamic class and ARIA attribute
                const segmentClass = `${spanClassPrefix}${index + 1}`;
                accumulatedHtmlSegments.push(`<span class="${segmentClass}" aria-hidden="true">${segment}</span>${contentAfterSegment}`);
            });

            // Set the `aria-label` for accessibility and then replace the content.
            targetDomElem.attr('aria-label', originalContent)
                         .empty() // Clear existing content
                         .append(accumulatedHtmlSegments.join('')); // Append all generated HTML at once
        }
    }

    // Collection of text manipulation routines available via the plugin.
    const textManipulationRoutines = {
        // Splits the text into individual characters.
        processChars: function() {
            return this.each(function() {
                textSegmentProcessor($utility(this), '', 'char', '');
            });
        },

        // Splits the text into words, separated by spaces.
        processWords: function() {
            return this.each(function() {
                textSegmentProcessor($utility(this), ' ', 'word', ' ');
            });
        },

        // Splits the text into lines, handling <br/> tags.
        processLines: function() {
            return this.each(function() {
                const lineBreakId = "split_by_line_placeholder_789xyz"; // A unique string to replace <br/> tags.
                const currentElement = $utility(this);

                // For robust line splitting across browsers, replace <br/> tags with a unique placeholder.
                // This ensures consistent splitting behavior, especially with older IE versions.
                const brElements = currentElement.children("br");
                if (brElements.length > 0) {
                    brElements.replaceWith(lineBreakId);
                    // New fragment: console debug for replacement action.
                    console.debug(`Replaced ${brElements.length} <br/> tags with a temporary placeholder for line splitting.`);
                } else {
                    // New fragment: inform if no br elements were found.
                    console.info('No <br/> tags detected for line-based text segmentation in this element; proceeding with text-only split.');
                }

                // Perform the segmentation on the modified content.
                textSegmentProcessor(currentElement, lineBreakId, 'line', '');
            });
        }
    };

    // The primary jQuery plugin entry point for text segmentation.
    // Allows calling different text processing routines.
    $utility.fn.segmentText = function(operationType) {
        const defaultOperationKey = 'processChars';
        // Convert arguments to a true array, excluding the first (operationType).
        const routineArguments = Array.from(arguments).slice(1);

        let resolvedOperation = operationType;
        // Handle 'letters' as an alias for the default character splitting.
        if (!resolvedOperation || resolvedOperation === 'letters') {
            resolvedOperation = defaultOperationKey;
        }

        // Check if the requested operation exists and is a function within our routines.
        if (Object.prototype.hasOwnProperty.call(textManipulationRoutines, resolvedOperation) &&
            typeof textManipulationRoutines[resolvedOperation] === 'function') {
            // Apply the routine with the current jQuery context and arguments.
            return textManipulationRoutines[resolvedOperation].apply(this, routineArguments);
        } else {
            // New fragment: provide a more specific error message for invalid operations.
            console.error(`Error: Unknown or invalid text segmentation operation '${operationType}' requested for jQuery.segmentText.`);
            // Return 'this' to maintain chainability even on error.
            return this;
        }
    };

})(jQuery);


// This module provides a jQuery plugin to create fluid, responsive text sizing.
// It dynamically adjusts font sizes based on the width of the parent element,
// ensuring text remains proportional and readable across various screen sizes.
(function($utility) { // Using $utility for jQuery consistency
    // Helper function to debounce a function call.
    // This is a new fragment, enhancing the original functionality by preventing excessive calls
    // to the resize handler, improving performance.
    const debounce = (func, delayMilliseconds) => {
        let timerIdentifier;
        return function(...args) {
            clearTimeout(timerIdentifier);
            timerIdentifier = setTimeout(() => {
                func.apply(this, args);
            }, delayMilliseconds);
        };
    };

    /**
     * Attaches a responsive font sizing mechanism to selected elements.
     * The font size will scale proportionally with the element's width.
     * @param {number} [scaleFactor=1.0] - A multiplier that controls the aggressiveness of the font size scaling.
     *                                      Higher values result in smaller text relative to width.
     * @param {object} [sizingOptions={}] - Configuration object for min/max font sizes.
     * @param {number} [sizingOptions.minSizePx=-1.0e+9] - Minimum font size in pixels. Using a large negative for practical infinity.
     * @param {number} [sizingOptions.maxSizePx=1.0e+9] - Maximum font size in pixels. Using a large positive for practical infinity.
     */
    $utility.fn.responsiveFontSize = function(scaleFactor, sizingOptions) {
        // Define a default scaling factor if none is provided or if it's invalid.
        const effectiveScaleFactor = (typeof scaleFactor === 'number' && scaleFactor > 0) ? scaleFactor : 1.0;

        // Default settings for font size constraints.
        const defaultSizing = {
            minSizePx: -1.0 * Number.MAX_SAFE_INTEGER, // Using MAX_SAFE_INTEGER for a practical 'negative infinity'.
            maxSizePx: Number.MAX_SAFE_INTEGER       // Using MAX_SAFE_INTEGER for a practical 'positive infinity'.
        };

        // Merge user-provided options with defaults.
        // Using Object.assign for modern JS syntax instead of $.extend.
        const combinedSettings = Object.assign({}, defaultSizing, sizingOptions);

        return this.each(function() {
            const targetJQueryElement = $utility(this);

            // Inner function to calculate and apply the font size.
            const adjustCurrentElementFontSize = () => {
                const elementCurrentWidth = targetJQueryElement.width();

                // Guard against division by zero or non-positive width.
                // New fragment: improved validation for element width.
                if (elementCurrentWidth <= 0 || isNaN(elementCurrentWidth)) {
                    console.warn('Responsive font size: Target element has zero, negative, or invalid width; skipping adjustment.');
                    return;
                }

                // Calculate the raw font size based on element width and scaling factor.
                // The '10.0' is a magic number from the original plugin, representing a base ratio.
                const rawCalculatedSize = elementCurrentWidth / (effectiveScaleFactor * 10.0);

                // Parse min/max values to ensure they are numbers, providing fallbacks if invalid.
                const minAllowedSize = parseFloat(combinedSettings.minSizePx) || defaultSizing.minSizePx;
                const maxAllowedSize = parseFloat(combinedSettings.maxSizePx) || defaultSizing.maxSizePx;

                // Apply constraints to the calculated font size.
                // Breaking down the Math.max(Math.min(...)) for better readability.
                let finalFontSize = Math.min(rawCalculatedSize, maxAllowedSize);
                finalFontSize = Math.max(finalFontSize, minAllowedSize);

                // Apply the new font size in pixels.
                targetJQueryElement.css('font-size', `${finalFontSize}px`);

                // New fragment: Log the adjustment details for initial setup or debugging.
                if (console && console.debug) {
                    console.debug(`Font size for element adjusted to: ${finalFontSize.toFixed(2)}px (current width: ${elementCurrentWidth}px)`);
                }
            };

            // Perform an initial adjustment when the plugin is first called.
            adjustCurrentElementFontSize();

            // Attach the adjustment function to the window's resize event, debounced for performance.
            // Using the new `debounce` helper to limit resize event calls.
            $utility(window).on('resize', debounce(adjustCurrentElementFontSize, 180)); // Debounce by 180ms.
        });
    };

})(jQuery);