// This module is designed to meticulously process a given string input,
// evaluating a specific pattern based on its initial components.
// The primary goal is to determine if exactly two out of the first three
// space-separated elements within the input string are identical.

/**
 * Analyzes an input string to check for a specific pattern among its
 * first three space-separated elements.
 *
 * @param {string} rawSequenceData - The raw string input that needs to be analyzed.
 *                                   Expected to contain at least three space-separated components.
 * @returns {void} This function prints 'Yes' or 'No' to the console based on the analysis,
 *                 or an error message if the input is invalid.
 */
function analyzeInputSequence(rawSequenceData) {
  // Input validation: A fundamental guard clause to ensure the provided data
  // is indeed a string, preventing unexpected runtime errors.
  if (typeof rawSequenceData !== 'string') {
    console.error("Input data type mismatch: Expected a string for sequence analysis.");
    return; // Terminate execution if the input is not a string.
  }

  // Processing Step 1: Deconstruct the raw input string into an array of individual
  // textual components, using a single space character as the delimiter.
  const parsedElements = rawSequenceData.split(' ');

  // Structural Validation: Verify that the parsed array contains at least
  // the minimum number of elements required for our pattern comparison.
  const MINIMUM_ELEMENT_COUNT = 3;
  if (parsedElements.length < MINIMUM_ELEMENT_COUNT) {
    // If fewer than three elements are present, the specific pattern cannot be met.
    console.log('No');
    return; // Exit early as the condition cannot be satisfied.
  }

  // Extraction of critical data: Assign the first three elements to distinct,
  // self-explanatory variables for improved readability and direct access.
  const primaryTerm   = parsedElements[0];
  const secondaryTerm = parsedElements[1];
  const tertiaryTerm  = parsedElements[2];

  // Intermediate Step: Evaluate all possible pairwise equality conditions
  // among the extracted terms. Each comparison result is stored in a boolean flag.
  const matchPrimarySecondary = (primaryTerm === secondaryTerm);
  const matchPrimaryTertiary  = (primaryTerm === tertiaryTerm);
  const matchSecondaryTertiary = (secondaryTerm === tertiaryTerm);

  // Aggregation of comparison results: Count how many unique pairs among the three terms are identical.
  // This approach simplifies the complex conditional logic of the original.
  let numberOfIdenticalPairs = 0;
  if (matchPrimarySecondary) {
    numberOfIdenticalPairs++;
  }
  if (matchPrimaryTertiary) {
    numberOfIdenticalPairs++;
  }
  if (matchSecondaryTertiary) {
    numberOfIdenticalPairs++;
  }

  // Final Decision Logic: The pattern is matched if and only if exactly one pair
  // of elements is identical.
  // - If `numberOfIdenticalPairs` is 0, all three terms are distinct.
  // - If `numberOfIdenticalPairs` is 1, exactly two terms are identical (e.g., A A B).
  // - If `numberOfIdenticalPairs` is 3, all three terms are identical (e.g., A A A).
  const isPatternSuccessfullyIdentified = (numberOfIdenticalPairs === 1);

  // Output Generation: Print the final result to standard output.
  if (isPatternSuccessfullyIdentified) {
    console.log('Yes');
  } else {
    console.log('No');
  }
}

// Application Entry Point: This block handles the execution flow,
// specifically for environments where input is read from standard input.
// It mimics typical competitive programming setup for reading file content.
const fileSystemUtility = require("fs"); // Import Node.js File System module.
const standardInputFileDescriptor = "/dev/stdin"; // Universal path for standard input in Unix-like systems.
const desiredFileEncoding = "utf8"; // Specify the text encoding for reading the input file.

try {
  // Attempt to synchronously read the entire content from the designated input source.
  const rawInputContent = fileSystemUtility.readFileSync(standardInputFileDescriptor, desiredFileEncoding);

  // Invoke the core analysis function with the content read from standard input.
  analyzeInputSequence(rawInputContent);
} catch (ioOperationError) {
  // Robust Error Handling: Catch and report any exceptions that occur during
  // the file reading process (e.g., file not found, permission issues).
  console.error("An error occurred during input file processing:", ioOperationError.message);
  // Optionally, log the full error stack for debugging purposes.
  // console.error(ioOperationError.stack);
}