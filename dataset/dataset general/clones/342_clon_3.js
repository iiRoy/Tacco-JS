/* Element Animator | (c) 2023 YourName | example.com/license */
(function ($, globalScope, documentNode){

    // A module-level flag to ensure event handlers are attached only once.
    let eventSystemInitialized = false;

    // Helper to capitalize the first letter of a string.
    const capitalizeString = (inputString) => {
        if (typeof inputString !== 'string' || inputString.length === 0) {
            return '';
        }
        return inputString.charAt(0).toUpperCase() + inputString.slice(1);
    };

    // Utility function to add vendor prefixes to CSS properties.
    // Enhanced to specifically handle 'transform' values within the property value.
    const applyVendorPrefixes = (cssProperty, propertyValue, isTransformProperty = false) => {
        const browserPrefixes = ['webkit', 'moz', 'ms', 'o'];
        const styleDeclarations = {};

        // Iterate through common browser prefixes.
        for (let i = 0; i < browserPrefixes.length; i++) {
            let prefixedValue = propertyValue;
            // If it's a transform property, replace 'transform' keyword in the value itself
            // to ensure proper vendor-prefixed transform functions are used where applicable.
            if (isTransformProperty && typeof propertyValue === 'string' && propertyValue.length > 0) {
                prefixedValue = propertyValue.replace(/transform/g, `-${browserPrefixes[i]}-transform`);
            }
            styleDeclarations[capitalizeString(browserPrefixes[i]) + capitalizeString(cssProperty)] = prefixedValue;
        }
        // Always include the standard, unprefixed property for modern browsers.
        styleDeclarations[cssProperty] = propertyValue;

        return styleDeclarations;
    };

    // The main plugin function, attaches to jQuery's prototype.
    $.fn.elementAnimator = function (userOptions){
        // Basic guard clause: if no elements are selected, return the jQuery object
        // to maintain chainability without processing empty sets.
        if (this.length === 0) {
            return this;
        }
        // Initialize the selected elements with global defaults merged with user options.
        $.fn.elementAnimator.setupElements(this, $.extend({}, $.fn.elementAnimator.defaults, userOptions));
        return this; // Allow chaining.
    };

    // Storage for all elements currently managed by this plugin instance.
    $.fn.elementAnimator.managedElements = [];

    // Default configuration for the animations. These can be overridden by user options
    // or element-specific data attributes.
    $.fn.elementAnimator.defaults = {
        activationDistance: 180, // Distance from viewport bottom to trigger animation (pixels or percentage).
        initialOpacity: 0.05, // Starting opacity (0 to 1) for elements when out of view.
        animationDuration: "all 1.2s ease-out, opacity 1.6s ease-in-out", // CSS transition property.
        transformStyle: 'flat', // 'preserve-3d' or 'flat'. Applied to parent for 3D context.
        transformOrigin: null, // e.g., 'center center', 'top left'.
        perspectiveValue: 1200 // Perspective for 3D transforms, applied to parent.
    };

    // Core function to prepare and configure elements for animation.
    $.fn.elementAnimator.setupElements = function (elementsToProcess, globalSettings){
        elementsToProcess.each(function() {
            const $currentElement = $(this);

            // Guard against re-initialization: skip if element has already been processed.
            if ($currentElement.data('ea-processed')) {
                return;
            }

            // Merge global settings with element-specific data attributes.
            const elementConfig = $.extend({}, globalSettings, $currentElement.data());
            $currentElement.data('elementConfig', elementConfig); // Store the final config on the element for later use.

            // Validate and normalize initialOpacity.
            if (elementConfig.initialOpacity < 0 || elementConfig.initialOpacity > 1) {
                console.warn("ElementAnimator: 'initialOpacity' should be between 0 and 1. Clamping value for element:", $currentElement[0]);
                elementConfig.initialOpacity = Math.max(0, Math.min(1, elementConfig.initialOpacity));
            }
            // Convert percentage strings for opacity to a decimal value.
            if (typeof elementConfig.initialOpacity === 'string' && elementConfig.initialOpacity.includes('%')) {
                elementConfig.initialOpacity = parseFloat(elementConfig.initialOpacity) / 100;
            }

            // Store the element's initial top position relative to the document.
            $currentElement.data('originalTopPosition', $currentElement.offset().top);
            // Mark element as processed to prevent future re-initializations.
            $currentElement.data('ea-processed', true);
            // Initialize element's active state. Undefined means not yet evaluated.
            $currentElement.data('ea-active-state', undefined);

            // Apply cross-browser transition styles based on configured animation duration.
            const transitionStyles = applyVendorPrefixes('transition', elementConfig.animationDuration, true);
            $currentElement.css(transitionStyles);
            $currentElement.data('transitionStyles', transitionStyles); // Store for re-application after resize.
            
            // Add the element to the global list of managed elements.
            $.fn.elementAnimator.managedElements.push($currentElement);
        });

        // Initialize global event handlers (scroll, resize) only once across all plugin calls.
        if (!eventSystemInitialized) {
            eventSystemInitialized = true;
            setupGlobalEventHandlers();
        }
    };

    // Function to set up global scroll and resize listeners.
    function setupGlobalEventHandlers() {
        let scrollActivityDetected = false;
        let lastScrollPosition = 0;
        let previousViewportHeight = $(globalScope).height();
        let previousViewportWidth = $(globalScope).width();
        let previousDocumentHeight = $(documentNode).height();
        let resizeTimerId;

        // Attach resize handler to the window object.
        $(globalScope).on('resize', function() {
            // Debounce resize events to avoid excessive processing during continuous resizing.
            clearTimeout(resizeTimerId);
            resizeTimerId = setTimeout(function() {
                const currentViewportHeight = $(globalScope).height();
                const currentViewportWidth = $(globalScope).width();
                const scrollDirection = (previousViewportHeight > currentViewportHeight) ? 'up' : 'down';

                previousViewportHeight = currentViewportHeight;

                // Handle responsive layout changes, especially when viewport width changes.
                if (previousViewportWidth !== currentViewportWidth) {
                    // Temporarily reset transforms and transitions to allow the browser
                    // to accurately re-calculate layout without animation interference.
                    for (let i = 0; i < $.fn.elementAnimator.managedElements.length; i++) {
                        const element = $.fn.elementAnimator.managedElements[i];
                        element.css(applyVendorPrefixes('transform', '')).css(applyVendorPrefixes('transition', ''));
                    }

                    // Poll for document height stability after resize. This is a heuristic
                    // to determine when responsive layouts have finished their re-flow.
                    let resizeStabilityChecker = setInterval(function() {
                        const currentDocumentHeight = $(documentNode).height();
                        if (currentDocumentHeight === previousDocumentHeight) {
                            globalScope.clearInterval(resizeStabilityChecker); // Stop polling once stable.
                            // Re-calculate element positions and re-apply original transitions.
                            for (let i = 0; i < $.fn.elementAnimator.managedElements.length; i++) {
                                const element = $.fn.elementAnimator.managedElements[i];
                                element.data('originalTopPosition', element.offset().top);
                                element.css(element.data('transitionStyles')); // Re-apply the stored transition.
                            }
                            processElementsForAnimation(scrollDirection); // Trigger animation refresh.
                        }
                        previousDocumentHeight = currentDocumentHeight;
                    }, 400); // Check every 400ms for document height stability.
                } else {
                    // If only height changed, or no width change, just refresh animations.
                    processElementsForAnimation(scrollDirection);
                }
                previousViewportWidth = currentViewportWidth;
            }, 400); // Debounce resize events by 400ms.
        });

        // Use requestAnimationFrame for smoother scroll handling.
        $(globalScope).on('load', function() {
            processElementsForAnimation(); // Initial animation check on page load.

            // Mark scroll activity when scroll event fires.
            $(globalScope).on('scroll', function() {
                scrollActivityDetected = true;
            });

            // A continuous loop that uses requestAnimationFrame to check for scroll activity
            // and process animations efficiently, reducing layout thrashing.
            function scrollLoop() {
                if (scrollActivityDetected) {
                    scrollActivityDetected = false; // Reset flag.
                    const currentScrollPosition = $(globalScope).scrollTop();
                    const scrollDirection = (currentScrollPosition < lastScrollPosition) ? 'up' : 'down';
                    lastScrollPosition = currentScrollPosition;
                    processElementsForAnimation(scrollDirection);
                }
                globalScope.requestAnimationFrame(scrollLoop); // Continue the loop.
            }
            globalScope.requestAnimationFrame(scrollLoop); // Start the scroll animation loop.
        });
    }

    // Main function to evaluate each managed element and apply or reset animation effects.
    function processElementsForAnimation(currentScrollDirection) {
        const viewportHeight = $(globalScope).height();
        const currentScrollTop = $(globalScope).scrollTop();

        // Iterate through all managed elements.
        for (let i = 0; i < $.fn.elementAnimator.managedElements.length; i++) {
            const $targetElement = $.fn.elementAnimator.managedElements[i];
            const elementConfiguration = $targetElement.data('elementConfig');

            // Skip if element configuration is missing (should not happen with proper initialization).
            if (!elementConfiguration) {
                continue;
            }

            const elementOriginalTop = $targetElement.data('originalTopPosition');

            // Calculate element's position relative to the viewport bottom.
            // This determines how much of the element is visible from the bottom.
            const elementVisiblePosition = currentScrollTop + viewportHeight - elementOriginalTop;

            // Determine the actual activation offset, converting percentages if necessary.
            let effectiveActivationOffset = elementConfiguration.activationDistance;
            if (typeof effectiveActivationOffset === 'string' && effectiveActivationOffset.includes('%')) {
                effectiveActivationOffset = parseFloat(effectiveActivationOffset) / 100 * viewportHeight;
            }

            // Check if the element should be in its 'active' (fully visible, no transform) state.
            const shouldBeActive = elementVisiblePosition > effectiveActivationOffset;
            const wasActive = $targetElement.data('ea-active-state'); // Get previous state: true, false, or undefined.

            if (shouldBeActive) {
                // Element is within or past the activation zone.
                // If it wasn't active before, make it fully visible and reset transforms.
                if (wasActive === false || wasActive === undefined) {
                    $targetElement.css('opacity', 1);
                    $targetElement.css(applyVendorPrefixes('transform', '', true));
                    $targetElement.data('ea-active-state', true); // Mark as active.
                }
            } else {
                // Element is outside the activation zone (above it or below the initial offset).
                // If it was active before, or if it's the first evaluation, apply initial state.
                if (wasActive === true || wasActive === undefined) {
                    // Apply initial opacity if defined in the configuration.
                    if (elementConfiguration.initialOpacity !== null && elementConfiguration.initialOpacity !== undefined) {
                        $targetElement.css({ opacity: elementConfiguration.initialOpacity });
                    }

                    // Gather all defined transform properties from the element's configuration.
                    const activeTransforms = {};
                    const transformProperties = ['move', 'move3D', 'moveX', 'moveY', 'moveZ', 'rotate', 'rotate3d', 'rotateX', 'rotateY', 'rotateZ', 'scale', 'scale3d', 'scaleX', 'scaleY', 'skew', 'skewX', 'skewY'];

                    transformProperties.forEach(prop => {
                        if (elementConfiguration[prop] !== undefined) {
                            activeTransforms[prop] = elementConfiguration[prop];
                        }
                    });

                    // Map plugin-specific transform names to standard CSS transform functions.
                    const transformKeywordMap = {
                        'move': 'translate', 'move3D': 'translate3d', 'moveX': 'translateX', 'moveY': 'translateY', 'moveZ': 'translateZ',
                        'rotate': 'rotate', 'rotate3d': 'rotate3d', 'rotateX': 'rotateX', 'rotateY': 'rotateY', 'rotateZ': 'rotateZ',
                        'scale': 'scale', 'scale3d': 'scale3d', 'scaleX': 'scaleX', 'scaleY': 'scaleY',
                        'skew': 'skew', 'skewX': 'skewX', 'skewY': 'skewY'
                    };

                    // Build the final CSS transform string from the collected transforms.
                    let cssTransformString = '';
                    for (const transformKey in activeTransforms) {
                        if (Object.prototype.hasOwnProperty.call(activeTransforms, transformKey)) {
                            const cssEquivalent = transformKeywordMap[transformKey] || transformKey; // Use mapping or original key.
                            cssTransformString += `${cssEquivalent}(${activeTransforms[transformKey]}) `;
                        }
                    }

                    // Apply the generated transform string if it's not empty.
                    if (cssTransformString.length > 0) {
                        $targetElement.css(applyVendorPrefixes('transform', cssTransformString.trim(), true));
                        
                        // Apply perspective to the parent element if defined, for 3D effects.
                        if (elementConfiguration.perspectiveValue) {
                            $targetElement.parent().css(applyVendorPrefixes('perspective', `${elementConfiguration.perspectiveValue}px`));
                        }
                        // Apply transform-style to the parent if defined, important for 3D nesting.
                        if (elementConfiguration.transformStyle && elementConfiguration.transformStyle !== 'flat') {
                            $targetElement.parent().css(applyVendorPrefixes('transformStyle', elementConfiguration.transformStyle));
                        }
                        // Apply transform-origin if specified, affecting the pivot point of transforms.
                        if (elementConfiguration.transformOrigin) {
                            $targetElement.css(applyVendorPrefixes('transformOrigin', elementConfiguration.transformOrigin));
                        }
                    }
                    $targetElement.data('ea-active-state', false); // Mark as inactive.
                }
            }
        }
    }

}( jQuery, window, document ));