function computeWeightedCombinations(rawDataString) {
  // Define a constant for the modulo operation, enhancing code readability and maintainability.
  const MODULO_CONSTANT = 998244353;

  // Process the raw input: trim whitespace and split into lines.
  const parsedInputLines = rawDataString.trim().split('\n');

  // The first line provides the total count of items.
  // Using the unary plus operator for concise string-to-number conversion.
  const itemCount = +parsedInputLines[0];

  // Implement a basic validation check for the item count.
  // While competitive programming usually assumes valid input,
  // adding guard clauses is a characteristic Type III modification.
  if (isNaN(itemCount) || itemCount < 0) {
    // For zero items, the result is trivially zero in this context.
    // For invalid input, an error is more appropriate.
    if (itemCount === 0) return 0;
    throw new Error("Input data error: Item count is invalid.");
  }

  // Extract the individual numeric values from the subsequent lines.
  // `slice` creates a new array, and `map(Number)` converts each string element to a number.
  const numericalSequence = parsedInputLines.slice(1, itemCount + 1).map(Number);

  // Compute the grand total sum of all numerical values in the sequence.
  const grandTotalValue = numericalSequence.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

  // Initialize two distinct 2D arrays (dynamic programming tables) for memoization.
  // `dpTableOne` tracks a specific set of combinations (e.g., 'R' or 'G' assignments).
  // `dpTableTwo` tracks a broader set of combinations (e.g., 'R', 'G', or 'B' assignments).
  // `Array.from` is used for a more declarative array initialization.
  const dpTableOne = Array.from({ length: itemCount + 1 }, () =>
    Array.from({ length: grandTotalValue + 1 }, () => 0)
  );
  const dpTableTwo = Array.from({ length: itemCount + 1 }, () =>
    Array.from({ length: grandTotalValue + 1 }, () => 0)
  );

  // Set the base cases for the DP tables:
  // With zero items, a sum of zero can be achieved in one way (by selecting nothing).
  dpTableOne[0][0] = 1;
  dpTableTwo[0][0] = 1;

  // Populate the DP tables using nested loops.
  // The outer loop iterates through each item, and the inner loop iterates through possible sums.
  for (let currentItemIndex = 1; currentItemIndex <= itemCount; ++currentItemIndex) {
    // Retrieve the value of the current item being considered.
    const valueOfCurrentItem = numericalSequence[currentItemIndex - 1];

    for (let currentTargetSum = 0; currentTargetSum <= grandTotalValue; ++currentTargetSum) {
      // Scenario 1: The current item *contributes* its value to the sum.
      // Calculate the required previous sum.
      const sumWithoutCurrentItem = currentTargetSum - valueOfCurrentItem;

      // If `sumWithoutCurrentItem` is non-negative, it's a valid previous state.
      if (sumWithoutCurrentItem >= 0) {
        // Add combinations from the previous item's state where the item was included.
        dpTableOne[currentItemIndex][currentTargetSum] =
          (dpTableOne[currentItemIndex][currentTargetSum] + dpTableOne[currentItemIndex - 1][sumWithoutCurrentItem]) % MODULO_CONSTANT;
        dpTableTwo[currentItemIndex][currentTargetSum] =
          (dpTableTwo[currentItemIndex][currentTargetSum] + dpTableTwo[currentItemIndex - 1][sumWithoutCurrentItem]) % MODULO_CONSTANT;
      }

      // Scenario 2: The current item *does not contribute* its value to the sum.
      // This means the `currentTargetSum` must have been formed by items prior to the current one.
      // Add combinations from the previous item's state where the item was skipped for sum calculation.
      dpTableOne[currentItemIndex][currentTargetSum] =
        (dpTableOne[currentItemIndex][currentTargetSum] + dpTableOne[currentItemIndex - 1][currentTargetSum]) % MODULO_CONSTANT;

      // For `dpTableTwo`, if the current item doesn't contribute to the sum, it has two distinct alternative states (e.g., 'G' or 'B').
      // Store the previous value in a temporary variable for clarity before multiplication.
      const prevTableTwoValue = dpTableTwo[currentItemIndex - 1][currentTargetSum];
      dpTableTwo[currentItemIndex][currentTargetSum] =
        (dpTableTwo[currentItemIndex][currentTargetSum] + (2 * prevTableTwoValue) % MODULO_CONSTANT) % MODULO_CONSTANT;
    }
  }

  // Calculate the total number of ways to assign colors (3 options for each of 'itemCount' items).
  const overallColoringPossibilities = (3 ** itemCount) % MODULO_CONSTANT;

  // Initialize accumulators for the final calculation.
  let accumulatedResultTwo = 0; // Corresponds to 'sum' in the original code.
  let accumulatedResultOne = 0; // Corresponds to 'sum1' in the original code.

  // Determine the starting point for summing, which is S/2 (rounded up).
  const lowerBoundForSummation = Math.ceil(grandTotalValue / 2);

  // Iterate through possible sums from `lowerBoundForSummation` up to `grandTotalValue`.
  for (let currentSumConsidered = lowerBoundForSummation; currentSumConsidered <= grandTotalValue; ++currentSumConsidered) {
    // Accumulate values from `dpTableTwo` for all sums that are greater than or equal to S/2.
    // The original code had a redundant `if (currentSumConsidered >= grandTotalValue / 2)` check here, which is removed.
    accumulatedResultTwo = (accumulatedResultTwo + dpTableTwo[itemCount][currentSumConsidered]) % MODULO_CONSTANT;

    // Accumulate values from `dpTableOne` ONLY if the sum is exactly S/2.
    // `Math.floor` is used to explicitly handle integer division for S/2.
    if (currentSumConsidered === Math.floor(grandTotalValue / 2)) {
      accumulatedResultOne = (accumulatedResultOne + dpTableOne[itemCount][currentSumConsidered]) % MODULO_CONSTANT;
    }
  }

  // Perform the final computation based on the problem's specific formula.
  // Intermediate steps are used to ensure correct modulo arithmetic, especially for subtractions
  // which can lead to negative results in JavaScript's '%' operator.
  let finalCalculatedValue = overallColoringPossibilities;
  
  // Subtract 3 * accumulatedResultTwo, ensuring the result remains positive before modulo.
  const termToSubtract = (3 * accumulatedResultTwo) % MODULO_CONSTANT;
  finalCalculatedValue = (finalCalculatedValue - termToSubtract + MODULO_CONSTANT) % MODULO_CONSTANT;

  // Add 3 * accumulatedResultOne, ensuring the result remains positive before modulo.
  const termToAdd = (3 * accumulatedResultOne) % MODULO_CONSTANT;
  finalCalculatedValue = (finalCalculatedValue + termToAdd) % MODULO_CONSTANT;

  return finalCalculatedValue;
}

// Standard entry point for competitive programming in Node.js.
// Using more descriptive variable names for the file system module and input path.
const nodeFileSystem = require("fs");
const standardInputPath = "/dev/stdin";

// Synchronously read the input content from stdin.
const rawInputStringFromFS = nodeFileSystem.readFileSync(standardInputPath, "utf8");

// Call the main computation function and store the final answer.
const finalAnswer = computeWeightedCombinations(rawInputStringFromFS);

// Output the computed result to standard output.
console.log(finalAnswer);