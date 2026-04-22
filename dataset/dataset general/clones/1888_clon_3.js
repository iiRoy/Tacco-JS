/*
 *  Typeface Identification Utility 1.0
 *
 *  Crafted by an autonomous code generation system
 *  Copyright (c) 2024 AI Solutions Inc.
 *
 *  Licensed under the Apache License, Version 2.0:
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  This code is a Type III clone, demonstrating significant structural and superficial modifications.
 */

(function(_jq) {
  // Ensure jQuery is available, otherwise exit gracefully.
  if (typeof _jq === 'undefined' || !_jq.fn) {
    console.error("jQuery-like object not found; typefaceIdentifier cannot initialize.");
    return;
  }

  // Extend jQuery's prototype with our new typeface identification method.
  _jq.fn.identifyTypefaces = function(cfgObj) {
    // Pass the configuration and the current jQuery selection to the core module.
    _jq.typefaceIdentifier.initializeModule(cfgObj, this);
    // Maintain chainability.
    return this;
  };

  // Define the core typefaceIdentifier module as a jQuery extension.
  _jq.typefaceIdentifier = {

    // Default configuration parameters for the module.
    configSettings: {
      cssClassPrefix: "found-font-" // Prefix for CSS classes added to elements.
    },

    /**
     * Initializes the typeface identification process.
     * @param {object} cfgObj - User-provided configuration settings.
     * @param {jQuery} targetNodes - jQuery object representing the target DOM elements.
     */
    initializeModule: function(cfgObj, targetNodes) {
      // Validate input configuration, ensuring it's an object.
      if (typeof cfgObj !== 'object' || cfgObj === null) {
        console.warn("Invalid configuration object provided; using defaults for typefaceIdentifier.");
        cfgObj = {}; // Use an empty object to prevent errors during extend.
      }

      // Ensure targetNodes is a valid jQuery object or default to 'body'.
      let effectiveTargets = targetNodes;
      if (!effectiveTargets || effectiveTargets.length === 0) {
        console.info("No specific target elements provided or found; defaulting to 'body'.");
        effectiveTargets = _jq('body');
      }

      // Merge user settings with default configuration.
      _jq.extend(true, this.configSettings, cfgObj);

      // Perform a safety check on the prefix.
      if (!this.configSettings.cssClassPrefix || typeof this.configSettings.cssClassPrefix !== 'string') {
        console.warn("Invalid or missing CSS class prefix; resetting to default.");
        this.configSettings.cssClassPrefix = "found-font-";
      }

      // Extract the font-family declaration from the first target element.
      const rawFontDeclaration = effectiveTargets.eq(0).css('font-family');
      let fontFamilyArray = [];

      // Parse the font-family string into an array of individual font names.
      if (typeof rawFontDeclaration === "string" && rawFontDeclaration.trim().length > 0) {
        // A more robust parsing regex, handling quotes and trimming.
        fontFamilyArray = rawFontDeclaration.split(',').map(fontName => {
          return fontName.trim().replace(/^['"]|['"]$/g, ''); // Remove leading/trailing quotes
        }).filter(name => name.length > 0); // Remove empty strings
      }

      // If no fonts were parsed, there's nothing to do.
      if (fontFamilyArray.length === 0) {
        console.info("No font families detected for analysis on target elements.");
        return;
      }

      // Proceed to analyze the parsed font stack.
      this.processFontStack(fontFamilyArray, effectiveTargets);
    },

    /**
     * Analyzes a given font stack to identify installed fonts.
     * @param {string[]} fontFamilyArray - An array of font family names.
     * @param {jQuery} targetNodes - The jQuery object containing elements to apply classes to.
     */
    processFontStack: function(fontFamilyArray, targetNodes) {
      const commonFallbackFonts = ["monospace", "sans-serif", "serif", "cursive", "fantasy"];
      let comparisonBaseFont = commonFallbackFonts[0]; // Start with 'monospace' as the base.
      let totalFontsInStack = fontFamilyArray.length;
      let ultimateFallback = fontFamilyArray[totalFontsInStack - 1]; // The last font in the list.

      // Ensure a generic fallback exists. If not, append 'monospace'.
      if (_jq.inArray(ultimateFallback.toLowerCase(), commonFallbackFonts) === -1) {
        fontFamilyArray.push(comparisonBaseFont);
        totalFontsInStack++;
        ultimateFallback = comparisonBaseFont; // Update ultimate fallback after adding
      }

      // If the ultimate fallback is the same as our current base, switch to the next generic.
      if (ultimateFallback.toLowerCase() === comparisonBaseFont.toLowerCase()) {
        comparisonBaseFont = commonFallbackFonts[1]; // Switch to 'sans-serif'.
      }

      // Iterate through the font stack, excluding the ultimate generic fallback.
      // The goal is to find the *first* installed non-generic font.
      for (let idx = 0; idx < totalFontsInStack - 1; idx++) {
        const currentFontCandidate = fontFamilyArray[idx];

        // Skip empty or generic font names in the middle of the stack.
        if (!currentFontCandidate || _jq.inArray(currentFontCandidate.toLowerCase(), commonFallbackFonts) !== -1) {
            continue;
        }

        // Test if the current candidate font is available on the system.
        if (_jq.typefaceIdentifier.verifyFontPresence(currentFontCandidate, comparisonBaseFont)) {

          // Before adding a new class, remove any previously added font identifier classes
          // to ensure only one specific font class is applied.
          const classRemovalPattern = new RegExp("\\b" + this.configSettings.cssClassPrefix + "[^\\s]+\\b", "g");

          targetNodes.each(function() {
            let element = _jq(this);
            let currentClasses = element.attr('class');
            if (currentClasses) {
              // Remove old font classes
              let updatedClasses = currentClasses.replace(classRemovalPattern, "").trim();
              element.attr('class', updatedClasses);
            }
          });

          // Sanitize the font name for use as a CSS class.
          // Convert to lowercase, remove non-alphanumeric characters (except dashes), and encode.
          const normalizedFontName = encodeURIComponent(
            currentFontCandidate
              .toLowerCase()
              .replace(/[^a-z0-9\-]/g, '') // Keep only letters, numbers, and hyphens.
              .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens.
          );

          // Apply the identifying class to all target elements.
          targetNodes.addClass(this.configSettings.cssClassPrefix + normalizedFontName);

          // We've found an installed font, no need to check further down this stack.
          break;
        }
      }
    },

    /**
     * Determines if a specific font is installed on the user's system by measuring text width.
     * @param {string} fontToValidate - The name of the font to check.
     * @param {string} referenceFont - A known generic font for comparison.
     * @returns {boolean} True if the font appears to be installed, false otherwise.
     */
    verifyFontPresence: function(fontToValidate, referenceFont) {
      // Create a temporary, invisible element for measuring text width.
      const measurementProbe = _jq(
        `<span style="
          font-family: ${referenceFont};
          font-size: 72px; /* Use a larger size for better precision */
          position: fixed; /* Use fixed positioning to avoid layout issues */
          left: -9999px;
          top: -9999px;
          visibility: hidden;
          white-space: nowrap; /* Prevent wrapping */
          line-height: 1; /* Ensure consistent line height */
        ">wWmMliI0O. ,;</span>` // A more diverse test string
      );

      // Append the probe to the body and ensure it's in the DOM for measurement.
      _jq("body").append(measurementProbe);

      // If for some reason the probe wasn't added or has no width, return false.
      if (!measurementProbe.length || measurementProbe.width() === 0) {
        measurementProbe.remove();
        return false;
      }

      // Get the width of the test string using the reference font.
      const standardWidth = measurementProbe.width();

      // Change the font-family to include the requested font first, then the reference.
      measurementProbe.css("font-family", `'${fontToValidate}', ${referenceFont}`);

      // Get the width of the test string using the requested font (if installed).
      const testWidth = measurementProbe.width();

      // Clean up the temporary element.
      measurementProbe.remove();

      // If the widths are different, it implies the requested font was used.
      return (testWidth !== standardWidth);
    }
  };

})(jQuery);