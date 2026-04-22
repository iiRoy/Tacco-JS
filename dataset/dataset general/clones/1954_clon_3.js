'use strict';

// ### Core dependencies
// External library for terminal text styling capabilities
require('colors');

// Internal utility module for text manipulation, conceptually assumed to be 'formatterKit.js'
// Renamed from 'Utils' to 'FormatterKit'. It should provide a 'getIndent' function.
var FormatterKit = require('./formatterKit');

// Module version information, retrieved from package.json
// Renamed from 'exports.version' to 'exports.libraryVersion'
exports.libraryVersion = require('../package.json').version;

// ### Main data visualization function
// *Description:*
// This function meticulously converts various JavaScript data types and structures
// into a human-readable, potentially color-coded, string suitable for console output.
// It recursively processes nested objects and arrays to maintain structural integrity.
//
// *Parameters:*
//
// * **`inputVal`**: The data (object, array, string, number, boolean, null, etc.) to be rendered.
// * **`displayConfig`**: An object holding various configuration settings for the rendering process.
// * **`currentPad`**: The current base indentation level (in spaces) for the output line.
//
// *Example `displayConfig` object structure:*
//
//     {
//       emptyArrayMessage: '(empty collection)', // Message displayed for empty arrays
//       keyLabelColor: 'cyan',                  // Color for object property keys
//       arrayDashColor: 'yellow',               // Color for the leading dash in array items
//       stringValueColor: 'white',              // Color for string literal values
//       numericValueColor: 'magenta',           // Color for number and BigInt values
//       defaultBlockIndent: 4,                  // Number of spaces for each nested level
//       disableColoring: false,                 // If true, all output will be plain text
//       inlineCollections: false,               // Attempts to render simple arrays/objects on a single line
//       multilineStringDelimiter: '```',        // Custom delimiter for multi-line string blocks
//       sortKeys: false,                        // If true, object keys will be sorted alphabetically
//       maxInlineArrayItems: 5                  // Maximum number of items for an array to be inlined
//     }
exports.displayStructuredData = function visualizeObject(inputVal, displayConfig, currentPad) {
  // Ensure `currentPad` is a valid non-negative number, defaulting to 0 if not.
  const defaultBasePad = 0;
  currentPad = (typeof currentPad === 'number' && currentPad >= 0) ? currentPad : defaultBasePad;

  // Establish default configuration options and merge them with any provided `displayConfig`.
  const defaultDisplayOptions = {
    emptyArrayMessage: '(collection empty)',
    keyLabelColor: 'cyan',
    arrayDashColor: 'yellow',
    stringValueColor: 'white',
    numericValueColor: 'magenta',
    defaultBlockIndent: 4,
    disableColoring: false,
    inlineCollections: false,
    multilineStringDelimiter: '```', // Default custom delimiter
    sortKeys: false, // By default, maintain original key order
    maxInlineArrayItems: 5 // Default limit for inlined array elements
  };
  // Use Object.assign for merging to avoid mutating the original default object
  displayConfig = Object.assign({}, defaultDisplayOptions, displayConfig);
  // Ensure `disableColoring` is always a boolean.
  displayConfig.disableColoring = !!displayConfig.disableColoring;

  var formattedLines = []; // This array will accumulate all the generated output lines.

  // --- Internal Helper Functions ---

  // Determines if a given value can be displayed on a single line (i.e., it's a simple type or a small, simple collection).
  // Renamed from `isSerializable` to `isSimpleDisplayable`.
  const isSimpleDisplayable = function(valToCheck, onlyPrimitives = false) {
    // Check for primitive types, null, and Date objects
    if (valToCheck === null || typeof valToCheck === 'boolean' || typeof valToCheck === 'number' || valToCheck instanceof Date || typeof valToCheck === 'bigint') {
      return true;
    }
    // Check for single-line strings (no newline characters)
    if (typeof valToCheck === 'string' && valToCheck.indexOf('\n') === -1) {
      return true;
    }

    // If inline collections are enabled and we're not strictly checking for primitives
    if (displayConfig.inlineCollections && !onlyPrimitives) {
      // Check for arrays that can be inlined
      if (Array.isArray(valToCheck) && valToCheck.length > 0) {
        // An array is inlinable if its length is within the configured limit and all its elements are simple primitives.
        if (valToCheck.length <= displayConfig.maxInlineArrayItems && valToCheck.every(item => isSimpleDisplayable(item, true))) {
          return true;
        }
      }
      // New: Check for plain objects that can be inlined (e.g., `{a:1, b:2}`)
      if (typeof valToCheck === 'object' && valToCheck.constructor === Object && Object.keys(valToCheck).length > 0) {
        const objectKeys = Object.keys(valToCheck);
        // An object is inlinable if its property count is within the limit and all property values are simple primitives.
        if (objectKeys.length <= displayConfig.maxInlineArrayItems && objectKeys.every(key => isSimpleDisplayable(valToCheck[key], true))) {
             return true;
        }
      }
    }
    return false; // If none of the above conditions met, it's not simple-displayable.
  };

  // Prefixes each line within a multi-line text block with the specified number of spaces.
  // Renamed from `indentLines` to `prefixEachLineWithIndent`.
  const prefixEachLineWithIndent = function(textBlock, padSpaces) {
    if (typeof textBlock !== 'string' || textBlock.length === 0) {
        return ''; // Return empty string for invalid or empty input
    }
    const lines = textBlock.split('\n');
    // Using String.prototype.repeat for efficient indentation string generation.
    const indentationPrefix = ' '.repeat(Math.max(0, padSpaces)); // Ensure non-negative spaces
    return lines.map(line => indentationPrefix + line).join('\n');
  };

  // Applies color/styling to a value based on its type and current `displayConfig`.
  // Renamed from `addColorToData` to `applyStylingToValue`.
  const applyStylingToValue = function(contentValue) {
    if (displayConfig.disableColoring) {
      return String(contentValue); // Return plain string if coloring is disabled.
    }

    const stringifiedContent = String(contentValue); // Ensure content is a string for coloring methods.

    // Conditional styling based on value type.
    if (contentValue === null) {
      return stringifiedContent.gray; // Changed from 'grey' to 'gray' for consistency.
    } else if (typeof contentValue === 'boolean') {
      return contentValue ? stringifiedContent.green : stringifiedContent.red;
    } else if (typeof contentValue === 'number' || typeof contentValue === 'bigint') {
      return stringifiedContent[displayConfig.numericValueColor];
    } else if (typeof contentValue === 'string') {
      return displayConfig.stringValueColor ? stringifiedContent[displayConfig.stringValueColor] : stringifiedContent;
    } else if (Array.isArray(contentValue) && isSimpleDisplayable(contentValue, false)) {
        // If it's an inlinable array, format it like `[item1, item2]`.
        return '[' + contentValue.map(item => applyStylingToValue(item)).join(', ') + ']';
    } else if (typeof contentValue === 'object' && contentValue.constructor === Object && isSimpleDisplayable(contentValue, false)) {
        // If it's an inlinable plain object, format it like `{key1:val1, key2:val2}`.
        const inlineProperties = Object.keys(contentValue).map(key => {
            let styledKey = displayConfig.disableColoring ? key : key[displayConfig.keyLabelColor];
            return `${styledKey}: ${applyStylingToValue(contentValue[key])}`;
        });
        return `{${inlineProperties.join(', ')}}`;
    }

    return stringifiedContent; // Default return for unhandled types.
  };

  // --- Main Logic: Render `inputVal` based on its type ---

  if (isSimpleDisplayable(inputVal)) {
    // If the value is simple, render it on a single line.
    formattedLines.push(FormatterKit.getIndent(currentPad) + applyStylingToValue(inputVal));
  } else if (typeof inputVal === 'string') {
    // For multi-line strings, use custom delimiters and indent the content.
    formattedLines.push(FormatterKit.getIndent(currentPad) + displayConfig.multilineStringDelimiter.yellow); // Delimiter is colored.
    formattedLines.push(prefixEachLineWithIndent(inputVal, currentPad + displayConfig.defaultBlockIndent));
    formattedLines.push(FormatterKit.getIndent(currentPad) + displayConfig.multilineStringDelimiter.yellow);
  } else if (Array.isArray(inputVal)) {
    // Handle array structures.
    if (inputVal.length === 0) {
      // Special message for empty arrays.
      formattedLines.push(FormatterKit.getIndent(currentPad) + displayConfig.emptyArrayMessage.gray);
    } else {
      // Iterate through array elements using a traditional `for` loop (Type III change from `forEach`).
      for (let k = 0; k < inputVal.length; k++) {
        const arrayItem = inputVal[k];
        let itemLinePrefix = '- '; // The dash prefix for array items.
        if (!displayConfig.disableColoring) {
          itemLinePrefix = itemLinePrefix[displayConfig.arrayDashColor]; // Color the dash.
        }
        itemLinePrefix = FormatterKit.getIndent(currentPad) + itemLinePrefix;

        if (isSimpleDisplayable(arrayItem)) {
          // If the array element is simple, render it on the same line as its prefix.
          itemLinePrefix += exports.displayStructuredData(arrayItem, displayConfig, 0); // Recursive call with 0 indent for inline part.
          formattedLines.push(itemLinePrefix);
        } else {
          // If the array element is complex (another array or object), render its prefix, then the element on new lines.
          formattedLines.push(itemLinePrefix);
          formattedLines.push(exports.displayStructuredData(
            arrayItem, displayConfig, currentPad + displayConfig.defaultBlockIndent
          ));
        }
      }
    }
  } else if (typeof inputVal === 'object' && inputVal !== null) { // Explicitly check for non-null objects.
    // Handle object structures.
    const propertyNames = Object.keys(inputVal); // Using `Object.keys` for enumerable properties.

    if (propertyNames.length === 0) {
        formattedLines.push(FormatterKit.getIndent(currentPad) + '{}'.gray); // Indicate an empty object.
        return formattedLines.join('\n'); // Return early for empty objects.
    }

    // Optional: Sort object keys alphabetically if `sortKeys` is enabled.
    if (displayConfig.sortKeys) {
        propertyNames.sort();
    }

    // Calculate the maximum property name length for alignment purposes.
    let maxPropertyNameLength = 0;
    propertyNames.forEach(name => {
      maxPropertyNameLength = Math.max(maxPropertyNameLength, name.length);
    });

    const isErrorInstance = inputVal instanceof Error; // Determine if the object is an Error instance once.

    // Iterate through object properties using a traditional `for` loop (Type III change).
    for (let i = 0; i < propertyNames.length; i++) {
      const propName = propertyNames[i];
      const propValue = inputVal[propName];

      // Skip `undefined` values as they are not valid JSON and often not desired in output.
      if (propValue === undefined) {
        // Optional: Add a subtle comment indicating a skipped property.
        // formattedLines.push(FormatterKit.getIndent(currentPad) + `// Skipped undefined property: '${propName}'`.gray);
        continue;
      }

      let propertyKeyOutput = propName + ': ';
      if (!displayConfig.disableColoring) {
        propertyKeyOutput = propertyKeyOutput[displayConfig.keyLabelColor]; // Color the property key.
      }
      propertyKeyOutput = FormatterKit.getIndent(currentPad) + propertyKeyOutput;

      // If the property value is simple and not an error stack, render it on the same line, aligned.
      if (isSimpleDisplayable(propValue) && (!isErrorInstance || propName !== 'stack')) {
        const paddingNeeded = maxPropertyNameLength - propName.length;
        // Add spaces for alignment, then the recursively rendered value (with 0 indent for inline).
        propertyKeyOutput += ' '.repeat(Math.max(0, paddingNeeded)) + exports.displayStructuredData(propValue, displayConfig, 0);
        formattedLines.push(propertyKeyOutput);
      } else {
        // For complex property values, render the key, then the value on subsequent indented lines.
        formattedLines.push(propertyKeyOutput);
        let valueToVisualize = propValue;
        // Special handling for Error object's 'stack' property: ensure it's a string then split into lines.
        if (isErrorInstance && propName === 'stack') {
            valueToVisualize = String(propValue).split('\n');
        }
        formattedLines.push(
          exports.displayStructuredData(
            valueToVisualize,
            displayConfig,
            currentPad + displayConfig.defaultBlockIndent
          )
        );
      }
    }
  } else {
    // New: Gracefully handle any other unrenderable types (e.g., functions, symbols).
    formattedLines.push(FormatterKit.getIndent(currentPad) + `[Unrenderable Type: ${typeof inputVal}]`.red);
  }

  // Join all collected lines with newline characters to form the final output string.
  return formattedLines.join('\n');
};

