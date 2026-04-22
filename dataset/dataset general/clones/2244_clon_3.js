(function (jq) {
  'use strict'; // Enforcing stricter parsing and error handling for better code quality.

  /**
   * Iteratively determines the optimal cutoff point for text truncation using a binary search approach.
   * This function aims to find the longest possible substring that fits within a specified dimension.
   *
   * @param {string} sizeProperty - The CSS property to measure ('width' or 'height').
   * @param {number} targetDimension - The maximum allowed dimension (e.g., width or height in pixels).
   * @param {string} sourceText - The full string to be truncated.
   * @param {number} searchStart - The lower bound of the current search range (character index).
   * @param {number} searchEnd - The upper bound of the current search range (character index).
   * @param {jQuery} measurementElement - A hidden jQuery element used for precise text dimension measurement.
   * @param {string} ellipsisChar - The character(s) representing the truncation indicator (e.g., '&hellip;').
   * @param {boolean} isReversedSearch - If true, truncation is applied from the end of the string (right to left).
   * @returns {number} The character index representing the calculated truncation point.
   */
  function determineCutoffPosition(sizeProperty, targetDimension, sourceText, searchStart, searchEnd, measurementElement, ellipsisChar, isReversedSearch) {
    // If the target dimension is non-positive, no text can fit.
    if (targetDimension <= 0) {
      return 0;
    }

    // Helper to update the measurement element's content and add the ellipsis.
    const updateMeasurementContent = (contentSegment) => {
      measurementElement.text(contentSegment);
      // Prepend or append the ellipsis based on the search direction.
      if (isReversedSearch) {
        measurementElement.prepend(ellipsisChar);
      } else {
        measurementElement.append(ellipsisChar);
      }
    };

    let currentLow = searchStart;
    let currentHigh = searchEnd;
    let bestFitIndex = 0; // Stores the largest index that still fits.

    // Check if the full string, even with an ellipsis, is too large.
    updateMeasurementContent(sourceText);
    if (measurementElement[sizeProperty]() < targetDimension) {
      return sourceText.length; // The whole string fits.
    }

    // Perform a binary search to find the optimal truncation point.
    while (currentLow <= currentHigh) {
      const midPoint = Math.floor((currentLow + currentHigh) / 2);
      let testSegment;

      // Extract the segment based on the search direction.
      if (isReversedSearch) {
        testSegment = sourceText.slice(-midPoint);
      } else {
        testSegment = sourceText.slice(0, midPoint);
      }

      updateMeasurementContent(testSegment);
      const measuredDim = measurementElement[sizeProperty]();

      if (measuredDim <= targetDimension) {
        // If it fits, this could be our answer. Try a longer segment.
        bestFitIndex = midPoint;
        currentLow = midPoint + 1;
      } else {
        // If it doesn't fit, the segment is too long. Try a shorter one.
        currentHigh = midPoint - 1;
      }
    }

    return bestFitIndex;
  }

  /**
   * jQuery plugin to truncate text content of elements.
   * Supports left, right, and center truncation, multiline, and custom indicators.
   *
   * @param {object} configObj - Configuration options for truncation.
   * @param {string} [configObj.desiredWidth='auto'] - The target width in pixels, or 'auto' to use element's current width.
   * @param {string} [configObj.indicatorSymbol='&hellip;'] - The HTML string for the truncation indicator.
   * @param {string} [configObj.cutDirection='right'] - Truncation direction: 'left', 'right', or 'center'.
   * @param {string|boolean} [configObj.applyStyleClass=false] - CSS class to add to truncated elements.
   * @param {boolean} [configObj.addFullTextTitle=false] - If true, adds a title attribute with the original text.
   * @param {boolean} [configObj.enableMultiline=false] - If true, truncates based on height for multiline text.
   * @param {boolean} [configObj.optimizeWorkerReuse=false] - If true, reuses a single measurement element for all items.
   * @returns {jQuery} The jQuery object for chaining.
   */
  jq.fn.trimText = function (configObj) {
    const validDirections = new Set(['left', 'right', 'center']);

    // Handle backward compatibility: 'center' property used instead of 'side'
    if (configObj?.center && !configObj.cutDirection) {
      configObj.cutDirection = 'center';
      delete configObj.center; // Remove the old property.
    }

    // Validate and sanitize cutDirection.
    if (configObj?.cutDirection && !validDirections.has(configObj.cutDirection)) {
      delete configObj.cutDirection;
    }

    // Default configuration settings.
    const defaultConfigs = {
      desiredWidth: 'auto',
      indicatorSymbol: '&hellip;',
      cutDirection: 'right',
      applyStyleClass: false,
      addFullTextTitle: false,
      enableMultiline: false,
      optimizeWorkerReuse: false
    };

    // Merge user configurations with defaults.
    const mergedConfigs = Object.assign({}, defaultConfigs, configObj);

    // If no elements are selected, return early.
    if (!this.length) {
      return this;
    }

    let sharedSizingProbe = null;

    // Helper to create and style the measurement element.
    const createSizingProbe = (elementRef, initialText = '') => {
      const stylePropsToCopy = [
        'fontFamily', 'fontSize', 'fontStyle', 'fontWeight', 'font-variant',
        'text-indent', 'lineHeight', 'text-transform', 'letter-spacing', 'word-spacing'
      ];
      const acquiredStyles = stylePropsToCopy.reduce((acc, prop) => {
        // Handle camelCase vs kebab-case for CSS properties.
        const cssProp = prop.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`);
        acc[cssProp] = elementRef.css(prop);
        return acc;
      }, {});

      // Crucial for measurement: hidden, inline-block to respect width/height.
      acquiredStyles.display = 'inline-block';
      acquiredStyles.position = 'absolute'; // Prevent layout shifts.
      acquiredStyles.visibility = 'hidden'; // Make it truly invisible.
      acquiredStyles.whiteSpace = 'nowrap'; // Essential for single-line width calculation.
      acquiredStyles.padding = '0';
      acquiredStyles.margin = '0';
      acquiredStyles.border = 'none';

      return jq('<span/>')
        .css(acquiredStyles)
        .text(initialText)
        .appendTo('body');
    };

    // If worker reuse is enabled, create the shared probe once.
    if (mergedConfigs.optimizeWorkerReuse) {
      // We'll use the style of the first element in the collection for the shared probe.
      sharedSizingProbe = createSizingProbe(jq(this[0]));
    }

    // Iterate over each selected element to apply truncation.
    this.each(function () {
      const currentTarget = jq(this);
      const originalString = currentTarget.text();

      // If the original string is empty, nothing to truncate.
      if (!originalString.length) {
        return;
      }

      let sizingProbe;
      let cleanupProbe = false; // Flag to indicate if this loop iteration should remove the probe.

      if (mergedConfigs.optimizeWorkerReuse && sharedSizingProbe) {
        sizingProbe = sharedSizingProbe;
        sizingProbe.text(originalString); // Update content for current element.
        // Also update styles if the current element's styles might differ from the first one.
        // This makes 'optimizeWorkerReuse' less effective if styles vary widely, but safer.
        const stylePropsToCopy = [
          'fontFamily', 'fontSize', 'fontStyle', 'fontWeight', 'font-variant',
          'text-indent', 'lineHeight', 'text-transform', 'letter-spacing', 'word-spacing'
        ];
        stylePropsToCopy.forEach(prop => {
          const cssProp = prop.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`);
          sizingProbe.css(cssProp, currentTarget.css(prop));
        });
      } else {
        sizingProbe = createSizingProbe(currentTarget, originalString);
        cleanupProbe = true;
      }

      let measuredProperty = 'width'; // Default measurement property.
      let fullTextDimension;
      let targetDimensionValue;

      // Determine the target dimension based on configuration.
      if (mergedConfigs.enableMultiline) {
        sizingProbe.width(currentTarget.width()); // Set width for height measurement.
        measuredProperty = 'height';
        fullTextDimension = sizingProbe.height();
        targetDimensionValue = currentTarget.height() + 1; // Allow a slight margin.
      } else {
        fullTextDimension = sizingProbe.width();
        targetDimensionValue = Number.parseInt(mergedConfigs.desiredWidth, 10) || currentTarget.width();
      }

      // If text already fits, no truncation needed.
      if (fullTextDimension <= targetDimensionValue) {
        if (cleanupProbe) {
          sizingProbe.remove();
        }
        return;
      }

      let beforeTruncated = '';
      let afterTruncated = '';

      // Initialize the worker with an empty string to measure just the ellipsis.
      sizingProbe.text('');
      const ellipsisDimension = sizingProbe.html(mergedConfigs.indicatorSymbol)[measuredProperty]();

      // Adjust target dimension to account for the ellipsis.
      const adjustedTargetDim = targetDimensionValue - ellipsisDimension;
      if (adjustedTargetDim <= 0) {
          // If the ellipsis itself is too large, just show the ellipsis.
          currentTarget.empty().html(mergedConfigs.indicatorSymbol);
          if (mergedConfigs.addFullTextTitle) {
              currentTarget.attr('title', originalString);
          }
          if (mergedConfigs.applyStyleClass) {
              currentTarget.addClass(mergedConfigs.applyStyleClass);
          }
          if (cleanupProbe) {
              sizingProbe.remove();
          }
          return;
      }


      if (mergedConfigs.cutDirection === 'left') {
        // Truncate from the left (keep the end of the string).
        const cutIndex = determineCutoffPosition(
          measuredProperty, adjustedTargetDim, originalString, 0, originalString.length,
          sizingProbe, '', true // Pass empty string for ellipsis in recursive call, as it's already accounted for.
        );
        afterTruncated = originalString.slice(-cutIndex);

      } else if (mergedConfigs.cutDirection === 'center') {
        // Truncate from the center (keep parts of both ends).
        const halfTargetDim = Math.floor(adjustedTargetDim / 2);

        // Find the rightmost part that fits in its half.
        const rightPartLength = determineCutoffPosition(
          measuredProperty, halfTargetDim, originalString, 0, originalString.length,
          sizingProbe, '', true
        );
        afterTruncated = originalString.slice(-rightPartLength);

        // Find the leftmost part that fits in its half.
        const leftPartLength = determineCutoffPosition(
          measuredProperty, halfTargetDim, originalString, 0, originalString.length,
          sizingProbe, '', false
        );
        beforeTruncated = originalString.slice(0, leftPartLength);

      } else { // Default to 'right'
        // Truncate from the right (keep the beginning of the string).
        const cutIndex = determineCutoffPosition(
          measuredProperty, adjustedTargetDim, originalString, 0, originalString.length,
          sizingProbe, '', false
        );
        beforeTruncated = originalString.slice(0, cutIndex);
      }

      // Apply additional behaviors.
      if (mergedConfigs.applyStyleClass) {
        currentTarget.addClass(mergedConfigs.applyStyleClass);
      }
      if (mergedConfigs.addFullTextTitle) {
        currentTarget.attr('title', originalString);
      }

      // Encode text segments to prevent HTML injection, then combine with raw ellipsis.
      const finalHtmlContent = `${sizingProbe.text(beforeTruncated).html()}${mergedConfigs.indicatorSymbol}${sizingProbe.text(afterTruncated).html()}`;
      currentTarget.empty().html(finalHtmlContent);

      if (cleanupProbe) {
        sizingProbe.remove();
      }
    });

    // If sharedSizingProbe was used, ensure it's removed after all processing.
    if (sharedSizingProbe) {
      sharedSizingProbe.remove();
    }

    return this; // Enable jQuery method chaining.
  };
})(window.jQuery); // Using window.jQuery explicitly for broader compatibility.