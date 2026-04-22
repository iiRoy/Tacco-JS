// This file, json_parse.js, is based on the original work from http://www.JSON.org
// It was initially published on 2011-03-06 and is released into the Public Domain.
//
// IMPORTANT: NO WARRANTY, EXPRESS OR IMPLIED. USE THIS SOFTWARE AT YOUR OWN RISK.
//
// This module provides a json_parse function to convert JSON text into JavaScript objects.
//
// Function Signature:
//   json_parse(jsonTextString, optionalReviverFunction)
//
// Parameters:
//   - jsonTextString: The string containing the JSON data to be parsed.
//   - optionalReviverFunction: An optional function that receives each key/value pair.
//                              It can transform the value or delete the member by returning undefined.
//
// Behavior:
//   - Parses a JSON string to produce a JavaScript object or array.
//   - May throw a SyntaxError exception if the input is invalid JSON.
//
// Example usage of the reviver function:
//   // This example demonstrates converting ISO date strings into Date objects during parsing.
//   var myParsedData = json_parse(jsonText, function (key, val) {
//     var a;
//     if (typeof val === 'string') {
//       // Regex to identify ISO 8601 formatted date strings.
//       a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(val);
//       if (a) {
//         // Convert matched parts to numbers and create a UTC Date object.
//         return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4], +a[5], +a[6]));
//       }
//     }
//     return val; // Return the original value if no transformation is needed.
//   });
//
// This implementation is provided as a reference. Feel free to copy, modify, or redistribute.
// For production use, consider minifying this code. A tool like JSMIN (http://javascript.crockford.com/jsmin.html) is recommended.
//
// SECURITY WARNING: It is highly inadvisable to load code from untrusted servers. Always use your own vetted copy.

