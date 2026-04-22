'use strict';

/**
 * Processes raw input data to identify and count consecutive blocks of identical elements.
 * This function reads a sequence of tokens and determines how many times the token changes,
 * effectively counting distinct segments within the sequence.
 *
 * @param {string} rawInputContent - The complete input string, typically read from standard input.
 */
function processInputData(rawInputContent) {
  // --- Input Validation and Initial Parsing ---

  // Guard clause: Check if the input content is valid and not empty.
  if (!rawInputContent || typeof rawInputContent !== 'string' || rawInputContent.trim() === '') {
    console.error("Error: Provided input content is empty, invalid, or missing.");
    return; // Exit early if input is unusable.
  }

  // Split the entire input string into an array of individual lines.
  const inputLines = rawInputContent.split('\n');

  // Guard clause: Ensure there are enough lines for processing (at least two: count and sequence).
  if (inputLines.length < 2) {
    console.error("Error: Not enough data lines in the input. Expected at least two lines.");
    return; // Exit early.
  }

  // The first line (inputLines[0]) typically contains a count, but we will derive the length
  // directly from the processed sequence array, making this line's explicit value redundant for the loop.
  // const declaredElementCount = Number.parseInt(inputLines[0], 10); // Can be kept for validation, but not used here.

  // The second line contains the space-separated sequence of elements.
  const elementSequenceString = inputLines[1];

  // Split the sequence string by spaces into an array of tokens.
  // Use filter to remove any potential empty strings resulting from multiple spaces.
  const tokenSequenceArray = elementSequenceString.split(' ').filter(token => token !== '');

  // --- Core Logic: Counting Distinct Blocks ---

  let segmentTally = 0; // This variable will store the final count of distinct segments.
  let lastObservedToken = null; // Initialize with null to ensure the very first token is always counted as a new segment.

  // Edge case handling: If the token array is empty, there are no segments.
  if (tokenSequenceArray.length === 0) {
    console.log(0);
    return; // Exit early.
  }

  // Iterate over each token in the sequence array.
  // Using a 'for...of' loop for clear and concise iteration over array elements.
  for (const currentElementToken of tokenSequenceArray) {
    // Compare the current token with the last observed token.
    // If they are different, it signifies the beginning of a new distinct block.
    if (currentElementToken !== lastObservedToken) {
      segmentTally++; // Increment the counter for a new distinct block.
      lastObservedToken = currentElementToken; // Update the reference for the next comparison.
    }
  }

  // --- Output Result ---

  // Display the final count of distinct consecutive blocks.
  console.log(segmentTally);
}

// --- Execution Trigger: Read from Standard Input ---

// This block handles reading the input from '/dev/stdin' (standard input)
// and passes it to our main processing function.
try {
  // Dynamically require the 'fs' (file system) module.
  const fileSystemUtility = require('fs');
  // Read the entire content of standard input synchronously, decoding it as UTF-8.
  const stdInputContent = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');
  // Invoke the processing function with the obtained input.
  processInputData(stdInputContent);
} catch (inputError) {
  // Catch and log any errors that occur during file reading (e.g., file not found, permissions).
  console.error("An error occurred while attempting to read from standard input:", inputError.message);
  // In a production environment, you might want to exit the process with an error code here.
  // process.exit(1);
}