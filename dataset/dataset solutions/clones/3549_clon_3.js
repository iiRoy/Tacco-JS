'use strict'; // Retaining strict mode for robust code execution

/**
 * Main routine to process a raw input string, typically from a file or standard input.
 * It determines if a sequence of words meets specific criteria:
 * 1. The number of unique words must match an expected count provided at the beginning.
 * 2. Each consecutive word in the sequence must form a chain, where the last character
 *    of the previous word matches the first character of the current word.
 *
 * @param {string} rawDataString The entire input content as a single string.
 */
const processInputData = (rawDataString) => {
  // Split the raw input string into individual lines, representing the count and words.
  const allInputLines = rawDataString.split('\n');

  // --- Initial Input Validation (Guard Clauses) ---
  // Ensure there's at least one line available for processing.
  if (allInputLines.length === 0) {
    console.warn('Warning: Received an empty input stream. No data to process.');
    return; // Exit early if no input lines are present.
  }

  // Extract the first line, which is expected to contain the numeric count.
  const countLineContent = allInputLines[0];
  const expectedUniqueWordCount = Number(countLineContent);

  // Validate the extracted count. It must be a positive number.
  if (isNaN(expectedUniqueWordCount) || expectedUniqueWordCount <= 0) {
    console.error('Error: The first line does not contain a valid positive number for the expected unique word count.');
    return; // Exit early if the count is invalid.
  }

  // Create a new array containing only the words, excluding the first line (the count).
  // Using slice(1) ensures the original `allInputLines` array is not mutated.
  const wordSequenceEntries = allInputLines.slice(1);

  // --- Core Logic Variables ---
  // Flag to track the overall validation status throughout the checks.
  let isSequenceValid = true;
  // String to store a detailed reason if validation fails.
  let detailedFailureMessage = '';

  // --- Uniqueness Check ---
  // Utilize a Set to efficiently determine the number of distinct words in the sequence.
  const uniqueWordsCollection = new Set(wordSequenceEntries);
  const actualDistinctWordCount = uniqueWordsCollection.size;

  // Compare the actual number of distinct words with the expected count.
  if (actualDistinctWordCount !== expectedUniqueWordCount) {
    isSequenceValid = false;
    detailedFailureMessage = `The number of unique words (${actualDistinctWordCount}) does not match the expected count (${expectedUniqueWordCount}).`;
  }

  // --- Chaining Check (only proceeds if uniqueness check passed) ---
  // Iterate through the word sequence to check character continuity between adjacent words.
  // This loop runs only if the sequence is still considered valid after the uniqueness check.
  if (isSequenceValid) {
    // Start from the second word (index 1) to compare it with the preceding one.
    for (let currentElementIndex = 1; currentElementIndex < wordSequenceEntries.length; currentElementIndex++) {
      const previousWordInSequence = wordSequenceEntries[currentElementIndex - 1];
      const currentWordInSequence = wordSequenceEntries[currentElementIndex];

      // Additional guard: Check if words are empty or undefined, which could cause errors.
      if (!previousWordInSequence || !currentWordInSequence) {
        isSequenceValid = false;
        detailedFailureMessage = 'Encountered an empty or invalid word entry during sequence chaining verification.';
        break; // Stop checking immediately on first invalid word.
      }

      // Extract the last character of the previous word using charAt for safety.
      const lastCharacterOfPrevious = previousWordInSequence.charAt(previousWordInSequence.length - 1);
      // Extract the first character of the current word.
      const firstCharacterOfCurrent = currentWordInSequence.charAt(0);

      // Compare the characters for the chaining condition.
      if (lastCharacterOfPrevious !== firstCharacterOfCurrent) {
        isSequenceValid = false;
        detailedFailureMessage = `Character mismatch detected: Last char of "${previousWordInSequence}" ('${lastCharacterOfPrevious}') does not match first char of "${currentWordInSequence}" ('${firstCharacterOfCurrent}').`;
        break; // Exit the loop as soon as a mismatch is found.
      }
    }
  }

  // --- Final Output ---
  // Log the final result based on the `isSequenceValid` flag.
  if (isSequenceValid) {
    console.info('Sequence validation successful: Yes.');
  } else {
    // Provide a more informative "No" message, including the reason for failure.
    console.info(`Sequence validation failed: No. Reason: ${detailedFailureMessage}`);
  }
};

// --- Execution Entry Point ---
// This block handles reading the input from standard input and invoking the processing function.
try {
  // Use the built-in 'fs' module to read file content.
  const fileSystemModule = require('fs');
  // Read the entire content of '/dev/stdin' as a UTF-8 encoded string.
  const inputContentFromStream = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
  // Pass the read content to our main processing function.
  processInputData(inputContentFromStream);
} catch (executionError) {
  // Catch and log any errors that occur during file reading or initial setup.
  console.error('An unhandled error occurred during input acquisition or initial processing:', executionError.message);
  // Inform the user that validation could not be completed due to an error.
  console.info('Operation could not complete due to an error: No.');
}