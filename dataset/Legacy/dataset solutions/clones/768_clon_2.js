// This script processes input to determine the highest possible sum of two distinct item costs
// that remains within a specified financial constraint.

// Acquire the raw textual input from the standard input stream.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: remove any leading/trailing whitespace and then divide it into an array of lines.
const dataRows = rawData.trim().split('\n');

// Extract and parse the first line to obtain the total count of items and the maximum allowable budget.
const [itemCount, budgetLimit] = dataRows[0].split(' ').map(Number);

// Extract and parse the second line to get an array of individual item costs.
const itemCosts = dataRows[1].split(' ').map(Number);

// Initialize a variable to keep track of the largest valid sum of two item costs found so far.
let bestCombinationSum = 0; // Using 'let' for block-scoped variable declaration.

// Begin iterating through each item to select the first component of a pair.
for (let firstIndex = 0; firstIndex < itemCount; firstIndex++) {
  // Nested loop to select the second component of the pair, ensuring it's a different item.
  for (let secondIndex = 0; secondIndex < itemCount; secondIndex++) {
    // Check three conditions:
    // 1. The two selected items must not be the same (distinct indices).
    // 2. The sum of their costs must not exceed the predefined budget limit.
    // 3. The current sum of costs must be greater than any previously recorded 'bestCombinationSum'.
    if (firstIndex !== secondIndex && budgetLimit >= itemCosts[firstIndex] + itemCosts[secondIndex] && bestCombinationSum < itemCosts[firstIndex] + itemCosts[secondIndex]) {
      // If all conditions are met, update 'bestCombinationSum' with this new, higher valid sum.
      bestCombinationSum = itemCosts[firstIndex] + itemCosts[secondIndex];
    }
  }
}

// Output the final result: if a valid combination sum was found (i.e., it's not 0), print that sum.
// Otherwise, if no valid combination was found, print "NONE".
bestCombinationSum
  ? console.log(bestCombinationSum)
  : console.log("NONE");
