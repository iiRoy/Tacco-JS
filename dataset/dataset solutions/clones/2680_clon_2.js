'use strict'; // Ensure strict mode for cleaner code execution

/**
 * Main processing function for the input data.
 * This routine calculates a specific numerical value based on the length
 * and content of an input string representing a number.
 *
 * @param {string} rawData - The raw input string, typically from stdin.
 */
function processInput(rawData) {
  // Trim leading/trailing whitespace from the input string
  const stringValue = rawData.trim();

  // Determine the effective length of the processed string
  const strLength = stringValue.length;

  // Convert the string representation to its integer equivalent
  const numericVal = Number.parseInt(stringValue);

  // Initialize a variable to hold an offset value, defaulting to zero
  let remainderOffset = 0;

  // Check if the string's length is an odd number
  if (strLength % 2 !== 0) {
    // If odd, calculate a specific remainder and add one to it
    // This involves taking the modulo of the numeric value with 10 raised
    // to the power of (length minus one), then incrementing the result.
    remainderOffset = (numericVal % Math.pow(10, strLength - 1)) + 1;
  }

  // Calculate the floor of half the string's length
  const halfLengthFloored = Math.floor(strLength / 2);

  // Initialize an empty temporary string builder
  let tempString = '';

  // Loop a number of times equal to twice the floored half-length
  // This loop constructs a string composed of alternating '9's and '0's
  // in reverse order, effectively creating a number like '9090...' or '0909...'
  for (let counter = 1; counter <= halfLengthFloored * 2; counter++) {
    // If the counter is odd, prepend '9'; otherwise, prepend '0'
    tempString = (counter % 2 !== 0) ? '9' + tempString : '0' + tempString;
  }

  // Convert the constructed temporary string to an integer
  tempString = Number.parseInt(tempString, 10);

  // Output the final calculated sum of the temporary string's integer value
  // and the previously determined remainder offset.
  console.info(tempString + remainderOffset);
}

// Invoke the primary processing function with input read from standard input.
// Note: 'node:fs' is used for explicit module import, and 'readFileSync'
// is the correct method name for synchronous file reading.
processInput(require('node:fs').readFileSync('/dev/stdin', 'utf8'));