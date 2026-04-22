'use strict';
(function (rawData) { // Primary processing function begins
  rawData = rawData .  trim()   .   split(/\n/); // Clean and segment the raw input data

  var itemCount = parseInt(rawData[0], 10); // Extract the total number of items from the first line

  var successProbs = rawData[1]
    .split(/\s+/) // Separate probability values by whitespace
    .map(currentVal => parseFloat(currentVal)); // Convert string probabilities to floating-point numbers

  /*
   * Initialize a 2D array, which serves as our dynamic programming table.
   * Its dimensions are adjusted to accommodate the problem's specific indexing.
   * Each cell will store a calculated probability.
   */
  var probabilityTable = new Array(itemCount + 3)
    .fill(0)
    .map((unused, rowIndex) => new Array(rowIndex + 1).fill(0));

  probabilityTable[2][1] = 1; // Establish the initial condition or base case for the table

  // Main loop to populate the probability table row by row
  for (let rowIterator = 3; rowIterator <= itemCount + 2; rowIterator++) {
    // Nested loop to calculate values for each column in the current row
    for (let colIterator = 1; colIterator <= rowIterator - 1; colIterator++) {
      // Apply the recurrence relation for calculating probabilities:
      // P(current) = P(success_at_current_item) * P(prev_state_with_one_less_success)
      //            + P(failure_at_current_item) * P(prev_state_with_same_success_count)
      probabilityTable[rowIterator][colIterator] =
        successProbs[rowIterator - 3] * probabilityTable[rowIterator - 1][colIterator - 1] +
        (1 - successProbs[rowIterator - 3]) * probabilityTable[rowIterator - 1][colIterator];
    }
  }

  var totalProbability = 0; // Accumulator for the final desired probability sum

  // Sum up probabilities from the last relevant row of the table based on specific criteria
  for (let resultIterator = (itemCount + 3) / 2; resultIterator <= itemCount + 1; resultIterator++) {
    totalProbability += probabilityTable[itemCount + 2][resultIterator];
  }

  console.log(totalProbability); // Display the computed total probability

}) // End of the immediately invoked function expression
(
  require('fs') // Node.js file system module
    .readFileSync('/dev/stdin', 'utf8') // Read the entire content of standard input as a UTF-8 string
);