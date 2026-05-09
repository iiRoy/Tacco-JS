'use strict';

/**
 * @module parallaxEffectModule.directives
 * @description
 * This Angular module provides a set of directives and a service
 * to integrate the jQuery Stellar.js parallax scrolling library into Angular applications.
 * It enhances HTML elements with dynamic background and scroll effects based on
 * user scroll position.
 */
angular.module('parallaxEffectModule.directives', [])

    /**
     * @ngdoc service
     * @name parallaxEffectModule.directives:scrollEffectCoordinator
     * @description
     * The `scrollEffectCoordinator` service acts as an interface to the Stellar.js library.
     * It allows for global initialization of parallax effects or application to specific elements.
     * It includes basic validation to ensure Stellar.js is available before attempting to use it.
     */
    .factory('scrollEffectCoordinator', function() {
        // Internal flag to track if a warning about missing dependencies has already been issued.
        let dependencyWarningIssued = false;

        /**
         * Verifies the presence of jQuery and the Stellar.js plugin.
         * @returns {boolean} True if dependencies are met, false otherwise.
         */
        const checkLibraryAvailability = function() {
            if (typeof jQuery === 'undefined' || typeof jQuery.fn.stellar === 'undefined') {
                if (!dependencyWarningIssued) {
                    console.warn('ScrollEffectCoordinator: Required libraries (jQuery or Stellar.js) are not loaded. Parallax effects will be disabled.');
                    dependencyWarningIssued = true; // Prevent multiple warnings
                }
                return false;
            }
            return true;
        };

        return {
            /**
             * Initializes global parallax scrolling on the entire viewport.
             * This function is typically called once when the application loads,
             * or after relevant DOM changes.
             * @param {Object} [globalSettings={}] - Optional configuration object to pass directly to Stellar.js.
             *                                       E.g., `{ horizontalScrolling: false, verticalOffset: 40 }`.
             */
            applyViewportParallax: function(globalSettings = {}) {
                if (!checkLibraryAvailability()) {
                    return; // Abort if Stellar.js is not available
                }
                // Initialize Stellar.js on the window object for global effects.
                jQuery(window).stellar(globalSettings);
                console.info('ScrollEffectCoordinator: Global viewport parallax initialization complete.');
            },

            /**
             * Applies specific parallax effects to elements matching a given selector.
             * This is useful for fine-grained control over individual parallax components.
             * @param {string} targetCssSelector - A valid CSS selector identifying the target DOM elements.
             * @param {Object} elementSpecificOptions - Configuration options for Stellar.js specific to these elements.
             *                                          E.g., `{ speed: 0.2, positionProperty: 'transform' }`.
             */
            configureElementParallax: function(targetCssSelector, elementSpecificOptions) {
                if (!checkLibraryAvailability()) {
                    return; // Abort if Stellar.js is not available
                }
                if (!targetCssSelector || typeof targetCssSelector !== 'string') {
                    console.error('ScrollEffectCoordinator: Invalid or missing CSS selector provided for element configuration.');
                    return;
                }
                // Apply Stellar.js to the selected elements with their specific options.
                jQuery(targetCssSelector).stellar(elementSpecificOptions);
                console.debug(`ScrollEffectCoordinator: Parallax effect configured for elements matching "${targetCssSelector}".`);
            }
        };
    })

    /**
     * @ngdoc directive
     * @name parallaxEffectModule.directives:parallaxBackgroundRatio
     * @restrict A
     * @description
     * Sets the `data-stellar-background-ratio` attribute on an element, controlling
     * the scroll speed of its background image relative to the foreground.
     *
     * Usage: `<div parallax-background-ratio="0.5">...</div>`
     * A ratio of 0.5 means the background scrolls at half the speed of the foreground.
     */
    .directive('parallaxBackgroundRatio', function() {
        const DEFAULT_BG_SCROLL_RATE = '1.0'; // Default ratio if the attribute value is invalid or missing.
        const STELLAR_BG_ATTR = 'data-stellar-background-ratio';

        return {
            restrict: 'A', // This directive can only be used as an attribute.
            // No isolated scope needed; it operates directly on the element's attributes.
            scope: false,
            // The compile function runs once per directive type, before linking.
            // It's ideal for DOM transformations that don't depend on the scope.
            compile: function(domElement, elementAttrs) {
                let configuredRatio = elementAttrs.parallaxBackgroundRatio;

                // Validate the input: ensure it's a number.
                if (configuredRatio === undefined || configuredRatio === null || isNaN(parseFloat(configuredRatio))) {
                    console.warn(`ParallaxBackgroundRatio: Invalid or missing ratio value "${configuredRatio}" on element. Using default: ${DEFAULT_BG_SCROLL_RATE}.`);
                    configuredRatio = DEFAULT_BG_SCROLL_RATE;
                }

                // Set the data attribute directly using jQuery's attr method.
                domElement.attr(STELLAR_BG_ATTR, configuredRatio);

                // The link function is executed after the template is cloned and linked to a scope.
                // For this simple attribute directive, it can be a no-op.
                return function postLinkFunction(currentScope, linkedElement, linkedAttrs) {
                    // Optionally, one could add event listeners here or perform dynamic updates.
                    // console.log(`[parallaxBackgroundRatio] Linked element:`, linkedElement[0]);
                };
            },
        };
    })

    /**
     * @ngdoc directive
     * @name parallaxEffectModule.directives:parallaxScrollRatio
     * @restrict A
     * @description
     * Sets the `data-stellar-ratio` attribute, controlling the general scroll speed
     * of an element relative to the viewport.
     *
     * Usage: `<div parallax-scroll-ratio="0.75">...</div>`
     * A ratio of 0.75 means the element scrolls at 75% the speed of the viewport.
     */
    .directive('parallaxScrollRatio', function() {
        const FALLBACK_ELEMENT_RATIO = '1.0'; // Default ratio if attribute value is problematic.
        const STELLAR_RATIO_ATTR = 'data-stellar-ratio';

        return {
            restrict: 'A',
            // No isolated scope is necessary as this directive only modifies an element's data attribute.
            compile: function(processedElement, elementAttributes) {
                let providedRatio = elementAttributes.parallaxScrollRatio;

                // Robust validation for the ratio value.
                let effectiveRatio;
                if (typeof providedRatio === 'string' && !isNaN(parseFloat(providedRatio))) {
                    effectiveRatio = parseFloat(providedRatio).toFixed(2); // Format to 2 decimal places
                } else {
                    console.error(`ParallaxScrollRatio: Non-numeric or invalid value "${providedRatio}" found. Using fallback: ${FALLBACK_ELEMENT_RATIO}.`);
                    effectiveRatio = FALLBACK_ELEMENT_RATIO;
                }

                // Apply the data attribute using the native DOM method for a slight variation.
                processedElement[0].setAttribute(STELLAR_RATIO_ATTR, effectiveRatio);

                // Return a simple link function. It is not always required for compile-only directives.
                return angular.noop; // Angular's built-in empty function.
            },
        };
    })

    /**
     * @ngdoc directive
     * @name parallaxEffectModule.directives:parallaxHorizontalOffset
     * @restrict A
     * @description
     * Sets the `data-stellar-horizontal-offset` attribute, defining an initial
     * horizontal offset for the parallax effect.
     *
     * Usage: `<div parallax-horizontal-offset="200">...</div>`
     * A positive value shifts the element right initially.
     */
    .directive('parallaxHorizontalOffset', function() {
        const HORIZONTAL_OFFSET_DATA_ATTR = 'data-stellar-horizontal-offset';
        const DEFAULT_HORIZONTAL_OFFSET = '0'; // Default offset if none is provided or invalid.

        // Helper function to safely parse an integer value.
        const ensureInteger = (val) => {
            const parsed = parseInt(val, 10);
            return isNaN(parsed) ? 0 : parsed;
        };

        return {
            restrict: 'A',
            // The compile function is responsible for initial DOM manipulation.
            compile: function(targetElement, attributeMap) {
                let rawOffset = attributeMap.parallaxHorizontalOffset;
                let finalOffset = ensureInteger(rawOffset);

                if (rawOffset !== undefined && rawOffset !== null && isNaN(parseInt(rawOffset, 10))) {
                    console.warn(`ParallaxHorizontalOffset: Non-numeric value "${rawOffset}" detected. Using default offset: ${DEFAULT_HORIZONTAL_OFFSET}.`);
                }

                // Set the data attribute, converting the number back to a string.
                targetElement.attr(HORIZONTAL_OFFSET_DATA_ATTR, finalOffset.toString());

                // The link function is returned by compile. For this directive, it's trivial.
                return function link(currentScope, currentElement, elementAttributes) {
                    // This space could be used for event binding or post-DOM-linking logic.
                    // console.log(`Horizontal parallax offset set for:`, currentElement[0]);
                };
            },
        };
    })

    /**
     * @ngdoc directive
     * @name parallaxEffectModule.directives:parallaxVerticalOffset
     * @restrict A
     * @description
     * Sets the `data-stellar-vertical-offset` attribute, defining an initial
     * vertical offset for the parallax effect.
     *
     * Usage: `<div parallax-vertical-offset="-100">...</div>`
     * A negative value shifts the element up initially.
     */
    .directive('parallaxVerticalOffset', function() {
        // Encapsulate directive configuration within a variable for clarity.
        const verticalOffsetDirectiveConfig = {
            restrict: 'A',
            // No separate scope required, as it only manipulates an attribute.
            scope: false,
            // The compile phase is used for pre-linking DOM transformations.
            compile: function(elementNode, boundAttributes) {
                let attributeValue = boundAttributes.parallaxVerticalOffset;
                let effectiveOffset = 0; // Default to zero if value is invalid.

                // Perform robust validation of the attribute value.
                if (attributeValue !== undefined && attributeValue !== null) {
                    const parsed = parseInt(attributeValue, 10);
                    if (!isNaN(parsed)) {
                        effectiveOffset = parsed;
                    } else {
                        console.error(`ParallaxVerticalOffset: Received non-integer value "${attributeValue}". Defaulting to 0.`);
                    }
                }

                // Apply the necessary data attribute for Stellar.js.
                // Using jQuery's attr() method for attribute manipulation.
                elementNode.attr('data-stellar-vertical-offset', effectiveOffset.toString());

                // Return a link function. For simple attribute setting, this function often remains light.
                return function finalLinkPhase(currentScope, linkedElement, linkedAttributeSet) {
                    // This function executes after the template is cloned and linked to its scope.
                    // It's a good place for runtime logic or event handlers if needed,
                    // but for this directive, the work is done in the compile phase.
                    // console.groupCollapsed(`[parallaxVerticalOffset] Linked element:`, linkedElement[0]);
                    // console.log(`Configured vertical offset: ${effectiveOffset}`);
                    // console.groupEnd();
                };
            },
        };

        return verticalOffsetDirectiveConfig;
    });