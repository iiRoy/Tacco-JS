'use strict';
(function(sourceData){
  /**
   * Helper function to compute the population count (number of set bits)
   * for a given integer value.
   * @param {number} value The integer whose set bits are to be counted.
   * @returns {number} The count of set bits.
   */
  const getSetBitCount = (value) => {
    let bitCounter = 0;
    let temporaryValue = value;
    // Loop until all bits have been checked
    while (temporaryValue > 0) {
      // If the least significant bit is 1, increment the counter
      if ((temporaryValue & 1) === 1) {
        bitCounter++;
      }
      // Right shift to examine the next bit
      temporaryValue >>= 1;
    }
    return bitCounter;
  };

  // --- Input Data Processing ---
  // Trim whitespace and split the input string into an array of lines.
  // Supports both Windows (\r\n) and Unix (\n) line endings.
  let rawInputLines = sourceData.trim().split(/\r?\n/);

  // Extract the number of men/women (N) from the first line.
  // Use parseInt with radix 10 for explicit conversion.
  const numberOfPairs = parseInt(rawInputLines.shift(), 10);
  
  // Implement a basic guard clause for invalid input for N.
  if (isNaN(numberOfPairs) || numberOfPairs <= 0) {
      console.log(0); // If N is invalid, no matches are possible.
      return;
  }
  
  // Calculate essential constants.
  // totalPossibleMasks represents 2^N, the total number of subsets for N items.
  const totalPossibleMasks = 1 << numberOfPairs; // Efficient way to calculate 2^N
  // MODULO_PRIME is a large prime number used for modular arithmetic to prevent overflow.
  const MODULO_PRIME = 1000000007;

  // Parse the compatibility matrix from the remaining input lines.
  // Each line is split by whitespace, and each part is converted to an integer.
  // `canMatchMatrix[i][j] === 1` means man `i` can match woman `j`.
  const canMatchMatrix = rawInputLines.map(line =>
    line.split(/\s+/).map(strVal => parseInt(strVal, 10))
  );
  
  // --- Pre-computation: Grouping Bitmasks by Population Count ---
  // This structure, `subsetsByCount`, stores bitmasks categorized by their
  // number of set bits (population count).
  // `subsetsByCount[k]` will contain an object where keys are bitmasks that
  // have `k+1` bits set. This helps in efficiently iterating masks
  // that represent a specific number of women.
  const subsetsByCount = new Array(numberOfPairs).fill(null).map(() => ({}));

  // Iterate through all possible bitmasks from 1 up to (2^N - 1).
  for (let currentMaskValue = 1; currentMaskValue < totalPossibleMasks; currentMaskValue++) {
    const populationCount = getSetBitCount(currentMaskValue);
    // Store the mask in the appropriate group.
    // Index `populationCount - 1` corresponds to masks with `populationCount` bits.
    subsetsByCount[populationCount - 1][currentMaskValue] = currentMaskValue;
  }

  // --- Dynamic Programming Table Initialization ---
  // `matchingWaysTable[manIndex][womenMask]` stores the number of distinct ways
  // to match men from index 0 up to `manIndex` with the specific subset of women
  // represented by `womenMask`.
  // `manIndex` is 0-indexed (0 to `numberOfPairs - 1`).
  // `womenMask` must contain `manIndex + 1` set bits.
  const matchingWaysTable = new Array(numberOfPairs).fill(null).map(() => ({}));

  // Define the base case for the DP calculation.
  // This represents the state *before* any men have been considered.
  // In this "pre-man" state, there's 1 way to match an empty set of men
  // with an empty set of women (represented by mask 0).
  const initialZeroManState = { 0: 1 };

  // --- Main Dynamic Programming Calculation Loop ---
  // Iterate through each man, from the first man (index 0) to the last (index `numberOfPairs - 1`).
  for (let currentManIndex = 0; currentManIndex < numberOfPairs; currentManIndex++) {
    // Determine which previous DP state to reference.
    // For the first man (currentManIndex === 0), use `initialZeroManState`.
    // For subsequent men, use the results from the previous man's calculations.
    const previousManMatchingState = (currentManIndex === 0)
      ? initialZeroManState
      : matchingWaysTable[currentManIndex - 1];

    // Retrieve all women subsets that have `currentManIndex + 1` members.
    // These are the target masks for the current man's DP calculations.
    const eligibleWomenSubsets = subsetsByCount[currentManIndex];

    // Iterate through each eligible women subset mask.
    // Object keys are strings, so convert back to number.
    for (const currentWomenMaskString in eligibleWomenSubsets) {
      const currentWomenMask = parseInt(currentWomenMaskString, 10);

      // Initialize the entry for the current DP state if it hasn't been accessed yet.
      if (matchingWaysTable[currentManIndex][currentWomenMask] === undefined) {
          matchingWaysTable[currentManIndex][currentWomenMask] = 0;
      }

      // Now, try to match the `currentManIndex` with each possible woman.
      for (let womanCandidateIndex = 0; womanCandidateIndex < numberOfPairs; womanCandidateIndex++) {
        // Check if `currentManIndex` can actually be matched with `womanCandidateIndex`.
        if (canMatchMatrix[currentManIndex][womanCandidateIndex] === 1) {
          // Check if `womanCandidateIndex` is part of the `currentWomenMask`.
          // This ensures we only consider women who are in the current subset.
          const isWomanInCurrentSubset = (currentWomenMask & (1 << womanCandidateIndex)) !== 0;

          if (isWomanInCurrentSubset) {
            // If man `currentManIndex` is matched with `womanCandidateIndex`,
            // then the previous `currentManIndex` men must have been matched
            // with the `currentWomenMask` *excluding* `womanCandidateIndex`.
            const maskForPreviousManState = currentWomenMask ^ (1 << womanCandidateIndex);

            // Fetch the number of ways from the previous DP state.
            // If the entry doesn't exist (e.g., no ways for that previous state), treat as 0.
            const waysFromEarlierState = previousManMatchingState[maskForPreviousManState] || 0;

            // Add these ways to the current DP state, applying the modulo constant.
            matchingWaysTable[currentManIndex][currentWomenMask] =
              (matchingWaysTable[currentManIndex][currentWomenMask] + waysFromEarlierState) % MODULO_PRIME;
          }
        }
      }
    }
  }

  // --- Final Result ---
  // The ultimate answer is the number of ways to match all `numberOfPairs` men
  // with all `numberOfPairs` women.
  // This corresponds to the last man (`numberOfPairs - 1`) and the mask where
  // all `numberOfPairs` bits are set (`totalPossibleMasks - 1`).
  const finalMatchingCount = matchingWaysTable[numberOfPairs - 1][totalPossibleMasks - 1] || 0;
  console.log(finalMatchingCount);

})(require('fs').readFileSync('/dev/stdin','utf8'));