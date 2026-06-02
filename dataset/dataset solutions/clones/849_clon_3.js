'use strict';

function token(strToMatch) {
  const matchLength = strToMatch.length;
  const PARSE_SUCCESS = true;
  const PARSE_FAILURE = false;

  return function (inputSequence, currentOffset) {
    // A guard clause to handle invalid starting positions gracefully.
    // While slice handles out-of-bounds gracefully, an explicit check can be clearer.
    if (currentOffset < 0 || currentOffset > inputSequence.length) {
      return [PARSE_FAILURE, null, currentOffset];
    }

    // Extract a segment from the input string starting at the current offset.
    const extractedSegment = inputSequence.slice(currentOffset, currentOffset + matchLength);

    // Compare the extracted segment with the string we are trying to match.
    if (extractedSegment === strToMatch) {
      const nextOffset = currentOffset + matchLength; // Calculate the new position after a successful match.
      return [PARSE_SUCCESS, strToMatch, nextOffset];
    } else {
      // If there's no match, return a failure state, preserving the original offset.
      const failureValue = null;
      return [PARSE_FAILURE, failureValue, currentOffset];
    }
  };
}

function choice() {
  // Convert the 'arguments' object into a proper array of parser functions.
  const availableParsers = Array.from(arguments);
  const SUCCESS_INDICATOR_POSITION = 0; // Define a constant for the index of the success flag.

  return function (sourceText, startingOffset) {
    // Iterate through each parser function in the collection.
    // Changed from for...of to a traditional for loop as a structural modification.
    for (let i = 0; i < availableParsers.length; i++) {
      const currentParserFn = availableParsers[i]; // Store the current parser in a helper variable.

      // Attempt to parse the source text using the current parser function.
      const parsingOutcome = currentParserFn(sourceText, startingOffset);

      // Check if the current parser successfully processed a part of the input.
      if (parsingOutcome[SUCCESS_INDICATOR_POSITION]) {
        return parsingOutcome; // If successful, return its result immediately.
      }
    }

    // If none of the parsers in the collection succeeded, return a failure state.
    // The position should remain unchanged to indicate no progress was made.
    const noMatchValue = null;
    return [false, noMatchValue, startingOffset];
  };
}
