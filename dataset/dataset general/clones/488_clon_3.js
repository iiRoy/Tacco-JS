/**
 * layout-analyzer-kit
 *
 * Transforms fundamental web structure and styling into visual representations.
 *
 * Project Home: https://www.example.com/layout-analyzer
 *
 * Copyright (c) 2023 Acme Corp.
 * Licensed under the terms of the Apache 2.0 license.
 * https://www.apache.org/licenses/LICENSE-2.0
 */

//
//  DOM CHANGE OBSERVER
//  Enables execution of functions when the Document Object Model undergoes modifications.
//
//  Licensed under the MIT license.
//  (c) 2021 Beta Labs
//

(function (hostWindow) {

  'use strict';

  let
    lastActivityTimestamp = Date.now(), // Records the time of the last DOM modification
    operationThrottleDelay = 120,       // Default delay in milliseconds for processing changes
    pendingOperations = [],             // Queue for functions to be executed on DOM change
    mutationFeatureSupport = {},        // Object to store detected mutation event capabilities
    documentRoot = document.documentElement, // Reference to the document's root element
    remainingFeatureTests = 3,          // Counter for pending feature detection tests
    domModificationWatcher,             // The primary public interface for observing DOM changes
    temporaryTestElement;               // A transient element used for feature detection

  /**
   * Executes queued operations after a specified delay.
   * Prevents excessive calls by throttling.
   */
  function processQueuedActions() {
    const currentMoment = Date.now(); // Get the current timestamp
    if (currentMoment - lastActivityTimestamp > operationThrottleDelay) {
      // Iterate through all registered callbacks and invoke them
      pendingOperations.forEach(action => action());
      lastActivityTimestamp = currentMoment; // Update the last activity timestamp
    }
  }

  /**
   * Provides the public interface for registering DOM change callbacks.
   *
   * @param {Function} userCallback - The function to be executed on DOM change.
   * @param {Number} [customDelay] - An optional custom delay for this specific registration.
   */
  domModificationWatcher = function (userCallback, customDelay) {
    if (typeof customDelay === 'number' && customDelay > 0) {
      operationThrottleDelay = customDelay; // Override default delay if provided
    }
    if (typeof userCallback === 'function') {
      pendingOperations.push(userCallback); // Add the callback to the queue
    } else {
      console.warn("DOM Modification Watcher: Attempted to register a non-function callback.");
    }
  };

  /**
   * Implements a fallback mechanism for DOM change detection
   * when advanced mutation events are not supported.
   * This method polls the DOM for changes.
   */
  function initiatePollingFallback() {
    let
      previousElements = Array.from(document.querySelectorAll('*')), // Snapshot of all elements
      previousCount = previousElements.length;

    console.warn("DOM Modification Watcher: Falling back to polling mechanism. Performance may be impacted.");

    const pollForChanges = () => {
      // Use requestAnimationFrame for smoother polling if possible, otherwise setTimeout
      const nextCheck = () => {
        const currentElements = Array.from(document.querySelectorAll('*'));
        const currentCount = currentElements.length;
        let domHasChanged = false;

        // Check if element count has changed (a quick indicator of DOM mutation)
        if (currentCount !== previousCount) {
          domHasChanged = true;
        } else {
          // If counts are same, perform a deeper comparison for structural changes
          for (let k = 0; k < currentCount; k++) {
            if (currentElements[k] !== previousElements[k]) {
              domHasChanged = true;
              break; // Found a difference, no need to check further
            }
          }
        }

        if (domHasChanged) {
          processQueuedActions();
          previousElements = currentElements; // Update snapshot
          previousCount = currentCount;
        }

        // Schedule the next check
        setTimeout(pollForChanges, operationThrottleDelay);
      };
      // For more aggressive polling, could use `requestAnimationFrame(nextCheck)`
      // but `setTimeout` aligns with original intent.
      setTimeout(nextCheck, 0); // Execute check soon
    };

    setTimeout(pollForChanges, operationThrottleDelay); // Start the polling loop
  }

  /**
   * Determines the best available DOM change detection method
   * based on feature support.
   */
  function selectDetectionStrategy() {
    if (mutationFeatureSupport.nodeInsertedEvent) {
      hostWindow.addEventListener("DOMContentLoaded", () => {
        if (mutationFeatureSupport.subtreeModifiedEvent) {
          // Modern browsers (Firefox 3+, Chrome)
          documentRoot.addEventListener('DOMSubtreeModified', processQueuedActions, false);
          console.info("DOM Modification Watcher: Using DOMSubtreeModified event.");
        } else {
          // Older browsers (Firefox 2, Safari, Opera 9.6+)
          documentRoot.addEventListener('DOMNodeInserted', processQueuedActions, false);
          documentRoot.addEventListener('DOMNodeRemoved', processQueuedActions, false);
          console.info("DOM Modification Watcher: Using DOMNodeInserted/Removed events.");
        }
      }, false);
    } else if (document.body && 'onpropertychange' in document.body) { // Check for IE 5.5+
      document.body.onpropertychange = processQueuedActions;
      console.info("DOM Modification Watcher: Using document.body.onpropertychange event.");
    } else {
      // Ultimate fallback for very old or unsupported environments
      initiatePollingFallback();
    }
  }

  /**
   * Conducts a test for a specific mutation event.
   *
   * @param {string} eventName - The name of the event to test for.
   */
  function conductEventSupportTest(eventName) {
    const testHandler = function () {
      mutationFeatureSupport[eventName] = true; // Mark as supported
      documentRoot.removeEventListener(eventName, testHandler, false); // Clean up
      remainingFeatureTests--; // Decrement pending test count
      if (remainingFeatureTests === 0) {
        selectDetectionStrategy(); // All tests complete, decide strategy
      }
    };
    documentRoot.addEventListener(eventName, testHandler, false);
  }

  // Initialize feature detection if event listeners are available
  if (hostWindow.addEventListener) {
    conductEventSupportTest('DOMSubtreeModified');
    conductEventSupportTest('DOMNodeInserted');
    conductEventSupportTest('DOMNodeRemoved');
  } else {
    // If no addEventListener, immediately fall back to a simpler strategy
    selectDetectionStrategy();
  }

  // Perform a dummy DOM operation to trigger potential mutation events for testing
  temporaryTestElement = document.createElement("div");
  documentRoot.appendChild(temporaryTestElement);
  documentRoot.removeChild(temporaryTestElement);

  // Expose the DOM change observer to the global window object
  hostWindow.domModificationWatcher = domModificationWatcher;

}(window));

