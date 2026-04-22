// This program evaluates a given string to determine if all its characters are unique.
// It reads input from standard input and prints a specific message based on the evaluation.

/**
 * Determines if all characters within the provided string are distinct.
 * It processes the input to identify unique characters and compares their count
 * with the original string's length.
 *
 * @param {string} sourceStringContent The input string to be evaluated for character uniqueness.
 */
function evaluateStringUniqueness(sourceStringContent) {
  // As a robustness measure, confirm the input is a valid string.
  // While the problem context implies valid string input, this adds a layer of safety.
  if (typeof sourceStringContent !== 'string' || sourceStringContent === null) {
    console.error('Program received invalid data: Expected a string for analysis.');
    return; // Exit if input is not suitable.
  }

  // Transform the input string into an array of individual characters.
  // This allows for easier iteration and manipulation of each character.
  const characterSequenceArray = Array.from(sourceStringContent);

  // Capture the total count of characters in the original string.
  // This will be used as a baseline for comparison.
  const initialCharacterCount = characterSequenceArray.length;

  // Initialize a Set data structure to store unique characters.
  // Sets inherently prevent duplicate entries, making them ideal for this task.
  const uniqueElementsTracker = new Set();

  // Iterate over each character present in our sequence array.
  // Attempt to add each character to the Set. If a character is already present,
  // the Set simply ignores the add operation, maintaining its uniqueness.
  for (const singleChar of characterSequenceArray) {
    uniqueElementsTracker.add(singleChar);
  }

  // After processing all characters, compare the number of unique characters
  // (the Set's size) against the original string's total character count.
  // If these numbers match, it signifies that every character in the string was unique.
  const areAllCharactersDistinct = (uniqueElementsTracker.size === initialCharacterCount);

  // Based on the comparison, output the appropriate result to the console.
  if (areAllCharactersDistinct) {
    console.log('absolutely'); // Custom output string for unique case.
  } else {
    console.log('not unique'); // Custom output string for non-unique case.
  }
}

/**
 * Helper function responsible for reading content from standard input (stdin).
 * It uses the Node.js 'fs' module to perform synchronous file reading.
 *
 * @returns {string} The content read from standard input, or an empty string on error.
 */
function acquireStandardInputData() {
  try {
    // Attempt to synchronously read the entire content of stdin as UTF-8.
    return require('fs').readFileSync('/dev/stdin', 'utf8');
  } catch (error) {
    // Log any errors encountered during the input reading process.
    console.error('Error occurred while attempting to read from standard input:', error.message);
    // In case of an error, return an empty string to prevent further processing issues.
    return '';
  }
}

// The primary execution block:
// First, acquire the input data from standard input.
// Then, invoke the main evaluation function with the retrieved data.
evaluateStringUniqueness(acquireStandardInputData());