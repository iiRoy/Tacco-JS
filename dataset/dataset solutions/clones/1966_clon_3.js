'use strict';

// A dedicated helper function for emitting results to standard output.
// This function ensures that all output is converted to a string before logging.
const emitResult = (contentToLog) => {
  // It's good practice to ensure the content is explicitly a string for console.log.
  console.log(String(contentToLog));
};

/**
 * Processes a raw data string to calculate item frequencies.
 * This function handles parsing input, tallying occurrences, and outputting results.
 * @param {string} rawDataSource - The entire input data as a single string.
 */
function processInputData(rawDataSource) {
  // Defensive programming: check if the input is valid before proceeding.
  if (typeof rawDataSource !== 'string' || rawDataSource.trim().length === 0) {
    emitResult("Error: No valid input data provided. Exiting.");
    return; // Terminate execution gracefully.
  }

  // Divide the monolithic input string into individual lines.
  const dataLines = rawDataSource.split('\n');

  // Validate the minimum number of lines expected.
  if (dataLines.length < 2) {
    emitResult("Error: Insufficient data lines. Expected at least two lines.");
    return;
  }

  let upperRangeLimit; // Corresponds to N in the original problem.
  let targetSequence; // Corresponds to A in the original problem.

  // --- Parsing the first line for the upper range limit (N) ---
  try {
    // Extract the first part of the first line.
    const firstLineComponent = dataLines[0].split(' ')[0];
    upperRangeLimit = parseInt(firstLineComponent.trim(), 10); // Use trim for robustness.

    // Additional validation for the parsed numeric value.
    if (isNaN(upperRangeLimit) || upperRangeLimit <= 0) {
      emitResult(`Error: Invalid or non-positive upper range limit '${firstLineComponent}'.`);
      return;
    }
  } catch (parseErr) {
    emitResult(`Critical Error during N parsing: ${parseErr.message}`);
    return;
  }

  // --- Parsing the second line for the sequence of items (A) ---
  try {
    // Split the second line by space, filter out any empty strings, and convert to integers.
    targetSequence = dataLines[1]
      .split(' ')
      .filter(token => token.trim() !== '') // Remove empty tokens resulting from multiple spaces.
      .map(strNum => parseInt(strNum.trim(), 10)); // Convert each token to an integer.

    // Check if any parsing failed for the target sequence.
    if (targetSequence.some(val => isNaN(val))) {
      emitResult("Warning: Some elements in the target sequence could not be parsed as valid numbers.");
      // Option: Filter out NaNs, or halt. For this problem, filtering is usually fine.
      targetSequence = targetSequence.filter(val => !isNaN(val));
    }
  } catch (parseErr) {
    emitResult(`Critical Error during A parsing: ${parseErr.message}`);
    return;
  }

  // --- Frequency Tallying ---
  // A JavaScript object acts as our frequency map, storing counts for each number.
  // Keys will be numbers (converted to strings by JS objects), values will be their counts.
  const frequencyMap = {};

  // Iterate over the target sequence to populate the frequency map.
  // Using a for...of loop for cleaner iteration over array elements.
  for (const currentNumber of targetSequence) {
    // Only count numbers that are within the valid range [1, upperRangeLimit].
    if (currentNumber >= 1 && currentNumber <= upperRangeLimit) {
      // Increment the count for the current number. If it's not yet in the map,
      // it defaults to 0 before incrementing (using logical OR operator).
      frequencyMap[currentNumber] = (frequencyMap[currentNumber] || 0) + 1;
    }
    // Optionally, log numbers outside the expected range for debugging.
    // else { console.warn(`Item ${currentNumber} is out of the expected range [1, ${upperRangeLimit}] and will be ignored.`); }
  }

  // --- Outputting Results for each number from 1 to upperRangeLimit ---
  // We need to ensure that counts for all numbers from 1 up to 'upperRangeLimit' are printed,
  // even if they did not appear in the 'targetSequence' (in which case their count is 0).
  for (let counterIndex = 1; counterIndex <= upperRangeLimit; ++counterIndex) {
    // Retrieve the count from the frequency map. If a number was not present,
    // its entry in the map will be undefined, so we default to 0.
    const countValue = frequencyMap[counterIndex] || 0;
    emitResult(countValue);
  }
}

// Standard boilerplate for reading from stdin and invoking the main processing logic.
// This part is typically kept as-is for competitive programming environments.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));