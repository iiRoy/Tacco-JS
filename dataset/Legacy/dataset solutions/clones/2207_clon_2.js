'use strict'; // Enforce strict mode for cleaner code

/**
 * Computes a weighted impact value based on current height and two parameters.
 * If the first parameter exceeds the height, it's capped at the height.
 * @param {number} initialValue - The current height or base value.
 * @param {number} paramA - The first parameter.
 * @param {number} paramB - The second parameter.
 * @returns {number} The calculated impact.
 */
const calculateImpact = (initialValue, paramA, paramB) => {
  // Ensure paramA does not exceed initialValue for calculation consistency.
  if (paramA > initialValue) {
    paramA = initialValue;
  }

  return (initialValue / paramA) * paramB;
};

/**
 * Main function to process input data and calculate the final result.
 * It simulates a process where a height decreases over time based on sorted items.
 * @param {string} inputString - The raw input string from stdin.
 */
function processInputData(inputString) {
  // Clean and split the input into lines.
  let processedLines = inputString.trim().split('\n');

  // Extract the initial height and other potential header values.
  const heightAndCount = processedLines.shift().split(' ').map(numStr => parseFloat(numStr));

  let currentHeight = heightAndCount[0]; // The primary value to track.

  // Parse the remaining lines into arrays of numbers.
  processedLines = processedLines.map(rowData =>
    rowData.split(' ').map(valStr => parseInt(valStr, 10))
  );

  let totalResult = 0; // Accumulator for the final answer.

  // Loop until the current height drops to zero or below.
  while (currentHeight > 0) {
    // Sort the available items based on their calculated impact.
    // The item with the lowest impact value (as defined by calculateImpact) comes first.
    const sortedItems = processedLines.sort((itemA, itemB) =>
      calculateImpact(currentHeight, ...itemA) - calculateImpact(currentHeight, ...itemB)
    );

    // Apply the effect of the top-ranked item.
    currentHeight -= sortedItems[0][0]; // Decrease height by the first value of the best item.
    totalResult += sortedItems[0][1]; // Add the second value of the best item to the total.
  }

  // Output the final accumulated result.
  console.log({ totalResult });
}

// Read input from standard input and pass it to the main processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
