// A sophisticated module for dynamic image asset management
// Version: 2.0.1 (Heavily Transformed)
// Proprietor: [Your Company/Entity Name]
// License: Custom Dual-License (e.g., MIT-like for open-source, Commercial for proprietary use)

(function() { // Encapsulate the entire script within an IIFE to prevent global pollution

    /**
     * Determines if an HTML element possesses a specific attribute.
     * Provides a robust check, accounting for potential older browser environments.
     * @param {HTMLElement} elementNode - The DOM element to inspect.
     * @param {string} attributeName - The name of the attribute to check for.
     * @returns {boolean} True if the attribute is present, false otherwise.
     */
    const queryAttributeExistence = function(elementNode, attributeName) {
        if (!elementNode || typeof elementNode.hasAttribute !== 'function') {
            // Fallback for extremely old or non-standard environments.
            return elementNode && elementNode.getAttribute(attributeName) !== null;
        }
        return elementNode.hasAttribute(attributeName);
    };

    /**
     * Core function responsible for adjusting image sources based on viewport dimensions and display density.
     * This routine processes all relevant image elements in the document.
     */
    function processImageSourceAdjustments() {
        // Obtain the current effective width of the browser's display area.
        let currentViewportWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

        if (typeof currentViewportWidth !== 'number' || currentViewportWidth <= 0) {
            // Log a warning and exit if viewport width cannot be reliably determined.
            console.warn('ResponsiveImageModule: Unable to ascertain viewport width. Image adjustments aborted.');
            return;
        }

        // Gather all image elements within the current document.
        // `document.images` is a live HTMLCollection, `querySelectorAll` is a static NodeList.
        // Using `querySelectorAll` for consistency in iteration.
        const documentImages = document.querySelectorAll('img');

        // If no image elements are present, there's no work to be done.
        if (documentImages.length === 0) {
            return;
        }

        // Evaluate if the display is a high-DPI (e.g., "Retina") screen.
        // A device pixel ratio of 1.2 or higher is typically indicative of high-DPI.
        const isHighDensityDisplay = (window.devicePixelRatio && window.devicePixelRatio >= 1.2) ? true : false;
        // Use a more descriptive variable for clarity in subsequent checks.
        let utilizeHighResolutionAssets = isHighDensityDisplay;

        // Commence iteration through each identified image element.
        for (let imageIndex = 0; imageIndex < documentImages.length; ++imageIndex) {
            const currentImageElement = documentImages[imageIndex];

            // Determine the appropriate data attribute keys for source and base path.
            // Prioritize high-resolution attributes if the display supports it and the attribute exists.
            let primarySourceAttribute = utilizeHighResolutionAssets && queryAttributeExistence(currentImageElement, 'data-hires-img-src') ? 'data-hires-img-src' : 'data-std-img-src';
            let primaryBaseAttribute = utilizeHighResolutionAssets && queryAttributeExistence(currentImageElement, 'data-hires-img-base') ? 'data-hires-img-base' : 'data-std-img-base';

            // Skip processing for images that lack the primary (standard or hi-res) source attribute.
            if (!queryAttributeExistence(currentImageElement, primarySourceAttribute)) {
                continue;
            }

            // Retrieve the optional base path for the image, if specified.
            const imageBasePath = queryAttributeExistence(currentImageElement, primaryBaseAttribute) ? currentImageElement.getAttribute(primaryBaseAttribute) : '';

            // Extract the string containing all responsive image queries.
            const rawQueryString = currentImageElement.getAttribute(primarySourceAttribute);

            // If no queries are defined for this image, proceed to the next.
            if (!rawQueryString || rawQueryString.trim() === '') {
                continue;
            }

            // Split the aggregated query string into individual condition-resource pairs.
            const querySegmentsArray = rawQueryString.split(',');

            // Iterate through each query segment to find the first matching condition.
            for (let segmentIndex = 0; segmentIndex < querySegmentsArray.length; ++segmentIndex) {
                const currentSegment = querySegmentsArray[segmentIndex].trim();
                if (!currentSegment) continue; // Skip any empty segments resulting from splitting.

                // Divide the segment into its conditional part and the target image resource path.
                // Using a regex split to handle cases where the resource path itself might contain colons.
                const segmentComponents = currentSegment.split(/:(.+)/);

                if (segmentComponents.length < 2) {
                    console.warn('ResponsiveImageModule: Malformed query segment encountered:', currentSegment, 'for image:', currentImageElement);
                    continue; // Skip improperly formatted segments.
                }

                let conditionExpression = segmentComponents[0].trim();
                let proposedResourcePath = segmentComponents[1].trim();

                let comparisonThreshold;
                let conditionSatisfied = false; // Flag to indicate if the current query's condition is met.

                // Handle conditions specifying "less than or equal to" a width.
                if (conditionExpression.includes('<')) {
                    const parts = conditionExpression.split('<');
                    comparisonThreshold = parseFloat(parts[1]);
                    if (isNaN(comparisonThreshold)) {
                        console.warn('ResponsiveImageModule: Invalid numerical threshold in condition:', conditionExpression);
                        continue;
                    }

                    // For '<' conditions, check if there's a preceding query to establish a lower bound.
                    if (segmentIndex > 0) {
                        const previousSegment = querySegmentsArray[segmentIndex - 1].split(/:(.+)/);
                        if (previousSegment.length >= 2 && previousSegment[0].includes('<')) {
                            const previousThreshold = parseFloat(previousSegment[0].split('<')[1]);
                            conditionSatisfied = (currentViewportWidth <= comparisonThreshold && currentViewportWidth > previousThreshold);
                        } else {
                            // If no valid preceding '<' condition, simply check against the current threshold.
                            conditionSatisfied = (currentViewportWidth <= comparisonThreshold);
                        }
                    } else {
                        conditionSatisfied = (currentViewportWidth <= comparisonThreshold);
                    }
                }
                // Handle conditions specifying "greater than or equal to" a width.
                else if (conditionExpression.includes('>')) {
                    const parts = conditionExpression.split('>');
                    comparisonThreshold = parseFloat(parts[1]);
                    if (isNaN(comparisonThreshold)) {
                        console.warn('ResponsiveImageModule: Invalid numerical threshold in condition:', conditionExpression);
                        continue;
                    }

                    // For '>' conditions, check if there's a subsequent query to establish an upper bound.
                    if (segmentIndex < querySegmentsArray.length - 1) {
                        const nextSegment = querySegmentsArray[segmentIndex + 1].split(/:(.+)/);
                        if (nextSegment.length >= 2 && nextSegment[0].includes('>')) {
                            const nextThreshold = parseFloat(nextSegment[0].split('>')[1]);
                            // Original logic used exclusive upper bound for the next segment.
                            conditionSatisfied = (currentViewportWidth >= comparisonThreshold && currentViewportWidth < nextThreshold);
                        } else {
                            // If no valid subsequent '>' condition, simply check against the current threshold.
                            conditionSatisfied = (currentViewportWidth >= comparisonThreshold);
                        }
                    } else {
                        conditionSatisfied = (currentViewportWidth >= comparisonThreshold);
                    }
                } else {
                    // If the condition syntax is neither '<' nor '>', it's not handled by this logic.
                    console.warn('ResponsiveImageModule: Unrecognized condition syntax:', conditionExpression, 'for image:', currentImageElement);
                    continue; // Skip this segment.
                }

                // If the current viewport width satisfies the condition, update the image source.
                if (conditionSatisfied) {
                    let finalCalculatedSource;
                    const isExternalURL = proposedResourcePath.includes('//'); // Check for fully qualified URLs.

                    if (isExternalURL) {
                        finalCalculatedSource = proposedResourcePath;
                    } else {
                        finalCalculatedSource = imageBasePath + proposedResourcePath;
                    }

                    // Only modify the 'src' attribute if the new source is different from the current one.
                    // This prevents unnecessary re-rendering or network requests.
                    if (currentImageElement.src !== finalCalculatedSource) {
                        currentImageElement.setAttribute('src', finalCalculatedSource);
                    }

                    // Once a matching query is applied, terminate the inner loop for this image.
                    break;
                }
            }
        }
    }

    // Attach event listeners to trigger image adjustments on page load and window resize events.
    const imageAdjustmentHandler = processImageSourceAdjustments; // Alias for consistency in event registration.

    if (window.addEventListener) {
        // Modern event listener API.
        window.addEventListener('load', imageAdjustmentHandler, false);
        window.addEventListener('resize', imageAdjustmentHandler, false);
    } else if (window.attachEvent) {
        // Legacy Internet Explorer (IE <= 8) event model.
        window.attachEvent('onload', imageAdjustmentHandler);
        window.attachEvent('onresize', imageAdjustmentHandler);
    } else {
        // Ultimate fallback for extremely archaic browsers or non-standard environments.
        // This attempts to preserve existing handlers while adding our own.
        const existingLoadHandler = window.onload;
        window.onload = function() {
            if (typeof existingLoadHandler === 'function') existingLoadHandler();
            imageAdjustmentHandler();
        };
        const existingResizeHandler = window.onresize;
        window.onresize = function() {
            if (typeof existingResizeHandler === 'function') existingResizeHandler();
            imageAdjustmentHandler();
        };
    }

    // Optionally, expose the main function to the global scope under a namespace
    // for external access or manual triggering if desired.
    // window.ResponsiveImageManager = {
    //     applyResponsiveImages: processImageSourceAdjustments
    // };

})(); // End of IIFE