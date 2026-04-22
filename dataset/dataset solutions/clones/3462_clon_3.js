// This script processes a list of numerical values from standard input.
// The first line of input is expected to be an integer indicating the count
// of subsequent data points. The script then performs a specific weighted
// sum calculation and applies conditional adjustments based on the data.

/**
 * Calculates a weighted difference sum from a string of numerical data.
 * The input string is expected to have the total count on the first line,
 * followed by individual data points on subsequent lines.
 *
 * @param {string} rawDataString The raw input string from which to extract data.
 * @returns {number} The final calculated weighted sum.
 */
const calculateWeightedDifference = (rawDataString) => {
  // Helper function to safely convert a string to a number.
  // Returns 0 for non-numeric or empty strings for robustness.
  const convertToNumber = (str) => {
    const numValue = Number(str);
    return isNaN(numValue) ? 0 : numValue;
  };

  // Helper function for numerical ascending sort order.
  const compareNumbersAscending = (valA, valB) => valA - valB;

  // Split the raw input string into an array of lines, removing any leading/trailing whitespace.
  const allInputLines = rawDataString.trim().split('\n');

  // Guard clause for empty or invalid input.
  if (allInputLines.length === 0 || allInputLines[0].trim().length === 0) {
    console.error("Input data is empty or malformed. Returning 0.");
    return 0;
  }

  // The first line specifies the expected number of data elements.
  const expectedElementCount = convertToNumber(allInputLines[0]);

  // Extract the actual data points from the remaining lines and convert them to numbers.
  // We use slice(1) to skip the count line.
  let numericValueCollection = allInputLines.slice(1).map(convertToNumber);

  // Validate if the actual number of data points matches the declared count.
  // This is an added guard clause for improved robustness (Type III change).
  if (numericValueCollection.length !== expectedElementCount) {
    console.warn(`Warning: Declared count (${expectedElementCount}) does not match actual data points found (${numericValueCollection.length}). Processing with actual found count.`);
  }

  const actualDataPointsLength = numericValueCollection.length;

  // If there are no data points, the result is 0.
  if (actualDataPointsLength === 0) {
    return 0;
  }

  // Sort the collection of numeric values in ascending order.
  numericValueCollection.sort(compareNumbersAscending);

  // Initialize the accumulator for the weighted sum.
  let accumulatedResult = 0;

  // Calculate the index that splits the array into two halves (or nearly two halves).
  // Equivalent to Math.floor((actualDataPointsLength + 1) / 2).
  const divisionPointIndex = (actualDataPointsLength + 1) >>> 1; // Using unsigned right shift for integer division

  // Iterate through the first half of the sorted data (smaller values).
  // Each value in this half contributes negatively to the sum.
  for (let currentElementIndex = 0; currentElementIndex < divisionPointIndex; currentElementIndex++) {
    accumulatedResult -= numericValueCollection[currentElementIndex] * 2;
  }

  // Iterate through the second half of the sorted data (larger values).
  // Each value in this half contributes positively to the sum.
  // The loop continues from where the previous loop left off.
  for (let currentElementIndex = divisionPointIndex; currentElementIndex < actualDataPointsLength; currentElementIndex++) {
    accumulatedResult += numericValueCollection[currentElementIndex] * 2;
  }

  // Apply final adjustments based on whether the number of data points is even or odd.
  if (actualDataPointsLength % 2 === 0) {
    // For an even number of elements, adjust the sum using the two middle elements.
    const rightMiddleElement = numericValueCollection[divisionPointIndex];
    const leftMiddleElement = numericValueCollection[divisionPointIndex - 1];
    return accumulatedResult - rightMiddleElement + leftMiddleElement;
  } else {
    // For an odd number of elements, apply a more complex conditional adjustment.
    // Introduce intermediate variables for clarity in the complex condition (Type III change).
    const medianValue = numericValueCollection[divisionPointIndex - 1]; // The exact middle element
    const elementBeforeMedian = numericValueCollection[divisionPointIndex - 2];
    const elementAfterMedian = numericValueCollection[divisionPointIndex];

    const conditionPartA = medianValue + elementBeforeMedian;
    const conditionPartB = medianValue * 3 - elementAfterMedian;

    // Based on the comparison, choose one of two adjustment formulas.
    if (conditionPartA > conditionPartB) {
      return accumulatedResult + conditionPartA;
    } else {
      return accumulatedResult + conditionPartB;
    }
  }
};

// Main execution block: read from stdin and print the result.
// Wrapped in a try-catch for robust error handling (Type III change).
try {
  // Dynamically require the 'fs' module for file system operations.
  const fileSystemModule = require("fs");
  // Read the entire content of standard input synchronously.
  const standardInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");

  // Call the refactored calculation function and log its result.
  console.log(calculateWeightedDifference(standardInputContent));
} catch (executionError) {
  // If an error occurs during file reading or calculation, log it.
  console.error("An error occurred during program execution:", executionError.message);
  // Output a specific error value or message to indicate failure.
  console.log(-1); // A common practice in competitive programming for error indication.
}