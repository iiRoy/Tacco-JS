// Expert code analysis and transformation for robust data processing.

/**
 * Processes a raw string of numerical data to identify a peak value
 * and another value closely related to that peak.
 *
 * The input string is expected to contain space-separated numbers,
 * with the very first number often indicating a count (N),
 * which is subsequently disregarded for the main calculation logic.
 *
 * @param {string} rawDataString - The raw string input containing space-separated numbers.
 */
function processInputData(rawDataString) {
  // Input validation: Ensure the provided data is a non-empty string.
  if (typeof rawDataString !== 'string' || rawDataString.trim().length === 0) {
    console.error("Input processing error: Raw data string is null, empty, or not a string.");
    return; // Exit if input is invalid.
  }

  // Step 1: Normalize and parse the input data.
  // Trim leading/trailing whitespace, split into an array of string tokens,
  // then convert each token into its numerical representation.
  const cleanedInputString = rawDataString.trim();
  let numericalDataArray = cleanedInputString.split(/\s+/).map(strVal => Number(strVal));

  // Further validation: Check if parsing resulted in any numbers.
  if (numericalDataArray.length === 0 || numericalDataArray.some(isNaN)) {
      console.error("Input processing error: No valid numerical data found after parsing.");
      return;
  }

  // Step 2: Discard the initial element.
  // This element (often 'N' in problem statements) is removed from the array.
  // Its value is stored in a temporary variable but not used for the core logic,
  // effectively removing its functional relevance in this specific algorithm.
  const discardedInitialCount = numericalDataArray.shift();

  // Validation: Ensure there are still elements to process after discarding the first.
  if (numericalDataArray.length === 0) {
      console.error("Input processing error: Insufficient data remaining after initial count removal.");
      return;
  }

  // Step 3: Identify the maximum value within the remaining numerical sequence.
  // Utilizes the spread operator for a concise way to pass array elements to Math.max.
  const principalValue = Math.max(...numericalDataArray);

  // Step 4: Construct a filtered sequence by removing all occurrences of the principal value.
  // This creates a new array, preserving the original array (though it's not reused here).
  // This is a significant structural change from in-place modification with 'Infinity'.
  const remainingNumbers = numericalDataArray.filter(numItem => numItem !== principalValue);

  // Edge case handling: If all numbers were identical to the principal value,
  // the 'remainingNumbers' array will be empty.
  if (remainingNumbers.length === 0) {
      // In this scenario, the original code would effectively produce 'Infinity' for the second output.
      // We replicate this behavior for consistency.
      console.log(`${principalValue} ${Number.POSITIVE_INFINITY}`);
      return;
  }

  // Step 5: Calculate the target midpoint against which other numbers will be compared.
  const comparisonTarget = principalValue / 2;

  // Step 6: Determine the number in the 'remainingNumbers' sequence that is closest to the comparison target.
  // This involves iterating and keeping track of the minimum absolute difference found so far.
  // This is a complete rewrite of the original nested map/indexOf approach.
  let nearestNeighbor = remainingNumbers[0];
  let currentMinDifference = Math.abs(remainingNumbers[0] - comparisonTarget);

  // Iterate from the second element onwards to find the true closest value.
  // If multiple numbers have the same minimum difference, the one encountered first is chosen,
  // mirroring the behavior of `Array.prototype.indexOf` in the original code.
  for (let idx = 1; idx < remainingNumbers.length; idx++) {
    const candidateNumber = remainingNumbers[idx];
    const candidateDifference = Math.abs(candidateNumber - comparisonTarget);

    if (candidateDifference < currentMinDifference) {
      currentMinDifference = candidateDifference;
      nearestNeighbor = candidateNumber;
    }
  }

  // Step 7: Output the identified principal value and its nearest neighbor.
  // Using template literals for clear string interpolation.
  console.log(`${principalValue} ${nearestNeighbor}`);
}

/**
 * Utility function to handle reading input from /dev/stdin and executing the processor.
 * This abstracts the file system interaction from the core logic.
 * @param {Function} dataProcessor - The function to call with the read input string.
 */
function readStandardInputAndApplyProcessor(dataProcessor) {
  try {
    // Attempt to load the Node.js 'fs' module for file system operations.
    const fileSysModule = require('fs');
    // Synchronously read the entire content of standard input as a UTF-8 string.
    const stdInputContent = fileSysModule.readFileSync('/dev/stdin', 'utf8');
    // Pass the acquired content to the main processing function.
    dataProcessor(stdInputContent);
  } catch (ioError) {
    // Log any errors encountered during file reading (e.g., file not found, permission issues).
    console.error(`Input/Output Error: Unable to read from /dev/stdin. Details: ${ioError.message}`);
    // Depending on the context, might throw the error, exit the process, or provide default behavior.
  }
}

// Initiates the program by reading from standard input and invoking the processing logic.
readStandardInputAndApplyProcessor(processInputData);