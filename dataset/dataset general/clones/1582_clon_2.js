/*
  formToObj jQuery utility.
  https://github.com/another-dev/jquery.formtoobj
  version 1.0.0 (Oct, 2023)

  Copyright (c) 2023 Another Developer
  Licensed under the Apache License 2.0 (http://www.apache.org/licenses/LICENSE-2.0)
  and MIT (http://opensource.org/licenses/MIT) licenses.
*/
(function (jq) {
  "use strict";

  // Invokes form data conversion, e.g., jq('form').formToObj()
  jq.fn.formToObj = function (settings) {
    var outputResult, elementData, pathSegments, valKind, processedValue, tempSplit, utilMethods, runtimeConfig;
    utilMethods = jq.formToObjUtils;
    runtimeConfig = utilMethods.applyDefaultSettings(settings); // determine all parsing settings {convertNums, handleBools, handleNulls}
    utilMethods.checkConfigValidity(runtimeConfig);

    elementData = this.serializeArray(); // array of key-value pairs {name, value}
    utilMethods.addMissingCheckboxData(elementData, this, runtimeConfig); // append data for unchecked checkboxes, if required

    outputResult = {};
    jq.each(elementData, function (idx, fieldEntry) {
      pathSegments = utilMethods.decomposeFieldName(fieldEntry.name);
      valKind = pathSegments.pop(); // the final segment is always the value type (default is generic)

      if (valKind !== 'ignore') { // simple mechanism to disregard a field's value
        processedValue = utilMethods.interpretValue(fieldEntry.value, valKind, runtimeConfig); // string, numeric, boolean or null
        if (runtimeConfig.customParserFn && valKind === '_') {
          processedValue = runtimeConfig.customParserFn(processedValue, fieldEntry.name); // enable custom value transformation
        }
        utilMethods.setNestedProperty(outputResult, pathSegments, processedValue, runtimeConfig);
      }
    });
    return outputResult;
  };

  // The jq.formToObjUtils object serves as a container for helper routines
  // and also defines the default configuration parameters.
  jq.formToObjUtils = {

    baseConfig: {
      convertNums: false, // transform strings like "1", "-2.33" into actual numbers 1, -2.33
      handleBools: false, // convert "true", "false" strings to boolean true, false
      handleNulls: false, // convert "null" string to null
      processAllTypes: false, // enables all the above conversions
      customParserFn: null, // for custom value parsing, provide a function: function(value){ return altered_value; }
      uncheckedCheckboxVal: undefined, // include this value for checkboxes that are not checked (otherwise they are omitted)
      numericKeysAsArrayIndices: false // if name="item[2]" value="X", results in {item: [null, null, "X"]} instead of {item: {"2": "X"}}
    },

    // Combines provided settings with baseConfig to yield the final operational settings
    // This provides {convertNums, handleBools, handleNulls, numericKeysAsArrayIndices}
    applyDefaultSettings: function(userSettings) {
      var procRef, universalParsing;
      if (userSettings == null) userSettings = {}; // ensure userSettings is an object by default
      procRef = jq.formToObjUtils;
      universalParsing = procRef.resolveSingleOption('processAllTypes', userSettings);
      return {
        convertNums:               universalParsing || procRef.resolveSingleOption('convertNums', userSettings),
        handleBools:               universalParsing || procRef.resolveSingleOption('handleBools', userSettings),
        handleNulls:               universalParsing || procRef.resolveSingleOption('handleNulls', userSettings),
        customParserFn:            procRef.resolveSingleOption('customParserFn', userSettings),
        uncheckedCheckboxVal:      procRef.resolveSingleOption('uncheckedCheckboxVal', userSettings),
        numericKeysAsArrayIndices: procRef.resolveSingleOption('numericKeysAsArrayIndices', userSettings)
      }
    },

    resolveSingleOption: function(settingKey, currentSettings) {
      return (currentSettings[settingKey] !== false) && (currentSettings[settingKey] !== '') && (currentSettings[settingKey] || jq.formToObjUtils.baseConfig[settingKey]);
    },

    checkConfigValidity: function(processedConfig) {
      var configKey, allowedKeys;
      allowedKeys = ['convertNums', 'handleBools', 'handleNulls', 'processAllTypes', 'customParserFn', 'uncheckedCheckboxVal', 'numericKeysAsArrayIndices']
      for (configKey in processedConfig) {
        if (allowedKeys.indexOf(configKey) === -1) {
          throw new Error("formToObjUtils ERROR: unrecognized setting '" + configKey + "'. Valid keys are: " + allowedKeys.join(','));
        }
      }
    },

    // Transforms the input string into a number, boolean, or null based on the specified type and configuration.
    interpretValue: function(rawString, valKind, currentConfig) {
      var finalValue, utilRef;
      utilRef = jq.formToObjUtils;
      if (valKind == 'string') {
        return rawString; // explicitly keep as string
      }
      if (valKind == 'number'  || (currentConfig.convertNums  && utilRef.canBeNumber(rawString))) {
        return Number(rawString); // convert to number
      }
      if (valKind == 'boolean' || (currentConfig.handleBools && (rawString === "true" || rawString === "false"))) {
        return (["false", "null", "undefined", "", "0"].indexOf(rawString) === -1); // convert to boolean
      }
      if (valKind == 'null'    || (currentConfig.handleNulls    && rawString == "null")) {
        return ["false", "null", "undefined", "", "0"].indexOf(rawString) !== -1 ? null : rawString; // convert to null
      }
      if (valKind == 'array' || valKind == 'object') {
        return JSON.parse(rawString); // arrays or objects expect JSON formatted strings
      }
      if (valKind == 'auto') {
        return utilRef.interpretValue(rawString, null, {convertNums: true, handleBools: true, handleNulls: true}); // re-attempt parsing with comprehensive settings
      }
      return rawString; // default: return the original string
    },

    isPlainObject:     function(valueItem) { return valueItem === Object(valueItem); }, // confirms if variable is a plain object
    valueIsUndefined:  function(checkVal) { return checkVal === void 0; }, // robust check for undefined
    looksLikeArrayIndex: function(idxVal) { return /^[0-9]+$/.test(String(idxVal)); }, // integers like 0, 1, 2... are considered array indices
    canBeNumber:       function(testVal) { return testVal - parseFloat(testVal) >= 0; }, // similar to jQuery's isNumeric, supporting older jQuery/Zepto

    // Deconstructs the input field's name into a series of hierarchical keys.
    // The final key always represents the data type (default "generic").
    // Examples:
    // "item"             => ['item', 'generic']
    // "item:text"        => ['item', 'text']
    // "item:bool"        => ['item', 'bool']
    // "[item]"           => ['item', 'generic']
    // "item[sub][prop]"  => ['item', 'sub', 'prop', 'generic']
    // "item[sub[prop]]"  => ['item', 'sub', 'prop', 'generic']
    // "item[sub][list][0]"=> ['item', 'sub', 'list', '0', 'generic']
    // "list[][entry]"    => ['list', '', 'entry', 'generic']
    // "list[][entry]:null"=> ['list', '', 'entry', 'null']
    decomposeFieldName: function (inputNameId) {
      var pathParts, coreName, derivedType, splitResult, utilRef;
      utilRef = jq.formToObjUtils;
      splitResult = utilRef.deriveTypeFromName(inputNameId);
      coreName = splitResult[0];
      derivedType = splitResult[1];

      pathParts = coreName.split('['); // divide the string into segments
      pathParts = jq.map(pathParts, function (segment) { return segment.replace(/]/g, ''); }); // strip all closing brackets
      if (pathParts[0] === '') {
        pathParts.shift(); // remove initial empty string if name starts with a bracket (e.g., "[foo]")
      }
      pathParts.push(derivedType); // append the determined type at the end
      return pathParts;
    },

    // Provides [base-name, identified-type] from the full field name.
    // "item"             =>  ["item", "generic"]
    // "item:bool"        =>  ["item", "bool"]
    // "item[sub]:null"   =>  ["item[sub]", "null"]
    deriveTypeFromName: function(fieldName) {
      var typeMatch, utilRef;
      utilRef = jq.formToObjUtils;
      if (typeMatch = fieldName.match(/(.*):([^:]+)$/)){
        var allowedKinds = ['string', 'number', 'boolean', 'null', 'array', 'object', 'ignore', 'auto']; // permitted types
        if (allowedKinds.indexOf(typeMatch[2]) !== -1) {
          return [typeMatch[1], typeMatch[2]];
        } else {
          throw new Error("formToObjUtils ERROR: Unsupported type '" + typeMatch[2] + "' identified in field name '" + fieldName + "'. Please use one of: " + allowedKinds.join(', '))
        }
      } else {
        return [fieldName, '_']; // if no type specified, use the default generic type
      }
    },

    // Assigns a value within a nested object or array structure using a sequence of keys:
    //
    // setNestedProperty(target, ['field'], val)             // target['field'] = val
    // setNestedProperty(target, ['field', 'nested'], val)   // target['field']['nested'] = val // Creates target['field'] if it doesn't exist
    // setNestedProperty(target, ['field', 'list', '123'], val) // target['field']['list']['123'] = val
    //
    // setNestedProperty(target, ['0'], val)                                   // target['0'] = val
    // setNestedProperty(arr, ['0'], val, {numericKeysAsArrayIndices: true})   // arr[0] = val
    // setNestedProperty(arr, [''], val)                                    // arr.push(val)
    // setNestedProperty(obj, ['list', ''], val)                             // obj['list'].push(val)
    //
    // let myList = [];
    // setNestedProperty(myList, ['', val])             // myList => [val]
    // setNestedProperty(myList, ['', 'prop'], val)     // myList => [val, {prop: val}]
    // setNestedProperty(myList, ['', 'another'], val)  // myList => [val, {prop: val, another: val}]
    // setNestedProperty(myList, ['', 'another'], val)  // myList => [val, {prop: val, another: val}, {another: val}]
    //
    setNestedProperty: function (outputContainer, pathSegments, itemValue, procSettings) {
      var currentKey, nextSegment, restOfPath, finalEntryIdx, recentItem, utilRef;
      if (procSettings == null) procSettings = {};
      utilRef = jq.formToObjUtils;

      if (utilRef.valueIsUndefined(outputContainer)) {
        throw new Error("InitializationError: parameter 'outputContainer' must be an object or array, received undefined");
      }
      if (!pathSegments || pathSegments.length === 0) {
        throw new Error("ConfigurationError: parameter 'pathSegments' must be an array with at least one element");
      }

      currentKey = pathSegments[0];

      // If only one segment, it's a direct assignment, not a nested one.
      if (pathSegments.length === 1) {
        if (currentKey === '') {
          outputContainer.push(itemValue); // Use '' to append items to an array (assuming outputContainer is an array)
        } else {
          outputContainer[currentKey] = itemValue; // Other keys can be property names or array indices
        }

      // For multiple segments, perform a recursive deep assignment.
      } else {
        nextSegment = pathSegments[1];

        // The '' segment is used to append to arrays.
        // If followed by another segment, set the value within the same object at outputContainer[nextSegment].
        // This handles cases like ['', 'prop'] to push {prop: val}, and nested array scenarios.
        if (currentKey === '') {
          finalEntryIdx = outputContainer.length - 1; // Assuming outputContainer is an array
          recentItem = outputContainer[finalEntryIdx];
          if (utilRef.isPlainObject(recentItem) && (utilRef.valueIsUndefined(recentItem[nextSegment]) || pathSegments.length > 2)) {
            currentKey = finalEntryIdx; // Set the new value within the current object element
          } else {
            currentKey = finalEntryIdx + 1; // Otherwise, assign to the next index in the array
          }
        }

        // If the next segment is '', it implies pushing into an array (e.g., "array[]").
        if (nextSegment === '') {
          if (utilRef.valueIsUndefined(outputContainer[currentKey]) || !jq.isArray(outputContainer[currentKey])) {
            outputContainer[currentKey] = []; // Initialize (or overwrite) as an array for pushing
          }
        } else {
          if (procSettings.numericKeysAsArrayIndices && utilRef.looksLikeArrayIndex(nextSegment)) { // If it's a numeric string, treat as array index
            if (utilRef.valueIsUndefined(outputContainer[currentKey]) || !jq.isArray(outputContainer[currentKey])) {
              outputContainer[currentKey] = []; // Initialize (or overwrite) as an array for indexed insertion
            }
          } else { // For any other segment, treat as an object property name
            if (utilRef.valueIsUndefined(outputContainer[currentKey]) || !utilRef.isPlainObject(outputContainer[currentKey])) {
              outputContainer[currentKey] = {}; // Initialize (or overwrite) as an object for nested properties
            }
          }
        }

        // Recursively apply the assignment to the inner structure
        restOfPath = pathSegments.slice(1);
        utilRef.setNestedProperty(outputContainer[currentKey], restOfPath, itemValue, procSettings);
      }
    },

    // Populates the collectedFields array with data for unchecked checkbox inputs,
    // adhering to the structure used by jQuery's serializeArray.
    // The value for unchecked checkboxes is derived from procSettings.uncheckedCheckboxVal
    // or the 'data-unchecked-value' attribute of the input element.
    addMissingCheckboxData: function (collectedFields, targetForm, procSettings) {
      var itemSelector, unmarkedBoxes, currentElement, attrUncheckedVal, utilRef;
      if (procSettings == null) procSettings = {};
      utilRef = jq.formToObjUtils;

      itemSelector = 'input[type=checkbox][name]:not(:checked):not([disabled])';
      unmarkedBoxes = targetForm.find(itemSelector).add(targetForm.filter(itemSelector));
      unmarkedBoxes.each(function (itemIdx, domElement) {
        currentElement = jq(domElement);
        attrUncheckedVal = currentElement.attr('data-unchecked-value');
        if(attrUncheckedVal) { // 'data-unchecked-value' attribute takes priority over the general setting
          collectedFields.push({name: domElement.name, value: attrUncheckedVal});
        } else {
          if (!utilRef.valueIsUndefined(procSettings.uncheckedCheckboxVal)) {
            collectedFields.push({name: domElement.name, value: procSettings.uncheckedCheckboxVal});
          }
        }
      });
    }

  };

}(window.jQuery || window.Zepto || window.$));