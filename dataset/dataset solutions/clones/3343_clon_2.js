// This module provides utilities for parsing input data streams.
var STREAM_READER = (function () {
  /**
   * Factory function to create a new data stream parser.
   * @param {string} inputString - The raw string data to parse.
   * @returns {StreamProcessor} An instance of the stream processor.
   */
  function makeStream(inputString) {
    return new StreamProcessor(inputString);
  }

  /**
   * Represents a processor for reading data from a string stream.
   * @class
   * @param {string} inputString - The string content to be processed.
   */
  function StreamProcessor(inputString) {
    // Stores all lines of the input, split by newline.
    this._linesData = inputString.trim().split('\n');
    // Keeps track of the current line index being read.
    this._currentLineIdx = 0;
  }

  /**
   * Reads a single token from the current line.
   * If it's the first read from a line, the line is reversed.
   * @param {boolean} [asString=false] - If true, return the token as a string; otherwise, as a number.
   * @returns {string|number} The parsed token.
   */
  StreamProcessor.prototype.readToken = function (asString) {
    var linesRef = this._linesData;
    var lineIndex = this._currentLineIdx;
    var resultVal;

    // If the current line hasn't been processed into tokens yet, do so.
    if (typeof linesRef[lineIndex] === 'string') {
      linesRef[lineIndex] = linesRef[lineIndex].split(' ').reverse();
    }

    // Pop the last token (which is the first after reversal).
    resultVal = linesRef[lineIndex].pop();

    // If the current line is now empty, advance to the next line.
    if (!linesRef[lineIndex].length) {
      this._currentLineIdx++;
    }

    // Return as string or convert to number based on the flag.
    return asString ? resultVal : Number(resultVal);
  };

  /**
   * Reads an entire line and splits it into tokens.
   * @param {boolean} [asString=false] - If true, return tokens as strings; otherwise, as numbers.
   * @returns {Array<string|number>} An array of parsed tokens from the line.
   */
  StreamProcessor.prototype.readLine = function (asString) {
    // Get the current line and advance the line index.
    var lineTokens = this._linesData[this._currentLineIdx++].split(' ');
    // Return tokens as strings or convert them to numbers.
    return asString ? lineTokens : lineTokens.map(item => Number(item));
  };

  /**
   * Reads a block of 'count' lines, splitting each into tokens.
   * @param {number} count - The number of lines to read.
   * @param {boolean} [asString=false] - If true, return tokens as strings; otherwise, as numbers.
   * @returns {Array<Array<string|number>>} A 2D array of parsed tokens.
   */
  StreamProcessor.prototype.readMatrix = function (count, asString) {
    // Extract a slice of lines and advance the index.
    var matrixBlock = this._linesData.slice(
      this._currentLineIdx,
      (this._currentLineIdx += count)
    ).map(line => line.split(' '));

    // Return as string matrix or convert all elements to numbers.
    return asString ?
      matrixBlock :
      matrixBlock.map(row => row.map(item => Number(item)));
  };

  /**
   * Reads a block of 'count' lines as raw strings.
   * @param {number} count - The number of lines to read.
   * @param {boolean} [asString=false] - If true, return raw strings; otherwise, attempt to convert to numbers.
   * @returns {Array<string|number>} An array of raw lines or converted numbers.
   */
  StreamProcessor.prototype.readBlock = function (count, asString) {
    // Extract a slice of lines and advance the index.
    var rawLines = this._linesData.slice(
      this._currentLineIdx,
      (this._currentLineIdx += count)
    );
    // Return as raw strings or convert to numbers.
    return asString ? rawLines : rawLines.map(item => Number(item));
  };

  return makeStream;
})();

// Initialize the data gateway by reading from standard input.
var dataGateway = STREAM_READER(require('fs').readFileSync('/dev/stdin', 'utf8'));

/**
 * Creates a multi-dimensional array initialized with a specific value.
 * @param {*} initialValue - The value to fill the array with.
 * @param {...number} dimensions - The dimensions of the array (e.g., width, height).
 * @returns {Array} The newly created multi-dimensional array.
 */
