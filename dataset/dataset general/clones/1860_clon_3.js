(function (jq, globalRef) {
    "use strict";

    // Ensure jQuery is available before proceeding.
    if (typeof jq === 'undefined') {
        console.warn("ImageScaler: jQuery not found. Module cannot initialize.");
        return;
    }

    // A simple logging utility for internal warnings or debugging.
    const _log = function(message, level = 'warn') {
        if (console && typeof console[level] === 'function') {
            console[level](`ImageScaler: ${message}`);
        }
    };

    // Helper function to construct URL query strings from an object.
    const buildQueryString = function (params) {
        const parts = [];
        for (const key in params) {
            if (Object.prototype.hasOwnProperty.call(params, key) && params[key] !== null && params[key] !== undefined && params[key] !== '') {
                parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
            }
        }
        return parts.join('&');
    };

    // Debounce utility to limit function execution rate, especially for resize events.
    const debounce = function (func, delayMilliseconds) {
        let timeoutHandle;
        return function () {
            const context = this;
            const args = arguments;
            const later = function () {
                timeoutHandle = null;
                func.apply(context, args);
            };
            clearTimeout(timeoutHandle);
            timeoutHandle = setTimeout(later, delayMilliseconds);
        };
    };

    // The main jQuery plugin definition.
    jq.fn.imageResizer = function (componentOptions) {
        const affectedElements = this; // The set of elements targeted by the plugin call.

        // Default configuration for the image scaler instance.
        const defaultSettings = {
            elementConfigKey: "image-config", // Data attribute key to fetch image-specific settings.
            imageProcessorEndpoint: "/image-service/process.php", // URL for the backend image processing service.
            alignmentStrategy: null, // Strategy for vertical alignment: null, or "line-height".
            resizeEvents: "resize orientationchange", // Global events that trigger image recalculation.
            debounceDelay: 150 // Delay in milliseconds for debouncing resize events.
        };

        // Merge user-provided options with default settings.
        const instanceSettings = jq.extend({}, defaultSettings, componentOptions);

        /**
         * Calculates the native device pixel length from a CSS logical pixel length.
         * Accounts for high-DPI (Retina) displays.
         * @param {number} logicalPixels The length in CSS pixels.
         * @returns {number} The corresponding length in device pixels.
         */
        const calculateDevicePixels = function (logicalPixels) {
            const pixelRatio = globalRef.devicePixelRatio || 1;
            return Math.round(logicalPixels * pixelRatio);
        };

        /**
         * Retrieves the computed line-height for a given element.
         * @param {jQuery} element The jQuery wrapped DOM element.
         * @returns {number} The line-height in pixels, or 0 if not a valid number.
         */
        const fetchLineHeight = function (element) {
            const computedLineHeight = parseFloat(element.css("line-height"));
            return isNaN(computedLineHeight) ? 0 : computedLineHeight;
        };

        /**
         * Adjusts a given height to align with a vertical rhythm based on line-height.
         * @param {jQuery} element The jQuery wrapped DOM element.
         * @param {number} currentHeight The currently calculated height.
         * @returns {number} The adjusted height.
         */
        const applyVerticalAlignment = function (element, currentHeight) {
            if (instanceSettings.alignmentStrategy === "line-height") {
                const baseLineHeight = fetchLineHeight(element);
                if (baseLineHeight > 0) { // Only adjust if a valid line-height is found.
                    const rhythmMultiplier = Math.max(1, Math.round(currentHeight / baseLineHeight));
                    return baseLineHeight * rhythmMultiplier;
                }
            }
            return currentHeight; // Return original height if no strategy or invalid line-height.
        };

        /**
         * Extracts and normalizes image configuration data from an element's data attribute.
         * This function attempts to parse JSON first, then falls back to a simple string.
         * @param {jQuery} element The jQuery wrapped DOM element.
         * @returns {object} An object containing normalized image data (URL, aspect ratio, etc.).
         */
        const retrieveElementConfig = function (element) {
            let rawData = element.data(instanceSettings.elementConfigKey);
            let processedData = {};

            // Attempt to parse as JSON object first.
            if (typeof rawData === 'string' && rawData.trim().startsWith('{') && rawData.trim().endsWith('}')) {
                try {
                    processedData = JSON.parse(rawData);
                } catch (e) {
                    _log(`Invalid JSON in data-${instanceSettings.elementConfigKey} for element:`, 'warn');
                    _log(element[0], 'warn');
                    _log(e, 'warn');
                }
            } else if (typeof rawData === 'object' && rawData !== null) {
                // If it's already an object (e.g., passed directly in data() method)
                processedData = rawData;
            } else if (typeof rawData === 'string' && rawData.trim().length > 0) {
                // If it's a simple string, assume it's the URL.
                processedData.url = rawData;
            }

            // Normalize and validate properties.
            const imageUrl = typeof processedData.url === 'string' ? processedData.url.trim() : '';
            const aspectRatioValue = parseFloat(processedData.ratio) || 0;
            // If aspectRatioValue is set, maxAspectRatioConstraint should be ignored.
            const maxAspectRatioConstraint = aspectRatioValue > 0 ? 0 : (parseFloat(processedData.maxRatio) || 0);
            // Gravity must be 1 or 2 characters from "l", "r", "t", "b".
            const focalPoint = (typeof processedData.gravity === 'string' && processedData.gravity.length > 0)
                ? processedData.gravity.toLowerCase().replace(/[^lrtb]/g, '').substring(0, 2)
                : '';
            const referenceElementSelector = typeof processedData.heightGuide === 'string' ? processedData.heightGuide.trim() : '';

            return {
                imageUrl: imageUrl,
                focalPoint: focalPoint,
                aspectRatioValue: aspectRatioValue,
                maxAspectRatioConstraint: maxAspectRatioConstraint,
                referenceElementSelector: referenceElementSelector
            };
        };

        /**
         * Updates the 'src' attribute of an image element, providing a fallback mechanism.
         * This function ensures that if the new source fails to load, the image falls back
         * to its original source once, preventing an infinite error loop.
         * @param {jQuery} element The jQuery wrapped image element.
         * @param {string} newSourcePath The new URL for the image source.
         */
        const updateImageDisplay = function (element, newSourcePath) {
            const originalSource = element.data('image-original-src');
            if (!originalSource) {
                // Store the initial src if not already stored.
                element.data('image-original-src', element.attr('src') || '');
            }

            // A flag to prevent multiple fallback attempts for a single image.
            const fallbackAttempted = element.data('fallback-attempted') || false;

            // Remove previous error handlers to avoid memory leaks or re-triggering.
            element.off('error.imageResizer');

            element.on('error.imageResizer', function () {
                if (!fallbackAttempted) {
                    // If error occurs and fallback hasn't been attempted for this image,
                    // revert to the stored original source and mark as attempted.
                    jq(this).attr('src', element.data('image-original-src'));
                    element.data('fallback-attempted', true);
                    _log(`Image failed to load with new source: ${newSourcePath}. Falling back to original: ${element.data('image-original-src')}`, 'warn');
                } else {
                    _log(`Image failed to load even after fallback. Original source: ${element.data('image-original-src')}`, 'error');
                }
                // Ensure the error handler is removed after it's been triggered or deemed unnecessary.
                jq(this).off('error.imageResizer');
            }).attr('src', newSourcePath); // Set the new source, triggering potential error.

            // Reset fallback flag if a new source is successfully set (or attempted).
            if (newSourcePath !== element.data('image-original-src')) {
                element.data('fallback-attempted', false);
            }
        };

        /**
         * Main function to recalculate dimensions for all affected images and apply scaling.
         * This function iterates through each image element, determines its target dimensions,
         * and updates its source attribute to request the appropriately scaled image from the service.
         */
        const processImageScaling = function () {
            // Guard clause: if no elements, do nothing.
            if (!affectedElements || affectedElements.length === 0) {
                return;
            }

            affectedElements.each(function () {
                const currentTarget = jq(this);

                // Skip if the element is not visible or has no width/height.
                if (currentTarget.is(':hidden') || currentTarget.innerWidth() <= 0 || currentTarget.innerHeight() <= 0) {
                    return;
                }

                const elementData = retrieveElementConfig(currentTarget);
                if (!elementData.imageUrl) {
                    _log(`Skipping element as no image URL found:`, 'info');
                    _log(currentTarget[0], 'info');
                    return;
                }

                let calculatedWidth = currentTarget.innerWidth();
                let calculatedHeight = currentTarget.innerHeight();
                let minimumPermittedHeight = 0;

                // Determine target height based on various strategies.
                if (elementData.aspectRatioValue > 0) {
                    // Use fixed aspect ratio.
                    calculatedHeight = Math.round(calculatedWidth / elementData.aspectRatioValue);
                } else if (elementData.referenceElementSelector && jq(elementData.referenceElementSelector).length) {
                    // Use height of a reference element.
                    calculatedHeight = jq(elementData.referenceElementSelector).innerHeight();
                }

                // Apply maximum aspect ratio constraint if specified.
                if (elementData.maxAspectRatioConstraint > 0) {
                    minimumPermittedHeight = Math.round(calculatedWidth / elementData.maxAspectRatioConstraint);
                    calculatedHeight = Math.max(minimumPermittedHeight, calculatedHeight);
                }

                // Apply vertical rhythm alignment if configured.
                calculatedHeight = applyVerticalAlignment(currentTarget, calculatedHeight);

                // Prevent visual "blinking" by setting the height before updating src.
                // This ensures the image container has the correct size while the new image loads.
                currentTarget.css({ 'height': calculatedHeight + 'px' });

                // Prepare parameters for the image processing service.
                const processorParameters = {
                    src: elementData.imageUrl,
                    a: elementData.focalPoint,
                    w: calculateDevicePixels(calculatedWidth),
                    h: calculateDevicePixels(calculatedHeight)
                };

                // Construct the full URL for the image service.
                const fullImageUrl = instanceSettings.imageProcessorEndpoint + "?" + buildQueryString(processorParameters);

                // Update the image source, with error fallback.
                updateImageDisplay(currentTarget, fullImageUrl);
            });
        };

        // Create a debounced version of the scaling function for frequent events.
        const debouncedScaling = debounce(processImageScaling, instanceSettings.debounceDelay);

        // Bind events:
        // - 'load' event: Trigger scaling once immediately after the page and all resources are loaded.
        //   This initial run should not be debounced to ensure images are sized correctly from the start.
        // - Configured window events (e.g., resize, orientationchange): Trigger debounced scaling.
        jq(globalRef)
            .one("load", processImageScaling)
            .on(instanceSettings.resizeEvents, debouncedScaling);

        // Return the original jQuery object to maintain chainability.
        return this;
    };

})(jQuery, window);