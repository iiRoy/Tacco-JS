/*
 * This script processes input data to calculate and sort sums based on specific criteria.
 * It's a variant of a solution for a programming challenge.
 */

'use strict'; // Enforce strict mode for cleaner code

/**
 * The primary function to handle data processing.
 * @param {string} rawInputString - The raw string input from stdin.
 */
function processData(rawInputString) {
  // Trim leading/trailing whitespace and split into individual lines.
  let parsedLines = rawInputString.trim().split('\n');

  // Extract the dimension limits from the first line.
  // These define the bounds for the nested loops and the final slice.
  const dimensionLimits = parsedLines.shift().split(' ');

  // Process the remaining lines: split each line by space.
  // This creates an array of arrays, where each inner array contains string numbers.
  let sortedArrays = parsedLines.map(lineContent => lineContent.split(' '));

  // Initialize an array to store the calculated sums.
  let calculatedSums = [];

  // Sort each inner array in descending numerical order.
  // This is crucial for the optimization where we can 'break' early from the innermost loop.
  sortedArrays.forEach(currentArray => {
    currentArray.sort((firstVal, secondVal) => Number(secondVal) - Number(firstVal));
  });

  // Iterate through the sorted arrays based on the dimension limits.
  // The outer loops iterate up to counts[0] and counts[1] respectively.
  for (let idxA = 0; idxA < dimensionLimits[0]; idxA++) {
    for (let idxB = 0; idxB < dimensionLimits[1]; idxB++) {
      // The innermost loop iterates up to counts[2].
      for (let idxC = 0; idxC < dimensionLimits[2]; idxC++) {
        // Check the product condition for early termination.
        // If (idxA + 1) * (idxB + 1) * (idxC + 1) exceeds 3000,
        // it means subsequent products in this inner loop will also exceed 3000
        // (since idxC is increasing). Due to the descending sort,
        // the sums will also be smaller, so we can break.
        if ((idxA + 1) * (idxB + 1) * (idxC + 1) <= 3000) {
          // Calculate the sum of elements from the three arrays at the current indices.
          // Convert string numbers to actual numbers before summing.
          calculatedSums.push(
            Number(sortedArrays[0][idxA]) +
            Number(sortedArrays[1][idxB]) +
            Number(sortedArrays[2][idxC])
          );
        } else {
          // Break out of the innermost loop if the product condition is violated.
          break;
        }
      }
    }
  }

  // Sort the collected sums in descending order.
  // Then, take only the top 'dimensionLimits[3]' sums.
  calculatedSums = calculatedSums.sort((firstVal, secondVal) => secondVal - firstVal).slice(0, dimensionLimits[3]);

  // Output the final sorted sums, each on a new line.
  console.log(calculatedSums.join('\n'));
}

// Read input from standard input and pass it to the processing function.
processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
