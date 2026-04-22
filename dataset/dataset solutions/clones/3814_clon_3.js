// Function to process a raw text input and determine the minimum removals
// needed to achieve a perfectly consecutive sequence from the provided items.
function analyzeDataStream(inputContentStr) {
  // Defensive check: Ensure the input string is valid and not empty.
  if (!inputContentStr || typeof inputContentStr !== 'string' || inputContentStr.trim() === '') {
    // In a production environment, this might throw an error or return a specific error code.
    // For this demonstration, we'll log a message and indicate an issue with -1.
    console.error("Error: Provided input content string is invalid or empty.");
    return -1;
  }

  // First operation: Split the raw string into individual lines.
  const linesOfText = inputContentStr.split('\n');
  const parsedNumericData = [];

  // Iterate over each line to parse it into a number.
  // This step explicitly handles trimming and number conversion.
  for (let currentLine of linesOfText) {
    const trimmedEntry = currentLine.trim();
    // Skip empty lines that might result from multiple newlines or trailing newlines.
    if (trimmedEntry.length > 0) {
      const numericValue = parseInt(trimmedEntry, 10);
      // Validate that the parsed value is indeed a number.
      if (isNaN(numericValue)) {
        console.error(`Error: Encountered a non-numeric value '${trimmedEntry}' during input parsing.`);
        return -1;
      }
      parsedNumericData.push(numericValue);
    }
  }

  // Early exit if no valid numeric data was extracted.
  if (parsedNumericData.length === 0) {
    console.error("Error: No valid numeric data could be extracted from the input.");
    return -1;
  }

  // The very first number in the parsed data indicates the total count
  // of subsequent items that are part of the sequence.
  const expectedItemCount = parsedNumericData[0];

  // More robust validation for the total number of items.
  if (expectedItemCount < 0 || !Number.isInteger(expectedItemCount)) {
      console.error(`Error: The declared item count (${expectedItemCount}) is invalid. It must be a non-negative integer.`);
      return -1;
  }

  // Optional warning: Check if the actual number of parsed items matches the declared count.
  // The original problem implies `parsedNumericData` will have `expectedItemCount + 1` elements.
  if (parsedNumericData.length - 1 < expectedItemCount) {
      console.warn(`Warning: Declared item count (${expectedItemCount}) is greater than the available data items (${parsedNumericData.length - 1}).`);
  } else if (parsedNumericData.length - 1 > expectedItemCount) {
      console.warn(`Warning: More data items (${parsedNumericData.length - 1}) found than declared (${expectedItemCount}). Extra items will be ignored.`);
  }

  // Initialize an array to track the length of the longest consecutive sequence
  // ending at each number. The array size accommodates numbers from 0 up to `expectedItemCount`.
  // All elements are set to 0 initially, signifying no sequence has ended at them yet.
  const consecutiveSequenceLengths = new Array(expectedItemCount + 1).fill(0);

  // This variable will store the maximum length of any consecutive sequence found
  // across all processed numbers. It starts at zero.
  let maxSequenceFound = 0;

  // Iterate through the actual data items, starting from the second element
  // (index 1) of `parsedNumericData`, up to the `expectedItemCount`.
  // This loop is responsible for building the `consecutiveSequenceLengths` array
  // and simultaneously tracking the overall maximum sequence length.
  for (let dataItemIndex = 1; dataItemIndex <= expectedItemCount; ++dataItemIndex) {
    const currentSequenceNumber = parsedNumericData[dataItemIndex];

    // Introduce a guard clause for individual data items.
    // Ensure the number is defined, an integer, non-negative, and within expected bounds.
    if (currentSequenceNumber === undefined || !Number.isInteger(currentSequenceNumber) || currentSequenceNumber < 0 || currentSequenceNumber > expectedItemCount) {
        console.warn(`Warning: Skipping invalid or out-of-bounds number at input index ${dataItemIndex}: ${currentSequenceNumber}.`);
        continue; // Move to the next item if the current one is invalid.
    }

    // Determine the length of the consecutive sequence ending at `currentSequenceNumber`.
    // This is 1 plus the length of the sequence ending at `currentSequenceNumber - 1`.
    // A check is added to ensure `currentSequenceNumber - 1` is not negative before accessing.
    const lengthOfPreviousNumberSequence = (currentSequenceNumber > 0)
      ? consecutiveSequenceLengths[currentSequenceNumber - 1]
      : 0; // If current number is 0, there's no "previous" positive number.

    // Update the length for the current number.
    consecutiveSequenceLengths[currentSequenceNumber] = lengthOfPreviousNumberSequence + 1;

    // After updating the current sequence length, compare it with the global maximum found so far.
    // This effectively merges the original second loop into the first, reducing iteration passes.
    if (consecutiveSequenceLengths[currentSequenceNumber] > maxSequenceFound) {
      maxSequenceFound = consecutiveSequenceLengths[currentSequenceNumber];
    }
  }

  // The final calculation: the number of elements that must be removed from the
  // total set of items to leave only the longest consecutive subsequence.
  const numberOfElementsToRemove = expectedItemCount - maxSequenceFound;

  // Output the computed result to the standard console.
  console.log(numberOfElementsToRemove);

  // For testing or integration, the function can also return the result.
  return numberOfElementsToRemove;
}

// Main execution block for Node.js environment.
// This part handles reading the input from standard input (e.g., from a file).
try {
  const fileSystemModule = require("fs");
  const standardInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
  analyzeDataStream(standardInputContent);
} catch (executionIssue) {
  // Catch and report any errors that occur during file reading or function execution.
  console.error("An unexpected error occurred during script execution:", executionIssue.message);
  // Exit the process with a non-zero code to signal an error.
  process.exit(1);
}