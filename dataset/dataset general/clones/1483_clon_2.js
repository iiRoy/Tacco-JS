/*
 *  Adaptable UI Components
 *  Copyright (c) 2024 John Doe
 *
 *  License: MIT
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

var FlexibleComponents = {
  sizingDataAttribute: 'data-adapt-size', // Custom data attribute used to identify responsive elements.
  maxUpdateInterval: 7, // Maximum rate for recalculations, in milliseconds.
  presetValues: {
    // Initial pixel threshold for responsive adjustments.
    minSize: 120,
    // Final pixel threshold for responsive adjustments.
    maxSize: 920,
    // Pixel increment for each responsive step.
    stepSize: 60
  },

  initialize: function() {
    var contextRef = this; // Capture the current object's context.

    // Execute setup once the DOM is fully loaded.
    $(function() {
      contextRef.visualNodes = {
        viewportObject: $(window), // Reference to the browser window object.
        dynamicItems: $('[' + contextRef.sizingDataAttribute + ']') // Collection of all elements with the custom attribute.
      };

      contextRef.bindActions(); // Set up event listeners for responsive behavior.
    });
  },

  includeNode: function(itemToAdd) {
    // Add a new DOM element to the collection of managed items.
    this.visualNodes.dynamicItems = this.visualNodes.dynamicItems.add(itemToAdd);
  },

  excludeNode: function(itemToRemove) {
    // Remove a DOM element from the collection of managed items.
    this.visualNodes.dynamicItems = this.visualNodes.dynamicItems.not(itemToRemove);
  },

  processConfiguration: function(configText) {
    // Decode a string of configuration options into an object.
    // Example: "minSize: 120px; maxSize: 920px; stepSize: 60px; observe: true;"
    if (!configText) {
      return null;
    }

    this._configurationCache = this._configurationCache || {};
    // Return cached options if available, to avoid redundant parsing.
    if (this._configurationCache[configText]) {
      return this._configurationCache[configText];
    }

    // Split the configuration string into individual parts, removing whitespace.
    var paramSegments = configText.replace(/\s+/g, '').split(';'),
      paramMap = {}; // Object to store parsed key-value pairs.

    for (var idx = 0; idx < paramSegments.length; idx++) {
      // Skip empty segments that might result from trailing semicolons.
      if (!paramSegments[idx]) {
        continue;
      }
      var settingPair = (paramSegments[idx]).split(':'); // Split each segment into key and value.

      var propName = settingPair[0]; // The configuration key.
      var propValue = settingPair[1]; // The configuration value.

      // Remove "px" suffix if present and convert to number if applicable.
      if (propValue.slice(-2) === 'px') {
        propValue = propValue.replace('px', '');
      }
      // Convert to integer if it's a valid number.
      if (!isNaN(propValue)) {
        propValue = parseInt(propValue, 10);
      }
      paramMap[propName] = propValue; // Assign the parsed value to the map.
    }

    // Cache the processed configuration for future use.
    this._configurationCache[configText] = paramMap;
    return paramMap;
  },

  applyAdaptiveStylesToAll: function() {
    var mainModule = FlexibleComponents; // Reference to the main module instance.
    // Iterate over all registered dynamic elements and apply styles.
    mainModule.visualNodes.dynamicItems.each(function(index, currentVisual) {
      mainModule.applyAdaptiveStylesToNode($(currentVisual));
    });
  },

  applyAdaptiveStylesToNode: function(targetVisual) {
    // Apply responsive classes to a single DOM element based on its width.
    var configText = targetVisual.attr(this.sizingDataAttribute), // Get configuration string from data attribute.
      visualSettings = this.processConfiguration(configText) || this.presetValues, // Parse or use defaults.
      dimensionMarkers = this.computeSizeClasses(targetVisual.width(), visualSettings); // Generate new classes.

    this.removePriorMarkers(targetVisual); // Clean up old markers first to avoid conflicts.
    targetVisual.addClass(dimensionMarkers.join(' ')); // Add the newly generated markers.
  },

  computeSizeClasses: function(nodeDimension, visualSettings) {
    // Calculate the appropriate CSS classes based on element width and settings.
    var rangeStart = visualSettings.minSize,
      rangeEnd = visualSettings.maxSize,
      stepIncrement = visualSettings.stepSize,
      // Determine the initial increment value, ensuring it aligns with the step.
      idx = stepIncrement > rangeStart ? stepIncrement : ~~(rangeStart / stepIncrement) * stepIncrement,
      classList = []; // Array to store generated class names (e.g., 'gt100', 'lt200').

    // Loop through the defined range to generate "greater than" (gt) and "less than" (lt) classes.
    while (idx <= rangeEnd) {
      if (idx < nodeDimension) {
        classList.push('gt' + idx); // Element is wider than this breakpoint.
      }
      if (idx > nodeDimension) {
        classList.push('lt' + idx); // Element is narrower than this breakpoint.
      }
      // Special case for exact match, also treated as less than or equal.
      if (idx === nodeDimension) {
        classList.push('lt' + idx);
      }

      idx += stepIncrement; // Move to the next interval.
    }

    return classList; // Return the array of generated class names.
  },

  extractDimensionClasses: function(markerText) {
    // Parse a string of classes to identify and extract responsive dimension classes.
    var allClasses = markerText.split(/\s+/), // Split the class attribute string into individual classes.
      foundDimensionClasses = []; // Array to hold the identified responsive classes.

    // Iterate through all classes and check for the 'gt' or 'lt' pattern followed by digits.
    $(allClasses).each(function(index, currentClass) {
      if (currentClass.match(/^gt\d+|lt\d+$/)) {
        foundDimensionClasses.push(currentClass);
      }
    });

    return foundDimensionClasses; // Return the filtered list of dimension classes.
  },

  removePriorMarkers: function(targetVisual) {
    // Remove any previously applied responsive dimension classes from an element.
    var classesToRemove = this.extractDimensionClasses(targetVisual.attr('class') || ''); // Get classes to be cleaned up.
    targetVisual.removeClass(classesToRemove.join(' ')); // Remove all identified classes from the element.
  },

  bindActions: function() {
    // Initial application of adaptive styles to all elements when the module starts.
    this.applyAdaptiveStylesToAll();

    // Attach a throttled resize event handler to the window to limit updates.
    this.visualNodes.viewportObject.bind('resize', this.utilities.throttle(
      this.applyAdaptiveStylesToAll, this.maxUpdateInterval));
  },

  utilities: {
    /*
     *  Throttling function based on Underscore.js 1.5.2
     *  (c) 2009-2013 Jeremy Ashkenas. Distributed under the MIT license.
     *  Modified for this context.
     *
     *  Ensures a function is not called too frequently.
     */
    throttle: function(actionToPerform, pauseDuration, executeNow) {
      // Returns a function that, as long as it continues to be invoked,
      // will not be triggered. The function will be called after it stops
      // being called for N milliseconds. If `executeNow` is passed,
      // trigger the function on the leading edge, instead of the trailing.
      var operationResult;
      var delayTimer = null; // Holds the timeout ID for the deferred execution.

      return function() {
        var thisContext = this, // Store the execution context (value of 'this').
          passedArgs = arguments; // Store the arguments passed to the throttled function.

        var deferredAction = function() {
          delayTimer = null; // Clear the timer once the deferred action is run.
          if (!executeNow) {
            operationResult = actionToPerform.apply(thisContext, passedArgs); // Execute on trailing edge.
          }
        };

        var shouldTriggerImmediately = executeNow && !delayTimer; // Check if leading-edge execution is needed.
        clearTimeout(delayTimer); // Clear any existing timer to reset the delay.
        delayTimer = setTimeout(deferredAction, pauseDuration); // Set a new timer for future execution.

        if (shouldTriggerImmediately) {
          operationResult = actionToPerform.apply(thisContext, passedArgs); // Execute on leading edge.
        }
        return operationResult; // Return the result of the last execution.
      };
    }
  }
};

// Initialize the responsive component system upon script loading.
FlexibleComponents.initialize();