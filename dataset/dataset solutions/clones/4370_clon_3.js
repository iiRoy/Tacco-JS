"use strict"; // Enforce strict parsing and error handling for robust code execution.

/**
 * Initiates the processing pipeline for a stream of numerical data.
 * This function is responsible for reading structured input,
 * identifying unique numerical entries that appear an odd number of times,
 * and then reporting the total count of such unique elements.
 *
 * @param {string} rawInputContent The complete string content received from the input source.
 */
function processInputDataStream(rawInputContent) {
  // Step 1: Normalize and parse the incoming raw string data.
  // The input is expected to be a sequence of numbers, each on a new line.
  // We handle various newline characters and convert each line to an integer.
  // Non-numeric or empty lines are coerced to 0, mimicking the bitwise NOT operator's behavior (~~).
  const parsedNumericalEntries = rawInputContent
    .split(/\r?\n/) // Split by common newline patterns (CRLF for Windows, LF for Unix).
    .map(lineText => {
      const trimmedLine = lineText.trim(); // Remove leading/trailing whitespace.
      const integerValue = parseInt(trimmedLine, 10); // Parse as base-10 integer.

      // If parsing results in NaN (e.g., empty string, non-numeric text),
      // default the value to 0 to align with `~~` operator's behavior.
      return isNaN(integerValue) ? 0 : integerValue;
    });

  // Step 2: Initialize a tracking mechanism for elements encountered an odd number of times.
  // A Set is ideal here because it automatically handles uniqueness.
  // Adding an element means its count becomes odd; deleting means its count becomes even.
  const uniqueOddFrequencyElements = new Set();

  // Helper variable for loop boundary for clarity and potential minor performance.
  const dataEntryCount = parsedNumericalEntries.length;

  // Step 3: Iterate through the parsed numerical entries to update the tracker.
  // The loop starts from the second element (index 1), often used in competitive programming
  // where the first line might contain metadata (like total count) that's not directly processed.
  for (let currentEntryIndex = 1; currentEntryIndex < dataEntryCount; ++currentEntryIndex) {
    const activeNumericValue = parsedNumericalEntries[currentEntryIndex];

    // Optional guard: If for some reason a non-numeric value slipped through
    // or was explicitly allowed to become NaN, we might choose to skip it here.
    // Given the `parseInt` and `isNaN` handling above, this specific check
    // might be redundant but demonstrates an added validation fragment.
    if (typeof activeNumericValue !== 'number' || isNaN(activeNumericValue)) {
      // If an entry is definitively not a valid number (e.g., NaN), skip its processing.
      continue;
    }

    // Core logic: Toggle the presence of the current value in the set.
    // If the value is already in the set, it means it has appeared an odd number of times
    // up to this point. This current appearance makes its total count even, so we remove it.
    // If the value is not in the set, this appearance makes its total count odd, so we add it.
    if (uniqueOddFrequencyElements.has(activeNumericValue)) {
      uniqueOddFrequencyElements.delete(activeNumericValue); // Element count becomes even.
    } else {
      uniqueOddFrequencyElements.add(activeNumericValue); // Element count becomes odd.
    }
  }

  // Step 4: Determine the final result.
  // The size of the set at the end represents the total number of unique elements
  // that have appeared an odd number of times throughout the input stream.
  const finalDistinctOddCount = uniqueOddFrequencyElements.size;

  // Step 5: Output the calculated result to the standard output.
  console.log(finalDistinctOddCount);
}

// --- Application Entry Point ---
// This block handles the initial setup, including reading from the standard input.
// A try-catch block is used to gracefully manage potential file system errors.
try {
  // Dynamically import the 'fs' (File System) module, commonly used for I/O operations.
  const fileSystemUtility = require("fs");
  // Define the standard input path for Unix-like systems.
  const standardInputPath = "/dev/stdin";

  // Synchronously read the entire content of the standard input as a UTF-8 string.
  // This operation will block until the entire input stream is available.
  const receivedDataBuffer = fileSystemUtility.readFileSync(standardInputPath, "utf8");

  // Call the main processing function with the data read from stdin.
  processInputDataStream(receivedDataBuffer);
} catch (inputReadError) {
  // If any error occurs during the file reading or initial processing, log it.
  console.error("An error occurred during input acquisition or initial processing:", inputReadError.message);
  // Optionally, terminate the process with an error code to indicate failure.
  // process.exit(1);
}