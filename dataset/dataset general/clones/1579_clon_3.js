// A custom Angular.js directive for enhancing phone number input fields.
// Based on initial work by Marek Pietrucha, adapted and extended.
// Original source: https://github.com/mareczek/international-phone-number

(function() {
  "use strict";

  // Define the module and the directive.
  // Renamed module from 'internationalPhoneNumber' to 'globalPhoneEntryModule'.
  // Renamed directive from 'internationalPhoneNumber' to 'globalPhoneNumberInput'.
  angular.module("globalPhoneEntryModule", []).directive('globalPhoneNumberInput', function() {

    // The directive definition object.
    return {
      restrict: 'A', // Attribute-only directive.
      require: '^ngModel', // Requires ngModel controller from parent or self.
      scope: true, // Create an isolated scope for the directive.

      /**
       * The link function is where the directive's logic resides.
       * It's executed after the template has been compiled and linked to the scope.
       * @param {Object} viewScope - The directive's isolated scope.
       * @param {Object} domElement - The jQuery-wrapped DOM element the directive is on.
       * @param {Object} attributes - A hash of normalized attributes from the directive's element.
       * @param {Object} modelCtrl - The ngModelController instance for the element.
       */
      link: function(viewScope, domElement, attributes, modelCtrl) {

        // Declare variables using 'let' for block scope, replacing 'var'.
        let valueUpdaterFn, intlTelInputConfiguration, arrayProcessorUtility;

        /**
         * Helper function to push the current value from the DOM element into the ngModelController.
         * This ensures the model is updated whenever the view changes.
         * Renamed from 'read' to 'valueUpdaterFn'.
         */
        valueUpdaterFn = function() {
          // Guard clause: ensure both element and controller are present.
          if (!domElement || !modelCtrl) {
            console.warn("GlobalPhoneNumberInput: Missing DOM element or ngModelController for value update.");
            return;
          }
          modelCtrl.$setViewValue(domElement.val());
        };

        /**
         * Utility function to convert a comma-separated string into an array of strings.
         * Handles cases where the input is already an array.
         * Renamed from 'handleWhatsSupposedToBeAnArray' to 'arrayProcessorUtility'.
         * @param {*} inputVal - The value to process, expected to be an array or string.
         * @returns {Array} An array of strings.
         */
        arrayProcessorUtility = function(inputVal) {
          // Add null/undefined check for robustness.
          if (inputVal === null || inputVal === undefined) {
            return [];
          }
          // Use Array.isArray for more precise type checking.
          if (Array.isArray(inputVal)) {
            return inputVal;
          } else {
            // Convert to string, remove all whitespace, then split by comma.
            const cleanedString = String(inputVal).replace(/\s+/g, '').trim();
            return cleanedString.split(',').filter(item => item.length > 0); // Filter out empty strings.
          }
        };

        // Default configuration options for the `intlTelInput` plugin.
        // Renamed from 'options' to 'intlTelInputConfiguration'.
        intlTelInputConfiguration = {
          enableAutoFormatting: true, // Renamed from autoFormat
          hideDialCodeOnLoad: true, // Renamed from autoHideDialCode
          initialCountry: '', // Renamed from defaultCountry
          nationalInputMode: false, // Renamed from nationalMode
          phoneNumberType: '', // Renamed from numberType
          restrictToCountries: undefined, // Renamed from onlyCountries, changed 'void 0' to 'undefined'
          priorityCountries: ['us', 'gb'], // Renamed from preferredCountries
          responsiveDropdownEnabled: false, // Renamed from responsiveDropdown
          utilityScriptPath: "" // Renamed from utilsScript
        };

        // Iterate over the default configuration to apply directive attributes.
        // Renamed variables for clarity.
        angular.forEach(intlTelInputConfiguration, function(currentDefaultValue, currentKey) {
          let attributeName = currentKey; // Use currentKey directly as attribute name.
          // For camelCase to kebab-case conversion for attributes, if needed.
          // Original code used eval, which is dangerous. Replacing with direct attribute access.
          let rawAttributeValue = attributes[attributeName];

          // Check if an attribute with the same name as the config key exists.
          if (rawAttributeValue !== undefined && rawAttributeValue !== null) { // More explicit check than angular.isDefined
            if (currentKey === 'priorityCountries') {
              intlTelInputConfiguration.priorityCountries = arrayProcessorUtility(rawAttributeValue);
            } else if (currentKey === 'restrictToCountries') {
              intlTelInputConfiguration.restrictToCountries = arrayProcessorUtility(rawAttributeValue);
            } else if (typeof currentDefaultValue === "boolean") {
              // Convert string "true"/"false" from attribute to boolean.
              intlTelInputConfiguration[currentKey] = rawAttributeValue === "true";
            } else {
              // For other types, directly assign the attribute value.
              intlTelInputConfiguration[currentKey] = rawAttributeValue;
            }
          }
        });

        // Initialize the intlTelInput plugin on the DOM element.
        // Renamed element to domElement and options to intlTelInputConfiguration.
        domElement.intlTelInput(intlTelInputConfiguration);

        // Conditional loading of the utility script for phone number formatting/validation.
        // Added a check for window.intlTelInputUtils to prevent re-loading if already present.
        if (!intlTelInputConfiguration.utilityScriptPath && !window.intlTelInputUtils) {
          domElement.intlTelInput('loadUtils', 'vendor_components/intl-tel-input/lib/libphonenumber/build/utils.js');
        } else if (intlTelInputConfiguration.utilityScriptPath && !window.intlTelInputUtils) {
            // If a custom path is provided, use that.
            domElement.intlTelInput('loadUtils', intlTelInputConfiguration.utilityScriptPath);
        }

        // Add a parser to ngModelController to clean the input value.
        // This parser removes all non-digit characters from the input.
        modelCtrl.$parsers.push(function(incomingValue) {
          // Guard clause for non-string or empty input.
          if (!incomingValue || typeof incomingValue !== 'string') {
            return incomingValue;
          }
          const cleanedNumber = incomingValue.replace(/[^0-9]/g, ''); // Equivalent regex for digits.
          return cleanedNumber;
        });

        // Add another parser for validation against the intlTelInput plugin's rules.
        modelCtrl.$parsers.push(function(currentModelValue) {
          // Guard clause: if no value, clear validity and return empty string.
          if (!currentModelValue) {
            modelCtrl.$setValidity('phoneEntryFormat', true); // Mark as valid if empty.
            // Explicitly clear any specific error related to this validation.
            if (modelCtrl.$error['phoneEntryValidity']) {
              delete modelCtrl.$error['phoneEntryValidity'];
            }
            return ''; // Ensure empty string is set for null/undefined input.
          }

          // Check validity using the plugin.
          const isNumberValid = domElement.intlTelInput("isValidNumber");
          // Set the validity status on the ngModelController.
          // Renamed validity key from 'international-phone-number' to 'phoneEntryValidity'.
          modelCtrl.$setValidity('phoneEntryValidity', isNumberValid);

          return currentModelValue;
        });

        // Attach event listeners to update the model when the user interacts with the input.
        // Changed event types from 'blur keyup change' to 'input blur paste'.
        domElement.on('input blur paste', function(interactionEvent) {
          // Guard for the event object.
          if (!interactionEvent) {
            console.warn("GlobalPhoneNumberInput: Interaction event is missing.");
            return;
          }
          // Use viewScope.$apply to ensure Angular's digest cycle runs and updates the model.
          viewScope.$apply(valueUpdaterFn);
        });

        // Clean up event listeners when the directive's scope is destroyed.
        // This prevents memory leaks.
        return domElement.on('$destroy', function() {
          console.log("GlobalPhoneNumberInput: Cleaning up event listeners on element destroy.");
          // Ensure we remove the same events that were added.
          domElement.off('input blur paste');
        });
      }
    };
  });

}).call(this); // Using .call(this) to maintain original IIFE context.