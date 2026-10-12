"use strict";

// Helper function to map a numeric score to its corresponding output digit.
// This encapsulates the core logic of determining the category based on score ranges.
function determineOutputDigit(scoreValue) {
    let categoryResult = ""; // Initialize with an empty string.
    // Using an if-else if ladder ensures only one condition is met and processed,
    // which is functionally equivalent to the original's series of independent ifs
    // given the mutually exclusive ranges, but structurally different.
    if (scoreValue >= 400 && scoreValue <= 599) {
        categoryResult = "8";
    } else if (scoreValue >= 600 && scoreValue <= 799) {
        categoryResult = "7";
    } else if (scoreValue >= 800 && scoreValue <= 999) {
        categoryResult = "6";
    } else if (scoreValue >= 1000 && scoreValue <= 1199) {
        categoryResult = "5";
    } else if (scoreValue >= 1200 && scoreValue <= 1399) {
        categoryResult = "4";
    } else if (scoreValue >= 1400 && scoreValue <= 1599) {
        categoryResult = "3";
    } else if (scoreValue >= 1600 && scoreValue <= 1799) {
        categoryResult = "2";
    } else if (scoreValue >= 1800 && scoreValue <= 1999) {
        categoryResult = "1";
    }
    // If no condition is met, categoryResult remains "", matching the original's
    // behavior for inputs outside the specified ranges (no output).
    return categoryResult;
}

// Main processing function, renamed from 'main' to 'processInput'.
function processInput(rawData) {
  // Use const for values that do not change after their initial assignment.
  const cleanedInputString = rawData.trim();
  // Explicitly specify radix 10 for parseInt for robustness and clarity.
  const numericScore = parseInt(cleanedInputString, 10);

  // Call the helper function to get the determined output value.
  const finalOutputValue = determineOutputDigit(numericScore);

  // Only log if a valid output was determined. This acts as a guard clause
  // and preserves the original behavior of not logging for out-of-range inputs.
  if (finalOutputValue !== "") {
    console.log(finalOutputValue);
  }
}

// Unused utility function, renamed from 'numberSort' to 'sortNumbersAscending'.
function sortNumbersAscending(numericArray) {
  // The original 'f' comparator function is now defined inline as an arrow function.
  // This is a structural change while preserving the exact ascending sorting logic.
  numericArray.sort((valueA, valueB) => valueA - valueB);
  return numericArray;
}

// The original 'f' comparator variable is no longer needed as a global variable
// because its logic has been inlined into 'sortNumbersAscending'.

// Execution block: Reads input from stdin and passes it to the main processing function.
// This part remains largely the same as it interacts with the external environment.
processInput(require("fs").readFileSync("/dev/stdin", "utf-8"));
