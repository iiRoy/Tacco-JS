"use strict";

// Removed Babel-generated helper functions for array/iterable handling.
// These are not essential for the logic and are typically transpiler artifacts
// and are no longer needed due to direct array access and simplified loop structure.

function mainProcess() {
  // ----------
  (function (rawInputData) {
    const inputLinesArray = rawInputData.split("\n");

    // Simplified K extraction by directly accessing the array element,
    // removing the need for _slicedToArray and its associated Babel helpers.
    const limitK = parseNumbersFromString(inputLinesArray[0])[0];

    let currentSuffixString = "";
    let currentOutputDigit = 1;

    // Introduced a temporary constant for clarity and potential future modification.
    const MAX_SINGLE_DIGIT_VALUE = 9;

    // Replaced the Babel-generated for...of loop boilerplate with a standard for loop.
    // This removes all _iterator-related variables and the try...finally block around the loop,
    // making the iteration explicit and simpler.
    for (let iterationIndex = 0; iterationIndex < limitK; iterationIndex++) {
      console.log(`${currentOutputDigit}${currentSuffixString}`);
      currentOutputDigit++;

      // Rewritten condition slightly and utilized the temporary constant for improved readability.
      if (currentOutputDigit > MAX_SINGLE_DIGIT_VALUE) {
        currentOutputDigit = 1;
        currentSuffixString += "0";
      }
    }
  })(require("fs").readFileSync("/dev/stdin", "utf8"));

  // Renamed function for clarity.
  // Simplified its body by removing the redundant Array.isArray check,
  // as it's always called with a string in this specific program's context.
  function parseNumbersFromString(inputString) {
    // Explicitly added radix 10 for parseInt for best practice.
    return inputString.split(/\s+/).map(numStr => parseInt(numStr, 10));
  }

  // The original 'range' generator function is no longer used after the loop simplification,
  // so it has been removed as dead code.
  // ----------
}

mainProcess();
