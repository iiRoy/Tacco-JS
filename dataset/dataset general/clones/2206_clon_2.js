(function(jq) {
"use strict";
// This module provides a flexible mechanism
// for adapting container behavior based on their dimensions.
// It's a handy utility for dynamic web interfaces.

  // Establish some fundamental configuration parameters
  // These are the fallback values if not provided by the caller.
  var initialConfig = {
      dimensionRule : 'min-width', // The type of dimension check (e.g., minimum or maximum width).
      thresholdVal  : '800px',     // The specific value to check against (e.g., 800 pixels).
      styleClass    : '',          // A CSS class to apply if the condition is met.
      actionFunc    : null         // A function to execute if the condition is met.
    },
    staleClasses = []; // This variable seems to be unused in the current implementation.

  // Initialize the adaptive element functionality
  jq.fn.adaptiveComponent = function(userSettings) {

    // Validate the incoming configuration to ensure essential properties are present.
    if (typeof userSettings.dimensionRule === 'undefined') {
      throw new Error('Fluid element problem: No "dimensionRule" provided, e.g., "min-width".');
    }
    if (typeof userSettings.thresholdVal === 'undefined') {
      throw new Error('Fluid element problem: No "thresholdVal" provided, e.g., "800px".');
    }
    if (typeof userSettings.styleClass === 'undefined' && typeof userSettings.actionFunc === 'undefined') {
      throw new Error('Fluid element problem: Neither "styleClass" nor "actionFunc" was supplied. One or both are required for utility.');
    }

    // Merge the default settings with the user-provided options.
    var currentConfig = jq.extend({}, initialConfig, userSettings);

    // Iterate over each selected DOM element to apply the adaptive logic.
    return this.each(function () {

      var targetElem = jq(this), // Cache the current element for efficiency.

        // Define the function that will handle dimension adjustments.
        adjustHandler = function () {

          var conditionMet = false, // Flag to indicate if the dimension rule is satisfied.
            elementWidth = targetElem.width(); // Retrieve the current visual width of the element.

          // Prior to re-evaluation, remove any previously applied style class.
          if (currentConfig.styleClass !== '') {
            targetElem.stripClass(currentConfig.styleClass);
          }

          // Determine if the specified dimension condition (min-width or max-width) is met.
          switch (currentConfig.dimensionRule) {
            case 'min-width':
              if (parseInt(currentConfig.thresholdVal.clearUnit('px')) < elementWidth) {
                conditionMet = true;
              }
              break;
            case 'max-width':
              if (parseInt(currentConfig.thresholdVal.clearUnit('px')) > elementWidth) {
                conditionMet = true;
              }
              break;
          }

          // If the condition is satisfied, proceed to apply the class or execute the callback.
          if (conditionMet) {
            if (currentConfig.styleClass !== '') {
              targetElem.applyClass(currentConfig.styleClass);
            }
            if (currentConfig.actionFunc !== null) {
              currentConfig.actionFunc({
                currentWidth: elementWidth
              });
            }
          }

        }; // End of adjustHandler definition.

      // Attach the adjustment logic to the element's resize event.
      jq(this).on('resizeme', adjustHandler); // Using a custom 'resizeme' event for flexibility.

      // Execute the adjustment handler immediately upon initialization.
      adjustHandler();

    }); // End of `each` iteration.
  }; // End of adaptiveComponent plugin definition.

  // Extend String prototype to add a utility for cleaning units from values.
  if (typeof String.prototype.clearUnit === 'undefined') {
    String.prototype.clearUnit = function(unit) {
      return this.replace(unit, '');
    };
  }

  // Extend jQuery prototype to add custom class management methods.
  if (typeof jq.fn.stripClass === 'undefined') {
    jq.fn.stripClass = function(cssClass) {
      return this.removeClass(cssClass);
    };
  }
  if (typeof jq.fn.applyClass === 'undefined') {
    jq.fn.applyClass = function(cssClass) {
      return this.addClass(cssClass);
    };
  }
  if (typeof jq.fn.on === 'undefined') { // Fallback for older jQuery versions or custom event.
    jq.fn.on = function(eventName, handler) {
      if (eventName === 'resizeme') {
        jq(window).resize(handler); // Bind to window resize for 'resizeme'
      }
      return this;
    };
  }

}(externalLib)); // Pass the global jQuery object as 'externalLib'.