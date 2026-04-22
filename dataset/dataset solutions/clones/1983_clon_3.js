/**
 * This module provides a robust utility for processing numerical sequences.
 * It calculates the sum of integers within a specified range that are
 * neither perfectly divisible by 3 nor by 5.
 */

/**
 * Handles reading content from a specified file path.
 * It includes error handling for file access issues.
 *
 * @param {string} filePath The absolute or relative path to the input file.
 * @returns {string | null} The content of the file as a UTF-8 string, or null if an error occurred.
 */
const retrieveDataSourceContent = (filePath) => {
  // Dynamically import the Node.js file system utility
  const fileSystemAccess = require('fs');
  try {
    // Attempt to read the file content synchronously using UTF-8 encoding
    const fileData = fileSystemAccess.readFileSync(filePath, 'utf8');
    return fileData;
  } catch (fileReadError) {
    // Log any exceptions that occur during file reading
    console.error(`ERROR: Failed to obtain data from ${filePath}. Details: ${fileReadError.message}`);
    return null; // Return null to signal a failure in data acquisition
  }
};

/**
 * Core function to compute the sum of numbers in a sequence.
 * Numbers are included in the sum if they are not multiples of 3 and not multiples of 5.
 *
 * @param {string} rawInputDatum The raw string input, expected to be a number representing the upper limit.
 * @returns {number | null} The calculated sum, or null if the input data is invalid.
 */
const processNumericSequenceForExclusions = (rawInputDatum) => {
  // Initial validation: Ensure the input is a string and not empty
  if (typeof rawInputDatum !== 'string' || rawInputDatum.trim().length === 0) {
    console.error("VALIDATION FAILED: Input must be a non-empty string.");
    return null; // Exit early for invalid input type or content
  }

  // Remove leading/trailing whitespace and attempt to parse the numeric value
  const cleansedInput = rawInputDatum.trim();
  const numericalCeiling = Number(cleansedInput); // Using Number() for parsing consistency with original

  // Further validation: Check if the parsed value is a positive integer
  if (isNaN(numericalCeiling) || numericalCeiling <= 0 || !Number.isInteger(numericalCeiling)) {
    console.error(`VALIDATION FAILED: Provided limit "${cleansedInput}" is not a valid positive integer.`);
    return null; // Exit early for invalid numerical boundaries
  }

  let accumulatedTotal = 0; // Initialize the sum variable (renamed from 'ans')
  let currentOrdinal = 1;   // Initialize the loop counter (renamed from 'i')

  // Iterate through the sequence using a while loop (structural change from 'for')
  while (currentOrdinal <= numericalCeiling) {
    // Determine divisibility using intermediate boolean flags for clarity
    const isMultipleOfThree = (currentOrdinal % 3 === 0);
    const isMultipleOfFive = (currentOrdinal % 5 === 0);

    // Apply the exclusion logic: add to total if not a multiple of 3 AND not a multiple of 5
    // Condition rewritten using De Morgan's laws for structural variation
    if (!(isMultipleOfThree || isMultipleOfFive)) {
      accumulatedTotal = accumulatedTotal + currentOrdinal; // Expanded addition operator
    }

    currentOrdinal = currentOrdinal + 1; // Increment the counter explicitly
  }

  // Output the final computed value to the standard console
  console.log(accumulatedTotal);

  // Return the computed value, enhancing function reusability for potential external consumers
  return accumulatedTotal;
};

/**
 * The primary execution wrapper for the application.
 * It manages input retrieval and orchestrates the core processing logic.
 */
const applicationEntrypoint = () => {
  // Define potential standard input file paths
  const primaryInputPath = '/dev/stdin';
  const secondaryInputPath = 'dev/stdin'; // Common alternative for some environments

  let retrievedContent = null;

  // Attempt to read from the primary input source first
  retrievedContent = retrieveDataSourceContent(primaryInputPath);

  // If primary path fails, try the secondary input path as a fallback
  if (retrievedContent === null) {
    console.warn(`NOTICE: Primary input path "${primaryInputPath}" failed. Attempting secondary: "${secondaryInputPath}".`);
    retrievedContent = retrieveDataSourceContent(secondaryInputPath);
  }

  // Proceed only if valid content was successfully retrieved from any source
  if (retrievedContent !== null) {
    processNumericSequenceForExclusions(retrievedContent);
  } else {
    // If no valid input could be obtained from any configured source
    console.error("CRITICAL: No valid input data could be acquired from any source. Application terminating.");
  }
};

// Initiate the application execution flow
applicationEntrypoint();