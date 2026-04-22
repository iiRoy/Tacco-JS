/*
 * This module processes a raw string input to transform a sequence of numbers
 * into a non-decreasing order by incrementing elements, and calculates the
 * cumulative sum of all such necessary increments.
 *
 * The input is expected to be a multi-line string where:
 * - The first line contains an integer representing the size of the sequence.
 * - The second line contains space-separated integers forming the sequence itself.
 *
 * The function ensures that each element is greater than or equal to its
 * preceding element by adjusting values from left to right.
 */
function analyzeSequence(rawDataContent) {

  // --- Input Pre-processing and Robustness Checks ---

  // Check for null, undefined, or empty input string after trimming whitespace.
  if (!rawDataContent || rawDataContent.trim().length === 0) {
    // In a real application, logging or throwing a custom error would be appropriate.
    // For this context, returning 0 and logging an error to stderr (if desired) is fine.
    console.error("Input data is empty or malformed. Cannot process.");
    return 0;
  }

  // Split the raw input into individual lines.
  const dataLines = rawDataContent.trim().split('\n');

  // Verify that there are at least two lines for sequence length and the sequence itself.
  if (dataLines.length < 2) {
    console.error("Insufficient input lines. Expected at least two lines.");
    return 0;
  }

  // Parse the declared length of the sequence from the first line.
  // Using Number() for parsing, which is a Type III change from parseInt().
  const declaredSequenceLength = Number(dataLines[0].trim());

  // Validate the parsed sequence length.
  if (isNaN(declaredSequenceLength) || declaredSequenceLength <= 0) {
    console.error(`Invalid sequence length: '${dataLines[0].trim()}'. Must be a positive integer.`);
    return 0;
  }

  // Parse the actual numeric sequence from the second line.
  // Each element is trimmed and converted to a number.
  const numericValues = dataLines[1].trim().split(' ').map(val => Number(val.trim()));

  // Further validation: Ensure the actual number of parsed values
  // is at least the declared length to prevent out-of-bounds access
  // during iteration (as the loop uses declaredSequenceLength).
  if (numericValues.length < declaredSequenceLength) {
    console.error(`Mismatch: Declared sequence length (${declaredSequenceLength}) is greater than actual number of values provided (${numericValues.length}).`);
    return 0;
  }

  // Initialize a variable to accumulate the total adjustments made.
  let cumulativeAdjustmentsSum = 0;

  // --- Core Logic: Ensure Non-Decreasing Order ---

  // Iterate through the sequence, comparing each element with its successor.
  // The loop runs up to `declaredSequenceLength - 1` because we access `currentIndex + 1`.
  for (let currentIndex = 0; currentIndex < declaredSequenceLength - 1; currentIndex++) {
    // Introduce temporary variables for current and next elements for readability.
    const currentElement = numericValues[currentIndex];
    const nextElement = numericValues[currentIndex + 1];

    // Check if the current element is strictly greater than the next element.
    // This condition is logically equivalent to `nextElement <= currentElement`
    // but expressed differently for a Type III modification.
    if (currentElement > nextElement) {
      // Calculate the difference required to make the next element equal to the current one.
      const incrementRequired = currentElement - nextElement;

      // Add this required increment to our running total.
      cumulativeAdjustmentsSum += incrementRequired;

      // Modify the next element in the array to be equal to the current element.
      // This ensures the non-decreasing property for subsequent comparisons.
      numericValues[currentIndex + 1] = currentElement;
    }
    // If currentElement <= nextElement, no adjustment is needed for this pair,
    // and the loop proceeds to the next pair.
  }

  // Output the final calculated sum of all increments to standard output.
  console.log(cumulativeAdjustmentsSum);

  // Return the result; useful for testing or integration into larger systems.
  return cumulativeAdjustmentsSum;
}

// --- Execution Entry Point ---

// Use a try-catch block for robust file system interaction,
// which is a Type III addition for error handling.
try {
  // Read the entire content of standard input synchronously.
  const inputDataFromStdin = require("fs").readFileSync("/dev/stdin", "utf8");

  // Invoke the main processing function with the obtained input.
  analyzeSequence(inputDataFromStdin);

} catch (fileReadError) {
  // Handle potential errors during the file reading process.
  console.error("An error occurred while reading from standard input:", fileReadError.message);
  // Exit the process with a non-zero status code to indicate an error.
  process.exit(1);
}