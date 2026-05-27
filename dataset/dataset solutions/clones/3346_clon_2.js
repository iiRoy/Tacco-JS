'use strict';

(function(sourceData) {
  // Trim leading/trailing whitespace and split the input string into an array of lines.
  sourceData = sourceData.trim().split(/\n/);

  // Extract the first line, convert it to a number, and store it as the count of people.
  const numPeople = sourceData.shift() - 0;

  // Calculate the total number of possible subsets/states (2^numPeople).
  const maxState = Math.pow(2, numPeople);

  // Define a large prime number to use as a modulus for arithmetic operations.
  const moduloVal = Math.pow(10, 9) + 7;

  // Process the remaining lines: split each line by whitespace and convert elements to numbers.
  sourceData = sourceData.map(lineStr => lineStr.split(/\s+/).map(val => val - 0));

  // Assign the processed input data to a more descriptive constant.
  const affinityScores = sourceData;

  // Initialize an array of objects. Each object will store bitmasks grouped by their population count (number of set bits).
  // masksByBitCount[k] will hold masks that have (k+1) bits set.
  const masksByBitCount = Array(numPeople).fill(0).map(_ => ({}));

  // Iterate through all possible bitmasks from 1 up to (maxState - 1).
  for (let personIdx = 1; personIdx < maxState; personIdx++) {
    let tempState = personIdx; // Temporary variable to count set bits without altering the original mask.
    let setBitsCount = 0;      // Counter for the number of set bits in the current mask.

    // Count the number of '1' bits in the binary representation of tempState.
    while (tempState > 0) {
      setBitsCount += (tempState % 2); // Add 1 if the last bit is set.
      tempState = (tempState - (tempState % 2)) / 2; // Right shift by 1 (integer division).
    }
    // Store the current mask (personIdx) in the object corresponding to its set bit count.
    // The index is (setBitsCount - 1) because bit counts range from 1 to numPeople.
    masksByBitCount[setBitsCount - 1][personIdx] = personIdx;
  }

  // Initialize the dynamic programming table.
  // memoizationTable[i][j] will store the number of ways to match the first (i+1) men
  // with the women represented by the bitmask 'j'.
  const memoizationTable = Array(numPeople).fill(0).map((_, idx) => ({}));

  // Set up the base case for the DP table.
  // memoizationTable[-1] represents the state before considering any men.
  // There is 1 way to form any mask (by not matching any men yet).
  memoizationTable[-1] = Array(maxState).fill(1);

  /*
    The dynamic programming approach proceeds by considering men one by one, from index 0 to numPeople-1.
    memoizationTable[personIdx][currentMaskState] stores the total count of valid matchings
    for the first 'personIdx + 1' men with the specific set of women indicated by 'currentMaskState'.
    'currentMaskState' is a bitmask where the k-th bit is set if woman 'k' is included in the matching.
  */

  // Iterate through each man, starting from the first (index 0).
  for (let personIdx = 0; personIdx < numPeople; personIdx++) {
    // Iterate through all bitmasks that have exactly (personIdx + 1) bits set.
    // These masks represent valid subsets of women for the current stage of matching.
    for (let currentMaskState in masksByBitCount[personIdx]) {
      // Initialize the current DP state to 0 if it hasn't been computed yet.
      if (memoizationTable[personIdx][currentMaskState] === undefined) {
        memoizationTable[personIdx][currentMaskState] = 0;
      }

      // For the current man (personIdx), try to match him with each possible woman.
      for (let womanIdx = 0; womanIdx < numPeople; womanIdx++) {
        // Check if the current man and woman are compatible (affinity score is not 0).
        if (affinityScores[personIdx][womanIdx] === 0) {
          continue; // If not compatible, skip this pairing.
        }
        // Check if the current woman (womanIdx) is part of the 'currentMaskState'.
        // This ensures we only consider women available in the current subset.
        if ((currentMaskState & (1 << womanIdx)) === 0) {
          continue; // If the woman is not in the mask, skip.
        }

        // Add the number of ways from the previous DP state.
        // The previous state is for 'personIdx - 1' men, and the mask is
        // 'currentMaskState' with 'womanIdx' removed (XOR operation).
        memoizationTable[personIdx][currentMaskState] += (memoizationTable[personIdx - 1][currentMaskState ^ (1 << womanIdx)] || 0);
      }
      // Apply the modulus to the accumulated count to keep it within the desired range.
      memoizationTable[personIdx][currentMaskState] %= moduloVal;
    }
  }

  // Output the final result: the number of ways to match all men (numPeople-1)
  // with all women (represented by the mask 'maxState-1', which has all bits set).
  // If the result is undefined (no ways found), default to 0.
  console.log(memoizationTable[numPeople - 1][maxState - 1] || 0);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
