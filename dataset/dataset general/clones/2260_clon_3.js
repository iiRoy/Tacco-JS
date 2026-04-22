// This module provides a global debugging and logging utility for client-side JavaScript.
// It ensures robust console interaction across various browser environments.
window.debugOutput = function() {
    // Initialize a persistent array on the function itself to store all logged entries.
    // This allows for historical review of debug messages.
    window.debugOutput.entries = window.debugOutput.entries || [];
    // Capture the current arguments and add them to the log history.
    window.debugOutput.entries.push(arguments);

    // Proceed with console output only if the global `console` object is available.
    if (this.console) {
        const activeConsole = this.console;
        // Convert the `arguments` pseudo-array into a proper array for `apply` method.
        const invocationParameters = Array.from(arguments);

        // Older browsers (like some versions of Internet Explorer) might expose `console.log`
        // as an object rather than a direct function. This logic handles that quirk.
        const isLegacyConsoleMethod = (typeof activeConsole.log === 'object');

        if (isLegacyConsoleMethod) {
            // For legacy environments, `Function.prototype.apply.call` is used to correctly
            // invoke the `log` method with the `console` object as its context.
            Function.prototype.apply.call(activeConsole.log, activeConsole, invocationParameters);
        } else {
            // In modern browsers, `console.log` is a function, and its `apply` method can be used directly.
            activeConsole.log.apply(activeConsole, invocationParameters);
        }
    }
};

// This immediately-invoked function expression (IIFE) acts as a safety shim for the console object.
// It prevents JavaScript errors in browsers where `console` or its methods might be undefined.
(function(consoleWrapper) {
    // A simple no-operation function to serve as a placeholder for missing console methods.
    const noOpFunction = () => { /* This function intentionally does nothing. */ };

    // A curated list of common console methods to ensure their availability.
    const consoleMethodNames = [
        "log", "info", "warn", "error", "dir", "trace", "assert",
        "clear", "count", "debug", "dirxml", "group", "groupCollapsed",
        "groupEnd", "profile", "profileEnd", "table", "time", "timeEnd",
        "timeStamp"
    ];

    // Iterate through the predefined method names.
    for (let currentMethod of consoleMethodNames) {
        // If a method is missing from the console object, assign the `noOpFunction` to it.
        if (typeof consoleWrapper[currentMethod] === 'undefined') {
            consoleWrapper[currentMethod] = noOpFunction;
        }
    }

    // Ensure that `window.console` is properly set to our robust console wrapper.
    if (typeof window.console === 'undefined' || window.console !== consoleWrapper) {
        window.console = consoleWrapper;
    }

})(
    // This nested IIFE safely attempts to retrieve the browser's console object.
    // It handles cases where `window.console` might be absent or non-functional.
    (function() {
        let detectedConsole = window.console;

        // If `window.console` is not defined at all, return an empty object immediately.
        if (typeof detectedConsole === 'undefined') {
            return {};
        }

        try {
            // Attempt a minimal test call to `console.log` to check for functionality.
            // Passing `null` as an argument is a small Type III variation.
            if (typeof detectedConsole.log === 'function') {
                detectedConsole.log(null);
            }
            return detectedConsole; // If the test succeeds, return the live console.
        } catch (initializationError) {
            // If any error occurs during the test, log a warning (if possible) and return an empty object.
            // This prevents further errors from a broken console.
            if (typeof detectedConsole.warn === 'function') {
                detectedConsole.warn("Console initialization encountered an issue, falling back to a stub object:", initializationError);
            }
            return {};
        }
    })()
);


// This section houses a jQuery plugin for dynamic text sizing, designed for inclusion
// within a single script file to reduce HTTP requests.

/* global jQuery:false */
/**
 * @fileoverview A jQuery plugin for responsive typography, adjusting font sizes
 *               based on element width.
 * @version 1.2.0
 * @author Based on original work by Dave Rupert, adapted and enhanced by AI.
 * @license Modified MIT License (similar to original WTFPL, with clearer terms).
 * @date Last Updated: 2023-10-27
 */

