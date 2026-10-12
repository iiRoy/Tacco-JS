'use strict';

function ProcessInput(rawData) {
  // Parse the initial parameters from the raw input string
  const dataParts = rawData.split(" ");
  const totalItems = Number(dataParts[0]);
  const firstColorCount = Number(dataParts[1]);
  const secondColorCount = Number(dataParts[2]);

  // Calculate the sum of the two primary color counts
  const combinedColorCount = firstColorCount + secondColorCount;

  const targetSum = Number(dataParts[3]);

  // Determine the larger and smaller of the two primary color counts
  const largerComponent = Math.max(firstColorCount, secondColorCount);
  const smallerComponent = Math.min(firstColorCount, secondColorCount);

  // Initialize a counter for valid combinations
  let totalCombinations = 0;

  /**
   * Computes the number of permutations P(n, r).
   * @param {number} totalElements - The total number of items.
   * @param {number} selectElements - The number of items to choose.
   * @returns {number} The permutation count.
   */
  function calculatePermutations(totalElements, selectElements) {
    let resultValue = 1;
    for (let loopIndex = 0; loopIndex < selectElements; loopIndex++) {
      resultValue = resultValue * (totalElements - loopIndex);
    }
    return resultValue;
  }

  /**
   * Computes the number of combinations C(n, r).
   * @param {number} totalElements - The total number of items.
   * @param {number} selectElements - The number of items to choose.
   * @returns {number} The combination count.
   */
  function calculateCombinations(totalElements, selectElements) {
    // Use the property C(n, r) = C(n, n-r) to optimize calculations
    let adjustedSelect = Math.min(selectElements, totalElements - selectElements);
    return calculatePermutations(totalElements, adjustedSelect) / calculatePermutations(adjustedSelect, adjustedSelect);
  }

  // Determine the maximum possible count for the combined color component
  const maxCombinedColor = Math.floor(targetSum / combinedColorCount);

  // Iterate through possible counts of the combined color component
  for (let combinedColorIter = maxCombinedColor; combinedColorIter >= 0; combinedColorIter--) {
    let remainingAfterCombined = targetSum - (combinedColorIter * combinedColorCount);

    // Determine the maximum possible count for the larger individual component
    const maxLargerComponent = Math.floor(remainingAfterCombined / largerComponent);

    // Iterate through possible counts of the larger individual component
    for (let largerComponentIter = maxLargerComponent; largerComponentIter >= 0; largerComponentIter--) {
      let remainingAfterBoth = targetSum - (combinedColorIter * combinedColorCount) - (largerComponentIter * largerComponent);

      // Check if the sum of all components is within the total allowed items
      if (combinedColorIter + largerComponentIter + remainingAfterBoth <= totalItems) {
        // Add the product of two combination calculations to the total
        totalCombinations = totalCombinations + (
          calculateCombinations(totalItems, combinedColorIter + largerComponentIter + remainingAfterBoth) *
          calculateCombinations(combinedColorIter + largerComponentIter + remainingAfterBoth, Math.max(combinedColorIter, largerComponentIter, remainingAfterBoth))
        );
      }
    }
  }

  // Output the final calculated total combinations
  console.log(totalCombinations);
}

// Read input from standard input, trim whitespace, and pass to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
