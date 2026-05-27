'use strict';

/**
 * This function processes a given raw input string to perform a specific calculation.
 * It expects the input to be newline-separated numbers, with the first line
 * typically being a count that is then discarded.
 *
 * @param {string} rawData - The complete input string, usually read from a source like stdin.
 */
const processData = (rawData) => {
  // First, split the incoming string by newline characters.
  // Then, convert each resulting string segment into a numerical value.
  // This creates an array of numbers from the input.
  const temporaryNumbers = rawData.split('\n').map((numStr) => Number(numStr));

  // The initial element of the array is often a count or header,
  // which is not part of the actual data for this calculation, so it's removed.
  temporaryNumbers.shift();

  // Sort the remaining numerical values in descending order.
  // The comparison function (valB - valA) ensures that larger numbers come first.
  let sortedNumbers = temporaryNumbers.sort((valA, valB) => valB - valA);

  // Initialize the final accumulated result.
  // The largest number (which is the first element after sorting) is divided by two.
  let finalResult = sortedNumbers[0] / 2;

  // Iterate through the rest of the sorted numbers, starting from the second element.
  // Each subsequent number is added to the running total.
  for (let idx = 1; idx < sortedNumbers.length; idx++) {
    finalResult += sortedNumbers[idx];
  }

  // Display the computed final result to the standard output.
  console.log(finalResult);
};

// The program execution starts here.
// It reads the entire content of the standard input stream synchronously,
// using UTF-8 encoding, and then passes this content to the 'processData' function.
processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
