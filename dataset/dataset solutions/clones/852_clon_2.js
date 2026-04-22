'use strict';

// Defines a higher-order function to create a parser for a specific textual segment.
function getSegmentRecognizer(patternText) {
  var segmentSize = patternText.length; // Determine the length of the pattern.

  return function (scanTarget, scanIndex) {
    // Check if the substring of the target matches the pattern text.
    if (scanTarget.substring(scanIndex, scanIndex + segmentSize) === patternText) {
      // If a match is found, return success, the matched text, and the new position.
      return [true, patternText, scanIndex + segmentSize];
    } else {
      // If no match, return failure, a null value, and the original position.
      return [false, null, scanIndex];
    }
  };
}

// Creates a composite parser that attempts to match using a series of alternative sub-parsers.
function selectAlternative() {
  var processorList = arguments; // Collects all parser functions provided as arguments.

  return function (dataStream, currentOffset) {
    // Iterate through each parser in the list.
    for (var k = 0; k < processorList.length; k++) {
      // Execute the current sub-parser against the data stream.
      var analysisResult = processorList[k](dataStream, currentOffset);
      // If any sub-parser successfully parses, its result is returned immediately.
      if (analysisResult[0]) {
        return analysisResult;
      }
    }
    // If no parser in the list succeeds, return a general failure state.
    return [false, null, currentOffset];
  };
}

// Constructs a parser that requires a sequential match of multiple sub-parsers.
function processChain() {
  var handlerGroup = arguments; // Gathers all the sub-parser handlers.

  return function (sourceData, startOffset) {
    var collectedItems = []; // Accumulates the parsed values from successful sub-handlers.
    var advanceIndex = startOffset; // Keeps track of the parsing position.

    // Loop through each parser in the defined sequence.
    for (var idx = 0; idx < handlerGroup.length; idx++) {
      // Execute the current handler from the group.
      var parseState = handlerGroup[idx](sourceData, advanceIndex);
      // If any handler fails to parse, the entire chain fails.
      if (!parseState[0]) {
        return [false, null, startOffset];
      }
      // On success, store the parsed value and update the position for the next handler.
      collectedItems.push(parseState[1]);
      advanceIndex = parseState[2];
    }
    // If all handlers in the chain succeed, return the combined results.
    return [true, collectedItems, advanceIndex];
  };
}

// Implements a parser that is initialized on its first invocation (lazy evaluation).
function deferredParser(creationFunc) {
  var cachedParser; // This variable will hold the parser instance once created.

  return function (inputSource, readPosition) {
    // If the parser has not yet been created, call the provided creation function.
    if (!cachedParser) {
      cachedParser = creationFunc();
    }
    // Once initialized (or if already initialized), use the parser to process the input.
    return cachedParser(inputSource, readPosition);
  };
}

// Creates a parser that transforms the output of another parser using a given function.
function adaptOutput(baseParser, transformationFunction) {
  return function (scanInput, currentOffset) {
    var processingOutcome = baseParser(scanInput, currentOffset); // Execute the primary parser.

    // If the primary parser succeeded, apply the transformation to its result.
    if (processingOutcome[0]) {
      return [processingOutcome[0], transformationFunction(processingOutcome[1]), processingOutcome[2]];
    } else {
      // If the primary parser failed, simply propagate its failure outcome.
      return processingOutcome;
    }
  };
}

// Generates a parser that recognizes any single character from a specified collection.
function recognizeAnyChar(allowedChars) {
  var charMap = {}; // A hash map for efficient checking of allowed characters.
  // Populate the map with characters that are permitted.
  for (var k = 0; k < allowedChars.length; k++) {
    charMap[allowedChars[k]] = allowedChars[k];
  }

  return function (targetStream, currentOffset) {
    // Extract a single character from the target stream at the current position.
    const singleChar = targetStream.substring(currentOffset, currentOffset + 1);
    // Check if the extracted character exists in the map of allowed characters.
    if (charMap[singleChar]) {
      // If it's an allowed character, return success, the character, and the new position.
      return [true, singleChar, currentOffset + 1];
    } else {
      // If not allowed, return failure, null, and the original position.
      return [false, null, currentOffset];
    }
  };
}