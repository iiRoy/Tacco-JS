let inputValues = require("fs") .readFileSync(
    "/dev/stdin", "utf8"
) .split("\n")[1] .split(" ") .map(
    stringRepresentation => parseInt(stringRepresentation, 10)
);

/**
 * Computes the total number of adjustments needed to balance a sequence of numbers,
 * starting with a specific initial toggle state.
 *
 * @param {boolean} initialToggleState - The starting boolean state that dictates the adjustment logic.
 * @returns {number} The cumulative count of necessary adjustments.
 */
function determineRequiredAdjustments(initialToggleState) {

  // Initialize an accumulator for the running sum of numbers.
  let accumulatedValue = 0;

  // Initialize a counter for the total number of fixes applied.
  let totalFixes = 0;

  // Iterate over each numeric item in the pre-processed input array.
  for (const currentNumericItem of inputValues) {

    // Add the current item to the running sum.
    accumulatedValue += currentNumericItem;

    // Apply logic based on the current toggle state.
    if (initialToggleState) {
      // If the current toggle state is true (e.g., expecting a negative sum).
      if (accumulatedValue >= 0) {
        // If the accumulated sum is non-negative, adjustments are needed.
        // Increment the fixes count by 1 plus the current positive accumulated value.
        totalFixes += (1 + accumulatedValue);
        // Reset the accumulator to -1 to ensure the next sum starts negatively.
        accumulatedValue = -1;
      }
      // Flip the toggle state for the next iteration.
      initialToggleState = false;
    } else {
      // If the current toggle state is false (e.g., expecting a positive sum).
      if (accumulatedValue <= 0) {
        // If the accumulated sum is non-positive, adjustments are needed.
        // Increment the fixes count by 1 minus the current negative accumulated value.
        totalFixes += (1 - accumulatedValue);
        // Reset the accumulator to 1 to ensure the next sum starts positively.
        accumulatedValue = 1;
      }
      // Flip the toggle state for the next iteration.
      initialToggleState = true;
    }
  }

  // Return the final tally of adjustments.
  return totalFixes;
}

// Calculate the minimum adjustments required by running the function
// with both possible initial toggle states (false and true) and
// then print the smaller of the two results to the console.
console.log(
  Math.min(
    determineRequiredAdjustments(false),
    determineRequiredAdjustments(true)
  )
);