function initMultiArray(initialValue) {
  var dimensions = arguments;
  var dimCount = dimensions.length;
  var arrayCreationExpr = `Array(dimensions[${--dimCount}]).fill(initialValue)`;

  // Construct the nested Array.fill.map expression string.
  while (--dimCount) {
    arrayCreationExpr = `Array(dimensions[${dimCount}]).fill(0).map(_ => ${arrayCreationExpr})`;
  }

  // Evaluate the constructed string to create the array.
  return eval(arrayCreationExpr);
}

// Execute the main program logic and output the result.
console.log(runMainLogic());

/**
 * The main entry point for the program's logic.
 * Reads input values and delegates to the solver function.
 * @returns {number} The result from the solver function.
 */
function runMainLogic() {
  // Read the total number of elements.
  var totalElements = dataGateway.readToken();
  // Read the initial array of values.
  var elementValues = dataGateway.readLine();
  // Call the core solving function with the input data.
  return determineOptimalPath(totalElements, elementValues);
}

/**
 * Solves a dynamic programming problem to determine the minimum cost path.
 * This appears to be a variation of matrix chain multiplication or a similar optimization problem.
 * @param {number} itemCount - The number of items or elements.
 * @param {Array<number>} initialValues - The initial array of values.
 * @returns {number} The calculated minimum cost.
 */
function determineOptimalPath(itemCount, initialValues) {
  // Initialize a 2D array to store subproblem costs (cumulative sums of initial values).
  var subproblemCosts = initMultiArray(0, itemCount, itemCount);

  // Populate the first row of the subproblemCosts matrix with initial values.
  for (var rowIdx = 0; rowIdx < itemCount; rowIdx++) {
    subproblemCosts[0][rowIdx] = initialValues[rowIdx];
  }

  // Calculate costs for larger subproblems.
  // The outer loop iterates through the 'length' of the subproblem (i.e., number of items - 1).
  for (var rowIdx = 1; rowIdx < itemCount; rowIdx++) {
    // The inner loop iterates through the starting index of the subproblem.
    for (var colIdx = 0; colIdx < itemCount - rowIdx; colIdx++) {
      // Calculate the cost for the current subproblem based on smaller subproblems.
      subproblemCosts[rowIdx][colIdx] = subproblemCosts[rowIdx - 1][colIdx] + subproblemCosts[0][rowIdx + colIdx];
    }
  }

  // Initialize a DP table with a very large value (representing infinity).
  // This table will store the minimum cost to solve a subproblem.
  var memoTable = initMultiArray(Number.MAX_SAFE_INTEGER, itemCount, itemCount);
  // The base cases: cost for a single element is 0.
  memoTable[0] = initMultiArray(0, itemCount);

  // Fill the DP table using a bottom-up approach.
  // 'rowIdx' represents the length of the interval minus one.
  for (var rowIdx = 1; rowIdx < itemCount; rowIdx++) {
    // 'colIdx' represents the starting index of the interval.
    for (var colIdx = 0; colIdx < itemCount - rowIdx; colIdx++) {
      // 'splitPoint' represents the splitting point within the interval.
      for (var splitPoint = 1; splitPoint <= rowIdx; splitPoint++) {
        // Calculate a potential minimum cost for the current subproblem.
        var tempCost =
          memoTable[rowIdx - splitPoint][colIdx] + // Cost of the left part
          memoTable[splitPoint - 1][rowIdx - splitPoint + colIdx + 1] + // Cost of the right part
          subproblemCosts[rowIdx][colIdx]; // Cost to combine these parts

        // Update the memoTable if a smaller cost is found.
        if (tempCost < memoTable[rowIdx][colIdx]) {
          memoTable[rowIdx][colIdx] = tempCost;
        }
      }
    }
  }

  // The final result is the minimum cost for the entire range (from 0 to itemCount-1).
  return memoTable[itemCount - 1][0];
}