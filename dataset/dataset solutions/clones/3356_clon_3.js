/**
 * Computes the maximum attainable value based on a sequence of items,
 * where each item has a specific height and an associated value.
 * The value for a given height can only be updated if a new path yields a higher total.
 * This algorithm dynamically builds up optimal values for different heights.
 * @param {string} sourceText - The raw input string containing N, heights, and values.
 * @returns {number} The highest value achieved across all possible height configurations.
 */
function calculateOptimalValues(sourceText) {
  // Decompose the raw input string into individual lines for processing.
  const inputLines = sourceText.split('\n');

  // Perform initial validation on the input structure.
  // We expect at least three lines: N, heights, and values.
  if (inputLines.length < 3) {
    console.error("Error: Insufficient input lines provided. Expected N, heights, and values.");
    return 0; // Return a default or error value.
  }

  // Parse the total number of items from the first line.
  // Using Number.parseInt with radix 10 for explicit base.
  const numEntries = Number.parseInt(inputLines[0], 10);

  // Extract height and value strings from the second and third lines.
  const rawHeightsStr = inputLines[1];
  const rawValuesStr = inputLines[2];

  // Convert the space-separated string representations of heights and values
  // into arrays of numbers. This is an optimization and data type transformation.
  const itemHeights = rawHeightsStr.split(' ').map(s => Number.parseInt(s, 10));
  const itemValues = rawValuesStr.split(' ').map(s => Number.parseInt(s, 10));

  // Validate that the parsed arrays have the expected number of elements.
  if (itemHeights.length !== numEntries || itemValues.length !== numEntries) {
    console.error("Error: Mismatch between declared number of entries (N) and actual item counts.");
    return 0;
  }

  // Initialize a dynamic programming array (or lookup table) to store the
  // maximum value achievable at each specific height.
  // The array is sized `numEntries + 1` to accommodate heights from 0 up to `numEntries`.
  // All elements are initialized to zero, representing no value achieved yet.
  const optimalValueByHeight = Array(numEntries + 1).fill(0);

  // This variable will keep track of the absolute maximum value encountered
  // across all processing steps.
  let overallMaximumAchieved = 0;

  // Iterate through each item provided in the input, processing them sequentially.
  for (let itemIndex = 0; itemIndex < numEntries; itemIndex++) {
    // Retrieve the value and height for the current item being considered.
    const currentItemValue = itemValues[itemIndex];
    const currentItemHeight = itemHeights[itemIndex];

    // Implement a guard clause to skip items with invalid heights.
    // Heights must be non-negative and within the bounds of the DP table.
    if (currentItemHeight < 0 || currentItemHeight > numEntries) {
        console.warn(`Warning: Item at index ${itemIndex} has an invalid height ${currentItemHeight}. Skipping this item.`);
        continue; // Move to the next item if the current one is invalid.
    }

    // Calculate the potential new maximum value if we decide to include the current item.
    // This is the current item's own value added to the best value previously achieved
    // at its specific height (currentItemHeight).
    const potentialCombinedValue = currentItemValue + optimalValueByHeight[currentItemHeight];

    // Propagate this `potentialCombinedValue` to all subsequent heights.
    // If this new path (ending with the current item) offers a higher value
    // for a given target height than what was previously stored, update it.
    for (let targetHeight = currentItemHeight; targetHeight <= numEntries; targetHeight++) {
      if (potentialCombinedValue > optimalValueByHeight[targetHeight]) {
        optimalValueByHeight[targetHeight] = potentialCombinedValue;
      } else {
        // Optimization: If the `potentialCombinedValue` is not greater than the
        // current optimal value for `targetHeight`, it also won't be greater
        // for any `targetHeight + 1` or higher, assuming `optimalValueByHeight`
        // maintains a non-decreasing property from `currentItemHeight` onwards.
        // This allows for an early exit from the inner loop, improving efficiency.
        break;
      }
    }

    // After updating the DP table based on the current item,
    // update the global maximum value found so far. We are interested in
    // the highest value that can be achieved at any height, so we check
    // the value at the current item's height in the updated DP table.
    overallMaximumAchieved = Math.max(overallMaximumAchieved, optimalValueByHeight[currentItemHeight]);
  }

  // Output the final computed maximum value to the console.
  console.log(`Calculated optimal value: ${overallMaximumAchieved}`);

  // Return the final result.
  return overallMaximumAchieved;
}

/**
 * A utility function to simulate the execution of the main calculation
 * with predefined test cases, typically used for local development or testing.
 * This is a complete rewrite of the original debug function to be Node.js compatible.
 * @param {Array<Object>} testCases - An array of objects, each containing 'input' string and 'expectedOutput' number.
 */
function simulateExecution(testCases) {
  console.log("\n--- Starting Test Case Simulation ---");
  testCases.forEach((test, index) => {
    console.log(`\n--- Test Case #${index + 1} ---`);
    console.log("Provided Input:\n", test.input.trim());
    try {
      // Invoke the primary calculation function with the test input.
      const actualResult = calculateOptimalValues(test.input);
      const isCorrect = actualResult === test.expectedOutput;

      console.log(`Expected Result: ${test.expectedOutput}`);
      console.log(`Actual Result: ${actualResult}`);
      console.log(`Test Status: ${isCorrect ? "PASSED (AC)" : "FAILED (WA)"}`);
    } catch (error) {
      console.error(`An error occurred during test execution: ${error.message}`);
      console.log(`Test Status: FAILED (ERR)`);
    }
  });
  console.log("\n--- Test Simulation Complete ---");
}

// This block ensures the main calculation function is invoked when the script is run directly,
// reading input from standard input, as is common in competitive programming environments.
// It uses Node.js 'fs' module to read the entire file content synchronously.
// The `typeof require !== 'undefined'` check helps ensure compatibility if this file
// were somehow loaded in a browser context without a `require` function.
if (typeof require !== 'undefined' && require.main === module) {
    calculateOptimalValues(require('fs').readFileSync('/dev/stdin', 'utf8'));
}

/*
// Example usage for the simulateExecution function.
// This block is typically commented out in production to avoid running test cases
// when the script is executed for its primary purpose (reading from stdin).
const sampleTestCases = [
  {
    input: `5
1 2 3 4 5
10 20 30 40 50`,
    expectedOutput: 50 // The last item's value if heights are distinct and increasing.
  },
  {
    input: `3
1 1 2
10 5 15`,
    expectedOutput: 30 // Trace: (1,10)->dp[1]=10, dp[2]=10, dp[3]=10; ans=10
                       //        (1,5)->dp[1]=10+5=15, dp[2]=15, dp[3]=15; ans=15
                       //        (2,15)->dp[2]=15+15=30, dp[3]=30; ans=30
  },
  {
    input: `4
1 2 1 3
100 10 50 20`,
    expectedOutput: 170 // Trace: (1,100)->dp=[0,100,100,100,100]; ans=100
                        //        (2,10)->dp[2]=10+100=110, dp[3]=110, dp[4]=110; ans=110
                        //        (1,50)->dp[1]=50+100=150, dp[2]=150, dp[3]=150, dp[4]=150; ans=150
                        //        (3,20)->dp[3]=20+150=170, dp[4]=170; ans=170
  },
  {
    input: `2
0 1
10 20`,
    expectedOutput: 30 // Heights can be 0.
  },
  {
    input: `1
1
100`,
    expectedOutput: 100
  }
];
// simulateExecution(sampleTestCases);
*/