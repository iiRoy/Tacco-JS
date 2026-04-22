const analyzeNumericalDataSets = (inputPayload) => {
  // Guard clause: Ensure the input payload is a valid string and not empty after trimming.
  if (typeof inputPayload !== 'string' || inputPayload.trim().length === 0) {
    console.error("Error: Invalid or empty input payload received.");
    return;
  }

  // Split the raw input string into an array of lines, trimming the overall input first.
  const dataLines = inputPayload.trim().split('\n');

  // Validate that there are at least three lines of data (N, Array A, Array B).
  if (dataLines.length < 3) {
    console.error("Error: Insufficient data lines provided. Expected at least 3 lines.");
    return;
  }

  // Parse the total count of elements for the data sets from the first line.
  const elementCount = Number.parseInt(dataLines[0].trim(), 10);

  // Validate the parsed element count to ensure it's a positive integer.
  if (Number.isNaN(elementCount) || elementCount <= 0) {
    console.error("Error: Invalid or non-positive element count specified in the first line.");
    return;
  }

  // Helper function to parse a space-separated string of numbers into an array of integers.
  // It includes robustness for multiple spaces and non-numeric entries.
  const convertLineToNumberArray = (numericString) => {
    return numericString
      .trim() // Remove leading/trailing whitespace from the line
      .split(' ') // Split by space character
      .filter(segment => segment !== '') // Filter out empty strings that result from multiple spaces
      .map(segment => Number.parseInt(segment.trim(), 10)) // Convert each string segment to an integer
      .filter(parsedNum => !Number.isNaN(parsedNum)); // Filter out any NaN values from failed parses
  };

  // Parse the primary and secondary value arrays from the second and third input lines.
  const primaryValueArray = convertLineToNumberArray(dataLines[1]);
  const secondaryValueArray = convertLineToNumberArray(dataLines[2]);

  // Validate that the lengths of the parsed arrays match the declared element count.
  if (primaryValueArray.length !== elementCount || secondaryValueArray.length !== elementCount) {
    console.error(`Error: Mismatch between declared element count (${elementCount}) and actual array lengths (Primary: ${primaryValueArray.length}, Secondary: ${secondaryValueArray.length}).`);
    return;
  }

  // Initialize accumulator variables for sums and differences.
  let primaryTotalSum = 0;
  let secondaryTotalSum = 0;
  let cumulativeAbsoluteDifference = 0; // Sum of |primaryValueArray[idx] - secondaryValueArray[idx]|
  let sumOfPositiveSecondaryDelta = 0; // Sum of (secondaryValueArray[idx] - primaryValueArray[idx]) when secondary > primary
  let sumOfPositivePrimaryDelta = 0; // Sum of (primaryValueArray[idx] - secondaryValueArray[idx]) when primary > secondary

  // Loop through each element pair to compute the required statistics.
  for (let currentIdx = 0; currentIdx < elementCount; ++currentIdx) {
    const pVal = primaryValueArray[currentIdx];
    const sVal = secondaryValueArray[currentIdx];

    // Accumulate the sums of elements for both arrays.
    primaryTotalSum += pVal;
    secondaryTotalSum += sVal;

    // Calculate the difference for the current pair (primary - secondary).
    const currentElementDifference = pVal - sVal;

    // Add the absolute value of the difference to the cumulative total.
    cumulativeAbsoluteDifference += Math.abs(currentElementDifference);

    // Accumulate sum of cases where secondary value is greater than primary.
    // This is equivalent to Math.max(0, sVal - pVal).
    sumOfPositiveSecondaryDelta += Math.max(0, sVal - pVal);

    // Accumulate sum of cases where primary value is greater than secondary.
    // This is equivalent to Math.max(0, pVal - sVal).
    sumOfPositivePrimaryDelta += Math.max(0, pVal - sVal);
  }

  // --- Evaluation of Final Conditions ---
  // Calculate the net difference between the total sums, used in multiple conditions.
  const netSumDiff = secondaryTotalSum - primaryTotalSum;

  // Evaluate each of the five conditions separately for enhanced readability.
  const checkConditionA = (primaryTotalSum <= secondaryTotalSum);
  const checkConditionB = (cumulativeAbsoluteDifference <= netSumDiff * 3);
  const checkConditionC = (sumOfPositiveSecondaryDelta <= netSumDiff * 2);
  const checkConditionD = (sumOfPositivePrimaryDelta <= netSumDiff);

  // Condition E involves division, requiring careful handling for a zero denominator
  // to ensure behavior consistent with the original JavaScript evaluation (NaN comparisons).
  let checkConditionE = false;
  if (sumOfPositivePrimaryDelta !== 0) {
      // If the denominator is not zero, perform the division and comparison.
      checkConditionE = (sumOfPositiveSecondaryDelta / sumOfPositivePrimaryDelta <= 2);
  }
  // Note: If 'sumOfPositivePrimaryDelta' is zero, the original `X/0 <= 2` would result
  // in `NaN <= 2` (if numerator is 0) or `Infinity <= 2` (if numerator is > 0).
  // Both `NaN <= 2` and `Infinity <= 2` evaluate to `false` in JavaScript.
  // Therefore, if `sumOfPositivePrimaryDelta` is 0, `checkConditionE` correctly remains `false`.

  // Determine the final decision based on all conditions being met.
  let finalOutcome = "No"; // Default to 'No'
  if (checkConditionA && checkConditionB && checkConditionC && checkConditionD && checkConditionE) {
    finalOutcome = "Yes"; // Change to 'Yes' if all conditions are true
  }

  // Output the final decision string to standard output.
  console.log(finalOutcome);
};

// Main execution block: Reads input from standard input and passes it to the analysis function.
// This part is typically environment-specific for competitive programming.
analyzeNumericalDataSets(require("fs").readFileSync("/dev/stdin", "utf8"));