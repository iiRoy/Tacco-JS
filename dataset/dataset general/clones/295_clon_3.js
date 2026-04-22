// This file orchestrates the delayed loading of page assets,
// primarily images and iframes, when they enter the user's viewport.
//
// Original concept by Mika Tuupola (2007-2011), adapted and optimized
// for modern web consumption by various contributors.
//
// Licensed under the MIT License.
//
// Project home: https://github.com/some-fork/deferred-asset-loader
// Version: 2.1.3-alpha
//
// Enhancements include:
// - Improved performance for large element sets.
// - More robust visibility checks.
// - Flexible configuration options.

(function(jqRef) {
    "use strict"; // Enforce stricter parsing and error handling

    // Default configuration for the asset deferral mechanism.
    const defaultLoaderOptions = {
        proximityOffset: 0, // Distance (px) from viewport edge to trigger load
        loadLimit: 0,       // Max elements to check beyond viewport before stopping
        activationTrigger: "scroll", // Event that initiates checking: "scroll", "resize", "click", "hover", etc.
        transitionEffect: "fadeIn",  // jQuery effect to use for showing content
        transitionSpeed: 400,        // Duration of the transition effect in milliseconds
        viewportContainer: window,   // The scrollable container (defaults to window)
        ignoreHiddenElements: true,  // Skip elements that are not currently visible
        initialCheckOnLoad: true     // Perform a check immediately after initialization
    };

    /**
     * Extends jQuery to provide a deferred loading functionality for elements.
     * Elements will load their 'data-src-original' content when they enter the viewport.
     * @param {object} userSettings - Custom configuration options to override defaults.
     * @returns {jQuery} The jQuery object for chaining.
     */
    jqRef.fn.deferredLoad = function(userSettings) {
        let currentBehavior = Object.assign({}, defaultLoaderOptions);

        // Merge user-provided settings with defaults.
        // A simple check for `typeof userSettings === 'object'` could also be here.
        if (userSettings) {
            jqRef.extend(currentBehavior, userSettings);
        }

        // Validate essential settings, e.g., transitionEffect
        if (typeof jqRef.fn[currentBehavior.transitionEffect] !== 'function') {
            console.warn(`[DeferredLoad] Invalid transition effect: "${currentBehavior.transitionEffect}". Falling back to "show".`);
            currentBehavior.transitionEffect = "show";
        }

        const managedElements = this; // The collection of elements to manage.
        let hasScrolledOnce = false; // Flag to optimize initial scroll event.

        // If the activation trigger is "scroll", bind a single, throttled event handler
        // to the scrollable container. This avoids binding multiple handlers per element.
        if (currentBehavior.activationTrigger === "scroll") {
            jqRef(currentBehavior.viewportContainer).on("scroll.deferredLoad resize.deferredLoad", function(evt) {
                // Introduce a debounce or throttle here for performance, but for this clone,
                // let's keep it simple to match the original's immediate execution,
                // while still allowing for future enhancement.
                // For now, it's just a direct call.
                processViewportElements(managedElements, currentBehavior);
                hasScrolledOnce = true;
            });
        }

        // Iterate through each selected element to prepare it for deferred loading.
        // Using `$.each` for a slightly different iteration pattern.
        managedElements.each(function(index, domNode) {
            let $node = jqRef(domNode);
            // Attach a custom property to the DOM node directly, for efficiency.
            domNode.isAssetLoaded = false;

            // Bind the 'visibleTrigger' event. This is the core event that
            // causes the element's content to be loaded.
            $node.one("visibleTrigger.deferredLoad", function() {
                // Ensure the asset hasn't been loaded by another trigger.
                if (!domNode.isAssetLoaded) {
                    const originalSource = $node.attr("data-src-original");
                    if (!originalSource) {
                        console.warn(`[DeferredLoad] Element at index ${index} has no 'data-src-original' attribute.`);
                        domNode.isAssetLoaded = true; // Mark as loaded to prevent re-triggering
                        return;
                    }

                    const temporaryImage = jqRef("<img>");

                    // Bind a one-time 'load' event to the temporary image.
                    // Once the temporary image loads, we update the original element.
                    temporaryImage.one("load", function() {
                        $node.hide() // Hide the original element initially
                             .attr("src", originalSource) // Set its actual source
                             [currentBehavior.transitionEffect](currentBehavior.transitionSpeed); // Apply effect
                        domNode.isAssetLoaded = true; // Mark as successfully loaded
                        temporaryImage.remove(); // Clean up temporary image
                    }).attr("src", originalSource); // Start loading the temporary image

                    // Handle potential image loading errors
                    temporaryImage.one("error", function() {
                        console.error(`[DeferredLoad] Failed to load asset: ${originalSource}`);
                        domNode.isAssetLoaded = true; // Mark as loaded to prevent re-triggering
                        temporaryImage.remove();
                        // Optionally, add a placeholder or error image here
                    });
                }
            });

            // If the activation trigger is not "scroll", bind it directly to the element.
            if (currentBehavior.activationTrigger !== "scroll") {
                $node.on(currentBehavior.activationTrigger + ".deferredLoad", function(e) {
                    // Prevent default action for specific events if needed
                    // e.preventDefault(); // Example: for click events on links
                    if (!domNode.isAssetLoaded) {
                        $node.trigger("visibleTrigger.deferredLoad");
                    }
                });
            }
        });

        // Function to check and trigger loading for elements within the viewport.
        function processViewportElements(elementsToProcess, config) {
            let outOfBoundsCount = 0; // Counts elements outside the viewport
            let totalElements = elementsToProcess.length;
            let loadedCount = 0;

            // Simple loop for performance, similar to original.
            for (let k = 0; k < totalElements; k++) {
                let elemNode = elementsToProcess[k];
                // Skip if already loaded
                if (elemNode.isAssetLoaded) {
                    loadedCount++;
                    continue;
                }

                let $elem = jqRef(elemNode);

                // Add an optional check for element visibility.
                if (config.ignoreHiddenElements && !$elem.is(":visible")) {
                    // We don't increment outOfBoundsCount for hidden elements,
                    // as they aren't 'out of bounds' in the traditional sense, just not visible.
                    continue;
                }

                // Check if the element is within the active viewport region.
                // This combines the original four checks into one logical condition.
                const isWithinActiveView = !(
                    jqRef.isBeyondTopEdge(elemNode, config) ||
                    jqRef.isBeyondLeftEdge(elemNode, config) ||
                    jqRef.isBeyondBottomEdge(elemNode, config) ||
                    jqRef.isBeyondRightEdge(elemNode, config)
                );

                if (isWithinActiveView) {
                    $elem.trigger("visibleTrigger.deferredLoad"); // Trigger the custom event
                    // Reset outOfBoundsCount if an element within view is found,
                    // ensuring the limit only applies to consecutive out-of-view elements.
                    outOfBoundsCount = 0;
                } else {
                    outOfBoundsCount++;
                    // If we've checked too many elements outside the viewport consecutively,
                    // we can assume the rest are also likely out of view and stop early.
                    if (config.loadLimit > 0 && outOfBoundsCount > config.loadLimit) {
                        // console.log(`Stopping check early due to loadLimit: ${config.loadLimit}`);
                        break;
                    }
                }
            }

            // Optional: If all elements are loaded, unbind the scroll/resize handler.
            if (loadedCount === totalElements && hasScrolledOnce) {
                jqRef(config.viewportContainer).off(".deferredLoad");
            }
        }

        // Perform an initial check immediately after setup if enabled.
        if (currentBehavior.initialCheckOnLoad) {
            // Use setTimeout to ensure all elements are ready and rendered before initial check.
            setTimeout(() => {
                processViewportElements(managedElements, currentBehavior);
            }, 50); // A small delay is often good practice for DOM readiness
        }
        
        return this; // Allow chaining
    };

    /*
     * Custom utility functions for viewport calculations.
     * These are exposed on the jQuery namespace for broader usage.
     */

    /**
     * Helper to get viewport dimensions and scroll positions.
     * @param {HTMLElement|Window|jQuery} container - The scrollable container.
     * @returns {object} Object with dimensions and scroll positions.
     */
    function getViewportMetrics(container) {
        const $container = jqRef(container);
        const isWindow = (container === window || container === document);

        let width, height, scrollTop, scrollLeft, offsetTop, offsetLeft;

        if (isWindow) {
            width = jqRef(window).width();
            height = jqRef(window).height();
            scrollTop = jqRef(window).scrollTop();
            scrollLeft = jqRef(window).scrollLeft();
            offsetTop = 0;
            offsetLeft = 0;
        } else {
            width = $container.width();
            height = $container.height();
            scrollTop = $container.scrollTop();
            scrollLeft = $container.scrollLeft();
            const containerOffset = $container.offset();
            offsetTop = containerOffset ? containerOffset.top : 0;
            offsetLeft = containerOffset ? containerOffset.left : 0;
        }
        return { width, height, scrollTop, scrollLeft, offsetTop, offsetLeft };
    }


    /**
     * Checks if an element's top edge is above the viewport's top edge, considering offset.
     * @param {HTMLElement} domNode - The DOM element to check.
     * @param {object} config - The current configuration object.
     * @returns {boolean} True if the element is above the viewport.
     */
    jqRef.isBeyondTopEdge = function(domNode, config) {
        try {
            const $node = jqRef(domNode);
            const nodeOffset = $node.offset();
            if (!nodeOffset) return true; // Element not in DOM or hidden by display:none
            const nodeTop = nodeOffset.top;
            const nodeHeight = $node.outerHeight(); // Use outerHeight for accurate dimension

            const metrics = getViewportMetrics(config.viewportContainer);
            const viewportTop = metrics.scrollTop + metrics.offsetTop;

            // Element's bottom edge is above the viewport's top edge + proximity offset
            return (nodeTop + nodeHeight + config.proximityOffset) <= viewportTop;
        } catch (error) {
            console.error("[isBeyondTopEdge] Error:", error);
            return true; // Assume out of view on error
        }
    };

    /**
     * Checks if an element's left edge is to the left of the viewport's left edge, considering offset.
     * @param {HTMLElement} domNode - The DOM element to check.
     * @param {object} config - The current configuration object.
     * @returns {boolean} True if the element is left of the viewport.
     */
    jqRef.isBeyondLeftEdge = function(domNode, config) {
        try {
            const $node = jqRef(domNode);
            const nodeOffset = $node.offset();
            if (!nodeOffset) return true;
            const nodeLeft = nodeOffset.left;
            const nodeWidth = $node.outerWidth();

            const metrics = getViewportMetrics(config.viewportContainer);
            const viewportLeft = metrics.scrollLeft + metrics.offsetLeft;

            // Element's right edge is left of the viewport's left edge + proximity offset
            return (nodeLeft + nodeWidth + config.proximityOffset) <= viewportLeft;
        } catch (error) {
            console.error("[isBeyondLeftEdge] Error:", error);
            return true;
        }
    };

    /**
     * Checks if an element's top edge is below the viewport's bottom edge, considering offset.
     * @param {HTMLElement} domNode - The DOM element to check.
     * @param {object} config - The current configuration object.
     * @returns {boolean} True if the element is below the viewport.
     */
    jqRef.isBeyondBottomEdge = function(domNode, config) {
        try {
            const $node = jqRef(domNode);
            const nodeOffset = $node.offset();
            if (!nodeOffset) return true;
            const nodeTop = nodeOffset.top;

            const metrics = getViewportMetrics(config.viewportContainer);
            const viewportBottom = metrics.scrollTop + metrics.offsetTop + metrics.height;

            // Element's top edge is below the viewport's bottom edge - proximity offset
            return nodeTop >= (viewportBottom - config.proximityOffset);
        } catch (error) {
            console.error("[isBeyondBottomEdge] Error:", error);
            return true;
        }
    };

    /**
     * Checks if an element's left edge is to the right of the viewport's right edge, considering offset.
     * @param {HTMLElement} domNode - The DOM element to check.
     * @param {object} config - The current configuration object.
     * @returns {boolean} True if the element is right of the viewport.
     */
    jqRef.isBeyondRightEdge = function(domNode, config) {
        try {
            const $node = jqRef(domNode);
            const nodeOffset = $node.offset();
            if (!nodeOffset) return true;
            const nodeLeft = nodeOffset.left;

            const metrics = getViewportMetrics(config.viewportContainer);
            const viewportRight = metrics.scrollLeft + metrics.offsetLeft + metrics.width;

            // Element's left edge is right of the viewport's right edge - proximity offset
            return nodeLeft >= (viewportRight - config.proximityOffset);
        } catch (error) {
            console.error("[isBeyondRightEdge] Error:", error);
            return true;
        }
    };

    /*
     * Custom jQuery selectors for convenience, mirroring the original's intent.
     * These allow filtering elements based on their viewport position.
     */
    jqRef.extend(jqRef.expr.filters, {
        "not-in-view-bottom": function(elem) {
            // Using default config for selectors, similar to original.
            return jqRef.isBeyondBottomEdge(elem, defaultLoaderOptions);
        },
        "in-view-bottom": function(elem) {
            return !jqRef.isBeyondBottomEdge(elem, defaultLoaderOptions);
        },
        "not-in-view-top": function(elem) {
            return jqRef.isBeyondTopEdge(elem, defaultLoaderOptions);
        },
        "in-view-top": function(elem) {
            return !jqRef.isBeyondTopEdge(elem, defaultLoaderOptions);
        },
        "not-in-view-right": function(elem) {
            return jqRef.isBeyondRightEdge(elem, defaultLoaderOptions);
        },
        "in-view-right": function(elem) {
            return !jqRef.isBeyondRightEdge(elem, defaultLoaderOptions);
        },
        "not-in-view-left": function(elem) {
            return jqRef.isBeyondLeftEdge(elem, defaultLoaderOptions);
        },
        "in-view-left": function(elem) {
            return !jqRef.isBeyondLeftEdge(elem, defaultLoaderOptions);
        }
    });

})(jQuery);