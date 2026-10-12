'use strict';

// This function processes the input data to calculate a specific pattern count.
function ProcessInput(rawData) {
  // Parse the input string into numerical components.
  const totalItems = Number(rawData.split(" ")[0]);
  const firstColorCount = Number(rawData.split(" ")[1]);
  const secondColorCount = Number(rawData.split(" ")[2]);
  const combinedColorCount = firstColorCount + secondColorCount;
  const targetSum = Number(rawData.split(" ")[3]);

  // Determine the larger and smaller counts between the two primary colors.
  const largerCount = Math.max(firstColorCount, secondColorCount);
  const smallerCount = Math.min(firstColorCount, secondColorCount); // This variable is declared but not used in the original logic.

  let totalArrangements = 0; // Initialize the counter for valid arrangements.

  /**
   * Computes the number of permutations P(n, r).
   * @param {number} totalElements - The total number of items (n).
   * @param {number} elementsToChoose - The number of items to choose (r).
   * @returns {number} The permutation value.
   */
  function calculatePermutations(totalElements, elementsToChoose) {
    let resultValue = 1; // Start with 1 for multiplication.
    for (let loopIndex = 0; loopIndex < elementsToChoose; loopIndex++) {
      resultValue = (resultValue * (totalElements - loopIndex));
    }
    return resultValue;
  }

  /**
   * Computes the number of combinations C(n, r).
   * This uses the permutation function.
   * @param {number} totalElements - The total number of items (n).
   * @param {number} elementsToChoose - The number of items to choose (r).
   * @returns {number} The combination value.
   */
  function calculateCombinations(totalElements, elementsToChoose) {
    // C(n, r) = P(n, r) / P(r, r)
    return calculatePermutations(totalElements, elementsToChoose) / calculatePermutations(elementsToChoose, elementsToChoose);
  }

  // Calculate the maximum number of 'combinedColorCount' groups that can fit into 'targetSum'.
  const maxCombinedColorGroups = Math.floor(targetSum / combinedColorCount);

  // Iterate through possible counts of the combined color groups.
  for (let groupIndex = maxCombinedColorGroups; groupIndex >= 0; groupIndex--) {
    // Calculate the remaining sum after accounting for the combined color groups.
    let remainingAfterCombined = targetSum - (groupIndex * combinedColorCount);

    // Determine the maximum number of 'largerCount' groups that can fit into the remaining sum.
    let maxLargerColorGroups = Math.floor(remainingAfterCombined / largerCount);

    // Iterate through possible counts of the larger color groups.
    for (let largerGroupIndex = maxLargerColorGroups; largerGroupIndex >= 0; largerGroupIndex--) {
      // Calculate the sum remaining after accounting for combined and larger color groups.
      let remainingAfterLarger = targetSum - (groupIndex * combinedColorCount) - (largerGroupIndex * largerCount);

      // Check if the total number of items used (groupIndex + largerGroupIndex + remainingAfterLarger)
      // does not exceed the overall totalItems (N).
      if (groupIndex + largerGroupIndex + remainingAfterLarger <= totalItems) {
        // If valid, add the calculated combinations to the total arrangements.
        totalArrangements = totalArrangements + (
          calculateCombinations(totalItems, groupIndex + largerGroupIndex + remainingAfterLarger) *
          calculateCombinations(groupIndex + largerGroupIndex + remainingAfterLarger, Math.max(groupIndex, largerGroupIndex, remainingAfterLarger))
        );
      }
    }
  }

  // Output the final calculated total arrangements.
  console.log(totalArrangements);
}

// Read input from standard input, trim whitespace, and pass to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
