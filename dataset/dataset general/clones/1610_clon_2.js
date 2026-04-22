if ( typeof JDATA !== 'object' ) {
  JDATA = {};
}

(function () {
  'use strict';

  // Utility to format single-digit numbers with a leading zero.
  function formatDigit(numVal) {
    return numVal < 10 ? '0' + numVal : numVal;
  }

  if ( typeof Date.prototype.toDataString !== 'function' ) {
    Date.prototype.toDataString = function () {
      return isFinite(this.valueOf())
        ? this.getUTCFullYear() + '-' +
          formatDigit(this.getUTCMonth() + 1) + '-' +
          formatDigit(this.getUTCDate()) + 'T' +
          formatDigit(this.getUTCHours()) + ':' +
          formatDigit(this.getUTCMinutes()) + ':' +
          formatDigit(this.getUTCSeconds()) + 'Z'
        : null;
    };

    String.prototype.toDataString =
      Number.prototype.toDataString =
      Boolean.prototype.toDataString = function () {
        return this.valueOf();
      };
  }

  var controlCharsRegex = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
    specialCharsRegex = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
    currentIndent,
    baseIndent,
    escapeMap = {    // Mapping of characters to their escape sequences.
      '\b': '\\b',
      '\t': '\\t',
      '\n': '\\n',
      '\f': '\\f',
      '\r': '\\r',
      '"' : '\\"',
      '\\': '\\\\'
    },
    replacerFunc;


  // Encloses a string in quotes, escaping internal special characters.
  function wrapString(inputString) {
    // If the string contains no control characters, no quote characters, and no
    // backslash characters, then we can safely slap some quotes around it.
    // Otherwise we must also replace the offending characters with safe escape
    // sequences.
    specialCharsRegex.lastIndex = 0;
    return specialCharsRegex.test(inputString) ? '"' + inputString.replace(specialCharsRegex, function (charToEscape) {
      var mappedChar = escapeMap[charToEscape];
      return typeof mappedChar === 'string'
        ? mappedChar
        : '\\u' + ('0000' + charToEscape.charCodeAt(0).toString(16)).slice(-4);
    }) + '"' : '"' + inputString + '"';
  }


  // Converts a value from an object or array into its JSON string representation.
  function serializeValue(propKey, parentObj) {
    var loopIndex, // General loop counter.
      currentKey,  // Key for object members.
      currentVal,  // Value of object members.
      itemCount,   // Number of items in an array or selected keys.
      prevIndent = currentIndent,
      resultParts, // Array to hold serialized parts.
      currentValue = parentObj[propKey];

    // If the value has a custom 'toDataString' method, call it first.
    if (currentValue && typeof currentValue === 'object' &&
        typeof currentValue.toDataString === 'function') {
      currentValue = currentValue.toDataString(propKey);
    }

    // If a replacer function is provided, apply it to the value.
    if (typeof replacerFunc === 'function') {
      currentValue = replacerFunc.call(parentObj, propKey, currentValue);
    }

    // Determine serialization based on the value's type.
    switch (typeof currentValue) {
    case 'string':
      return wrapString(currentValue);

    case 'number':
      // JSON numbers must be finite. Non-finite numbers become 'null'.
      return isFinite(currentValue) ? String(currentValue) : 'null';

    case 'boolean':
    case 'null':
      // Booleans and null convert directly to string.
      return String(currentValue);

    case 'object':
      // Handle null (which is typeof 'object').
      if (!currentValue) {
        return 'null';
      }

      // Prepare an array for holding serialized parts.
      currentIndent += baseIndent;
      resultParts = [];

      // Check if the value is an array.
      if (Object.prototype.toString.apply(currentValue) === '[object Array]') {
        // Serialize each array element, using 'null' for non-JSON values.
        itemCount = currentValue.length;
        for (loopIndex = 0; loopIndex < itemCount; loopIndex += 1) {
          resultParts[loopIndex] = serializeValue(loopIndex, currentValue) || 'null';
        }

        // Join array elements and wrap in brackets.
        currentVal = resultParts.length === 0
          ? '[]'
          : currentIndent
          ? '[\n' + currentIndent + resultParts.join(',\n' + currentIndent) + '\n' + prevIndent + ']'
          : '[' + resultParts.join(',') + ']';
        currentIndent = prevIndent;
        return currentVal;
      }

      // If a replacer array is given, use it to select properties.
      if (replacerFunc && typeof replacerFunc === 'object') {
        itemCount = replacerFunc.length;
        for (loopIndex = 0; loopIndex < itemCount; loopIndex += 1) {
          if (typeof replacerFunc[loopIndex] === 'string') {
            currentKey = replacerFunc[loopIndex];
            currentVal = serializeValue(currentKey, currentValue);
            if (currentVal) {
              resultParts.push(wrapString(currentKey) + (currentIndent ? ': ' : ':') + currentVal);
            }
          }
        }
      } else {
        // Otherwise, iterate through all object keys.
        for (currentKey in currentValue) {
          if (Object.prototype.hasOwnProperty.call(currentValue, currentKey)) {
            currentVal = serializeValue(currentKey, currentValue);
            if (currentVal) {
              resultParts.push(wrapString(currentKey) + (currentIndent ? ': ' : ':') + currentVal);
            }
          }
        }
      }

      // Join object members and wrap in braces.
      currentVal = resultParts.length === 0
        ? '{}'
        : currentIndent
        ? '{\n' + currentIndent + resultParts.join(',\n' + currentIndent) + '\n' + prevIndent + '}'
        : '{' + resultParts.join(',') + '}';
      currentIndent = prevIndent;
      return currentVal;
    }
  }

  // Implement the stringify method if it doesn't exist.
  if ( typeof JDATA.stringify !== 'function' ) {
    JDATA.stringify = function (valueToConvert, transformFunc, indentationSpec) {
      // This method converts a JavaScript value into a JSON text string.
      // It accepts an optional 'transformFunc' (function or array of strings)
      // and an optional 'indentationSpec' (number or string) for pretty-printing.

      var loopIndex;
      currentIndent = '';
      baseIndent = '';

      // Set up indentation based on 'indentationSpec'.
      if ( typeof indentationSpec === 'number' ) {
        for (loopIndex = 0; loopIndex < indentationSpec; loopIndex += 1) {
          baseIndent += ' ';
        }
      } else if ( typeof indentationSpec === 'string' ) {
        baseIndent = indentationSpec;
      }

      // Validate the replacer function/array.
      replacerFunc = transformFunc;
      if ( transformFunc && typeof transformFunc !== 'function' &&
          ( typeof transformFunc !== 'object' ||
          typeof transformFunc.length !== 'number' ) ) {
        throw new Error('JDATA.stringify: Invalid replacer argument.');
      }

      // Create a temporary root object to start the serialization process.
      return serializeValue('', {'': valueToConvert});
    };
  }


  // Implement the parse method if it doesn't exist.
  if ( typeof JDATA.parse !== 'function' ) {
    JDATA.parse = function (inputStringData, modifierFunc) {
      // This method converts a JSON text string into a JavaScript value.
      // It can throw a SyntaxError for invalid JSON.

      var parsedObject;

      // Recursively walks the parsed structure to apply a reviver function.
      function traverseAndModify(parentObj, propKey) {
        var currentKey, currentVal, valueFromHolder = parentObj[propKey];
        if ( valueFromHolder && typeof valueFromHolder === 'object' ) {
          for ( currentKey in valueFromHolder ) {
            if ( Object.prototype.hasOwnProperty.call(valueFromHolder, currentKey) ) {
              currentVal = traverseAndModify(valueFromHolder, currentKey);
              if ( currentVal !== undefined ) {
                valueFromHolder[currentKey] = currentVal;
              } else {
                delete valueFromHolder[currentKey];
              }
            }
          }
        }
        return modifierFunc.call(parentObj, propKey, valueFromHolder);
      }


      // Parsing occurs in several stages. First, handle problematic Unicode characters.
      inputStringData = String(inputStringData);
      controlCharsRegex.lastIndex = 0;
      if ( controlCharsRegex.test(inputStringData) ) {
        inputStringData = inputStringData.replace(controlCharsRegex, function (charVal) {
          return '\\u' +
            ('0000' + charVal.charCodeAt(0).toString(16)).slice(-4);
        });
      }

      // Second stage: Validate JSON structure using regular expressions.
      // This involves multiple regex operations to work around browser engine inefficiencies.
      // 1. Replace escaped sequences with a placeholder '@'.
      // 2. Replace simple values (strings, numbers, booleans, null) with ']'.
      // 3. Remove opening brackets that are part of arrays/objects.
      // 4. Check if remaining characters are only valid JSON structural elements and whitespace.
      if ( /^[\],:{}\s]*$/
          .test(inputStringData.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
            .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
            .replace(/(?:^|:|,)(?:\s*\[)+/g, '')) ) {

        // Third stage: Use eval to parse the validated JSON string into a JS object.
        // Parentheses around the text resolve syntactic ambiguity for '{' as a block vs. object literal.
        parsedObject = eval('(' + inputStringData + ')');

        // Fourth stage (optional): Apply the reviver function to the parsed structure.
        return typeof modifierFunc === 'function'
          ? traverseAndModify({'': parsedObject}, '')
          : parsedObject;
      }

      // If the text is not valid JSON, throw a SyntaxError.
      throw new SyntaxError('JDATA.parse: Invalid JSON string.');
    };
  }
}());