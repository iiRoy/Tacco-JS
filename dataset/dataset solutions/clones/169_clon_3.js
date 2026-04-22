const fileSystemMod = require('fs');

// Read all standard input synchronously as a single string,
// then split it into an array of lines for easier processing.
const parsedInputLines = fileSystemMod.readFileSync(0, 'utf8').split('\n');

// Initiate the main processing flow for all provided test cases.
processAllCases();

/**
 * This function orchestrates the handling of multiple knapsack problem
 * test cases read from standard input. It iterates through the input,
 * solves each knapsack scenario, and prints the results.
 */
function processAllCases() {
  // `currentLineIndex` keeps track of which line in `parsedInputLines`
  // is currently being processed.
  let currentLineIndex = 0;
  // `caseIdentifier` is used to number the output for each test case.
  let caseIdentifier = 1;

  // The main loop continues as long as there are valid test cases to process.
  while (true) {
    // Attempt to parse the knapsack's maximum weight capacity from the input.
    // The `parseInt` function is used with radix 10 for explicit decimal conversion.
    const knapsackCapacity = parseInt(parsedInputLines[currentLineIndex++], 10);

    // A capacity of 0 or an invalid number (NaN) indicates the end of input
    // or an error, so the processing loop terminates.
    if (!knapsackCapacity || isNaN(knapsackCapacity)) {
      break;
    }

    // Read the total number of items available for the current knapsack problem.
    const numItems = parseInt(parsedInputLines[currentLineIndex++], 10);

    // Initialize the dynamic programming table. This `Int32Array` efficiently
    // stores the maximum value achievable for each possible weight, from 0 up to
    // `knapsackCapacity`. It's pre-filled with zeros.
    const dpTable = new Int32Array(knapsackCapacity + 1);

    // Iterate through each item that needs to be considered for the knapsack.
    for (let itemOrdinal = 0; itemOrdinal < numItems; itemOrdinal++) {
      // Retrieve the raw string data for the current item (e.g., "100,5").
      const itemData = parsedInputLines[currentLineIndex++];

      // Add a basic validation step: ensure the item data exists and contains a comma.
      if (!itemData || itemData.indexOf(',') === -1) {
          console.error(`Warning: Malformed item data encountered at line ${currentLineIndex - 1}. Skipping this item.`);
          continue; // Skip to the next item if data is invalid.
      }

      // Split the item data string into its value and weight components.
      const [valueString, weightString] = itemData.split(',');

      // Convert the string components to integer numbers.
      const itemValue = parseInt(valueString, 10);
      const itemWeight = parseInt(weightString, 10);

      // Perform additional validation on the parsed item properties.
      // Ensure they are valid numbers and the weight is positive.
      if (isNaN(itemValue) || isNaN(itemWeight) || itemWeight <= 0) {
          console.error(`Warning: Invalid numeric item value or weight at line ${currentLineIndex - 1}. Skipping this item.`);
          continue; // Skip to the next item if properties are invalid.
      }

      // This nested loop is the core of the 0/1 Knapsack DP algorithm.
      // It iterates the knapsack's capacity from its maximum down to the current item's weight.
      // Iterating downwards is crucial for the 0/1 knapsack variant as it ensures
      // that each item is considered only once per knapsack capacity calculation.
      for (let currentWeightLimit = knapsackCapacity; currentWeightLimit >= itemWeight; currentWeightLimit--) {
        // Calculate the potential value if the current item IS included in the knapsack.
        // This involves adding the current item's value to the maximum value
        // achievable with the remaining capacity (`currentWeightLimit - itemWeight`).
        const valueIfIncluded = dpTable[currentWeightLimit - itemWeight] + itemValue;

        // Update the `dpTable` for the `currentWeightLimit`.
        // We choose the maximum between two options:
        // 1. Not including the current item (which is `dpTable[currentWeightLimit]` before update).
        // 2. Including the current item (`valueIfIncluded`).
        dpTable[currentWeightLimit] = Math.max(dpTable[currentWeightLimit], valueIfIncluded);
      }
    }

    // After all items have been processed, the `dpTable` contains the optimal
    // values for all possible weights up to `knapsackCapacity`.
    // Now, we need to find the overall maximum value and the smallest weight
    // at which this maximum value is achieved.
    let currentMaximumValue = 0;
    let correspondingWeight = 0;

    // Iterate through the `dpTable` to find the highest value.
    // Iterating from `k = 0` ensures that if multiple weights yield
    // the same maximum value, the one with the smallest weight is chosen.
    for (let k = 0; k <= knapsackCapacity; k++) {
      if (dpTable[k] > currentMaximumValue) {
        currentMaximumValue = dpTable[k];
        correspondingWeight = k;
      }
    }

    // Output the results for the current test case using a template literal for clarity.
    // The `caseIdentifier` is incremented for the next test case.
    console.log(`Case ${caseIdentifier++}:\n${currentMaximumValue}\n${correspondingWeight}`);
  }
}

// The original `max(a, b)` helper function has been removed,
// as `Math.max` provides equivalent functionality directly.