// This script manages the dynamic application of visual depth enhancements to various UI components
// upon the completion of the document's structure loading. It employs a custom jQuery extension
// to render diverse shading and border effects, improving the aesthetic presentation.

// --- Global Setup and Environment Checks ---

// A crucial initial check to ensure the primary dependency, jQuery, is loaded and available.
// Without jQuery, the visual effects module cannot function as intended.
if (typeof jQuery === 'undefined' || typeof jQuery.fn.depthDecorator === 'undefined') {
    // Log a critical error if jQuery or the required custom plugin is missing.
    // This prevents runtime errors and informs developers of a missing dependency.
    console.error('Critical dependency missing: jQuery library or its "depthDecorator" plugin not found. Visual enhancements cannot be initialized.');
} else {
    // Proceed with the initialization logic once jQuery and the plugin are confirmed present.
    // This block executes when the DOM is fully constructed and ready for manipulation.
    jQuery(function() { // Utilizes jQuery's shorthand for document.ready, ensuring DOM readiness.

        // --- Configuration Definition ---

        // An extensive array defining each distinct visual effect configuration.
        // Each entry specifies a target CSS selector and its unique set of options
        // for the 'depthDecorator' plugin. This structured approach replaces
        // multiple individual calls, making the configuration more maintainable.
        const graphicEffectConfigurations = [
            {
                elementTarget: '.display-unit.plain-appearance', // Renamed target class
                effectSettings: null // Applies default depth effect settings
            },
            {
                elementTarget: '.display-unit.elevated-visual', // Renamed target class
                effectSettings: 'elevated-mode' // A string alias for a specific effect style
            },
            {
                elementTarget: '.display-unit.perspective-shift', // Renamed target class
                effectSettings: 'perspective-view' // Another string alias for a distinct effect
            },
            {
                elementTarget: '.display-unit.raised-profile', // Renamed target class
                effectSettings: 'protruding-style' // String alias for a prominent effect
            },
            {
                elementTarget: '.display-unit.side-vertical-tier-one', // Renamed target class
                effectSettings: { visualKind: 'borders', borderDirection: 'vertical-tier-1' } // Object with renamed keys
            },
            {
                elementTarget: '.display-unit.side-vertical-tier-two', // Renamed target class
                effectSettings: { visualKind: 'borders', borderDirection: 'vertical-tier-2' } // Object with renamed keys
            },
            {
                elementTarget: '.display-unit.side-horizontal-tier-one', // Renamed target class
                effectSettings: { visualKind: 'borders', borderDirection: 'horizontal-tier-1' } // Object with renamed keys
            },
            {
                elementTarget: '.display-unit.side-horizontal-tier-two', // Renamed target class
                effectSettings: { visualKind: 'borders', borderDirection: 'horizontal-tier-2' } // Object with renamed keys
            },
            {
                elementTarget: '.display-unit.angular-tilt', // Renamed target class
                effectSettings: (function() { // Using an Immediately Invoked Function Expression (IIFE)
                                                // to dynamically generate complex options, adding an intermediate step.
                    const tiltAngleDegrees = -5; // Original rotation value in degrees.
                    const tiltAngleRadians = tiltAngleDegrees * (Math.PI / 180); // Conversion to radians for variation.
                    return { visualKind: 'rotated', rotationValue: `${tiltAngleRadians}rad` }; // Renamed keys and value format.
                })()
            }
        ];

        // --- Core Application Logic ---

        /**
         * A dedicated utility function to safely apply a visual depth effect to a collection of elements.
         * It includes a robust check to ensure the custom plugin method exists before invocation.
         * @param {jQuery} $elementsToDecorate - The jQuery object containing the elements selected for decoration.
         * @param {object|string|null} decorationOptions - The configuration object or string alias for the depth effect.
         */
        const executeDepthDecoration = function($elementsToDecorate, decorationOptions) {
            // Guard clause: Prevents errors if the 'depthDecorator' method is somehow missing on the jQuery object.
            if (typeof $elementsToDecorate.depthDecorator === 'function') {
                $elementsToDecorate.depthDecorator(decorationOptions);
            } else {
                // Warns if the plugin method is unavailable for specific elements, aiding debugging.
                console.warn(`'depthDecorator' plugin method is not accessible. Skipping effect for: '${$elementsToDecorate.selector}'`);
            }
        };

        // --- Iterative Effect Application ---

        // Loop through each defined configuration to apply the respective visual effects.
        // This loop replaces multiple redundant direct calls, centralizing the application process.
        for (let idx = 0; idx < graphicEffectConfigurations.length; idx++) {
            const currentGraphicConfig = graphicEffectConfigurations[idx]; // Intermediate variable for current configuration.
            const targetElementsCollection = jQuery(currentGraphicConfig.elementTarget); // Intermediate variable for selected elements.

            // Conditional check: Only attempt to apply effects if the selector found actual elements.
            // This prevents unnecessary operations on empty selections.
            if (targetElementsCollection.length > 0) {
                executeDepthDecoration(targetElementsCollection, currentGraphicConfig.effectSettings);
            } else {
                // Optional: A diagnostic message for selectors that yield no elements.
                // This can be removed in production builds for a cleaner console.
                // console.info(`No DOM elements matched the selector: '${currentGraphicConfig.elementTarget}'. Skipping decoration.`);
            }
        }

        // --- Additional, Flexible Effect Application ---

        // This section demonstrates a more generalized application, potentially overriding or
        // adding effects to elements not explicitly covered by the initial configurations,
        // or applying a base style across a broader range of elements.
        const allPotentialDecoratables = jQuery('.display-unit'); // Selects all elements with the base class.

        // Another guard clause to ensure the plugin is available for this broad application.
        if (allPotentialDecoratables.length > 0 && typeof allPotentialDecoratables.depthDecorator === 'function') {
            // Iterate over each selected element to apply a default or conditional effect.
            // This 'each' loop provides fine-grained control for individual elements.
            allPotentialDecoratables.each(function() {
                const individualItem = jQuery(this); // Reference to the current element in the iteration.

                // Introduce new conditional logic: only apply a basic effect if the element
                // does not already possess a specific custom depth class, preventing unwanted re-applications.
                if (!individualItem.hasClass('has-distinct-depth-style')) {
                    individualItem.depthDecorator({ visualKind: 'simple-outline', outlineWidth: '1px' });
                }
            });
        }
    });
}