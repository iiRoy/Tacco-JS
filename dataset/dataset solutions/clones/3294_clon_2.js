'use strict'
; /* Strict mode enabled for cleaner code execution */

process
  .stdin
  .resume(); /* Ensure input stream remains active for continuous data reception */

process
  .stdin
  .setEncoding(
    'utf-8'
  ); /* Configure the input stream to handle UTF-8 encoded text data */


let bufferData = ''; // This variable accumulates all incoming input content
let lineIndex = 0; // This counter tracks the current line number being processed from the input

process
  .stdin
  .on(
    'data',
    (chunkSegment) => { // Event handler for when new data chunks arrive
      bufferData += chunkSegment; // Append the newly received data chunk to the overall buffer
    }
  );

process
  .stdin
  .on(
    'end',
    (voidParam) => { // Event handler for when the input stream signals its end
      // Pre-process the entire buffered input content
      bufferData = bufferData
        .trim() // Remove any leading or trailing whitespace from the full input string
        .split('\n') // Split the string into an array of individual lines based on newline characters
        .map(rawEntry => { // Iterate over each line in the array
          return rawEntry.trim(); // For each line, remove its leading/trailing whitespace
        });

      executeProgram(); // Once all input is processed, initiate the primary logic of the application
    }
  );

/**
 * Retrieves the next available line from the pre-processed input buffer.
 * The internal line pointer is automatically advanced after each call.
 * @returns {string} The next line of input as a string.
 */
function fetchLine() {
  return bufferData[lineIndex++]; // Access the current line and then increment the line index
}

/**
 * Converts a space-separated string of numerical values into an array of actual numbers.
 * @param {string} textInput - The string containing numbers separated by spaces.
 * @returns {number[]} An array where each element is a numerical value.
 */
function parseNumArray(textInput) {
  return textInput
    .split(' ') // Divide the input string into parts using space as a delimiter
    .map(numVal => Number(numVal)); // Convert each string part into its numerical representation
}

/**
 * Transforms a given string into its integer representation.
 * @param {string} textInput - The string that needs to be converted to an integer.
 * @returns {number} The integer value derived from the input string.
 */
function extractInteger(textInput) {
  return Number(textInput); // Perform a direct conversion of the string to a number
}

/**
 * Divides a string by space characters into an array of string segments.
 * No type conversion is performed on the segments.
 * @param {string} textInput - The string to be segmented.
 * @returns {string[]} An array of string fragments.
 */
function parseStringArray(textInput) {
  return textInput
    .split(' ') // Break the string into an array using spaces as separators
    .map(strFragment => strFragment); // Return each string fragment as is, without modification
}

/* --- Core Application Logic Starts Below This Point --- */


/**
 * The primary execution function of the program.
 * It implements a dynamic programming approach to find the minimum cost path
 * through a sequence of values, with constraints on step size.
 */
function executeProgram() {
  const initialConfig = parseNumArray(fetchLine()); // Read the first line for initial parameters (e.g., array size, max step)
  const sequenceLength = initialConfig[0]; // The total number of elements in the value sequence
  const maxJump = initialConfig[1]; // The maximum distance one can jump between elements

  const valueSequence = parseNumArray(fetchLine()); // Read the second line, which contains the sequence of values
  const costMemo = new Array(sequenceLength); // Initialize a dynamic programming array to store calculated minimum costs
  costMemo.fill(-1); // Populate the DP array with a sentinel value (-1) to denote uncomputed states

  // Define the base conditions for the dynamic programming calculation
  costMemo[0] = 0; // The cost to reach the very first element is always zero
  if (sequenceLength > 1) { // If there's more than one element in the sequence
    costMemo[1] = Math.abs(valueSequence[1] - valueSequence[0]); // The cost to reach the second element is the absolute difference from the first
  }


  // Iterate through the sequence starting from the third element to compute minimum costs
  for (let currentPos = 2; currentPos < sequenceLength; currentPos++) {
    let minimumCost = Infinity; // Initialize the minimum cost for the current position to an infinitely high value

    // Examine all possible preceding positions within the allowed jump range
    for (let stepOffset = 1; stepOffset <= maxJump; stepOffset++) {
      // Ensure that the potential previous position is valid (i.e., not before the start of the sequence)
      if (currentPos - stepOffset >= 0) {
        // Calculate the total cost to reach the current position via this specific stepOffset
        const currentPathCost = costMemo[currentPos - stepOffset] + Math.abs(valueSequence[currentPos] - valueSequence[currentPos - stepOffset]);
        // Update the overall minimum cost for the current position if a cheaper path is found
        minimumCost = Math.min(minimumCost, currentPathCost);
      }
    }
    costMemo[currentPos] = minimumCost; // Store the determined minimum cost for the current position
  }

  // Finally, print the minimum cost required to reach the very last element of the sequence
  console.log(costMemo[sequenceLength - 1]);
}