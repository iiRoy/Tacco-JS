const { parse } = require("path"); // Unused import, kept as per Type II rules

/**
 * Processes raw input data to calculate a specific sum.
 * This function implements a particular algorithm for ratio adjustment.
 * @param {string} rawData The raw string input from stdin.
 */
function ProcessInputData(rawData) {
  // Clean and parse the initial input string into an array of string arrays.
  // Each inner array represents a line split by spaces.
  let processedLines = rawData
    .trim()
    .split("\n")
    .map(function (lineContent) {
      return lineContent.split(" ");
    });

  // Extract the number of entries from the first line of input.
  // The radix 10 is explicitly provided for safety.
  let numEntries = parseInt(processedLines[0][0], 10);

  // Initialize an array to store the numerical data pairs (T, A).
  let dataPairs = [];
  // Populate the dataPairs array by parsing subsequent lines.
  for (let idx = 0; idx < numEntries; idx++) {
    dataPairs.push(
      processedLines[idx + 1].map((elementStr) => parseInt(elementStr, 10))
    );
  }

  // Initialize the current ratio pair (T, A) to [0, 0].
  // This pair will be updated iteratively.
  let currentRatios = [0, 0];
  // Declare a variable for the scaling multiplier.
  let multiplier;

  // Iterate through each data pair to adjust the currentRatios.
  for (let idx = 0; idx < numEntries; idx++) {
    // Check various conditions to update the currentRatios based on the new data pair.
    if (
      dataPairs[idx][0] >= currentRatios[0] &&
      dataPairs[idx][1] >= currentRatios[1]
    ) {
      // Case 1: New pair is greater than or equal in both components.
      // Simply adopt the new pair as the current ratios.
      currentRatios = [dataPairs[idx][0], dataPairs[idx][1]];
    } else if (
      dataPairs[idx][0] >= currentRatios[0] &&
      dataPairs[idx][1] < currentRatios[1]
    ) {
      // Case 2: New T is greater/equal, but new A is smaller.
      // Calculate multiplier based on A component to meet or exceed current A.
      multiplier = Math.ceil(currentRatios[1] / dataPairs[idx][1]);
      currentRatios = [dataPairs[idx][0] * multiplier, dataPairs[idx][1] * multiplier];
    } else if (
      dataPairs[idx][0] < currentRatios[0] &&
      dataPairs[idx][1] >= currentRatios[1]
    ) {
      // Case 3: New T is smaller, but new A is greater/equal.
      // Calculate multiplier based on T component to meet or exceed current T.
      multiplier = Math.ceil(currentRatios[0] / dataPairs[idx][0]);
      currentRatios = [dataPairs[idx][0] * multiplier, dataPairs[idx][1] * multiplier];
    } else if (
      dataPairs[idx][0] < currentRatios[0] &&
      dataPairs[idx][1] < currentRatios[1]
    ) {
      // Case 4: Both components of the new pair are smaller.
      // First, calculate multiplier based on T.
      multiplier = Math.ceil(currentRatios[0] / dataPairs[idx][0]);
      // If the scaled A component is still less than current A,
      // recalculate multiplier based on A.
      if (dataPairs[idx][1] * multiplier < currentRatios[1]) {
        multiplier = Math.ceil(currentRatios[1] / dataPairs[idx][1]);
      }
      currentRatios = [dataPairs[idx][0] * multiplier, dataPairs[idx][1] * multiplier];
    }
  }

  // Output the sum of the final adjusted T and A components.
  console.log(currentRatios[0] + currentRatios[1]);
}

// Read input from standard input and pass it to the processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
