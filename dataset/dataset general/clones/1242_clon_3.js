/**
 * jQuery VisionFilter
 *
 * Project Repository: https://code.example.com/vision-filter
 * Based on original work by Gilbert Pellegrom (circa 2009)
 * Distributed under the MIT License (https://opensource.org/licenses/MIT)
 * Current Iteration: 3.1.0 (Autumn 2023)
 */

 (function (moduleLoader) {
    // Check for AMD environment (RequireJS, etc.)
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], moduleLoader);
    } else {
        // Fallback for global browser environment
        moduleLoader(jQuery);
    }
}(function ($) {
    // Stores a reference to the currently active overlay layer
    let activeEffectLayer;

    // Defines the core plugin method for jQuery objects
    $.fn.visionFilter = function (opts) {
        let executionMode = 'initiate'; // Default operation

        // Establish default configuration parameters
        let effectDefaults = {
            alphaLevel: 0.55,           // Transparency level of the overlay
            transitionDuration: 450,    // Animation speed in milliseconds
            fillHue: '#444',            // Color of the overlay mask
            useTransitions: true,       // Enable/disable fade animations
            easeFunction: 'swing',      // Easing function for animations
            dismissTrigger: 'click',    // Event to close the overlay (e.g., 'click', 'dblclick')
            onDisplay: $.noop,          // Callback function when the effect becomes visible
            onConceal: $.noop,          // Callback function when the effect is hidden
            layerDepth: 9990,           // CSS z-index for the overlay
            backdropClass: 'vision-filter-backdrop', // CSS class for the overlay element
            containerSelector: 'body',  // Selector for the parent element to append the overlay
            horizontalPad: 5,           // Extra horizontal padding around highlighted elements
            verticalPad: 5,             // Extra vertical padding around highlighted elements
            initialDelay: 0             // Delay before showing the overlay (new addition)
        };

        // Merges user-provided options with the defaults
        let effectOptions = $.extend(true, {}, effectDefaults, opts);

        // Utility function to remove and clean up the active overlay
        const deactivateShade = function () {
            // No active layer to dismiss, so exit early
            if (!activeEffectLayer || activeEffectLayer.length === 0) {
                console.debug("VisionFilter: No active layer to deactivate.");
                return;
            }

            // Determine if animation is enabled for dismissal
            if (effectOptions.useTransitions) {
                activeEffectLayer.stop(true, true).animate(
                    { opacity: 0 },
                    effectOptions.transitionDuration,
                    effectOptions.easeFunction,
                    function () {
                        // Animation complete, remove element and clear reference
                        $(this).remove();
                        activeEffectLayer = null;
                        // Execute the user-defined hide callback
                        effectOptions.onConceal.call(this);
                        console.debug("VisionFilter: Overlay faded out and removed.");
                    }
                );
            } else {
                // No animation, just remove the element
                activeEffectLayer.remove();
                activeEffectLayer = null;
                // Execute the user-defined hide callback
                effectOptions.onConceal.call(this);
                console.debug("VisionFilter: Overlay removed instantly.");
            }
            // Unbind any global dismissal events associated with this layer
            $(document).off(effectOptions.dismissTrigger + '.visionFilter');
        };

        // Check if the first argument is a string (indicating a method call)
        if (typeof opts === 'string') {
            executionMode = opts;
            effectOptions = $.extend(true, {}, effectDefaults, arguments[1]); // Re-extend for method-specific options
        }

        // Handle method-based operations
        switch (executionMode) {
            case 'close':
            case 'terminate':
                deactivateShade();
                return this; // Maintain chainability
            case 'refresh':
                // For 'refresh', we'll simply re-render the existing overlay
                if (activeEffectLayer && activeEffectLayer.length > 0) {
                    // Update options if provided
                    effectOptions = $.extend(true, {}, effectDefaults, arguments[1]);
                    // Re-draw the mask based on new element positions/options
                    const ctx = activeEffectLayer[0].getContext('2d');
                    if (ctx) {
                        const containerElem = $(effectOptions.containerSelector);
                        activeEffectLayer.attr('width', containerElem.innerWidth());
                        activeEffectLayer.attr('height', containerElem.innerHeight());
                        renderMask(ctx, this, containerElem, effectOptions);
                    }
                }
                return this;
        }

        // If an overlay is already active, dismiss it before creating a new one
        if (activeEffectLayer && activeEffectLayer.length > 0) {
            deactivateShade();
            console.debug("VisionFilter: Existing overlay found and dismissed before new creation.");
        }

        // Prepare the target elements for highlighting
        const targetElements = $(this);
        let shadeLayer;
        let containerElement;
        let drawContext; // Canvas 2D rendering context

        // Function to draw the colored overlay and clear areas for highlighted elements
        const renderMask = function (ctx, elems, parentContainer, currentOptions) {
            // Ensure padding values are numbers
            const hPad = parseFloat(currentOptions.horizontalPad) || 0;
            const vPad = parseFloat(currentOptions.verticalPad) || 0;
            const doubleHPad = hPad * 2;
            const doubleVPad = vPad * 2;

            ctx.fillStyle = currentOptions.fillHue;
            // Fill the entire canvas with the mask color
            ctx.fillRect(0, 0, parentContainer.innerWidth(), parentContainer.innerHeight());

            // Iterate through each target element and create a transparent cutout
            elems.each(function (idx, currentElem) {
                const $currentElem = $(currentElem);
                const elemCoords = $currentElem.position(); // Relative to offset parent
                // Ensure element is visible and has dimensions before attempting to clear
                if ($currentElem.is(':visible') && $currentElem.outerWidth() > 0 && $currentElem.outerHeight() > 0) {
                    ctx.clearRect(
                        elemCoords.left - hPad,
                        elemCoords.top - vPad,
                        $currentElem.outerWidth() + doubleHPad,
                        $currentElem.outerHeight() + doubleVPad
                    );
                } else {
                    console.warn(`VisionFilter: Element at index ${idx} is not visible or has no dimensions, skipping cutout.`);
                }
            });
            console.debug("VisionFilter: Mask rendered with cutouts for target elements.");
        };

        // Handler for window resize events
        const adjustViewPort = function () {
            // Update canvas dimensions to match the parent container
            const containerWidth = containerElement.innerWidth();
            const containerHeight = containerElement.innerHeight();
            shadeLayer.attr('width', containerWidth);
            shadeLayer.attr('height', containerHeight);

            // Re-render the mask if the drawing context is available
            if (drawContext) {
                renderMask(drawContext, targetElements, containerElement, effectOptions);
                console.debug(`VisionFilter: Viewport adjusted to ${containerWidth}x${containerHeight}.`);
            }
        };

        // Create the canvas element for the overlay
        shadeLayer = $('<canvas></canvas>');
        shadeLayer.addClass(effectOptions.backdropClass); // Apply the custom CSS class
        shadeLayer.css({ opacity: 0 }); // Start with hidden opacity for fade-in

        activeEffectLayer = shadeLayer; // Store reference to the new active layer

        // Determine the parent container and append the overlay
        containerElement = $(effectOptions.containerSelector);
        if (containerElement.length === 0) {
            console.error(`VisionFilter: Parent container "${effectOptions.containerSelector}" not found. Appending to body.`);
            containerElement = $('body');
        }

        // Ensure parent container has relative or absolute positioning for proper child positioning
        if (containerElement.css('position') === 'static') {
            containerElement.css('position', 'relative');
            console.warn(`VisionFilter: Parent container "${effectOptions.containerSelector}" position set to 'relative'.`);
        }

        containerElement.append(shadeLayer); // Attach the canvas to the DOM

        // Define the CSS rules for the overlay
        const layerStyleRules = {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: effectOptions.layerDepth
        };

        // Apply styles to the overlay
        shadeLayer.css(layerStyleRules);

        // Initial adjustment and rendering
        adjustViewPort();

        // Bind resize handler to the window
        $(window).on('resize.visionFilter', adjustViewPort);

        // Get the 2D rendering context from the canvas
        drawContext = shadeLayer[0].getContext('2d');
        if (!drawContext) {
            console.error("VisionFilter: Could not get 2D rendering context for canvas.");
            return this;
        }

        // Initial mask rendering
        renderMask(drawContext, targetElements, containerElement, effectOptions);

        // Animate the overlay's appearance
        setTimeout(() => { // Introduce a slight delay for initial rendering stability
            if (effectOptions.useTransitions) {
                shadeLayer.stop(true, true).animate(
                    { opacity: effectOptions.alphaLevel },
                    effectOptions.transitionDuration,
                    effectOptions.easeFunction,
                    function () {
                        effectOptions.onDisplay.call(this); // Execute show callback
                        console.debug("VisionFilter: Overlay faded in successfully.");
                    }
                );
            } else {
                shadeLayer.css('opacity', effectOptions.alphaLevel);
                effectOptions.onDisplay.call(shadeLayer[0]); // Execute show callback
                console.debug("VisionFilter: Overlay displayed instantly.");
            }
        }, effectOptions.initialDelay);


        // Set up the event to close the spotlight (delegated to document for robustness)
        $(document).on(effectOptions.dismissTrigger + '.visionFilter', shadeLayer, function (evt) {
            // Ensure the event originated from the overlay itself, not a child of the highlighted elements
            if ($(evt.target).is(shadeLayer)) {
                deactivateShade();
                console.debug("VisionFilter: Dismissal triggered by user interaction.");
            }
        });

        // Return the jQuery object for method chaining
        return this;
    };

    // Add a public method to dismiss the filter globally
    $.visionFilterDismiss = function() {
        if (activeEffectLayer && activeEffectLayer.length > 0) {
            activeEffectLayer.trigger(activeEffectLayer.data('dismissTrigger') || 'click'); // Use stored trigger or default
        }
    };

}));