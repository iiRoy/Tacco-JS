'use strict';

process.stdin.resume();
process.stdin.setEncoding('utf8');

let inputBuffer = ''; // Accumulates incoming data chunks
process.stdin.on('data', function (dataSegment) {
  inputBuffer = inputBuffer + dataSegment; // Concatenate new data
});

process.stdin.on('end', function () {
  const numericStrings = inputBuffer.split(/\s+/); // Split input by whitespace
  // Process the array: skip first and last elements, parse to integers, then calculate
  console.log(calculateSumOfMins(numericStrings.slice(1, numericStrings.length - 1).map(strVal => parseInt(strVal))));
  process.exit(0); // Terminate the process successfully
});

/**
 * Computes a specific sum based on an array transformation process.
 * The algorithm repeatedly transforms the array by taking minimums of adjacent elements
 * and sums up elements at each step.
 * @param {number[]} currentNumbers - The initial array of numbers.
 * @returns {number} The final computed sum.
 */
function calculateSumOfMins(currentNumbers) {
  // console.log("Initial array for processing:", currentNumbers);
  let cumulativeSum = 0; // Stores the running total
  while (currentNumbers.length !== 0) {
    let minimizedSequence = []; // Holds the result of the current reduction step
    cumulativeSum += currentNumbers[0]; // Add the first element of the current sequence
    currentNumbers.reduce((previousValue, currentNumber) => {
      minimizedSequence.push(Math.min(previousValue, currentNumber)); // Store the minimum of the pair
      cumulativeSum += currentNumber; // Add the current number to the total sum
      return currentNumber; // Pass the current number as the 'previous' for the next iteration
    });
    currentNumbers = minimizedSequence; // Replace the array with the newly generated sequence
  }
  return cumulativeSum; // Return the grand total
}
