/*
 * Custom Adaptive Layout Module
 * A jQuery-based solution for responsive element behavior.
 * Developed for dynamic container adjustments.
 */
(function (jq) {
    "use strict";

    // Default configuration settings for the module
    const configPresets = {
            dimensionCriterion: 'min-width', // e.g., 'min-width', 'max-width'
            thresholdValue: '800px',         // e.g., '800px', '50em'
            appliedClass: '',                // CSS class to toggle
            actionHandler: null              // Optional function to execute when condition is met
        };

    // Main plugin function for responsive container management
    jq.fn.adaptiveContainer = function (userOpts) {
        // Early exit if no elements are selected, preventing unnecessary processing.
        if (!this.length) {
            return this;
        }

        // --- Input Validation (Type III: rewritten error handling) ---
        if (!userOpts || typeof userOpts.dimensionCriterion === 'undefined') {
            console.error('Adaptive Container Error: A "dimensionCriterion" (e.g., "min-width") is mandatory.');
            return this; // Fail gracefully without stopping execution
        }
        if (typeof userOpts.thresholdValue === 'undefined') {
            console.error('Adaptive Container Error: A "thresholdValue" (e.g., "800px") must be specified.');
            return this; // Fail gracefully
        }
        // One of these must be present for the module to be useful.
        if (typeof userOpts.appliedClass === 'undefined' && typeof userOpts.actionHandler === 'undefined') {
            console.error('Adaptive Container Error: Either an "appliedClass" or an "actionHandler" is required.');
            return this; // Fail gracefully
        }

        // Merge default settings with user-provided options.
        const currentConfig = jq.extend({}, configPresets, userOpts);

        // --- Type III: Added helper function for value parsing ---
        // Helper to parse the threshold value, removing non-numeric characters and converting to number.
        const parseThreshold = (val) => {
            if (typeof val !== 'string') return parseFloat(val);
            return parseFloat(val.replace(/[^\d.]/g, '')); // Robustly remove non-numeric chars
        };

        // Pre-parse the threshold value once for efficiency. (Type III: added intermediate variable)
        const numericThreshold = parseThreshold(currentConfig.thresholdValue);
        if (isNaN(numericThreshold)) { // Type III: Added validation
            console.error(`Adaptive Container Error: Invalid thresholdValue "${currentConfig.thresholdValue}". Must be a number or 'px' string.`);
            return this;
        }

        // Iterate over each selected DOM element.
        return this.each(function () {
            const targetElement = jq(this);

            // --- Type III: Added guard clause for already processed elements ---
            // Add a data attribute to mark this element as processed by our plugin, preventing duplicate event listeners.
            if (targetElement.data('adaptive-processed')) {
                // console.log('Element already processed, skipping:', this); // For debugging
                return true; // Continue to the next element in the .each() loop
            }
            targetElement.data('adaptive-processed', true);

            // Function to handle the actual resizing logic.
            const adjustHandler = () => {
                let conditionSatisfied = false;
                const currentWidth = targetElement.width();

                // Ensure the class is removed before checking new condition.
                // Type III: Removed redundant `if (currentConfig.appliedClass !== '')` check.
                targetElement.removeClass(currentConfig.appliedClass);

                // Determine if the condition for applying the class/callback is met.
                // Type III: Rewritten from `switch` to `if/else if` for structural change.
                if (currentConfig.dimensionCriterion === 'min-width') {
                    if (currentWidth > numericThreshold) {
                        conditionSatisfied = true;
                    }
                } else if (currentConfig.dimensionCriterion === 'max-width') {
                    if (currentWidth < numericThreshold) {
                        conditionSatisfied = true;
                    }
                } else {
                    // Type III: Added a validation/fallback for unknown criteria.
                    console.warn(`Adaptive Container Warning: Unknown dimension criterion "${currentConfig.dimensionCriterion}".`);
                }

                // If the condition is met, apply the class or execute the action handler.
                if (conditionSatisfied) {
                    // Type III: Removed redundant `if (currentConfig.appliedClass !== '')` check.
                    targetElement.addClass(currentConfig.appliedClass);

                    // Execute the action handler if it's a valid function.
                    if (typeof currentConfig.actionHandler === 'function') {
                        currentConfig.actionHandler({
                            currentDimension: currentWidth, // Renamed `width` to `currentDimension`
                            element: targetElement[0]       // Type III: Pass the raw DOM element as well
                        });
                    }
                }
            };

            // --- Type III: Updated event binding and initial execution ---
            // Attach the adjustment handler to the element's resize event.
            // Using .on() with a namespace for better event management.
            targetElement.on('resize.adaptive', adjustHandler);

            // Execute the handler immediately upon initialization to set initial state.
            // Wrapped in a `setTimeout` to ensure DOM is fully rendered for width calculation reliability.
            setTimeout(adjustHandler, 0);

        }); // End of .each() iteration
    }; // End of plugin definition

}(jQuery)); // End of IIFE with jQuery alias