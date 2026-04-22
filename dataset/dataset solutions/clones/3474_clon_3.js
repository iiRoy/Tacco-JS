/**
 * Converts a string representation to a numeric value.
 * Utilizes the unary plus operator for type coercion, which is equivalent to Number()
 * and handles various numerical string formats.
 *
 * @param {string} inputString - The string to be converted into a number.
 * @returns {number} The parsed numeric value. Returns NaN if the string cannot be converted.
 */
const parseNumericValue = (inputString) => {
  // The unary plus operator is a concise way to convert a string to a number.
  // It handles integers and floating-point numbers, similar to Number().
  const convertedValue = +inputString;

  // Additional validation for robustness, though problem context implies valid numbers.
  // if (isNaN(convertedValue)) {
  //   console.warn(`Warning: Could not parse "${inputString}" into a number.`);
  // }

  return convertedValue;
};


/**
 * Computes the sum of absolute differences between all adjacent elements in a numeric sequence.
 * This function iterates through the provided array, calculating the absolute difference
 * between each element and its immediate successor, and aggregates these differences.
 *
 * @param {Array<number>} numericSequence - An ordered array of numerical values.
 * @returns {number} The aggregate absolute difference across the sequence. Returns 0 for
 *                   empty or single-element arrays as no adjacent differences exist.
 */
function calculateTotalAbsoluteDifference(numericSequence) {
  // Ensure the input is an array and has at least two elements to calculate differences.
  if (!Array.isArray(numericSequence) || numericSequence.length < 2) {
    return 0; // No differences to calculate for sequences with less than two elements.
  }

  let aggregateAbsDifference = 0; // Initialize the accumulator for the total difference.
  const sequenceLength = numericSequence.length; // Cache the array length for loop efficiency.

  // Iterate from the first element up to the second-to-last element.
  // This ensures that `currentIdx + 1` always refers to a valid index.
  for (let currentIdx = 0; currentIdx < sequenceLength - 1; ++currentIdx) {
    const firstElement = numericSequence[currentIdx];
    const secondElement = numericSequence[currentIdx + 1];

    // Calculate the absolute difference between the current and the next element.
    const segmentDifference = Math.abs(firstElement - secondElement);

    // Add this segment's difference to the running total.
    aggregateAbsDifference += segmentDifference;
  }

  return aggregateAbsDifference; // Return the final accumulated difference.
}


/**
 * Processes raw input data to arrange numbers in an optimal sequence that minimizes
 * the total absolute difference between adjacent elements, then outputs this minimum difference.
 * The strategy involves an alternating placement approach: in each turn, it picks
 * numbers from either the smallest or largest end of a sorted list and strategically
 * places them at either end of a growing result sequence.
 *
 * @param {string} rawDataString - The raw input string. It is expected to be
 *                                 multi-line, with the first line indicating
 *                                 the count of numbers (N), and subsequent N lines
 *                                 containing the actual numbers.
 */
