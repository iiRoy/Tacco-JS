const fileSystemUtility = require('fs');

// Define the specific string pattern to locate within the text.
const TARGET_WORD_TO_FIND = 'Hoshino';
// Define the replacement string that will substitute the target pattern.
const REPLACEMENT_WORD_VALUE = 'Hoshina';

/**
 * Transforms a given line of text by replacing all occurrences of a predefined target word
 * with a specified substitute word.
 *
 * @param {string} incomingText - The original text line to be processed.
 * @returns {string} The modified text line after all replacements have been made.
 */
const processAndSubstituteContent = (incomingText) => {
  // Ensure we are working with a string; coerce if necessary.
  const safeText = String(incomingText || ''); // Handle null/undefined input gracefully.

  // Create a global regular expression from the target word to ensure all instances are replaced.
  const searchPattern = new RegExp(TARGET_WORD_TO_FIND, 'g');

  // Perform the replacement and return the result.
  return safeText.replace(searchPattern, REPLACEMENT_WORD_VALUE);
};

// --- Main Execution Block ---

try {
  // Read all raw data from the standard input stream.
  // It's essential to specify 'utf8' encoding for proper text interpretation.
  const rawDataFromStdin = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');

  // Perform initial data preparation:
  // 1. Remove any leading or trailing whitespace from the entire input.
  // 2. Split the cleaned input into an array of individual lines, using the newline character as a delimiter.
  const preppedInputLines = rawDataFromStdin.trim().split('\n');

  // Validate if there's any content to process after initial splitting.
  // If the array is empty or only contains an empty string, there's no meaningful data.
  if (preppedInputLines.length === 0 || (preppedInputLines.length === 1 && preppedInputLines[0] === '')) {
    // In scenarios where no input is provided, the original code would result in an
    // `effectiveProcessingCount` of NaN, causing the loop to not execute. We'll mimic this.
    // console.warn("Input stream appears to be empty or contains no valid lines.");
    process.exit(0); // Exit cleanly if no input.
  }

  // Extract the very first line, which is expected to contain the count of subsequent lines
  // that need to be processed. `shift()` removes this element from the array.
  const lineCountString = preppedInputLines.shift();
  let effectiveProcessingCount = parseInt(lineCountString, 10);

  // Implement a robustness check for the extracted count:
  // If the parsed value is not a number (NaN) or is a negative number,
  // we default the processing count to zero to prevent errors or unexpected behavior.
  if (isNaN(effectiveProcessingCount) || effectiveProcessingCount < 0) {
    effectiveProcessingCount = 0; // Ensure a non-negative, valid iteration count.
  }

  // Iterate through the remaining lines up to the determined processing count.
  // The loop index `lineCursor` is block-scoped using `let`.
  for (let lineCursor = 0; lineCursor < effectiveProcessingCount; lineCursor++) {
    // Retrieve the current line from the `preppedInputLines` array for modification.
    const currentLineForProcessing = preppedInputLines[lineCursor];

    // Apply the core transformation function to replace the target word.
    const transformedOutput = processAndSubstituteContent(currentLineForProcessing);

    // Output the result of the transformation to the standard console.
    console.log(transformedOutput);
  }

} catch (operationError) {
  // Catch and report any errors that occur during file reading or processing.
  // This provides better error handling than the original snippet.
  // console.error("An error occurred during script execution:", operationError.message);
  process.exit(1); // Exit with a non-zero code to indicate an error.
}