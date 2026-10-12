// Function to parse a string into an integer value.
function parseInteger(inputString) {
  return parseInt(inputString);
}

// Function to parse a string into a floating-point number.
function parseFloatValue(inputString) {
  return parseFloat(inputString);
}

// Extend the Array prototype with a method to sort numbers in ascending order.
Array.prototype.orderNumbersAscending = function () {
  return this.sort((firstElement, secondElement) => (firstElement - secondElement));
};

// Extend the Array prototype with a method to sort numbers in descending order.
Array.prototype.orderNumbersDescending = function () {
  return this.sort((firstElement, secondElement) => (secondElement - firstElement));
};

// Extend the Array prototype with a method to sort strings in ascending order.
Array.prototype.orderStringsAscending = function () {
  return this.sort();
};

// Extend the Array prototype with a method to sort strings in descending order.
Array.prototype.orderStringsDescending = function () {
  return this.sort().reverse();
};

// Extend the Array prototype with a method to filter out a specific item.
Array.prototype.excludeItem = function (targetItem) {
  return this.filter((currentElement) => currentElement !== targetItem);
};

// Buffer to store all incoming standard input data.
let rawDataBuffer = '';

// Resume standard input stream and set encoding.
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Event handler for receiving data chunks from stdin.
process.stdin.on('data', (dataSegment) => {
  rawDataBuffer += dataSegment;
});

// Event handler for the end of the stdin stream.
process.stdin.on('end', () => {
  // Split the accumulated data into individual lines and remove leading/trailing whitespace.
  let processedLines = rawDataBuffer.split('\n').map(currentLine => currentLine.trim());

  // If the last line is empty, remove it (common with stdin input).
  if (processedLines[processedLines.length - 1] === '') {
    processedLines = processedLines.slice(0, -1);
  }

  // Invoke the primary execution function with the prepared input lines.
  executeProgram(processedLines);
});

/**
 * The main function containing the problem-solving logic.
 * @param {string[]} inputRows - An array of strings, where each string is a line from the input.
 */
function executeProgram(inputRows) {
  // Parse the first line to extract the total number of items and the maximum allowed weight.
  const initialParameters = inputRows[0].split(' ').map(parseInteger);
  const totalItems = initialParameters[0];
  const maxWeightCapacity = initialParameters[1];

  // Initialize a variable to keep track of the highest value found.
  let currentMaxValue = 0;

  // Process the remaining input lines to get item weights and values.
  // Each line represents an item with its weight and value.
  const itemDetails = inputRows.slice(1).map(currentLine => currentLine.split(' ').map(parseInteger));

  /**
   * A recursive helper function to explore all possible combinations of items
   * to find the maximum value within the given weight capacity.
   * This uses a backtracking approach.
   * @param {number} itemIndexToConsider - The index of the item to start considering in the current recursion level.
   * @param {number} accumulatedWeight - The sum of weights of items chosen so far.
   * @param {number} accumulatedValue - The sum of values of items chosen so far.
   */
  function exploreCombinations(itemIndexToConsider, accumulatedWeight, accumulatedValue) {
    // Base case: If we have considered all available items.
    if (itemIndexToConsider === totalItems) {
      // Output the final maximum value and terminate the process.
      console.log(currentMaxValue);
      process.exit();
    }

    // Iterate through items starting from the current index.
    for (let currentItemIdx = itemIndexToConsider, loopLimit = totalItems; currentItemIdx < loopLimit; currentItemIdx++) {
      const itemWeight = itemDetails[currentItemIdx][0]; // Weight of the current item.
      const itemValue = itemDetails[currentItemIdx][1];   // Value of the current item.

      // Check if adding the current item would exceed the maximum weight capacity.
      if (itemWeight + accumulatedWeight <= maxWeightCapacity) {
        // If not, update the global maximum value found.
        currentMaxValue = Math.max(currentMaxValue, itemValue + accumulatedValue);
        // Recursively call the function to explore combinations with the next item,
        // including the current item's weight and value.
        exploreCombinations(currentItemIdx + 1, itemWeight + accumulatedWeight, itemValue + accumulatedValue);
      }
    }
  }

  // Initiate the recursive exploration starting from the first item (index 0),
  // with an initial accumulated weight and value of zero.
  exploreCombinations(0, 0, 0);

  // This line serves as a fallback to print the maximum value.
  // In many cases, the process will exit from within the recursive function's base case.
  console.log(currentMaxValue);
}
