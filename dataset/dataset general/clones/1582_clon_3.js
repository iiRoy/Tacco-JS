/*
  Data Serialization Utility for jQuery/Zepto
  A transformation of the original serializeJSON plugin.
  https://github.com/marioizquierdo/jquery.serializeJSON

  This version aims for structural divergence while preserving core functionality.
  Copyright (c) 2012, 2015 Mario Izquierdo (Original Author)
  Modified and re-engineered for Type III cloning purposes.
  Licensed under MIT and GPL.
*/
(function (_jq) {
  "use strict";

  // Extend jQuery/Zepto's prototype with a form-to-JSON serialization method.
  _jq.fn.formToJSON = function (userOptions) {
    let finalOutput = {}; // The result object containing serialized form data.
    const coreProcessor = _jq.dataSerializer; // Alias for the core utility functions.

    // Validate and merge user-provided options with default settings.
    const currentConfig = coreProcessor.resolveConfig(userOptions);
    coreProcessor.ensureValidConfig(currentConfig); // Ensure all options are recognized.

    // Guard clause: If the selector doesn't yield a form, or if it's empty, return an empty object.
    if (!this || this.length === 0 || !this.is('form')) {
        console.warn("formToJSON: Selector did not match a form element or was empty. Returning empty object.");
        return finalOutput;
    }

    // Standard jQuery serialization to get an array of {name, value} objects.
    let formElementsData = this.serializeArray();

    // Augment the collected data with values for unchecked checkboxes, if configured.
    coreProcessor.augmentWithUnchecked(formElementsData, this, currentConfig);

    // Process each input element's data to build the final JSON structure.
    _jq.each(formElementsData, function (idx, currentInput) {
      // Decompose the input's 'name' attribute into an array of path segments and a value type.
      let pathSegments = coreProcessor.decomposeNamePath(currentInput.name);
      let valueKind = pathSegments.pop(); // The last segment is always the intended type.

      // If the valueKind is 'omit', we skip processing this input entirely.
      if (valueKind === 'omit') {
        // This input is explicitly marked to be skipped.
        return;
      }

      // Convert the input's string value to its target type (number, boolean, null, etc.).
      let processedValue = coreProcessor.convertStringValue(currentInput.value, valueKind, currentConfig);

      // Apply a custom parsing function if provided and the type is 'autoDetect'.
      if (currentConfig.customParserFn && valueKind === 'autoDetect') {
        processedValue = currentConfig.customParserFn(processedValue, currentInput.name);
      }

      // Recursively set the processed value into the output structure.
      coreProcessor.assignNestedProperty(finalOutput, pathSegments, processedValue, currentConfig);
    });

    return finalOutput; // Return the fully constructed JSON object.
  };

  // Namespace for all auxiliary data serialization functions and default configurations.
  _jq.dataSerializer = {

    // Default configuration settings for the serialization process.
    baseConfig: {
      parseNumbers: false, // Convert numeric strings ("1", "-2.33") to actual numbers.
      parseBooleans: false, // Convert "true", "false" to boolean primitives.
      parseNulls: false, // Convert "null" to the JavaScript null value.
      parseAll: false, // Shortcut to enable all parseNumbers, parseBooleans, parseNulls.
      customParserFn: null, // A custom function (value, name) => parsed_value for advanced parsing.
      checkboxUncheckedValue: undefined, // Value to use for unchecked checkboxes; if undefined, they are ignored.
      useIntKeysAsArrayIndex: false // Treat numeric keys (e.g., "foo[2]") as array indices instead of object keys.
    },

    // Merges user-provided options with default settings, applying 'parseAll' logic.
    resolveConfig: function(userOpts) {
      // Ensure userOpts is a valid object to prevent errors.
      if (!userOpts || typeof userOpts !== 'object') {
        userOpts = {};
      }
      const util = _jq.dataSerializer;
      const enableAllParsing = util.getSingleOption('parseAll', userOpts);

      return {
        parseNumbers:  enableAllParsing || util.getSingleOption('parseNumbers',  userOpts),
        parseBooleans: enableAllParsing || util.getSingleOption('parseBooleans', userOpts),
        parseNulls:    enableAllParsing || util.getSingleOption('parseNulls',    userOpts),
        customParserFn:                util.getSingleOption('customParserFn', userOpts),
        checkboxUncheckedValue:        util.getSingleOption('checkboxUncheckedValue', userOpts),
        useIntKeysAsArrayIndex:        util.getSingleOption('useIntKeysAsArrayIndex', userOpts)
      };
    },

    // Retrieves a specific option's value, preferring user options over defaults.
    // Handles falsy values (false, '') correctly, ensuring they override defaults.
    getSingleOption: function(keyName, optionsObj) {
      const defaultValue = _jq.dataSerializer.baseConfig[keyName];
      const userValue = optionsObj[keyName];

      // If userValue is explicitly false or an empty string, it takes precedence.
      if (userValue === false || userValue === '') {
        return userValue;
      }
      // Otherwise, if userValue exists and is not null/undefined, use it.
      // Fallback to defaultValue if userValue is undefined or null.
      return (userValue !== undefined && userValue !== null) ? userValue : defaultValue;
    },

    // Validates the provided configuration object against a list of allowed keys.
    ensureValidConfig: function(cfg) {
      const allowedKeys = ['parseNumbers', 'parseBooleans', 'parseNulls', 'parseAll', 'customParserFn', 'checkboxUncheckedValue', 'useIntKeysAsArrayIndex'];
      // Iterate over the keys present in the current config object.
      for (const currentKey in cfg) {
        // Ensure the key is directly on the object and not from its prototype chain.
        if (Object.prototype.hasOwnProperty.call(cfg, currentKey)) {
          // If an unknown option is found, throw an error.
          if (!allowedKeys.includes(currentKey)) {
            throw new Error(`DataSerializer ERROR: Unrecognized configuration option '${currentKey}'. Valid options are: ${allowedKeys.join(', ')}.`);
          }
        }
      }
    },

    // Converts a string input value into its intended JavaScript type (number, boolean, null, object, array).
    convertStringValue: function(inputValue, targetType, configSettings) {
      const util = _jq.dataSerializer;
      const normalizedInputValue = String(inputValue).toLowerCase(); // Normalize for consistent comparisons.

      // Force string type if explicitly requested.
      if (targetType === 'string') {
        return String(inputValue);
      }

      // Attempt to parse as a number.
      if (targetType === 'number' || (configSettings.parseNumbers && util.isNumericString(inputValue))) {
        return Number(inputValue);
      }

      // Attempt to parse as a boolean.
      if (targetType === 'boolean' || (configSettings.parseBooleans && (normalizedInputValue === "true" || normalizedInputValue === "false"))) {
        // The original logic treated "false", "null", "undefined", "", "0" as falsey.
        const falseyStrings = new Set(["false", "null", "undefined", "", "0"]);
        return !falseyStrings.has(normalizedInputValue);
      }

      // Attempt to parse as null.
      if (targetType === 'null' || (configSettings.parseNulls && normalizedInputValue === "null")) {
        // Original logic was more complex, matching several falsey strings to null.
        // We replicate this broader interpretation for 'null' type explicitly,
        // and for 'parseNulls' config, we check for explicit "null".
        const nullishStrings = new Set(["false", "null", "undefined", "", "0"]);
        return (targetType === 'null' || (configSettings.parseNulls && nullishStrings.has(normalizedInputValue))) ? null : inputValue;
      }

      // For 'array' or 'object' types, assume JSON string and parse it.
      if (targetType === 'array' || targetType === 'object') {
        try {
          return JSON.parse(inputValue);
        } catch (e) {
          console.error(`DataSerializer: Failed to parse JSON for type '${targetType}': '${inputValue}'. Returning original string.`, e);
          return inputValue; // Return original string if parsing fails.
        }
      }

      // If 'autoDetect' is specified, recursively call with broader parsing enabled.
      if (targetType === 'autoDetect') {
        const autoParseConfig = {
          parseNumbers: true,
          parseBooleans: true,
          parseNulls: true,
          useIntKeysAsArrayIndex: configSettings.useIntKeysAsArrayIndex // Keep this specific setting
        };
        // Re-attempt parsing with a more permissive configuration.
        return util.convertStringValue(inputValue, null, autoParseConfig);
      }

      // If no specific type or parsing rule matched, return the original string.
      return inputValue;
    },

    // Helper: Checks if a variable is a plain JavaScript object (not an array, null, or other object type).
    isPlainObject: (item) => item && typeof item === 'object' && item.constructor === Object,

    // Helper: Checks if a variable is strictly undefined.
    isUndef: (val) => val === undefined,

    // Helper: Checks if a string consists only of digits, suitable for array indices.
    isNaturalNumberString: (txt) => /^\d+$/.test(String(txt)),

    // Helper: Checks if a string represents a numeric value (similar to jQuery.isNumeric).
    isNumericString: (val) => !isNaN(parseFloat(val)) && isFinite(val),

    // Decomposes an input name string into an ordered array of keys/path segments
    // and extracts the explicit type definition if present.
    // Examples:
    // "item"             => ['item', 'autoDetect']
    // "item:boolean"     => ['item', 'boolean']
    // "data[prop][sub]"  => ['data', 'prop', 'sub', 'autoDetect']
    // "list[][val]:null" => ['list', '', 'val', 'null']
    decomposeNamePath: function (fullInputName) {
      // Guard against invalid input names.
      if (!fullInputName || typeof fullInputName !== 'string') {
        return [];
      }
      const util = _jq.dataSerializer;
      // First, separate the base name from any explicit type definition.
      const [baseName, detectedType] = util.identifyTypeFromName(fullInputName);

      // Split by '[' to get initial segments, then clean up ']' characters.
      let pathSegments = baseName.split('[');
      pathSegments = _jq.map(pathSegments, function (segment) {
        return segment.replace(/]/g, ''); // Remove closing brackets.
      });

      // If the first segment was empty (e.g., "[foo][bar]"), remove it.
      if (pathSegments[0] === '') {
        pathSegments.shift();
      }

      // Add the detected type as the very last segment.
      pathSegments.push(detectedType);
      return pathSegments;
    },

    // Extracts the explicit type from an input name string.
    // Returns an array: [nameWithoutType, typeString].
    // Default type is 'autoDetect' if no explicit type is found.
    identifyTypeFromName: function(inputIdentifier) {
      const typePattern = /(.*):([^:]+)$/; // Regex to find ':type' at the end.
      const typeMatch = inputIdentifier.match(typePattern);

      const supportedValueTypes = new Set(['string', 'number', 'boolean', 'null', 'array', 'object', 'omit', 'autoDetect']);

      if (typeMatch) {
        const potentialType = typeMatch[2]; // The matched type string.
        if (supportedValueTypes.has(potentialType)) {
          return [typeMatch[1], potentialType]; // [name_without_type, type]
        } else {
          throw new Error(`DataSerializer ERROR: Invalid type '${potentialType}' specified in input name '${inputIdentifier}'. Please use one of: ${Array.from(supportedValueTypes).join(', ')}.`);
        }
      } else {
        return [inputIdentifier, 'autoDetect']; // No explicit type found, default to auto-detection.
      }
    },

    // Recursively sets a value in an object or array based on a path of keys.
    // Handles dynamic array indexing and object creation as needed.
    assignNestedProperty: function (targetObj, propertyPath, propertyValue, config) {
      if (config === null || typeof config === 'undefined') {
        config = {}; // Ensure config is always an object to prevent errors.
      }
      const util = _jq.dataSerializer;

      // Basic validation for input arguments.
      if (util.isUndef(targetObj)) {
        throw new Error("ArgumentError: 'targetObj' must be an object or array, found undefined.");
      }
      if (!propertyPath || propertyPath.length === 0) {
        throw new Error("ArgumentError: 'propertyPath' must be a non-empty array of keys.");
      }

      let currentKey = propertyPath[0]; // The current key to process.

      // If this is the last key in the path, simply assign the value.
      if (propertyPath.length === 1) {
        if (currentKey === '') {
          // An empty key indicates pushing to an array.
          // This assumes `targetObj` is already an array or can be treated as one.
          // In practice, `targetObj` would be a reference to a mutable part of `finalOutput`.
          if (!_jq.isArray(targetObj)) {
            // This scenario should ideally be prevented by upstream creation of arrays.
            // If it happens, we'll try to convert, but it might indicate a logic flaw elsewhere.
            console.warn("DataSerializer: Attempted to push to a non-array target. Initializing as array.");
            // Note: Modifying `targetObj` directly here won't re-assign the parent property
            // if `targetObj` was passed by value (e.g., `o[key]`). The original code relies
            // on `o[key]` being a reference, which it is in JS for objects/arrays.
            // So, `targetObj.push` works even if `o[key]` was undefined and then assigned `[]`.
            targetObj = []; // This line is mostly illustrative; the push will work on the reference.
          }
          targetObj.push(propertyValue);
        } else {
          targetObj[currentKey] = propertyValue; // Assign value directly.
        }
        return; // End recursion.
      }

      // If there are more keys, we need to handle nested structures.
      const subsequentKey = propertyPath[1]; // The next key in the path.

      // Special handling for empty `currentKey` (''), typically for array elements.
      if (currentKey === '') {
        const lastIndex = targetObj.length - 1; // Assuming targetObj is an array.
        const lastElement = targetObj[lastIndex];

        // This complex logic allows merging of objects when using array notation like `arr[][foo]` and `arr[][bar]`.
        // If the last element in the array is an object AND the `subsequentKey` is not yet defined in it,
        // OR if there are further keys beyond `subsequentKey` (implying a deeper merge),
        // THEN we modify `currentKey` to point to the *last* element's index.
        // This causes the new value to be set within the existing last object in the array.
        if (util.isPlainObject(lastElement) && (util.isUndef(lastElement[subsequentKey]) || propertyPath.length > 2)) {
          currentKey = lastIndex; // Update currentKey to target the last existing object.
        } else {
          // Otherwise, we create a new element at the next available index.
          currentKey = lastIndex + 1;
        }
      }

      // Determine the type of the next nested container (array or object) and ensure it exists.
      // This is where intermediate objects/arrays are created if they don't exist
      // or are of the wrong type.
      if (subsequentKey === '') {
        // If the subsequent key is empty, it means we need an array at this level.
        if (util.isUndef(targetObj[currentKey]) || !_jq.isArray(targetObj[currentKey])) {
          targetObj[currentKey] = []; // Initialize as an array.
        }
      } else {
        // If 'useIntKeysAsArrayIndex' is enabled and the subsequent key is a valid number string,
        // then the next container should be an array.
        if (config.useIntKeysAsArrayIndex && util.isNaturalNumberString(subsequentKey)) {
          if (util.isUndef(targetObj[currentKey]) || !_jq.isArray(targetObj[currentKey])) {
            targetObj[currentKey] = []; // Initialize as an array for indexed access.
          }
        } else {
          // For all other cases, the next container should be a plain object.
          if (util.isUndef(targetObj[currentKey]) || !util.isPlainObject(targetObj[currentKey])) {
            targetObj[currentKey] = {}; // Initialize as an object.
          }
        }
      }

      // Recursively call assignNestedProperty for the remainder of the path.
      const remainingPath = propertyPath.slice(1);
      util.assignNestedProperty(targetObj[currentKey], remainingPath, propertyValue, config);
    },

    // Augments the `gatheredInputs` array with entries for unchecked checkboxes.
    // The value for unchecked checkboxes is determined by `data-unchecked-value`
    // attribute or the `checkboxUncheckedValue` config option.
    augmentWithUnchecked: function (gatheredInputs, $contextForm, config) {
      if (!config || typeof config !== 'object') {
        config = {}; // Ensure config is available to prevent errors.
      }
      const util = _jq.dataSerializer;

      // Selector for unchecked, named, non-disabled checkboxes within the form.
      const checkboxSelector = 'input[type="checkbox"][name]:not(:checked):not([disabled])';
      // Find unchecked checkboxes both within the form and if the form itself is a checkbox.
      const unmarkedCheckboxes = $contextForm.find(checkboxSelector).add($contextForm.filter(checkboxSelector));

      unmarkedCheckboxes.each(function (index, element) {
        const $currentCheckbox = _jq(element);
        const attrUncheckedValue = $currentCheckbox.attr('data-unchecked-value');

        // 'data-unchecked-value' attribute takes precedence over global config.
        if (attrUncheckedValue !== undefined && attrUncheckedValue !== null) {
          gatheredInputs.push({ name: element.name, value: attrUncheckedValue });
        } else if (!util.isUndef(config.checkboxUncheckedValue)) {
          // Otherwise, use the global configuration option if it's defined.
          gatheredInputs.push({ name: element.name, value: config.checkboxUncheckedValue });
        }
        // If neither is defined, the unchecked checkbox is simply ignored (default behavior),
        // so no 'else' branch is needed here.
      });
    }

  };

}(window.jQuery || window.Zepto || window.$));