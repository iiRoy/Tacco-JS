/**
 * This script is designed to process a two-line text input.
 * The first line is treated as a source string, and the second line
 * as a numerical interval. It extracts characters from the source string
 * at the specified interval and outputs the concatenated result.
 */

/**
 * Processes the raw input data to extract characters based on an interval.
 *
 * @param {string} receivedContent - The complete raw input string, expected to contain
 *                                 the source text on the first line and the
 *                                 numeric step on the second line, separated by newlines.
 * @returns {string} A new string composed of characters extracted at the
 *                   defined step intervals from the source content. Returns an
 *                   empty string if input is invalid or insufficient.
 */
function extractCharactersAtInterval(receivedContent) {
  // Enforce strict parsing and execution rules within this function.
  'use strict';

  // --- Input Validation and Preparation ---

  // Verify that valid content was provided.
  if (typeof receivedContent !== 'string' || receivedContent.trim().length === 0) {
    // Log a warning and return an empty string if the input is not valid.
    console.warn("Input data is either missing or not a valid string. No characters will be extracted.");
    return '';
  }

  // Divide the incoming multi-line string into an array of individual lines.
  const contentLines = receivedContent.split('\n');

  // Check if we have the minimum required number of lines (source string + interval).
  const minimumLinesRequired = 2;
  if (contentLines.length < minimumLinesRequired) {
    console.warn(`Insufficient lines in input. Expected at least ${minimumLinesRequired}, but received ${contentLines.length}.`);
    return ''; // Abort if input structure is incorrect.
  }

  // Assign the first line as the primary text for character extraction.
  const primaryText = contentLines[0];

  // Attempt to parse the second line into an integer for our step interval.
  // Using parseInt with radix 10 ensures correct base conversion.
  let characterStep = parseInt(contentLines[1], 10);

  // --- Interval Validation ---

  // Validate the parsed character step. It must be a positive number.
  if (isNaN(characterStep) || characterStep <= 0) {
    console.error(`Invalid character step value detected: "${contentLines[1]}". Defaulting the step to 1.`);
    characterStep = 1; // Set a safe default to prevent errors or infinite loops.
  }

  // --- Character Extraction Logic ---

  // An array to temporarily store the extracted characters.
  // Using an array and then joining is often more efficient for many concatenations.
  const characterCollection = [];

  // Initialize the index for traversing the primary text.
  let currentIdx = 0;

  // Loop through the primary text, incrementing by the characterStep.
  // A 'while' loop is used here as an alternative to a 'for' loop.
  while (currentIdx < primaryText.length) {
    // Retrieve the character at the current index.
    // charAt() is used as an alternative to substr() or array access.
    const charToCollect = primaryText.charAt(currentIdx);

    // Add the retrieved character to our collection.
    characterCollection.push(charToCollect);

    // Increment the index by the determined step to move to the next extraction point.
    currentIdx += characterStep;
  }

  // --- Final Output Construction ---

  // Join all collected characters into a single resultant string.
  const resultantString = characterCollection.join('');

  // Return the final processed string.
  return resultantString;
}

// --- Script Execution Block ---

// This immediately invoked function expression (IIFE) handles the main execution flow.
(function performScriptOperation() {
  // Define the standard input path for Unix-like systems.
  const standardInputPath = "/dev/stdin";
  let rawFileContent = '';

  try {
    // Synchronously read the content from the standard input file.
    // Specify 'utf8' encoding for proper character handling and remove leading/trailing whitespace.
    rawFileContent = require("fs").readFileSync(standardInputPath, "utf8").trim();
  } catch (readError) {
    // Log any errors that occur during the file reading process.
    console.error(`An error occurred while attempting to read from ${standardInputPath}: ${readError.message}`);
    // In case of error, the script will proceed with an empty rawFileContent,
    // which will be handled by the input validation in extractCharactersAtInterval.
    return; // Exit the IIFE if file reading fails critically.
  }

  // Call the core function to process the obtained file content.
  const finalExtractedResult = extractCharactersAtInterval(rawFileContent);

  // Display the final output to the console.
  // Using console.info as an alternative to console.log.
  console.info(finalExtractedResult);
})();