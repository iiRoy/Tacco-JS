'use strict';
(function(rawData){
  rawData = rawData.trim().split(/\n/);
  const personCount = rawData.shift() - 0;
  const maskLimit = Math.pow(2, personCount);
  const moduloConstant = Math.pow(10, 9) + 7;
  const compatibilityGrid = rawData.map(line => line.split(/\s+/).map(val => val - 0));

  // Memoization table for storing results of subproblems
  // memoizationCache[manIndex][availableWomenMask] stores the number of ways
  // to match men from manIndex to personCount-1 with women in availableWomenMask.
  const memoizationCache = new Array(personCount).fill(null).map(() => new Array(maskLimit).fill(undefined));

  /**
   * Recursively calculates the number of ways to form perfect matchings.
   * @param {number} currentManIndex The 0-indexed man currently being considered for matching.
   * @param {number} availableWomenMask A bitmask representing the women who are still available.
   * @returns {number} The number of ways to match the remaining men with the available women.
   */
  const calculateMatchings = (currentManIndex, availableWomenMask) => {
    // Base case: All men have been considered.
    // If all women were also used (mask is 0), then it's a valid perfect matching.
    if (currentManIndex === personCount) {
      return (availableWomenMask === 0) ? 1 : 0;
    }

    // Check if the result for this state is already memoized
    if (memoizationCache[currentManIndex][availableWomenMask] !== undefined) {
      return memoizationCache[currentManIndex][availableWomenMask];
    }

    let currentWays = 0;
    // Iterate through all possible women to match with the current man
    for (let candidateWomanIndex = 0; candidateWomanIndex < personCount; candidateWomanIndex++) {
      // Check if the current man can be matched with this woman
      // AND if this woman is available in the current mask
      if (compatibilityGrid[currentManIndex][candidateWomanIndex] === 1 &&
          (availableWomenMask & (1 << candidateWomanIndex))) {

        // If a match is possible, recursively find ways for the next man
        // with this woman removed from the available women mask.
        currentWays = (currentWays + calculateMatchings(
          currentManIndex + 1,
          availableWomenMask ^ (1 << candidateWomanIndex) // XOR to remove the matched woman from the mask
        )) % moduloConstant;
      }
    }

    // Store the computed result in the memoization cache before returning
    return (memoizationCache[currentManIndex][availableWomenMask] = currentWays);
  };

  // Start the recursive calculation from the first man (index 0)
  // with all women initially available (mask with all bits set: (1 << personCount) - 1)
  const finalResult = calculateMatchings(0, (1 << personCount) - 1);

  console.log(finalResult);
})(require('fs').readFileSync('/dev/stdin','utf8'));
