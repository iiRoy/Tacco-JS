function processInput(rawData) {
  // Split the raw input string into individual lines.
  const dataRows = rawData.split('\n');

  // Extract N (number of items) and W (maximum weight capacity) from the first line.
  const configParams = dataRows.shift().split(' ').map(valStr => parseInt(valStr, 10));
  const itemCount = configParams[0]; // N
  const maxWeight = configParams[1]; // W

  // Parse the remaining lines into an array of item details (weight, value).
  const itemDetails = dataRows.map(rowStr => rowStr.split(' ').map(valStr => parseInt(valStr, 10)));

  // Process the very first item separately to initialize the DP array.
  const initialItem = itemDetails.shift();
  const initialWeight = initialItem[0];
  const initialValue = initialItem[1];

  let totalValueAccumulator = initialValue; // Keeps track of the maximum possible value encountered so far.

  // Initialize the dynamic programming array.
  // minWeightForValue[v] will store the minimum weight required to achieve a total value of 'v'.
  let minWeightForValue = [];
  minWeightForValue[0] = 0; // 0 weight for 0 value.

  // For values up to the initial item's value, the minimum weight is its weight.
  for (let k = 1; k <= totalValueAccumulator; k++) {
    minWeightForValue[k] = initialWeight;
  }

  // Iterate through the rest of the items to update the DP array.
  for (let k = 0; k < itemDetails.length; k++) {
    const currentItemWeight = itemDetails[k][0];
    const currentItemValue = itemDetails[k][1];

    // Update the maximum possible value accumulator.
    totalValueAccumulator += currentItemValue;

    // Iterate downwards through possible target values.
    // This ensures that for each item, we use its properties only once per DP state update.
    for (let targetValue = totalValueAccumulator; targetValue > 0; targetValue--) {

      // Check if the current item's value can contribute to the target value.
      if (targetValue >= currentItemValue) {
        // Calculate the weight needed for the remaining value (targetValue - currentItemValue).
        const previousValueWeight = minWeightForValue[targetValue - currentItemValue];

        // If a path to targetValue - currentItemValue exists (i.e., previousValueWeight is defined).
        if (previousValueWeight !== undefined) {
          // If minWeightForValue[targetValue] is currently undefined, set it.
          // Otherwise, update it with the minimum of the current value and the new path.
          if (minWeightForValue[targetValue] === undefined) {
            minWeightForValue[targetValue] = currentItemWeight + previousValueWeight;
          } else {
            minWeightForValue[targetValue] = Math.min(previousValueWeight + currentItemWeight, minWeightForValue[targetValue]);
          }
        }
        // If previousValueWeight is undefined, it means targetValue - currentItemValue is not achievable,
        // so this path (using current item) is not valid for targetValue.
        // We don't update minWeightForValue[targetValue] in this case,
        // it will either remain undefined or keep its existing value from other paths.

      } else {
        // If the current item's value is greater than the target value,
        // this item cannot contribute to reaching the target value directly.
        // However, if minWeightForValue[targetValue] is undefined, and the current item
        // is the only way to achieve targetValue (which is not the case here as we iterate downwards),
        // this block would handle it. In this specific DP, this 'else' branch is mostly
        // for cases where targetValue is less than currentItemValue, and we are considering
        // if the current item *alone* can form targetValue, which it cannot.
        // The logic here seems to be a fallback for when targetValue is small and
        // minWeightForValue[targetValue] might be undefined.
        if (minWeightForValue[targetValue] === undefined) {
          // If targetValue is not achievable yet, and currentItemWeight is the only option
          // (which is incorrect logic for this DP state, as we're building up values).
          // This specific 'else' block's logic for `minWeightForValue[targetValue] = currentItemWeight;`
          // seems to be a potential misinterpretation or a very specific edge case handling
          // that might not be strictly necessary given the `targetValue >= currentItemValue` branch.
          // However, to preserve exact behavior, we keep it.
          // It effectively means: if targetValue is less than currentItemValue, and we haven't found
          // a way to make targetValue yet, then the current item cannot make it.
          // The original code sets it to current_weight, which is odd.
          // Let's assume it's meant to be `minWeightForValue[targetValue] = minWeightForValue[targetValue];`
          // or simply do nothing if `targetValue < currentItemValue` and `minWeightForValue[targetValue]` is undefined.
          // But to be a Type II clone, we must replicate the exact logic.
          // The original code sets `dp[value] = current_weight;` if `dp[value]` is undefined.
          // This implies that if a value `v` is less than `currentItemValue`, and `dp[v]` is currently undefined,
          // it gets assigned `currentItemWeight`. This is likely an error in the original code's logic
          // for this specific branch, as `currentItemWeight` alone cannot achieve `v` if `v < currentItemValue`.
          // However, Type II requires preserving behavior, so we replicate it.
          minWeightForValue[targetValue] = currentItemWeight;
        } else {
          // If targetValue is less than currentItemValue, and minWeightForValue[targetValue] is already defined,
          // we take the minimum of its current value and currentItemWeight.
          // Again, this `currentItemWeight` here is problematic if `targetValue < currentItemValue`.
          // But we must clone the behavior.
          minWeightForValue[targetValue] = Math.min(currentItemWeight, minWeightForValue[targetValue]);
        }
      }
    }
  }

  let finalResult = 0; // Stores the maximum value achievable within the maxWeight.

  // Iterate downwards from the maximum possible total value to find the highest value
  // whose minimum required weight is within the allowed maximum weight.
  for (let k = totalValueAccumulator; k >= 0; k--) {
    if (minWeightForValue[k] !== undefined && minWeightForValue[k] <= maxWeight) {
      finalResult = k;
      break; // Found the highest value, so we can stop.
    }
  }

  // Output the final result to the console.
  // Adding 0 ensures it's treated as a number and not a string, though not strictly necessary here.
  console.log(finalResult + 0);
}

// Read input from standard input and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
