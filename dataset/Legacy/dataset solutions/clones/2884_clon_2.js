// This module provides a utility for parsing input data from a string.
var INPUT_PARSER_FACTORY = (function() {
  /**
   * Creates a new input parser instance.
   * @param {string} inputString - The raw input content as a single string.
   * @returns {InputParser} A new parser object.
   */
  function createParser(inputString) {
    return new InputParser(inputString);
  }

  /**
   * Constructor for the InputParser.
   * @param {string} rawInputContent - The full input string.
   */
  function InputParser(rawInputContent) {
    // Split the input into lines and store them.
    this._linesData = rawInputContent.trim().split("\n");
    // Initialize the current line index.
    this._currentLineIndex = 0;
  }

  /**
   * Reads a single "atom" (number or string) from the current line.
   * If the current line is exhausted, it moves to the next line.
   * @param {boolean} returnAsString - If true, returns the value as a string; otherwise, as a number.
   * @returns {string|number} The extracted atom.
   */
  InputParser.prototype.readAtom = function(returnAsString) {
    var lineData = this._linesData;
    var lineIdx = this._currentLineIndex;
    var extractedValue;

    // If the current line hasn't been split into individual atoms yet, do so.
    // Atoms are assumed to be space-separated and read in reverse order for pop efficiency.
    if (typeof lineData[lineIdx] === "string") {
      lineData[lineIdx] = lineData[lineIdx].split(" ").reverse();
    }

    // Extract the last atom from the current line's array.
    extractedValue = lineData[lineIdx].pop();

    // If the current line is now empty, advance to the next line.
    if (!lineData[lineIdx].length) {
      this._currentLineIndex++;
    }

    // Return the value, converting to number if not requested as string.
    return returnAsString ? extractedValue : +extractedValue;
  };

  /**
   * Reads an entire line as an array of values.
   * @param {boolean} asStringArray - If true, returns array of strings; otherwise, array of numbers.
   * @returns {Array<string|number>} An array of values from the line.
   */
  InputParser.prototype.readLine = function(asStringArray) {
    // Get the current line, split it by spaces, and advance the line index.
    var lineValues = this._linesData[this._currentLineIndex++].split(" ");
    // Return as strings or convert to numbers.
    return asStringArray ? lineValues : lineValues.map(item => +item);
  };

  /**
   * Reads a block of 'numRows' lines as a 2D array (matrix).
   * @param {number} numRows - The number of rows to read.
   * @param {boolean} asStringMatrix - If true, returns matrix of strings; otherwise, matrix of numbers.
   * @returns {Array<Array<string|number>>} The 2D array.
   */
  InputParser.prototype.readMatrix = function(numRows, asStringMatrix) {
    // Slice the relevant lines and advance the line index.
    var resultMatrix = this._linesData.slice(this._currentLineIndex, this._currentLineIndex += numRows)
      .map(rowStr => rowStr.split(" ")); // Split each row into cells.

    // Return as strings or convert all cells to numbers.
    return asStringMatrix ? resultMatrix : resultMatrix.map(row => row.map(cellStr => +cellStr));
  };

  /**
   * Reads a block of 'count' lines as a 1D array of raw line strings or numbers.
   * @param {number} count - The number of lines to read.
   * @param {boolean} keepStrings - If true, returns array of strings; otherwise, array of numbers.
   * @returns {Array<string|number>} An array of lines.
   */
  InputParser.prototype.readRawLines = function(count, keepStrings) {
    // Slice the relevant lines and advance the line index.
    var rawLines = this._linesData.slice(this._currentLineIndex, this._currentLineIndex += count);
    // Return as strings or convert to numbers.
    return keepStrings ? rawLines : rawLines.map(lineVal => +lineVal);
  };

  return createParser;
})();

// Initialize the input reader by reading from standard input.
var inputReader = INPUT_PARSER_FACTORY(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array initialized with a given value.
 * This function uses eval, which can be a security risk if 'initialValue' comes from untrusted sources.
 * @param {*} initialValue - The value to initialize array elements with.
 * @returns {Array} The created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  var argsList = arguments;
  var argCount = argsList.length;
  // Build the array creation string from innermost to outermost dimension.
  var arrayCreationString = "Array(argsList[" + --argCount + "]).fill(0).map(_element=>{return " + initialValue + ";})";
  while (--argCount) {
    arrayCreationString = "Array(argsList[" + argCount + "]).fill(0).map(_=>{return " + arrayCreationString + "})";
  }
  // Execute the string to create the array.
  return eval(arrayCreationString);
}

// Output the result of the main computation.
console.log(computeOptimalValue());

/**
 * Main function to solve the problem.
 * It calculates an optimal value based on input data using a binary search approach.
 * @returns {number} The calculated optimal value.
 */
