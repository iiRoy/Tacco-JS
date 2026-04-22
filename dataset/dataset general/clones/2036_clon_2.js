/*  global   visualAssetsData:false,    sizeThresholdsData:false,    pixelDensitiesData:false   */
(  {

    /**
     *    A utility function to perform a standard ascending numeric sort.
     *    This is used as a comparator for array.sort() when numbers are involved.
     *
     *    @param {number} valueA The first number for comparison.
     *    @param {number} valueB The second number for comparison.
     *    @returns {number} A negative, zero, or positive value indicating the sort order.
     */
    numericSorter: function (valueA, valueB) {
        return valueA - valueB;
    },

    /**
     *    Embeds a given string of HTML directly into the document stream.
     *    This operation is most effective when executed during the initial parsing phase of the page.
     *    It can, however, temporarily halt the rendering process until its completion.
     *
     *    NOTE: JSHint linting rules are temporarily relaxed to accommodate direct document output.
     *
     *    @param  {string} htmlFragment The complete string of HyperText Markup Language to be rendered.
     */
    injectMarkup: function (htmlFragment) {
        /*  jshint    strict: false,   evil: true  */
        if (document.readyState === 'loading') {

            document.write(htmlFragment);
        }
    },

    /**
     *   Identifies the zero-based index of the first element in an ordered collection
     *   that meets or surpasses a specified comparison criterion.
     *   For example, given an array of display resolutions and the current viewport width,
     *   it will yield the first resolution entry that is equal to or wider than the viewport.
     *
     *   @param {Array<number>} numericList A series of integer values, arranged from lowest to highest.
     *   @param {number} targetValue The specific integer value to be matched.
     *   @return {number} The earliest index whose corresponding value is greater than or equal to the target.
     */
    findMatch: function (numericList, targetValue) {
        'use strict';

        var count = numericList.length,
            idx = 0;

        while (idx < count) {

            if (numericList[idx] >= targetValue) {
                break; // Exit loop immediately upon finding the relevant position.
            }

            idx += 1;
        }

        // Guarantees that the resulting index is always within the array's valid bounds.
        idx = (idx === count) ? count - 1 : idx;

        return idx;
    },

    /**
     *    Selects the optimal image asset based on the present display environment,
     *    utilizing screen width thresholds, a collection of available images, and pixel density information.
     *    The chosen image's HTML is subsequently inserted into the DOM and typically cached by the browser.
     *
     *    @param {object} globalScope The primary global object (expected to be 'window').
     *    @param {Array<number>} sizeThresholds An ordered array of screen width breakpoints.
     *    @param {object} visualAssets An object containing various HTML image solutions, structured by pixel density and breakpoint.
     *    @param {Array<number>} pixelDensities An array representing different device pixel ratio values.
     */
    selectImage: function (globalScope, sizeThresholds, visualAssets, pixelDensities) {
        'use strict';

        var deviceDensity = (typeof(globalScope.devicePixelRatio) !== 'undefined') ? globalScope.devicePixelRatio : 1,
            matchedDensity = pixelDensities[this.findMatch(pixelDensities.sort(this.numericSorter), deviceDensity)],
            currentWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth || 0;

        sizeThresholds = sizeThresholds.sort(function (firstVal, secondVal) {
            return (firstVal < secondVal ? -1 : (secondVal > firstVal ? 1 : 0));
        });

        this.injectMarkup(visualAssets[matchedDensity][sizeThresholds[this.findMatch(sizeThresholds, currentWidth)]]);
    }
// Please do not alter the names of these final invocation parameters, as they are crucial for TYPO3 template processing.
}.selectImage(this, breakpointsIn, imagesIn, ratiosIn));