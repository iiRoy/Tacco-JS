'use strict';

/*
 * This module processes a specific set of numerical inputs
 * to compute a combinatorial result based on various block configurations.
 */
function ProcessData(rawInputData) {
  // Parse the initial configuration parameters from the input string.
  // The input is expected to be a space-separated string of numbers.
  const inputParts = rawInputData.split(' ');

  const totalItemsCount = Number(inputParts[0]); // Represents 'N' - total capacity or number of slots.
  const firstCategorySize = Number(inputParts[1]); // Represents 'red' - size of the first type of block.
  const secondCategorySize = Number(inputParts[2]); // Represents 'blue' - size of the second type of block.

  // Calculate the combined size of the two primary categories.
  const compositeCategorySize = firstCategorySize + secondCategorySize;

  const targetSumValue = Number(inputParts[3]); // Represents 'K' - the target sum to reach.

  // Determine the larger and smaller of the two primary block sizes.
  // 'largerComponentValue' will be used in subsequent calculations.
  const largerComponentValue = Math.max(firstCategorySize, secondCategorySize);
  const smallerComponentValue = Math.min(firstCategorySize, secondCategorySize); // This variable is not used but is renamed for completeness.

  let finalTally = 0; // Accumulator for the final computed pattern count.

  /**
   * Computes the number of ordered arrangements (permutations) of 'chosenCount' items
   * selected from a 'overallTotal' set of distinct items.
   *
   * @param {number} overallTotal - The total number of items available.
   * @param {number} chosenCount - The number of items to choose and arrange.
   * @returns {number} The permutation count.
   */
  function calculateOrderedArrangements(overallTotal, chosenCount) {
    let interimProduct = 1;
    // Loop 'chosenCount' times to multiply (n), (n-1), ..., (n-r+1)
    for (let loopIndex = 0; loopIndex < chosenCount; loopIndex++) {
      interimProduct = (interimProduct * (overallTotal - loopIndex));
    }
    return interimProduct;
  }

  /**
   * Computes the number of unordered selections (combinations) of 'chosenCount' items
   * selected from a 'overallTotal' set of distinct items.
   *
   * @param {number} overallTotal - The total number of items available.
   * @param {number} chosenCount - The number of items to choose.
   * @returns {number} The combination count.
   */
  function computeUnorderedSelections(overallTotal, chosenCount) {
    // Combination C(n, r) = P(n, r) / P(r, r)
    return calculateOrderedArrangements(overallTotal, chosenCount) / calculateOrderedArrangements(chosenCount, chosenCount);
  }


  // Calculate the maximum number of composite blocks that can fit into the target sum.
  const maxCompositeBlocks = Math.floor(targetSumValue / compositeCategorySize);

  // Outer loop: iterate through possible counts of composite blocks.
  // Starts from the maximum possible and goes down to zero.
  for (let compositeBlockIterator = maxCompositeBlocks; compositeBlockIterator >= 0; compositeBlockIterator--) {
    // Calculate the remaining value after allocating 'compositeBlockIterator' composite blocks.
    let remainingAfterComposite = targetSumValue - (compositeBlockIterator * compositeCategorySize);

    // Calculate the maximum number of larger component blocks that can fit into the remaining value.
    const maxLargerBlocksAllowed = Math.floor(remainingAfterComposite / largerComponentValue);

    // Inner loop: iterate through possible counts of larger component blocks.
    // Starts from the maximum possible for the current remaining value.
    for (let largerBlockIterator = maxLargerBlocksAllowed; largerBlockIterator >= 0; largerBlockIterator--) {
      // Calculate the final remainder after allocating both composite and larger blocks.
      let remainderAfterTwoBlocks = targetSumValue - (compositeBlockIterator * compositeCategorySize) - (largerBlockIterator * largerComponentValue);

      // Check if the total number of blocks (composite + larger + remainder) is within the total capacity.
      if (compositeBlockIterator + largerBlockIterator + remainderAfterTwoBlocks <= totalItemsCount) {
        // If within capacity, calculate the contribution to the total tally.
        // This involves two combination calculations:
        // 1. C(totalItemsCount, total_blocks_used)
        // 2. C(total_blocks_used, max_of_individual_block_counts)
        // The second combination is unusual, seems to be a specific problem requirement.
        finalTally = finalTally + (computeUnorderedSelections(totalItemsCount, compositeBlockIterator + largerBlockIterator + remainderAfterTwoBlocks) * computeUnorderedSelections(compositeBlockIterator + largerBlockIterator + remainderAfterTwoBlocks, Math.max(compositeBlockIterator, largerBlockIterator, remainderAfterTwoBlocks)));
      }
    }
  }

  // Output the final calculated pattern count.
  displayFinalOutcome(finalTally);
}

/**
 * Custom function to display the final calculated numerical result.
 * This wraps the standard console.log for consistent identifier renaming.
 * @param {number} outcomeValue - The number to be displayed.
 */
function displayFinalOutcome(outcomeValue) {
  console.log(outcomeValue);
}

/**
 * Fetches the input data from standard input.
 * This wraps the file system read operation for consistent identifier renaming.
 * @returns {string} The trimmed content read from /dev/stdin.
 */
function fetchSystemInput() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

// Execute the main data processing function with input from standard input.
ProcessData(fetchSystemInput());