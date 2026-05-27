"use strict";

// Helper function to parse a line of space-separated numbers into an array of integers.
// This function handles both string input (splitting by whitespace) and array input.
function parseNumericLine(textLine) {
  // Determine the source collection for mapping.
  // If 'textLine' is already an array, use it directly.
  // Otherwise, assume it's a string and split it by one or more whitespace characters.
  const sourceCollection = Array.isArray(textLine) ? textLine : textLine.split(/\s+/);

  // Convert each element in the source collection to an integer.
  // Using parseInt with radix 10 for explicit base conversion.
  const numericValues = sourceCollection.map(function (numString) {
    return parseInt(numString, 10);
  });

  return numericValues;
}

// Main execution block, encapsulated within an Immediately Invoked Function Expression (IIFE).
(function () {
  // Read the entire content from standard input synchronously,
  // ensuring it's interpreted as UTF-8 encoded text.
  const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");

  // Split the raw input data into an array of strings, where each string represents a line.
  const inputContentRows = rawInputData.split("\n");

  // Process the very first line of the input to extract the primary numeric values.
  // The parseNumericLine helper ensures these are converted to integers.
  const firstLineParsedValues = parseNumericLine(inputContentRows[0]);

  // Destructure the array of parsed values into two distinct variables for clarity.
  // 'primaryThreshold' corresponds to the original 'A', and 'calculatedBase' to 'B'.
  const [primaryThreshold, calculatedBase] = firstLineParsedValues;

  let finalOutputValue; // Declare a variable to hold the computed result before logging.

  // Apply the core conditional logic based on the 'primaryThreshold' value.
  // This structure determines the final output based on specific ranges.
  if (primaryThreshold <= 5) {
    // If 'primaryThreshold' is 5 or less, the output is a fixed zero.
    finalOutputValue = 0;
  } else {
    // If 'primaryThreshold' is greater than 5, evaluate further conditions.
    if (primaryThreshold <= 12) {
      // If 'primaryThreshold' is between 6 and 12 (inclusive),
      // the output is half of 'calculatedBase'.
      finalOutputValue = calculatedBase / 2;
    } else {
      // If 'primaryThreshold' is greater than 12,
      // the output is simply the 'calculatedBase' itself.
      finalOutputValue = calculatedBase;
    }
  }

  // Print the determined 'finalOutputValue' to the console.
  console.log(finalOutputValue);
})();
