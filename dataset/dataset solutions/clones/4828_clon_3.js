"use strict";

/**
 * A utility function to reverse the order of characters within a given string.
 * This function is crucial for processing strings in a reversed manner.
 * @param {string} sourceText - The string whose characters need to be inverted.
 * @returns {string} The string with its characters in reverse order. Returns an empty string if input is not a string.
 */
function invertString(sourceText) {
  // Basic validation: ensure the input is indeed a string.
  if (typeof sourceText !== 'string') {
    return '';
  }
  // The core logic: split into characters, reverse the array, then join back.
  return sourceText.split("").reverse().join("");
}

/**
 * Handles the final output to the console.
 * This abstraction allows for easier modification of output behavior if needed.
 * @param {string} messageToDisplay - The string message to be printed.
 */
function showFinalResult(messageToDisplay) {
  console.log(messageToDisplay);
}

/**
 * The primary function that orchestrates the string analysis process.
 * It determines if an input string can be decomposed based on a predefined set of reversed segments.
 * @param {string} incomingData - The initial string provided for analysis.
 */
function analyzeStringDecomposition(incomingData) {
  // Define the core segments that will be used for decomposition.
  // These are the building blocks of the analysis.
  const elementarySegments = ["dream", "dreamer", "erase", "eraser"];

  // Create a new array containing the reversed versions of the elementary segments.
  // This pre-processing step avoids repeated reversal within the main loop.
  const reversedElementarySegments = elementarySegments.map(segment => invertString(segment));

  // The string being processed is also reversed initially,
  // aligning with the reversed segments for consistent matching.
  let processingString = invertString(incomingData);

  // Main iterative loop: attempts to progressively remove prefixes from the processing string.
  // It continues as long as a valid segment can be found and removed.
  while (true) {
    let segmentWasConsumed = false; // Flag to track if any segment was successfully matched and removed in this iteration.

    // Iterate through each of the pre-reversed elementary segments.
    for (const currentSegmentCandidate of reversedElementarySegments) {
      // Extract a prefix from the processing string that has the same length as the current candidate.
      const currentPrefix = processingString.substring(0, currentSegmentCandidate.length);

      // Check if the extracted prefix matches the current segment candidate.
      if (currentPrefix === currentSegmentCandidate) {
        // If a match is found, remove the matched prefix from the processing string.
        processingString = processingString.substring(currentSegmentCandidate.length);
        segmentWasConsumed = true; // Set the flag to indicate a successful consumption.
        break; // Exit the inner loop as a match has been handled for this iteration.
      }
    }

    // If no segment was consumed during the entire inner loop,
    // it means no further decomposition is possible.
    if (!segmentWasConsumed) {
      break; // Terminate the main processing loop.
    }

    // Optional early exit: If the processing string becomes empty,
    // we can conclude successfully and exit the loop.
    if (processingString.length === 0) {
      break;
    }
  }

  // After the loop, determine the final outcome.
  // If the processing string is entirely consumed (empty), it's a success.
  const finalVerdict = (processingString.length === 0) ? "YES" : "NO";

  // Display the determined outcome using the helper function.
  showFinalResult(finalVerdict);
}

// Standard boilerplate for reading input in Node.js environments
// when targeting competitive programming platforms like AtCoder.
const nodeFileSystem = require("fs"); // Using a descriptive variable name for the fs module.
const rawInputContent = nodeFileSystem.readFileSync("/dev/stdin", "utf-8");

// Initiate the analysis process with the obtained input data.
analyzeStringDecomposition(rawInputContent);