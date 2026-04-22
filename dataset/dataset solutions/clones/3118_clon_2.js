// This module provides utilities for parsing structured input data.
var DATA_PARSER = (function() {
  /**
   * Factory function to create an input processing instance.
   * @param {string} rawInputText - The entire input as a single string.
   * @returns {LineBasedProcessor} A new input processor instance.
   */
  function createInputProcessor(rawInputText) {
    return new LineBasedProcessor(rawInputText);
  }

  /**
   * Represents an input processor that reads data line by line.
   * @class
   * @param {string} sourceString - The raw string input to process.
   */
  function LineBasedProcessor(sourceString) {
    // Splits the input into an array of lines, removing leading/trailing whitespace.
    this._lineCache = sourceString.trim().split("\n");
    // Keeps track of the current line being processed.
    this._linePointer = 0;
  }

  /**
   * Reads a single element from the current line, popping it off.
   * If the line is exhausted, moves to the next line.
   * @param {boolean} [returnAsString=false] - If true, returns the value as a string; otherwise, as a number.
   * @returns {string|number} The extracted element.
   */
  LineBasedProcessor.prototype.nextElement = function(returnAsString) {
    const cachedLines = this._lineCache;
    let currentLineIdx = this._linePointer;
    let poppedElement;

    // If the current line is still a string, split it into elements and reverse for efficient popping.
    if (typeof cachedLines[currentLineIdx] === "string") {
      cachedLines[currentLineIdx] = cachedLines[currentLineIdx].split(" ").reverse();
    }

    // Pop the last element from the current line's array.
    poppedElement = cachedLines[currentLineIdx].pop();

    // If the current line is now empty, advance the line pointer.
    if (!cachedLines[currentLineIdx].length) {
      this._linePointer++;
    }

    // Return as string or convert to number.
    return returnAsString ? poppedElement : Number(poppedElement);
  };

  /**
   * Reads all elements from the current line and advances the line pointer.
   * @param {boolean} [keepAsStrings=false] - If true, returns elements as strings; otherwise, converts to numbers.
   * @returns {Array<string|number>} An array of elements from the line.
   */
  LineBasedProcessor.prototype.readElementsOnLine = function(keepAsStrings) {
    const splitLine = this._lineCache[this._linePointer++].split(" ");
    return keepAsStrings ? splitLine : splitLine.map(item => Number(item));
  };

  /**
   * Reads a block of 'numRows' lines, treating each line as a row in a matrix.
   * @param {number} numRows - The number of lines (rows) to read.
   * @param {boolean} [preserveStrings=false] - If true, keeps elements as strings; otherwise, converts to numbers.
   * @returns {Array<Array<string|number>>} A 2D array representing the matrix block.
   */
  LineBasedProcessor.prototype.readMatrixBlock = function(numRows, preserveStrings) {
    const extractedBlock = this._lineCache
      .slice(this._linePointer, (this._linePointer += numRows))
      .map(row => row.split(" ")); // Split each line into elements

    return preserveStrings ?
      extractedBlock :
      extractedBlock.map(row => row.map(val => Number(val)));
  };

  /**
   * Reads a block of 'count' lines, treating each line as a single element in a vector.
   * @param {number} count - The number of lines (elements) to read.
   * @param {boolean} [outputAsStrings=false] - If true, keeps elements as strings; otherwise, converts to numbers.
   * @returns {Array<string|number>} An array (vector) of elements.
   */
  LineBasedProcessor.prototype.readVectorBlock = function(count, outputAsStrings) {
    const vectorData = this._lineCache.slice(this._linePointer, (this._linePointer += count));
    return outputAsStrings ? vectorData : vectorData.map(element => Number(element));
  };

  return createInputProcessor;
})();

// Create an input processor instance by reading from standard input.
var dataStream = DATA_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Finds the index of the first element in a sorted array that is greater than a target value.
 * This is a binary search implementation for upper_bound.
 * @param {Array<number>} sortedNumericArray - The sorted array to search within.
 * @param {number} lowerBound - The starting index for the search range.
 * @param {number} upperBound - The ending index for the search range (exclusive).
 * @param {number} targetValue - The value to search for.
 * @returns {number} The index of the first element greater than targetValue, or upperBound if all elements are less than or equal.
 */
function findNextGreaterOrEqualIndex(sortedNumericArray, lowerBound, upperBound, targetValue) {
  let midPointIndex; // Variable to store the middle index during binary search.

  // Continue binary search as long as there are at least two elements in the search range.
  for (; 1 < upperBound - lowerBound;) {
    // Calculate the middle index using bitwise OR for integer truncation.
    midPointIndex = 0 | (lowerBound + upperBound) / 2;
    // If the element at the midpoint is less than or equal to the target,
    // move the lower bound to the midpoint. Otherwise, move the upper bound.
    sortedNumericArray[midPointIndex] <= targetValue ? (lowerBound = midPointIndex) : (upperBound = midPointIndex);
  }

  // After the loop, the range is either 1 or 0 elements.
  // Check the element at the lower bound. If it's less than or equal to the target,
  // the 'upper_bound' is the original upper bound. Otherwise, it's the lower bound.
  return sortedNumericArray[lowerBound] <= targetValue ? upperBound : lowerBound;
}

// Log the result of the graph connectivity analysis to the console.
console.log(analyzeGraphConnectivity());

/**
 * Main function to analyze graph properties based on input.
 * Determines if a graph can be Eulerian and calculates a specific sum.
 * @returns {string} "Yes", "No", or a numeric result.
 */
function analyzeGraphConnectivity() {
  // Read the number of nodes (vertices) from the input.
  const nodeQuantity = dataStream.nextElement();
  // Read the number of edges from the input.
  const edgeQuantity = dataStream.nextElement();

  // Initialize an array to count degrees of each node.
  // Array size is nodeQuantity + 1 to use 1-based indexing for nodes.
  const degreeCounter = Array(nodeQuantity + 1).fill(0);

  // Loop through each edge to populate degree counts.
  for (let loopIndex = 0; loopIndex < edgeQuantity; loopIndex++) {
    // Read the two endpoints of the current edge.
    const currentEdge = dataStream.readElementsOnLine();
    // Increment degree for both connected nodes.
    degreeCounter[currentEdge[0]]++;
    degreeCounter[currentEdge[1]]++;
  }

  // Initialize a variable to accumulate a specific sum.
  let totalDeviation = 0;

  // Iterate through nodes (1-based indexing) to check degree parity and calculate sum.
  for (let loopIndex = 1; loopIndex <= nodeQuantity; loopIndex++) {
    // If any node has an odd degree, the graph cannot be Eulerian.
    // The bitwise AND with 1 checks for oddness.
    if (degreeCounter[loopIndex] & 1) {
      return "No";
    }
    // Accumulate (degree - 2) for each node.
    totalDeviation += degreeCounter[loopIndex] - 2;
  }

  // Based on the accumulated sum, determine the final output.
  // If totalDeviation is 4 or more, return "Yes", otherwise "No".
  return totalDeviation >= 4 ? "Yes" : "No";
}