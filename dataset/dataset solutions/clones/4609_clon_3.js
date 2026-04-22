let rawInputBuffer = ''; // Accumulates all incoming standard input data.

// Sets the encoding for the standard input stream to ensure proper character handling.
process.stdin.setEncoding('utf8');

// Event handler for 'data' chunks received from standard input.
// Each chunk is appended to our rawInputBuffer.
process.stdin.on('data', (dataChunk) => {
  rawInputBuffer += dataChunk; // Concatenate new data.
});

// Event handler for 'end' of standard input stream.
// Once all data has been received, this callback is executed to process it.
process.stdin.on('end', () => {
  // Splits the raw buffer into an array of strings, one for each line.
  // Each line is then trimmed of leading/trailing whitespace.
  let formattedInputRows = rawInputBuffer.split('\n').map((singleRow) => singleRow.trim());

  // A common scenario is for input to end with a newline, resulting in an empty string
  // at the end of the `formattedInputRows` array. This check removes such an empty entry.
  if (formattedInputRows.length > 0 && formattedInputRows[formattedInputRows.length - 1] === '') {
    formattedInputRows.pop(); // Discard the trailing empty line.
  }

  // Initiates the core logic to compute the solution for the problem.
  processKnapsackSolution(formattedInputRows);
});


/**
 * Orchestrates the calculation for a knapsack-type problem using provided input lines.
 * This function parses initial parameters and then invokes a recursive solver.
 *
 * @param {string[]} allInputLines - An array of strings, where each string represents an input line.
 */
function processKnapsackSolution(allInputLines) {
  // Input validation: A fundamental check to ensure there's data to process.
  if (!allInputLines || allInputLines.length === 0) {
    console.error("Critical Error: Input data stream was empty or malformed.");
    return; // Terminate if no valid input is present.
  }

  // The first line typically contains global parameters (e.g., item count and capacity).
  // These are parsed into numbers. Using `Number` is a concise way for numeric conversion.
  const initialConfiguration = allInputLines[0].split(' ').map(Number);

  // Further validation for the critical parameters from the first line.
  if (initialConfiguration.length < 2 || isNaN(initialConfiguration[0]) || isNaN(initialConfiguration[1])) {
    console.error("Critical Error: Insufficient or invalid numeric parameters in the first input line.");
    return;
  }

  const totalDistinctItems = initialConfiguration[0]; // Corresponds to 'N' in original.
  const maximumAllowedWeight = initialConfiguration[1]; // Corresponds to 'W' in original.

  // This variable will store the highest value achievable, updated by the recursive function.
  let optimalAchievedValue = 0; // Corresponds to 'V' in original.

  // The subsequent lines describe the items (e.g., weight and value).
  // `slice(1)` skips the configuration line, and each item line is parsed.
  const itemSpecificationsList = allInputLines.slice(1).map((itemDataLine) =>
    itemDataLine.split(' ').map(Number)
  );

  // A warning if the number of item detail lines doesn't match the declared total items.
  if (itemSpecificationsList.length < totalDistinctItems) {
    console.warn(`Data Mismatch: Expected ${totalDistinctItems} items, but only found ${itemSpecificationsList.length}. Processing with available items.`);
  }

  /**
   * Recursive depth-first search function to explore combinations of items.
   * This function aims to maximize the accumulated value without exceeding the weight limit.
   *
   * @param {number} currentItemIdentifier - The zero-based index of the item currently under consideration.
   * @param {number} currentTotalLoad - The sum of weights of items chosen for the current path.
   * @param {number} currentTotalWorth - The sum of values of items chosen for the current path.
   */
  function exploreItemSelections(currentItemIdentifier, currentTotalLoad, currentTotalWorth) {
    // Base Case 1: All potential items have been considered.
    // At this point, `currentTotalWorth` represents a valid sum for a chosen subset of items.
    if (currentItemIdentifier >= totalDistinctItems) {
      // Update the global optimum if this path yielded a higher value.
      optimalAchievedValue = Math.max(optimalAchievedValue, currentTotalWorth);
      return; // End this recursive branch.
    }

    // Base Case 2 (Pruning): If the current accumulated weight already exceeds the maximum capacity,
    // this path is invalid and should be abandoned to save computation.
    if (currentTotalLoad > maximumAllowedWeight) {
      return; // Prune this branch, as it's over capacity.
    }

    // Retrieve the weight and value for the item currently being evaluated.
    const itemProperties = itemSpecificationsList[currentItemIdentifier];

    // Validation for item data integrity. If corrupted, skip this item and proceed.
    if (!itemProperties || itemProperties.length < 2 || isNaN(itemProperties[0]) || isNaN(itemProperties[1])) {
      console.warn(`Skipping malformed item data at index ${currentItemIdentifier}.`);
      exploreItemSelections(currentItemIdentifier + 1, currentTotalLoad, currentTotalWorth);
      return;
    }

    const itemWeight = itemProperties[0];
    const itemValue = itemProperties[1];

    // Decision Branch 1: Explore the scenario where the current item is NOT included.
    // Move to the next item without altering current total weight or value.
    exploreItemSelections(currentItemIdentifier + 1, currentTotalLoad, currentTotalWorth);

    // Decision Branch 2: Explore the scenario where the current item IS included.
    // This is only possible if adding its weight does not exceed the maximum allowed.
    if (currentTotalLoad + itemWeight <= maximumAllowedWeight) {
      // If the item can be added, recursively call with updated totals and move to the next item.
      exploreItemSelections(
        currentItemIdentifier + 1,
        currentTotalLoad + itemWeight,
        currentTotalWorth + itemValue
      );
    }
  }

  // Initial call to start the recursive exploration.
  // Begins with the first item (index 0), zero accumulated weight, and zero accumulated value.
  exploreItemSelections(0, 0, 0);

  // After the recursion completes, `optimalAchievedValue` will hold the final, highest value.
  console.log(optimalAchievedValue);
}