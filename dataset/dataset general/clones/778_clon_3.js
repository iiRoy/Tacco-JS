(function(util) {
  // Utility methods for form data manipulation
  const formAssistant = {
    /**
     * Updates the value of a form control element.
     * Handles different input types (radio, checkbox, text) and override logic.
     * @param {jQuery} targetElement - The jQuery object representing the form control(s).
     * @param {string|string[]} incomingValue - The value(s) to set.
     * @param {boolean} forceUpdate - If true, overwrite existing values; otherwise, only set if empty.
     */
    _applyControlValue: function(targetElement, incomingValue, forceUpdate) {
      if (targetElement.length === 0) {
        // No element found, nothing to do here.
        return;
      }

      if (targetElement.is(':radio')) {
        // Handle radio buttons: iterate through all radios with the same name.
        targetElement.each(function() {
          const currentRadio = util(this);
          const isMatch = (Array.isArray(incomingValue) && incomingValue.includes(currentRadio.val())) ||
                          (currentRadio.val() == incomingValue); // Use == for type coercion as per original
          currentRadio.prop('checked', isMatch);
        });
      } else if (targetElement.is(':checkbox')) {
        // Handle checkboxes: set checked state based on value.
        // Original code sets prop('checked', true) if found, then relies on initial uncheck.
        // Let's make it more explicit for multi-value checkboxes.
        if (Array.isArray(incomingValue)) {
            targetElement.each(function() {
                util(this).prop('checked', incomingValue.includes(util(this).val()));
            });
        } else {
            // Assume single checkbox, or checkbox is found for its value
            targetElement.prop('checked', true);
        }
      } else {
        // For other input types (text, select, textarea)
        if (forceUpdate) {
          targetElement.val(incomingValue);
        } else {
          // Only update if the element currently has no value
          if (!targetElement.val()) {
            targetElement.val(incomingValue);
          }
        }
      }
    },

    /**
     * Appends a value to an object's property, creating an array if necessary.
     * @param {object} accumulatorMap - The object to modify.
     * @param {string} attributeName - The name of the property.
     * @param {string} attributeValue - The value to append.
     */
    _collectAttributeValue: function(accumulatorMap, attributeName, attributeValue) {
      if (accumulatorMap[attributeName] === undefined || accumulatorMap[attributeName] === null) {
        accumulatorMap[attributeName] = attributeValue;
      } else if (Array.isArray(accumulatorMap[attributeName])) {
        accumulatorMap[attributeName].push(attributeValue);
      } else {
        // Convert existing scalar to array and add new value
        accumulatorMap[attributeName] = [accumulatorMap[attributeName], attributeValue];
      }
    }
  };

  /**
   * jQuery plugin to populate form fields from a URL-encoded string.
   * This plugin parses a serialized string (e.g., "name=value&key=data")
   * and attempts to set the values of corresponding form elements within the selected form.
   * @param {string} encodedDataString - The URL-encoded string representing form data.
   * @param {object} [configurationOptions] - Optional settings for the population process.
   * @param {function} [configurationOptions.valueHandler] - A callback function (key, value, element)
   *                                                       to handle custom value assignment.
   *                                                       Return `true` if handled, `false` to defer to default logic.
   * @param {boolean} [configurationOptions.overwriteExistingValues=false] - If true, values will
   *                                                                       overwrite existing form field content.
   *                                                                       Does not apply to radio/checkboxes.
   * @returns {jQuery} The jQuery object for chaining.
   */
  util.fn.restoreFormData = function(encodedDataString, configurationOptions) {

    // Basic validation for input string
    if (!encodedDataString || typeof encodedDataString !== 'string' || encodedDataString.trim() === '') {
      // console.warn("restoreFormData: Input data string is empty or invalid. Skipping population.");
      return this; // Return for chaining
    }

    // Establish configuration with defaults
    const currentConfig = util.extend({
      'valueHandler': undefined,
      'overwriteExistingValues': false
    }, configurationOptions);

    // Process each selected form element
    return this.each(function() {
      const currentFormElement = util(this);
      const activeValueHandler = currentConfig.valueHandler;
      const shouldOverwrite = currentConfig.overwriteExistingValues;

      // Validate the callback if provided
      if (activeValueHandler !== undefined && typeof activeValueHandler !== 'function') {
        // console.warn("restoreFormData: Provided 'valueHandler' is not a function. Ignoring.");
        activeValueHandler = undefined; // Treat as if no handler was given
      }

      // Parse the encoded data string into a key-value map
      const dataPairs = encodedDataString.split('&');
      const parsedDataMap = {}; // This will hold our processed key-value pairs

      dataPairs.forEach(pair => {
        const pairParts = pair.split('=');
        if (pairParts.length === 2) {
          try {
            const decodedKey = decodeURIComponent(pairParts[0].replace(/\+/g, ' '));
            const decodedValue = decodeURIComponent(pairParts[1].replace(/\+/g, ' '));
            formAssistant._collectAttributeValue(parsedDataMap, decodedKey, decodedValue);
          } catch (e) {
            // console.error(`restoreFormData: Error decoding URL component: ${pair}. Skipping.`, e);
          }
        }
      });

      // Crucial step: Uncheck all potentially settable elements first.
      // This ensures that if a checkbox/radio was previously checked but isn't in the serialized string,
      // it gets correctly unchecked.
      currentFormElement.find(':radio, :checkbox').prop('checked', false);

      // Iterate through the parsed data and apply values to form controls
      for (const dataKey in parsedDataMap) {
        if (!Object.prototype.hasOwnProperty.call(parsedDataMap, dataKey)) {
          continue; // Skip inherited properties
        }

        let actualValue = parsedDataMap[dataKey];

        // Handle array values (e.g., from <select multiple> or input[name="arr[]"])
        if (Array.isArray(actualValue)) {
            actualValue = actualValue.map(item => decodeURIComponent(item));
        } else {
            actualValue = decodeURIComponent(actualValue);
        }

        // Attempt to find the target form control(s) by name
        let targetControls = currentFormElement.find(`:input[name="${dataKey}"]`);

        if (activeValueHandler === undefined) {
          // No custom handler, proceed with default value application
          formAssistant._applyControlValue(targetControls, actualValue, shouldOverwrite);
        } else {
          // Custom handler is present
          // The callback receives the key, value, and the jQuery element(s) found so far.
          const handlerResult = activeValueHandler.call(currentFormElement[0], dataKey, actualValue, targetControls);

          // If the callback returns false, it means it wants the plugin to handle the value setting.
          // It might have created the element, so we try to find it again.
          if (handlerResult === false) {
            targetControls = currentFormElement.find(`:input[name="${dataKey}"]`); // Re-find element
            formAssistant._applyControlValue(targetControls, actualValue, shouldOverwrite);
          }
          // If callback returns true (or anything else), it's assumed the callback handled it.
        }
      }
    });
  };

})(jQuery);