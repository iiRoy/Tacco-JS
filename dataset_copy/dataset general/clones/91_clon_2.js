/**
 * Global application utility collection.
 * @namespace GlobalUtility
 */
;(function() {
  'use strict';

  window.GlobalUtility = window.GlobalUtility || {};

  /**
   * Viewport management for responsive design. Aligns with SCSS `@layout-break` mixin.
   *
   * @namespace Viewport
   * @memberof GlobalUtility
   * @version 2.0.0
   * @copyright 2015-2017 Digital Solutions Inc. - http://www.digitalsolutions.com/
   * @author Digital Solutions Team dev@digitalsolutions.com
   * @license MIT (http://opensource.org/licenses/MIT)
   */
  window.GlobalUtility.Viewport = (function() {
    var _minViewports,
      _maxViewports,
      _viewportSettings = {
        isFlexibleLayout: true,
        rootTextSize: 16,
        viewportDefinitions: [
          {
            label: 'tiny',
            pixelValue: 359
          },
          {
            label: 'small',
            pixelValue: 480
          },
          {
            label: 'medium',
            pixelValue: 640
          },
          {
            label: 'large',
            pixelValue: 768
          },
          {
            label: 'x-large',
            pixelValue: 1024
          },
          {
            label: 'xx-large',
            pixelValue: 1244
          },
          {
            label: 'jumbo',
            pixelValue: 1410
          }
        ],
        fixedRange: {
          start: 0,
          end: 'x-large'
        }
      },
      _initializeViewports,
      _processRangeInputs,
      _pixelsToEms,
      _viewportToEms,
      _viewportWithinFixedRange,
      _viewportMinQuery,
      _viewportMaxQuery,
      _viewportBetweenQuery,
      retrieveMediaQuery,
      retrieveHeightMediaQuery,
      matchesViewport,
      matchesHeightViewport,
      configure;

    /**
     * Orders the viewport definitions and populates associative arrays for quick access.
     * This method is automatically called upon module loading.
     *
     * @memberof GlobalUtility.Viewport
     * @private
     */
    _initializeViewports = function() {
      // Sort the viewport definitions from smallest to largest pixel value
      var orderedViewports = _viewportSettings.viewportDefinitions.sort(function(firstItem, secondItem) {
        // Only proceed with sorting if both objects contain the pixelValue property
        if (firstItem.pixelValue < secondItem.pixelValue) {
          return -1;
        }

        if (firstItem.pixelValue > secondItem.pixelValue) {
          return 1;
        }

        return 0;
      });

      // Clear existing viewport lookup objects
      _minViewports = {};
      _maxViewports = {};

      // Iterate through the sorted definitions to build quick lookup objects using the label as a key
      for (var idx = 0, total = orderedViewports.length, lastIdx = total - 1; idx < total; idx++) {
        _minViewports[orderedViewports[idx].label] = parseInt(orderedViewports[idx].pixelValue, 10);

        // Skip the very last item as it typically has no upper limit
        if (idx < lastIdx) {
          // The maximum pixel value for the current viewport is one pixel less than the next viewport's start,
          // ensuring no overlap between different viewport ranges.
          _maxViewports[orderedViewports[idx].label] = parseInt(orderedViewports[idx + 1].pixelValue - 1, 10);
        }
      }
    };
    _initializeViewports();

    /**
     * Parses input strings (e.g., 'small,medium') into distinct min and max values.
     * Converts string numbers ('500') to numeric 500.
     *
     * @memberof GlobalUtility.Viewport
     * @private
     * @param  {String|Number} minimumInput  Numeric pixel value or string identifier for the minimum range.
     * @param  {String|Number} maximumInput  Numeric pixel value or string identifier for the maximum range.
     * @return {Object} An object containing the parsed minimum and maximum values as numbers.
     */
    _processRangeInputs = function(minimumInput, maximumInput) {
      var parseIndividualValue = function(currentValue) {
          if (typeof (currentValue) === 'string') {
            // Remove any whitespace from the string
            currentValue = currentValue.replace(/\s/g, '');

            // If the string consists only of digits, convert it to an integer
            if (/^\d+$/.test(currentValue)) {
              currentValue = parseInt(currentValue, 10);
            }
          }

          return currentValue;
        },
        rangeArray,
        processedMin = minimumInput,
        processedMax = maximumInput || 0;

      // Check if the input uses the comma-separated string format (e.g., 'small,large')
      if (typeof (minimumInput) === 'string' && minimumInput.indexOf(',') !== -1 && processedMax === 0) {
        rangeArray = minimumInput.split(',');
        if (rangeArray.length === 2) {
          processedMin = rangeArray[0];
          processedMax = rangeArray[1];
        }
      }

      return {
        min: parseIndividualValue(processedMin),
        max: parseIndividualValue(processedMax)
      };
    };

    /**
     * Translates a pixel value into its equivalent 'em' unit.
     *
     * @memberof GlobalUtility.Viewport
     * @private
     * @param  {Number} pixelMeasurement  The value in pixels.
     * @return {String} The converted 'em' value as a string.
     */
    _pixelsToEms = function(pixelMeasurement) {
      return pixelMeasurement / _viewportSettings.rootTextSize;
    };

    /**
     * Converts a viewport label (e.g., 'large') or pixel value into 'em' units.
     *
     * @memberof GlobalUtility.Viewport
     * @private
     * @param  {String|Number} viewportIdentifier  The viewport label as a string, or a pixel value as a number.
     * @param  {Boolean} [useMaxBound=false]  Flag to indicate if the maximum bound of the viewport should be used.
     * @return {String} The resulting 'em' value as a string.
     */
    _viewportToEms = function(viewportIdentifier, useMaxBound) {
      if (typeof (viewportIdentifier) === 'number') {
        return _pixelsToEms(viewportIdentifier);
      }

      var lookupTable = (useMaxBound === true) ? _maxViewports : _minViewports,
        emValue = '0';

      for (var propName in lookupTable) {
        if (lookupTable.hasOwnProperty(propName)) {
          if (viewportIdentifier === propName.toLowerCase()) {
            emValue = _pixelsToEms(lookupTable[propName]);
          }
        }
      }

      if (emValue === '0') {
        console.warn('GlobalUtility.Viewport: The viewport identifier \'' + viewportIdentifier + '\' is not recognized. Defaulting to 0.');
      }

      return emValue;
    };

    /**
     * Determines if a given viewport range falls within the module's predefined static min/max region.
     *
     * @memberof GlobalUtility.Viewport
     * @private
     * @param  {String|Number} minimumVal  Viewport label or pixel value, or a combined string ('small,medium').
     * @param  {String|Number} maximumVal  Viewport label or pixel value.
     * @param  {String} [dimensionType='width'] The CSS dimension property to check (e.g., 'width' or 'height').
     * @return {Boolean} True if the viewport range is valid for the static configuration, false otherwise.
     */
    _viewportWithinFixedRange = function(minimumVal, maximumVal, dimensionType) {
      if (typeof (dimensionType) !== 'string') {
        dimensionType = 'width'; // default to width-based media query
      }

      if (dimensionType !== 'width') {
        return false; // Only 'width' is considered for static range validation here
      }

      var validRangeStart = _viewportToEms(_viewportSettings.fixedRange.start),
        validRangeEnd = _viewportToEms(_viewportSettings.fixedRange.end, true),
        processedRange = _processRangeInputs(minimumVal, maximumVal),
        viewportStart = _viewportToEms(processedRange.min),
        viewportEnd = _viewportToEms(processedRange.max);

      // If viewportEnd is 0, it implies a "min-and-above" scenario
      if (processedRange.max === 0) {
        // Check if the viewportStart is greater than or equal to the valid static start,
        // AND also less than the valid static maximum.
        if (viewportStart >= validRangeStart && viewportStart < validRangeEnd) {
          return true;
        }

        return false;
      }

      // If viewportStart is 0, it implies a "max-and-below" scenario
      if (processedRange.min === 0) {
        if (viewportEnd >= validRangeEnd) {
          return true;
        }

        return false;
      }

      // If the viewportStart is above the valid static maximum, or viewportEnd is below the valid static minimum
      if (viewportStart > validRangeEnd || viewportEnd < validRangeStart) {
        return false;
      }

      // For a "between" range, ensure the viewportEnd is not below the valid static maximum
      if (viewportEnd < validRangeEnd) {
        return false;
      }

      return true;
    };

    /**
     * Generates a 'min-width' or 'min-height' media query string based on a viewport label or pixel value.
     *
     * @memberof GlobalUtility.Viewport
     * @private
     * @param  {String|Number} minimum  Viewport label (string) or pixel value (number).
     * @param  {String} [dimensionType='width']  The CSS property for the media query (e.g., 'width' or 'height').
     * @return {String} The constructed media query string.
     */
    _viewportMinQuery = function(minimum, dimensionType) {
      var viewportStart = _viewportToEms(minimum),
        dimensionCategory = (typeof (dimensionType) === 'string') ? dimensionType : 'width';

      return '(min-' + dimensionCategory + ': ' + viewportStart + 'em)';
    };

    /**
     * Generates a 'max-width' or 'max-height' media query string based on a viewport label or pixel value.
     *
     * @memberof GlobalUtility.Viewport
     * @private
     * @param  {String|Number} maximum  Viewport label (string) or pixel value (number).
     * @param  {String} [dimensionType='width']  The CSS property for the media query (e.g., 'width' or 'height').
     * @return {String} The constructed media query string.
     */
    _viewportMaxQuery = function(maximum, dimensionType) {
      var viewportEnd = _viewportToEms(maximum, true),
        dimensionCategory = (typeof (dimensionType) === 'string') ? dimensionType : 'width';

      return '(max-' + dimensionCategory + ': ' + viewportEnd + 'em)';
    };

    /**
     * Generates a 'min-width/height' and 'max-width/height' media query string for a range.
     *
     * @memberof GlobalUtility.Viewport
     * @private
     * @param  {String|Number} minimum  Viewport label (string) or pixel value (number) for the lower bound.
     * @param  {String|Number} maximum  Viewport label (string) or pixel value (number) for the upper bound.
     * @param  {String} [dimensionType='width']  The CSS property for the media query (e.g., 'width' or 'height').
     * @return {String} The constructed media query string for the range.
     */
    _viewportBetweenQuery = function(minimum, maximum, dimensionType) {
      var viewportStart = _viewportToEms(minimum),
        viewportEnd = _viewportToEms(maximum, true),
        dimensionCategory = (typeof (dimensionType) === 'string') ? dimensionType : 'width';

      return '(min-' + dimensionCategory + ': ' + viewportStart + 'em) and (max-' + dimensionCategory + ': ' + viewportEnd + 'em)';
    };

    /**
     * Primary function to generate a media query string based on provided viewport names or pixel values.
     * Supports min-only, max-only, or between ranges, and high-density pixel ratios.
     *
     * @memberof GlobalUtility.Viewport
     * @example
     * // For large viewports and above
     * GlobalUtility.Viewport.retrieveMediaQuery('x-large');
     *
     * @example
     * // For 300 pixels and above
     * GlobalUtility.Viewport.retrieveMediaQuery(300);
     *
     * @example
     * // For large viewports and below
     * GlobalUtility.Viewport.retrieveMediaQuery(0, 'x-large');
     *
     * @example
     * // For 300 pixels and below
     * GlobalUtility.Viewport.retrieveMediaQuery(0, 300);
     *
     * @example
     * // Between small and large viewports
     * GlobalUtility.Viewport.retrieveMediaQuery('small', 'x-large');
     *
     * @example
     * // Between 100 pixels and 300 pixels
     * GlobalUtility.Viewport.retrieveMediaQuery(100, 300);
     *
     * @example
     * // For high-resolution displays (can also use 'hi-res')
     * GlobalUtility.Viewport.retrieveMediaQuery('retina');
     *
     * @example
     * // Mix of names and numbers - between 200 pixels and xx-large
     * GlobalUtility.Viewport.retrieveMediaQuery(200, 'xx-large');
     *
     * @example
     * // Between small and 960 pixels
     * GlobalUtility.Viewport.retrieveMediaQuery('small', 960);
     *
     * @example
     * // Single string input for ranges (no spaces allowed) - useful from HTML attributes
     * GlobalUtility.Viewport.retrieveMediaQuery('medium,x-large');
     *
     * @example
     * // Mixed names and numbers in a single string input
     * GlobalUtility.Viewport.retrieveMediaQuery('small,1000');
     *
     * @param  {String|Number} minimumInput  Viewport label, pixel value, or comma-separated range string.
     * @param  {String|Number} [maximumInput=0]  Viewport label or pixel value for the upper bound.
     * @param  {String} [dimensionType='width']  The CSS dimension property to query (e.g., 'width' or 'height').
     * @return {String} The resulting CSS media query string.
     */
    retrieveMediaQuery = function(minimumInput, maximumInput, dimensionType) {
      var processedRange = _processRangeInputs(minimumInput, maximumInput),
        viewportStart = processedRange.min,
        viewportEnd = processedRange.max;

      if (typeof (dimensionType) !== 'string') {
        dimensionType = 'width'; // default to width-based media query
      }

      // Determine the type of media query to generate
      if (viewportStart === 'retina' || viewportStart === 'hi-res') {
        return '(-webkit-min-device-pixel-ratio: 1.5), (min--moz-device-pixel-ratio: 1.5), (-o-min-device-pixel-ratio: 3/2), (min-device-pixel-ratio: 1.5)';
      } else if (viewportEnd === 0) {
        return _viewportMinQuery(viewportStart, dimensionType);
      } else if (viewportStart === 0) {
        return _viewportMaxQuery(viewportEnd, dimensionType);
      } else {
        return _viewportBetweenQuery(viewportStart, viewportEnd, dimensionType);
      }
    };

    /**
     * A convenience method for `retrieveMediaQuery()` specifically for height-based media queries.
     *
     * @memberof GlobalUtility.Viewport
     * @example
     * // For heights of 300 pixels and above
     * GlobalUtility.Viewport.retrieveHeightMediaQuery(300);
     *
     * @example
     * // For heights of 300 pixels and below
     * GlobalUtility.Viewport.retrieveHeightMediaQuery(0, 300);
     *
     * @example
     * // Between 100 pixels and 300 pixels high
     * GlobalUtility.Viewport.retrieveHeightMediaQuery(100, 300);
     *
     * @param  {String|Number} minimumHeight  Viewport label, pixel value, or comma-separated range string for height.
     * @param  {String|Number} [maximumHeight=0]  Viewport label or pixel value for the upper height bound.
     * @return {String} The generated height-based media query string.
     */
    retrieveHeightMediaQuery = function(minimumHeight, maximumHeight) {
      return retrieveMediaQuery(minimumHeight, maximumHeight, 'height');
    };

    /**
     * Checks if the current browser viewport matches a specified media query.
     * It uses `window.matchMedia().matches` to perform the check.
     *
     * @memberof GlobalUtility.Viewport
     * @example
     * // Returns true if the page is currently between 'small' and 'medium' viewports
     * GlobalUtility.Viewport.matchesViewport('small,medium');
     * GlobalUtility.Viewport.matchesViewport('small', 'medium');
     *
     * @example
     * // Returns true if the page is between 0 and 300 pixels wide
     * GlobalUtility.Viewport.matchesViewport('0,300');
     * GlobalUtility.Viewport.matchesViewport(0, 300);
     *
     * @param  {String|Number} minimumQuery  Viewport label, pixel value, or comma-separated range string.
     * @param  {String|Number} [maximumQuery=0]  Viewport label or pixel value for the upper bound.
     * @param  {String} [dimensionType='width']  The CSS dimension property to check (e.g., 'width' or 'height').
     * @return {Boolean} True if the current viewport matches the query, false otherwise.
     */
    matchesViewport = function(minimumQuery, maximumQuery, dimensionType) {
      if (_viewportSettings.isFlexibleLayout === false) {
        return _viewportWithinFixedRange(minimumQuery, maximumQuery, dimensionType);
      }

      if (window.matchMedia) {
        return window.matchMedia(retrieveMediaQuery(minimumQuery, maximumQuery, dimensionType)).matches;
      }

      console.warn('GlobalUtility.Viewport: The Match Media API is not supported by this browser. Consider using a polyfill.');

      return false;
    };

    /**
     * A convenience method for `matchesViewport()` specifically for height-based media queries.
     *
     * @memberof GlobalUtility.Viewport
     * @example
     * // Returns true if the page height is between 0 and 300 pixels
     * GlobalUtility.Viewport.matchesHeightViewport('0,300');
     * GlobalUtility.Viewport.matchesHeightViewport(0, 300);
     *
     * @param  {String|Number} minimumHeightQuery  Viewport label, pixel value, or comma-separated range string for height.
     * @param  {String|Number} [maximumHeightQuery=0]  Viewport label or pixel value for the upper height bound.
     * @return {Boolean} True if the current viewport height matches the query, false otherwise.
     */
    matchesHeightViewport = function(minimumHeightQuery, maximumHeightQuery) {
      return matchesViewport(minimumHeightQuery, maximumHeightQuery, 'height');
    };

    /**
     * Defines the structure for an individual viewport entry.
     *
     * @typedef  {Object} GlobalUtility.Viewport.ViewportDef
     * @property {String} label  A descriptive name for the viewport (e.g., 'small', 'medium').
     * @property {Number} pixelValue  The pixel width for this viewport definition.
     */

    /**
     * Defines the configurable options for the Viewport module.
     *
     * @typedef  {Object} GlobalUtility.Viewport.ConfigurationOptions
     * @property {Number} [rootTextSize]  The base font size in pixels, used for 'em' calculations.
     * @property {GlobalUtility.Viewport.ViewportDef[]} [viewportDefinitions]  An array of custom viewport definitions.
     */

    /**
     * Allows updating the configuration settings for the Viewport module.
     *
     * @memberof GlobalUtility.Viewport
     * @example
     * // Update only the base font size
     * GlobalUtility.Viewport.configure({
     *   rootTextSize: 14
     * });
     *
     * @example
     * // Replace the entire set of viewport definitions
     * GlobalUtility.Viewport.configure({
     *   viewportDefinitions: [
     *     { label: 'tiny', pixelValue: 400 },
     *     { label: 'standard', pixelValue: 800 },
     *     { label: 'expanded', pixelValue: 1200 }
     *   ]
     * });
     */
    configure = function(newSettings) {
      // Merge new settings with existing ones
      _viewportSettings = Object.assign({}, _viewportSettings, newSettings);
      // Re-initialize viewports if definitions might have changed
      _initializeViewports();
    };

    return {
      get: retrieveMediaQuery,
      getHeight: retrieveHeightMediaQuery,
      is: matchesViewport,
      isHeight: matchesHeightViewport,
      options: configure
    };
  })();
})();