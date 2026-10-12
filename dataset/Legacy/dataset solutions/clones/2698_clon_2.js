'use strict'; // Enforce strict parsing and error handling

/**
 * Primary function to handle program execution.
 * @param {string} rawData - The entire input string from stdin.
 */
function processInput(rawData) {
  // Split the input into individual lines.
  const inputLines = rawData.split('\n');
  // Remove the last (potentially empty) line.
  inputLines.pop();

  // Parse the first line to get the count of elements.
  const elementCount = parseInt(inputLines[0], 10);

  // Process the second line: split by space, then convert each part to an integer.
  const numericSequence = inputLines[1].split(' ').map(itemStr => {
    return parseInt(itemStr, 10); // Convert string item to integer.
  });

  // Call the analysis function and print its result to the console.
  console.log(analyzeSequence(numericSequence));
}

/**
 * Analyzes a given numeric sequence to determine if it meets specific criteria.
 * @param {number[]} originalSequence - The array of numbers to analyze.
 * @returns {string} 'YES' if the criteria are met, otherwise 'NO'.
 */
function analyzeSequence(originalSequence) {
  // Create a copy of the original sequence to preserve its order.
  const preservedSequence = originalSequence.slice();
  // Create a sorted version of the original sequence.
  const orderedSequence = originalSequence.sort((a, b) => a - b); // Ensure numeric sort.

  // Log the original and sorted sequences for debugging/observation.
  console.log(preservedSequence);
  console.log(orderedSequence);

  let idx = 0; // Initialize an index for iteration.
  let diffCount = 0; // Initialize a counter for differing elements.

  // Iterate through the sequences as long as the index is within bounds
  // and the difference count is not excessively high.
  while (idx < preservedSequence.length && diffCount <= 3) {
    // If an element in the preserved sequence does not match the sorted sequence at the same position,
    // increment the difference counter.
    if (preservedSequence[idx] !== orderedSequence[idx]) {
      diffCount++;
    }
    idx++; // Move to the next element.
  }

  // If the total number of differences is less than 3, return 'YES'.
  if (diffCount < 3) {
    return 'YES';
  }
  // Otherwise, return 'NO'.
  return 'NO';
}

// Read input from standard input and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
