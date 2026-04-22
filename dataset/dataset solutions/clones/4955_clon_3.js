/*
 * This module processes raw text data to identify specific numeric relationships.
 * It's designed to find pairs (u, v) within a sequence such that the element at index (u-1) is v,
 * and the element at index (v-1) is u. These are often called "symmetric" or "reciprocal" pairs.
 * The final output is half the count of such identified pairs, as each pair is counted twice.
 */
const performSymmetryAnalysis = (rawDataContent) => {
  // Ensure the input is a string and not null/undefined
  if (typeof rawDataContent !== 'string' || rawDataContent === null) {
    // For robustness, returning a default or throwing an error is better.
    // For this problem, we'll assume valid input structure but add a basic check.
    console.error("Invalid input provided; expected a string.");
    return 0;
  }

  // Split the entire input content into individual lines.
  const allContentLines = rawDataContent.split('\n');

  // We expect at least two lines: the first (index 0) is usually metadata,
  // and the second (index 1) contains the actual data sequence.
  if (allContentLines.length < 2) {
    console.error("Input lacks sufficient lines for processing the data sequence.");
    return 0; // No sequence to analyze
  }

  // Extract the line containing the space-separated numeric values.
  const dataSequenceLine = allContentLines[1];

  // A helper function to safely convert string to number.
  // This is a Type III addition: a new helper function.
  const convertToNumeric = (strValue) => {
    const num = Number(strValue);
    // Basic validation: ensure it's a valid number.
    if (Number.isNaN(num)) {
      console.warn(`Encountered non-numeric value: '${strValue}'. Skipping.`);
      return null; // Indicate failure to convert
    }
    return num;
  };

  // Process the data line: split by space and convert each part to a number.
  // Filter out any non-numeric results from the conversion.
  const mainNumericSequence = dataSequenceLine.split(' ')
                                              .map(convertToNumeric)
                                              .filter(val => val !== null);

  // If the resulting sequence is empty after filtering, there's nothing to process.
  if (mainNumericSequence.length === 0) {
    console.warn("No valid numeric elements found in the data sequence line.");
    return 0;
  }

  // Initialize a counter for the identified symmetric value pairs.
  let identifiedSymmetricPairs = 0;

  // Iterate over each element in the primary numeric sequence using its index.
  // The original problem uses 1-based indexing conceptualization for pairs (i+1, arr[i]).
  for (let currentPosition = 0; currentPosition < mainNumericSequence.length; ++currentPosition) {
    // Get the value at the current position in the sequence.
    const currentValue = mainNumericSequence[currentPosition];

    // Calculate the target index based on the current value.
    // This assumes `currentValue` is 1-indexed for the target.
    const potentialTargetIdx = currentValue - 1;

    // Calculate the expected value at the target index.
    // This is `currentPosition + 1` because `currentPosition` is 0-indexed.
    const expectedMatchValue = currentPosition + 1;

    // Add a guard clause: check if the potential target index is within the valid bounds
    // of the `mainNumericSequence` array. This prevents out-of-bounds errors.
    if (potentialTargetIdx >= 0 && potentialTargetIdx < mainNumericSequence.length) {
      // Access the element at the calculated target index.
      const valueAtTargetIdx = mainNumericSequence[potentialTargetIdx];

      // Check if the value at the target index matches the expected value.
      // This forms a symmetric pair: if A[i] = j and A[j-1] = i+1.
      if (valueAtTargetIdx === expectedMatchValue) {
        identifiedSymmetricPairs++; // Increment the counter for a found pair.
      }
    }
    // No 'else' needed here; if out of bounds or no match, we simply don't increment.
  }

  // The final result is half of the total count because each symmetric pair (u, v)
  // is counted twice: once when `currentPosition + 1` is `u` and `currentValue` is `v`,
  // and again when `currentPosition + 1` is `v` and `currentValue` is `u`.
  const finalResult = identifiedSymmetricPairs / 2;

  // Output the computed result.
  console.log(finalResult);

  // Explicitly return the result for potential further use or testing.
  return finalResult;
};

// Execution block:
// Reads input from standard input, trims whitespace, and passes it to the analysis function.
// This part is kept similar but with renamed function.
performSymmetryAnalysis(require("fs").readFileSync("/dev/stdin", "utf8").trim());