// This comment lists identifiers that are intentionally used in this file
// and might be ignored by certain linting tools like JSLint.
// It includes: "", "\"", "\/", "\\", at, b, call, charAt, f, fromCharCode,
// hasOwnProperty, message, n, name, prototype, push, r, t, text.
var json_parse = (function () {
  "use strict";

  // This function is designed to parse JSON text input and produce
  // a corresponding JavaScript data structure (objects or arrays).
  // It employs a simple recursive descent parsing strategy.
  // Notably, it avoids the use of 'eval()' and regular expressions
  // for core parsing logic, making it suitable as a model for
  // JSON parsers in other programming languages.

  // The entire parsing logic is encapsulated within an Immediately Invoked Function Expression (IIFE)
  // to prevent the creation of global variables, maintaining a clean global scope.

  var at,   // Stores the current character's index within the input text.
    ch,     // Holds the character currently being processed.
    escapee = { // Mapping for JSON escape sequences to their actual characters.
      '"':  '"',
      '\\': '\\',
      '/':  '/',
      b:    '\b',
      f:    '\f',
      n:    '\n',
      r:    '\r',
      t:    '\t'
    },
    text,   // The JSON string being parsed.

    // A utility function to report parsing errors.
    error = function (m) {
      // Throws a SyntaxError exception with details about the parsing failure.
      throw {
        name:    'SyntaxError',
        message: m,
        at:      at,
        text:    text
      };
    },

    // Advances the parser to the next character in the input string.
    // Optionally verifies the current character against an expected value.
    next = function (c) {
      // If an expected character 'c' is provided, check if it matches 'ch'.
      if (c && c !== ch) {
        error("Expected '" + c + "' instead of '" + ch + "'");
      }

      // Retrieve the next character from the input text using the 'at' index.
      // Increment 'at' for the subsequent character.
      // Returns the newly fetched character, or an empty string if end of text.
      ch = text.charAt(at);
      at += 1;
      return ch;
    },

    // Parses a JSON number value.
    number = function () {
      var number, // This variable will hold the final numeric value.
        string = ''; // This variable accumulates the string representation of the number.

      // Check for an optional leading minus sign.
      if (ch === '-') {
        string = '-';
        next('-'); // Consume the '-' character.
      }
      // Parse the integer part of the number.
      while (ch >= '0' && ch <= '9') {
        string += ch;
        next();
      }
      // Parse the fractional part if a decimal point is present.
      if (ch === '.') {
        string += '.';
        while (next() && ch >= '0' && ch <= '9') {
          string += ch;
        }
      }
      // Parse the exponent part if 'e' or 'E' is present.
      if (ch === 'e' || ch === 'E') {
        string += ch;
        next(); // Consume 'e' or 'E'.
        // Check for optional sign in the exponent.
        if (ch === '-' || ch === '+') {
          string += ch;
          next(); // Consume '-' or '+'.
        }
        // Parse the exponent digits.
        while (ch >= '0' && ch <= '9') {
          string += ch;
          next();
        }
      }
      // Convert the accumulated string into a numeric type.
      number = +string;
      // Validate that the parsed number is finite.
      if (!isFinite(number)) {
        error("Bad number"); // Use original error message.
      } else {
        return number;
      }
    },

    // Parses a JSON string value.
    string = function () {
      var hex,     // Stores the hexadecimal value of a Unicode escape sequence.
        i,         // Loop counter for processing Unicode escape digits.
        string = '', // Accumulates the characters to form the final string.
        uffff;     // Stores the parsed Unicode character code point.

      // JSON string parsing must handle double quotes and backslash escape sequences.
      if (ch === '"') {
        while (next()) { // Iterate through characters until a closing quote or error.
          if (ch === '"') {
            next(); // Consume the closing double quote.
            return string; // Return the fully parsed string.
          } else if (ch === '\\') { // Encountered an escape character.
            next(); // Consume the backslash.
            if (ch === 'u') { // It's a Unicode escape sequence (\uXXXX).
              uffff = 0;
              for (i = 0; i < 4; i += 1) { // Read the four hexadecimal digits.
                hex = parseInt(next(), 16);
                if (!isFinite(hex)) { // Check for valid hexadecimal input.
                  break; // Exit loop if an invalid digit is found.
                }
                uffff = uffff * 16 + hex; // Accumulate the Unicode code point.
              }
              string += String.fromCharCode(uffff); // Append the character corresponding to the code point.
            } else if (typeof escapee[ch] === 'string') { // It's a predefined escape sequence (e.g., \n, \t).
              string += escapee[ch]; // Append the unescaped character.
            } else {
              break; // Invalid escape sequence.
            }
          } else {
            string += ch; // Append a regular character to the string.
          }
        }
      }
      error("Bad string"); // If loop finishes without returning, string was malformed.
    },

    // Skips over any whitespace characters.
    white = function () {
      while (ch && ch <= ' ') { // Loop as long as 'ch' exists and is a whitespace character.
        next(); // Move to the next character.
      }
    },

    // Parses JSON literal words: 'true', 'false', or 'null'.
    word = function () {
      switch (ch) {
        case 't': // Handle 'true'.
          next('t');
          next('r');
          next('u');
          next('e');
          return true;
        case 'f': // Handle 'false'.
          next('f');
          next('a');
          next('l');
          next('s');
          next('e');
          return false;
        case 'n': // Handle 'null'.
          next('n');
          next('u');
          next('l');
          next('l');
          return null;
      }
      error("Unexpected '" + ch + "'"); // Use the original error message string.
    },

    value,  // Forward declaration for the 'value' function, defined later.

    // Parses a JSON array value.
    array = function () {
      var array = []; // The array to be constructed from the JSON input.

      if (ch === '[') {
        next('['); // Consume the opening square bracket.
        white();   // Skip any whitespace after the opening bracket.
        if (ch === ']') {
          next(']'); // If an immediate closing bracket, it's an empty array.
          return array; // Return the empty array.
        }
        // Loop to parse array elements.
        while (ch) {
          array.push(value()); // Parse a value and add it to the array.
          white();             // Skip whitespace after the element.
          if (ch === ']') {
            next(']'); // Found the closing bracket, array is complete.
            return array;
          }
          next(',');   // Expect a comma separator for multiple elements.
          white();     // Skip whitespace after the comma.
        }
      }
      error("Bad array"); // If parsing fails to complete an array, throw an error.
    },

    // Parses a JSON object value.
    object = function () {
      var key,          // Variable to hold the parsed key string.
        object = {};    // The object to be populated with key-value pairs.

      if (ch === '{') {
        next('{'); // Consume the opening curly brace.
        white();   // Skip any whitespace.
        if (ch === '}') {
          next('}'); // If an immediate closing brace, it's an empty object.
          return object; // Return the empty object.
        }
        // Loop to parse key-value pairs.
        while (ch) {
          key = string(); // Parse the key, which must be a string.
          white();        // Skip whitespace after the key.
          next(':');      // Expect and consume the colon separating key and value.
          // Check for duplicate keys to ensure JSON object validity.
          if (Object.hasOwnProperty.call(object, key)) {
            error('Duplicate key "' + key + '"'); // Use original error message.
          }
          object[key] = value(); // Parse the value and assign it to the key.
          white();               // Skip whitespace after the value.
          if (ch === '}') {
            next('}'); // Found the closing brace, object is complete.
            return object;
          }
          next(',');   // Expect a comma separator for multiple key-value pairs.
          white();     // Skip whitespace after the comma.
        }
      }
      error("Bad object"); // If parsing fails to complete an object, throw an error.
    };

  // 'value' function: the core dispatcher for parsing any JSON value type.
  value = function () {
    // First, skip any leading whitespace.
    white();
    // Determine the type of value based on the current character.
    switch (ch) {
      case '{':
        return object(); // Parse an object.
      case '[':
        return array();  // Parse an array.
      case '"':
        return string(); // Parse a string.
      case '-':
        return number(); // Parse a negative number.
      default:
        // If not one of the above, it could be a positive number or a keyword (true, false, null).
        return ch >= '0' && ch <= '9' ? number() : word();
    }
  };

  // The IIFE returns the main 'json_parse' function.
  // This function encapsulates the entire parser, making all internal
  // functions and variables accessible within its scope (closure).
  return function (source, reviver) {
    var result; // Variable to hold the parsed result.

    text = source; // Set the input text for parsing.
    at = 0;        // Initialize character index to the beginning.
    ch = ' ';      // Initialize current character (a dummy value to start 'next').
    result = value(); // Start parsing the main JSON value.
    white();               // Skip any trailing whitespace.
    if (ch) {
      error("Syntax error"); // Use original error message.
    }

    // If a reviver function is provided, we perform a recursive walk
    // through the parsed structure. Each name/value pair is passed
    // to the reviver for potential transformation. The process starts
    // with a temporary root object holding the result under an empty key.
    // If no reviver is present, the raw parsed result is returned directly.

    return typeof reviver === 'function'
      ? (function walk(holder, key) { // This IIFE defines and immediately calls the 'walk' function.
        var k,                       // Loop variable for iterating over object keys.
          v,                         // Stores the result of the recursive 'walk' call.
          value = holder[key];       // The current value being processed by the reviver.

        // If the current 'value' is an object (and not null), recursively process its properties.
        if (value && typeof value === 'object') {
          for (k in value) {
            // Ensure 'k' is an own property of 'value', not from its prototype chain.
            if (Object.prototype.hasOwnProperty.call(value, k)) {
              v = walk(value, k); // Recursively call 'walk' for the nested property.
              if (v !== undefined) {
                value[k] = v; // Update the property's value if the reviver returned a non-undefined result.
              } else {
                delete value[k]; // Delete the property if the reviver returned 'undefined'.
              }
            }
          }
        }
        // Finally, invoke the reviver function with the current context ('holder'), key, and value.
        return reviver.call(holder, key, value);
      }({'': result}, '')) // Invoke 'walk' with a dummy root object and an empty key.
      : result;            // If no reviver, return the original parsed result.
  };
}());