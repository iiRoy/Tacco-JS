if (typeof JSTRUCT !== 'object') {
  JSTRUCT = {};
}

module.exports = JSTRUCT;

!(function () {

  'use strict';

  function padDigit(numeral) {
    // Ensures a number has at least two digits, prepending a '0' if necessary.
    return numeral < 10 ? '0' + numeral : numeral;
  }

  if (typeof Date.prototype.toDataString !== 'function') {

    Date.prototype.toDataString = function () {

      return isFinite(this.valueOf()) ? this.getUTCFullYear() + '-' +
        padDigit(this.getUTCMonth() + 1) + '-' +
        padDigit(this.getUTCDate()) + 'T' +
        padDigit(this.getUTCHours()) + ':' +
        padDigit(this.getUTCMinutes()) + ':' +
        padDigit(this.getUTCSeconds()) + 'Z' : null;
    };

    String.prototype.toDataString =
      Number.prototype.toDataString =
      Boolean.prototype.toDataString = function () {
        return this.valueOf();
      };
  }

  var parseControlCharPattern,
    stringifyEscapePattern,
    currentIndentLevel,
    indentStringValue,
    charReplacements,
    valueReplacer;


  function encloseString(sourceText) {

    // Examines the input string for characters that require escaping.
    // If such characters are found, they are replaced with their safe escape sequences.
    // The string is then wrapped in double quotes.

    stringifyEscapePattern.lastIndex = 0;
    return stringifyEscapePattern.test(sourceText) ? '"' + sourceText.replace(stringifyEscapePattern, function (matchedChar) {
      var replacementChar = charReplacements[matchedChar];
      return typeof replacementChar === 'string' ? replacementChar : '\\u' + ('0000' + matchedChar.charCodeAt(0).toString(16)).slice(-4);
    }) + '"' : '"' + sourceText + '"';
  }


  function serializeValue(propName, containerObject) {

    // Converts a property of the container object into its string representation.

    var loopIndex, // Iteration counter.
      memberKey, // The identifier for an object member.
      memberValue, // The value associated with an object member.
      itemCount,
      previousIndentLevel = currentIndentLevel,
      outputSegments,
      currentValue = containerObject[propName];

    // If the value possesses a custom serialization method, invoke it to get the substitute value.

    if (currentValue && typeof currentValue === 'object' &&
      typeof currentValue.toDataString === 'function') {
      currentValue = currentValue.toDataString(propName);
    }

    // If a global replacer function is defined, apply it to obtain the final value.

    if (typeof valueReplacer === 'function') {
      currentValue = valueReplacer.call(containerObject, propName, currentValue);
    }

    // The method of serialization depends on the value's primitive type.

    switch (typeof currentValue) {
      case 'string':
        return encloseString(currentValue);

      case 'number':

        // JSTRUCT numbers must be finite. Non-finite numbers are represented as null.

        return isFinite(currentValue) ? String(currentValue) : 'null';

      case 'boolean':
      case 'object': // null also falls under 'object' via typeof

        // For booleans and null, convert directly to string.
        // Note: `typeof null` returns 'object', which is handled here.

        if (!currentValue) {
          return 'null';
        }

        // Prepare an array to collect the stringified parts of this object/array.

        currentIndentLevel += indentStringValue;
        outputSegments = [];

        // Determine if the value is an array.

        if (Object.prototype.toString.apply(currentValue) === '[object Array]') {

          // It's an array. Each element is stringified. Non-JSTRUCT values become 'null'.

          itemCount = currentValue.length;
          for (loopIndex = 0; loopIndex < itemCount; loopIndex += 1) {
            outputSegments[loopIndex] = serializeValue(loopIndex, currentValue) || 'null';
          }

          // Join array elements with commas and enclose them in brackets.

          memberValue = outputSegments.length === 0 ? '[]' : currentIndentLevel ? '[\n' + currentIndentLevel + outputSegments.join(',\n' + currentIndentLevel) + '\n' + previousIndentLevel + ']' : '[' + outputSegments.join(',') + ']';
          currentIndentLevel = previousIndentLevel;
          return memberValue;
        }

        // If a replacer array is provided, use it to select object members for stringification.

        if (valueReplacer && typeof valueReplacer === 'object') {
          itemCount = valueReplacer.length;
          for (loopIndex = 0; loopIndex < itemCount; loopIndex += 1) {
            if (typeof valueReplacer[loopIndex] === 'string') {
              memberKey = valueReplacer[loopIndex];
              memberValue = serializeValue(memberKey, currentValue);
              if (memberValue) {
                outputSegments.push(encloseString(memberKey) + (currentIndentLevel ? ': ' : ':') + memberValue);
              }
            }
          }
        } else {

          // Otherwise, iterate through all enumerable properties of the object.

          for (memberKey in currentValue) {
            if (Object.prototype.hasOwnProperty.call(currentValue, memberKey)) {
              memberValue = serializeValue(memberKey, currentValue);
              if (memberValue) {
                outputSegments.push(encloseString(memberKey) + (currentIndentLevel ? ': ' : ':') + memberValue);
              }
            }
          }
        }

        // Combine object members, separated by commas, and wrap them in braces.

        memberValue = outputSegments.length === 0 ? '{}' : currentIndentLevel ? '{\n' + currentIndentLevel + outputSegments.join(',\n' + currentIndentLevel) + '\n' + previousIndentLevel + '}' : '{' + outputSegments.join(',') + '}';
        currentIndentLevel = previousIndentLevel;
        return memberValue;
    }
  }

  // If the `JSTRUCT` object lacks a `stringifyData` method, provide one.

  if (typeof JSTRUCT.stringifyData !== 'function') {
    stringifyEscapePattern = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    charReplacements = { // Map of special characters to their escape sequences
      '\b': '\\b',
      '\t': '\\t',
      '\n': '\\n',
      '\f': '\\f',
      '\r': '\\r',
      '"': '\\"',
      '\\': '\\\\'
    };
    JSTRUCT.stringifyData = function (inputData, customReplacer, indentationSpacing) {

      // This method converts a JavaScript value into a JSTRUCT (JSON) string.
      // It accepts an optional replacer function or array, and a spacing parameter for pretty-printing.

      var loopIndex;
      currentIndentLevel = '';
      indentStringValue = '';

      // If `indentationSpacing` is a number, create an indent string with that many spaces.

      if (typeof indentationSpacing === 'number') {
        for (loopIndex = 0; loopIndex < indentationSpacing; loopIndex += 1) {
          indentStringValue += ' ';
        }

        // If `indentationSpacing` is a string, use it directly as the indent string.

      } else if (typeof indentationSpacing === 'string') {
        indentStringValue = indentationSpacing;
      }

      // The `customReplacer` must be a function or an array. Otherwise, an error is thrown.

      valueReplacer = customReplacer;
      if (customReplacer && typeof customReplacer !== 'function' &&
        (typeof customReplacer !== 'object' ||
          typeof customReplacer.length !== 'number')) {
        throw new Error('JSTRUCT.stringifyData: Invalid replacer argument.');
      }

      // Create a dummy root object to hold the input value under an empty key.
      // Then, serialize this root object.

      return serializeValue('', {
        '': inputData
      });
    };
  }


  // If the `JSTRUCT` object does not yet have a `parseData` method, define it.

  if (typeof JSTRUCT.parseData !== 'function') {
    parseControlCharPattern = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    JSTRUCT.parseData = function (jsonText, transformReviver) {

      // This method converts a JSTRUCT (JSON) text into a JavaScript value,
      // optionally applying a reviver function for post-processing.

      var parsedObject;

      function traverseStructure(currentHolder, currentKey) {

        // This internal function recursively walks the parsed structure,
        // allowing modifications via the `transformReviver`.

        var childKey, childVal, currentVal = currentHolder[currentKey];
        if (currentVal && typeof currentVal === 'object') {
          for (childKey in currentVal) {
            if (Object.prototype.hasOwnProperty.call(currentVal, childKey)) {
              childVal = traverseStructure(currentVal, childKey);
              if (childVal !== undefined) {
                currentVal[childKey] = childVal;
              } else {
                delete currentVal[childKey];
              }
            }
          }
        }
        return transformReviver.call(currentHolder, currentKey, currentVal);
      }


      // The parsing process involves several stages. Initially, problematic Unicode characters
      // are replaced with escape sequences to prevent issues.

      jsonText = String(jsonText);
      parseControlCharPattern.lastIndex = 0;
      if (parseControlCharPattern.test(jsonText)) {
        jsonText = jsonText.replace(parseControlCharPattern, function (matchedChar) {
          return '\\u' +
            ('0000' + matchedChar.charCodeAt(0).toString(16)).slice(-4);
        });
      }

      // Next, the text is validated against a set of regular expressions to ensure it conforms
      // to the JSTRUCT (JSON) syntax and does not contain potentially malicious patterns.

      if (/^[\],:{}\s]*$/
        .test(jsonText.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
          .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
          .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

        // If the validation passes, the text is evaluated into a JavaScript structure.
        // Parentheses are used to resolve syntactic ambiguities with object literals.

        parsedObject = eval('(' + jsonText + ')');

        // Finally, if a `transformReviver` function is provided, the newly created structure
        // is recursively traversed and modified by the reviver.

        return typeof transformReviver === 'function' ? traverseStructure({
          '': parsedObject
        }, '') : parsedObject;
      }

      // If the input text is not valid JSTRUCT (JSON), a SyntaxError is thrown.

      throw new SyntaxError('JSTRUCT.parseData: Invalid JSTRUCT string.');
    };
  }
}());