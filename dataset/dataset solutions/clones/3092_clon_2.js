"use strict"; // Enforce strict mode for cleaner code.

/**
 * Manages reading structured data from a string.
 * Each line is split into tokens, and tokens are consumed sequentially.
 */
function DataStreamProcessor(textInput, valueConverter) {
  this._sourceLines = textInput.split("\n"); // Store input as an array of lines.
  this._tokenIndex = 0;                     // Current token position within a line.
  this._lineCounter = 0;                    // Current line number.
  this._typeAdapter = valueConverter || Number; // Function to convert tokens to desired type.
}

// Method to fetch the next individual data unit.
DataStreamProcessor.prototype.getNextDatum = function() {
  const currentLineText = this._sourceLines[this._lineCounter]; // Get the current line.
  if (!currentLineText) { // If no more lines, return undefined.
    return undefined;
  }

  const lineTokens = currentLineText.trim().split(" "); // Split line into tokens.
  const extractedToken = lineTokens[this._tokenIndex]; // Get the token at current index.
  this._tokenIndex++; // Advance to the next token.

  // If all tokens in the current line are consumed, move to the next line.
  if (lineTokens.length === this._tokenIndex) {
    this._tokenIndex = 0; // Reset token index for the new line.
    this._lineCounter++;  // Advance to the next line.
  }

  return this._typeAdapter(extractedToken); // Convert and return the token.
};

// Method to read all data units from the current line.
DataStreamProcessor.prototype.readAllLineData = function() {
  let activeLineContent = this._sourceLines[this._lineCounter]; // Retrieve current line.
  if (!activeLineContent) { // If no more lines, return undefined.
    return undefined;
  }
  this._tokenIndex = 0; // Reset token index when reading a whole line.
  this._lineCounter++;  // Advance to the next line after reading.

  return activeLineContent.split(" ").map(this._typeAdapter); // Split and convert all tokens.
};


/**
 * Creates a multi-dimensional array (nested structure) initialized with a default value.
 * Simulates a deep copy for nested arrays.
 * @param {Array<number>} dimensions - An array specifying the size of each dimension.
 * @param {*} initialFillValue - The value to initialize the innermost elements with.
 * @returns {Array} The constructed multi-dimensional array.
 */
function createNestedStructure(dimensions, initialFillValue) {
  let resultMatrix = initialFillValue || 0; // Initialize with default or provided value.

  // Iterate through dimensions in reverse order to build from innermost to outermost.
  for (let dimIdx = dimensions.length; dimIdx > 0; dimIdx--) {
    const currentDimSize = dimensions[dimIdx - 1]; // Get the size of the current dimension.
    // Create an array of 'currentDimSize', fill it, and map each element
    // by deep-copying the 'resultMatrix' (which could be a value or an already-built array).
    resultMatrix = Array(currentDimSize).fill().map(() => JSON.parse(JSON.stringify(resultMatrix)));
  }
  return resultMatrix; // Return the fully constructed nested array.
}

/**
 * Computes the product of a sequence of integers from (lowerBound + 1) to upperBound.
 * Used for specific combinatorial calculations.
 * @param {number} lowerBound - The starting value (exclusive).
 * @param {number} upperBound - The ending value (inclusive).
 * @returns {number} The product of the sequence.
 */
function calculateProductSequence(lowerBound, upperBound) {
  let cumulativeProduct = 1; // Initialize product.
  // Loop from one greater than lowerBound up to upperBound.
  for (let currentFactor = lowerBound + 1; currentFactor <= upperBound; currentFactor++) {
    cumulativeProduct *= currentFactor; // Multiply into the product.
  }

  return cumulativeProduct; // Return the final product.
}

// Define a constant for the modulo operation.
const PRIME_MODULO = 1000000007;

/**
 * Main execution function to process input and compute the final result.
 * @param {string} rawInputContent - The entire input data as a string.
 */
function executeProgram(rawInputContent) {
  // Initialize an input parsing utility.
  const inputReader = new DataStreamProcessor(rawInputContent);

  // Read primary numerical parameters from the input.
  const totalItems = inputReader.getNextDatum();
  const targetValue = inputReader.getNextDatum();
  
  // Read a list of numbers, storing them in an array.
  const numberSequence = [];
  for (let elementIdx = 0; elementIdx < totalItems; elementIdx++) {
    numberSequence.push(inputReader.getNextDatum());
  }

  // Sort the collected numbers in ascending order for efficient processing.
  numberSequence.sort((valA, valB) => valA - valB);

  // Pre-calculate factorials modulo PRIME_MODULO up to 'totalItems'.
  const factorialCache = [1, 1];
  for (let factIdx = 2; factIdx <= totalItems; factIdx++) {
    factorialCache[factIdx] = (factorialCache[factIdx - 1] * factIdx) % PRIME_MODULO;
  }

  // Initialize a 2D memoization table for dynamic programming.
  // Dimensions are (totalItems + 1) x (targetValue + 1), filled with -1 to indicate uncomputed states.
  const memoTable = createNestedStructure([totalItems + 1, targetValue + 1], -1);

  /**
   * Recursive function with memoization to compute the desired value.
   * @param {number} currentDepth - Represents 'k' in the original problem context.
   * @param {number} currentTarget - Represents 'x' in the original problem context.
   * @returns {number} The computed result for the given state.
   */
  function recursiveSolver(currentDepth, currentTarget) {
    // If this state has already been computed, return the cached result.
    if (memoTable[currentDepth][currentTarget] !== -1) {
      return memoTable[currentDepth][currentTarget];
    }

    // Base case: if currentTarget is less than the smallest number in the sequence.
    if (currentTarget < numberSequence[0]) {
      memoTable[currentDepth][currentTarget] = (currentTarget * factorialCache[currentDepth]) % PRIME_MODULO;
    } else {
      let accumulatedSum = 0; // Accumulator for sub-problem results.

      let sequencePointer = 0; // Iterator for the 'numberSequence'.
      // Iterate while numbers in the sequence are less than or equal to currentTarget.
      while (numberSequence[sequencePointer] <= currentTarget && sequencePointer < totalItems) {
        // Recursively solve sub-problems and add to sum.
        accumulatedSum += recursiveSolver(currentDepth - 1, currentTarget % numberSequence[sequencePointer]);
        sequencePointer++; // Move to the next number in the sequence.
      }

      // Compute the final result for this state using the accumulated sum and permutation-like product.
      memoTable[currentDepth][currentTarget] = (accumulatedSum * calculateProductSequence(sequencePointer, currentDepth)) % PRIME_MODULO;
    }

    // Return the computed and cached result.
    return memoTable[currentDepth][currentTarget];
  }

  // Output the final computed result for the main problem (totalItems, targetValue).
  console.log(recursiveSolver(totalItems, targetValue));
}

// Read input from standard in and pass it to the main execution function.
executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));