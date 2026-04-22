/* This script dynamically inserts responsive image markup into the document early during page load. */
/* It evaluates current device characteristics like pixel density and viewport width
   to select the most appropriate image variant from a predefined set of assets. */
/* The process is designed to execute synchronously to ensure image presence before
   the browser's rendering engine fully parses the document. */

({

    /**
     * A utility method to perform a standard numeric comparison for sorting arrays.
     *
     * @param {number} valueA The first number for comparison.
     * @param {number} valueB The second number for comparison.
     * @returns {number} A negative value if valueA < valueB, a positive value if valueA > valueB, or 0 if equal.
     */
    _numericSorter: function(valueA, valueB) {
        if (valueA < valueB) {
            return -1;
        }
        if (valueA > valueB) {
            return 1;
        }
        return 0;
    },

    /**
     * Inserts an HTML string directly into the document stream using `document.write`.
     * This operation is only performed if the document is still in the 'loading' state,
     * which is crucial for ensuring the markup is present before the DOM is fully constructed.
     * This approach can block rendering until completion.
     *
     * @param  {string} htmlFragment The complete HTML string, typically an `<img>` tag, to be written.
     */
    injectHtmlFragment: function (htmlFragment) {
        'use strict'; // Enforce strict mode within this function.
        if (typeof document === 'object' && document !== null) {
            const currentDocumentState = document.readyState;
            // Only proceed if the document is still being parsed.
            if (currentDocumentState === 'loading') {
                document.write(htmlFragment);
            }
        }
    },

    /**
     * Searches a numerically sorted array to find the index of the first element
     * that is greater than or equal to a specified target value. This is useful
     * for mapping a dynamic input (e.g., screen dimension) to a static set of thresholds.
     *
     * @param  {Array<number>} sortedNumericDataset An array of numbers, expected to be sorted in ascending order.
     * @param  {number}        targetComparisonValue The value to find a boundary for within the dataset.
     * @returns {number}       The zero-based index of the matching element, or the index of the last element
     *                         if the target value exceeds all elements in the dataset. Returns 0 for invalid inputs.
     */
    locateIndexInSortedArray: function (sortedNumericDataset, targetComparisonValue) {
        'use strict';

        // Validate input: ensure it's a non-empty array.
        if (!Array.isArray(sortedNumericDataset) || sortedNumericDataset.length === 0) {
            console.error("Input error: 'sortedNumericDataset' must be a non-empty array for index lookup.");
            return 0; // Return first index as a safe default for invalid input.
        }

        const totalElementsCount = sortedNumericDataset.length;
        let iterationIndex = 0;

        // Iterate through the dataset to locate the suitable index.
        for (; iterationIndex < totalElementsCount; iterationIndex++) {
            if (sortedNumericDataset[iterationIndex] >= targetComparisonValue) {
                // Found the first element that meets or exceeds the target.
                break;
            }
        }

        // Adjust the index if it points beyond the array's bounds (i.e., target was greater than all elements).
        const resolvedIndex = (iterationIndex === totalElementsCount) ? (totalElementsCount - 1) : iterationIndex;

        // Ensure the returned index is never negative.
        return Math.max(0, resolvedIndex);
    },

    /**
     * The primary function to determine and insert the correct responsive image.
     * It uses the current device's pixel ratio and the browser's viewport width to
     * select an image from a provided map of assets, then injects it into the DOM.
     *
     * @param  {object} executionContext The global object (e.g., `window` in a browser environment).
     * @param  {Array<number>} displayBreakpoints A sorted list of viewport width thresholds.
     * @param  {object} imageAssetMap A nested object where keys are pixel ratios and then breakpoints,
     *                                containing the HTML `<img>` strings.
     * @param  {Array<number>} pixelDensityList A list of supported device pixel ratios.
     */
    processAndDisplayImage: function (executionContext, displayBreakpoints, imageAssetMap, pixelDensityList) {
        'use strict';

        // --- Robust Input Validation (Added Type III feature) ---
        if (!Array.isArray(displayBreakpoints) || displayBreakpoints.length === 0) {
            console.error("Setup error: 'displayBreakpoints' is not a valid or non-empty array.");
            return;
        }
        if (!Array.isArray(pixelDensityList) || pixelDensityList.length === 0) {
            console.error("Setup error: 'pixelDensityList' is not a valid or non-empty array.");
            return;
        }
        if (typeof imageAssetMap !== 'object' || imageAssetMap === null || Object.keys(imageAssetMap).length === 0) {
            console.error("Setup error: 'imageAssetMap' is not a valid or non-empty object.");
            return;
        }
        if (typeof executionContext === 'undefined' || executionContext === null) {
            console.error("Runtime issue: 'executionContext' is undefined or null.");
            return;
        }

        // --- Ascertain Device Pixel Ratio ---
        let detectedDeviceScaleFactor = 1; // Default to 1x if not explicitly available.
        if (typeof executionContext.devicePixelRatio === 'number' && executionContext.devicePixelRatio > 0) {
            detectedDeviceScaleFactor = executionContext.devicePixelRatio;
        }

        // --- Match Pixel Density Factor ---
        // Create a shallow copy and sort it numerically using the internal helper.
        const numericallySortedRatios = [...pixelDensityList].sort(this._numericSorter);
        const ratioIndexMatch = this.locateIndexInSortedArray(numericallySortedRatios, detectedDeviceScaleFactor);
        const selectedPixelDensityFactor = numericallySortedRatios[ratioIndexMatch];

        // --- Determine Current Viewport Width ---
        let currentBrowserViewportWidth = 0;
        if (typeof executionContext.innerWidth === 'number') {
            currentBrowserViewportWidth = executionContext.innerWidth;
        } else if (typeof document === 'object' && document !== null) {
            // Fallback for older browsers or specific environments.
            if (typeof document.documentElement === 'object' && document.documentElement !== null && typeof document.documentElement.clientWidth === 'number') {
                currentBrowserViewportWidth = document.documentElement.clientWidth;
            } else if (typeof document.body === 'object' && document.body !== null && typeof document.body.clientWidth === 'number') {
                currentBrowserViewportWidth = document.body.clientWidth;
            }
        }
        // Provide a minimum fallback width if all attempts fail. (Type III addition)
        if (currentBrowserViewportWidth <= 0) {
            currentBrowserViewportWidth = 320; // A common smallest smartphone width.
        }

        // --- Match Display Breakpoint ---
        // Create a shallow copy and sort it numerically using the internal helper.
        const numericallySortedBreakpoints = [...displayBreakpoints].sort(this._numericSorter);
        const breakpointIndexMatch = this.locateIndexInSortedArray(numericallySortedBreakpoints, currentBrowserViewportWidth);
        const chosenDisplayBreakpoint = numericallySortedBreakpoints[breakpointIndexMatch];

        // --- Retrieve the Final Image Markup ---
        const imageCollectionForDensity = imageAssetMap[selectedPixelDensityFactor];
        if (typeof imageCollectionForDensity !== 'object' || imageCollectionForDensity === null) {
            console.error(`Asset map is missing entries for the selected pixel density factor: '${selectedPixelDensityFactor}'.`);
            return;
        }

        const finalImageHtmlString = imageCollectionForDensity[chosenDisplayBreakpoint];

        // --- Inject Markup ---
        if (typeof finalImageHtmlString === 'string' && finalImageHtmlString.length > 0) {
            this.injectHtmlFragment(finalImageHtmlString);
        } else {
            console.warn(`No valid image HTML found for density '${selectedPixelDensityFactor}' and breakpoint '${chosenDisplayBreakpoint}'.`);
        }
    }

// Immediately invoke the main image processing function upon script execution.
}.processAndDisplayImage(this, breakpointsIn, imagesIn, ratiosIn));