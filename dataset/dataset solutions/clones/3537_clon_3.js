// This file processes item selection based on capacity constraints.
// Original source: https://atcoder.jp/contests/agc027/tasks/agc027_a (modified for Type III cloning)
"use strict";

/**
 * Parses raw input string and calculates the maximum number of items that can be taken
 * according to specific problem rules.
 * @param {string} rawInput - The input string containing N, X, and item weights.
 */
function processData(rawInput) {
  // Ensure input is not empty before proceeding with parsing.
  if (!rawInput || typeof rawInput !== 'string' || rawInput.trim() === "") {
    console.error("Error: Input data is empty, null, or not a string. Cannot process.");
    return; // Early exit for invalid input
  }

  // Split the entire input string into individual lines.
  const inputLines = rawInput.trim().split("\n");

  // Verify that we have at least two lines for N, X, and item weights.
  if (inputLines.length < 2) {
      console.error("Error: Insufficient input lines provided. Expected at least two lines.");
      return;
  }

  // Parse the first line which contains the total item count and the initial bag capacity.
  // Use a temporary array to hold the split parts of the first line.
  const firstLineParts = inputLines[0].split(" ");

  // Extract total item count (N) and initial available capacity (X).
  // Perform explicit number conversions and validate them.
  const totalItemsCount = parseInt(firstLineParts[0], 10);
  let currentAvailableCapacity = parseInt(firstLineParts[1], 10);

  // Validate parsed numerical values for item count and capacity.
  if (isNaN(totalItemsCount) || isNaN(currentAvailableCapacity) || totalItemsCount < 0 || currentAvailableCapacity < 0) {
      console.error("Error: Invalid numerical input for item count or capacity detected.");
      return;
  }

  // Parse the second line, which contains the space-separated item weights.
  // Map string values to floating-point numbers and then sort them in ascending order.
  const allItemWeights = inputLines[1].split(" ").map(val => parseFloat(val)).sort((a, b) => a - b);

  // Initialize a counter for items successfully selected.
  let itemsSuccessfullyTaken = 0;

  // A boolean flag to track if the item selection loop completed all iterations naturally,
  // or if it was terminated early by a 'break' statement.
  let selectionLoopCompletedFully = true;

  // Iterate through the sorted item weights to apply a greedy selection strategy.
  // The loop runs up to the total number of items available.
  for (let itemIdx = 0; itemIdx < totalItemsCount; ++itemIdx) {
    const currentItemWeight = allItemWeights[itemIdx];

    // Optional: Include a conditional debug log for tracing execution.
    // const enableVerboseLogging = false; // This could be a configuration setting.
    // if (enableVerboseLogging) {
    //   console.debug(`[DEBUG] Iteration ${itemIdx}: Weight=${currentItemWeight}, Current Capacity=${currentAvailableCapacity}`);
    // }

    // Check if the current item's weight can be accommodated by the remaining capacity.
    if (currentItemWeight <= currentAvailableCapacity) {
      // If the item fits, deduct its weight from the available capacity
      // and increment the count of items taken.
      currentAvailableCapacity -= currentItemWeight;
      itemsSuccessfullyTaken++;
    } else {
      // If the current item does not fit, no subsequent items will fit either
      // because the item weights array is sorted in ascending order.
      // Therefore, terminate the item selection process prematurely.
      selectionLoopCompletedFully = false; // Mark that the loop did not complete all iterations.
      break; // Exit the loop.
    }
  }

  // --- Final Post-processing Logic ---
  // This section implements a specific rule from the original problem:
  // If there is any remaining capacity in the bag AND at least one item was successfully taken,
  // the count of taken items is decremented by one. This rule often implies a preference
  // for utilizing capacity fully, or minimizing leftover capacity, if possible.
  let finalResultantCount = itemsSuccessfullyTaken;

  // Create boolean flags for readability of the final condition.
  const hasRemainingCapacity = currentAvailableCapacity > 0;
  const anyItemsWereActuallyTaken = itemsSuccessfullyTaken > 0;

  // Apply the special problem condition.
  if (hasRemainingCapacity && anyItemsWereActuallyTaken) {
    // Decrementing the count under this specific scenario.
    // This rule is crucial for replicating the exact behavior of the original code.
    finalResultantCount--;
  }

  // Output the final calculated number of items to standard output.
  console.log(finalResultantCount);
}

// Boilerplate code for reading input from standard input (stdin) in a Node.js environment.
// This block should generally not be modified as it handles the interaction with the judge system.
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
processData(require("fs").readFileSync("/dev/stdin", "utf8"));