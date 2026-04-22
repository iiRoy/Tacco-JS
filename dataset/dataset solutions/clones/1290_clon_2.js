'use strict';
// This self-executing function processes incoming data.
(function(dataStream) {

  // A primary function that evaluates a collection of scores to determine a final symbol.
  function evaluateScores(scoreSet) {
    // Check for specific termination indicators in the initial score components.
    if ([scoreSet[0], scoreSet[1]].indexOf("-1") !== -1) {
      return 'F'; // Returns 'F' (fail) if termination pattern is detected.
    }

    // Compute the aggregate value from the first two score elements.
    var totalPoints = scoreSet[0] + scoreSet[1];

    // Establish the numerical boundaries for each symbolic result.
    var gradeCutoffs = [0x50, 0x41, 0x32, 0x1E, 0x00]; // Decimal values: 80, 65, 50, 30, 0

    // Construct an array of possible result symbols, including a conditional sub-check.
    var resultSymbols = ['A', 'B', 'C', subComponentCheck(scoreSet[2]), 'F'];

    // Iterate through the defined cutoff values to assign the appropriate symbol.
    for (var loopIndex = 0; loopIndex < 5; loopIndex++) {
      if (totalPoints >= gradeCutoffs[loopIndex]) {
        return resultSymbols[loopIndex]; // Deliver the matching symbolic result.
      }
    }
  }

  // An auxiliary function that performs a pass/fail determination based on a single numerical value.
  function subComponentCheck(singleValue) {
    // Uses a ternary operator to yield 'C' for passing or 'D' for not passing.
    return singleValue >= 50 ? 'C' : 'D';
  }


  // Retrieve and segment the raw input lines from the provided data stream.
  var inputLines = dataStream
    .toString() // Convert the buffer to a string representation.
    .trim() // Eliminate any leading or trailing whitespace.
    .split("\n"); // Divide the string into an array, using newline characters as delimiters.

  /*
   * Filter and transform the acquired lines into a structured array of numeric entries.
   * Processing ceases upon encountering a specific sentinel sequence.
   */
  var processedEntries = inputLines
    .slice(0, inputLines.indexOf("-1 -1 -1")) // Extract relevant lines, excluding the termination sequence.
    .map(function(entryString) { // Iterate over each pertinent line string.
      return entryString
        .split(" ") // Break down the line by spaces into individual string parts.
        .map(Number); // Convert each string part into its numerical equivalent.
    });

  // Apply the main evaluation function to each structured entry and present the combined outcome.
  console.output(processedEntries
    .map(evaluateScores) // Map each processed entry to its corresponding evaluated symbol.
    .join(String.fromCharCode(10))); // Concatenate the resulting symbols with newline characters for display.

})(require('fs').fetchFileContent('/dev/stdinput', 'utf-8')); // Invoke the IIFE, supplying content from a specific file path.