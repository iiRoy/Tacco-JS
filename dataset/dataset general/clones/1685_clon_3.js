// This module ensures that the global `JSON` object is available and
// provides polyfills for `JSON.stringify` and `JSON.parse` if they
// are not natively supported in the execution environment.

// Establish a global `JSON` object if it doesn't already exist.
// `globalThis` offers a standardized way to access the global object
// across different JavaScript environments (browsers, Node.js, web workers).
if (typeof globalThis.JSON !== 'object') {
  globalThis.JSON = {};
}

// Export the `JSON` object for CommonJS compatibility.
// This allows modules to `require('json-polyfill')` and get the `JSON` object.
module.exports = globalThis.JSON;

// The core polyfill implementation is encapsulated within an
// Immediately Invoked Function Expression (IIFE) to prevent
// polluting the global scope with internal variables and functions.
(function initializeJsonUtilities() {
  'use strict'; // Enforce strict mode for cleaner and safer JavaScript code.

  // A small helper function to format single-digit numbers with a leading zero.
  // This is primarily utilized in date serialization to maintain consistent formatting.
  const zeroPad = (numToPad) => {
    // If the number is less than 10, prepend a '0'; otherwise, return as is.
    return numToPad < 10 ? `0${numToPad}` : String(numToPad);
  };

  // Check if `Date.prototype.toJSON` is missing or not a function.
  // If so, provide a polyfill for standardized Date object serialization.
  if (typeof Date.prototype.toJSON !== 'function') {
    Date.prototype.toJSON = function dateSerializationMethod() {
      // JSON requires dates to represent finite timestamps.
      // If the date object is invalid (e.g., `new Date('invalid')`), its valueOf()
      // will not be finite, and it should serialize to `null`.
      if (!Number.isFinite(this.valueOf())) {
        return null;
      }

      // Construct the date string in the extended ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ).
      // All date components are retrieved in UTC to ensure timezone-independent serialization.
      const yearComponent = this.getUTCFullYear();
      const monthComponent = zeroPad(this.getUTCMonth() + 1); // Months are 0-indexed.
      const dayComponent = zeroPad(this.getUTCDate());
      const hourComponent = zeroPad(this.getUTCHours());
      const minuteComponent = zeroPad(this.getUTCMinutes());
      const secondComponent = zeroPad(this.getUTCSeconds());

      // Assemble the parts into the final ISO 8601 string.
      return `${yearComponent}-${monthComponent}-${dayComponent}T${hourComponent}:${minuteComponent}:${secondComponent}Z`;
    };

    // For primitive wrapper objects (String, Number, Boolean), their `toJSON`
    // method should simply return their underlying primitive value.
    // This ensures that `new String("hello")` becomes `"hello"` in JSON.
    const getPrimitiveValue = function primitiveValueSerializer() {
      return this.valueOf();
    };
    String.prototype.toJSON = getPrimitiveValue;
    Number.prototype.toJSON = getPrimitiveValue;
    Boolean.prototype.toJSON = getPrimitiveValue;
  }

  // Internal variables used by the `stringify` and `parse` implementations.
  // These are scoped to the IIFE, not global.
  let invalidParseCharsRegex; // Regular expression for identifying disallowed characters during JSON parsing.
  let stringEscapeRegex; // Regular expression for characters needing escaping during JSON stringification.
  let currentFormattingIndent; // The string representing the current level of indentation (e.g., "  ", "\t\t").
  let singleIndentUnit; // The string used for one level of indentation (e.g., "  ", "\t").
  let charToEscapeMap; // A lookup table for common characters and their JSON escape sequences.
  let userDefinedReplacer; // The optional replacer function or array passed to `JSON.stringify`.


  /**
   * Encapsulates a given string within double quotes and escapes any special characters
   * according to JSON string literal rules.
   * @param {string} rawString - The input string to be processed.
   * @returns {string} A valid JSON string literal.
   */
  function formatJsonStringLiteral(rawString) {
    // Reset the regex's lastIndex property to ensure scanning starts from the beginning.
    stringEscapeRegex.lastIndex = 0;

    // Check if the string contains any characters that require escaping.
    if (!stringEscapeRegex.test(rawString)) {
      // If no special characters, simply wrap the string in double quotes.
      return `"${rawString}"`;
    }

    // If special characters are found, replace them with their respective escape sequences.
    return `"${rawString.replace(stringEscapeRegex, (matchedCharacter) => {
      // Attempt to find a direct mapping for the character.
      const mappedSequence = charToEscapeMap[matchedCharacter];
      if (typeof mappedSequence === 'string') {
        return mappedSequence;
      }
      // If no direct mapping, convert the character's code point to a 4-digit
      // hexadecimal Unicode escape sequence (e.g., '\u00A9').
      return `\\u${matchedCharacter.charCodeAt(0).toString(16).padStart(4, '0')}`;
    })}"`;
  }


  /**
   * The recursive core logic for converting a JavaScript value into its JSON string representation.
   * This function handles different data types, including objects, arrays, and primitives.
   * @param {string} propertyKey - The key of the value within its parent object/array (or empty string for the root).
   * @param {object} parentContainer - The object or array that holds the value being serialized.
   * @returns {string|undefined} The JSON string for the value, or `undefined` if the value should be omitted.
   */
  function recursiveJsonSerialization(propertyKey, parentContainer) {
    let currentVal = parentContainer[propertyKey]; // Fetch the value from its container.

    // Step 1: Check for and apply a `toJSON` method if the value is an object (and not null).
    if (currentVal && typeof currentVal === 'object' && typeof currentVal.toJSON === 'function') {
      currentVal = currentVal.toJSON(propertyKey);
    }

    // Step 2: Apply the user-defined replacer function if one is provided.
    if (typeof userDefinedReplacer === 'function') {
      currentVal = userDefinedReplacer.call(parentContainer, propertyKey, currentVal);
    }

    // Now, determine the JSON representation based on the (potentially transformed) `currentVal`'s type.
    switch (typeof currentVal) {
      case 'string':
        return formatJsonStringLiteral(currentVal);

      case 'number':
        // JSON numbers must be finite. `NaN` and `Infinity` values are serialized as "null".
        return Number.isFinite(currentVal) ? String(currentVal) : 'null';

      case 'boolean':
        // Boolean values are directly converted to their string equivalents ("true" or "false").
        return String(currentVal);

      case 'object':
        // Handle `null` first, as `typeof null` also returns 'object'.
        if (currentVal === null) {
          return 'null';
        }

        let serializedParts = []; // Array to collect stringified members/elements.
        const previousIndent = currentFormattingIndent; // Store the indentation level before recursing.
        currentFormattingIndent += singleIndentUnit; // Increase indentation for nested structures.

        // Distinguish between arrays and plain objects.
        if (Array.isArray(currentVal)) {
          // If it's an array, iterate through its elements.
          const arrLength = currentVal.length;
          for (let i = 0; i < arrLength; i++) {
            // Recursively serialize each element. If a value serializes to `undefined`,
            // it's replaced with "null" in arrays as per JSON specification.
            const elementString = recursiveJsonSerialization(String(i), currentVal) ?? 'null';
            serializedParts.push(elementString);
          }

          // Construct the final array string, applying pretty-printing if enabled.
          let arrayResult;
          if (serializedParts.length === 0) {
            arrayResult = '[]';
          } else if (singleIndentUnit) { // If pretty-printing is active.
            arrayResult = `[\n${currentFormattingIndent}${serializedParts.join(`,\n${currentFormattingIndent}`)}\n${previousIndent}]`;
          } else {
            arrayResult = `[${serializedParts.join(',')}]`;
          }
          currentFormattingIndent = previousIndent; // Restore the indentation level.
          return arrayResult;

        } else { // It's a plain object.
          // If a replacer array is provided, iterate over its elements to select properties.
          if (Array.isArray(userDefinedReplacer)) {
            for (const keyToInclude of userDefinedReplacer) {
              if (typeof keyToInclude === 'string') {
                const memberValueStr = recursiveJsonSerialization(keyToInclude, currentVal);
                // Only include properties that serialize to a non-`undefined` value.
                if (memberValueStr !== undefined) {
                  serializedParts.push(`${formatJsonStringLiteral(keyToInclude)}:${singleIndentUnit ? ' ' : ''}${memberValueStr}`);
                }
              }
            }
          } else {
            // Otherwise, iterate over all enumerable own properties of the object.
            for (const objKey in currentVal) {
              // Ensure the property is directly on the object, not from its prototype chain.
              if (Object.prototype.hasOwnProperty.call(currentVal, objKey)) {
                const memberValueStr = recursiveJsonSerialization(objKey, currentVal);
                // Only include properties that serialize to a non-`undefined` value.
                if (memberValueStr !== undefined) {
                  serializedParts.push(`${formatJsonStringLiteral(objKey)}:${singleIndentUnit ? ' ' : ''}${memberValueStr}`);
                }
              }
            }
          }

          // Construct the final object string, applying pretty-printing if enabled.
          let objectResult;
          if (serializedParts.length === 0) {
            objectResult = '{}';
          } else if (singleIndentUnit) { // If pretty-printing is active.
            objectResult = `{\n${currentFormattingIndent}${serializedParts.join(`,\n${currentFormattingIndent}`)}\n${previousIndent}}`;
          } else {
            objectResult = `{${serializedParts.join(',')}}`;
          }
          currentFormattingIndent = previousIndent; // Restore the indentation level.
          return objectResult;
        }

      // `undefined` values, functions, and symbols are explicitly omitted from JSON output.
      // Returning `undefined` signals that this value should not be included in the output.
      case 'undefined':
      case 'function':
      case 'symbol':
        return undefined; // This value will be skipped.
    }
  }

  // Polyfill `JSON.stringify` if it's not natively available.
  if (typeof globalThis.JSON.stringify !== 'function') {
    // Define the regex for characters that must be escaped in JSON strings.
    stringEscapeRegex = /[\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    // Populate the map for common character escape sequences.
    charToEscapeMap = {
      '\b': '\\b', // Backspace
      '\t': '\\t', // Horizontal tab
      '\n': '\\n', // Newline
      '\f': '\\f', // Form feed
      '\r': '\\r', // Carriage return
      '"': '\\"', // Double quote
      '\\': '\\\\' // Backslash
    };

    /**
     * Converts a JavaScript value into a JSON string.
     * @param {*} valueToConvert - The JavaScript value to be serialized.
     * @param {Function|Array<string>} [customReplacer] - An optional function to transform values during serialization,
     *                                                  or an array of property names to whitelist.
     * @param {string|number} [indentationSpace] - Specifies the indentation string for pretty-printing the output.
     * @returns {string|undefined} A JSON string representation of the value, or `undefined` if the value cannot be serialized.
     */
    globalThis.JSON.stringify = function jsonStringifyPolyfill(valueToConvert, customReplacer, indentationSpace) {
      currentFormattingIndent = ''; // Reset the current indentation level for a new stringify call.
      singleIndentUnit = ''; // Reset the base indentation unit.

      // Process the `indentationSpace` argument to enable pretty-printing.
      if (typeof indentationSpace === 'number' && indentationSpace > 0) {
        // If a number, use that many spaces (capped at 10).
        singleIndentUnit = ' '.repeat(Math.min(indentationSpace, 10));
      } else if (typeof indentationSpace === 'string' && indentationSpace.length > 0) {
        // If a string, use it directly as the indent unit.
        singleIndentUnit = indentationSpace;
      }

      // Validate the `customReplacer` argument.
      // According to the JSON specification, an invalid replacer should be ignored.
      if (customReplacer && typeof customReplacer !== 'function' && !Array.isArray(customReplacer)) {
        // Optionally, log a warning for non-standard usage, but proceed by ignoring it.
        if (typeof console !== 'undefined' && console.warn) {
          console.warn('JSON.stringify: The provided replacer is neither a function nor an array. It will be ignored.');
        }
        userDefinedReplacer = undefined; // Effectively ignore the invalid replacer.
      } else {
        userDefinedReplacer = customReplacer;
      }

      // Initiate the recursive serialization process.
      // The input `valueToConvert` is treated as a property of a dummy root object
      // with an empty string key. This allows the recursive function to handle the
      // root value consistently with all other object properties.
      return recursiveJsonSerialization('', {
        '': valueToConvert
      });
    };
  }


  // Polyfill `JSON.parse` if it's not natively available.
  if (typeof globalThis.JSON.parse !== 'function') {
    // Regular expression to detect control characters and other Unicode ranges
    // that are forbidden in JSON strings or could cause issues during parsing.
    invalidParseCharsRegex = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

    /**
     * Parses a JSON string, converting it into a JavaScript value or object.
     * @param {string} jsonText - The JSON string to be parsed.
     * @param {Function} [reviverCallback] - An optional function to transform the parsed values.
     *                                       It is called for each key-value pair in the resulting structure.
     * @returns {*} The JavaScript value or object derived from the JSON string.
     * @throws {SyntaxError} If the provided string is not valid JSON.
     */
    globalThis.JSON.parse = function jsonParsePolyfill(jsonText, reviverCallback) {
      let intermediateParsedValue; // Holds the JavaScript value after initial parsing.

      /**
       * A recursive traversal function that applies the reviver callback to each
       * node (property/element) in the parsed JavaScript structure.
       * @param {object} currentParent - The parent object or array containing `currentKey`.
       * @param {string} currentKey - The key (property name or array index) of the value being processed.
       * @returns {*} The (potentially modified) value after applying the reviver.
       */
      const applyReviverRecursively = (currentParent, currentKey) => {
        const valueAtNode = currentParent[currentKey];

        // If the current value is an object (and not null), recursively process its children.
        if (valueAtNode && typeof valueAtNode === 'object') {
          for (const childKey in valueAtNode) {
            // Ensure we only process own properties, not inherited ones.
            if (Object.prototype.hasOwnProperty.call(valueAtNode, childKey)) {
              const transformedChild = applyReviverRecursively(valueAtNode, childKey);

              // If the reviver returns `undefined` for a property, it should be deleted.
              if (transformedChild !== undefined) {
                valueAtNode[childKey] = transformedChild;
              } else {
                delete valueAtNode[childKey];
              }
            }
          }
        }
        // Finally, apply the reviver function to the current node itself.
        return reviverCallback.call(currentParent, currentKey, valueAtNode);
      };

      // Ensure the input is treated as a string.
      let processedJsonString = String(jsonText);

      // Stage 1: Escape problematic control characters.
      // Characters in JSON must be properly escaped. This step replaces
      // any unescaped, problematic Unicode control characters with their `\uXXXX` form.
      invalidParseCharsRegex.lastIndex = 0; // Reset regex state for a fresh search.
      if (invalidParseCharsRegex.test(processedJsonString)) {
        processedJsonString = processedJsonString.replace(invalidParseCharsRegex, (charFound) => {
          return `\\u${charFound.charCodeAt(0).toString(16).padStart(4, '0')}`;
        });
      }

      // Stage 2: Validate the JSON string structure using a sequence of regular expressions.
      // This is a critical security step to prevent the execution of arbitrary code
      // by ensuring that the string conforms strictly to JSON syntax.
      // The approach involves replacing valid JSON components with placeholders and
      // then checking if only structural characters and whitespace remain.

      // Replace all valid JSON escape sequences with a placeholder '@'.
      const intermediateString1 = processedJsonString.replace(/\\(?:["\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@');
      // Replace string literals, numbers, booleans, and null with a placeholder ']'.
      const intermediateString2 = intermediateString1.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']');
      // Remove array opening brackets that follow a colon or comma, or that start the text.
      const intermediateString3 = intermediateString2.replace(/(?:^|:|,)(?:\s*\[)+/g, '');

      // Final validation: Check if the string, after all replacements, consists
      // only of valid JSON structural characters (whitespace, ']', ',', ':', '{', '}') and placeholders.
      if (/^[\],:{}\s]*$/.test(intermediateString3)) {
        // Stage 3: Use the `Function` constructor to parse the validated JSON string.
        // Wrapping the string in parentheses `()` is necessary to resolve ambiguity
        // when the JSON starts with an object literal (`{}`).
        try {
          // `new Function` is used here instead of direct `eval` for a slight
          // sandboxing benefit (it executes in its own scope), though it's still
          // essentially dynamic code execution.
          intermediateParsedValue = new Function(`return (${processedJsonString})`)();
        } catch (e) {
          // Catch and re-throw with a more specific error message if parsing fails.
          throw new SyntaxError(`JSON.parse: Malformed JSON string detected during evaluation: ${e.message}`);
        }

        // Stage 4: Apply the optional reviver function if provided.
        // If a reviver callback is given, traverse the newly parsed JavaScript structure.
        return typeof reviverCallback === 'function' ?
          applyReviverRecursively({
            '': intermediateParsedValue
          }, '') :
          intermediateParsedValue;
      }

      // If the regex validation fails, the input string is not considered valid JSON.
      throw new SyntaxError('JSON.parse: The provided string is not a valid JSON format. Check for structural errors or disallowed content.');
    };
  }
}());