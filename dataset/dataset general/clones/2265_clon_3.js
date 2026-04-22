/*
 * verticalSnap.js - v2.1
 * Copyright (c) 2023, John Doe. All rights reserved.
 * Licensed under the MIT License.
 *
 * A jQuery-based utility for aligning elements to a vertical grid.
 * This script ensures that an element's maximum height is always a multiple
 * of a defined rhythm unit, adjusting dynamically with viewport changes.
 * Last Modified: 2023-10-27
 */
(function(jqAlias) {

    // Define the plugin method within the jQuery namespace
    // The 'spacingSettings' parameter can be a number (fixed grid unit)
    // or an object (breakpoint-based grid units).
    jqAlias.fn.verticalSnap = function(spacingSettings) {

        // Initialize internal state variables for the alignment process.
        // These will be used and potentially updated within the scope of each element's processing.
        let originalHeightVal;      // Stores the initial computed height of the target element.
        let finalVerticalDim;       // Holds the calculated height after snapping to the grid.
        let rhythmIncrement = 0;    // The fundamental unit for vertical alignment, defaults to 0.

        // Return the jQuery object to maintain chainability, processing each selected element.
        return this.each(function() {
            const targetObject = jqAlias(this); // Cache the current DOM element as a jQuery object for efficiency.

            // Inner function responsible for calculating and applying the vertical alignment.
            // This function encapsulates the core logic and is called on load and resize.
            const updateVerticalDimensions = function(configData) {
                // Pre-check: Ensure valid configuration data is provided.
                if (!configData) {
                    console.warn("verticalSnap: Configuration missing for element, skipping alignment.", targetObject);
                    return; // Exit early if no settings are available.
                }

                // Get the current viewport width. Using jQuery's window width for cross-browser consistency.
                const currentViewportWidth = jqAlias(window).width();

                // Determine the appropriate rhythm increment based on the provided configuration.
                if (typeof configData === 'number') {
                    // Case 1: If a single number is given, use it directly as the fixed rhythm unit.
                    rhythmIncrement = configData;
                } else if (typeof configData === 'object' && configData !== null) {
                    // Case 2: If an object is given, it's treated as a set of breakpoints.
                    let bestMatchUnit = 0;         // Temporary storage for the most suitable grid unit found.
                    let currentMaxThreshold = 0;   // Keeps track of the largest width threshold met so far.

                    // Iterate through the breakpoint configuration object.
                    for (const thresholdStr in configData) {
                        // Ensure the property belongs to the object itself, not its prototype chain.
                        if (Object.prototype.hasOwnProperty.call(configData, thresholdStr)) {
                            const parsedWidth = parseInt(thresholdStr, 10); // Parse the string key (e.g., "768") to an integer.

                            // Check if the parsed width is a valid number and if the current viewport
                            // width meets or exceeds this threshold, and if this threshold is the largest encountered yet.
                            if (!isNaN(parsedWidth) && currentViewportWidth >= parsedWidth && parsedWidth >= currentMaxThreshold) {
                                bestMatchUnit = configData[thresholdStr]; // Update with the corresponding rhythm unit.
                                currentMaxThreshold = parsedWidth;        // Update the largest matched threshold.
                            }
                        }
                    }
                    rhythmIncrement = bestMatchUnit; // Apply the best unit determined from the breakpoints.
                } else {
                    // Handle invalid configuration type.
                    console.warn("verticalSnap: Invalid configuration type provided. Must be a number or an object.", targetObject);
                    return;
                }

                // Critical validation: Ensure the rhythm increment is a positive, valid number.
                // Prevents division by zero or nonsensical calculations.
                if (rhythmIncrement <= 0 || isNaN(rhythmIncrement)) {
                    console.warn("verticalSnap: Invalid or zero rhythm increment detected. Skipping alignment for element.", targetObject);
                    return; // Abort if the rhythm unit is unusable.
                }

                // Temporarily clear any existing max-height to ensure we get the true current height.
                // Using 'initial' explicitly resets the property to its default value.
                targetObject.css('max-height', 'initial');
                originalHeightVal = targetObject.height(); // Fetch the element's current computed height.

                // Calculate the new height, snapping it down to the nearest multiple of the rhythm increment.
                // This ensures the element's height adheres to the vertical grid.
                const remainder = originalHeightVal % rhythmIncrement;
                finalVerticalDim = originalHeightVal - remainder;

                // Edge case handling: If the calculation results in a zero height but the original height was positive,
                // ensure a minimum height of at least one rhythm unit to prevent elements from disappearing.
                if (finalVerticalDim <= 0 && originalHeightVal > 0) {
                     finalVerticalDim = rhythmIncrement;
                }

                // Apply the calculated max-height to the element.
                targetObject.css('max-height', finalVerticalDim + 'px');

                // Optional: Add a data attribute to the element for debugging or further CSS styling hooks.
                targetObject.data('snapped-height', finalVerticalDim);
            };

            // Execute the alignment logic immediately upon page load for this specific element.
            // This sets the initial state of the element based on the current viewport.
            updateVerticalDimensions(spacingSettings);

            // Attach the alignment logic to the window's 'resize' event.
            // Namespacing the event ('resize.verticalSnap') allows for easier unbinding if needed,
            // preventing conflicts with other resize handlers.
            jqAlias(window).on('resize.verticalSnap', function() {
                updateVerticalDimensions(spacingSettings); // Re-run alignment when viewport dimensions change.
            });

        }); // End of the .each() loop, ensuring chainability.

    }; // End of the plugin definition.

})(jQuery); // Pass the jQuery object as an argument, aliasing it internally as 'jqAlias'.