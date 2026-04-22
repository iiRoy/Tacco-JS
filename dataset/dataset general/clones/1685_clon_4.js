if (typeof globalThis.JSN_UTIL === 'undefined') {
  globalThis.JSN_UTIL = {};
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = globalThis.JSN_UTIL;
}

(function() {
  'use strict';

  // Helper for date formatting, ensures two digits (e.g., 5 -> "05")
  const formatTwoDigits = (num) => (num < 10 ? '0' + num : '' + num);

  // Character escaping logic for string values
  // Divergent strategy: manual iteration with a map and conditional checks
  const charEscapeMap = new Map([
    ['\b', '\\b'],
    ['\t', '\\t'],
    ['\n', '\\n'],
    ['\f', '\\f'],
    ['\r', '\\r'],
    ['"', '\\"'],
    ['\\', '\\\\']
  ]);

  const escapeAndQuoteString = (inputStr) => {
    let resultParts = ['"']; // Start with opening quote
    for (let charIndex = 0; charIndex < inputStr.length; charIndex++) {
      const char = inputStr[charIndex];
      const charCode = char.charCodeAt(0);

      if (charEscapeMap.has(char)) {
        resultParts.push(charEscapeMap.get(char));
      } else if (
        (charCode >= 0x00 && charCode <= 0x1f) || // Control characters
        (charCode >= 0x7f && charCode <= 0x9f) || // Delete and C1 controls
        charCode === 0xad || // Soft hyphen
        (charCode >= 0x600 && charCode <= 0x604) || // Arabic/Syriac controls
        charCode === 0x70f || // Syriac Abbreviation Mark
        (charCode >= 0x17b4 && charCode <= 0x17b5) || // Khmer Vowel Inherent
        (charCode >= 0x200c && charCode <= 0x200f) || // Zero Width Joiner/Non-Joiner
        (charCode >= 0x2028 && charCode <= 0x202f) || // Line/Paragraph Separator
        (charCode >= 0x2060 && charCode <= 0x206f) || // Invisible math operators
        charCode === 0xfeff || // Byte Order Mark
        (charCode >= 0xfff0 && charCode <= 0xffff) // Specials, private use
      ) {
        resultParts.push('\\u' + ('0000' + charCode.toString(16)).slice(-4));
      } else {
        resultParts.push(char);
      }
    }
    resultParts.push('"'); // End with closing quote
    return resultParts.join('');
  };

  // Internal state for serialization settings (equivalent to original's gap, indent, rep)
  let currentIndentationPrefix = '';
  let singleIndentationUnit = '';
  let serializationReplacer = null;

  // Recursive serialization function (equivalent to original's str)
  const processValueForSerialization = (currentKey, dataContainer) => {
    let entityValue = dataContainer[currentKey];

    // Check for a custom `toJSON` method on the value itself
    if (entityValue && typeof entityValue === 'object' && typeof entityValue.toJSON === 'function') {
      entityValue = entityValue.toJSON(currentKey);
    }

    // Apply the custom replacer function if provided
    if (typeof serializationReplacer === 'function') {
      entityValue = serializationReplacer.call(dataContainer, currentKey, entityValue);
    }

    // Determine serialization based on type
    const typeOfValue = typeof entityValue;

    if (typeOfValue === 'string') {
      return escapeAndQuoteString(entityValue);
    }

    if (typeOfValue === 'number') {
      return isFinite(entityValue) ? String(entityValue) : 'null';
    }

    if (typeOfValue === 'boolean') {
      return String(entityValue);
    }

    if (typeOfValue === 'object') {
      if (entityValue === null) {
        return 'null';
      }

      // Handle Date objects specifically, mimicking ISO 8601 format
      if (entityValue instanceof Date) {
        return isFinite(entityValue.valueOf()) ?
          `"${entityValue.getUTCFullYear()}-${formatTwoDigits(entityValue.getUTCMonth() + 1)}-${formatTwoDigits(entityValue.getUTCDate())}T` +
          `${formatTwoDigits(entityValue.getUTCHours())}:${formatTwoDigits(entityValue.getUTCMinutes())}:${formatTwoDigits(entityValue.getUTCSeconds())}Z"` :
          'null';
      }

      const previousPrefix = currentIndentationPrefix;
      currentIndentationPrefix += singleIndentationUnit;
      const members = [];

      // Handle arrays
      if (Array.isArray(entityValue)) {
        // Divergent strategy: using map for array elements
        entityValue.forEach((item, index) => {
          const serializedItem = processValueForSerialization(String(index), entityValue);
          members.push(serializedItem === undefined ? 'null' : serializedItem); // Undefined array elements become null
        });
        const currentPrefix = currentIndentationPrefix;
        currentIndentationPrefix = previousPrefix; // Restore prefix

        if (members.length === 0) {
          return '[]';
        }
        return singleIndentationUnit ?
          `[\n${currentPrefix}${members.join(',\n' + currentPrefix)}\n${previousPrefix}]` :
          `[${members.join(',')}]`;
      }

      // Handle plain objects
      let keysToSerialize;
      if (Array.isArray(serializationReplacer)) {
        // If replacer is an array, only include specified keys
        keysToSerialize = serializationReplacer.filter(k => typeof k === 'string');
      } else {
        // Otherwise, get all enumerable own properties
        keysToSerialize = Object.keys(entityValue);
      }

      // Divergent strategy: using forEach for object members
      keysToSerialize.forEach(objKey => {
        if (Object.prototype.hasOwnProperty.call(entityValue, objKey)) {
          const memberValue = processValueForSerialization(objKey, entityValue);
          if (memberValue !== undefined) { // Undefined object members are omitted
            members.push(`${escapeAndQuoteString(objKey)}${singleIndentationUnit ? ': ' : ':'}${memberValue}`);
          }
        }
      });
      const currentPrefix = currentIndentationPrefix;
      currentIndentationPrefix = previousPrefix; // Restore prefix

      if (members.length === 0) {
        return '{}';
      }
      return singleIndentationUnit ?
        `{\n${currentPrefix}${members.join(',\n' + currentPrefix)}\n${previousPrefix}}` :
        `{${members.join(',')}}`;
    }

    // For undefined, function, symbol, bigint: return undefined, to be handled by caller
    return undefined;
  };

  // Main serialization function (equivalent to JSON.stringify)
  globalThis.JSN_UTIL.serialize = (dataItem, replacerHandler, indentationSetting) => {
    currentIndentationPrefix = '';
    singleIndentationUnit = '';
    serializationReplacer = null;

    // Configure indentation
    if (typeof indentationSetting === 'number' && indentationSetting > 0) {
      singleIndentationUnit = ' '.repeat(Math.min(10, Math.floor(indentationSetting)));
    } else if (typeof indentationSetting === 'string' && indentationSetting.length > 0) {
      singleIndentationUnit = indentationSetting.slice(0, 10);
    }

    // Validate replacer
    if (replacerHandler && typeof replacerHandler !== 'function' && !Array.isArray(replacerHandler)) {
      throw new Error('JSN_UTIL.serialize: replacer must be a function or an array.');
    }
    serializationReplacer = replacerHandler;

    // Use a temporary wrapper object to initiate the recursive process
    const tempWrapper = {
      '': dataItem
    };
    return processValueForSerialization('', tempWrapper);
  };


  // --- Deserialization part (equivalent to JSON.parse) ---

  // Regex for problematic Unicode characters in JSON text
  const unicodeControlScan = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

  // Regexes for JSON grammar validation (critical for security when using eval)
  const escapedCharToken = '@'; // Placeholder for escaped characters
  const simpleValueToken = ']'; // Placeholder for simple values (strings, numbers, bools, null)
  const backslashEscapePattern = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
  const jsonValuePattern = /"(?:[^"\\\n\r]|\\["\\\/bfnrt]|\\u[0-9a-fA-F]{4})*"|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?|true|false|null/g;
  const arrayBracketPattern = /(?:^|:|,)(?:\s*\[)+/g;
  const finalStructureValidator = /^[\],:{}\s]*$/;

  // Recursive function to apply a reviver (equivalent to original's walk)
  const applyReviverRecursively = (parentContainer, memberKey, reviverCallback) => {
    let currentObjectOrValue = parentContainer[memberKey];

    if (currentObjectOrValue && typeof currentObjectOrValue === 'object') {
      // Divergent strategy: using Object.keys().forEach for iteration
      Object.keys(currentObjectOrValue).forEach(subKey => {
        const transformedSubValue = applyReviverRecursively(currentObjectOrValue, subKey, reviverCallback);
        if (transformedSubValue !== undefined) {
          currentObjectOrValue[subKey] = transformedSubValue;
        } else {
          delete currentObjectOrValue[subKey];
        }
      });
    }
    return reviverCallback.call(parentContainer, memberKey, currentObjectOrValue);
  };

  // Main deserialization function (equivalent to JSON.parse)
  globalThis.JSN_UTIL.deserialize = (textInput, reviverCallback) => {
    let resultingObject;

    let processedText = String(textInput);

    // Stage 1: Replace problematic Unicode characters
    unicodeControlScan.lastIndex = 0;
    if (unicodeControlScan.test(processedText)) {
      processedText = processedText.replace(unicodeControlScan, (char) => {
        return '\\u' + ('0000' + char.charCodeAt(0).toString(16)).slice(-4);
      });
    }

    // Stage 2: Validate JSON structure using a series of regex replacements
    // This is a critical security step for `eval`. The regex patterns are specific
    // to the JSON specification and are generally not diverged from.
    const validationIntermediate = processedText
      .replace(backslashEscapePattern, escapedCharToken) // Replace escaped sequences with a placeholder
      .replace(jsonValuePattern, simpleValueToken) // Replace simple values (strings, numbers, etc.) with a placeholder
      .replace(arrayBracketPattern, ''); // Remove leading brackets after colon/comma

    if (finalStructureValidator.test(validationIntermediate)) {
      // Stage 3: Use `eval` to parse the JSON string into a JavaScript structure
      // Wrapped in parens to resolve syntactic ambiguity for object literals.
      // Replacing `eval` would require writing a full JSON parser from scratch.
      resultingObject = eval('(' + processedText + ')');

      // Stage 4: Apply the reviver function recursively if provided
      if (typeof reviverCallback === 'function') {
        // Use a temporary root object to apply the reviver consistently
        return applyReviverRecursively({
          '': resultingObject
        }, '', reviverCallback);
      }
      return resultingObject;
    }

    // If validation fails, throw a SyntaxError
    throw new SyntaxError('JSN_UTIL.deserialize: Invalid JSON input.');
  };

}());