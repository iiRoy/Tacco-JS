/**
 * This module provides functionality to read pairs of numbers from standard input,
 * accumulate them, and then process these pairs by printing them in ascending order.
 * The processing is triggered by a specific termination signal from the input stream.
 */

// --- Core processing function for numeric sequences ---

/**
 * Iterates through a sequence of numbers, treating them as ordered pairs.
 * For each valid pair, it determines the minimum and maximum values and
 * prints them to the console, separated by a space.
 * Processing for a given sequence halts upon encountering a (0, 0) pair
 * or if there are insufficient elements remaining to form a complete pair.
 *
 * @param {number[]} numericData - An array containing numbers to be processed in pairs.
 *                                 It is expected to contain integer values.
 */
function processNumericPairs(numericData) {
  // Input validation: Ensure the provided data is a non-empty array with at least two elements.
  // If the input is invalid, an error message could be logged, or the function can simply exit.
  if (!Array.isArray(numericData) || numericData.length < 2) {
    // console.error("Data sequence is malformed or too short for pair processing.");
    return; // Abort processing for invalid input
  }

  let currentPairStartIndex = 0; // Index pointer for the beginning of the current pair
  const totalSequenceLength = numericData.length; // Cache array length for performance

  // Loop through the numeric data, advancing by two elements (a pair) in each iteration.
  // The loop continues as long as there are at least two elements left to form a pair.
  while (currentPairStartIndex < totalSequenceLength - 1) {
    // Extract the two numbers forming the current pair from the sequence.
    const firstElement = numericData[currentPairStartIndex];
    const secondElement = numericData[currentPairStartIndex + 1];

    // Check for the specific termination condition: if both elements of the pair are zero.
    // This signal indicates that no further pairs in this sequence should be processed.
    if (firstElement === 0 && secondElement === 0) {
      // console.info("Termination signal (0, 0) detected within sequence. Stopping pair processing.");
      break; // Exit the loop prematurely
    }

    // Determine the numerically smaller and larger values within the current pair.
    const smallerValue = Math.min(firstElement, secondElement);
    const largerValue = Math.max(firstElement, secondElement);

    // Output the sorted pair to the console, ensuring the smaller number comes first.
    // Using a template literal for clear and concise string formatting.
    console.log(`${smallerValue} ${largerValue}`);

    // Advance the index to the start of the next pair.
    currentPairStartIndex += 2;
  }
}

// --- Global state and input management ---

// An array used to accumulate all numeric values parsed from standard input lines.
// This array grows as lines are read until a processing trigger occurs.
let accumulatedNumericValues = [];

// A simple counter to keep track of the number of lines successfully processed from input.
let linesSuccessfullyRead = 0;

// Initialize the readline interface to handle input from `process.stdin`.
// This allows the program to read input line by line from the console or piped data.
const standardInputLineReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout // 'output' is technically not used for interactive prompts here, but required by API.
});

/**
 * Utility function to check if a given pair of numbers constitutes the processing termination signal.
 * This abstracts the specific values that trigger the processing phase.
 *
 * @param {number} valueA - The first number of the pair.
 * @param {number} valueB - The second number of the pair.
 * @returns {boolean} True if both values are 0, indicating the termination signal.
 */
const isProcessingTrigger = (valueA, valueB) => valueA === 0 && valueB === 0;

// Attach an event listener to the 'line' event of the standard input reader.
// This function will execute every time a new line of input is received.
standardInputLineReader.on('line', (rawInputLine) => {
  linesSuccessfullyRead++; // Increment the counter for each line received.

  // Split the input line string into an array of substrings based on space delimiters.
  const stringSegments = rawInputLine.split(' ');

  // Validate the structure of the input line: it must contain at least two parts.
  if (stringSegments.length < 2) {
    // console.warn(`Skipping malformed input line (expected at least two parts): "${rawInputLine}"`);
    return; // Skip processing this line if it does not meet the expected format.
  }

  // Attempt to parse the first two string segments into integer numbers.
  // Using radix 10 ensures decimal parsing.
  const firstParsedNumber = parseInt(stringSegments[0], 10);
  const secondParsedNumber = parseInt(stringSegments[1], 10);

  // Validate the parsing results: ensure both parsed values are indeed numbers.
  if (isNaN(firstParsedNumber) || isNaN(secondParsedNumber)) {
    // console.warn(`Skipping line due to non-numeric content: "${rawInputLine}"`);
    return; // Skip if either number could not be parsed successfully.
  }

  // Add the successfully parsed numbers to the global accumulator array.
  accumulatedNumericValues.push(firstParsedNumber);
  accumulatedNumericValues.push(secondParsedNumber);

  // Check if the current pair of numbers signals that the accumulated data should be processed.
  if (isProcessingTrigger(firstParsedNumber, secondParsedNumber)) {
    // When the trigger is met, initiate the pair processing function with all accumulated data.
    // Important: The `accumulatedNumericValues` array is not cleared here. This means
    // if multiple '0 0' signals are received, `processNumericPairs` will operate
    // on the continuously growing historical data, mirroring the original code's behavior.
    processNumericPairs(accumulatedNumericValues);

    // An optional enhancement might be to clear `accumulatedNumericValues` here
    // (`accumulatedNumericValues = [];`) if each '0 0' should process only the
    // data *since the last '0 0'*. The current implementation follows the original.
    // Also, one might close the reader here if only one block of input is expected:
    // standardInputLineReader.close();
  }
});

// The original program included an empty handler for the 'end' event on `process.stdin`.
// As this handler performed no actions and was non-essential to the program's logic,
// it has been removed as part of the Type III clone modifications for conciseness.
// If specific finalization or resource cleanup were required, it would be re-added here.
// For instance: `process.stdin.on('end', () => { /* Perform final cleanup */ });`

// A simple informational message to indicate the program is ready for input.
// This is an additional fragment for visibility of Type III changes.
// console.log("Program initialized. Awaiting numeric pair input (e.g., '10 20'). Enter '0 0' to process.");