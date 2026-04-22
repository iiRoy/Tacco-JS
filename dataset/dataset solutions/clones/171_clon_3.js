const fileSystemModule = require('fs'); // Provides file system capabilities.

/**
 * A utility function to determine the larger of two numeric inputs.
 * This implementation uses a bitwise arithmetic trick for efficiency,
 * avoiding conditional branching.
 * @param {number} firstValue - The first number.
 * @param {number} secondValue - The second number.
 * @returns {number} The greater of the two input values.
 */
function ascertainGreaterValue(firstValue, secondValue) {
  const valueDifference = firstValue - secondValue;
  // If valueDifference is negative (firstValue < secondValue),
  // (valueDifference >> 31) results in -1 (all bits set).
  // (valueDifference & -1) is valueDifference itself.
  // So, firstValue - valueDifference becomes firstValue - (firstValue - secondValue) = secondValue.
  //
  // If valueDifference is non-negative (firstValue >= secondValue),
  // (valueDifference >> 31) results in 0.
  // (valueDifference & 0) is 0.
  // So, firstValue - 0 becomes firstValue.
  return firstValue - (valueDifference & (valueDifference >> 31));
}

/**
 * The primary function responsible for executing the knapsack problem solver.
 * It reads input from standard input, processes multiple test cases,
 * and outputs the optimal value and corresponding minimum weight for each case.
 */
function initiateKnapsackSolver() {
  let rawInputContent = ''; // Variable to hold the entire raw input string.
  try {
    // Attempt to synchronously read all data from standard input as UTF-8.
    // This method is common for competitive programming environments on Unix-like systems.
    rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
  } catch (readError) {
    // Log an error if input reading fails and terminate execution gracefully.
    console.error("Critical Error: Unable to read input from stdin. Details:", readError.message);
    return;
  }

  // Split the raw input into an array of lines, filtering out any blank lines
  // to ensure robust parsing.
  const processedInputLines = rawInputContent.split('\n').filter(line => line.trim() !== '');

  // If after filtering, no valid input lines remain, inform the user and exit.
  if (processedInputLines.length === 0) {
    console.log("No meaningful input detected. Terminating execution.");
    return;
  }

  let lineCursor = 0; // An index to track the current line being read from processedInputLines.
  let currentCaseIdentifier = 1; // A sequential counter for labeling each test case's output.

  // Main loop to process multiple knapsack problem instances.
  // It continues until a knapsack capacity of zero is encountered.
  while (true) {
    // Parse the maximum weight capacity for the current knapsack.
    // parseInt is used for explicit string-to-number conversion.
    const knapsackCapacityLimit = parseInt(processedInputLines[lineCursor++], 10);

    // If the parsed capacity is not a number or is zero, it signals the end of test cases.
    if (isNaN(knapsackCapacityLimit) || knapsackCapacityLimit === 0) {
      break; // Exit the loop and terminate the program.
    }

    // Parse the total count of distinct items available for this specific knapsack problem.
    const numberOfItemsToConsider = parseInt(processedInputLines[lineCursor++], 10);

    // Initialize the dynamic programming table (previous state).
    // This array stores the maximum value achievable for each weight up to knapsackCapacityLimit.
    // Int32Array is chosen for potential performance benefits and to store integer values,
    // and is automatically initialized with zeros.
    let previousDynamicProgrammingState = new Int32Array(knapsackCapacityLimit + 1);

    // Iterate through each item to update the DP table.
    for (let itemOrdinal = 0; itemOrdinal < numberOfItemsToConsider; itemOrdinal++) {
      // Extract item value and weight from the current input line.
      const itemDetails = processedInputLines[lineCursor++].split(',');
      const itemValue = parseInt(itemDetails[0], 10);
      const itemWeight = parseInt(itemDetails[1], 10);

      // Input validation: Ensure item value and weight are valid non-negative numbers.
      if (isNaN(itemValue) || isNaN(itemWeight) || itemValue < 0 || itemWeight < 0) {
        console.warn(`Data Warning: Invalid item details encountered for case ${currentCaseIdentifier}, item ${itemOrdinal + 1}. Skipping this item.`);
        continue; // Skip processing this malformed item and move to the next.
      }

      // Create a new dynamic programming array for the current iteration.
      // It's initialized as a copy of the previous state, meaning items not taken
      // will retain their previous optimal values.
      const currentDynamicProgrammingState = new Int32Array(previousDynamicProgrammingState);

      // Iterate through all possible weight capacities, from 1 up to the knapsack's limit.
      for (let currentWeightCapacity = 1; currentWeightCapacity <= knapsackCapacityLimit; currentWeightCapacity++) {
        // If the current item's weight is greater than the current capacity,
        // this item cannot be included. The value for this capacity remains
        // the same as in the previous state (without considering this item).
        if (itemWeight > currentWeightCapacity) {
          // This line is technically redundant due to the copy from previous state,
          // but explicitly sets the value, serving as a clearer update/rewrite.
          currentDynamicProgrammingState[currentWeightCapacity] = previousDynamicProgrammingState[currentWeightCapacity];
          continue; // Move to the next weight capacity.
        }

        // Calculate the potential value if the current item *is* included.
        // This involves adding the item's value to the maximum value achievable
        // with the remaining capacity (currentWeightCapacity - itemWeight)
        // from the *previous* DP state.
        const valueIfItemIsIncluded = previousDynamicProgrammingState[currentWeightCapacity - itemWeight] + itemValue;

        // The value if the current item is *not* included is simply
        // the value from the previous DP state for the current capacity.
        const valueIfItemIsNotIncluded = previousDynamicProgrammingState[currentWeightCapacity];

        // Update the current DP state with the maximum of these two possibilities.
        currentDynamicProgrammingState[currentWeightCapacity] = ascertainGreaterValue(valueIfItemIsIncluded, valueIfItemIsNotIncluded);
      }
      // After processing all capacities for the current item,
      // the current state becomes the previous state for the next item's iteration.
      previousDynamicProgrammingState = currentDynamicProgrammingState;
    }

    // Once all items have been processed, determine the overall maximum value
    // that can be achieved and the smallest weight at which this maximum value occurs.
    let maximumAchievedValue = 0;
    let finalOptimalWeight = 0;

    // Scan the final dynamic programming table.
    for (let weightIterator = 0; weightIterator <= knapsackCapacityLimit; weightIterator++) {
      const valueAtCurrentWeight = previousDynamicProgrammingState[weightIterator];

      // If a new higher maximum value is found, update both the value and the weight.
      // Because we iterate from weight 0 upwards, if multiple weights yield the same
      // maximum value, the first one encountered (i.e., the smallest weight) will be retained.
      if (valueAtCurrentWeight > maximumAchievedValue) {
        maximumAchievedValue = valueAtCurrentWeight;
        finalOptimalWeight = weightIterator;
      }
    }

    // Output the results for the current test case using template literals for clarity.
    console.log(`Case ${currentCaseIdentifier++}:\n${maximumAchievedValue}\n${finalOptimalWeight}`);
  }
}

// Initiate the knapsack problem solver.
initiateKnapsackSolver();