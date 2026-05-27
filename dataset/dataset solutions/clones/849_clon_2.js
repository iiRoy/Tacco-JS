'use strict'; // Enforce strict mode for better code quality.

// This function creates a parser for a fixed string literal.
// It returns a new function that attempts to match the given string within a larger text.
function lexemeMatcher(inputString) {
  // Determine the length of the string we're looking for.
  // This value is captured in the closure.
  const stringLength = inputString.length;

  // Return a new parsing function. This function will be called with the text to parse
  // and the current position within that text.
  return function (sourceText, currentOffset) {
    // Check if the substring at the current position matches our target string.
    // The substring method extracts characters from 'currentOffset' up to, but not including,
    // 'currentOffset + stringLength'. This is equivalent to 'substr(currentOffset, stringLength)'.
    if (sourceText.substring(currentOffset, currentOffset + stringLength) === inputString) {
      // If it matches, return a success result:
      // [true] indicating success,
      // [inputString] the matched string value,
      // [currentOffset + stringLength] the new position after the match.
      return [true, inputString, currentOffset + stringLength];
    } else {
      // If no match, return a failure result:
      // [false] indicating failure,
      // [null] as no value was parsed,
      // [currentOffset] the original position, as no progress was made.
      return [false, null, currentOffset];
    }
  };
}

// This function attempts to match using a series of parsers, returning the first successful one.
// It acts as an 'OR' operator for parsers.
function alternativeParser() {
  // Collect all parser functions passed as arguments into an array-like object.
  // The 'arguments' object provides access to all arguments passed to the function.
  const parserFunctions = arguments;

  // Return a new parsing function that takes the source text and current position.
  return function (sourceText, currentOffset) {
    // Loop through each parser function provided in the 'parserFunctions' collection.
    for (let currentParser of parserFunctions) {
      // Execute the current parser with the given text and offset.
      // Each parser returns a result array: [success_boolean, parsed_value, new_offset].
      const parsingResult = currentParser(sourceText, currentOffset);
      // If the parser successfully matched (indicated by the first element of the result array being true).
      if (parsingResult[0]) {
        // Return the successful parsing result immediately. No need to try other parsers.
        return parsingResult;
      }
    }
    // If none of the parsers in the collection succeeded after trying all of them,
    // return a failure result.
    // This includes a 'false' flag, a 'null' value, and the original offset.
    return [false, null, currentOffset];
  };
}
