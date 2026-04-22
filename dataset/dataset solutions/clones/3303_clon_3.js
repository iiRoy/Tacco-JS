/**
 * @fileoverview This script processes a list of items with associated weights and values,
 * aiming to find the maximum total value that can be obtained without exceeding a specified
 * weight capacity. It utilizes a sliding window (caterpillar) algorithm after sorting
 * items by their value in descending order.
 */

/**
 * Calculates the maximum achievable benefit given a set of items and a weight constraint.
 *
 * @param {string} rawInput The raw input string, typically from stdin, containing N, W,
 *                          and then N lines of item weight and value.
 * @returns {void} Prints the maximum total value to the console.
 */
function ProcessInputAndMaximizeBenefit(rawInput) {
  // Input validation: Ensure we have data to work with.
  if (!rawInput || rawInput.trim() === '') {
    console.log(0);
    return;
  }

  // Divide the input into individual lines for processing.
  const inputLines = rawInput.trim().split('\n');

  // Extract the first line which contains the total number of items and the weight limit.
  const firstLineTokens = inputLines[0].split(' ').map(Number);
  const totalItems = firstLineTokens[0]; // N: number of available items
  const weightConstraint = firstLineTokens[1]; // W: maximum allowed total weight

  // Edge case: If capacity is non-positive or no items, no benefit can be gained.
  if (weightConstraint <= 0 || totalItems <= 0) {
    console.log(0);
    return;
  }

  // Parse item details from the remaining lines.
  // Each item is represented as an object with 'weight' (w) and 'value' (v) properties.
  const availableItems = [];
  for (let itemIdx = 1; itemIdx <= totalItems; itemIdx++) {
    const itemTokens = inputLines[itemIdx].split(' ').map(Number);
    // Add a check for valid item data
    if (itemTokens.length === 2 && itemTokens[0] >= 0 && itemTokens[1] >= 0) {
      availableItems.push({
        w: itemTokens[0], // Item weight
        v: itemTokens[1], // Item value
      });
    }
  }

  // Optimize by sorting items.
  // The strategy is to prioritize items with higher values first.
  // This helps the sliding window converge to a good solution faster,
  // although for a general knapsack problem, this greedy sort isn't always optimal.
  // For this specific sliding window variant, it's crucial for the problem's interpretation.
  availableItems.sort((itemAlpha, itemBeta) => itemBeta.v - itemAlpha.v);

  let currentWindowWeight = 0; // Accumulated weight within the current window
  let currentWindowValue = 0; // Accumulated value within the current window
  let maximumAttainableValue = 0; // The highest value found so far

  // Initialize pointers for the sliding window.
  // `leftBoundary` marks the start of the window, `rightBoundary` marks the end.
  let leftBoundary = 0;

  // Iterate with the right boundary pointer, expanding the window.
  for (let rightBoundary = 0; rightBoundary < availableItems.length; rightBoundary++) {
    const currentItemToAdd = availableItems[rightBoundary];

    // Add the item at the right boundary to the current window.
    currentWindowWeight += currentItemToAdd.w;
    currentWindowValue += currentItemToAdd.v;

    // If the current window's weight exceeds the constraint,
    // shrink the window from the left until the constraint is met.
    // Ensure `leftBoundary` does not cross `rightBoundary`.
    while (currentWindowWeight > weightConstraint && leftBoundary <= rightBoundary) {
      const itemToRemove = availableItems[leftBoundary];
      currentWindowWeight -= itemToRemove.w;
      currentWindowValue -= itemToRemove.v;
      leftBoundary++; // Move the left boundary to the right
    }

    // After adjusting the window (or if it never exceeded the capacity),
    // update the maximum attainable value found so far.
    // Only consider valid windows (those within the weight limit).
    // An empty window (e.g., all items too heavy) would have 0 value.
    if (currentWindowWeight <= weightConstraint) {
      maximumAttainableValue = Math.max(maximumAttainableValue, currentWindowValue);
    }
  }

  // Output the final maximum value.
  console.log(maximumAttainableValue);
}

// Entry point for execution, reading from standard input.
ProcessInputAndMaximizeBenefit(require('fs').readFileSync('/dev/stdin', 'utf8'));