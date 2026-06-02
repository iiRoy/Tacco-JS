'use strict'; // Enforce strict mode for cleaner code execution

/**
 * Processes the raw input data to perform a specific string manipulation.
 * This function takes the entire input as a single string.
 * @param {string} rawInputData - The complete input string, typically from stdin.
 */
const executeProcessing = (rawInputData) => {
  // Split the input into individual lines after trimming any leading/trailing whitespace.
  const inputLines = rawInputData.trim().split('\n');

  // Parse the second element of the first line (after splitting by space) as an integer.
  // This integer represents the 1-based index of the character to modify.
  const positionToModify = parseInt(inputLines[0].split(' ')[1], 10);

  // The second line of the input is the string that will be manipulated.
  const originalString = inputLines[1];

  // Construct the output string by:
  // 1. Taking the part of the string before the target character (0 to positionToModify - 1).
  // 2. Taking the target character itself (positionToModify - 1 to positionToModify) and converting it to lowercase.
  // 3. Taking the part of the string after the target character (from positionToModify onwards).
  const modifiedOutput = `${originalString.slice(0, positionToModify - 1)}${originalString.slice(positionToModify - 1, positionToModify).toLowerCase()}${originalString.slice(positionToModify)}`;

  // Print the resulting modified string to the console.
  console.log(modifiedOutput);
};

// Read the entire content of standard input synchronously and pass it to the processing function.
executeProcessing(require('fs').readFileSync('/dev/stdin', 'utf8'));
