'use strict'; // Enforce strict mode for cleaner code execution

/**
 * Processes raw input data to determine if the largest number in a sequence
 * is less than the sum of the remaining numbers.
 *
 * @param {string} rawTextContent - The multi-line string containing input data.
 *                                  Expected format:
 *                                  Line 1: An integer (N, count of numbers, but not directly used here)
 *                                  Line 2: Space-separated integers representing the sequence.
 */
function processInputData(rawTextContent) {
  // Guard clause for empty input
  if (!rawTextContent || rawTextContent.trim().length === 0) {
    console.error("Error: Input content is empty.");
    return;
  }

  // Divide the complete input string into individual lines
  const inputRows = rawTextContent.split('\n');

  // Basic validation: ensure we have at least two lines for processing
  if (inputRows.length < 2) {
    console.error("Error: Insufficient input lines provided.");
    return;
  }

  // The first line often contains a count (N), but for this specific problem,
  // its direct value isn't utilized in the core logic.
  // We'll skip parsing it directly as it's not essential for the comparison.
  // const initialCount = Number.parseInt(inputRows[0], 10); // Example of parsing if needed

  // Extract the second line which holds the numeric sequence
  const numberSequenceLine = inputRows[1];

  // Validate the number sequence line
  if (!numberSequenceLine || numberSequenceLine.trim().length === 0) {
    console.error("Error: Numeric sequence line is empty or invalid.");
    return;
  }

  // Split the string by one or more whitespace characters, convert each part to a float,
  // and filter out any non-numeric results (NaN) to ensure data integrity.
  const parsedNumbers = numberSequenceLine
    .split(/\s+/)
    .map(numericString => parseFloat(numericString))
    .filter(value => !isNaN(value));

  // If after parsing and filtering, no valid numbers remain, output an error.
  if (parsedNumbers.length === 0) {
    console.error("Error: No valid numbers found in the sequence.");
    return;
  }

  // Sort the array of numbers in descending order to easily extract the largest value.
  // This is an alternative to sorting ascending and then using pop().
  parsedNumbers.sort((valA, valB) => valB - valA);

  // Extract the largest value from the beginning of the sorted array.
  // The shift() method also removes it from the array.
  const greatestValue = parsedNumbers.shift();

  // Initialize a variable to accumulate the sum of the remaining elements.
  let sumOfOthers = 0;

  // Iterate over the remaining numbers in the array using a for...of loop
  // and sum them up. This replaces the reduce() method.
  for (const currentElement of parsedNumbers) {
    sumOfOthers += currentElement;
  }

  // Determine if the greatest value is strictly less than the sum of the rest.
  // Introduce a temporary boolean variable for clarity.
  const isFeasibleConditionMet = greatestValue < sumOfOthers;

  // Output the result based on the comparison.
  // Using an if/else block instead of a ternary for output.
  if (isFeasibleConditionMet) {
    console.log('Yes');
  } else {
    console.log('No');
  }
}

// Invoke the main processing function with data read from standard input.
// This assumes a Node.js environment where 'fs' module is available.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));