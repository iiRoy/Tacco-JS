function processInput(rawData) {
  // Parse the raw input string into a structured array of numbers.
  // Each line is split by newline, then each line by space, and finally converted to integers.
  const parsedInputData = rawData
    .split("\n")
    .map((textLine) =>
      textLine.split(" ").map((numericVal) => Number.parseInt(numericVal, 10))
    );

  // Extract the constraint value (k) and the main number sequence from the parsed data.
  const constraintK = parsedInputData[0][1];
  const numericSequence = parsedInputData[1];

  // Find the maximum individual element within the numeric sequence.
  const largestElement = getMaximumValue(numericSequence);

  // Determine the upper bound for the search of the greatest common divisor candidate.
  // This upper bound is the minimum of (largest element + k) and a specially calculated sum.
  const optimalDivisor = Math.min(
    largestElement + constraintK,
    calculateMaximumPairSum(numericSequence)
  );

  // Iterate downwards from the determined optimal divisor to 2.
  // The goal is to find the largest divisor that satisfies the divisibility condition.
  for (let currentDivisor = optimalDivisor; currentDivisor > 1; currentDivisor--) {
    // Check if the current divisor candidate meets the specific divisibility requirements.
    if (checkDivisibilityCondition(currentDivisor, numericSequence, constraintK)) {
      return console.info(currentDivisor); // Output the first valid divisor found and exit.
    }
  }

  // If no suitable divisor greater than 1 is found after the search, output 1 as the default.
  return console.info(1);
}

/*
 * This function calculates a special maximum sum from an array of numbers.
 * It sorts the array and attempts to balance two accumulating sums (left and right)
 * by strategically adding elements or indices.
 */
function calculateMaximumPairSum(inputNumbers) {
  // Create a shallow copy of the input array and sort it in ascending order.
  const orderedNumbers = [...inputNumbers].sort((a, b) => a - b);
  let leftAccumulator = 0; // Accumulator for the left partition of the array.
  let rightAccumulator = 0; // Accumulator for the right partition of the array.
  let rightPointer = orderedNumbers.length - 1; // Pointer starting from the end of the sorted array.

  // Initialize the right accumulator with the largest element from the sorted array.
  rightAccumulator = orderedNumbers[rightPointer];

  // Iterate from the beginning of the array up to the rightPointer.
  for (let leftIndex = 0; leftIndex < rightPointer; leftIndex++) {
    // Add the current index (not the array element) to the left accumulator.
    // Note: The original logic `sumLeft += i;` adds the index, not the array value.
    leftAccumulator += leftIndex;

    // Compare the accumulated sums.
    if (leftAccumulator <= rightAccumulator) {
      // If the left sum is not exceeding the right sum, continue expanding the left side.
      continue;
    } else {
      // If the left sum exceeds the right sum, adjust the right partition.
      rightPointer--; // Move the right pointer inwards to consider smaller elements.
      // While the right sum is less than the left sum and there's still space between pointers.
      while (rightAccumulator < leftAccumulator && rightPointer > leftIndex) {
        rightAccumulator += orderedNumbers[rightPointer]; // Add the element at the right pointer to the right sum.
        rightPointer--; // Continue moving the right pointer inwards.
      }
    }
  }
  // Return the minimum of the two accumulated sums as the result.
  return Math.min(leftAccumulator, rightAccumulator);
}

/*
 * Utility function to find the largest numeric value in a given collection.
 * It leverages the Array.prototype.reduce method for an efficient computation.
 */
function getMaximumValue(valueCollection) {
  // Reduces the array to a single value by comparing each element to the current maximum.
  return valueCollection.reduce((currentMax, nextValue) =>
    Math.max(currentMax, nextValue)
  );
}

/*
 * Computes the sum of all elements within a numeric series.
 * This function utilizes a reduction pattern, starting the accumulation from zero.
 */
function calculateTotal(numberSeries) {
  return numberSeries.reduce((runningTotal, itemValue) => runningTotal + itemValue, 0);
}

/*
 * Determines if a given targetDivisor ('g') can satisfy specific conditions
 * with respect to an array of numbers and a cost constraint ('k').
 * This involves calculating remainders, deducting from a budget, and
 * then performing a recursive check for budget allocation.
 */