function computeOptimalValue() {
  // Read problem parameters.
  var itemCount = inputReader.readAtom(); // N
  var capacityLimit = inputReader.readAtom(); // X
  var itemDetails = inputReader.readMatrix(itemCount); // B (N rows)

  var totalInitialSum = 0; // S

  // Process each item to calculate additional properties and update total sum.
  for (var idx = 0; idx < itemCount; idx++) {
    var baseCost = itemDetails[idx][0] * itemDetails[idx][1]; // t = b[i][0]*b[i][1]
    var extraCostPerUnit = (capacityLimit - itemDetails[idx][0]) * itemDetails[idx][2]; // a = (x-b[i][0])*b[i][2]
    totalInitialSum += baseCost; // S += t
    // Append calculated values: extraCostPerUnit, baseCost, totalCost (extraCostPerUnit + baseCost)
    itemDetails[idx].push(extraCostPerUnit, baseCost, extraCostPerUnit + baseCost);
  }

  // Sort items by their total cost in descending order.
  // itemDetails[i][5] holds the totalCost (a+t)
  itemDetails.sort((itemA, itemB) => itemB[5] - itemA[5]);

  // Binary search for the optimal value.
  var upperBound = itemCount * capacityLimit; // ok = N*X
  var lowerBound = -1; // ng = -1

  while (upperBound - lowerBound > 1) {
    var midpointValue = Math.floor((upperBound + lowerBound) / 2); // m
    var currentSum = totalInitialSum; // u = S
    var remainingCapacity = midpointValue; // k = m
    var capacityRemainder = midpointValue % capacityLimit; // z = m % X

    var maxSingleItemCost = 0; // u0 = 0
    var maxCostItemIndex = 0; // i0 = 0

    // Find the item that yields the maximum cost for the 'capacityRemainder'.
    for (var idx = 0; idx < itemCount; idx++) {
      var singleItemCost; // u1
      if (capacityRemainder < itemDetails[idx][0]) {
        // If remainder is less than item's base capacity, cost is proportional to remainder.
        singleItemCost = itemDetails[idx][1] * capacityRemainder;
      } else {
        // If remainder is greater or equal, cost includes base cost plus extra cost for excess.
        // itemDetails[idx][4] is baseCost (t)
        // itemDetails[idx][2] is cost per unit beyond base capacity
        singleItemCost = itemDetails[idx][4] + (capacityRemainder - itemDetails[idx][0]) * itemDetails[idx][2];
      }
      // Keep track of the maximum single item cost and its index.
      if (singleItemCost > maxSingleItemCost) {
        maxSingleItemCost = singleItemCost;
        maxCostItemIndex = idx;
      }
    }

    // Iterate through items to adjust the current sum based on remaining capacity.
    for (var idx = 0; idx < itemCount && remainingCapacity > 0 && currentSum > 0; idx++) {
      if (capacityLimit <= remainingCapacity) {
        // If remaining capacity is enough for a full 'capacityLimit' block, subtract total cost of current item.
        // itemDetails[idx][5] is totalCost (a+t)
        currentSum -= itemDetails[idx][5];
        remainingCapacity -= capacityLimit;
      } else {
        // If remaining capacity is less than 'capacityLimit'.
        if (idx <= maxCostItemIndex) {
          // If the current item is the one that gave maxSingleItemCost, subtract that max cost.
          currentSum -= maxSingleItemCost;
          remainingCapacity = 0; // All remaining capacity is used up.
        } else {
          // If current item is not the max cost item, try to find a better way to use remaining capacity.
          var tempSum = currentSum; // v = u
          // Adjust tempSum by adding back the max cost item's total cost and subtracting current item's total cost,
          // then subtracting the maxSingleItemCost. This is a complex adjustment.
          tempSum += itemDetails[maxCostItemIndex][5] - itemDetails[idx][5] - maxSingleItemCost;
          if (tempSum <= 0) {
            currentSum = tempSum;
            continue; // If this adjustment makes sum non-positive, continue to next item.
          }
          // If tempSum is still positive, iterate further to find the exact cost for the remaining capacity.
          for (tempSum = currentSum; idx < itemCount && tempSum > 0; idx++) {
            tempSum = currentSum; // Reset tempSum for each iteration of this inner loop.
            if (remainingCapacity < itemDetails[idx][0]) {
              // If remaining capacity is less than item's base capacity.
              tempSum -= itemDetails[idx][1] * remainingCapacity;
            } else {
              // If remaining capacity is greater or equal.
              tempSum -= itemDetails[idx][4] + (remainingCapacity - itemDetails[idx][0]) * itemDetails[idx][2];
            }
          }
          currentSum = tempSum; // Update currentSum with the final calculated tempSum.
          remainingCapacity = 0; // All remaining capacity is used.
        }
      }
    }

    // Adjust binary search bounds based on the final currentSum.
    if (currentSum > 0) {
      lowerBound = midpointValue; // If sum is still positive, need a larger midpoint.
    } else {
      upperBound = midpointValue; // If sum is non-positive, this midpoint is achievable or too high.
    }
  }
  return upperBound; // The optimal value.
}
