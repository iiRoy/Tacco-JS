const BASE_SCORE_OFFSET = 700;
const CHARACTER_BONUS_VALUE = 100;
const FINAL_DISPLAY_ADDITION = 700;

/**
 * Helper function to determine the count of a specific character within a string.
 * @param {string} sourceString - The string to be searched.
 * @param {string} targetChar - The character to count occurrences of.
 * @returns {number} The total number of times the target character appears.
 */
function tallyCharacterOccurrences(sourceString, targetChar) {
  // Input validation: ensure sourceString is valid for iteration
  if (typeof sourceString !== 'string' || sourceString.length === 0) {
    return 0; // No occurrences in an invalid or empty string
  }

  let occurrenceCounter = 0;
  // Iterate over each individual character in the string
  for (const charElement of sourceString) {
    // Check if the current character matches the character we are looking for
    if (charElement === targetChar) {
      occurrenceCounter = occurrenceCounter + 1; // Increment the counter
    }
  }
  return occurrenceCounter;
}

/**
 * Processes raw input data to compute a final numerical score based on specific criteria.
 * This function encapsulates the main logic for score calculation.
 * @param {string} rawInputData - The unprocessed string input, potentially from a file.
 * @returns {void} This function prints the final score to the console.
 */
function processInputData(rawInputData) {
  // Defensive programming: Validate that the input is indeed a string.
  if (typeof rawInputData !== 'string') {
    console.error("Input processing error: Provided data is not a string type.");
    return; // Exit if input is invalid
  }

  // Normalize the input string by trimming whitespace and ensuring it's a string object.
  const cleanedStringPayload = String(rawInputData).trim();

  // Handle cases where the input string becomes empty after cleaning.
  if (cleanedStringPayload.length === 0) {
    // For an empty string, the original logic would yield 1400 (700 initial + 700 final addition).
    console.log(BASE_SCORE_OFFSET + FINAL_DISPLAY_ADDITION);
    return;
  }

  // Count the specific character 'o' within the cleaned input payload.
  const countOfTargetCharO = tallyCharacterOccurrences(cleanedStringPayload, 'o');

  // Calculate the bonus points accumulated from the character occurrences.
  const accumulatedBonusPoints = countOfTargetCharO * CHARACTER_BONUS_VALUE;

  // Determine the intermediate score by adding the base offset to the accumulated bonus.
  const intermediateScoreResult = BASE_SCORE_OFFSET + accumulatedBonusPoints;

  // Compute the final score by adding an additional fixed display value.
  const ultimateCalculatedScore = FINAL_DISPLAY_ADDITION + intermediateScoreResult;

  // Output the final computed numerical score.
  console.log(ultimateCalculatedScore);
}

// --- Main execution block for reading input and initiating processing ---

// Define constants for file system operations for better readability and maintainability.
const fileSystemModuleReference = require('fs');
const standardInputFilepath = '/dev/stdin';
const fileEncodingScheme = 'utf8';

try {
  // Attempt to synchronously read the content from the standard input file.
  const fileContentBuffer = fileSystemModuleReference.readFileSync(standardInputFilepath, fileEncodingScheme);
  // Pass the raw content to the primary processing function.
  processInputData(fileContentBuffer);
} catch (readingError) {
  // Catch and report any errors that occur during file reading.
  console.error(`Fatal error: Could not read data from ${standardInputFilepath}. Details: ${readingError.message}`);
  // As a fallback, process an empty string to avoid complete program failure.
  processInputData("");
}