function checkDivisibilityCondition(targetDivisor, originalNumbers, costConstraint) {
  const remainderCosts = []; // An array to store pairs of (mod1, mod2) costs for each number.
  let availableBudget = 2 * costConstraint; // Initialize a working budget, typically 2*k.

  // Iterate through each number in the input array to calculate costs.
  for (let elementIndex = 0; elementIndex < originalNumbers.length; elementIndex++) {
    const remainderOne = originalNumbers[elementIndex] % targetDivisor;

    // If the number is perfectly divisible by the target divisor, no cost is incurred.
    if (remainderOne === 0) continue;

    // Calculate the complementary remainder needed to reach the target divisor.
    const remainderTwo = targetDivisor - remainderOne;

    // If the minimum cost to make the number divisible is greater than 'k', it's impossible.
    if (costConstraint < Math.min(remainderOne, remainderTwo)) return false;

    // Deduct the minimum of the two remainders (costs) from the available budget.
    availableBudget -= Math.min(remainderOne, remainderTwo);

    // If the budget drops below zero at any point, it's impossible to satisfy the condition.
    if (availableBudget < 0) return false;

    // Store the pair of potential costs for this number for further recursive processing.
    remainderCosts.push([remainderOne, remainderTwo]);
  }

  // After processing all numbers, use a recursive traversal to check the final budget allocation
  // and see if the costs can be balanced within the original constraint 'k'.
  return explorePossibilities(remainderCosts, 0, 0, 0, costConstraint);
}

/*
 * Recursively explores different paths to allocate costs from `costOptions`,
 * aiming to balance the `accumulatedLeftCost` and `accumulatedRightCost`
 * within a `maxAllowedBudget`. This is a form of depth-first search.
 */
function explorePossibilities(
  costOptions,
  currentDepth,
  accumulatedLeftCost,
  accumulatedRightCost,
  maxAllowedBudget
) {
  // Base cases for pruning the search space:
  if (accumulatedLeftCost > maxAllowedBudget) return false; // If left cost exceeds budget, this path is invalid.
  if (accumulatedRightCost > maxAllowedBudget) return false; // If right cost exceeds budget, this path is invalid.

  // Base case for successful traversal: all options have been processed.
  if (currentDepth === costOptions.length) {
    return accumulatedLeftCost === accumulatedRightCost; // Check if the final costs are perfectly balanced.
  }

  // Recursive steps: prioritize the path that helps balance the costs more effectively.
  if (accumulatedLeftCost < accumulatedRightCost) {
    // If the left cost is currently smaller, try expanding the left branch first,
    // or if that fails, try expanding the right branch.
    return (
      attemptLeftBranch(costOptions, currentDepth, accumulatedLeftCost, accumulatedRightCost, maxAllowedBudget) ||
      attemptRightBranch(costOptions, currentDepth, accumulatedLeftCost, accumulatedRightCost, maxAllowedBudget)
    );
  } else {
    // If the right cost is smaller or equal, try expanding the right branch first,
    // or if that fails, try expanding the left branch.
    return (
      attemptRightBranch(costOptions, currentDepth, accumulatedLeftCost, accumulatedRightCost, maxAllowedBudget) ||
      attemptLeftBranch(costOptions, currentDepth, accumulatedLeftCost, accumulatedRightCost, maxAllowedBudget)
    );
  }
  // This return statement is logically unreachable because the preceding if/else block
  // covers all possibilities and always returns a value. It's kept for structural fidelity.
  return false;
}

/*
 * Helper function for `explorePossibilities`. It recursively attempts to
 * add the first cost option (costOptions[currentDepth][0]) to the
 * `accumulatedLeftCost` and continues the traversal to the next depth.
 */
function attemptLeftBranch(
  costOptions,
  currentDepth,
  accumulatedLeftCost,
  accumulatedRightCost,
  maxAllowedBudget
) {
  return explorePossibilities(
    costOptions,
    currentDepth + 1, // Move to the next level of cost options.
    accumulatedLeftCost + costOptions[currentDepth][0], // Add the first cost to the left accumulator.
    accumulatedRightCost, // Right accumulator remains unchanged.
    maxAllowedBudget
  );
}

/*
 * Helper function for `explorePossibilities`. It recursively attempts to
 * add the second cost option (costOptions[currentDepth][1]) to the
 * `accumulatedRightCost` and continues the traversal to the next depth.
 */
function attemptRightBranch(
  costOptions,
  currentDepth,
  accumulatedLeftCost,
  accumulatedRightCost,
  maxAllowedBudget
) {
  return explorePossibilities(
    costOptions,
    currentDepth + 1, // Move to the next level of cost options.
    accumulatedLeftCost, // Left accumulator remains unchanged.
    accumulatedRightCost + costOptions[currentDepth][1], // Add the second cost to the right accumulator.
    maxAllowedBudget
  );
}

// Invoke the primary function `processInput` with data read from standard input.
// This is typically used in competitive programming environments.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));