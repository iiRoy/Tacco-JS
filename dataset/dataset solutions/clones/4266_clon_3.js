// Function to process a multi-line string input and perform calculations based on its content.
const processDataEntry = (rawInputContent) => {
  // Defensive programming: Validate the incoming raw data.
  // Ensure it's a non-empty string before proceeding.
  if (typeof rawInputContent !== 'string' || rawInputContent.trim() === '') {
    // Log an error and return a default/error value if the input is invalid.
    // This adds robustness compared to the original code.
    console.error("Input data is invalid or empty. Cannot proceed with processing.");
    return 0;
  }

  // Utility function to parse a single line of space-separated numeric strings into an array of numbers.
  // This encapsulates the parsing logic for reusability and clarity.
  const parseNumericSequence = (lineContent) => {
    // If the line is empty or just whitespace, return an empty array.
    if (!lineContent || lineContent.trim() === '') {
      return [];
    }
    // Use Number() for conversion, which handles various numeric formats including floats,
    // but for this problem, integers are expected.
    return lineContent.split(' ').map(numericStr => Number(numericStr));
  };

  // Split the entire input string into an array of individual lines.
  const dataLines = rawInputContent.split('\n');

  // Verify that there are enough lines for the expected data sets.
  // The original code implicitly assumes lines 1, 2, and 3 exist.
  if (dataLines.length < 4) { // We need at least index 0, 1, 2, 3.
    console.error("Insufficient lines detected in the input data. Expected at least 4 lines.");
    return 0;
  }

  // Extract and convert the three required data sets from specific lines.
  // The first line (index 0) is typically a count and is ignored by the original logic.
  const firstNumericSet = parseNumericSequence(dataLines[1]); // Corresponds to 'as'
  const secondNumericSet = parseNumericSequence(dataLines[2]); // Corresponds to 'bs'
  const thirdNumericSet = parseNumericSequence(dataLines[3]); // Corresponds to 'cs'

  // Additional validation: Check if any of the parsed sets are unexpectedly empty.
  if (firstNumericSet.length === 0 || secondNumericSet.length === 0 || thirdNumericSet.length === 0) {
      console.warn("One or more essential numeric sets were parsed as empty. This might lead to unexpected results.");
      // Depending on the desired behavior, one might return 0, throw an error, or continue.
      // For this problem, we'll continue, assuming the subsequent logic can handle empty arrays gracefully
      // (e.g., loops won't execute, sums remain zero).
  }

  // Step 1: Calculate counts of elements from the first set that are less than each element in the second set.
  // This replaces the 'possibles' variable from the original code.
  const comparisonCountsForSecondSet = secondNumericSet.map((currentSecondVal) => {
    let countOfSmallerFirstElements = 0;
    // Iterate through the first set to compare each element.
    for (const singleFirstVal of firstNumericSet) {
      if (singleFirstVal < currentSecondVal) {
        countOfSmallerFirstElements++;
      }
    }
    return countOfSmallerFirstElements;
  });

  // The original `console.log(possibles)` (intermediate output) has been removed.

  // Step 2: Perform the final cumulative calculation.
  // This replaces the 'result' variable from the original code.
  let overallCumulativeSum = 0;

  // Iterate over each element in the third numeric set.
  for (const currentThirdVal of thirdNumericSet) {
    let subtotalForCurrentThirdElement = 0; // Accumulator for the inner loop's sum.

    // Iterate through the second numeric set, needing both the value and its index.
    // Using a traditional for loop for explicit index access.
    for (let secondIdx = 0; secondIdx < secondNumericSet.length; secondIdx++) {
      const innerSecondVal = secondNumericSet[secondIdx];

      // Apply the conditional logic: if the inner second value is less than the current third value.
      if (innerSecondVal < currentThirdVal) {
        // Add the pre-calculated count from 'comparisonCountsForSecondSet' using the current index.
        // Added a defensive check for array bounds, although map usually ensures aligned lengths.
        if (secondIdx < comparisonCountsForSecondSet.length) {
            subtotalForCurrentThirdElement += comparisonCountsForSecondSet[secondIdx];
        } else {
            // This scenario indicates a potential data inconsistency or error in logic.
            console.warn(`Error: Index ${secondIdx} is out of bounds for comparisonCountsForSecondSet. Skipping addition.`);
        }
      }
    }
    // Add the accumulated subtotal for the current third element to the grand total.
    overallCumulativeSum += subtotalForCurrentThirdElement;
  }

  // The original `console.log(result)` has been removed.
  // Instead, the function now returns the final computed value, allowing the caller to decide on output.
  return overallCumulativeSum;
};

// This section is responsible for reading input from the standard input stream
// and invoking the primary processing function.
// It is designed to interact with typical competitive programming environments.
// Modifications to this part should generally be avoided unless specifically requested.
const standardInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const finalCalculatedOutput = processDataEntry(standardInputData);
// Output the computed result to the standard output.
console.log(finalCalculatedOutput);