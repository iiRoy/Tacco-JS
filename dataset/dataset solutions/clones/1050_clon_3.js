"use strict";

// This function computes all possible non-zero sums from subsets of an array
// and then checks if a list of query values can be formed by these sums.
const computeSubsetSumsAndMatch = (
  elementCount,   // Denotes 'n', the total number of available elements.
  sourceNumbers,  // Denotes 'as', the array of numbers to form subsets from.
  queryCount,     // Denotes 'q', the count of target values to check.
  targetValues    // Denotes 'ms', the array of target values for the queries.
) => {
  // A Set is used to store the unique sums generated from subsets.
  // This provides efficient O(1) average time complexity for checking
  // if a target value exists among the achievable sums.
  // This is a Type III change: replacing an array and linear search (`indexOf`)
  // with a Set and constant-time lookup (`has`).
  const possibleSums = new Set();

  // The total number of subsets for `elementCount` elements is 2^elementCount.
  // We iterate through each possible subset using a bitmask approach.
  const maximumMaskValue = 1 << elementCount; // Equivalent to Math.pow(2, elementCount)

  // Loop through each bitmask from 0 to (2^elementCount - 1).
  // Each bit in the mask represents the inclusion or exclusion of an element.
  for (let currentMask = 0; currentMask < maximumMaskValue; ++currentMask) {
    let accumulatedSum = 0; // Initialize sum for the current subset.

    // Iterate through each number in the sourceNumbers array.
    for (let currentIdx = 0; currentIdx < elementCount; ++currentIdx) {
      // Check if the 'currentIdx'-th bit is set in the 'currentMask'.
      // If it's set, it means the element at sourceNumbers[currentIdx] is part of the current subset.
      if ((currentMask & (1 << currentIdx)) !== 0) {
        accumulatedSum += sourceNumbers[currentIdx]; // Add the element's value to the sum.
      }
    }

    // If the accumulated sum for the current subset is not zero, add it to our set of possible sums.
    // This condition (ignoring zero sums) is preserved from the original logic.
    if (accumulatedSum !== 0) {
      possibleSums.add(accumulatedSum);
    }
  }

  // Now, process each target value from the query list.
  // The `map` method is employed here for a more functional transformation of the query array
  // into an array of "yes"/"no" strings. This is a Type III change.
  const matchResults = targetValues.map(individualTarget => {
    // Check if the individualTarget exists within our pre-computed set of possible sums.
    return possibleSums.has(individualTarget) ? "yes" : "no";
  });

  return matchResults; // Return the array of "yes" or "no" for each query.
};


// --- Standard Input/Output Handling ---
// This section is responsible for reading input data line by line from stdin
// and then printing the results to stdout.

let currentInputLineNumber = 0; // Counter for the lines read from standard input.
let cachedElementCount = 0;     // Stores 'n' from the first input line.
let cachedSourceNumbers = [];   // Stores 'as' from the second input line.
let cachedQueryCount = 0;       // Stores 'q' from the third input line.
let cachedTargetValues = [];    // Stores 'ms' from the fourth input line.

// Create an interface for reading lines from the standard input stream.
const stdioManager = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout, // Although not used for writing by readline, it's good practice.
});

// Event handler for each line of input received.
stdioManager.on("line", (receivedLine) => {
  currentInputLineNumber++; // Increment the line counter.

  // A switch statement is used to process each line based on its order.
  // This is a Type III change from the original if/else if structure.
  switch (currentInputLineNumber) {
    case 1:
      // First line contains the count of elements (n).
      cachedElementCount = Number(receivedLine);
      // Added input validation (Type III change).
      if (isNaN(cachedElementCount) || cachedElementCount < 0) {
        console.error("Error: Invalid element count detected. Must be a non-negative number.");
        process.exit(1);
      }
      break;

    case 2:
      // Second line contains the space-separated elements (as).
      cachedSourceNumbers = receivedLine
        .trim()
        .split(" ")
        .map((strValue) => {
          const numValue = Number(strValue);
          // Added input validation for each number (Type III change).
          if (isNaN(numValue)) {
            console.error("Error: Non-numeric value found in the source numbers array.");
            process.exit(1);
          }
          return numValue;
        });
      // Added array length validation (Type III change).
      if (cachedSourceNumbers.length !== cachedElementCount) {
        console.error("Error: Mismatch between declared element count and actual array length.");
        process.exit(1);
      }
      break;

    case 3:
      // Third line contains the number of queries (q).
      cachedQueryCount = Number(receivedLine);
      // Added input validation (Type III change).
      if (isNaN(cachedQueryCount) || cachedQueryCount < 0) {
        console.error("Error: Invalid query count detected. Must be a non-negative number.");
        process.exit(1);
      }
      break;

    case 4:
      // Fourth line contains the space-separated target values for queries (ms).
      cachedTargetValues = receivedLine
        .trim()
        .split(" ")
        .map((strValue) => {
          const numValue = Number(strValue);
          // Added input validation for each number (Type III change).
          if (isNaN(numValue)) {
            console.error("Error: Non-numeric value found in the target values array.");
            process.exit(1);
          }
          return numValue;
        });
      // Added array length validation (Type III change).
      if (cachedTargetValues.length !== cachedQueryCount) {
        console.error("Error: Mismatch between declared query count and actual target values array length.");
        process.exit(1);
      }

      // All necessary input has been received. Proceed with computation.
      const finalOutcomes = computeSubsetSumsAndMatch(
        cachedElementCount,
        cachedSourceNumbers,
        cachedQueryCount,
        cachedTargetValues
      );

      // Output each result on a new line.
      // Using `forEach` for output is a Type III change.
      finalOutcomes.forEach((outcomeString) => console.log(outcomeString));

      // Terminate the process cleanly after all output is done.
      process.exit(0);
      break;

    default:
      // Added a default case for unexpected extra input lines (Type III change).
      console.warn(`Warning: Unexpected extra input line encountered at line ${currentInputLineNumber}. Ignoring.`);
      break;
  }
});