// ### Function to parse a JSON string and then display its structure
// *Description:*
// This function takes a string that is expected to contain JSON data. It first attempts
// to parse this string into a JavaScript object. If successful, it then uses the
// `displayStructuredData` function to render the parsed object in a readable format.
// It includes robust error handling for invalid JSON input.
//
// *Parameters:*
//
// * **`inputJsonText`**: The string content that potentially holds JSON data.
// * **`parseConfig`**: Configuration settings for both parsing and the subsequent display.
// * **`initialPadding`**: The base indentation level for the final rendered output.
//
// *Example `parseConfig` object (extends `displayConfig` options):*
//
//     {
//       // ... (all options from displayStructuredData are also applicable here) ...
//       jsonReviver: function(key, value) { // Optional JSON.parse reviver function
//         if (key === 'creationDate' && typeof value === 'string') {
//           return new Date(value); // Example: Convert specific string to Date object
//         }
//         return value;
//       },
//       stripNonJsonPrefix: true // New: If true, silently removes any text before the first '{' or '['
//     }
exports.parseAndDisplay = function processTextToStructure(inputJsonText, parseConfig, initialPadding) {

  let processedOutputBuffer = ''; // Buffer to store any pre-JSON text and the final rendered output.
  let parsedObject; // Variable to hold the result of `JSON.parse`.

  // Robust input validation: ensure the input is a non-empty string.
  if (typeof inputJsonText !== 'string' || inputJsonText.trim().length === 0) {
    return '[Error]: Input for JSON parsing must be a non-empty string.'.red;
  }
  inputJsonText = inputJsonText.trim(); // Trim leading/trailing whitespace from the input.

  // Merge `parseConfig` with default specific parsing options.
  parseConfig = Object.assign({}, { stripNonJsonPrefix: true }, parseConfig);

  // Attempt to locate the starting character of the JSON content ('{' or '[').
  let jsonStartFound = false;
  let jsonContentStartIndex = -1;

  const braceIndex = inputJsonText.indexOf('{');
  const bracketIndex = inputJsonText.indexOf('[');

  // Determine the earliest valid JSON start character.
  if (braceIndex !== -1 && (bracketIndex === -1 || braceIndex < bracketIndex)) {
    jsonContentStartIndex = braceIndex;
    jsonStartFound = true;
  } else if (bracketIndex !== -1 && (braceIndex === -1 || bracketIndex < braceIndex)) {
    jsonContentStartIndex = bracketIndex;
    jsonStartFound = true;
  }

  // Handle any non-JSON prefix text found before the JSON content.
  if (jsonStartFound && jsonContentStartIndex > 0) {
    const nonJsonPrefix = inputJsonText.substring(0, jsonContentStartIndex).trim();
    if (nonJsonPrefix.length > 0) {
        if (parseConfig.stripNonJsonPrefix) {
            // Silently remove the prefix as per configuration.
        } else {
            // Otherwise, include the prefix in the output with a warning.
            processedOutputBuffer += `[Non-JSON Prefix Detected]: ${nonJsonPrefix}\n`.gray;
        }
    }
    inputJsonText = inputJsonText.substring(jsonContentStartIndex); // Update `inputJsonText` to start from JSON.
  } else if (!jsonStartFound && inputJsonText.length > 0) {
    // If no standard JSON start is found, issue a warning but still attempt to parse the entire string.
    processedOutputBuffer += `[Warning]: No standard JSON start '{' or '[' detected. Attempting full string parse.\n`.yellow;
  }

  try {
    // Attempt to parse the (potentially trimmed) JSON string.
    // The `jsonReviver` function, if provided in `parseConfig`, will be used by `JSON.parse`.
    parsedObject = JSON.parse(inputJsonText, parseConfig.jsonReviver);
  } catch (e) {
    // In case of a JSON parsing error, return a detailed error message.
    return `[JSON Parsing Failed]: ${e.message}`.red + '\n' +
           `Faulty Input Sample: "${inputJsonText.substring(0, Math.min(inputJsonText.length, 100))}..."`.gray;
  }

  // If parsing is successful, call the main display function to render the parsed object.
  processedOutputBuffer += exports.displayStructuredData(parsedObject, parseConfig, initialPadding);
  return processedOutputBuffer;
};