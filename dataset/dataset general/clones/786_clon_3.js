(function ( globalWindow ) {

    /**
     * A utility to automatically update image 'src' attributes based on 'srcset'
     * and the current viewport width. This enhances responsive image loading.
     */
    globalWindow.responsiveImageUpdater = function () {
        // Guard clause: ensure document is available
        if (!globalWindow.document) {
            console.warn("Responsive Image Updater: Document object not found.");
            return;
        }

        const allImageNodes = globalWindow.document.querySelectorAll('img');
        // If no image elements are found, there's nothing to do.
        if (allImageNodes.length === 0) {
            return;
        }

        const currentViewportWidth = globalWindow.document.documentElement.clientWidth;
        // A buffer added to the largest declared image width before considering the 'infinity' size.
        const maxSizePadding = 220; // Slightly altered value

        /**
         * Parses a 'srcset' descriptor string into a key-value map
         * where keys are widths (or 'infinity') and values are image URLs.
         * @param {string[]} rawSourceDescriptors - An array of raw srcset entries (e.g., "img.jpg 100w").
         * @returns {Object.<string, string>} A map of widths to image URLs.
         */
        const processSrcsetString = function (rawSourceDescriptors) {
            const responsiveSourceMap = {}; // Local scope for each image's srcset
            for (let descriptorIndex = 0; descriptorIndex < rawSourceDescriptors.length; descriptorIndex++) {
                const currentDescriptorParts = rawSourceDescriptors[descriptorIndex].trim().split(' ');
                // Ensure we have at least two parts: URL and width descriptor
                if (currentDescriptorParts.length < 2) {
                    // This descriptor is malformed, skip it.
                    continue;
                }

                const imageUrl = currentDescriptorParts[0];
                let parsedWidth = parseInt(currentDescriptorParts[1], 10);

                // Handle the 'infinity' case or if parsing failed for width
                if (isNaN(parsedWidth) || currentDescriptorParts[1].toLowerCase().includes('infinity')) {
                    parsedWidth = 'infinity';
                }
                responsiveSourceMap[parsedWidth] = imageUrl;
            }
            return responsiveSourceMap;
        };

        /**
         * Determines the largest numeric width defined in the source map.
         * @param {Object.<string, string>} sourceMapObj - The map of widths to image URLs.
         * @returns {number} The maximum numeric width found, or 0 if none.
         */
        const determineMaxSourceWidth = function (sourceMapObj) {
            let maxFoundWidth = 0;
            for (const widthKey in sourceMapObj) {
                // Ensure it's an own property and can be converted to a number
                if (Object.prototype.hasOwnProperty.call(sourceMapObj, widthKey) && !isNaN(parseInt(widthKey, 10))) {
                    const currentNumericWidth = parseInt(widthKey, 10);
                    if (currentNumericWidth > maxFoundWidth) {
                        maxFoundWidth = currentNumericWidth;
                    }
                }
            }
            return maxFoundWidth;
        };

        // Iterate through all found image elements
        for (let elementIndex = 0; elementIndex < allImageNodes.length; elementIndex++) {
            const currentImage = allImageNodes[elementIndex];
            const srcsetAttrValue = currentImage.getAttribute('srcset');

            // Skip if no srcset attribute or if it's empty
            if (!srcsetAttrValue || srcsetAttrValue.trim() === '') {
                continue;
            }

            const srcsetAttributeParts = srcsetAttrValue.split(',');
            const currentImageSourceMap = processSrcsetString(srcsetAttributeParts);

            const maxEffectiveWidth = determineMaxSourceWidth(currentImageSourceMap);
            let finalSrcUrl = ''; // Initialize with empty string

            // Helper to determine the best image source
            const getBestImageSource = (viewportWidth, sourceMap, largestWidth, buffer) => {
                let bestMatchSrc = '';
                let bestMatchWidth = -1;
                let infinitySrc = '';

                // First, find the largest width that is less than or equal to the viewport
                for (const sourceWidthKey in sourceMap) {
                    if (Object.prototype.hasOwnProperty.call(sourceMap, sourceWidthKey)) {
                        if (sourceWidthKey === 'infinity') {
                            infinitySrc = sourceMap[sourceWidthKey];
                            continue;
                        }

                        const numericWidth = parseInt(sourceWidthKey, 10);
                        if (!isNaN(numericWidth) && viewportWidth >= numericWidth) {
                            if (numericWidth > bestMatchWidth) {
                                bestMatchWidth = numericWidth;
                                bestMatchSrc = sourceMap[sourceWidthKey];
                            }
                        }
                    }
                }

                // If a suitable match was found, use it.
                if (bestMatchSrc) {
                    return bestMatchSrc;
                }

                // If no direct match, consider the 'infinity' source for very large viewports
                if (infinitySrc && viewportWidth > (largestWidth + buffer)) {
                    return infinitySrc;
                }

                // Fallback: If no match found, try to use the smallest available image,
                // or the largest if no other criteria fit.
                // This is an added robustness measure.
                let fallbackSrc = '';
                let smallestWidth = Infinity;
                let largestAvailableWidth = 0;

                for (const sourceWidthKey in sourceMap) {
                    if (Object.prototype.hasOwnProperty.call(sourceMap, sourceWidthKey) && sourceWidthKey !== 'infinity') {
                        const numericWidth = parseInt(sourceWidthKey, 10);
                        if (!isNaN(numericWidth)) {
                            if (numericWidth < smallestWidth) {
                                smallestWidth = numericWidth;
                                fallbackSrc = sourceMap[sourceWidthKey];
                            }
                            if (numericWidth > largestAvailableWidth) {
                                largestAvailableWidth = numericWidth;
                            }
                        }
                    }
                }

                // If viewport is smaller than any specified width, use the smallest.
                // Otherwise, if no other rule caught it, use the largest available.
                if (viewportWidth < smallestWidth && fallbackSrc) {
                    return fallbackSrc;
                }
                // If we reached here, and there's an infinity source, but the viewport isn't huge,
                // we might still want to use the largest *defined* image.
                if (sourceMap[largestAvailableWidth]) {
                    return sourceMap[largestAvailableWidth];
                }

                return ''; // Default fallback if nothing works
            };

            finalSrcUrl = getBestImageSource(currentViewportWidth, currentImageSourceMap, maxEffectiveWidth, maxSizePadding);

            // Only update the src if a valid URL was determined
            if (finalSrcUrl) {
                currentImage.src = finalSrcUrl;
            } else {
                // Optionally log if an image's srcset couldn't be resolved
                console.debug(`Responsive Image Updater: Could not resolve srcset for image:`, currentImage);
            }
        }
    };

    /**
     * Helper function for attaching event listeners across browsers.
     * @param {Window|Document} target - The object to attach the listener to.
     * @param {string} eventType - The type of event (e.g., "resize", "DOMContentLoaded").
     * @param {Function} handler - The event handler function.
     * @param {boolean} [useCapture=false] - Whether to use capture phase.
     */
    const attachEventHandler = function (target, eventType, handler, useCapture = false) {
        if (target.addEventListener) {
            target.addEventListener(eventType, handler, useCapture);
        } else if (target.attachEvent) { // For older IE
            target.attachEvent("on" + eventType, handler);
        }
    };

    /**
     * Helper function for removing event listeners across browsers.
     * @param {Window|Document} target - The object to remove the listener from.
     * @param {string} eventType - The type of event.
     * @param {Function} handler - The event handler function.
     * @param {boolean} [useCapture=false] - Whether to use capture phase.
     */
    const detachEventHandler = function (target, eventType, handler, useCapture = false) {
        if (target.removeEventListener) {
            target.removeEventListener(eventType, handler, useCapture);
        } else if (target.detachEvent) { // For older IE
            target.detachEvent("on" + eventType, handler);
        }
    };

    // Attach event listeners for initial run and subsequent viewport changes.
    // Utilize modern addEventListener where possible, with fallback for legacy browsers.
    if (globalWindow.addEventListener) {
        // Run on window resize for dynamic adjustments
        attachEventHandler(globalWindow, "resize", globalWindow.responsiveImageUpdater, false);

        // Run when the DOM is fully loaded, but before all resources (images, etc.) are.
        // This is the primary trigger for initial srcset processing.
        attachEventHandler(globalWindow.document, "DOMContentLoaded", function() {
            globalWindow.responsiveImageUpdater();
            // Once DOMContentLoaded has fired and processed images,
            // the 'load' event listener (if present) is redundant for initial processing.
            // Remove it to prevent double execution on 'load' event.
            detachEventHandler(globalWindow, "load", globalWindow.responsiveImageUpdater, false);
        }, false);

        // As a final fallback, run on window 'load' event,
        // in case DOMContentLoaded isn't supported or misses something.
        // This listener will be removed by DOMContentLoaded handler if it runs.
        attachEventHandler(globalWindow, "load", globalWindow.responsiveImageUpdater, false);
    } else if (globalWindow.attachEvent) { // Legacy IE support
        // For IE, 'onload' handles both DOM ready and full load.
        // There's no direct equivalent for DOMContentLoaded with attachEvent.
        attachEventHandler(globalWindow, "load", globalWindow.responsiveImageUpdater);
    }

})(this);