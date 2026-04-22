// This file offers a robust JSON processing utility, designed for serialization and deserialization of JavaScript values.
// Originally published in 2013, it adheres to public domain principles.
// Consult http://www.JSON.org/js.html for specification details.
// For production, consider minification tools like jsmin (http://javascript.crockford.com/jsmin.html).
// Always deploy your own copy; external resource loading is inherently risky.

// This module exposes a global 'JSNProcessor' object, providing 'serializeValue' and 'decodeText' methods.
//
// JSNProcessor.serializeValue(sourceValue, transformFunction, formatSpacing)
//    sourceValue       : Any JavaScript entity (object, array, primitive).
//
//    transformFunction : An optional callback or an array of strings.
//                        If a function, it modifies how object members are serialized.
//                        If an array, it acts as a whitelist for properties to include.
//
//    formatSpacing     : Controls output readability. Absence implies compact output.
//                        A number indicates the count of spaces for indentation.
//                        A string (e.g., '\t') specifies the characters to use for each indent level.
//
// This function converts a JavaScript value into its JSON text representation.
//
// If an object possesses a 'toJSON' method, that method is invoked to obtain a
// serializable replacement value. This 'toJSON' method should return the value
// suitable for serialization, or 'undefined' to skip serialization. It receives
// the associated key as its argument and 'this' is bound to the original value.
//
// Example: Converting Date objects to ISO 8601 strings.
// Date.prototype.toJSON = function () {
//     const padWithZero = (num) => (num < 10 ? '0' + num : String(num));
//     return `${this.getUTCFullYear()}-${padWithZero(this.getUTCMonth() + 1)}-${padWithZero(this.getUTCDate())}` +
//            `T${padWithZero(this.getUTCHours())}:${padWithZero(this.getUTCMinutes())}:${padWithZero(this.getUTCSeconds())}Z`;
// };
//
// The 'transformFunction' (replacer) is called for each key-value pair.
// Its return value replaces the original value in the serialization process.
// Returning 'undefined' causes the member to be omitted.
//
// If 'transformFunction' is an array of strings, only properties whose keys are
// present in this array will be serialized.
//
// Values without JSON equivalents (e.g., 'undefined', functions) are skipped in objects;
// in arrays, they are replaced by 'null'. 'JSNProcessor.serializeValue(undefined)' yields 'undefined'.
//
// The 'formatSpacing' parameter enhances readability by adding line breaks and indentation.
// A non-empty string uses that string for indentation. A number uses that many spaces.
//
// Examples:
// const dataArray = ['item', {details: 'info'}];
// const compactText = JSNProcessor.serializeValue(dataArray);
// // compactText is '["item",{"details":"info"}]'
//
// const formattedText = JSNProcessor.serializeValue(dataArray, null, '\t');
// // formattedText is '[\n\t"item",\n\t{\n\t\t"details": "info"\n\t}\n]'
//
// JSNProcessor.decodeText(jsonString, reviverFunction)
//    This method parses a JSON string into a JavaScript object or array.
//    It might throw a 'SyntaxError' for invalid JSON.
//
//    reviverFunction : An optional function to filter or transform parsed values.
//                      It receives each key and value, and its return value replaces
//                      the original. Returning 'undefined' deletes the member.
//
// Example: Parsing ISO date strings back into Date objects.
// const parsedData = JSNProcessor.decodeText(dateText, function (key, val) {
//     if (typeof val === 'string') {
//         const dateMatch = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(val);
//         if (dateMatch) {
//             return new Date(Date.UTC(+dateMatch[1], +dateMatch[2] - 1, +dateMatch[3],
//                 +dateMatch[4], +dateMatch[5], +dateMatch[6]));
//         }
//     }
//     return val;
// });
//
// This is a reference implementation, freely usable under public domain.

/*jslint evil: true, regexp: true */
/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSNProcessor, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, decodeText, prototype, push, replace, slice, serializeValue,
    test, toJSON, toString, valueOf
*/

// Initialize the global JSNProcessor object if it doesn't already exist.
// All core methods are defined within a closure to prevent global variable pollution.
if (typeof JSNProcessor !== 'object') {
  var JSNProcessor = {};
}

