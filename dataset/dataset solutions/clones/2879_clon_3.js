// Initialize the standard input stream to be ready for data.
process.stdin.resume();

// Set the character encoding for the input stream to ensure proper interpretation.
process.stdin.setEncoding('utf8');

// A dynamic array to accumulate all incoming lines from the standard input.
let bufferedInputLines = [];

// Define constant string patterns for clarity and potential future modification.
const TARGET_SUBSTRING_PATTERN = "ABC";
const REPLACEMENT_SUBSTRING_PATTERN = "BCA";

/**
 * Executes a single, non-global replacement of a substring within a source string.
 * This function finds the first occurrence of the search string and replaces it
 * with the provided replacement string.
 *
 * @param {string} originalSource The string in which to perform the replacement.
 * @param {string} searchFor The substring to find.
 * @param {string} replaceWith The string to insert in place of the found substring.
 * @returns {string} The modified string, or the original string if no match was found.
 */
function replaceFirstOccurrence(originalSource, searchFor, replaceWith) {
    const firstMatchIndex = originalSource.indexOf(searchFor);

    // If the search string is not found, return the original string unchanged.
    if (firstMatchIndex === -1) {
        return originalSource;
    }

    // Construct the new string by concatenating parts:
    // 1. The segment of the string before the first match.
    // 2. The replacement string.
    // 3. The segment of the string after the first match.
    return originalSource.substring(0, firstMatchIndex) +
           replaceWith +
           originalSource.substring(firstMatchIndex + searchFor.length);
}

// Create an instance of the readline interface to process input line by line.
const inputProcessingInterface = require('readline').createInterface({
  input: process.stdin,   // Direct input from standard input stream.
  output: process.stdout  // Standard output stream (though not used for direct replies here).
});

// Attach an event listener for each line received from the input stream.
inputProcessingInterface.on('line', (incomingLineData) => {
  // Add the newly received line to our buffer.
  bufferedInputLines.push(incomingLineData);
});

// Attach an event listener for when the input stream indicates it has closed (End Of File).
inputProcessingInterface.on('close', () => {
  // Perform an initial validation check: ensure there was at least one line of input.
  if (bufferedInputLines.length === 0) {
    // If no input was provided, no transformations can occur, so output 0.
    console.log(0);
    return; // Terminate execution early as there's nothing to process.
  }

  // Extract the primary string that needs processing from the first line of input.
  let currentProcessingSequence = bufferedInputLines[0];

  // Initialize a counter to track the total number of successful transformations.
  let transformationOperationTally = 0;

  // Implement a safety mechanism to prevent infinite loops in pathological cases
  // or extremely long sequences. This is an arbitrary but reasonable limit.
  const MAXIMUM_ITERATION_LIMIT = 500000;
  let currentLoopIteration = 0;

  // The main processing loop: continues as long as the target pattern is found
  // and we haven't exceeded our predefined iteration safety limit.
  while (currentProcessingSequence.includes(TARGET_SUBSTRING_PATTERN) && currentLoopIteration < MAXIMUM_ITERATION_LIMIT) {
    // Apply the transformation: replace the first occurrence of TARGET_SUBSTRING_PATTERN
    // with REPLACEMENT_SUBSTRING_PATTERN using our custom helper function.
    currentProcessingSequence = replaceFirstOccurrence(
        currentProcessingSequence,
        TARGET_SUBSTRING_PATTERN,
        REPLACEMENT_SUBSTRING_PATTERN
    );

    // Increment the counter to reflect a completed transformation.
    transformationOperationTally++;

    // Increment the loop iteration counter for the safety check.
    currentLoopIteration++;

    // Optional: Add a diagnostic output for debugging purposes.
    // console.error(`Diagnostic: After iteration ${transformationOperationTally}, sequence is: '${currentProcessingSequence}'`);
  }

  // If the loop exited due to reaching the iteration limit, it suggests a very
  // long sequence or a potential issue, though for this problem, it's just a safeguard.
  if (currentLoopIteration >= MAXIMUM_ITERATION_LIMIT) {
      // console.error("Warning: Processing halted due to reaching maximum transformation limit. Output might be incomplete.");
  }

  // Output the final count of transformations performed.
  console.log(transformationOperationTally);
});