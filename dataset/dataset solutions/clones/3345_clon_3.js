'use strict';
(function(rawDataInput){
  // Helper function for parsing integers from strings
  const parseInteger = (str) => parseInt(str, 10);

  // Step 1: Process raw input data
  const inputLines = rawDataInput.trim().split('\n');
  const numMen = parseInteger(inputLines.shift()); // N
  const totalCombinations = Math.pow(2, numMen); // M
  const modulusValue = Math.pow(10, 9) + 7; // K

  // Helper function to parse the compatibility matrix
  const extractCompatibilityMatrix = (linesArray, count) => {
    const matrix = [];
    for (let i = 0; i < count; i++) {
      matrix.push(linesArray[i].split(/\s+/).map(parseInteger));
    }
    return matrix;
  };

  const compatibilityMatrix = extractCompatibilityMatrix(inputLines, numMen);

  // Helper function to count the number of set bits (population count) in an integer
  const countSetBits = (value) => {
    let bitCount = 0;
    let tempValue = value;
    while (tempValue > 0) {
      bitCount += (tempValue & 1); // Check the least significant bit
      tempValue >>= 1;             // Right shift to check the next bit
    }
    return bitCount;
  };

  // Precompute and group all possible subset masks by their population count.
  // `masksByPopulationCount[p]` will be an array containing all masks with `p+1` bits set.
  const masksByPopulationCount = new Array(numMen).fill(null).map(() => []);
  for (let currentMask = 1; currentMask < totalCombinations; currentMask++) {
    const population = countSetBits(currentMask);
    // Store the mask in the array corresponding to its population count minus one
    // (since population counts start from 1, and array indices from 0).
    if (population > 0 && population <= numMen) {
      masksByPopulationCount[population - 1].push(currentMask);
    }
  }

  // Initialize the dynamic programming table.
  // `dpTable[manIdx]` will be an object mapping a subset mask to the number of ways.
  const dpTable = new Array(numMen);
  for (let idx = 0; idx < numMen; idx++) {
    dpTable[idx] = {}; // Use plain objects for hash map behavior
  }

  // Define the base case for the DP. This corresponds to `dp[-1]` in the original logic.
  // When no men have been considered yet, there's 1 way for any subset of women (empty set for 0 men).
  const baseCaseDP = new Array(totalCombinations).fill(1);

  /*
    The DP state `dpTable[manIndex][subsetMask]` represents the number of ways
    to match the first `manIndex + 1` men (from 0 to `manIndex`) with the `manIndex + 1`
    women represented by the `subsetMask`.
  */

  // Iterate through each man, from the first (index 0) to the last (index numMen - 1).
  for (let manIndex = 0; manIndex < numMen; manIndex++) {
    // Iterate through each woman, from the first (index 0) to the last (index numMen - 1).
    for (let womanIndex = 0; womanIndex < numMen; womanIndex++) {
      // Check if the current man and woman are compatible.
      if (compatibilityMatrix[manIndex][womanIndex] === 1) {
        // Retrieve all subset masks that have `manIndex + 1` bits set.
        // These masks represent the combinations of women that could be matched with the first `manIndex + 1` men.
        const relevantSubsetMasks = masksByPopulationCount[manIndex];

        // Iterate over these relevant subset masks.
        for (const currentSubsetMask of relevantSubsetMasks) {
          const womanBit = (1 << womanIndex);

          // Guard clause: If the current woman is NOT part of the `currentSubsetMask`, skip.
          // This ensures we are only considering subsets where the `womanIndex`-th woman is included.
          if ((currentSubsetMask & womanBit) === 0) {
            continue;
          }

          // Calculate the mask for the previous DP state: `currentSubsetMask` without the `womanIndex`-th woman.
          const previousSubsetMask = currentSubsetMask ^ womanBit;

          // Retrieve the value from the previous DP level.
          // If `manIndex` is 0, use the `baseCaseDP`. Otherwise, use `dpTable[manIndex - 1]`.
          const valueFromPreviousState = (manIndex === 0)
            ? baseCaseDP[previousSubsetMask]
            : (dpTable[manIndex - 1][previousSubsetMask] || 0);

          // If the previous state had no valid ways, then this path also has no valid ways.
          if (valueFromPreviousState === 0) {
            continue;
          }

          // Ensure the current DP entry is initialized to 0 if it doesn't exist.
          dpTable[manIndex][currentSubsetMask] = (dpTable[manIndex][currentSubsetMask] || 0);

          // Add the value from the previous state to the current state.
          dpTable[manIndex][currentSubsetMask] += valueFromPreviousState;

          // Apply the modulo operation to keep the result within bounds.
          dpTable[manIndex][currentSubsetMask] %= modulusValue;
        }
      }
    }
  }

  // The final result is the number of ways to match all `numMen` men with all `numMen` women.
  // This corresponds to `dpTable[numMen - 1]` with a mask representing all `numMen` women (`totalCombinations - 1`).
  const finalAnswer = dpTable[numMen - 1][totalCombinations - 1] || 0;
  console.log(finalAnswer);

})(require('fs').readFileSync('/dev/stdin','utf8'));
