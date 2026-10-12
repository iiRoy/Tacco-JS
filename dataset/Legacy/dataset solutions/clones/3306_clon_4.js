const MAX_ITEM_WEIGHT_LIMIT = 1000; // Original MAX_VALUE, interpreted as max individual item weight for DP array sizing

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInputData.trim().split('\n');
const firstLineParts = inputLines[0].split(' ').map(Number);
const itemCount = firstLineParts[0]; // N from original
const maxAllowedValue = firstLineParts[1]; // W from original
const itemDetails = inputLines.slice(1).map(r => r.split(' ').map(Number)); // list from original

function calculateMaxWeight() {
  // The maximum possible total weight is itemCount * MAX_ITEM_WEIGHT_LIMIT.
  // This is derived from the original code's dp array dimension N * MAX_VALUE.
  const maxPossibleTotalWeight = itemCount * MAX_ITEM_WEIGHT_LIMIT;

  // minValForWeight[k] stores the minimum total value required to achieve a total weight of k.
  // Initialize with Infinity, except for minValForWeight[0] = 0 (0 value for 0 weight).
  const minValForWeight = Array(maxPossibleTotalWeight + 1).fill(Infinity);
  minValForWeight[0] = 0;

  // Iterate through each item to update the DP table
  for (const currentItem of itemDetails) {
    const itemValue = currentItem[0];
    const itemWeight = currentItem[1];

    // Iterate backwards through possible total weights.
    // This ensures that each item is considered only once for the current DP state,
    // effectively simulating the 2D DP table's row-by-row update with a 1D array.
    for (let currentWeight = maxPossibleTotalWeight; currentWeight >= itemWeight; currentWeight--) {
      // Check if the state (currentWeight - itemWeight) was reachable.
      // If minValForWeight[currentWeight - itemWeight] is Infinity, it means that
      // weight could not be achieved, so adding the current item won't make it reachable either.
      if (minValForWeight[currentWeight - itemWeight] !== Infinity) {
        // Option 1: Don't include the current item. The value remains minValForWeight[currentWeight].
        // Option 2: Include the current item. The value would be
        //           minValForWeight[currentWeight - itemWeight] (value for the remaining weight) + itemValue.
        // We take the minimum of these two options to find the minimum value for currentWeight.
        minValForWeight[currentWeight] = Math.min(
          minValForWeight[currentWeight],
          minValForWeight[currentWeight - itemWeight] + itemValue
        );
      }
    }
  }

  // After processing all items, find the maximum total weight 'k'
  // such that the minimum value required to achieve 'k' (minValForWeight[k])
  // is less than or equal to the specified maxAllowedValue.
  let finalMaxWeight = 0;
  for (let k = maxPossibleTotalWeight; k >= 0; k--) {
    if (minValForWeight[k] <= maxAllowedValue) {
      finalMaxWeight = k;
      break; // Found the largest k that satisfies the condition, so we can stop.
    }
  }

  return finalMaxWeight;
}

console.log(calculateMaxWeight());