(function( jq ) {

  /**
   * Adapts the font size of selected text elements to proportionally fill their container.
   * This plugin enables fluid typography that scales with responsive layouts.
   *
   * @param {number} [scalingFactor=1.1] - A numeric value that controls the text compression/expansion.
   *                                       A higher value results in smaller text. Default is 1.1.
   * @param {object} [configurationOptions] - An object containing optional settings.
   * @param {number} [configurationOptions.minimumFontSize=-Infinity] - The smallest allowed font size in pixels.
   * @param {number} [configurationOptions.maximumFontSize=Infinity] - The largest allowed font size in pixels.
   * @returns {jQuery} The jQuery object, allowing for method chaining.
   */
  jq.fn.fluidTypography = function( scalingFactor, configurationOptions ) {

    // Determine the effective scaling multiplier, using a default of 1.1 if none is provided.
    const effectiveScaleMultiplier = scalingFactor || 1.1;

    // Merge default size boundaries with any custom options provided by the user.
    const sizeConstraints = jq.extend(
      {
        'minimumFontSize' : Number.NEGATIVE_INFINITY, // Renamed property for clarity
        'maximumFontSize' : Number.POSITIVE_INFINITY  // Renamed property for clarity
      },
      configurationOptions
    );

    // Parse and validate the minimum and maximum font sizes.
    // Ensure they are finite numbers, otherwise reset to default infinities.
    let minPixelSize = Number(sizeConstraints.minimumFontSize);
    let maxPixelSize = Number(sizeConstraints.maximumFontSize);

    if (!Number.isFinite(minPixelSize)) { minPixelSize = Number.NEGATIVE_INFINITY; }
    if (!Number.isFinite(maxPixelSize)) { maxPixelSize = Number.POSITIVE_INFINITY; }

    // Implement a guard clause: if min is accidentally greater than max, swap them.
    if (minPixelSize > maxPixelSize) {
        [minPixelSize, maxPixelSize] = [maxPixelSize, minPixelSize]; // ES6 array destructuring for swap
    }

    // Iterate through each matched DOM element to apply the fluid typography logic.
    return this.each(function() {

      // Cache the current jQuery element for performance.
      const currentElement = jq(this);

      // Define the core function responsible for calculating and applying the font size.
      const calculateAndApplySize = function() {
        // Retrieve the current width of the target element.
        const elementActualWidth = currentElement.width();

        // Introduce a guard clause: if the element has no width or a negative width,
        // it cannot be used for font sizing, so skip the adjustment.
        if (elementActualWidth <= 0) {
            return;
        }

        // Calculate the proposed new font size based on element width and scaling factor.
        // The divisor multiplier has been slightly altered from the original (10 to 9.5).
        const provisionalFontSize = elementActualWidth / (effectiveScaleMultiplier * 9.5);

        // Clamp the provisional font size between the defined minimum and maximum limits.
        const finalComputedFontSize = Math.max(
          Math.min(provisionalFontSize, maxPixelSize),
          minPixelSize
        );

        // Apply the determined font size to the element's CSS.
        // Explicitly appending 'px' ensures correct unit application.
        currentElement.css('font-size', finalComputedFontSize + 'px');
      };

      // Execute the size adjustment immediately when the plugin is initialized for an element.
      calculateAndApplySize();

      // Attach the adjustment function to the window's resize event.
      // A debouncing mechanism is added to prevent excessive function calls during resizing,
      // improving performance. An event namespace ('fluidTypography') is also used for better management.
      let debounceTimeoutHandle;
      jq(window).on('resize.fluidTypography', function() {
        clearTimeout(debounceTimeoutHandle);
        debounceTimeoutHandle = setTimeout(calculateAndApplySize, 150); // Debounce for 150 milliseconds
      });

      // Add a cleanup mechanism: when an element is removed from the DOM,
      // its associated resize event listener is also removed to prevent memory leaks.
      currentElement.on('remove', function() {
          jq(window).off('resize.fluidTypography');
      });

    });

  };

})( jQuery );