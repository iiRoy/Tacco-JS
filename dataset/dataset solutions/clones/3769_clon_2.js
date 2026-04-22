/*
 * This module processes a numerical input to determine the minimum
 * number of specific power values that sum up to the input.
 * It uses a recursive approach with memoization-like pruning.
 */
function ProcessNumericalInput(inputString) {
  // Convert the raw input string to an integer value.
  // This operation ensures we are working with a whole number.
  let targetInput = Number(inputString);
  targetInput = Math.floor(targetInput);

  // Define a predefined collection of specific power values.
  // These values are used as building blocks for the target number.
  const powerValuesCollection = [
    1, 6, 9, 36, 81, 216, 729, 1296, 6561, 7776, 46656, 59049
  ];

  // Initialize the global minimum operation count to a very large number.
  // This acts as an "infinity" placeholder for comparison.
  let minimumStepsRequired = 1 << 29;

  // Initiate the recursive calculation process.
  // Starting with zero current steps, the full target value,
  // and the highest available index in the power values collection.
  performRecursiveCalculation(0, targetInput, powerValuesCollection.length - 1);

  // Output the final determined minimum number of steps.
  console.log(minimumStepsRequired);


  /**
   * Recursively calculates the minimum number of steps to reach a target value
   * using elements from the powerValuesCollection.
   *
   * @param {number} currentAccumulatedSteps - The count of steps taken so far in the current path.
   * @param {number} remainingTargetValue - The portion of the target value yet to be covered.
   * @param {number} currentCollectionIndex - The highest index in powerValuesCollection
   *                                          from which elements can be considered.
   */
  function performRecursiveCalculation(currentAccumulatedSteps, remainingTargetValue, currentCollectionIndex) {
    // Base case: If the remaining target value is zero or negative,
    // it means we have successfully covered the target.
    if (remainingTargetValue <= 0) {
      // If the current path's step count is less than the globally recorded minimum,
      // update the global minimum.
      if (currentAccumulatedSteps < minimumStepsRequired) {
        minimumStepsRequired = currentAccumulatedSteps;
      }
    }
    // Optimization: If the current path's step count already exceeds or equals
    // the globally recorded minimum, there's no need to explore this path further.
    else if (currentAccumulatedSteps < minimumStepsRequired) {
      // Find the largest power value that is less than or equal to the remaining target value,
      // starting from the currentCollectionIndex and moving downwards.
      while (powerValuesCollection[currentCollectionIndex] > remainingTargetValue) {
        currentCollectionIndex--;
      }

      // First recursive branch: Try using the current largest suitable power value.
      // Increment steps, subtract the power value from the target, and allow
      // reuse of the same power value by keeping currentCollectionIndex.
      performRecursiveCalculation(
        currentAccumulatedSteps + 1,
        remainingTargetValue - powerValuesCollection[currentCollectionIndex],
        currentCollectionIndex
      );

      // Second recursive branch: If there's a smaller power value available (index > 0),
      // try using that one instead, to explore alternative combinations.
      if (currentCollectionIndex > 0) {
        performRecursiveCalculation(
          currentAccumulatedSteps + 1,
          remainingTargetValue - powerValuesCollection[currentCollectionIndex - 1],
          currentCollectionIndex - 1
        );
      }
    }
  }
}

// Entry point of the script: Read input from standard input and process it.
// The input is expected to be a single numerical value.
ProcessNumericalInput(require("fs").readFileSync("/dev/stdin", "utf8"));