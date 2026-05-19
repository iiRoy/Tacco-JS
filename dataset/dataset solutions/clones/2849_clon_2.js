var INPUT_PARSER = (function() {
  // This function serves as a factory for creating input stream parsers.
  function createParser(sourceString) {
    return new DataStream(sourceString);
  }

  // The DataStream class manages the parsing of input lines.
  function DataStream(sourceString) {
    // Store the input string, trimmed and split into an array of lines.
    this._sourceLines = sourceString.trim().split('\n');
    // Initialize the index for the current line being processed.
    this._currentLineIndex = 0x0;
  }

  // Prototype methods for the DataStream class.
  DataStream.prototype.readNextValue = function(returnAsString) {
    var lineData = this._sourceLines,
      lineIndex = this._currentLineIndex,
      extractedItem;

    // If the current line is still a string, convert it to an array of space-separated values, reversed.
    // Reversing allows efficient popping from the end to get values in original order.
    if (typeof lineData[lineIndex] === 'string') {
      lineData[lineIndex] = lineData[lineIndex].split(' ').reverse();
    }

    // Extract the next value from the current line.
    extractedItem = lineData[lineIndex].pop();

    // If the current line is now empty, advance to the next line.
    if (!lineData[lineIndex].length) {
      this._currentLineIndex++;
    }

    // Return the extracted item, either as a string or converted to a number.
    return returnAsString ? extractedItem : +extractedItem;
  };

  DataStream.prototype.readLineOfValues = function(returnAsString) {
    // Get the current line, split it by spaces, and then increment the line index.
    var lineData = this._sourceLines[this._currentLineIndex++].split(' ');
    // Return the array of values, either as strings or converted to numbers.
    return returnAsString ? lineData : lineData.map(element => +element);
  };

  DataStream.prototype.readMatrix = function(numberOfLines, returnAsString) {
    // Extract a slice of lines, then map each line to an array of its space-separated values.
    var extractedData = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numberOfLines).map(element => element.split(' '));
    // Return the matrix, either as strings or with all elements converted to numbers.
    return returnAsString ? extractedData : extractedData.map(element => element.map(subElement => +subElement));
  };

  DataStream.prototype.readRawLines = function(numberOfLines, returnAsString) {
    // Extract a slice of raw lines.
    var extractedData = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numberOfLines);
    // Return the array of lines, either as strings or converted to numbers.
    return returnAsString ? extractedData : extractedData.map(element => +element);
  };

  return createParser;
})();

// Initialize the input reader by parsing the content of standard input.
var inputReader = INPUT_PARSER(require('fs').readFileSync('/dev/stdin', 'utf8'));

/**
 * Dynamically creates a multi-dimensional array initialized with a specified value.
 * This function uses `eval` to construct the array creation logic.
 * @param {*} initialValue - The value to fill the array elements with.
 * @param {...number} dimensions - The sizes of each dimension for the array.
 * @returns {Array} The newly created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  var dimensions = arguments,
    dimCount = dimensions.length,
    // Start building the string for the innermost array.
    arrayCreationString = 'Array(dimensions[' + --dimCount + ']).fill(0x0).map(x=>{return ' + initialValue + ';})';

  // Loop to build the string for outer dimensions, nesting the array creation.
  while (--dimCount) {
    arrayCreationString = 'Array(dimensions[' + dimCount + ']).fill(0x0).map(x=>' + arrayCreationString + ')';
  }

  // Evaluate the constructed string to create and return the array.
  return eval(arrayCreationString);
}

// Execute the main logic of the program and print its return value to the console.
console.log(executeMainLogic());

/**
 * The primary function that orchestrates the problem-solving process.
 * It reads input, processes it in two phases, and returns a final calculated value.
 * @returns {number} The ultimate maximized value after all calculations.
 */
