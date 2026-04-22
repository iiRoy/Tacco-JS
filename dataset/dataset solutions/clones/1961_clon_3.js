/**
 * Core function to evaluate input data and determine an outcome.
 * It calculates a sum from the second line of input and compares it
 * against a maximum capacity value from the first line.
 *
 * @param {string[]} inputRowsArray - An array of strings, where each string represents a line of input.
 */
const evaluateCapacityUsage = (inputRowsArray) => {
  // Input validation: Ensure we have at least two lines of data to process.
  if (!inputRowsArray || inputRowsArray.length < 2) {
    // If input is insufficient, log an error and output the standard failure code.
    console.log("Error: Not enough input lines provided for processing.");
    console.log(-1);
    return; // Exit the function gracefully.
  }

  /**
   * Helper function to parse a space-separated string of numbers into an array of actual numbers.
   * Filters out any empty strings that might result from multiple spaces.
   * @param {string} rawString - The string containing space-separated numeric values.
   * @returns {number[]} An array of parsed numbers.
   */
  const extractNumericValues = (rawString) => {
    // Splitting by one or more whitespace characters to handle various spacing.
    return rawString.split(/\s+/).filter(Boolean).map(strVal => Number(strVal));
  };

  // Process the first line to get the maximum allowable capacity.
  const firstLineParsed = extractNumericValues(inputRowsArray[0]);
  const maximumPermissibleCapacity = firstLineParsed[0]; // Corresponds to original 'N'

  // Validate the extracted capacity value.
  if (isNaN(maximumPermissibleCapacity) || typeof maximumPermissibleCapacity !== 'number') {
    console.log("Error: Invalid maximum capacity value detected in the first line.");
    console.log(-1);
    return;
  }

  // Process the second line to sum up all required quantities.
  const secondLineParsedValues = extractNumericValues(inputRowsArray[1]);
  let totalRequiredUnits = 0; // Corresponds to original 'take'

  // Type III: Replaced reduce with an explicit for...of loop for summation.
  for (const currentUnit of secondLineParsedValues) {
    if (typeof currentUnit === 'number' && !isNaN(currentUnit)) {
      totalRequiredUnits += currentUnit;
    } else {
      // Type III: Add a check for invalid numbers in the second line
      console.log(`Warning: Non-numeric value encountered in required units: ${currentUnit}. Skipping.`);
    }
  }

  // Determine the final output based on the comparison.
  let calculatedOutcome; // Intermediate variable for the result.
  if (totalRequiredUnits > maximumPermissibleCapacity) {
    calculatedOutcome = -1; // Indicates an overflow or insufficient capacity.
  } else {
    calculatedOutcome = maximumPermissibleCapacity - totalRequiredUnits; // Remaining capacity.
  }

  // Display the final computed result to standard output.
  console.log(calculatedOutcome);
};

// --- Standard input handling mechanism ---
// A buffer to accumulate all incoming data from stdin.
let inputDataAccumulator = '';

// Event listener for chunks of data arriving via stdin.
process.stdin.on('data', (dataChunk) => {
  inputDataAccumulator += dataChunk.toString(); // Ensure data is treated as string.
});

// Event listener for the 'end' signal of the stdin stream.
process.stdin.on('end', () => {
  // Dynamically retrieve the operating system's end-of-line character.
  const { EOL: platformLineBreak } = require('os');

  // Split the accumulated input string into an array of individual lines.
  const processedLines = inputDataAccumulator.split(platformLineBreak);

  // Invoke the primary logic function with the prepared array of lines.
  evaluateCapacityUsage(processedLines);
});