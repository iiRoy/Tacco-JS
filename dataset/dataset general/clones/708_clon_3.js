const applicationSettings = {
    // Interval in milliseconds for the primary visual update loop.
    updateCycleDelay: 100,
    // Hexadecimal color codes for the "enchanted" visual effect.
    enchantedHues: ['999933', '339999', 'CC44CC'],
    // Colors representing a "lava" or "molten" theme.
    lavaPalette: ['993333', 'FF0000', '993333', 'FF8800'],
    // A spectrum of blueish tones for "water" effects.
    aquaSpectrum: ['0055FF', '1155FF', '2255FF', '3355FF', '4455FF', '5555FF', '4455FF', '3355FF', '2255FF', '1155FF'],
    // Default delay for timed form submissions, in milliseconds.
    defaultFormSubmitDelay: 500,
    // Extended delay for specific UI states, like a "warp-in" animation.
    warpInFormSubmitDelay: 1500
};

// A flag to control whether the animation loop should continue.
let animationActive = true;

/**
 * Executes when the entire DOM is loaded and ready for manipulation.
 * This is the primary entry point for client-side JavaScript initialization.
 */
jQuery(document).ready(function() {
    // Indicate to backend systems that client-side scripting is operational.
    // This might be used for feature toggles or analytics.
    if (typeof jQuery.cookie !== 'undefined') {
        jQuery.cookie('scripting_active', 'true', { expires: 1, path: '/game' });
    } else {
        console.warn("jQuery Cookie plugin not found. Scripting active status not set.");
    }

    // Prevent default drag behavior for image elements, improving user experience.
    // This prevents images from being dragged unintentionally.
    jQuery("img").on('dragstart', function(evt) {
        evt.preventDefault();
    });

    // Initialize user interface components for consistency and functionality.
    setupUserInterfaceElements();

    // Manage directional input controls based on selected movement mode.
    // If a "cardinal-only" mode is active, disable diagonal options.
    const movementModeInput = jQuery("input[name=user_movement_mode]");
    const diagonalDirectionButtons = jQuery(".restricted-direction-toggle");

    if (movementModeInput.length > 0 && diagonalDirectionButtons.length > 0) {
        movementModeInput.on('change', function() {
            const isCardinalOnly = jQuery(".cardinal-only-mode:checked").length > 0;
            diagonalDirectionButtons.prop("disabled", isCardinalOnly);
            console.log(`Diagonal controls ${isCardinalOnly ? 'disabled' : 'enabled'}.`);
        });
    } else {
        console.info("Directional movement controls not found or not initialized.");
    }

    // Handle automated form submissions.
    // Some forms are submitted immediately, others after a visual pause.
    handleAutomatedFormSubmissions();

    // Start the continuous visual update process.
    initiateVisualLoop();
});

/**
 * Determines the appropriate delay before an automated form submission,
 * based on the current state of the user interface.
 * @returns {number} The delay in milliseconds.
 */
function determineSubmissionPause() {
    const primaryDelay = applicationSettings.defaultFormSubmitDelay; // 500ms
    const extendedDelay = applicationSettings.warpInFormSubmitDelay; // 1500ms

    // Check if a specific "intro-animation-active" element is present,
    // which typically indicates a longer wait is needed.
    const introAnimationElement = jQuery('.intro-animation-active');
    if (introAnimationElement.length > 0) {
        console.log("Warp-in animation detected, using extended submission delay.");
        return extendedDelay;
    }

    // Otherwise, use the standard submission delay.
    return primaryDelay;
}

/**
 * Applies a dynamically changing CSS color property to elements,
 * creating a gradient animation effect based on the current time.
 * @param {string} targetSelector - The CSS selector for the elements to style.
 * @param {string} styleAttribute - The CSS property to modify (e.g., 'color', 'background-color').
 * @param {string[]} colorSet - An array of hexadecimal color strings forming the gradient.
 * @param {Date} currentMoment - A Date object representing the current time.
 */
