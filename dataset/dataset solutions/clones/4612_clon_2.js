function parseInteger(textString) {
  // Converts a string to an integer.
  return parseInt(textString, 10);
}

function parseFloatValue(textString) {
  // Converts a string to a floating-point number.
  return parseFloat(textString);
}

// Extend Array prototype with custom sorting and filtering methods.
Array.prototype.sortNumbersAscending = function () {
  // Sorts array elements numerically in ascending order.
  return this.sort((firstVal, secondVal) => (firstVal - secondVal));
};

Array.prototype.sortNumbersDescending = function () {
  // Sorts array elements numerically in descending order.
  return this.sort((firstVal, secondVal) => (secondVal - firstVal));
};

Array.prototype.sortStringsAscending = function () {
  // Sorts array elements as strings in ascending order.
  return this.sort();
};

Array.prototype.sortStringsDescending = function () {
  // Sorts array elements as strings in descending order.
  return this.sort().reverse();
};

Array.prototype.filterOutElement = function (targetItem) {
  // Returns a new array with all occurrences of targetItem removed.
  return this.filter((currentElement) => currentElement !== targetItem);
};

// Buffer for incoming standard input data.
let rawDataBuffer = '';

// Resume standard input stream and set encoding.
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Event listener for data chunks from stdin.
process.stdin.on('data', (dataSegment) => {
  rawDataBuffer += dataSegment;
});

// Event listener for the end of stdin stream.
process.stdin.on('end', () => {
  // Split input into lines and trim whitespace from each.
  let processedLines = rawDataBuffer.split('\n').map(currentLineText => currentLineText.trim());

  // Remove the last line if it's empty (common with stdin).
  if (processedLines[processedLines.length - 1] === '') {
    processedLines = processedLines.slice(0, -1);
  }

  // Execute the primary logic with the prepared input lines.
  executeMainLogic(processedLines);
});

/**
 * Main function to process input and solve the problem.
 * @param {string[]} inputDataRows - An array of strings, each representing a line of input.
 */
function executeMainLogic(inputDataRows) {
  // Parse the first line for N (total items) and W (max weight capacity).
  const initialParams = inputDataRows[0].split(' ').map(parseInteger);
  const totalItemsCount = initialParams[0];
  const maxCapacityWeight = initialParams[1];

  // Initialize the maximum value found so far.
  let maxValueAchieved = 0;

  // Process the remaining lines to get item weights and values.
  // Each line is an array [weight, value].
  inputDataRows = inputDataRows.slice(1).map(itemDescription => itemDescription.split(' ').map(parseInteger));

  /**
   * Recursive function to explore combinations of items.
   * This implements a backtracking approach for a knapsack-like problem.
   * @param {number} currentItemIndex - The index of the item to start considering in the current iteration.
   * @param {number} currentAccumulatedWeight - The total weight accumulated so far in the current path.
   * @param {number} currentAccumulatedValue - The total value accumulated so far in the current path.
   * @param {number} itemsConsideredCount - The number of items considered in the current path (for base case).
   */
  function exploreCombinations(currentItemIndex, currentAccumulatedWeight, currentAccumulatedValue, itemsConsideredCount) {
    // Base case: If all items have been considered, output the result and exit.
    // This specific problem structure implies an early exit if a solution is found
    // that covers all N items, but the problem statement suggests it's a search.
    // The original code has an early exit here, which is unusual for a typical knapsack
    // where you'd want to find the max value after exploring all paths.
    // Preserving original behavior: if itemsConsideredCount reaches totalItemsCount, it exits.
    // This implies N is a target number of items, not just the total available.
    // However, the loop `i < l` where `l = N` suggests N is the total available items.
    // The `x === N` condition combined with `process.exit(0)` is a critical behavioral detail.
    if (itemsConsideredCount === totalItemsCount) {
      console.log(maxValueAchieved);
      process.exit(0); // Exit immediately upon finding a path that uses N items.
    }

    // Iterate through available items starting from currentItemIndex.
    for (let loopIndex = currentItemIndex, loopLimit = totalItemsCount; loopIndex < loopLimit; loopIndex++) {
      const itemWeight = inputDataRows[loopIndex][0];
      const itemValue = inputDataRows[loopIndex][1];

      // Check if adding the current item exceeds the maximum capacity.
      if (itemWeight + currentAccumulatedWeight <= maxCapacityWeight) {
        // If not, update the maximum value achieved.
        maxValueAchieved = Math.max(maxValueAchieved, itemValue + currentAccumulatedValue);

        // Recursively call with the next item, updated weight, value, and item count.
        exploreCombinations(
          loopIndex + 1,
          itemWeight + currentAccumulatedWeight,
          itemValue + currentAccumulatedValue,
          itemsConsideredCount + 1
        );
      }
    }
  }

  // Start the recursive exploration from the beginning with initial values.
  exploreCombinations(0, 0, 0, 0);

  // If the program reaches here, it means no path resulted in `itemsConsideredCount === totalItemsCount`
  // that triggered an early exit. In this case, print the maximum value found.
  console.log(maxValueAchieved);
}