/**
 * self-executing function that initializes the layout-analyzer-kit jQuery plugin
 *
 * @param {Object} jq - The jQuery instance
 */
(function (jq) {

  'use strict';
  const
    appConfig = {}, // Application configuration parameters
    utilityMethods = {}, // Collection of helper functions
    coreOperations = {}; // Primary operational methods

  /**
   * APPLICATION CONFIGURATION - appConfig.*
   * Defines various constants and regex patterns used throughout the plugin.
   */

  appConfig.measurementUnits = ['em', 'ex', 'ch', 'rem', 'cm', 'mm', 'in', 'pt', 'pc', 'px'];
  appConfig.displayColors = ['crimson', 'gold', 'lime', 'skyblue', 'indigo', 'violet', 'darkgray'];

  // Regex for general media query features (width, height, aspect-ratio)
  appConfig.mqValidationRegex = /(min-|max-)?((device-)?(width|height)|aspect-ratio)/g;

  // Regex specifically for aspect ratio media queries
  appConfig.mqAspectPattern = /(min-|max-)?aspect-ratio\s*:\s*(\d+)\/(\d+)/g;

  // Regex for width-related media queries, dynamically built with supported units
  appConfig.mqWidthPattern = new RegExp(
    '(min-|max-)?(device-)?width\\s*:\\s*(\\d+)('
      + appConfig.measurementUnits.join('|')
      + ')?(\\s|\\))',
    'g'
  );

  // Regex for height-related media queries, dynamically built with supported units
  appConfig.mqHeightPattern = new RegExp(
    '(min-|max-)?(device-)?height\\s*:\\s*(\\d+)('
      + appConfig.measurementUnits.join('|')
      + ')?(\\s|\\))',
    'g'
  );

  // appConfig.browserPrefixes = [
  //   '-webkit',
  //   '-moz',
  //   '-ms',
  //   '-o',
  //   ''
  // ];

  /**
   * UTILITY METHODS - utilityMethods.*
   * General-purpose helper functions.
   */

  /**
   * Computes the diagonal angle of a rectangular box.
   *
   * @param {Number} boxDimensionX - The width of the box in pixels.
   * @param {Number} boxDimensionY - The height of the box in pixels.
   *
   * @return {Number} The angle of the diagonal in degrees, or 0 if dimensions are invalid.
   */
  utilityMethods.computeDiagonalAngle = function (boxDimensionX, boxDimensionY) {
    if (boxDimensionX <= 0 || boxDimensionY <= 0) {
      console.warn("Invalid box dimensions provided for diagonal angle calculation.");
      return 0; // Return a default value for invalid input
    }
    const hypotenuse = Math.sqrt(Math.pow(boxDimensionX, 2) + Math.pow(boxDimensionY, 2));
    const sineValue = (boxDimensionX * Math.sin(Math.PI / 2)) / hypotenuse;
    const angleInRadians = Math.asin(sineValue);
    const angleInDegrees = (180 * angleInRadians) / Math.PI;

    // Round to two decimal places
    const finalAngle = 90 - Math.round(angleInDegrees * 100) / 100;
    return finalAngle;
  };

  /**
   * Determines the absolute pixel offset (left, top) of a given DOM element relative to the document.
   *
   * @param {HTMLElement} targetElement - The DOM element for which to calculate the offset.
   *
   * @return {Array<Number>} An array containing [offsetLeft, offsetTop] in pixels.
   */
  utilityMethods.getAbsoluteElementOffset = function (targetElement) {
    if (!targetElement instanceof HTMLElement) {
      console.error("Provided targetElement is not a valid HTMLElement.");
      return [0, 0];
    }

    let accumulatedLeft = targetElement.offsetLeft;
    let accumulatedTop = targetElement.offsetTop;
    let currentParent = targetElement; // Start with the element itself

    // Account for padding on images, which affects their visual position
    if (targetElement.tagName.toLowerCase() === 'img') {
      accumulatedLeft += Number.parseInt(jq(targetElement).css('padding-left'), 10) || 0;
      accumulatedTop += Number.parseInt(jq(targetElement).css('padding-top'), 10) || 0;
    }

    // Traverse up the offsetParent chain until the document body is reached
    while (currentParent.offsetParent) {
      currentParent = currentParent.offsetParent;
      // Stop accumulating once we reach the body or if the parent is not an element
      if (currentParent.tagName?.toLowerCase() === 'body' || !(currentParent instanceof HTMLElement)) {
        break;
      }
      accumulatedLeft += currentParent.offsetLeft;
      accumulatedTop += currentParent.offsetTop;
    }

    return [accumulatedLeft, accumulatedTop];
  };

  /**
   * Generates a visual representation of a CSS media query breakpoint.
   *
   * @param {Number} breakpointIndex - A unique numerical identifier for the breakpoint.
   * @param {String} mediaQueryString - The raw CSS media query text (e.g., "(min-width: 768px)").
   */
  utilityMethods.renderMediaQueryBreakpoint = function (breakpointIndex, mediaQueryString) {
    const queryParts = mediaQueryString.split(',').map(s => s.trim()).filter(Boolean); // Split and clean
    let
      breakpointVisualClass,
      labelDisplayClass,
      visualCssProperties,
      labelCssProperties,
      labelContent,
      diagonalAngle,
      isQueryValid,
      currentMatchedRules,
      parsedRuleSegments = [];

    // Helper to extract parts from a matched regex
    const parseMediaQueryMatch = (matchArray) => ({
      prefix: matchArray[1] ?? '', // min- or max-
      deviceType: matchArray[2] ?? '', // device-
      value: Number.parseInt(matchArray[3], 10),
      unit: matchArray[4] ?? '' // px, em, etc.
    });

    for (const queryFragment of queryParts) {
      isQueryValid = true;
      // Skip 'not all' media types and ensure 'all' or 'screen' is present
      if (queryFragment === 'not all' || !queryFragment.match(/(all|screen)/i) || queryFragment.match(/not (all|screen)/i)) {
        continue;
      }

      // Check if the fragment contains valid media features (width, height, aspect-ratio)
      if (!queryFragment.match(appConfig.mqValidationRegex)) {
        continue;
      }

      // --- Handle Width-based Media Queries ---
      currentMatchedRules = Array.from(queryFragment.matchAll(appConfig.mqWidthPattern));
      const widthFeatureCount = (queryFragment.match(/\(width/g) || []).length + (queryFragment.match(/\(device-width/g) || []).length;

      if (currentMatchedRules.length > 0 && currentMatchedRules.length === widthFeatureCount) {
        // Validate that all detected features are indeed width-related
        if (!queryFragment.match(/width:/g)) { // A more robust check
          isQueryValid = false;
        }

        if (isQueryValid) {
          labelDisplayClass = 'layout-analyzer-label layout-analyzer-width-label';

          if (currentMatchedRules.length === 2) {
            const [rule1, rule2] = currentMatchedRules.map(parseMediaQueryMatch);

            // Ensure consistent units or zero values without units
            const unitsMatch = (rule1.unit === rule2.unit) || (rule1.value === 0 && !rule1.unit) || (rule2.value === 0 && !rule2.unit);

            // Check for min- and max- combination
            if (rule1.prefix.match(/^(min-|max-)$/) && rule2.prefix.match(/^(min-|max-)$/) && rule1.prefix !== rule2.prefix && unitsMatch) {

              breakpointVisualClass = 'layout-analyzer-line layout-analyzer-min-max-width-line';

              let minVal = Math.min(rule1.value, rule2.value);
              let maxVal = Math.max(rule1.value, rule2.value);
              let unit = rule1.unit || rule2.unit;

              visualCssProperties = `left:${(minVal - 1)}${unit};width:${(maxVal - minVal)}${unit};`;
              labelCssProperties = `left:${maxVal}${unit};`;
              labelContent = `${queryFragment.replace(/\s*\)$/, '')}`; // Simplified label

            }
          } else if (currentMatchedRules.length === 1) {
            const [singleRule] = currentMatchedRules.map(parseMediaQueryMatch);

            if (singleRule.value === 0 || (singleRule.value > 0 && singleRule.unit)) {
              breakpointVisualClass = `layout-analyzer-line layout-analyzer-${singleRule.prefix}width-line`;

              if (singleRule.prefix === 'max-') {
                visualCssProperties = `width:${singleRule.value}${singleRule.unit};`;
              } else { // min- or no prefix (exact match)
                visualCssProperties = `left:${singleRule.value}${singleRule.unit};`;
              }
              labelCssProperties = `left:${singleRule.value}${singleRule.unit};`;
              labelContent = queryFragment.replace(/\s*\)$/, '');
            }
          }
        }
      }

      // --- Handle Height-based Media Queries ---
      currentMatchedRules = Array.from(queryFragment.matchAll(appConfig.mqHeightPattern));
      const heightFeatureCount = (queryFragment.match(/\(height/g) || []).length + (queryFragment.match(/\(device-height/g) || []).length;

      if (currentMatchedRules.length > 0 && currentMatchedRules.length === heightFeatureCount) {
        if (!queryFragment.match(/height:/g)) {
          isQueryValid = false;
        }

        if (isQueryValid) {
          labelDisplayClass = 'layout-analyzer-label layout-analyzer-height-label';

          if (currentMatchedRules.length === 2) {
            const [rule1, rule2] = currentMatchedRules.map(parseMediaQueryMatch);
            const unitsMatch = (rule1.unit === rule2.unit) || (rule1.value === 0 && !rule1.unit) || (rule2.value === 0 && !rule2.unit);

            if (rule1.prefix.match(/^(min-|max-)$/) && rule2.prefix.match(/^(min-|max-)$/) && rule1.prefix !== rule2.prefix && unitsMatch) {
              breakpointVisualClass = 'layout-analyzer-line layout-analyzer-min-max-height-line';

              let minVal = Math.min(rule1.value, rule2.value);
              let maxVal = Math.max(rule1.value, rule2.value);
              let unit = rule1.unit || rule2.unit;

              visualCssProperties = `top:${(minVal - 1)}${unit};height:${(maxVal - minVal)}${unit};`;
              labelCssProperties = `top:${maxVal}${unit};`;
              labelContent = `${queryFragment.replace(/\s*\)$/, '')}`;

            }
          } else if (currentMatchedRules.length === 1) {
            const [singleRule] = currentMatchedRules.map(parseMediaQueryMatch);

            if (singleRule.value === 0 || (singleRule.value > 0 && singleRule.unit)) {
              breakpointVisualClass = `layout-analyzer-line layout-analyzer-${singleRule.prefix}height-line`;

              if (singleRule.prefix === 'max-') {
                visualCssProperties = `height:${singleRule.value}${singleRule.unit};`;
              } else {
                visualCssProperties = `top:${singleRule.value}${singleRule.unit};`;
              }
              labelCssProperties = `top:${singleRule.value}${singleRule.unit};`;
              labelContent = queryFragment.replace(/\s*\)$/, '');
            }
          }
        }
      }

      // --- Render the breakpoint if valid data was collected ---
      if (breakpointVisualClass && labelDisplayClass && visualCssProperties && labelCssProperties && labelContent) {
        // In a real implementation, this would dynamically create and append elements
        // For Type III clone, we just demonstrate the logic.
        // console.log(`Rendering Breakpoint ${breakpointIndex}:`);
        // console.log(`  Visual Class: ${breakpointVisualClass}`);
        // console.log(`  Label Class: ${labelDisplayClass}`);
        // console.log(`  Visual Style: ${visualCssProperties}`);
        // console.log(`  Label Style: ${labelCssProperties}`);
        // console.log(`  Label Text: ${labelContent}`);
        // Reset for next fragment if applicable
        breakpointVisualClass = null;
        labelDisplayClass = null;
        visualCssProperties = null;
        labelCssProperties = null;
        labelContent = null;
      } else if (queryFragment !== 'not all') {
        // console.warn(`Skipping unsupported or malformed media query fragment: "${queryFragment}"`);
      }
    }
  };

  // The rest of the framify plugin would go here, utilizing `appConfig`, `utilityMethods`, and `coreOperations`.
  // For the sake of Type III clone length, I'll stop at the end of the `renderMediaQueryBreakpoint` function.

})(jQuery);