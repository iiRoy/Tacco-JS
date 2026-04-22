function solveKnapsackProblem(rawDataString) {
  // Parse the raw input string into an array of individual lines.
  const inputLinesArray = rawDataString.split('\n');

  // Perform basic validation to ensure input is not empty.
  if (inputLinesArray.length === 0) {
    console.error("Input data is missing or empty. Cannot proceed.");
    return;
  }

  // Extract the first line which contains the total item count (N) and knapsack capacity (W).
  const parameterLine = inputLinesArray.shift();
  // Convert parameter strings to integers, trimming whitespace.
  const knapsackParameters = parameterLine.split(' ').map(str => parseInt(str.trim(), 10));

  // Validate the parsed knapsack parameters.
  if (knapsackParameters.length < 2 || isNaN(knapsackParameters[0]) || isNaN(knapsackParameters[1])) {
    console.error("Invalid knapsack configuration parameters provided. Expected N and W.");
    return;
  }

  const totalItemsCount = knapsackParameters[0]; // Represents 'N' from problem statement
  const maxWeightCapacity = knapsackParameters[1]; // Represents 'W' from problem statement

  // Define a helper utility to parse individual item specification lines.
  const parseItemSpecs = (lineContent) => {
    const parts = lineContent.split(' ').map(s => parseInt(s.trim(), 10));
    // Return an item object or a placeholder for invalid lines.
    if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) {
      return { weight: 0, value: 0 }; // Treat as an item with no contribution
    }
    return { weight: parts[0], value: parts[1] };
  };

  // Process all remaining lines to get item specifications.
  const itemSpecifications = inputLinesArray.map(parseItemSpecs);

  // Filter out any invalid or empty item lines that might have resulted from parsing.
  const validItemSpecs = itemSpecifications.filter(item => item.weight >= 0 && item.value >= 0);

  // Handle edge cases: no valid items or zero/negative knapsack capacity.
  if (validItemSpecs.length === 0 || maxWeightCapacity <= 0) {
    console.log(0); // No items or no capacity means 0 achievable value.
    return;
  }

  // --- Dynamic Programming Table Initialization ---
  // `minWeightForValue[v]` will store the minimum weight required to achieve a total value of `v`.
  // Initialize all values to `Number.MAX_SAFE_INTEGER` (representing infinity/unachievable).

  // First, calculate the maximum possible sum of values to correctly size the DP array.
  let theoreticalMaxValueSum = 0;
  for (const item of validItemSpecs) {
    theoreticalMaxValueSum += item.value;
  }

  // Initialize the DP array with a size based on the maximum possible value.
  // `minWeightForValue[0]` is set to 0, as 0 value requires 0 weight.
  const minWeightForValue = new Array(theoreticalMaxValueSum + 1).fill(Number.MAX_SAFE_INTEGER);
  minWeightForValue[0] = 0;

  // This variable tracks the highest value for which we currently have a valid weight,
  // helping to bound the inner loop for efficiency.
  let currentMaxAchievableValue = 0;

  // Iterate through each item to update the dynamic programming table.
  for (let itemIndex = 0; itemIndex < validItemSpecs.length; ++itemIndex) {
    const currentItem = validItemSpecs[itemIndex];
    const itemWeight = currentItem.weight;
    const itemValue = currentItem.value;

    // Update the `currentMaxAchievableValue` based on the item just processed.
    // This value represents the maximum value that could possibly be formed by items considered so far.
    currentMaxAchievableValue += itemValue;
    // Ensure it does not exceed the total possible sum of all item values.
    currentMaxAchievableValue = Math.min(currentMaxAchievableValue, theoreticalMaxValueSum);

    // Iterate backwards through possible target values.
    // This reverse iteration ensures that for each item, we are using the DP values
    // from the *previous* item's state, preventing an item from being used multiple times
    // within the same iteration (which would be incorrect for 0/1 Knapsack).
    for (let targetVal = currentMaxAchievableValue; targetVal >= itemValue; --targetVal) {
      // Calculate the value that would need to be achieved by previous items
      // if the current item is included.
      const previousStateTargetVal = targetVal - itemValue;

      // Check if `previousStateTargetVal` was achievable with prior items.
      if (minWeightForValue[previousStateTargetVal] !== Number.MAX_SAFE_INTEGER) {
        // Calculate the total weight if we include the current item.
        const weightIfIncludingCurrent = minWeightForValue[previousStateTargetVal] + itemWeight;

        // Update the DP table: take the minimum weight to achieve `targetVal`.
        // This is either the weight already stored (meaning we don't include current item),
        // or the new `weightIfIncludingCurrent`.
        minWeightForValue[targetVal] = Math.min(
          minWeightForValue[targetVal],
          weightIfIncludingCurrent
        );
      }
    }
  }

  // --- Determine the Optimal Achieved Value ---
  let optimalAchievedValue = 0; // Initialize the result to 0.

  // Iterate backwards from the maximum possible value down to 0.
  // The first value `v` found where `minWeightForValue[v]` is within the
  // `maxWeightCapacity` is our answer, as we want the highest value.
  for (let potentialValue = theoreticalMaxValueSum; potentialValue >= 0; --potentialValue) {
    if (minWeightForValue[potentialValue] <= maxWeightCapacity) {
      optimalAchievedValue = potentialValue;
      break; // Found the maximum value that fits, so we can exit.
    }
  }

  // Output the final optimal value.
  console.log(optimalAchievedValue);
}

// Standard entry point for competitive programming environments reading from stdin.
// Reads the entire file content, then passes it to the main processing function.
const inputFileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
solveKnapsackProblem(inputFileContent);