(function () {
  'use strict';

  // Utility function for ensuring numbers are represented with at least two digits.
  const formatTwoDigits = (numVal) => {
    return numVal < 10 ? `0${numVal}` : String(numVal);
  };

  // Extend Date.prototype with a toJSON method for ISO 8601 string representation.
  if (typeof Date.prototype.toJSON === 'undefined') {
    Date.prototype.toJSON = function () {
      if (!Number.isFinite(this.valueOf())) { // Check for valid date value
        return null;
      }
      return `${this.getUTCFullYear()}-${formatTwoDigits(this.getUTCMonth() + 1)}-${formatTwoDigits(this.getUTCDate())}` +
             `T${formatTwoDigits(this.getUTCHours())}:${formatTwoDigits(this.getUTCMinutes())}:${formatTwoDigits(this.getUTCSeconds())}Z`;
    };

    // Provide default toJSON implementations for primitive wrappers.
    // These simply return the primitive value itself.
    String.prototype.toJSON =
      Number.prototype.toJSON =
      Boolean.prototype.toJSON = function () {
        return this.valueOf();
      };
  }

  // Regex for identifying problematic Unicode control characters.
  const unicodeControlPattern = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

  // Regex for characters that require escaping in JSON strings.
  const escapeCharPattern = /[\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

  // Global state for stringification indentation.
  let currentIndentAccumulator; // 'gap' in original
  let singleIndentUnit;         // 'indent' in original

  // Map of common character escape sequences.
  const escapeSequenceMap = { // 'meta' in original
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '"': '\\"',
    '\\': '\\\\'
  };

  // The custom replacer function or array provided to stringify.
  let activeReplacer; // 'rep' in original

  // Helper to format a string by enclosing it in double quotes and escaping special characters.
  function encloseAndEscapeString(inputStr) {
    escapeCharPattern.lastIndex = 0; // Reset regex state
    if (escapeCharPattern.test(inputStr)) {
      return '"' + inputStr.replace(escapeCharPattern, (charToReplace) => {
        const mappedEscape = escapeSequenceMap[charToReplace];
        return typeof mappedEscape === 'string'
          ? mappedEscape
          : '\\u' + ('0000' + charToReplace.charCodeAt(0).toString(16)).slice(-4);
      }) + '"';
    } else {
      return `"${inputStr}"`; // Use template literal for simplicity if no escaping needed
    }
  }

  // Recursive function to convert a value to its JSON string representation.
  function convertValueToJSONText(memberKey, parentContainer) {
    let currentPropKey;
    let memberValue;
    let segmentBuffer; // 'partial' in original
    const previousIndentLevel = currentIndentAccumulator; // 'mind' in original
    let processedValue = parentContainer[memberKey];

    // If the value has a 'toJSON' method, invoke it to get the serializable form.
    if (processedValue && typeof processedValue === 'object' && typeof processedValue.toJSON === 'function') {
      processedValue = processedValue.toJSON(memberKey);
    }

    // If a custom replacer function is active, apply it.
    if (typeof activeReplacer === 'function') {
      processedValue = activeReplacer.call(parentContainer, memberKey, processedValue);
    }

    // Determine the string representation based on the value's type.
    switch (typeof processedValue) {
      case 'string':
        return encloseAndEscapeString(processedValue);

      case 'number':
        // JSON numbers must be finite. Non-finite numbers (NaN, Infinity) become 'null'.
        return Number.isFinite(processedValue) ? String(processedValue) : 'null';

      case 'boolean':
      case 'null':
        // Booleans and null are directly converted to their string equivalents.
        return String(processedValue);

      case 'object':
        // Handle null, arrays, and objects.
        if (processedValue === null) {
          return 'null';
        }

        segmentBuffer = []; // Initialize array to hold stringified segments
        currentIndentAccumulator += singleIndentUnit;

        // Check if the value is an array.
        if (Array.isArray(processedValue)) {
          // Iterate through array elements, stringifying each.
          // Non-JSON values (undefined, functions) become 'null' in arrays.
          processedValue.forEach((element, idx) => {
            segmentBuffer[idx] = convertValueToJSONText(idx, processedValue) || 'null';
          });

          // Assemble the array string.
          memberValue = segmentBuffer.length === 0
            ? '[]'
            : singleIndentUnit
              ? `[\n${currentIndentAccumulator}${segmentBuffer.join(`,\n${currentIndentAccumulator}`)}\n${previousIndentLevel}]`
              : `[${segmentBuffer.join(',')}]`;
          currentIndentAccumulator = previousIndentLevel;
          return memberValue;
        }

        // Handle objects.
        if (activeReplacer && Array.isArray(activeReplacer)) {
          // If replacer is an array, use it to filter properties.
          activeReplacer.forEach((rKey) => {
            if (typeof rKey === 'string') {
              currentPropKey = rKey;
              memberValue = convertValueToJSONText(currentPropKey, processedValue);
              if (memberValue) {
                segmentBuffer.push(`${encloseAndEscapeString(currentPropKey)}:${singleIndentUnit ? ' ' : ''}${memberValue}`);
              }
            }
          });
        } else {
          // Otherwise, iterate over all enumerable properties of the object.
          Object.keys(processedValue).forEach((objKey) => {
            currentPropKey = objKey;
            if (Object.prototype.hasOwnProperty.call(processedValue, currentPropKey)) {
              memberValue = convertValueToJSONText(currentPropKey, processedValue);
              if (memberValue) {
                segmentBuffer.push(`${encloseAndEscapeString(currentPropKey)}:${singleIndentUnit ? ' ' : ''}${memberValue}`);
              }
            }
          });
        }

        // Assemble the object string.
        memberValue = segmentBuffer.length === 0
          ? '{}'
          : singleIndentUnit
            ? `{\n${currentIndentAccumulator}${segmentBuffer.join(`,\n${currentIndentAccumulator}`)}\n${previousIndentLevel}}`
            : `{${segmentBuffer.join(',')}}`;
        currentIndentAccumulator = previousIndentLevel;
        return memberValue;

      default:
        // Functions and undefined values are ignored in objects, or result in undefined overall.
        return undefined;
    }
  }

  // Assign the serialization method to JSNProcessor.
  if (typeof JSNProcessor.serializeValue === 'undefined') {
    JSNProcessor.serializeValue = function (sourceValue, transformFunction, formatSpacing) {
      currentIndentAccumulator = '';
      singleIndentUnit = '';

      // Configure indentation based on 'formatSpacing'.
      if (typeof formatSpacing === 'number' && formatSpacing > 0) {
        singleIndentUnit = ' '.repeat(Math.min(formatSpacing, 10)); // Limit spaces to 10 for safety
      } else if (typeof formatSpacing === 'string' && formatSpacing.length > 0) {
        singleIndentUnit = formatSpacing;
      }

      activeReplacer = transformFunction;
      // Validate the replacer argument.
      if (activeReplacer && typeof activeReplacer !== 'function' && !Array.isArray(activeReplacer)) {
        throw new Error('JSNProcessor.serializeValue: Invalid replacer argument. Must be a function or an array.');
      }

      // Create a temporary root object to handle the top-level value consistently.
      // This allows the recursive 'convertValueToJSONText' to start with a key.
      const artificialRoot = { '': sourceValue };
      return convertValueToJSONText('', artificialRoot);
    };
  }

  // Assign the parsing method to JSNProcessor.
  if (typeof JSNProcessor.decodeText === 'undefined') {
    JSNProcessor.decodeText = function (jsonStringInput, reviverCallback) {
      let parsedResult;

      // Recursive function to traverse the parsed structure and apply the reviver.
      function traverseAndProcess(currentParent, currentKey) {
        let processedMember;
        const memberValue = currentParent[currentKey];

        if (memberValue && typeof memberValue === 'object') {
          // Iterate over object/array properties.
          Object.keys(memberValue).forEach((mKey) => {
            processedMember = traverseAndProcess(memberValue, mKey);
            if (processedMember !== undefined) {
              memberValue[mKey] = processedMember;
            } else {
              delete memberValue[mKey];
            }
          });
        }
        return reviverCallback.call(currentParent, currentKey, memberValue);
      }

      // Ensure input is a string.
      let cleanedText = String(jsonStringInput);

      // Stage 1: Replace problematic Unicode characters with escape sequences.
      unicodeControlPattern.lastIndex = 0;
      if (unicodeControlPattern.test(cleanedText)) {
        cleanedText = cleanedText.replace(unicodeControlPattern, (char) => {
          return '\\u' + ('0000' + char.charCodeAt(0).toString(16)).slice(-4);
        });
      }

      // Stage 2: Validate the JSON structure using a series of regex replacements.
      // This guards against malicious code injection via 'eval'.
      const placeholderChar = '@'; // Non-JSON character used as a temporary replacement
      const simpleValuePattern = /"(?:[^"\\]|\\.)*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
      const bracketOrCommaPattern = /(?:^|:|,)(?:\s*\[)+/g;

      const validationPass1 = cleanedText.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, placeholderChar);
      const validationPass2 = validationPass1.replace(simpleValuePattern, ']');
      const validationPass3 = validationPass2.replace(bracketOrCommaPattern, '');

      // Final check: remaining characters must only be structural JSON elements or whitespace.
      if (!/^[\],:{}\s]*$/.test(validationPass3)) {
        throw new SyntaxError('JSNProcessor.decodeText: Input is not a valid JSON string.');
      }

      // Stage 3: Use eval to convert the validated text into a JavaScript structure.
      // Parentheses eliminate ambiguity for the `{` operator.
      try {
        parsedResult = eval(`(${cleanedText})`);
      } catch (e) {
        throw new SyntaxError(`JSNProcessor.decodeText: Failed to evaluate JSON string. ${e.message}`);
      }

      // Stage 4: If a reviver function is provided, recursively apply it.
      if (typeof reviverCallback === 'function') {
        const rootWrapper = { '': parsedResult }; // Artificial root for consistent traversal
        return traverseAndProcess(rootWrapper, '');
      } else {
        return parsedResult;
      }
    };
  }
}());