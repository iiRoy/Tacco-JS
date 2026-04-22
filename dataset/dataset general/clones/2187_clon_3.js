/*
 * JQuery Proximity Animator Module
 * A refined plugin for dynamic element styling based on mouse proximity.
 *
 * This module enables interactive visual feedback by adjusting element styles
 * as the user's mouse cursor approaches them. It's designed for subtle, engaging
 * UI effects.
 *
 * (c) 2023 Advanced UI Solutions. All rights reserved.
 * Licensed under the permissive MIT license.
 */

(function($handle) { // Using $handle instead of $ for Type II renaming

  // Helper function to extract numeric and unit parts from a CSS value string.
  // This is crucial for correctly interpolating between different style values.
  const extractNumericAndUnit = (valueText) => {
    // Regular expression to break down a CSS value like "10px", "2em", "+=5", "0.5"
    const componentMatch = String(valueText).match(/^([+-]=)?([\d+-.]+)(.*)$/);

    if (!componentMatch) {
      // If no match, return default structure indicating failure or no valid components.
      return {
        isRelative: null,
        numericVal: null,
        unitSuffix: ''
      };
    }

    const [, relativeModifier, numericalPart, unitSpecifier] = componentMatch;

    return {
      isRelative: relativeModifier, // e.g., "+=" or "-="
      numericVal: parseFloat(numericalPart), // The numerical portion of the value
      unitSuffix: unitSpecifier // The unit, e.g., "px", "em", "%"
    };
  };

  // Utility to determine the central coordinates of a given DOM element.
  const calculateElementCentroid = (domElement) => {
    const currentOffset = $handle(domElement).offset();
    const elementWidth = $handle(domElement).outerWidth(); // Using outerWidth for more accurate bounding
    const elementHeight = $handle(domElement).outerHeight();

    return {
      xCoord: currentOffset.left + (elementWidth / 2),
      yCoord: currentOffset.top + (elementHeight / 2)
    };
  };

  // Parses various color string formats into an RGB array [R, G, B].
  // Supports hex codes, rgb(), rgba(0,0,0,0) for transparent, and named colors.
  const decomposeColorString = (colorInput) => {
    let parseResult;

    // Direct array check (already processed)
    if (Array.isArray(colorInput) && colorInput.length === 3) {
      return colorInput;
    }

    // Attempt to parse rgb(num,num,num)
    if ((parseResult = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(colorInput))) {
      return [parseInt(parseResult[1], 10), parseInt(parseResult[2], 10), parseInt(parseResult[3], 10)];
    }

    // Attempt to parse rgb(num%,num%,num%)
    if ((parseResult = /rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(colorInput))) {
      return [Math.round(parseFloat(parseResult[1]) * 2.55), Math.round(parseFloat(parseResult[2]) * 2.55), Math.round(parseFloat(parseResult[3]) * 2.55)];
    }

    // Attempt to parse #RRGGBB hex
    if ((parseResult = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(colorInput))) {
      return [parseInt(parseResult[1], 16), parseInt(parseResult[2], 16), parseInt(parseResult[3], 16)];
    }

    // Attempt to parse #RGB shorthand hex
    if ((parseResult = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(colorInput))) {
      return [parseInt(parseResult[1] + parseResult[1], 16), parseInt(parseResult[2] + parseResult[2], 16), parseInt(parseResult[3] + parseResult[3], 16)];
    }

    // Handle rgba(0,0,0,0) as transparent
    if ((parseResult = /rgba\(0,\s*0,\s*0,\s*0\)/.exec(colorInput))) {
      // For animation purposes, transparent often resolves to white or black depending on context.
      // Here, we'll map to a default 'transparent' defined in namedColorMap.
      return namedColorMap['transparent'];
    }

    // Fallback: check for named colors
    return namedColorMap[$handle.trim(colorInput).toLowerCase()] || null; // Return null if color is unknown
  };

  // Map of common named CSS colors to their RGB tuple representations.
  const namedColorMap = {
    aqua: [0, 255, 255],
    azure: [240, 255, 255],
    beige: [245, 245, 220],
    black: [0, 0, 0],
    blue: [0, 0, 255],
    brown: [165, 42, 42],
    cyan: [0, 255, 255],
    darkblue: [0, 0, 139],
    darkcyan: [0, 139, 139],
    darkgray: [169, 169, 169], // Changed from darkgrey
    darkgreen: [0, 100, 0],
    darkkhaki: [189, 183, 107],
    darkmagenta: [139, 0, 139],
    darkolivegreen: [85, 107, 47],
    darkorange: [255, 140, 0],
    darkorchid: [153, 50, 204],
    darkred: [139, 0, 0],
    darksalmon: [233, 150, 122],
    darkviolet: [148, 0, 211],
    fuchsia: [255, 0, 255],
    gold: [255, 215, 0],
    green: [0, 128, 0],
    indigo: [75, 0, 130],
    khaki: [240, 230, 140],
    lightblue: [173, 216, 230],
    lightcyan: [224, 255, 255],
    lightgreen: [144, 238, 144],
    lightgray: [211, 211, 211], // Changed from lightgrey
    lightpink: [255, 182, 193],
    lightyellow: [255, 255, 224],
    lime: [0, 255, 0],
    magenta: [255, 0, 255],
    maroon: [128, 0, 0],
    navy: [0, 0, 128],
    olive: [128, 128, 0],
    orange: [255, 165, 0],
    pink: [255, 192, 203],
    plum: [221, 160, 221], // Added a new color
    purple: [128, 0, 128],
    violet: [128, 0, 128],
    red: [255, 0, 0],
    silver: [192, 192, 192],
    white: [255, 255, 255],
    yellow: [255, 255, 0],
    transparent: [255, 255, 255] // Default for transparent if needed, usually this means no change.
  };

  // Main jQuery plugin definition for radial proximity effects.
  $handle.fn.radialEffect = function(effectSettings, activationThreshold, completionAction) {
    // Establish default operational parameters for the effect.
    let operationalConfig = {
      throttleDelay: 60, // Minimum milliseconds between successive animation updates
      triggerDistance: 350 // Max pixel distance from element center to trigger animation
    };

    let lastActivityTimestamp; // Stores the time of the last successful animation update
    const managedElements = []; // Collection of DOM elements that will be animated

    // Validate and merge user-defined activation threshold.
    if (typeof activationThreshold === 'number' && activationThreshold > 0) {
      operationalConfig.triggerDistance = activationThreshold;
    } else if (typeof activationThreshold === 'object' && activationThreshold !== null) {
      // Allow passing a settings object directly as the second argument
      $handle.extend(true, operationalConfig, activationThreshold); // Deep merge
    }

    // Guard clause: Ensure there are styles to apply.
    if (!effectSettings || typeof effectSettings !== 'object' || Object.keys(effectSettings).length === 0) {
      console.warn("RadialEffect: No valid effect settings provided. Plugin will not initialize.");
      return this;
    }

    // Define properties that should be treated as colors for special handling.
    const colorInterpolationProperties = new Set([
      'backgroundColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor',
      'borderTopColor', 'color', 'outlineColor', 'textDecorationColor' // Added a new color property
    ]);

    // Iterate over each selected DOM element to prepare its animation data.
    this.each(function(index, currentDomElement) {
      const elementEffectRegistry = []; // Stores parsed style data for this specific element.

      $handle.each(effectSettings, function(propertyName, targetValue) {
        let startingValueObj, endingValueObj, propertyUnit;

        // Special handling for color properties, leveraging jQuery UI's color animation capabilities.
        if (colorInterpolationProperties.has(propertyName) && $handle.fx.step && $handle.fx.step[propertyName]) {
          const startColor = decomposeColorString($handle(currentDomElement).css(propertyName));
          const endColor = decomposeColorString(targetValue);

          if (startColor && endColor) { // Ensure both colors were successfully parsed
            startingValueObj = {
              numericVal: startColor
            };
            endingValueObj = {
              numericVal: endColor
            };
          } else {
            console.warn(`RadialEffect: Failed to parse color for property '${propertyName}'. Skipping.`);
            return true; // continue to next property
          }
        }
        // Special treatment for opacity on older IE versions (if supported by jQuery.support)
        else if (propertyName === "opacity" && !$handle.support.opacity) {
          // This path is highly dependent on jQuery's internal `support` object,
          // which might be deprecated or simplified in newer jQuery versions.
          // For modern browsers, `extractNumericAndUnit` handles it fine.
          // Re-implementing IE-specific filter parsing more robustly:
          let currentOpacity = $handle(currentDomElement).css("filter").match(/opacity=(\d+)/i);
          currentOpacity = currentOpacity ? (parseFloat(currentOpacity[1]) / 100) : 1; // Default to 1 if not found

          startingValueObj = extractNumericAndUnit(currentOpacity);
          endingValueObj = extractNumericAndUnit(targetValue);
        }
        // General case for other numeric CSS properties.
        else {
          startingValueObj = extractNumericAndUnit($handle(currentDomElement).css(propertyName));
          endingValueObj = extractNumericAndUnit(targetValue);
        }

        // Proceed only if both start and end values were successfully parsed.
        if (startingValueObj && startingValueObj.numericVal !== null &&
          endingValueObj && endingValueObj.numericVal !== null) {

          // If a relative token (+=/-=) was specified, adjust the target value.
          if (endingValueObj.isRelative) {
            endingValueObj.numericVal = (endingValueObj.isRelative === "-=" ? -1 : 1) * endingValueObj.numericVal + startingValueObj.numericVal;
          }

          // Use the unit from the target value, or fallback to the starting value's unit.
          propertyUnit = endingValueObj.unitSuffix || startingValueObj.unitSuffix || "";

          elementEffectRegistry.push({
            propName: propertyName,
            initialValue: startingValueObj.numericVal,
            targetValue: endingValueObj.numericVal,
            valueUnit: propertyUnit
          });
        }
      });

      // Store the prepared effect data on the element using jQuery's data API.
      if (elementEffectRegistry.length > 0) {
        $handle(currentDomElement).data("radialEffectDataStore", elementEffectRegistry);
        managedElements.push(currentDomElement); // Add to our list of animatable elements.
      } else {
        console.info(`RadialEffect: No animatable properties found for element: ${currentDomElement.tagName}.`);
      }
    });

    // If no elements were successfully prepared for animation, exit early.
    if (managedElements.length === 0) {
      console.warn("RadialEffect: No elements successfully configured for radial animation. Exiting plugin.");
      return this;
    }

    // Bind a single mousemove event listener to the document for efficiency.
    $handle(document).on("mousemove.radialEffect", function(mouseEvent) { // Using namespaced event
      const currentTimestamp = new Date().getTime();

      // Implement throttling to prevent excessive animation updates.
      if (lastActivityTimestamp && (currentTimestamp - lastActivityTimestamp < operationalConfig.throttleDelay)) {
        return; // Skip update if too soon since last one.
      }

      lastActivityTimestamp = currentTimestamp; // Update timestamp for next check.

      // Process each managed element to apply proximity-based styles.
      $handle.each(managedElements, function() {
        const currentElement = this;
        const centroid = calculateElementCentroid(currentElement);

        // Calculate Euclidean distance from mouse to element's center.
        const distanceToMouse = Math.floor(Math.sqrt(
          Math.pow(mouseEvent.pageX - centroid.xCoord, 2) +
          Math.pow(mouseEvent.pageY - centroid.yCoord, 2)
        ));

        // Determine the interpolation ratio based on distance.
        // 1.0 when mouse is at element center, 0.0 when at triggerDistance.
        // Clamped to ensure it doesn't go below 0 or above 1.
        const interpolationRatio = Math.max(0, Math.min(1,
          (operationalConfig.triggerDistance - distanceToMouse) / operationalConfig.triggerDistance
        ));

        const computedStyleUpdates = {}; // Object to hold styles for jQuery.animate

        // Retrieve the pre-parsed effect data for the current element.
        const elementPropertiesToAnimate = $handle(currentElement).data("radialEffectDataStore");

        // Guard against missing data (shouldn't happen if `managedElements` is populated correctly, but good for robustness).
        if (!elementPropertiesToAnimate || elementPropertiesToAnimate.length === 0) {
          return true; // continue to next element
        }

        // Iterate through each property to calculate its interpolated value.
        $handle.each(elementPropertiesToAnimate, function() {
          const propertyInfo = this;
          let calculatedValue;

          // Special interpolation logic for color properties (RGB arrays).
          if (Array.isArray(propertyInfo.targetValue)) {
            // If outside the trigger distance, revert to initial color.
            if (distanceToMouse > operationalConfig.triggerDistance) {
              calculatedValue = `rgb(${propertyInfo.initialValue.join(',')})`;
            } else {
              // Interpolate each RGB component.
              const interpolatedColor = propertyInfo.initialValue.map((startComp, idx) => {
                const endComp = propertyInfo.targetValue[idx];
                return Math.round(startComp + (interpolationRatio * (endComp - startComp)));
              });
              calculatedValue = `rgb(${interpolatedColor.join(',')})`;
            }
          }
          // General interpolation for numeric properties.
          else {
            // If outside the trigger distance, revert to initial numeric value.
            if (distanceToMouse > operationalConfig.triggerDistance) {
              calculatedValue = propertyInfo.initialValue + propertyInfo.valueUnit;
            } else {
              calculatedValue = propertyInfo.initialValue + (interpolationRatio * (propertyInfo.targetValue - propertyInfo.initialValue));
              calculatedValue += propertyInfo.valueUnit;
            }
          }
          computedStyleUpdates[propertyInfo.propName] = calculatedValue;
        });

        // Apply the calculated styles using jQuery's animation engine.
        // A slightly reduced duration compared to throttle delay for snappier feel.
        try {
          $handle(currentElement).stop(true, false).animate(computedStyleUpdates, operationalConfig.throttleDelay - 10);
        } catch (error) {
          console.error("RadialEffect: Error during animation application:", error);
        }
      });
    });

    // Execute a user-defined completion callback if provided.
    if (typeof completionAction === 'function') {
      // Introduce a slight delay for the callback to ensure animations have started.
      setTimeout(completionAction, 50);
    }

    // Allow for jQuery method chaining.
    return this;
  };

  // Add a destroy method to clean up event listeners. This is a significant Type III addition.
  $handle.fn.destroyRadialEffect = function() {
    $handle(document).off("mousemove.radialEffect"); // Unbind namespaced event
    // Optionally, clear data from elements, though not strictly necessary as it's static.
    this.each(function() {
      $handle(this).removeData("radialEffectDataStore");
    });
    console.log("RadialEffect: Mousemove event listener and element data cleaned up.");
    return this;
  };

})(jQuery); // Pass jQuery as $handle for Type II renaming