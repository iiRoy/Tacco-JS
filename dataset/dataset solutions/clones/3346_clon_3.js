'use strict';
(function(rawInputBlob){
  // --- Section 1: Initial Input Parsing and Global Constants Setup ---

  // Standard input is read as a single string. We first trim any leading/trailing whitespace
  // and then split it into an array of individual lines.
  // Using /\r?\n/ handles both Unix-style (\n) and Windows-style (\r\n) line endings.
  const processedInputLines = rawInputBlob.trim().split(/\r?\n/);

  // The very first line of input specifies the number of participants, let's call it 'maleCount'.
  // We use parseInt with radix 10 for explicit conversion to an integer.
  const maleCount = parseInt(processedInputLines.shift(), 10);

  // Calculate the maximum possible bitmask value, which represents a complete set of 'maleCount' items.
  // This is 2 raised to the power of 'maleCount'.
  const fullSubsetMaskValue = Math.pow(2, maleCount);

  // Define a large prime number to use as a modulus for all arithmetic operations.
  // This helps prevent integer overflow in intermediate calculations and keeps results within a specific range.
  const MODULO_CONST = 1000000007; // This is (10^9 + 7)

  // The remaining lines of input represent a compatibility matrix.
  // Each line is parsed into an array of numbers, forming a 2D array.
  // `compatibilityMatrix[i][j]` will be 1 if male `i` is compatible with female `j`, 0 otherwise.
  const compatibilityMatrix = processedInputLines.map(lineText =>
    lineText.split(/\s+/).map(numericString => parseInt(numericString, 10))
  );

  // --- Section 2: Pre-calculating Bitmask Groupings by Population Count ---

  // We need a way to efficiently iterate through bitmasks that have a specific number of set bits (population count).
  // This array, `masksBySetBitCount`, will store Maps.
  // `masksBySetBitCount[k]` will be a Map containing all bitmasks that have `k+1` set bits.
  const masksBySetBitCount = Array.from({length: maleCount}, () => new Map());

  /**
   * Helper function to count the number of set bits (1s) in a given integer.
   * Uses Brian Kernighan's algorithm, which is efficient.
   * @param {number} value The integer to count set bits for.
   * @returns {number} The count of set bits.
   */
  const calculateSetBits = (value) => {
    let count = 0;
    let tempValue = value;
    while (tempValue > 0) {
      tempValue &= (tempValue - 1); // This operation clears the least significant set bit.
      count++;
    }
    return count;
  };

  // Populate the `masksBySetBitCount` structure.
  // Iterate through all possible bitmasks from 1 up to `fullSubsetMaskValue - 1`.
  for (let currentMaskCandidate = 1; currentMaskCandidate < fullSubsetMaskValue; ++currentMaskCandidate) {
    const bitPopulation = calculateSetBits(currentMaskCandidate);
    // Store the mask in the Map corresponding to its population count.
    // The index in `masksBySetBitCount` is `(population - 1)` because population counts start from 1.
    masksBySetBitCount[bitPopulation - 1].set(currentMaskCandidate, currentMaskCandidate);
  }

  // --- Section 3: Dynamic Programming Table Initialization ---

  // `dpTable` will store the results of subproblems.
  // `dpTable[mIdx]` will be a Map where keys are female subset masks
  // and values are the number of ways to pair males up to `mIdx` with that specific female subset.
  const dpTable = Array.from({length: maleCount}, () => new Map());

  // Define the base case or initial state for the DP.
  // Conceptually, before any males are considered (male index -1), there's 1 way
  // to have any given female subset available (as a starting point for pairing).
  const baseCaseState = new Map();
  for (let maskValue = 0; maskValue < fullSubsetMaskValue; ++maskValue) {
    baseCaseState.set(maskValue, 1);
  }

  /**
   * Safely retrieves the number of ways from a previous DP state.
   * Handles the special base case (male index -1).
   * @param {number} prevMaleIdx The index of the previous male participant.
   * @param {number} subsetIdentifier The bitmask representing the female subset.
   * @returns {number} The number of ways, or 0 if the state is not found.
   */
  const retrievePreviousWays = (prevMaleIdx, subsetIdentifier) => {
      if (prevMaleIdx === -1) {
          return baseCaseState.get(subsetIdentifier) || 0; // Use the dedicated base case Map.
      }
      // For regular DP states, retrieve from the `dpTable`.
      return dpTable[prevMaleIdx].get(subsetIdentifier) || 0;
  };

  // --- Section 4: Core Dynamic Programming Calculation Loop ---

  // Iterate through each male participant, from the first (index 0) to the last (`maleCount - 1`).
  for (let currentMaleIndex = 0; currentMaleIndex < maleCount; ++currentMaleIndex) {
    // For the current male, we are interested in female subsets that have `(currentMaleIndex + 1)` members.
    // This ensures that we are always considering subsets that match the number of males processed so far.
    const relevantFemaleSubsets = masksBySetBitCount[currentMaleIndex];

    // Iterate through each such relevant female subset mask.
    // The `_` is a placeholder for the value, as we only need the key (the mask itself).
    for (const [currentFemaleSubset, _] of relevantFemaleSubsets.entries()) {
      let currentCombinationsCount = 0; // Initialize ways for this (male, subset) state.

      // Now, for the `currentMaleIndex` and `currentFemaleSubset`, try to pair `currentMaleIndex`
      // with each possible female candidate.
      for (let femaleCandidateIndex = 0; femaleCandidateIndex < maleCount; ++femaleCandidateIndex) {
        // Condition 1: Check if the current male is compatible with this female candidate.
        if (compatibilityMatrix[currentMaleIndex][femaleCandidateIndex] === 0) {
          continue; // If not compatible, this pairing is not possible.
        }

        // Condition 2: Check if this female candidate is actually part of the `currentFemaleSubset`.
        // We create a bitmask for the specific female candidate (e.g., 1 << femaleCandidateIndex).
        // Then, we use a bitwise AND to see if that bit is set in `currentFemaleSubset`.
        const candidateBit = 1 << femaleCandidateIndex;
        if ((currentFemaleSubset & candidateBit) === 0) {
          continue; // If the female is not in the current subset, she cannot be paired.
        }

        // If both conditions are met (compatible and available), then this pairing is valid.
        // We need to look up the number of ways from the previous DP state:
        // - For the previous male (`currentMaleIndex - 1`).
        // - With the female subset that had `femaleCandidateIndex` removed (XOR operation).
        const subsetAfterRemoval = currentFemaleSubset ^ candidateBit;
        
        // Add the ways from the previous state to our current combinations count.
        currentCombinationsCount = (currentCombinationsCount + retrievePreviousWays(currentMaleIndex - 1, subsetAfterRemoval)) % MODULO_CONST;
      }
      // Store the computed number of ways for the current male and female subset in the DP table.
      dpTable[currentMaleIndex].set(currentFemaleSubset, currentCombinationsCount);
    }
  }

  // --- Section 5: Final Result Output ---

  // The final answer is the total number of ways to pair all `maleCount` males with all `maleCount` females.
  // This corresponds to the state for the last male (`maleCount - 1`) and the full subset of females (`fullSubsetMaskValue - 1`).
  // The `|| 0` ensures that if no valid pairings were found for this state (e.g., due to incompatibilities),
  // the output defaults to 0 instead of `undefined`.
  const finalSolution = dpTable[maleCount - 1].get(fullSubsetMaskValue - 1) || 0;

  // Print the final result to the console.
  console.log(finalSolution);

// The entire logic is encapsulated in an immediately invoked function expression (IIFE).
// It's called with the content of the standard input stream, read synchronously as UTF-8 text.
})(require('fs').readFileSync('/dev/stdin','utf8'));