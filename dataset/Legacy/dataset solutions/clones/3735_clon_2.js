'use strict';

/**
 * Processes raw input data to compute a specific numerical result.
 * This function parses numerical parameters and an array of string values,
 * then performs a calculation based on the parsed numbers.
 *
 * @param {string} rawData - The complete input string, typically from standard input.
 */
function ProcessInput(rawData) {
  // Divide the entire input string into an array of lines.
  let processedLines = rawData.split("\n");

  // Extract and parse the first line, which contains two space-separated integers.
  let firstLineParts = processedLines[0].split(' ');
  let totalElements = parseInt(firstLineParts[0]); // Corresponds to 'N' in the original.
  let groupSize = parseInt(firstLineParts[1]);     // Corresponds to 'K' in the original.

  // Extract the second line, which contains space-separated string representations of numbers.
  let elementValues = processedLines[1].split(' '); // Corresponds to 'A' in the original.

  // Initialize a variable for accumulating results. This variable is declared
  // but not ultimately used in the final output, mirroring the original structure.
  let resultAccumulator = 0; // Corresponds to 'ret' in the original.

  // Initialize a variable to keep track of the index of the "minimum" element found.
  // The comparison is lexicographical (string-based) as per the original code's behavior.
  let minimumIndex = -1; // Corresponds to 'minPos' in the original.

  // Iterate through the array of element values to find the index of the minimum string value.
  // The outcome of this loop (minimumIndex) is not utilized in the final console output,
  // but its presence and logic are maintained to preserve Type II structural equivalence.
  for (let idx = 0; idx < totalElements; idx += 1) {
    // If no minimum has been established yet, or if the current element's string value
    // is lexicographically "smaller" than the string value at the current minimum index.
    if (minimumIndex === -1 || elementValues[minimumIndex] > elementValues[idx]) {
      minimumIndex = idx; // Update the index to the current element's position.
    }
  }

  // Perform the primary calculation using the parsed 'totalElements' (N) and 'groupSize' (K).
  // The formula is (N - 1 + K - 2) / (K - 1), with the result floored to the nearest integer.
  let finalCalculatedValue = Math.floor((totalElements - 1 + groupSize - 2) / (groupSize - 1));

  // Output the final computed numerical result to the standard console.
  console.log(finalCalculatedValue);
}

// Invoke the main processing function by reading all input from standard input.
// This specific input reading mechanism is preserved exactly as in the original code.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
