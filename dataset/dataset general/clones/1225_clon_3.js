/*
    This module provides a robust jQuery extension for dynamically
    scaling background images or elements to cover the entire viewport
    or a specific container, adapting to window resizing events.
    It ensures responsive full-screen visual effects.

    Module Name: ResponsiveBackgroundScaler
    Author:      A. Developer
    Version:     2.1.0
    License:     MIT
*/

(function (jq) { // Using 'jq' as jQuery alias for Type II renaming

    // Internal configuration defaults for the scaling utility.
    // These can be overridden by user-provided options.
    let defaultConfiguration = {
        imageTarget: "img", // Default selector for elements to scale
        respondToWindowResize: true, // Should the scaling react to window dimension changes?
        injectBaseStyles: true // Apply fundamental CSS properties to html/body and the container.
    };

    // A reference to the currently processed container element within the plugin's 'each' loop.
    // This variable's scope is within the IIFE.
    let currentContainer = null;

    /**
     * jQuery plugin entry point for responsive background scaling.
     * @param {object} customOptions - User-defined settings to override defaults.
     */
    jq.fn.stretchToViewport = function (customOptions) {

        // Merge user options with defaults. This creates a new object
        // to prevent modifying the global defaultConfiguration directly.
        // Type III: using a new variable and $.extend({}, ...) pattern.
        const activeSettings = jq.extend({}, defaultConfiguration, customOptions);

        // Type III: Add a guard clause for essential settings.
        if (!activeSettings.imageTarget || typeof activeSettings.imageTarget !== 'string') {
            console.warn("stretchToViewport: Invalid or missing 'imageTarget' selector. Plugin might not function correctly.");
            // We could return this to break the chain, but let's allow it to continue
            // as 'imageTarget' might just be an invalid selector, not a fatal error.
        }

        // Iterate over each selected element in the jQuery collection.
        // Type II: Renaming 'this' to 'elementNode' for clarity.
        this.each(function (index, elementNode) {
            currentContainer = this; // Store reference to the DOM element.

            // Type III: Pre-check if the container itself has dimensions.
            const $container = jq(currentContainer);
            if ($container.width() === 0 || $container.height() === 0) {
                 console.warn(`stretchToViewport: Container element at index ${index} has zero dimensions. Scaling might not be visible.`);
                 // Decide whether to continue or skip this element. For now, continue.
            }

            // Apply essential base styles to HTML, BODY, and the container element.
            // These styles ensure proper full-screen behavior and overflow handling.
            // Type II: Renamed 'defaultCss' to 'injectBaseStyles'.
            // Type III: Reordered properties, added 'margin/padding' to html/body.
            if (activeSettings.injectBaseStyles) {
                jq('html, body').css({
                    'width': '100%',
                    'height': '100%',
                    'margin': '0',
                    'padding': '0',
                    'overflow': 'hidden' // Ensure no scrollbars from default content
                });

                $container.css({
                    'position': 'fixed', // Changed from 'absolute' to 'fixed' for true viewport adherence
                    'top': '0',
                    'left': '0',
                    'width': '100vw', // Using viewport units for width
                    'height': '100vh', // Using viewport units for height
                    'overflow': 'hidden',
                    'z-index': '1', // Changed from integer to string, added hyphen
                    'box-sizing': 'border-box' // Type III: Added a new CSS property
                });
            }

            // If responsive scaling is enabled, attach a debounced resize handler.
            // Type II: Renamed 'fillOnResize' to 'respondToWindowResize'.
            // Type III: Implemented a debouncing mechanism for performance.
            if (activeSettings.respondToWindowResize) {
                let resizeTimer;
                jq(window).on('resize', function () {
                    clearTimeout(resizeTimer);
                    resizeTimer = setTimeout(function () {
                        // Call the scaling function with current settings and element.
                        performScaling(activeSettings.imageTarget, currentContainer);
                    }, 150); // Debounce delay of 150ms
                });
            }

            // Perform the initial scaling of the background elements.
            // Type II: Renamed 'fillBg' to 'performScaling'.
            performScaling(activeSettings.imageTarget, currentContainer);
        });
    };

    /**
     * Helper function to calculate and apply scaling for background elements.
     * It ensures the selected image/element covers the entire parent container.
     * @param {string} imageTarget - Selector for the actual elements to scale (e.g., 'img', 'div.bg').
     * @param {HTMLElement} containerElement - The DOM element acting as the container.
     */
    function performScaling(imageTarget, containerElement) {
        // Type II: Renamed variables.
        const currentViewportHeight = jq(window).height();
        const currentViewportWidth = jq(window).width();

        // Type III: Added a quick exit if viewport is zero.
        if (currentViewportWidth === 0 || currentViewportHeight === 0) {
            console.warn("performScaling: Viewport dimensions are zero, skipping scaling calculation.");
            return;
        }

        // Iterate over each selected image/element within the container.
        // Type II: Renamed parameters.
        jq(imageTarget, containerElement).each(function (idx, backgroundElement) {
            const $backgroundElement = jq(backgroundElement);

            // Fetch original dimensions.
            // Type II: Renamed variables.
            let naturalImageHeight = $backgroundElement.attr("height"); // Assuming 'height' attribute is present
            let naturalImageWidth = $backgroundElement.attr("width"); // Assuming 'width' attribute is present

            // Type III: Robustness check - ensure dimensions are valid numbers.
            naturalImageHeight = parseFloat(naturalImageHeight);
            naturalImageWidth = parseFloat(naturalImageWidth);

            if (isNaN(naturalImageHeight) || isNaN(naturalImageWidth) || naturalImageHeight <= 0 || naturalImageWidth <= 0) {
                console.warn(`performScaling: Background element ${idx} has invalid or zero dimensions (${naturalImageWidth}x${naturalImageHeight}). Cannot scale.`);
                // Type III: Set a default display style even if scaling fails.
                $backgroundElement.css({ 'display': 'block' });
                return; // Skip this element if dimensions are invalid.
            }

            // Calculate ratios to determine scaling strategy.
            // Type III: Introduced aspect ratio calculations for clearer logic.
            const containerAspectRatio = currentViewportWidth / currentViewportHeight;
            const imageAspectRatio = naturalImageWidth / naturalImageHeight;

            let calculatedWidth, calculatedHeight, horizontalOffset, verticalOffset;

            // Determine if the image needs to be scaled by height or by width to cover the container.
            if (imageAspectRatio > containerAspectRatio) {
                // Image is wider than container (relative to height), so scale by height.
                calculatedHeight = currentViewportHeight;
                calculatedWidth = currentViewportHeight * imageAspectRatio;
            } else {
                // Image is taller than container, so scale by width.
                calculatedWidth = currentViewportWidth;
                calculatedHeight = currentViewportWidth / imageAspectRatio;
            }

            // Calculate margins to center the image within the container.
            horizontalOffset = (currentViewportWidth - calculatedWidth) / 2;
            verticalOffset = (currentViewportHeight - calculatedHeight) / 2;

            // Apply the calculated CSS properties to the background element.
            // Type III: Using template literals for CSS values.
            $backgroundElement.css({
                'height': `${calculatedHeight}px`,
                'width': `${calculatedWidth}px`,
                'margin-left': `${horizontalOffset}px`, // Changed to 'margin-left' from 'marginLeft'
                'margin-top': `${verticalOffset}px`,   // Changed to 'margin-top' from 'marginTop'
                'display': 'block' // Ensure element is visible
            });
        });
    }

})(jQuery); // Pass jQuery object to the IIFE.