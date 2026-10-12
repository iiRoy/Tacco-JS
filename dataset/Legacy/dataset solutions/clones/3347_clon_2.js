'use strict';
(function(rawData){
  // Process the raw input: trim whitespace and split into an array of lines.
  rawData = rawData.trim().split(/\n/);

  // The first line contains the number of men (and women, as it's a square matrix).
  const numMen = Number(rawData.shift());

  // Calculate the total number of possible subsets for women (2^numMen).
  const totalCombinations = Math.pow(2, numMen);

  // Define the modulo constant for calculations to prevent integer overflow.
  const moduloConstant = Math.pow(10, 9) + 7;

  // Parse the remaining input lines into a 2D array representing the compatibility matrix.
  // Each element indicates if man `i` is compatible with woman `j`.
  rawData = rawData.map(lineStr => lineStr.split(/\s+/).map(val => Number(val)));

  // Assign the parsed data to a more descriptive variable name.
  const compatibilityMatrix = rawData;

  // Initialize an array of objects to map bitmasks to themselves, grouped by their bit count.
  // `indexMap[k]` will contain masks with `k+1` bits set.
  const indexMap = new Array(numMen).fill(null).map(_ => new Object());

  // Populate the indexMap.
  // For each possible subset mask (from 1 to totalCombinations - 1),
  // count the number of set bits and store the mask in the corresponding group.
  for (let currentMask = 1; currentMask < totalCombinations; currentMask++) {
    let tempMask = currentMask;
    let bitCount = 0;
    // Count set bits in the current mask.
    while (tempMask > 0) {
      bitCount += (tempMask % 2);
      tempMask = Math.floor(tempMask / 2); // Equivalent to integer division by 2.
    }
    // Store the mask in the object at `bitCount - 1` index (0-indexed).
    indexMap[bitCount - 1][currentMask] = currentMask;
  }

  // Initialize the dynamic programming table.
  // `dynamicProgrammingTable[manIndex][womanSubsetMask]` will store the number of ways
  // to match men from 0 up to `manIndex` with the women specified by `womanSubsetMask`.
  const dynamicProgrammingTable = new Array(numMen).fill(null).map((_, idx) => new Object());

  // Base case for the DP table:
  // `dynamicProgrammingTable[-1]` represents the state before any men are considered.
  // For any subset of women, there's 1 way (the "empty" matching) if no men are matched yet.
  dynamicProgrammingTable[-1] = new Array(totalCombinations).fill(1);

  /*
    The DP approach iterates through men from 0 to `numMen - 1`.
    `dynamicProgrammingTable[manIndex][currentSubset]` stores the count of valid matchings
    for men `0` through `manIndex` with the women represented by `currentSubset`.
    The `currentSubset` must have exactly `manIndex + 1` bits set.
  */

  // Iterate through each man, from the first (index 0) to the last (`numMen - 1`).
  for (let manIndex = 0; manIndex < numMen; manIndex++) {
    // For the current `manIndex`, we consider subsets of women that have `manIndex + 1` bits set.
    // These subsets are pre-indexed in `indexMap[manIndex]`.
    for (let currentSubsetKey in indexMap[manIndex]) {
      // Convert the string key from the object to a number for bitwise operations.
      const currentSubset = Number(currentSubsetKey);

      // Initialize the DP entry for the current state if it hasn't been accessed.
      if (dynamicProgrammingTable[manIndex][currentSubset] === undefined) {
        dynamicProgrammingTable[manIndex][currentSubset] = 0;
      }

      // Iterate through each possible woman (from 0 to `numMen - 1`).
      for (let womanIndex = 0; womanIndex < numMen; womanIndex++) {
        // Check if the current man and woman are compatible.
        if (compatibilityMatrix[manIndex][womanIndex] === 0) {
          continue; // If not compatible, this pairing is not allowed.
        }

        // Check if the current woman is part of the `currentSubset`.
        // This is true if the `womanIndex`-th bit is set in `currentSubset`.
        if (!((currentSubset >>> womanIndex) & 1)) {
          continue; // If the woman is not in the subset, she cannot be matched.
        }

        // If compatible and the woman is in the subset, we can potentially match them.
        // The number of ways for the current state is accumulated from the previous state:
        // `dynamicProgrammingTable[manIndex - 1]` with the `womanIndex`-th bit removed from `currentSubset`.
        const previousWays = dynamicProgrammingTable[manIndex - 1][currentSubset ^ (1 << womanIndex)] || 0;
        dynamicProgrammingTable[manIndex][currentSubset] = (dynamicProgrammingTable[manIndex][currentSubset] + previousWays) % moduloConstant;
      }
    }
  }

  // The final answer is the number of ways to match all `numMen` men with all `numMen` women.
  // This corresponds to `dynamicProgrammingTable[numMen - 1]` (last man) and `totalCombinations - 1` (all women).
  console.log(dynamicProgrammingTable[numMen - 1][totalCombinations - 1] || 0);
})(require('fs').readFileSync('/dev/stdin','utf8'));
