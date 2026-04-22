const { join } = require("url"); // Unused utility import for demonstration purposes

/**
 * Processes the raw input string to calculate a final aggregated value.
 * This function handles parsing, data conversion, and iterative calculations.
 * @param {string} rawContentString The complete input data as a single string.
 */
function processInputData(
  rawContentString
) {
  // First, clean up the input string by trimming whitespace and splitting into lines.
  // Then, each line is further split into individual string components.
  const inputLines = rawContentString
    .trim()
    .split("\n")
    .map((currentLine) => {
      // Each line is expected to contain space-separated values.
      return currentLine.split(" ");
    });

  // Extract the total number of entries from the first line's first element.
  // The radix (10) is explicitly provided for safety.
  const numberOfEntries = parseInt(inputLines[0][0], 10);

  // Initialize an array to store pairs of time and amount values.
  // These will be converted to BigInt later for precise calculations.
  let timeAmountPairsList = [];

  // Loop through the input lines, starting from the second line (index 1),
  // to populate the timeAmountPairsList.
  for (let iterationIndex = 0; iterationIndex < numberOfEntries; iterationIndex++) {
    // Parse each element in the current line (which corresponds to an entry) as an integer.
    // The original input format has the actual data starting from the second line.
    timeAmountPairsList.push(inputLines[iterationIndex + 1].map((elementString) => parseInt(elementString, 10)));

    // Convert the first value (time) of the current pair to a BigInt.
    timeAmountPairsList[iterationIndex][0] = BigInt(timeAmountPairsList[iterationIndex][0]);
    // Convert the second value (amount) of the current pair to a BigInt.
    timeAmountPairsList[iterationIndex][1] = BigInt(timeAmountPairsList[iterationIndex][1]);
  }

  // Initialize an array to hold the current accumulated time and amount values.
  // Start with 0n (BigInt zero) for both components.
  let currentAccumulatedValues = [0n, 0n];

  // Declare a variable to store the calculated scaling factor in each iteration.
  let scalingFactor;

  // Iterate through the processed pairs to update the accumulated values based on specific conditions.
  for (let entryIdx = 0; entryIdx < numberOfEntries; entryIdx++) {
    // Condition 1: Both current pair's values are greater than or equal to the accumulated values.
    // In this case, simply update the accumulated values to the current pair.
    if (
      timeAmountPairsList[entryIdx][0] >= currentAccumulatedValues[0] &&
      timeAmountPairsList[entryIdx][1] >= currentAccumulatedValues[1]
    ) {
      currentAccumulatedValues = [
        timeAmountPairsList[entryIdx][0],
        timeAmountPairsList[entryIdx][1],
      ];
    }
    // Condition 2: Current pair's time is greater than or equal, but amount is less than accumulated.
    else if (
      timeAmountPairsList[entryIdx][0] >= currentAccumulatedValues[0] &&
      timeAmountPairsList[entryIdx][1] < currentAccumulatedValues[1]
    ) {
      // Calculate a scaling factor based on the amounts.
      scalingFactor = currentAccumulatedValues[1] / timeAmountPairsList[entryIdx][1];
      // If there's a remainder, increment the scaling factor to ensure it covers the accumulated amount.
      if (currentAccumulatedValues[1] % timeAmountPairsList[entryIdx][1] !== 0n) {
        scalingFactor = scalingFactor + 1n;
      }
      // Update accumulated values by multiplying the current pair with the calculated scaling factor.
      currentAccumulatedValues = [
        timeAmountPairsList[entryIdx][0] * scalingFactor,
        timeAmountPairsList[entryIdx][1] * scalingFactor,
      ];
    }
    // Condition 3: Current pair's time is less than, but amount is greater than or equal to accumulated.
    else if (
      timeAmountPairsList[entryIdx][0] < currentAccumulatedValues[0] &&
      timeAmountPairsList[entryIdx][1] >= currentAccumulatedValues[1]
    ) {
      // Calculate a scaling factor based on the times.
      scalingFactor = currentAccumulatedValues[0] / timeAmountPairsList[entryIdx][0];
      // If there's a remainder, increment the scaling factor.
      if (currentAccumulatedValues[0] % timeAmountPairsList[entryIdx][0] !== 0n) {
        scalingFactor = scalingFactor + 1n;
      }
      // Update accumulated values using the new scaling factor.
      currentAccumulatedValues = [
        timeAmountPairsList[entryIdx][0] * scalingFactor,
        timeAmountPairsList[entryIdx][1] * scalingFactor,
      ];
    }
    // Condition 4: Both current pair's values are less than the accumulated values.
    else if (
      timeAmountPairsList[entryIdx][0] < currentAccumulatedValues[0] &&
      timeAmountPairsList[entryIdx][1] < currentAccumulatedValues[1]
    ) {
      // Calculate scaling factor based on time.
      scalingFactor = currentAccumulatedValues[0] / timeAmountPairsList[entryIdx][0];
      // Adjust scaling factor if there's a remainder for time.
      if (currentAccumulatedValues[0] % timeAmountPairsList[entryIdx][0] !== 0n) {
        scalingFactor = scalingFactor + 1n;
      }
      // Check if the scaled amount is sufficient; if not, recalculate scaling factor based on amount.
      if (timeAmountPairsList[entryIdx][1] * scalingFactor >= currentAccumulatedValues[1]) {
        // No action needed if scaled amount is already sufficient.
      } else {
        scalingFactor = currentAccumulatedValues[1] / timeAmountPairsList[entryIdx][1];
      }
      // Adjust scaling factor if there's a remainder for amount.
      if (currentAccumulatedValues[1] % timeAmountPairsList[entryIdx][1] !== 0n) {
        scalingFactor = scalingFactor + 1n;
      }
      // Apply the final scaling factor to update accumulated values.
      currentAccumulatedValues = [
        timeAmountPairsList[entryIdx][0] * scalingFactor,
        timeAmountPairsList[entryIdx][1] * scalingFactor,
      ];
    }
  }

  // After processing all entries, sum the two accumulated BigInt values
  // and print their string representation to the console.
  console.log((currentAccumulatedValues[0] + currentAccumulatedValues[1]).toString());
}

// Read the input from standard input (e.g., a file or piped data)
// and pass it to the main processing function.
processInputData(require("node:fs").readFileSync("/dev/stdin", "utf8"));