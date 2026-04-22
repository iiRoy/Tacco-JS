const DataProcessorModule = (function() {
  "use strict";

  // Default configuration for data processing
  const baseConfiguration = {
    convertNumbers: false,
    convertBooleans: false,
    convertNulls: false,
    convertAll: false, // Shorthand for all three convert options
    customConverter: null, // Function for custom value parsing
    missingCheckboxValue: undefined, // Value for unchecked checkboxes
    useNumericIndices: false // Treat integer keys as array indices: foo[0] => foo[0] instead of foo['0']
  };

  // Internal utility functions and helpers
  const UtilityBelt = {
    // Checks if a value is strictly undefined
    isAbsent: function(val) {
      return val === undefined;
    },

    // Checks if a value is a plain JavaScript object (not an array, null, etc.)
    isPlainObject: function(val) {
      return val && typeof val === 'object' && val.constructor === Object;
    },

    // Checks if a string consists only of digits (for array indices)
    isPositiveIntegerString: function(txt) {
      return /^[0-9]+$/.test(String(txt));
    },

    // Checks if a string can be interpreted as a number
    isNumericValue: function(txt) {
      // Replicates jQuery's isNumeric logic from the original plugin
      return txt - parseFloat(txt) >= 0;
    },

    // Determines the effective setting value, considering default values
    getEffectiveSetting: function(key, currentSettings) {
      const userValue = currentSettings[key];
      // Original logic: (options[key] !== false) && (options[key] !== '') && (options[key] || $.serializeJSON.defaultOptions[key]);
      // This means if userValue is false or empty string, it explicitly overrides the default to false.
      if (userValue === false || userValue === '') {
        return false;
      }
      // If user provided a value (and it's not false/empty string), use it.
      if (userValue !== undefined) {
        return userValue;
      }
      // Otherwise, use the base configuration default.
      return baseConfiguration[key];
    },

    // Consolidates user-provided settings with base configurations
    resolveSettings: function(userProvidedSettings) {
      const mergedSettings = { ...baseConfiguration, ...userProvidedSettings };
      const comprehensiveConversion = UtilityBelt.getEffectiveSetting('convertAll', mergedSettings);

      return {
        convertNumbers: comprehensiveConversion || UtilityBelt.getEffectiveSetting('convertNumbers', mergedSettings),
        convertBooleans: comprehensiveConversion || UtilityBelt.getEffectiveSetting('convertBooleans', mergedSettings),
        convertNulls: comprehensiveConversion || UtilityBelt.getEffectiveSetting('convertNulls', mergedSettings),
        customConverter: UtilityBelt.getEffectiveSetting('customConverter', mergedSettings),
        missingCheckboxValue: UtilityBelt.getEffectiveSetting('missingCheckboxValue', mergedSettings),
        useNumericIndices: UtilityBelt.getEffectiveSetting('useNumericIndices', mergedSettings)
      };
    },

    // Ensures that all user-provided settings are recognized and valid
    ensureValidSettings: function(userProvidedSettings) {
      const permittedKeys = Object.keys(baseConfiguration).concat(['convertAll']);
      for (const currentKey in userProvidedSettings) {
        if (!permittedKeys.includes(currentKey)) {
          throw new Error(`DataProcessor ERROR: Invalid setting '${currentKey}'. Please use one of ${permittedKeys.join(', ')}.`);
        }
      }
    },

    // Converts a raw string value based on a type modifier and current settings
    interpretValue: function(rawData, modifier, settings) {
      if (modifier === 'string') return String(rawData);

      if (modifier === 'number' || (settings.convertNumbers && UtilityBelt.isNumericValue(rawData))) {
        return Number(rawData);
      }

      if (modifier === 'boolean' || (settings.convertBooleans && (rawData === "true" || rawData === "false"))) {
        // Replicates original plugin's specific boolean conversion logic
        const falseyStrings = ["false", "null", "undefined", "", "0"];
        return !falseyStrings.includes(rawData);
      }

      if (modifier === 'null' || (settings.convertNulls && rawData === "null")) {
        // Replicates original plugin's specific null conversion logic
        const nullishStrings = ["false", "null", "undefined", "", "0"];
        return nullishStrings.includes(rawData) ? null : rawData;
      }

      if (modifier === 'array' || modifier === 'object') {
        try {
          return JSON.parse(rawData);
        } catch (e) {
          // If JSON parsing fails, return raw string as per original implicit behavior
          return rawData;
        }
      }

      if (modifier === 'auto') {
        // Recurse with comprehensive parsing options
        return UtilityBelt.interpretValue(rawData, null, {
          convertNumbers: true,
          convertBooleans: true,
          convertNulls: true
        });
      }

      return rawData; // Default: return value as a string
    },

    // Breaks down an element name into an array of path segments and its type modifier
    decomposeElementName: function(fullElementName) {
      const [nameWithoutModifier, valueModifier] = UtilityBelt.segmentNameAndModifier(fullElementName);
      let segments = nameWithoutModifier.split('[');
      segments = segments.map(segment => segment.replace(/]/g, '')); // Remove closing brackets

      if (segments[0] === '') { // Handles names starting with '[' (e.g., "[foo][bar]")
        segments.shift();
      }
      segments.push(valueModifier); // Add the type modifier as the final segment

      return segments;
    },

    // Extracts the name part and the explicit type modifier from an element's name
    segmentNameAndModifier: function(elementName) {
      const typeRegex = /(.*):([^:]+)$/;
      const match = elementName.match(typeRegex);
      const allowedModifiers = ['string', 'number', 'boolean', 'null', 'array', 'object', 'skip', 'auto'];

      if (match) {
        const potentialModifier = match[2];
        if (allowedModifiers.includes(potentialModifier)) {
          return [match[1], potentialModifier];
        } else {
          throw new Error(`DataProcessor ERROR: Invalid modifier '${potentialModifier}' found in element name '${elementName}', please use one of ${allowedModifiers.join(', ')}`);
        }
      } else {
        return [elementName, '_']; // Default modifier if none specified
      }
    },

    // Inserts a value into a nested object/array structure using an array of keys (path segments)
    placeNestedValue: function(targetContainer, pathSegments, inputValue, settings) {
      if (UtilityBelt.isAbsent(targetContainer)) {
        throw new Error("ArgumentError: 'targetContainer' must be an object or array, found undefined");
      }
      if (!pathSegments || pathSegments.length === 0) {
        throw new Error("ArgumentError: 'pathSegments' must be an array with at least one element");
      }

      let currentSegmentIndex = 0;
      let currentReference = targetContainer;

      while (currentSegmentIndex < pathSegments.length) {
        const currentKey = pathSegments[currentSegmentIndex];
        const isLastSegment = (currentSegmentIndex === pathSegments.length - 1);

        if (isLastSegment) {
          if (currentKey === '') { // If the key is empty, push to array (e.g., `arr[]`)
            currentReference.push(inputValue);
          } else {
            currentReference[currentKey] = inputValue;
          }
          break; // Done with this path
        }

        const nextKey = pathSegments[currentSegmentIndex + 1];

        // Special handling for array pushes ('') when there are further nested keys (e.g., `arr[][foo]`)
        if (currentKey === '') {
          const lastElementIndex = currentReference.length - 1;
          const lastElement = currentReference[lastElementIndex];

          // If the last element in the array is an object AND
          // (the next key is not yet defined in it OR there are more segments after nextKey)
          // then modify the existing last element.
          if (UtilityBelt.isPlainObject(lastElement) && (UtilityBelt.isAbsent(lastElement[nextKey]) || pathSegments.length > currentSegmentIndex + 2)) {
            currentReference = currentReference[lastElementIndex]; // Set reference to the last existing object
          } else {
            // Otherwise, create a new object in the array and set reference to it.
            const newElement = {};
            currentReference.push(newElement);
            currentReference = newElement;
          }
          currentSegmentIndex++; // Move to process the nextKey
          continue; // Continue loop with updated reference
        }

        // Determine if the next nested container should be an array or an object
        if (nextKey === '') { // If next key is empty, it implies an array (e.g., `foo[]`)
          if (UtilityBelt.isAbsent(currentReference[currentKey]) || !Array.isArray(currentReference[currentKey])) {
            currentReference[currentKey] = [];
          }
        } else if (settings.useNumericIndices && UtilityBelt.isPositiveIntegerString(nextKey)) {
          // If numeric indices are enabled and next key is a numeric string, use an array
          if (UtilityBelt.isAbsent(currentReference[currentKey]) || !Array.isArray(currentReference[currentKey])) {
            currentReference[currentKey] = [];
          }
        } else { // For any other case, use a plain object
          if (UtilityBelt.isAbsent(currentReference[currentKey]) || !UtilityBelt.isPlainObject(currentReference[currentKey])) {
            currentReference[currentKey] = {};
          }
        }

        // Advance to the next level in the structure
        currentReference = currentReference[currentKey];
        currentSegmentIndex++;
      }
    },

    // Adds entries for unchecked checkboxes to the collected elements list
    augmentWithUnchecked: function(collectedElements, formElement, settings) {
      const uncheckedSelector = 'input[type="checkbox"][name]:not(:checked):not([disabled])';
      const uncheckedCheckboxes = formElement.querySelectorAll(uncheckedSelector);

      uncheckedCheckboxes.forEach(checkbox => {
        const customUncheckedValue = checkbox.getAttribute('data-unchecked-value');
        if (customUncheckedValue !== null) { // data-unchecked-value takes precedence
          collectedElements.push({ identifier: checkbox.name, content: customUncheckedValue });
        } else if (!UtilityBelt.isAbsent(settings.missingCheckboxValue)) {
          collectedElements.push({ identifier: checkbox.name, content: settings.missingCheckboxValue });
        }
      });
    },

    // Processes the raw list of form elements into the final structured object
    processElementList: function(elementDataArray, finalSettings) {
      const outputStructure = {};

      elementDataArray.forEach(entry => {
        const pathSegments = UtilityBelt.decomposeElementName(entry.identifier);
        const valueModifier = pathSegments.pop(); // The last segment is the type modifier

        if (valueModifier !== 'skip') { // Skip elements explicitly marked with ':skip'
          let processedValue = UtilityBelt.interpretValue(entry.content, valueModifier, finalSettings);

          // Apply custom converter if defined and the modifier is default ('_')
          if (finalSettings.customConverter && valueModifier === '_') {
            processedValue = finalSettings.customConverter(processedValue, entry.identifier);
          }
          UtilityBelt.placeNestedValue(outputStructure, pathSegments, processedValue, finalSettings);
        }
      });

      return outputStructure;
    }
  }; // End UtilityBelt

  // The main entry point function for processing form data
  const extractFormData = function(targetForm, userOptions = {}) {
    if (!(targetForm instanceof Element)) {
      throw new Error("DataProcessor ERROR: Input must be a DOM element (e.g., a form).");
    }

    const resolvedSettings = UtilityBelt.resolveSettings(userOptions);
    UtilityBelt.ensureValidSettings(userOptions); // Validate original user options

    // Mimic jQuery's serializeArray() element selection logic
    const allFormElements = targetForm.querySelectorAll('input, select, textarea');
    const collectedData = [];

    allFormElements.forEach(element => {
      const tagName = element.tagName.toLowerCase();
      const inputType = element.type ? element.type.toLowerCase() : '';

      // Exclude elements based on serializeArray() behavior
      if (element.name === '' || element.disabled || inputType === 'submit' || inputType === 'reset' || inputType === 'button' || inputType === 'file') {
        return; // Skip this element
      }

      if (tagName === 'select') {
        if (element.multiple) {
          Array.from(element.options).filter(option => option.selected).forEach(option => {
            collectedData.push({ identifier: element.name, content: option.value });
          });
        } else { // Single select
          // Includes value or empty string if no option selected
          collectedData.push({ identifier: element.name, content: element.value });
        }
      } else if (tagName === 'input' && (inputType === 'checkbox' || inputType === 'radio')) {
        if (element.checked) {
          collectedData.push({ identifier: element.name, content: element.value });
        }
        // Unchecked checkboxes are handled separately later
      } else { // All other inputs (text, hidden, password, etc.) and textareas
        collectedData.push({ identifier: element.name, content: element.value });
      }
    });

    // Add entries for unchecked checkboxes
    UtilityBelt.augmentWithUnchecked(collectedData, targetForm, resolvedSettings);

    // Process the collected raw data into the final structured object
    return UtilityBelt.processElementList(collectedData, resolvedSettings);
  };

  // The module returns the main function
  return extractFormData;

})(); // End DataProcessorModule

// For typical usage, this would be assigned to a global variable or exported as a module.
// Example: window.formDeserializer = DataProcessorModule;
// As per instructions, only the raw code is provided.