function processInputAndCalculateOptimalArrangement(rawDataString) {
  // --- Input Parsing and Initial Data Setup ---

  // Clean up whitespace and split the input string into an array of individual lines.
  const inputLines = rawDataString.trim().split('\n');

  // Basic validation: check if any input lines were provided.
  if (!inputLines || inputLines.length === 0) {
    console.error("Error: Input data is empty or malformed.");
    return; // Terminate execution if no input is available.
  }

  // The first line should contain the total count of numbers.
  const totalElementsCount = parseNumericValue(inputLines[0]);

  // Validate the parsed count. It must be a positive, finite number.
  if (isNaN(totalElementsCount) || totalElementsCount <= 0 || !Number.isFinite(totalElementsCount)) {
    console.error("Error: The specified element count is invalid or non-positive.");
    return;
  }

  // Ensure that the number of data lines matches the expected count.
  // `totalElementsCount + 1` because the first line is the count itself.
  if (inputLines.length < totalElementsCount + 1) {
    console.error(`Error: Expected ${totalElementsCount} data numbers, but only ${inputLines.length - 1} were found.`);
    return;
  }

  // Extract the actual numeric values from the input lines, starting from the second line.
  // Use `slice` to get only the data lines, then `map` to convert them to numbers.
  let availableNumbersList = inputLines.slice(1, totalElementsCount + 1)
                                      .map(parseNumericValue);

  // Validate that all extracted numbers were successfully parsed.
  if (availableNumbersList.some(isNaN)) {
    console.error("Error: One or more input numbers could not be parsed correctly.");
    return;
  }

  // The array where the final optimally ordered sequence will be constructed.
  const orderedSequence = [];

  // Sort the initial list of numbers in ascending order. This is fundamental
  // for the strategy of picking from the 'min' (start) or 'max' (end) of the list.
  availableNumbersList.sort((a, b) => a - b);

  // --- Core Arrangement Algorithm ---

  // This variable tracks the current strategy: whether to pick the smallest
  // ('take_min_candidate') or largest ('take_max_candidate') available number.
  let currentPlacementStrategy = 'take_min_candidate'; // Algorithm starts by considering the smallest.

  // Handle the very first element placement as a special case.
  // The original algorithm places the smallest available number first.
  if (totalElementsCount > 0) {
    orderedSequence.push(availableNumbersList.shift()); // Place the smallest number first.
    currentPlacementStrategy = 'take_max_candidate'; // After the first element, switch to 'max' strategy.
  }

  // Continue the main placement loop until the ordered sequence contains all elements.
  while (orderedSequence.length < totalElementsCount) {
    let primaryCandidate, secondaryCandidate; // Variables for the two numbers taken per turn.

    // Determine which end of `availableNumbersList` to draw candidates from for this turn.
    if (currentPlacementStrategy === 'take_min_candidate') {
      // Take the smallest available number as the primary candidate.
      primaryCandidate = availableNumbersList.shift();
      // If there's space for another element in the `orderedSequence` and
      // `availableNumbersList` isn't empty, take the next smallest as the secondary candidate.
      if (availableNumbersList.length > 0 && orderedSequence.length + 1 < totalElementsCount) {
        secondaryCandidate = availableNumbersList.shift();
      }
    } else { // currentPlacementStrategy === 'take_max_candidate'
      // Take the largest available number as the primary candidate.
      primaryCandidate = availableNumbersList.pop();
      // If there's space for another element and `availableNumbersList` isn't empty,
      // take the next largest as the secondary candidate.
      if (availableNumbersList.length > 0 && orderedSequence.length + 1 < totalElementsCount) {
        secondaryCandidate = availableNumbersList.pop();
      }
    }

    // Critical guard: if no primary candidate could be drawn, something is wrong
    // (e.g., `totalElementsCount` was higher than actual numbers available).
    if (primaryCandidate === undefined) {
      console.warn("Algorithm attempted to draw a primary candidate but the source list was empty. Exiting loop prematurely.");
      break;
    }

    // Retrieve the current first and last elements of the growing sequence.
    const firstElementInSequence = orderedSequence[0];
    const lastElementInSequence = orderedSequence[orderedSequence.length - 1];

    // Calculate the hypothetical absolute differences if the primary candidate
    // were added to the front or to the back of the current sequence.
    const diffIfPrimaryAddedToFront = Math.abs(firstElementInSequence - primaryCandidate);
    const diffIfPrimaryAddedToBack = Math.abs(lastElementInSequence - primaryCandidate);

    // Decision logic for placing the primary candidate:
    // If placing the primary candidate at the front results in a *larger* difference
    // compared to placing it at the back, then choose to place it at the back.
    // Otherwise (if front diff is smaller or equal), place it at the front.
    if (diffIfPrimaryAddedToFront > diffIfPrimaryAddedToBack) {
      orderedSequence.unshift(primaryCandidate); // Add to the beginning of the sequence.
      // If a secondary candidate was obtained, place it at the *opposite* end.
      if (secondaryCandidate !== undefined) {
        orderedSequence.push(secondaryCandidate); // Add to the end.
      }
    } else {
      orderedSequence.push(primaryCandidate); // Add to the end of the sequence.
      // If a secondary candidate was obtained, place it at the *opposite* end.
      if (secondaryCandidate !== undefined) {
        orderedSequence.unshift(secondaryCandidate); // Add to the beginning.
      }
    }

    // Toggle the strategy for the next iteration: if 'min' was used, switch to 'max', and vice-versa.
    currentPlacementStrategy = (currentPlacementStrategy === 'take_min_candidate') ?
                               'take_max_candidate' : 'take_min_candidate';
  }

  // --- Final Calculation and Output ---

  // Once the ordered sequence is complete, calculate its total absolute difference.
  const finalAggregateDifference = calculateTotalAbsoluteDifference(orderedSequence);

  // Output the final result to standard output.
  console.log(finalAggregateDifference);
}


// --- Entry Point for Script Execution ---

// This block handles reading input from standard input (/dev/stdin)
// and passes it to the main processing function.
try {
  // Dynamically require the 'fs' (file system) module for reading files.
  const fileSystemModule = require("fs");

  // Read the entire content of standard input synchronously.
  // 'utf8' encoding is specified to handle text data correctly.
  const stdInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");

  // Invoke the main function with the content read from stdin.
  processInputAndCalculateOptimalArrangement(stdInputContent);
} catch (error) {
  // Catch and log any errors that occur during file reading or processing.
  console.error("An error occurred during input processing:", error.message);
  // Optionally, provide a more detailed stack trace for debugging.
  // console.error(error.stack);
}