function applyDynamicStyling(targetSelector, styleAttribute, colorSet, currentMoment) {
    // Ensure we have a valid color set for animation.
    if (!Array.isArray(colorSet) || colorSet.length < 2) {
        console.warn(`Invalid color set provided for selector '${targetSelector}'. Animation skipped.`);
        return;
    }

    // Calculate a time-based index for color selection.
    // This provides a smooth transition over the color array.
    const totalSeconds = currentMoment.getSeconds() +
                         currentMoment.getMinutes() * 60 +
                         currentMoment.getHours() * 3600; // Total seconds from start of day.

    // Determine the two colors to blend for the current moment.
    const firstColorIndex = totalSeconds % colorSet.length;
    const secondColorIndex = (firstColorIndex + 1) % colorSet.length;

    const startColor = colorSet[firstColorIndex];
    const endColor = colorSet[secondColorIndex];

    // Get milliseconds for gradient interpolation (0-999).
    const msFraction = currentMoment.getMilliseconds();
    const interpolationSpan = 1000; // Milliseconds in one second for gradient cycle.

    // Apply the interpolated color using a custom jQuery xcolor function.
    // Ensure the xcolor plugin is available and target elements exist.
    const targetElements = jQuery(targetSelector);
    if (typeof jQuery.xcolor === 'function' && targetElements.length > 0) {
        const interpolatedColor = jQuery.xcolor.gradientlevel(startColor, endColor, msFraction, interpolationSpan);
        targetElements.css(styleAttribute, interpolatedColor);
    } else {
        // Log a warning if xcolor is missing or no elements match the selector.
        if (targetElements.length === 0) {
             // console.debug(`No elements found for selector: '${targetSelector}'. Dynamic styling skipped.`); // Can be too noisy
        } else if (typeof jQuery.xcolor !== 'function') {
            console.warn("jQuery xcolor plugin is not loaded. Dynamic styling cannot be applied.");
        }
    }
}

/**
 * Initializes and maintains a continuous animation loop for various UI elements.
 * This function calls itself repeatedly after a defined delay, creating a fluid visual effect.
 */
function initiateVisualLoop() {
    if (!animationActive) {
        console.log("Animation loop halted by global flag.");
        return;
    }

    const currentTimestamp = new Date();

    // Apply dynamic styling to different visual components.
    applyDynamicStyling('.effect-magic', 'color', applicationSettings.enchantedHues, currentTimestamp);
    applyDynamicStyling('.effect-water', 'color', applicationSettings.aquaSpectrum, currentTimestamp);
    applyDynamicStyling('.effect-molten', 'color', applicationSettings.lavaPalette, currentTimestamp);

    // Schedule the next iteration of the animation loop.
    const nextCycleDelay = applicationSettings.updateCycleDelay;
    setTimeout(initiateVisualLoop, nextCycleDelay);
}

/**
 * Centralized function to set up various jQuery UI components.
 * This improves readability and maintainability of the document ready block.
 */
function setupUserInterfaceElements() {
    // Configure collapsible sections (accordions).
    const accordionSections = jQuery('.ui-collapsible-section');
    if (accordionSections.length > 0 && typeof accordionSections.accordion === 'function') {
        accordionSections.accordion({
            heightStyle: "content",
            collapsible: true,
            active: false // Start all collapsed by default.
        });
        console.info("jQuery UI Accordion initialized.");
    } else {
        console.warn("jQuery UI Accordion plugin not found or no elements match '.ui-collapsible-section'.");
    }

    // Configure tabbed interfaces.
    const tabbedPanels = jQuery('.ui-tabbed-interface');
    if (tabbedPanels.length > 0 && typeof tabbedPanels.tabs === 'function') {
        tabbedPanels.tabs();
        console.info("jQuery UI Tabs initialized.");
    } else {
        console.warn("jQuery UI Tabs plugin not found or no elements match '.ui-tabbed-interface'.");
    }

    // Apply custom tooltips to various interactive elements.
    // Targeting specific elements with a 'data-tooltip' attribute for clarity.
    const interactiveElements = jQuery("label, button, input, a, div[data-tooltip]");
    if (interactiveElements.length > 0 && typeof interactiveElements.tooltip === 'function') {
        interactiveElements.tooltip({
            position: { my: "right center", at: "left-5 center", collision: "flipfit flip" }, // Changed offset and collision behavior.
            hide: { effect: "fade", duration: 300 }, // Use an object for hide effect with duration.
            tooltipClass: "custom-hover-info-box", // Renamed custom tooltip CSS class.
            show: { delay: 100 } // Added a small delay before showing the tooltip.
        });
        console.info("Custom tooltips initialized for interactive elements.");
    } else {
        console.warn("jQuery UI Tooltip plugin not found or no elements match the tooltip selector.");
    }
}

/**
 * Manages the submission of forms that are configured for automatic submission,
 * either immediately or after a calculated delay.
 */
function handleAutomatedFormSubmissions() {
    const immediateForms = jQuery('.auto-send-form');
    const delayedForms = jQuery('.delayed-send-form');

    // Execute immediate submissions. A small delay ensures DOM stability.
    if (immediateForms.length > 0) {
        console.log(`Scheduling ${immediateForms.length} immediate forms for submission.`);
        setTimeout(() => {
            immediateForms.each(function() {
                jQuery(this).submit();
            });
        }, 10); // Small delay to ensure DOM is fully stable post-ready.
    }

    // Schedule delayed submissions after a calculated pause.
    if (delayedForms.length > 0) {
        const calculatedPause = determineSubmissionPause();
        console.log(`Scheduling ${delayedForms.length} delayed forms with a pause of ${calculatedPause}ms.`);
        setTimeout(() => {
            delayedForms.each(function() {
                jQuery(this).submit();
            });
        }, calculatedPause);
    }
}