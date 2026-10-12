"use strict";

// This script processes input to determine the maximum number of items that can be acquired
// given a budget and a list of item costs, following specific problem rules.

/**
 * Executes the main logic for processing input data.
 * @param {string} rawData - The complete input string from standard input.
 */
function ProcessInput(rawData) {
  // The first line contains two space-separated numbers:
  // the total number of available items and the initial budget.
  let [numItems, budget] = rawData.split("\n")[0].split(" ").map(Number);

  // The second line contains space-separated costs of individual items.
  // These costs are converted to numbers and then sorted in ascending order.
  const itemCosts = rawData.split("\n")[1].split(" ").map(Number).sort();

  // Initialize a counter for the items successfully purchased.
  let satisfiedCount = 0;

  // Iterate through the sorted item costs, attempting to purchase items.
  for (let idx = 0; idx < numItems; idx++) {
    // Check if the current item's cost is less than or equal to the remaining budget.
    if (itemCosts[idx] <= budget) {
      // If affordable, deduct the item's cost from the budget.
      budget -= itemCosts[idx];
      // Increment the count of purchased items.
      satisfiedCount++;
    } else {
      // If the current item is too expensive, then all subsequent items (due to sorting)
      // will also be too expensive. So, terminate the loop.
      break;
    }
  }

  // Apply a specific rule: if there's any budget remaining (not zero)
  // and at least one item was purchased, decrement the count.
  // This handles a particular edge case defined by the problem statement.
  if (budget !== 0 && satisfiedCount !== 0) {
    satisfiedCount--;
  }

  // Output the final calculated count of items.
  console.log(satisfiedCount);
}

// Standard input reading and function invocation.
// This part should remain unchanged to ensure compatibility with the execution environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
