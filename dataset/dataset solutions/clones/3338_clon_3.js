/**
 * A global constant representing the large prime modulus used for arithmetic operations
 * to prevent integer overflow and handle results within a specific range.
 * This value is 1,000,000,007 (1e9 + 7).
 */
const PRIME_MODULUS = 1000000007;

/**
 * Performs modular addition of two numbers, ensuring the result is always
 * non-negative and within the range [0, PRIME_MODULUS - 1].
 *
 * @param {number} operand1 - The first number to add.
 * @param {number} operand2 - The second number to add.
 * @returns {number} The modular sum of the two operands.
 */
function addMod(operand1, operand2) {
  return (operand1 + operand2) % PRIME_MODULUS;
}

/**
 * Performs modular subtraction of two numbers, ensuring the result is always
 * non-negative and within the range [0, PRIME_MODULUS - 1].
 * This is crucial for competitive programming where intermediate results
 * might become negative before the final modulo operation.
 *
 * @param {number} minVal - The number from which to subtract.
 * @param {number} subVal - The number to subtract.
 * @returns {number} The modular difference.
 */
function subtractMod(minVal, subVal) {
  // Add PRIME_MODULUS before taking modulo to guarantee a positive result
  // if (minVal - subVal) happens to be negative.
  return (minVal - subVal + PRIME_MODULUS) % PRIME_MODULUS;
}

/**
 * Calculates the total number of distinct ways to achieve a specified target sum
 * using a collection of items. Each item type has an associated "weight" or "limit"
 * which dictates the maximum number of times that item can be chosen.
 * This is a classic dynamic programming problem, often referred to as "number of ways to make change"
 * or "distribution problem" with limits, solved using a prefix sum optimization.
 *
 * @param {number} numItemTypes - The count of different item types available.
 * @param {number} targetValue - The specific sum that needs to be achieved.
 * @param {number[]} typeLimits - An array where `typeLimits[i]` specifies the maximum
 *                                number of times the `i`-th item type can be selected.
 * @returns {number} The count of ways to reach `targetValue`, modulo `PRIME_MODULUS`.
 */
