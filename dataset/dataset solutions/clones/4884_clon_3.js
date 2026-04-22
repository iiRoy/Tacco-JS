/**
 * Processes raw input data to identify and count occurrences of the maximum difference
 * between a numerical element and the smallest value encountered up to its position.
 * This function is designed to simulate a typical competitive programming problem structure.
 *
 * @param {string} rawInputString - The full input content as a single string, typically read from standard input.
 *                                   The expected format is:
 *                                   Line 1: A single integer 'N', representing the total number of elements to process.
 *                                   Line 2: 'N' space-separated integers, which are the data points for analysis.
 */
function processInputData(rawInputString) {
  // Normalize and split the entire input string into an array of individual lines.
  const inputLines = rawInputString.trim().split("\n");

  // A preliminary check to ensure that the input contains at least two lines
  // (one for count, one for data) for valid processing.
  if (inputLines.length < 2) {
    console.error("Input Error: Not enough lines provided. Expected at least two lines.");
    return; // Terminate execution if input is malformed.
  }

  // Parse the first line to extract the expected number of elements.
  // The split is necessary in case there are other tokens on the first line, though typically it's just 'N'.
  const firstLineTokens = inputLines[0].split(" ");
  const expectedElementCount = Number.parseInt(firstLineTokens[0], 10);

  // Validate the parsed element count. It must be a positive integer.
  if (isNaN(expectedElementCount) || expectedElementCount <= 0) {
    console.error("Input Error: Invalid or non-positive element count detected in the first line.");
    return;
  }

  // Parse the second line, which contains the actual numeric data.
  // Each space-separated string is converted to an integer.
  const numericDataPoints = inputLines[1].split(" ").map(val => Number.parseInt(val, 10));

  // Verify that the number of successfully parsed data points matches the count declared on the first line.
  if (numericDataPoints.length !== expectedElementCount) {
    console.error(`Input Error: Mismatch between declared element count (${expectedElementCount}) and actual parsed data points (${numericDataPoints.length}).`);
    // For robust applications, one might decide to proceed with the available data or throw a more specific error.
    return;
  }

  // Initialize the primary variables for tracking the algorithm's state.
  // `currentOverallMinimum` stores the smallest number encountered as the iteration progresses.
  // `peakDifferenceFound` keeps track of the largest difference (current_value - current_minimum) observed.
  // `peakDifferenceOccurrences` counts how many times this `peakDifferenceFound` has been achieved.
  let currentOverallMinimum = Number.MAX_SAFE_INTEGER; // Start with the largest possible safe integer to ensure any input number becomes the first minimum.
  let peakDifferenceFound = 0;
  let peakDifferenceOccurrences = 0;

  // Iterate over each number in the pre-parsed data points array.
  // Using a `for...of` loop is a modern and clean way to iterate over array elements.
  for (const currentElementValue of numericDataPoints) {
    // Basic validation for each element to ensure it's a valid number.
    // This helps in handling malformed data within the numeric line itself.
    if (isNaN(currentElementValue)) {
      console.warn(`Data Warning: Skipping non-numeric value '${currentElementValue}' found in the data stream.`);
      continue; // Move to the next element if the current one is invalid.
    }

    // Update the `currentOverallMinimum` if the `currentElementValue` is smaller.
    // `Math.min` is an efficient and readable way to find the minimum.
    currentOverallMinimum = Math.min(currentOverallMinimum, currentElementValue);

    // Calculate the difference between the current element and the minimum value seen up to this point.
    const calculatedCurrentDifference = currentElementValue - currentOverallMinimum;

    // Logic to update the `peakDifferenceFound` and `peakDifferenceOccurrences`.
    if (calculatedCurrentDifference > peakDifferenceFound) {
      // If a new maximum difference is discovered, update `peakDifferenceFound`
      // and reset `peakDifferenceOccurrences` to 1, as this is the first time this new maximum is seen.
      peakDifferenceFound = calculatedCurrentDifference;
      peakDifferenceOccurrences = 1;
    } else if (calculatedCurrentDifference === peakDifferenceFound) {
      // If the current difference matches the existing maximum difference,
      // increment the occurrence count.
      peakDifferenceOccurrences++;
    }
    // If `calculatedCurrentDifference` is less than `peakDifferenceFound`,
    // it does not contribute to the maximum, so no action is needed.
  }

  // Output the final count of how many times the maximum difference was observed.
  // The `console.log` function automatically handles type conversion to string.
  console.log(peakDifferenceOccurrences);
}

// This line is standard for competitive programming in Node.js,
// reading all data from stdin and passing it to the processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));