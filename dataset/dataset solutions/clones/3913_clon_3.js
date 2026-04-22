'use strict';

/**
 * Utility function to parse a single line of space-separated numbers from a string.
 * This helper is designed to extract numerical parameters from raw input data.
 *
 * @param {string} inputLine - The string containing space-separated numbers.
 * @returns {Array<number>} An array of parsed numbers. Returns an empty array if parsing fails or input is invalid.
 */
function extractNumericParameters(inputLine) {
  // Ensure the input is a string and remove leading/trailing whitespace.
  const trimmedLine = (typeof inputLine === 'string' ? inputLine : '').trim();

  // If the line is empty after trimming, there are no parameters to parse.
  if (trimmedLine.length === 0) {
    return [];
  }

  // Split the line by spaces and convert each segment to a number.
  // Filter out any NaN results from conversion to ensure only valid numbers are returned.
  const numericValues = trimmedLine.split(' ').map(segment => Number(segment));

  // Return the array of numbers, potentially empty if no valid numbers were found.
  return numericValues.filter(val => !isNaN(val));
}

/**
 * Displays the final processed string content to the standard output.
 * This function encapsulates the output mechanism for potential future changes (e.g., logging to a file).
 *
 * @param {string} contentToDisplay - The string that needs to be printed.
 */
function presentFinalOutput(contentToDisplay) {
  console.log(contentToDisplay);
}

/**
 * The core business logic function that processes input and generates a sequence of unique numbers.
 * This function is responsible for orchestrating the parsing, computation, and output steps.
 *
 * @param {string} fullInputString - The entire raw input string, typically read from a file or stdin.
 */
function executeRangeGeneration(fullInputString) {
  // Perform an initial validation on the provided input string.
  if (typeof fullInputString !== 'string' || fullInputString.length === 0) {
    console.error("Execution Aborted: The provided input string is either invalid or empty.");
    return; // Terminate execution if input is not usable.
  }

  // Extract the first line from the input string and parse its numerical components.
  // The original problem implies only the first line is relevant for parameters.
  const firstLineData = fullInputString.split('\n')[0];
  const numericalArguments = extractNumericParameters(firstLineData);

  // Validate that we have the expected number of arguments (at least three: start, end, count).
  const EXPECTED_ARGUMENT_COUNT = 3;
  if (numericalArguments.length < EXPECTED_ARGUMENT_COUNT) {
    console.error(`Execution Aborted: Not enough numerical parameters provided. Expected ${EXPECTED_ARGUMENT_COUNT}, got ${numericalArguments.length}.`);
    return; // Terminate if essential parameters are missing.
  }

  // Assign parsed values to more descriptive variable names for clarity.
  const startingValue = numericalArguments[0];
  const endingValue = numericalArguments[1];
  let iterationSteps = numericalArguments[2]; // Using 'let' as it might be adjusted.

  // Implement a guard clause for negative iteration steps.
  if (iterationSteps < 0) {
    console.warn(`Warning: Negative iteration count (${iterationSteps}) detected. Normalizing to 0 steps.`);
    iterationSteps = 0; // Negative steps would make no sense, so we reset to zero.
  }

  // Initialize a Set to store unique generated numbers. Sets automatically handle uniqueness.
  const generatedUniqueNumbers = new Set();

  // Loop through the specified number of iterations to generate candidates.
  // The loop includes a flag to allow for early termination if conditions are no longer met.
  let continueLooping = true;
  for (let currentIterationIndex = 0;
       currentIterationIndex < iterationSteps && continueLooping;
       ++currentIterationIndex) {

    // Calculate the two candidate numbers for the current iteration.
    const candidateFromStart = startingValue + currentIterationIndex;
    const candidateFromEnd = endingValue - currentIterationIndex;

    // Check if the candidate from the start is still within the acceptable upper bound.
    const isStartCandidateValid = (candidateFromStart <= endingValue);
    // Check if the candidate from the end is still within the acceptable lower bound.
    const isEndCandidateValid = (candidateFromEnd >= startingValue);

    // The core logic: if either candidate is still valid relative to its boundary,
    // we add both candidates to our collection. Otherwise, we stop iterating.
    if (isStartCandidateValid || isEndCandidateValid) {
      generatedUniqueNumbers.add(candidateFromStart);
      generatedUniqueNumbers.add(candidateFromEnd);
    } else {
      // If neither condition is met, further iterations will also likely yield out-of-range numbers,
      // so we can optimize by stopping the loop early.
      continueLooping = false; // Set flag to exit loop.
      break; // Direct exit from the loop, matching original behavior.
    }
  }

  // Convert the Set of unique numbers into an array for sorting.
  let finalSortedNumbers = Array.from(generatedUniqueNumbers);

  // Sort the numbers in ascending order.
  finalSortedNumbers.sort((numX, numY) => numX - numY);

  // Format the sorted numbers into a single string, with each number on a new line.
  const formattedOutputString = finalSortedNumbers.join('\n');

  // Present the final formatted output.
  presentFinalOutput(formattedOutputString);
}

// Entry point for the script: Read input from stdin and initiate processing.
// A robust error handling block is included for file reading operations.
try {
  // Read the entire content of standard input as a Buffer, then convert it to a UTF-8 string.
  const inputStreamContent = require("fs").readFileSync("/dev/stdin").toString('utf8');
  // Pass the raw content to the main processing function.
  executeRangeGeneration(inputStreamContent);
} catch (errorReadingInput) {
  // If an error occurs during file reading (e.g., file not found, permission issues),
  // log the error and exit the process with a non-zero status code to indicate failure.
  console.error("An unhandled error occurred while attempting to read from standard input:", errorReadingInput.message);
  process.exit(1); // Indicate an error occurred.
}