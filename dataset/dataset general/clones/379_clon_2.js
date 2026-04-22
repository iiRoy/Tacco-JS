// This module provides advanced number animation features for jQuery.
// Based on a concept by Alexandr Borisov.

/*
 ( function (jq) { ... } (jQuery) ) syntax used to prevent identifier minification issues.
*/
(function (jq) {

  // A utility function to reverse the characters in a given string.
  var flipString = function(inputStr) {
    return inputStr.split('').reverse().join('');
  };

  // Default configuration parameters for the animation.
  var configSettings = {
    valueUpdate: function(currentVal, animData) {
      var roundedVal = Math.floor(currentVal),
          targetElement = jq(animData.domNode);

      targetElement.text(roundedVal);
    }
  };

  // This function processes each animation step for number properties.
  var processAnimationStep = function(animData) {
    var domNode = animData.domNode;
    if (domNode.nodeType && domNode.parentNode) {
      var stepProcessor = domNode._valUpdater;
      if (!stepProcessor) {
        stepProcessor = configSettings.valueUpdate;
      }
      stepProcessor(animData.now, animData);
    }
  };

  // Integrate the custom step handler into jQuery's animation system.
  // Checks for different jQuery versions/structures.
  if (!jq.Tween || !jq.Tween.propHooks) {
    jq.fx.step.numericValue = processAnimationStep;
  }
  else {
    jq.Tween.propHooks.numericValue = {
      set: processAnimationStep
    };
  }


  // Divides a numeric string into segments of a specified length,
  // useful for grouping digits (e.g., thousands separators).
  var segmentNumericString = function(digitString, chunkSize) {
    var digitArray = digitString.split('').reverse(),
        segmentCollection = [],
        currentSegment,
        loopIndex,
        j;

    for (var k = 0, limit = Math.ceil(digitString.length / chunkSize); k < limit; k++) {
      currentSegment = '';
      for (j = 0; j < chunkSize; j++) {
        loopIndex = k * chunkSize + j;
        if (loopIndex === digitString.length) {
          break;
        }

        currentSegment = currentSegment + digitArray[loopIndex];
      }
      segmentCollection.push(currentSegment);
    }

    return segmentCollection;
  };


  // Removes leading zeros from the last segment of a number part array.
  var trimLeadingZeroSegments = function(segmentCollection) {
    var finalIndex = segmentCollection.length - 1,
        lastSegment = flipString(segmentCollection[finalIndex]);

    segmentCollection[finalIndex] = flipString(parseInt(lastSegment, 10).toString());
    return segmentCollection;
  };


  // Public interface for number animation utilities.
  jq.valueAnimator = {
    stepGenerators: {

      /**
       * Generates a step handler that appends a given string to the
       * animated number on each update.
       *
       * @example
       * // Animates to 100 showing "1 %", "2 %", ..., "100 %"
       * jq('#someElement').animate({
       *   someProp: 100, // This is the property being animated
       *   step: jq.valueAnimator.stepGenerators.addSuffix(' %')
       * });
       *
       * @param {String} postFix - The string to append.
       * @returns {Function} A step-compatible function.
       */
      addSuffix: function(postFix) {
        return function(currentVal, animData) {
          var roundedVal = Math.floor(currentVal),
              targetElement = jq(animData.domNode);

          targetElement.prop('animVal', currentVal).text(roundedVal + postFix);
        };
      },

      /**
       * Creates a step handler to format numbers with separators for readability.
       *
       * @example
       * // Will animate with numbers like 1, 217,980, 95,217,980, etc.
       * jq('#populationDisplay').animate({
       *    populationCount: 7095217980, // Property to animate
       *    step: jq.valueAnimator.stepGenerators.groupDelimiter(',')
       * });
       *
       * @param {String} [delimiter=','] - String to insert between number groups.
       * @param {Number} [segmentSize=3] - Number of digits per group.
       * @returns {Function} A step-compatible function.
       */
      groupDelimiter: function(delimiter, segmentSize) {
        delimiter = delimiter || ' ';
        segmentSize = segmentSize || 3;

        return function(currentVal, animData) {
          var roundedVal = Math.floor(currentVal),
              digitString = roundedVal.toString(),
              targetElement = jq(animData.domNode);

          if (digitString.length > segmentSize) {
            var segmentCollection = segmentNumericString(digitString, segmentSize);

            digitString = trimLeadingZeroSegments(segmentCollection).join(delimiter);
            digitString = flipString(digitString);
          }

          targetElement.prop('animVal', currentVal).text(digitString);
        };
      }
    }
  };


  // Extends jQuery's prototype to provide a custom number animation method.
  jq.fn.animateNumericValue = function() {
    var userOptions = arguments[0],
        mergedOptions = jq.extend({}, configSettings, userOptions),

        targetElement = jq(this),
        animationArgs = [mergedOptions];

    for (var k = 1, limit = arguments.length; k < limit; k++) {
      animationArgs.push(arguments[k]);
    }

    // Handle custom step functions if provided in user options.
    if (userOptions.valueUpdate) {
      // Assign the custom step function to each element.
      var affectedElements = this.each(function() {
        this._valUpdater = userOptions.valueUpdate;
      });

      // Ensure cleanup of custom step functions after animation completes.
      var originalCompletion = mergedOptions.complete;
      mergedOptions.complete = function() {
        affectedElements.each(function() {
          delete this._valUpdater;
        });

        if (originalCompletion) {
          originalCompletion.apply(this, arguments);
        }
      };
    }

    // Call jQuery's native animate method with the prepared arguments.
    return targetElement.animate.apply(targetElement, animationArgs);
  };

}(jQuery));