function calculateCombinations(numItemTypes, targetValue, typeLimits) {
  // --- Enhanced Input Validation and Edge Cases ---
  if (targetValue < 0) {
    // A negative target sum is impossible to achieve.
    return 0;
  }
  if (targetValue === 0) {
    // There's always one way to achieve a sum of zero: by selecting no items.
    return 1;
  }
  if (
    !Array.isArray(typeLimits) ||
    typeLimits.length !== numItemTypes ||
    numItemTypes <= 0
  ) {
    // Added a more robust check for the input array's integrity.
    console.warn(
      "Warning: Invalid item types count or limits array provided. Returning 0."
    );
    return 0;
  }

  // `currentWaysCountForSum[s]` will temporarily store the number of ways
  // to achieve sum `s` considering items up to the current `itemIndex`.
  // This array is re-computed for each `itemIndex`.
  let currentWaysCountForSum = new Array(targetValue + 1).fill(0);

  // `cumulativeSumMatrix` stores the prefix sums.
  // `cumulativeSumMatrix[i][s]` represents sum(currentWaysCountForSum[k]) for k from 0 to s,
  // considering items up to item `i`. This structure allows for O(1) range sum queries.
  let cumulativeSumMatrix = Array.from({ length: numItemTypes }, () =>
    new Array(targetValue + 1).fill(0)
  );

  // Iterate through each distinct item type.
  for (let itemIndex = 0; itemIndex < numItemTypes; itemIndex++) {
    // Get the maximum allowed count for the current item.
    const maxUseForCurrentItem = typeLimits[itemIndex];

    // Iterate through all possible sums, from 0 up to the target.
    for (let currentPossibleSum = 0; currentPossibleSum <= targetValue; currentPossibleSum++) {
      let waysForThisIteration; // Placeholder for the calculated ways for current sum.

      if (itemIndex === 0) {
        // --- Base Case: Processing the very first item type ---
        // If the `currentPossibleSum` is within the limit of the first item,
        // there's 1 way (using only this item). Otherwise, 0 ways.
        waysForThisIteration =
          currentPossibleSum <= maxUseForCurrentItem ? 1 : 0;
      } else {
        // --- Recurrence Relation: Processing subsequent item types ---
        // The core DP transition:
        // `ways(i, s)` = `ways(i-1, s)` + `ways(i, s-itemWeight)`
        // With limits, this transforms into:
        // `ways(i, s)` = `cumulative_sum(i-1, s)` - `cumulative_sum(i-1, s - itemWeight - 1)`
        // This effectively counts ways to make `s` using items up to `i`, where item `i`
        // is used between 0 and `maxUseForCurrentItem` times.

        // 1. Get the total ways to achieve `currentPossibleSum` using items up to `itemIndex - 1`.
        // This is directly available from the prefix sum of the previous row.
        let waysFromPreviousItems =
          cumulativeSumMatrix[itemIndex - 1][currentPossibleSum];

        // 2. Identify the sum index for subtracting overcounted combinations.
        // This corresponds to `s - maxUseForCurrentItem - 1`.
        let indexToExclude = currentPossibleSum - maxUseForCurrentItem - 1;

        let waysToDeduct = 0;
        if (indexToExclude >= 0) {
          // If `indexToExclude` is valid, retrieve the cumulative sum from the previous row.
          // These are the combinations that would use more than `maxUseForCurrentItem`
          // of the current item, if we allowed unlimited use.
          waysToDeduct = cumulativeSumMatrix[itemIndex - 1][indexToExclude];
        }

        // Apply modular subtraction to get the correct count for `waysForThisIteration`.
        waysForThisIteration = subtractMod(waysFromPreviousItems, waysToDeduct);
      }

      // Update the temporary `currentWaysCountForSum` array for the current sum.
      currentWaysCountForSum[currentPossibleSum] = waysForThisIteration;

      // Calculate and store the cumulative sum for the current item type and sum.
      // This is `cumulativeSumMatrix[itemIndex][currentPossibleSum] = sum(currentWaysCountForSum[k]) for k=0 to currentPossibleSum`.
      let prevCumulativeInCurrentRow =
        currentPossibleSum > 0
          ? cumulativeSumMatrix[itemIndex][currentPossibleSum - 1]
          : 0;
      cumulativeSumMatrix[itemIndex][currentPossibleSum] = addMod(
        prevCumulativeInCurrentRow,
        waysForThisIteration
      );
    }
  }

  // After iterating through all item types, the final answer is the number of ways
  // to achieve `targetValue` considering all available items.
  // This is stored in `currentWaysCountForSum[targetValue]`.
  return currentWaysCountForSum[targetValue];
}

/**
 * Entry point for the program. Reads input from standard input,
 * parses the necessary parameters, invokes the combination calculation function,
 * and prints the final result to standard output.
 *
 * @param {string} rawInputData - The entire input read as a single string.
 */
function processInputAndCalculate(rawInputData) {
  // Split the raw input string into an array of lines.
  const inputLines = rawInputData.trim().split("\n");

  // Parse the first line which contains the number of item types (N) and the target sum (K).
  // Using `Number()` for type conversion, which is robust for both integers and floating-point
  // (though we expect integers here).
  const problemDimensions = inputLines[0].split(" ").map((strVal) => Number(strVal));
  const numberOfItemTypes = problemDimensions[0];
  const desiredTargetSum = problemDimensions[1];

  // Parse the second line which contains the limits for each item type (A array).
  const itemTypeLimits = inputLines[1].split(" ").map((strVal) => Number(strVal));

  // Perform the main calculation using the derived parameters.
  const finalCombinationResult = calculateCombinations(
    numberOfItemTypes,
    desiredTargetSum,
    itemTypeLimits
  );

  // Output the computed answer.
  console.log(finalCombinationResult);
}

// Node.js specific code to read from standard input (`fd: 0`) and execute the main processing function.
// This ensures compatibility with typical competitive programming environments.
processInputAndCalculate(require("fs").readFileSync(0, "utf8"));