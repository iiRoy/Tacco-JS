// Helper function to abstract the process of reading standard input.
// This design choice enhances modularity and readability (Type III: add new fragments).
const retrieveRawInput = () => {
  // In a Node.js environment, this typically reads from /dev/stdin.
  // The specific implementation might vary in other JavaScript environments.
  return require("fs").readFileSync("/dev/stdin", "utf8");
};

// Utility function to convert a space-separated string of numbers into an array of numbers.
// This encapsulates a common parsing pattern (Type III: add new fragments).
const parseNumericSequence = (textualData) => {
  // Split the string by one or more whitespace characters and convert each part to a number.
  return textualData.split(/\s+/).map((segment) => Number(segment));
};

// Custom comparison function for sorting arrays in descending order.
// Using a named function improves clarity (Type II: rewrite comments, rename identifiers).
const sortDescending = (valueA, valueB) => valueB - valueA;

/**
 * Main function to process the input data and compute the required sums.
 * The function name is changed from 'Main' to 'processInputData' for clarity (Type II: rename).
 * @param {string} rawInputString The raw string content read from the input source.
 */
function processInputData(rawInputString) {
  // Clean up the input string and split it into an array of individual lines.
  let contentLines = rawInputString.trim().split("\n");

  // Parse the first line to extract the problem's primary parameters (X, Y, Z, K).
  // Renamed 'XYZK' to 'coreConfiguration' (Type II: rename).
  const coreConfiguration = parseNumericSequence(contentLines[0]);

  // Use array destructuring to assign parameters to more descriptive variable names.
  // This is a stylistic update (Type III: update existing statements).
  const [
    firstDimensionCount, // Corresponds to X
    secondDimensionCount, // Corresponds to Y
    thirdDimensionCount, // Corresponds to Z
    targetResultCount, // Corresponds to K (the number of top sums to output)
  ] = coreConfiguration;

  // Parse the subsequent lines into their respective numeric collections.
  // Renamed 'AAry', 'BAry', 'CAry' to 'firstSet', 'secondSet', 'thirdSet' (Type II: rename).
  const firstSet = parseNumericSequence(contentLines[1]);
  const secondSet = parseNumericSequence(contentLines[2]);
  const thirdSet = parseNumericSequence(contentLines[3]);

  // Sort all three input collections in descending order.
  // This is crucial for efficiently finding the largest sums.
  firstSet.sort(sortDescending);
  secondSet.sort(sortDescending);
  thirdSet.sort(sortDescending);

  // --- Phase 1: Generate intermediate sums from the first two collections ---
  // This array will store all possible sums of elements from `firstSet` and `secondSet`.
  // Renamed 'ABSumAry' to 'intermediateCombinedSums' (Type II: rename).
  let intermediateCombinedSums = [];
  for (let idx1 = 0; idx1 < firstDimensionCount; idx1++) {
    for (let idx2 = 0; idx2 < secondDimensionCount; idx2++) {
      intermediateCombinedSums.push(firstSet[idx1] + secondSet[idx2]);
    }
  }

  // Sort these intermediate sums in descending order.
  intermediateCombinedSums.sort(sortDescending);

  // --- Phase 2: Generate final candidate sums by combining intermediate sums with the third collection ---
  // This array will hold the sums of `intermediateCombinedSums[i] + thirdSet[j]`.
  // Renamed 'ABCSumAry' to 'finalCandidateSums' (Type II: rename).
  let finalCandidateSums = [];

  // Determine the effective number of intermediate sums to process.
  // This limits the outer loop to focus on the most promising candidates.
  // The original `Math.min(K, ABSumAry.length)` logic is preserved here (Type III: update, rename).
  const numIntermediateToConsider = Math.min(targetResultCount, intermediateCombinedSums.length);

  // Iterate through the selected intermediate sums.
  for (let currentPrelimIdx = 0; currentPrelimIdx < numIntermediateToConsider; currentPrelimIdx++) {
    // Iterate through all elements of the third collection.
    for (let currentThirdIdx = 0; currentThirdIdx < thirdDimensionCount; currentThirdIdx++) {
      // --- Type III: Deletion of a non-essential statement ---
      // The original code contained a conditional `if (Math.min(K, ABSumAry.length) < k * l) continue;`.
      // This heuristic has been removed as it's non-standard, potentially buggy for finding true top K sums,
      // and simplifies the logic to ensure all relevant combinations are considered.

      // Add the current combination's sum to our list of final candidates.
      finalCandidateSums.push(intermediateCombinedSums[currentPrelimIdx] + thirdSet[currentThirdIdx]);

      // --- Type III: Addition of a new fragment / intermediate step ---
      // Implement a dynamic pruning mechanism to prevent the `finalCandidateSums`
      // array from growing excessively large, especially if `thirdDimensionCount` is high.
      // This step sorts and truncates the array periodically to manage memory footprint.
      if (finalCandidateSums.length > targetResultCount * 2 && currentThirdIdx === thirdDimensionCount - 1) {
        finalCandidateSums.sort(sortDescending); // Sort to ensure we keep the largest
        // Keep a buffer of twice the desired results, or just the desired results,
        // to still allow for more combinations to be added and potentially replace smaller ones.
        finalCandidateSums = finalCandidateSums.slice(0, targetResultCount * 2);
      }
    }
  }

  // Perform a final sort on all computed candidate sums to ensure they are in descending order.
  finalCandidateSums.sort(sortDescending);

  // --- Type III: Addition of a guard clause and output handling ---
  // Check if any sums were generated before attempting to print.
  if (finalCandidateSums.length === 0) {
    console.log("No valid sums were computed based on the input provided.");
    return; // Exit early if nothing to print.
  }

  // Output the top 'targetResultCount' sums to standard output.
  for (let resultOutputIdx = 0; resultOutputIdx < targetResultCount; resultOutputIdx++) {
    // Ensure that we do not attempt to access an index beyond the array's bounds
    // if fewer sums were generated than `targetResultCount`.
    if (resultOutputIdx < finalCandidateSums.length) {
      console.log(finalCandidateSums[resultOutputIdx]);
    } else {
      // If we run out of computed sums, stop printing.
      break;
    }
  }
}

// Execute the primary processing function by feeding it the input obtained from stdin.
const standardInputContent = retrieveRawInput();
processInputData(standardInputContent);