function executeMainLogic() {
  // Read the initial budget or value 'N'.
  var initialNValue = inputReader.readNextValue();
  // Read two arrays, 'A' and 'B', from the input.
  var firstArray = inputReader.readLineOfValues();
  var secondArray = inputReader.readLineOfValues();

  // First phase: Identify pairs where A[i] < B[i].
  // These represent operations where the cost (A[i]) is less than the gain (B[i]).
  var tempCosts = [],
    tempGains = [];
  for (var loopIndex = 0x0; loopIndex < 0x3; loopIndex++) {
    if (firstArray[loopIndex] < secondArray[loopIndex]) {
      tempCosts.push(firstArray[loopIndex]);
      tempGains.push(secondArray[loopIndex]);
    }
  }

  // Calculate the maximized value using the first set of costs and gains.
  var firstResult = calculateMaximizedValue(initialNValue, tempCosts, tempGains);

  // Reset temporary arrays for the second phase.
  tempCosts = [];
  tempGains = [];
  // Second phase: Identify pairs where B[i] < A[i].
  // These represent operations where the cost (B[i]) is less than the gain (A[i]).
  for (var loopIndex = 0x0; loopIndex < 0x3; loopIndex++) {
    if (secondArray[loopIndex] < firstArray[loopIndex]) {
      tempCosts.push(secondArray[loopIndex]);
      tempGains.push(firstArray[loopIndex]);
    }
  }

  // Calculate the final maximized value using the result from the first phase
  // as the new budget, and the second set of costs and gains.
  return calculateMaximizedValue(firstResult, tempCosts, tempGains);
}

/**
 * Calculates the maximum achievable value given an initial budget and arrays of costs and gains.
 * This function employs a dynamic programming approach to solve a variation of the knapsack problem.
 * @param {number} currentBudget - The starting budget or current value.
 * @param {number[]} costs - An array where each element is the cost of an operation.
 * @param {number[]} gains - An array where each element is the gain from an operation.
 * @returns {number} The highest possible value that can be achieved.
 */
function calculateMaximizedValue(currentBudget, costs, gains) {
  var numItems = costs.length;

  // If there are no items/operations, the budget remains unchanged.
  if (numItems === 0x0) {
    return currentBudget;
  }

  // Special case for a single item: apply the operation as many times as possible.
  if (numItems === 0b1) {
    var numOperations = currentBudget / costs[0x0] | 0x0; // Integer division to find max operations.
    currentBudget -= numOperations * costs[0x0]; // Deduct total cost.
    currentBudget += numOperations * gains[0x0]; // Add total gain.
    return currentBudget;
  }

  // Dynamic Programming approach for multiple items.
  // `memoizationTable[j]` will store the maximum value achievable if `j` units of cost are spent.
  var memoizationTable = Array(currentBudget + 0b1);
  memoizationTable[0x0] = currentBudget; // If 0 cost is spent, the value is the initial budget.

  // Iterate through each available item/operation.
  for (var itemIndex = 0x0; itemIndex < numItems; itemIndex++) {
    var itemCost = costs[itemIndex],
      itemGain = gains[itemIndex];

    // Iterate through possible budget points, from the current item's cost up to the total budget.
    // This ensures we only consider states where the item can actually be "bought".
    for (var currentBudgetPoint = itemCost; currentBudgetPoint <= currentBudget; currentBudgetPoint++) {
      // If the state `currentBudgetPoint - itemCost` was not reachable (undefined), skip this path.
      if (memoizationTable[currentBudgetPoint - itemCost] === void 0) {
        continue;
      }

      // Calculate the potential new value if we use the current item.
      // It's the value from the previous state plus the gain minus the cost of the current item.
      var calculatedValue = memoizationTable[currentBudgetPoint - itemCost] + itemGain - itemCost;

      // Update the DP table: if the current state `currentBudgetPoint` is undefined
      // or if the `calculatedValue` is greater than the existing value, update it.
      if (memoizationTable[currentBudgetPoint] === void 0 || memoizationTable[currentBudgetPoint] < calculatedValue) {
        memoizationTable[currentBudgetPoint] = calculatedValue;
      }
    }
  }

  // After filling the DP table, find the maximum value within a relevant range.
  // The maximum value might not necessarily be at `memoizationTable[currentBudget]`.
  var maxValueFound = currentBudget;
  // Search from `max(0, currentBudget - 5000)` up to `currentBudget`.
  // The `5e3` constant suggests a heuristic or problem-specific constraint.
  for (var itemIndex = Math.max(0x0, currentBudget - 5e3); itemIndex <= currentBudget; itemIndex++) {
    // Ensure `memoizationTable[itemIndex]` is not undefined before comparison.
    if (memoizationTable[itemIndex] !== void 0 && maxValueFound < memoizationTable[itemIndex]) {
      maxValueFound = memoizationTable[itemIndex];
    }
  }

  return maxValueFound;
}
