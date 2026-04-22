'use strict';

/**
 * Orchestrates the processing of raw input data to compute a specific product sum.
 * This function handles input parsing, data aggregation, and combinatorial calculation.
 * @param {string} rawInputString - The entire input as a single string, typically from stdin.
 * @returns {void} Outputs the final calculated sum to the console.
 */
function processInputData(rawInputString) {

  // --- Input Validation and Initial Parsing (Type III: Added guard clauses, intermediate steps) ---
  if (!rawInputString || typeof rawInputString !== 'string' || rawInputString.trim() === '') {
    // For competitive programming, usually assumes valid input, but this is a Type III change
    // to add robustness. Outputs 0 for no valid input.
    console.log(0);
    return;
  }

  // Split the input string into individual lines.
  const allInputLines = rawInputString.split('\n');

  // The first line typically contains the total number of entries.
  // Type III: The original code parsed this 'n' but never used it. Here, we parse it
  // and use it for a non-critical validation/warning, demonstrating a change in usage.
  const expectedEntryCount = Number(allInputLines[0]);
  if (isNaN(expectedEntryCount) || expectedEntryCount < 0) {
      // This is a soft warning; processing continues with actual data.
      // Adding such diagnostic messages is a Type III modification.
  }

  // Extract the list of names, excluding the first (count) and potentially empty last lines.
  // Type III: Changed slice bounds and added a filter for robustness against empty lines.
  const candidateNameList = allInputLines.slice(1).filter(line => line.trim() !== '');

  // Type III: Add a guard clause for an empty list of names after filtering.
  if (candidateNameList.length === 0) {
    console.log(0); // No names to process, result is 0.
    return;
  }

  // Type III: Add a validation/warning if the actual count doesn't match the expected count.
  if (expectedEntryCount > 0 && candidateNameList.length !== expectedEntryCount) {
      // This demonstrates adding a validation step.
      console.warn(`Warning: Expected ${expectedEntryCount} names but found ${candidateNameList.length}. Proceeding with found names.`);
  }


  // --- Character Frequency Counting (Type II: Data structure change, Type III: Helper variable) ---
  // Define the set of target initial characters.
  const designatedPrefixCharacters = ['M', 'A', 'R', 'C', 'H']; // Type III: Added as a helper constant.

  // Using a Map for dynamic counting of character frequencies.
  // This is a Type II data structure change from a fixed array with implicit indices.
  const prefixFrequencyMap = new Map(designatedPrefixCharacters.map(char => [char, 0]));

  for (const currentEntryName of candidateNameList) {
    // Type II: Renamed 'name' to 'currentEntryName'.
    // Type III: Added a check for empty string if it wasn't filtered before (though filter handles most).
    if (currentEntryName.length === 0) continue;

    const initialCharacter = currentEntryName.charAt(0);
    if (prefixFrequencyMap.has(initialCharacter)) {
      // Increment the count for the matching prefix character.
      prefixFrequencyMap.set(initialCharacter, prefixFrequencyMap.get(initialCharacter) + 1);
    }
  }

  // Extract only the numerical counts from the map into a simple array.
  // This makes the subsequent combination logic more straightforward, mimicking the original's `has` array structure.
  const relevantCountsForCombinations = Array.from(prefixFrequencyMap.values());


  // --- Combinatorial Product Sum Calculation (Type II: Renaming, Type III: Rewritten recursion) ---
  let overallProductSumResult = 0; // Type II: Renamed 'ans' to 'overallProductSumResult'.
  const targetCombinationSize = 3; // Type III: Added helper variable for clarity.

  /**
   * Recursively calculates the sum of products of all combinations of `targetCombinationSize` elements.
   * This is a "pick K from N" problem where K=3.
   * Instead of storing actual values in `currentSelectionIndices`, we store their indices.
   * This is a Type III rewrite of the recursive combination function.
   * @param {number} currentIdx - The current index in `relevantCountsForCombinations` to consider.
   * @param {number[]} currentSelectionIndices - An array holding the indices of selected counts for the current path.
   * @returns {void}
   */
  const computeProductCombinations = (currentIdx, currentSelectionIndices) => {
    // Base case 1: If we have selected exactly `targetCombinationSize` items.
    if (currentSelectionIndices.length === targetCombinationSize) {
      // Type III: Explicit multiplication loop instead of array.reduce for minor style change.
      let currentProduct = 1;
      for (const selectedIndex of currentSelectionIndices) {
          currentProduct *= relevantCountsForCombinations[selectedIndex];
      }
      overallProductSumResult += currentProduct;
      return;
    }

    // Base case 2: If we've exhausted all available counts but haven't selected enough items.
    if (currentIdx >= relevantCountsForCombinations.length) {
      return;
    }

    // Recursive step 1: Include the count at `currentIdx` in the current selection.
    // Type II: Renamed parameters. Type III: Changed logic to pass indices.
    computeProductCombinations(currentIdx + 1, [...currentSelectionIndices, currentIdx]);

    // Recursive step 2: Exclude the count at `currentIdx` from the current selection.
    computeProductCombinations(currentIdx + 1, currentSelectionIndices);
  };

  // Initiate the recursive combination process, starting from the first count (index 0)
  // with an empty selection.
  computeProductCombinations(0, []);

  // --- Output Result ---
  console.log(overallProductSumResult);
}

// --- Input Reading and Execution (Type II: Renamed function call, Type III: Added error handling) ---
try {
    // Type III: Explicitly require 'fs' module for clarity, even though it's common.
    const fileSystemModule = require("fs");
    const inputFilePath = "/dev/stdin";
    // Read the entire file content synchronously.
    const fileContent = fileSystemModule.readFileSync(inputFilePath, "utf8");
    // Pass the content to the main processing function.
    processInputData(fileContent); // Type II: Renamed function call.
} catch (errorReadingFile) {
    // Type III: Added a robust error handling block for file reading.
    console.error(`An error occurred while attempting to read input from ${"/dev/stdin"}: ${errorReadingFile.message}`);
    // Output 0 as a default value in case of input error, preventing program crash.
    console.log(0);
}