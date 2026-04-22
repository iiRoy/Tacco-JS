var json_processor = (function () {
  "use strict";

  // This internal module provides functionality to interpret a JSON string,
  // converting it into a JavaScript data structure.
  // It employs a straightforward recursive descent parsing approach.
  // Notably, it avoids using `eval` or regular expressions, making it
  // a suitable reference for implementing JSON parsers in other programming languages.

  // The entire parsing logic is wrapped within an immediately invoked function
  // to encapsulate variables and prevent them from polluting the global namespace.

  var currentPos, // The numerical index of the presently examined character within the input.
    currentChar, // The character currently under scrutiny.
    specialChars = {
      '"': '"',
      '\\': '\\',
      '/': '/',
      b: '\b',
      f: '\f',
      n: '\n',
      r: '\r',
      t: '\t'
    },
    inputContent,

    signalIssue = function (issueMsg) {

      // This function is invoked whenever a parsing error is detected.

      throw {
        issueType: 'SyntaxError',
        details: issueMsg,
        locationIndex: currentPos,
        fullInput: inputContent
      };
    },

    advanceChar = function (expectedCh) {

      // If an 'expectedCh' parameter is supplied, the method verifies
      // if it matches the 'currentChar'.

      if (expectedCh && expectedCh !== currentChar) {
        signalIssue("Expected character '" + expectedCh + "' but found '" + currentChar + "'");
      }

      // Retrieves the subsequent character from the 'inputContent'.
      // Returns an empty string once all characters have been processed.

      currentChar = inputContent.charAt(currentPos);
      currentPos += 1;
      return currentChar;
    },

    parseNum = function () {

      // Interprets and extracts a numerical value.

      var numVal,
        numStr = '';

      if (currentChar === '-') {
        numStr = '-';
        advanceChar('-');
      }

      while (currentChar >= '0' && currentChar <= '9') {
        numStr += currentChar;
        advanceChar();
      }

      if (currentChar === '.') {
        numStr += '.';
        while (advanceChar() && currentChar >= '0' && currentChar <= '9') {
          numStr += currentChar;
        }
      }

      if (currentChar === 'e' || currentChar === 'E') {
        numStr += currentChar;
        advanceChar();
        if (currentChar === '-' || currentChar === '+') {
          numStr += currentChar;
          advanceChar();
        }
        while (currentChar >= '0' && currentChar <= '9') {
          numStr += currentChar;
          advanceChar();
        }
      }

      numVal = +numStr;
      if (!isFinite(numVal)) {
        signalIssue("Invalid numerical format");
      } else {
        return numVal;
      }
    },

    parseStr = function () {

      // Interprets and extracts a string value.

      var hexDigit,
        idx,
        strResult = '',
        unicodeVal;

      // When processing string values, specific attention must be paid
      // to quotation marks (") and backslashes (\).

      if (currentChar === '"') {
        while (advanceChar()) {
          if (currentChar === '"') {
            advanceChar();
            return strResult;
          } else if (currentChar === '\\') {
            advanceChar();
            if (currentChar === 'u') {
              unicodeVal = 0;
              for (idx = 0; idx < 4; idx += 1) {
                hexDigit = parseInt(advanceChar(), 16);
                if (!isFinite(hexDigit)) {
                  break;
                }
                unicodeVal = unicodeVal * 16 + hexDigit;
              }
              strResult += String.fromCharCode(unicodeVal);
            } else if (typeof specialChars[currentChar] === 'string') {
              strResult += specialChars[currentChar];
            } else {
              break;
            }
          } else {
            strResult += currentChar;
          }
        }
      }
      signalIssue("Malformated string content");
    },

    skipSpace = function () {

      // Ignores and advances past any whitespace characters.

      while (currentChar && currentChar <= ' ') {
        advanceChar();
      }
    },

    parseKeyword = function () {

      // Parses and returns the boolean values 'true' or 'false', or the 'null' literal.

      switch (currentChar) {
        case 't':
          advanceChar('t');
          advanceChar('r');
          advanceChar('u');
          advanceChar('e');
          return true;
        case 'f':
          advanceChar('f');
          advanceChar('a');
          advanceChar('l');
          advanceChar('s');
          advanceChar('e');
          return false;
        case 'n':
          advanceChar('n');
          advanceChar('u');
          advanceChar('l');
          advanceChar('l');
          return null;
      }
      signalIssue("Unexpected token '" + currentChar + "'");
    },

    readValue, // A forward declaration for the 'readValue' function.

    handleArray = function () {

      // Interprets and extracts an array value.

      var arrItems = [];

      if (currentChar === '[') {
        advanceChar('[');
        skipSpace();
        if (currentChar === ']') {
          advanceChar(']');
          return arrItems; // Returns an empty array if immediately closed
        }
        while (currentChar) {
          arrItems.push(readValue());
          skipSpace();
          if (currentChar === ']') {
            advanceChar(']');
            return arrItems;
          }
          advanceChar(',');
          skipSpace();
        }
      }
      signalIssue("Invalid array structure");
    },

    handleObject = function () {

      // Interprets and extracts an object value.

      var propKey,
        objResult = {};

      if (currentChar === '{') {
        advanceChar('{');
        skipSpace();
        if (currentChar === '}') {
          advanceChar('}');
          return objResult; // Returns an empty object if immediately closed
        }
        while (currentChar) {
          propKey = parseStr();
          skipSpace();
          advanceChar(':');
          if (Object.hasOwnProperty.call(objResult, propKey)) {
            signalIssue('Duplicate property key "' + propKey + '"');
          }
          objResult[propKey] = readValue();
          skipSpace();
          if (currentChar === '}') {
            advanceChar('}');
            return objResult;
          }
          advanceChar(',');
          skipSpace();
        }
      }
      signalIssue("Invalid object structure");
    };

  readValue = function () {

    // Parses a generic JSON value. This could be an object, an array,
    // a string, a number, or one of the literal keywords.

    skipSpace();
    switch (currentChar) {
      case '{':
        return handleObject();
      case '[':
        return handleArray();
      case '"':
        return parseStr();
      case '-':
        return parseNum();
      default:
        return currentChar >= '0' && currentChar <= '9' ? parseNum() : parseKeyword();
    }
  };

  // The module returns its primary function, 'json_processor'.
  // This function will have access to all the helper functions and variables defined above
  // due to closure.

  return function (jsonSource, transformFunc) {
    var finalResult;

    inputContent = jsonSource;
    currentPos = 0;
    currentChar = ' ';
    finalResult = readValue();
    skipSpace();
    if (currentChar) {
      signalIssue("Syntax error: extra characters after JSON data");
    }

    // If a 'transformFunc' (reviver) is provided, the function recursively
    // traverses the newly created data structure. Each name/value pair is
    // passed to the 'transformFunc' for potential modification.
    // The traversal begins with a temporary root object holding the result
    // under an empty key. If no 'transformFunc' is present, the raw
    // 'finalResult' is returned directly.

    return typeof transformFunc === 'function' ? (function traverseAndRevise(container, currentKey) {
      var subKey, transformedVal, currentVal = container[currentKey];
      if (currentVal && typeof currentVal === 'object') {
        for (subKey in currentVal) {
          if (Object.prototype.hasOwnProperty.call(currentVal, subKey)) {
            transformedVal = traverseAndRevise(currentVal, subKey);
            if (transformedVal !== undefined) {
              currentVal[subKey] = transformedVal;
            } else {
              delete currentVal[subKey];
            }
          }
        }
      }
      return transformFunc.call(container, currentKey, currentVal);
    }({
      '': finalResult
    }, '')) : finalResult;
  };
}());