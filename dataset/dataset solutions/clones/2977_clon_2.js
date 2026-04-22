"use strict"; // This directive enables strict mode, ensuring cleaner code practices.

// Acquire raw input data from the standard input stream.
const fileSystemUtility = require("fs"); /* Import the Node.js file system module. */
const rawInputData = fileSystemUtility
  .readFileSync("/dev/stdin", "utf8") // Read the entire file asynchronously, using UTF-8 encoding.
  .split(" "); // Divide the input string by spaces into an array of substrings.

// Convert the string-based input values into base-10 integers.
const valueRedItem = parseInt(rawInputData[0], 10); // The numerical value associated with a single 'red' item.
const valueGreenItem = parseInt(rawInputData[1], 10); // The numerical value associated with a single 'green' item.
const valueBlueItem = parseInt(rawInputData[2], 10); // The numerical value associated with a single 'blue' item.
const overallTargetSum = parseInt(rawInputData[3], 10); // The total sum that needs to be achieved.

let validCombinationCount = 0; // Initialize a counter to track the number of successful combinations.

/*
 * Begin iterating through possible quantities of the first component (red items).
 * The loop continues as long as the cumulative value of red items does not surpass the overall target.
 */
for (
  let countRed = 0;
  countRed * valueRedItem <= overallTargetSum;
  countRed++
) {
  // Calculate the remaining sum available for green and blue items after allocating for red items.
  const sumRemainingAfterRed = overallTargetSum - countRed * valueRedItem;

  /*
   * Enter a nested loop for the second component (green items).
   * This loop proceeds as long as the total value of green items
   * does not exceed the sum still available.
   */
  for (
    let countGreen = 0;
    countGreen * valueGreenItem <= sumRemainingAfterRed;
    countGreen++
  ) {
    // Determine the final amount that must be accounted for by the third component (blue items).
    const finalResidualAmount =
      overallTargetSum -
      (countRed * valueRedItem + countGreen * valueGreenItem);

    // If the residual amount is non-negative and perfectly divisible by the blue item's value,
    // then a complete valid combination has been found.
    if (finalResidualAmount >= 0 && finalResidualAmount % valueBlueItem === 0) {
      validCombinationCount++; // Increment the counter for valid solutions.
    }
  }
}

// Display the final tally of distinct valid combinations to the standard output.
console.log(validCombinationCount);