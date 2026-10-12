"use strict";

/**
 * Custom input parsing utility.
 * Reads tokens from a string, line by line.
 */
function InputProcessor(sourceString, typeConversionFn) {
  // Store the input string split into an array of lines.
  this._sourceLines = sourceString.split("\n");
  // Current column (token) index within the current line.
  this._currentColumnIndex = 0;
  // Current line index.
  this._currentLineIndex = 0;
  // Function to convert parsed tokens (e.g., Number, String).
  this._typeConverter = typeConversionFn || Number;
}

/**
 * Reads the next single token from the input.
 * Advances the internal pointers.
 * @returns {any} The parsed token.
 */
InputProcessor.prototype.readSingleToken = function() {
  const currentLineContent = this._sourceLines[this._currentLineIndex];
  // If no more lines, return undefined.
  if (!currentLineContent) return;

  const tokensOnLine = currentLineContent.trim().split(" ");
  const nextToken = tokensOnLine[this._currentColumnIndex];
  this._currentColumnIndex++;

  // If all tokens on the current line have been read, reset column and advance line.
  if (tokensOnLine.length === this._currentColumnIndex) {
    this._currentColumnIndex = 0;
    this._currentLineIndex++;
  }
  return this._typeConverter(nextToken);
};

/**
 * Reads all tokens from the current line.
 * Advances the internal pointers to the next line.
 * @returns {Array<any>} An array of parsed tokens from the line.
 */
InputProcessor.prototype.readAllLineTokens = function() {
  const currentLineContent = this._sourceLines[this._currentLineIndex];
  // If no more lines, return undefined.
  if (!currentLineContent) return;

  // Reset column index and advance line index.
  this._currentColumnIndex = 0;
  this._currentLineIndex++;
  return currentLineContent.split(" ").map(this._typeConverter);
};

/**
 * Creates a multi-dimensional array initialized with a specific value.
 * @param {Array<number>} dimensionsArray - An array specifying the size of each dimension.
 * @param {any} initialFillValue - The value to initialize all elements with.
 * @returns {Array} The initialized multi-dimensional array.
 */
function initializeMultiDimensionalArray(dimensionsArray, initialFillValue) {
  let currentLayerValue = initialFillValue || 0; // Default to 0 if not provided.

  // Iterate through dimensions in reverse to build the array from innermost to outermost.
  for (let dimIdx = dimensionsArray.length; dimIdx > 0; dimIdx--) {
    const dimensionSize = dimensionsArray[dimIdx - 1];
    // Create an array of the current dimension size, filled with deep copies of the next layer.
    currentLayerValue = Array(dimensionSize).fill().map(() => JSON.parse(JSON.stringify(currentLayerValue)));
  }
  return currentLayerValue;
}

/**
 * Calculates the product of integers from (lowerBound + 1) to upperBound.
 * This is used as a permutation factor in the main algorithm.
 * @param {number} lowerBound - The starting value (exclusive).
 * @param {number} upperBound - The ending value (inclusive).
 * @returns {number} The calculated product.
 */
function computePermutationProduct(lowerBound, upperBound) {
  let productResult = 1;
  for (let iteratorVal = lowerBound + 1; iteratorVal <= upperBound; iteratorVal++) {
    productResult *= iteratorVal;
  }
  return productResult;
}

/**
 * Main function to process input and solve the problem.
 * @param {string} rawInputString - The raw input string from stdin.
 */
function executeSolution(rawInputString) {
  // Initialize the input parser.
  const dataParser = new InputProcessor(rawInputString);

  // Read N and X from the input.
  const totalCount = dataParser.readSingleToken();
  const targetSum = dataParser.readSingleToken();

  // Read N elements into an array.
  const sortedNumbers = [];
  for (let loopIndex = 0; loopIndex < totalCount; loopIndex++) {
    sortedNumbers.push(dataParser.readSingleToken());
  }

  // Sort the elements in ascending order.
  sortedNumbers.sort((valA, valB) => valA - valB);

  // Precompute factorials modulo 1000000007.
  const moduloConstant = 1000000007;
  const moduloFactorials = [1, 1]; // 0! = 1, 1! = 1
  for (let loopIndex = 2; loopIndex <= totalCount; loopIndex++) {
    moduloFactorials[loopIndex] = (moduloFactorials[loopIndex - 1] * loopIndex) % moduloConstant;
  }

  // Initialize a memoization table for dynamic programming.
  // Dimensions: (totalCount + 1) x (targetSum + 1), initialized with -1.
  const memoTable = initializeMultiDimensionalArray([totalCount + 1, targetSum + 1], -1);

  /**
   * Recursive function with memoization to calculate combinations.
   * @param {number} remainingElements - The number of elements remaining to consider.
   * @param {number} currentRemainder - The current remainder value.
   * @returns {number} The calculated result modulo 1000000007.
   */
  function calculateCombinations(remainingElements, currentRemainder) {
    // Check if the result is already in the memoization table.
    if (memoTable[remainingElements][currentRemainder] !== -1) {
      return memoTable[remainingElements][currentRemainder];
    }

    // Base case: if currentRemainder is less than the smallest number,
    // the result is currentRemainder * factorial(remainingElements).
    if (currentRemainder < sortedNumbers[0]) {
      memoTable[remainingElements][currentRemainder] = (currentRemainder * moduloFactorials[remainingElements]) % moduloConstant;
    } else {
      let accumulatedSum = 0;
      let subtractionIndex = 0;

      // Iterate through sortedNumbers as long as they are less than or equal to currentRemainder.
      while (sortedNumbers[subtractionIndex] <= currentRemainder && subtractionIndex < totalCount) {
        // Recursively call for (remainingElements - 1) and the new remainder.
        accumulatedSum += calculateCombinations(remainingElements - 1, currentRemainder % sortedNumbers[subtractionIndex]);
        subtractionIndex += 1;
      }
      // Store the result in the memoization table.
      // The permutation factor is computed based on how many elements were considered in the while loop.
      memoTable[remainingElements][currentRemainder] = (accumulatedSum * computePermutationProduct(subtractionIndex, remainingElements)) % moduloConstant;
    }

    return memoTable[remainingElements][currentRemainder];
  }

  // Output the final calculated result.
  console.log(calculateCombinations(totalCount, targetSum));
}

// Read input from stdin and pass it to the main solution function.
executeSolution(require("fs").readFileSync("/dev/stdin", "utf8"));
