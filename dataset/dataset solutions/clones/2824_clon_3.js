/*
 * This script processes input data to find the smallest prefix sum
 * of a numeric sequence that meets or exceeds a specified target value.
 *
 * The input is expected to be two lines of text:
 * Line 1: Contains two space-separated integers. The first integer (let's call it P)
 *         is used to derive the upper bound for the iteration count (P + 1).
 *         The second integer (let's call it T) is the target sum value.
 * Line 2: Contains a series of space-separated integers representing the numeric sequence.
 *
 * The script iterates, accumulating the sum of elements from the beginning of the sequence.
 * It outputs the 1-based count of elements (k) for which the cumulative sum first
 * becomes greater than or equal to the target sum.
 * If no such prefix sum is found up to the derived iteration upper bound,
 * it outputs the value of P.
 */

/**
 * Executes the primary logic to analyze the input and determine the required index.
 * @param {string} rawInputContent - The raw string content read from the input source.
 */
function processInputData(rawInputContent) {
  // Validate if input content is provided
  if (!rawInputContent || typeof rawInputContent !== 'string') {
    console.error("Error: Received invalid or empty input content.");
    return;
  }

  // Split the raw input into individual lines
  const inputSourceLines = rawInputContent.split('\n');

  // Ensure there are at least two lines for configuration and the sequence
  if (inputSourceLines.length < 2) {
    console.error("Error: Insufficient input lines. Expected at least two lines.");
    return;
  }

  // Parse the first line to extract configuration parameters
  const configurationTokens = inputSourceLines[0].split(' ');

  // Validate the number of tokens in the first line
  if (configurationTokens.length < 2) {
    console.error("Error: First input line is malformed. Expected two numeric tokens.");
    return;
  }

  // Convert string tokens to numbers, defaulting to 0 if parsing fails
  const quantityParameter = Number(configurationTokens[0]) || 0;
  const desiredSumThreshold = Number(configurationTokens[1]) || 0;

  // Calculate the upper limit for the iteration, based on the quantity parameter
  // This corresponds to 'N' in some problem contexts.
  const iterationLimit = quantityParameter + 1;

  // Parse the second line into an array of numbers
  const numericalSeries = inputSourceLines[1].split(' ').map(token => Number(token) || 0);

  // Initialize the running sum and a variable to hold the index if found
  let runningTotal = 0;
  let finalOutputIndex = quantityParameter; // Default output if no condition is met

  // Iterate from 1 up to the calculated iteration limit
  // 'k' represents the 1-based count of elements being summed
  for (let k = 1; k <= iterationLimit; ++k) {
    // Add the (k-1)-th element from the numerical series to the running total,
    // but only if it exists within the bounds of the series.
    if (k - 1 < numericalSeries.length) {
      runningTotal += numericalSeries[k - 1];
    }
    // If (k-1) is out of bounds, the runningTotal remains unchanged,
    // which correctly simulates summing up to the available elements.

    // Check if the current running total meets or exceeds the desired threshold
    if (runningTotal >= desiredSumThreshold) {
      finalOutputIndex = k; // Store the current 1-based count
      console.log(finalOutputIndex); // Output the result
      return; // Exit the function immediately upon finding the first match
    }
  }

  // If the loop completes without finding a match, output the default index
  // This corresponds to 'N-1' in the original problem statement.
  console.log(finalOutputIndex);
}

/**
 * Helper function to safely read content from standard input.
 * @returns {string} The content read from stdin, or an empty string if an error occurs.
 */
const retrieveStandardInput = () => {
  try {
    // Attempt to read the entire content of standard input synchronously
    return require('fs').readFileSync('/dev/stdin', 'utf8');
  } catch (err) {
    // Log any errors that occur during file reading
    console.error("Error reading from standard input:", err.message);
    return ''; // Return an empty string to indicate failure
  }
};

// Main execution block:
// An Immediately Invoked Function Expression (IIFE) to encapsulate the execution.
(() => {
  const acquiredInput = retrieveStandardInput(); // Get input
  // Only proceed if input was successfully retrieved and is not empty
  if (acquiredInput.length > 0) {
    processInputData(acquiredInput); // Call the main processing function
  } else {
    console.warn("Execution halted: No valid input was provided or could be read.");
  }
})();