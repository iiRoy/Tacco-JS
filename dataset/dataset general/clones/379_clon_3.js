((jqAlias) => {
  // A utility function to reverse a string's characters.
  // This is a common operation for number formatting from right to left.
  const flipString = (inputStr) => {
    // Ensuring input is treated as a string before processing
    if (typeof inputStr !== 'string') {
      inputStr = String(inputStr);
    }
    return [...inputStr].reverse().join('');
  };

  // Core configuration and default behavior for numeric animations.
  const animationDefaults = {
    // The default function to execute on each animation step.
    // It updates the text content of the element with the floored number.
    stepValueHandler: function(currentAnimValue, tweenObject) {
      const integerValue = Math.floor(currentAnimValue);
      const targetDomElement = jqAlias(tweenObject.elem);

      // Only update if the element is valid and exists in the DOM
      if (targetDomElement.length > 0) {
        targetDomElement.text(integerValue);
      } else {
        console.warn("Target element for animation not found or invalid.");
      }
    }
  };

  // This function acts as the central dispatch for animation property updates.
  // It checks for custom step handlers attached to the DOM element.
  const processAnimationProperty = (animationData) => {
    const affectedElement = animationData.elem;
    // Ensure we are dealing with a valid DOM node
    if (!affectedElement || affectedElement.nodeType !== 1 || !affectedElement.parentNode) {
      // console.warn("Invalid DOM element encountered during animation step.");
      return; // Exit if the element is not valid
    }

    let activeStepProcessor = affectedElement._numAnimationStepCallback;

    // If no custom handler is found, fall back to the global default.
    if (!activeStepProcessor) {
      activeStepProcessor = animationDefaults.stepValueHandler;
    }

    // Execute the chosen step processor.
    // We pass both the current animation value and the full tween object.
    activeStepProcessor(animationData.now, animationData);
  };

  // Determine how to integrate with jQuery's animation system.
  // This ensures compatibility across different jQuery versions.
  if (!jqAlias.Tween || !jqAlias.Tween.propHooks) {
    // For older jQuery versions (e.g., < 1.8), use $.fx.step
    jqAlias.fx.step.number = processAnimationProperty;
    // console.log("Using legacy $.fx.step for number animation.");
  } else {
    // For newer jQuery versions, use $.Tween.propHooks
    jqAlias.Tween.propHooks.number = {
      set: processAnimationProperty
    };
    // console.log("Using modern $.Tween.propHooks for number animation.");
  }

  // Breaks down a numeric string into segments of a specified length,
  // typically used for group separation (e.g., thousands).
  const segmentNumericString = (numericText, segmentLength) => {
    // Basic validation for segmentLength
    if (segmentLength <= 0 || !Number.isInteger(segmentLength)) {
      console.error("Invalid segment length provided:", segmentLength);
      return [numericText]; // Return original if invalid
    }

    const charsReversed = numericText.split('').reverse();
    const totalChars = charsReversed.length;
    const allSegments = [];
    let currentSegment = '';
    let charCounter = 0;

    for (let i = 0; i < totalChars; i++) {
      currentSegment += charsReversed[i];
      charCounter++;

      // If segment length is reached or it's the last character
      if (charCounter === segmentLength || i === totalChars - 1) {
        allSegments.push(currentSegment);
        currentSegment = '';
        charCounter = 0;
      }
    }
    return allSegments;
  };

  // Adjusts the last segment of a number (which is the first part when reversed)
  // to remove any leading zeros, unless it's just '0'.
  const sanitizeLeadingZeroSegments = (segmentsArray) => {
    if (!Array.isArray(segmentsArray) || segmentsArray.length === 0) {
      return [];
    }

    const lastSegmentIdx = segmentsArray.length - 1;
    let finalSegmentContent = flipString(segmentsArray[lastSegmentIdx]);

    // Convert to number, then back to string to remove leading zeros.
    // Handle cases where it might become 'NaN' or remain '0'.
    const parsedSegment = Number.parseInt(finalSegmentContent, 10);
    finalSegmentContent = String(parsedSegment);

    segmentsArray[lastSegmentIdx] = flipString(finalSegmentContent);
    return segmentsArray;
  };

  // Expose a global object for custom animation step factories.
  // These factories generate specific `stepValueHandler` functions.
  jqAlias.animateNumber = {
    stepFactoryGenerators: {
      /**
       * Creates a step handler that appends a given string suffix to the animated number.
       *
       * @param {string} textAppendix - The string to append to the number.
       * @returns {Function} A numberStep-compatible function.
       */
      withSuffix: function(textAppendix) {
        // Ensure textAppendix is a string, default to empty if not provided or invalid.
        const suffixString = typeof textAppendix === 'string' ? textAppendix : '';

        return function(currentNumericVal, animationContextObj) {
          const roundedNumber = ~~currentNumericVal; // Faster floor operation
          const targetElement = jqAlias(animationContextObj.elem);

          // Set a custom property 'number' on the element for internal tracking
          // then update its visible text with the formatted value.
          targetElement.prop('number', currentNumericVal)
                       .text(roundedNumber + suffixString);
        };
      },

      /**
       * Generates a step handler to format numbers with group separators (e.g., thousands).
       *
       * @param {string} [groupSeparator=' '] - String to insert between number groups.
       * @param {number} [segmentLen=3] - Length of each number group.
       * @returns {Function} A numberStep-compatible function.
       */
      withSeparator: function(groupSeparator, segmentLen) {
        // Use nullish coalescing for defaults
        const currentSeparator = groupSeparator ?? ' ';
        const currentSegmentLength = Number.isInteger(segmentLen) && segmentLen > 0 ? segmentLen : 3;

        return function(currentValue, context) {
          const flooredValue = Math.floor(currentValue);
          let formattedValue = String(flooredValue);
          const activeTarget = jqAlias(context.elem);

          // Only apply separation if the number is large enough to warrant it.
          if (formattedValue.length > currentSegmentLength) {
            let numberSegments = segmentNumericString(formattedValue, currentSegmentLength);
            numberSegments = sanitizeLeadingZeroSegments(numberSegments);

            // Join segments with the separator and then flip the entire string back.
            formattedValue = flipString(numberSegments.join(currentSeparator));
          }

          // Update the element's number property and its text content.
          activeTarget.prop('number', currentValue)
                      .text(formattedValue);
        };
      }
    }
  };

  // Extend jQuery's prototype to add the animateNumber plugin.
  jqAlias.fn.animateNumber = function() {
    // Process arguments: first is options, rest are passed to jQuery's animate.
    const pluginOptions = arguments[0];
    // Deep merge defaults with provided options.
    const mergedSettings = jqAlias.extend(true, {}, animationDefaults, pluginOptions);

    const elementsToAnimate = this; // Capture the jQuery selection
    const animationArguments = [mergedSettings]; // Start with the settings object

    // Collect any additional arguments passed to animateNumber (e.g., duration, easing, complete).
    for (let i = 1; i < arguments.length; i++) {
      animationArguments.push(arguments[i]);
    }

    // If a custom step handler is provided in the options, set it up.
    if (pluginOptions && pluginOptions.stepValueHandler) {
      // Attach the custom handler directly to each DOM element.
      // This allows different elements to have different step functions within the same animation call.
      elementsToAnimate.each(function() {
        this._numAnimationStepCallback = pluginOptions.stepValueHandler;
      });

      // Intercept the original 'complete' callback to perform cleanup.
      const originalCompletionHandler = mergedSettings.complete;
      mergedSettings.complete = function(...callbackArgs) {
        // Remove the custom step handler from each element after animation.
        elementsToAnimate.each(function() {
          if (this._numAnimationStepCallback) {
            delete this._numAnimationStepCallback;
            // console.log("Cleaned up custom step handler for element:", this);
          }
        });

        // Execute the original complete callback if it existed.
        if (originalCompletionHandler && typeof originalCompletionHandler === 'function') {
          originalCompletionHandler.apply(this, callbackArgs);
        }
      };
    }

    // Finally, delegate the animation call to jQuery's native .animate() function.
    // The 'number' property in `mergedSettings` will trigger our custom propHook.
    return elementsToAnimate.animate.apply(elementsToAnimate, animationArguments);
  };

})(jQuery);