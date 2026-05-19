'use strict';

// Helper function to count the number of set bits (1s) in a given integer.
// This uses Brian Kernighan's algorithm, which is an efficient way to count set bits.
function countSetBitsInNumber(value) {
  let bitCount = 0;
  let tempValue = value;
  while (tempValue > 0) {
    tempValue &= (tempValue - 1); // This operation clears the least significant set bit
    bitCount++;
  }
  return bitCount;
}

function processInput(rawData) {
  const inputLines = rawData.split('\n');

  // The first line contains the number of businesses (N).
  const numBusinesses = parseInt(inputLines[0], 10);

  // The remaining lines contain the business opening schedules and profit matrices.
  // We slice the array to remove the 'N' line, making indexing simpler for F and P.
  const dataLines = inputLines.slice(1);

  // A reusable function to parse a string of space-separated integers into an array of numbers.
  const parseLineOfInts = (lineStr) => lineStr.split(' ').map(valStr => parseInt(valStr, 10));

  // Populate the business opening schedules (F).
  // These are the first 'numBusinesses' lines after 'N'.
  const businessOpenings = [];
  for (let businessIdx = 0; businessIdx < numBusinesses; businessIdx++) {
    businessOpenings.push(parseLineOfInts(dataLines[businessIdx]));
  }

  // Populate the profit matrix (P).
  // These are the next 'numBusinesses' lines after the business opening schedules.
  const profitMatrix = [];
  const profitLinesStartIndex = numBusinesses; // Index where profit data starts in dataLines
  for (let businessIdx = 0; businessIdx < numBusinesses; businessIdx++) {
    profitMatrix.push(parseLineOfInts(dataLines[profitLinesStartIndex + businessIdx]));
  }

  let maxProfit = -Infinity; // Initialize the maximum profit found to a very small number.

  // The problem implies 10 possible opening hours (0-9), so 2^10 combinations.
  // We iterate through all possible combinations of open hours from 1 to 1023 (inclusive).
  const totalCombinations = 1 << 10; // Equivalent to Math.pow(2, 10) or 1024

  for (let currentCombination = 1; currentCombination < totalCombinations; currentCombination++) {
    let currentCombinationProfit = 0; // Profit for the current combination of open hours.

    // For each combination, calculate the total profit across all businesses.
    for (let businessIdx = 0; businessIdx < numBusinesses; businessIdx++) {
      const currentBusinessSchedule = businessOpenings[businessIdx];

      // Convert the business schedule array (e.g., [0,1,0,1,...]) into a binary string
      // and then parse it as a base-2 integer.
      const scheduleBinaryString = currentBusinessSchedule.join('');
      const scheduleDecimalValue = parseInt(scheduleBinaryString, 2);

      // Perform a bitwise AND operation between the business's schedule and the
      // current combination of open hours. This identifies common open hours.
      const commonHoursBitmask = scheduleDecimalValue & currentCombination;

      // Count the number of set bits in the result of the bitwise AND.
      // This count represents how many hours are common between the business's
      // schedule and the current combination.
      const commonOpenHoursCount = countSetBitsInNumber(commonHoursBitmask);

      // Add the corresponding profit from the profit matrix for this business.
      // The index into the profit matrix is the count of common open hours.
      currentCombinationProfit += profitMatrix[businessIdx][commonOpenHoursCount];
    }

    // Update the overall maximum profit if the current combination yields a higher profit.
    maxProfit = Math.max(maxProfit, currentCombinationProfit);
  }

  console.log(maxProfit); // Output the final maximum profit.
}

// Read input from standard input and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
