"use strict"; // Enforce strict mode for cleaner code practices

// Primary function to handle and process the incoming raw data
const dataProcessor = (dataInput) => {
  // Pre-process the input string: trim leading/trailing whitespace, then split into an array of lines
  const dataLines = dataInput.trim().split("\n");

  // Extract the first number, representing the total count of items to consider
  const elementCount = parseInt(dataLines[0], 10);
  // Parse the second line, splitting it by spaces, and converting each part into an integer
  const numericalSequence = dataLines[1].split(" ").map(elementStr => parseInt(elementStr, 10));

  /**
   * Recursively determines the maximum sum achievable by selecting elements.
   * This function explores different permutations of target indices.
   * @param {number} currentSourceIdx - The index of the current element being processed from `numericalSequence`.
   * @param {Array<number>} availableTargets - A collection of indices that can still be chosen as targets.
   * @returns {number} The highest possible sum for the current state.
   */
  function calculateOptimalSum(currentSourceIdx, availableTargets) {
    // Base condition: If we've processed all source indices, the sum accumulated is zero
    if (currentSourceIdx === -1) {
      return 0;
    }

    // Array to store the potential sums resulting from each target choice at this level
    const intermediateSums = [];
    // Iterate through each available target index to explore all possibilities
    for (const chosenTargetIdx of availableTargets) {
      // Create a new array of targets, excluding the one just chosen
      const reducedTargetSet = availableTargets.filter(valToFilter => valToFilter !== chosenTargetIdx);

      // Compute the absolute positional difference between the current source and the chosen target
      const absoluteDifference = (currentSourceIdx > chosenTargetIdx)
        ? (currentSourceIdx - chosenTargetIdx)
        : (chosenTargetIdx - currentSourceIdx);

      // Calculate the value for this specific path:
      // (value of current source element * absolute difference) + recursive call for the next source element and reduced targets
      const pathContribution = numericalSequence[currentSourceIdx] * absoluteDifference + calculateOptimalSum(currentSourceIdx - 1, reducedTargetSet);
      intermediateSums.push(pathContribution);
    }

    // Return the maximum sum found among all branches explored from this `currentSourceIdx`
    return Math.max(...intermediateSums);
  }

  // Initiate the primary calculation starting from the last element of the sequence
  // and providing all indices from 0 to `elementCount - 1` as initial available targets.
  console.log(calculateOptimalSum(elementCount - 1, [...Array(elementCount).keys()]));
};

// Read the entire content from standard input synchronously, decode as UTF-8, and pass to the data processor
dataProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));