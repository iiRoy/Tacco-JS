// Adaptive Image Handler Module v1.0
(function () {
    'use strict';

    // Ensures the DOM is fully loaded before executing any script that manipulates it.
    document.addEventListener('DOMContentLoaded', () => {

        // Define fallback URLs for a transparent pixel and a loading animation.
        // These are used if corresponding values are not provided via meta tags.
        const FALLBACK_BLANK_PIXEL = 'http://f.cl.ly/items/0M3H0q3n1Z1S1y362d09/spacer.gif';
        const FALLBACK_LOADING_ANIM = 'http://f.cl.ly/items/2w2G3N2p0B400Z380J1u/loading.gif';

        // Attempt to retrieve configuration settings from a designated meta tag.
        const configurationSource = $('meta[name="responsimage"]');

        // Guard clause: If the configuration meta tag is not found, log a warning and cease execution.
        if (!configurationSource.length) {
            console.warn('Configuration meta tag "responsimage" not found. Adaptive image processing will be inactive.');
            return;
        }

        // Extract key configuration parameters from the meta tag's data attributes.
        const imageServiceBaseUrl = configurationSource.data('server');
        const transparentPlaceholderSrc = configurationSource.data('static') || FALLBACK_BLANK_PIXEL;
        const animatedLoadingGraphicSrc = configurationSource.data('loading') || FALLBACK_LOADING_ANIM;
        const processingThrottleDelayMs = configurationSource.data('limit') || 100;

        // Essential validation: The image service endpoint is mandatory.
        if (!imageServiceBaseUrl) {
            console.error('Image service base URL is missing from the "responsimage" meta tag (data-server attribute). Module cannot function.');
            return; // Exit if the primary service endpoint is undefined.
        }

        // Select all DOM elements that are marked for adaptive image handling.
        const targetVisualElements = $('[data-responsimage]');

        /**
         * Orchestrates the process of updating designated elements with appropriately sized images.
         * This function determines current element dimensions, constructs a dynamic image URL,
         * and applies it either as an `<img>` source or a CSS background.
         * @param {boolean} initialLoadFlag - True if this is the first execution, allowing for specific initial states.
         */
        function updateVisualContent(initialLoadFlag = false) {
            // Iterate over each selected element to apply adaptive image logic.
            targetVisualElements.each(function() {
                const currentDomElement = $(this);
                const isActualImageTag = this.nodeName === 'IMG';
                const imageSourceIdentifier = currentDomElement.data('responsimage');

                // Skip elements that are explicitly disabled or lack a source identifier.
                if (!imageSourceIdentifier || imageSourceIdentifier === 'disabled') {
                    // Optionally, remove any loading indicators if an element is skipped.
                    return;
                }

                let measuredWidth = isActualImageTag ? currentDomElement.width() : currentDomElement.parent().width();
                let measuredHeight = isActualImageTag ? currentDomElement.height() : currentDomElement.parent().height();

                // Ensure dimensions are positive to prevent errors in URL generation.
                if (measuredWidth <= 0) measuredWidth = 1;
                if (measuredHeight <= 0) measuredHeight = 1;

                const croppingFocusPoint = currentDomElement.data('responsimage-anchor') || 5;
                const backgroundPositionStyle = currentDomElement.data('responsimage-background-position') || 'center';

                // For initial rendering of native `<img>` tags, set a blank placeholder immediately.
                if (initialLoadFlag && isActualImageTag) {
                    currentDomElement.attr('src', transparentPlaceholderSrc);
                }

                // Apply a temporary loading animation as a background while the correct image loads.
                currentDomElement.css({
                    'background-color': '#f0f0f0', // A light background tint
                    'background-image': `url(${animatedLoadingGraphicSrc})`,
                    'background-repeat': 'no-repeat',
                    'background-position': 'center center',
                    'background-size': 'auto' // Ensures the spinner is not stretched
                });

                // Adjust dimensions for high-resolution displays, using a heuristic (font-family check).
                // This targets devices like Retina displays to request higher resolution assets.
                if (currentDomElement.css('font-family') === 'pixel-ratio-2') {
                    measuredWidth *= 2;
                    measuredHeight *= 2;
                }

                // Construct the final image URL by replacing placeholders in the base URL.
                // Using template literal style placeholders for clarity.
                const finalRenderImageUrl = imageServiceBaseUrl
                    .replace('{width}', measuredWidth)
                    .replace('{height}', measuredHeight)
                    .replace('{anchor}', croppingFocusPoint)
                    .replace('{filename}', imageSourceIdentifier);

                // Apply the dynamically generated image to the DOM element.
                if (isActualImageTag) {
                    // For `<img>` elements, simply set the `src` attribute.
                    currentDomElement.attr('src', finalRenderImageUrl);
                } else {
                    // For non-`<img>` elements (e.g., `<div>` with background images),
                    // preload the image using a temporary `Image` object to avoid flickering.
                    const imagePreloader = new Image();

                    imagePreloader.onload = () => {
                        // Once the image is fully loaded, apply it as a background and clear loading states.
                        currentDomElement.css({
                            'background-image': `url(${finalRenderImageUrl})`,
                            'background-size': 'cover', // Ensures the image covers the element
                            'background-position': backgroundPositionStyle,
                            'background-repeat': 'no-repeat',
                            'background-color': 'transparent' // Remove temporary background color
                        });
                        imagePreloader.src = ''; // Clear source to release memory/resources.
                    };

                    imagePreloader.onerror = () => {
                        // Handle errors during image loading by logging and applying a fallback.
                        console.error(`Failed to load adaptive image: ${finalRenderImageUrl} for element:`, currentDomElement[0]);
                        currentDomElement.css({
                            'background-image': `url(${transparentPlaceholderSrc})`, // Fallback to a blank image
                            'background-size': 'contain', // Ensure fallback fits
                            'background-color': '#ccc' // Indicate an error state with a grey background
                        });
                        imagePreloader.src = '';
                    };

                    // Initiate the image loading process.
                    imagePreloader.src = finalRenderImageUrl;
                }
            });
        }

        /**
         * Implements a throttling mechanism for a given function.
         * This ensures the function is executed at most once within a specified time window,
         * preventing excessive calls during rapid events like window resizing.
         * It executes immediately on the leading edge, and schedules a trailing execution
         * if calls occur within the delay period.
         * @param {Function} targetFunction - The function to be throttled.
         * @param {number} minimumDelayMs - The minimum delay between executions in milliseconds.
         * @returns {Function} A throttled version of the original function.
         */
        const limitExecutionFrequency = (targetFunction, minimumDelayMs) => {
            let timerHandle = null;
            let lastExecutionTime = 0; // Tracks the timestamp of the last successful execution.
            let latestResult;
            let currentContext;
            let currentArguments;

            // Ensure the delay is a valid, non-negative number.
            if (typeof minimumDelayMs !== 'number' || minimumDelayMs < 0) {
                minimumDelayMs = 100; // Default to 100ms if invalid.
            }

            // This internal function is responsible for the delayed (trailing) execution.
            const performTrailingCall = () => {
                lastExecutionTime = Date.now(); // Update timestamp for this execution.
                timerHandle = null; // Clear the timer as execution is complete.
                latestResult = targetFunction.apply(currentContext, currentArguments);
            };

            return function(...args) {
                const invocationTime = Date.now();
                const timeSinceLastCall = invocationTime - lastExecutionTime;

                currentContext = this;
                currentArguments = args;

                if (timeSinceLastCall >= minimumDelayMs) {
                    // If enough time has passed since the last execution, run immediately (leading edge).
                    if (timerHandle) {
                        clearTimeout(timerHandle); // Clear any pending trailing call.
                        timerHandle = null;
                    }
                    lastExecutionTime = invocationTime;
                    latestResult = targetFunction.apply(currentContext, currentArguments);
                } else if (!timerHandle) {
                    // If not enough time has passed, but no trailing call is scheduled, schedule one.
                    timerHandle = setTimeout(performTrailingCall, minimumDelayMs - timeSinceLastCall);
                }
                return latestResult; // Return the result from the most recent actual execution.
            };
        };

        // Execute the image update function once immediately upon DOMContentLoaded.
        updateVisualContent(true);

        // Create a throttled version of the update function to limit calls during resizing.
        const throttledUpdateHandler = limitExecutionFrequency(updateVisualContent, processingThrottleDelayMs);

        // Attach event listeners for dynamic content adjustments.
        // Window resize events are throttled to optimize performance.
        window.addEventListener('resize', throttledUpdateHandler);

        // Orientation changes also require a content refresh, often with a slight delay
        // to allow the browser layout to stabilize after the rotation.
        window.addEventListener('orientationchange', () => {
            setTimeout(updateVisualContent, 200); // A slightly increased delay for stability.
        });
    });
})();