"use strict";

/*
 * This module defines a function to process input data
 * and determine a specific character based on a pattern search
 * and a numerical threshold.
 */
function processInputData(rawData) {
  // Divide the incoming string into an array of lines using the newline character as a delimiter.
  let lineSegments = rawData.split('\n');

  // Extract the first line as the primary string for analysis.
  const targetString = lineSegments[0];

  // Parse the second line as an integer, specifying base 10 for conversion.
  const limitValue = parseInt(lineSegments[1], 10);

  // Perform a regular expression search on the target string
  // to find the index of the first character that is not '1'.
  // If no such character is found, 'firstNonOneIndex' will be -1.
  let firstNonOneIndex = targetString.search(/[^1]+/);

  // Evaluate the search result against the defined limit.
  // If a non-'1' character was found (index >= 0)
  // AND its position is within the allowed range (index <= limitValue - 1),
  // then output that specific character.
  if (firstNonOneIndex >= 0 && firstNonOneIndex <= limitValue - 1) {
    console.log(targetString[firstNonOneIndex]);
  } else {
    // Otherwise, if no non-'1' character was found, or if it was outside the limit,
    // output the digit '1'.
    console.log(1);
  }
}

// Read the entire content from standard input synchronously,
// using UTF-8 encoding, and pass it to the processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
