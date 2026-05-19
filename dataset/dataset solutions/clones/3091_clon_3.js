"use strict";

// Helper function to tokenize a line of input
const tokenizeInputLine = (lineContent) => lineContent.trim().split(" ");

/**
 * Custom Input Parser class for reading values from a string buffer.
 */
class InputParser {
  /**
   * @param {string} sourceString - The entire input as a single string.
   * @param {function} valueParseFunction - Function to parse individual tokens (e.g., Number, String).
   */
  constructor(sourceString, valueParseFunction = Number) {
    this._inputLines = sourceString.split("\n");
    this._currentColumnIndex = 0;
    this._currentLineIndex = 0;
    this._tokenParser = valueParseFunction;
  }

  /**
   * Internal helper to manage line advancement.
   * @param {number} totalTokensInLine - The total number of tokens on the current line.
   * @returns {boolean} True if line was advanced, false otherwise.
   */
  _tryAdvanceLine(totalTokensInLine) {
    if (totalTokensInLine === this._currentColumnIndex) {
      this._currentColumnIndex = 0;
      this._currentLineIndex++;
      return true;
    }
    return false;
  }

  /**
   * Reads the next single value from the input stream.
   * @returns {*} The parsed value, or undefined if end of input.
   */
  readNextValue() {
    const activeLineContent = this._inputLines[this._currentLineIndex];
    if (!activeLineContent) {
      return undefined; // End of input
    }
    const lineTokens = tokenizeInputLine(activeLineContent);
    const tokenString = lineTokens[this._currentColumnIndex];
    this._currentColumnIndex++;
    this._tryAdvanceLine(lineTokens.length);
    return this._tokenParser(tokenString);
  }

  /**
   * Reads all values from the current line and advances to the next line.
   * @returns {Array<*>} An array of parsed values from the line, or undefined if end of input.
   */
  readAllLineValues() {
    const activeLineContent = this._inputLines[this._currentLineIndex];
    if (!activeLineContent) {
      return undefined; // End of input
    }
    this._currentColumnIndex = 0; // Reset column for new line read
    this._currentLineIndex++; // Advance to next line
    return tokenizeInputLine(activeLineContent).map(this._tokenParser);
  }
}

/**
 * Computes factorials modulo a given number up to a specified limit.
 * @param {number} upperLimit - The maximum number for which to compute factorial.
 * @param {number} modulus - The modulus for the factorial calculation.
 * @returns {Array<number>} An array where index i contains i! % modulus.
 */
const precomputeFactorialsMod = (upperLimit, modulus) => {
  const factorialValues = new Array(upperLimit + 1);
  factorialValues[0] = 1;
  factorialValues[1] = 1;
  for (let i = 2; i <= upperLimit; i++) {
    factorialValues[i] = (factorialValues[i - 1] * i) % modulus;
  }
  return factorialValues;
};

/**
 * Main function to process the input and solve the problem.
 * @param {string} inputData - The raw input string.
 */
function processInputData(inputData) {
  const dataReader = new InputParser(inputData);
  const MODULO_VALUE = 1000000007;

  const totalElements = dataReader.readNextValue();
  const targetSumValue = dataReader.readNextValue();
  
  // Populate the array of divisors using Array.from
  const sortedDivisorArray = Array.from({ length: totalElements }, () => dataReader.readNextValue());

  // Ensure divisors are sorted for the algorithm
  sortedDivisorArray.sort((a, b) => a - b);

  // Precompute factorials to avoid redundant calculations
  const cachedFactorials = precomputeFactorialsMod(totalElements, MODULO_VALUE);

  /**
   * Recursive function to calculate combinations based on current value and remaining count.
   * @param {number} currentWorkingValue - The current value being processed.
   * @param {number} remainingItemCount - The number of items yet to be considered.
   * @returns {number} The calculated result.
   */
  const calculateRecursiveCombinations = (currentWorkingValue, remainingItemCount) => {
    // Guard clause for base case: if current value is less than the smallest divisor
    if (currentWorkingValue < sortedDivisorArray[0]) {
      // Strictly preserving original behavior: original code did not apply modulo here.
      return currentWorkingValue * cachedFactorials[remainingItemCount];
    }

    // Find the index where divisors are no longer smaller than currentWorkingValue
    let splitBoundaryIndex = 0;
    // Using a for loop with break for finding the split point, equivalent to original while loop
    for (let i = 0; i < totalElements; i++) {
        if (sortedDivisorArray[i] >= currentWorkingValue) {
            splitBoundaryIndex = i;
            break;
        }
        splitBoundaryIndex = i + 1; // If loop completes, splitBoundaryIndex will be totalElements
    }

    let cumulativeResult = 0;
    for (let i = 0; i < splitBoundaryIndex; i++) {
      const divisorElement = sortedDivisorArray[i];
      const nextRemainder = currentWorkingValue % divisorElement;
      const decrementedCount = remainingItemCount - 1;
      
      const subProblemResult = calculateRecursiveCombinations(nextRemainder, decrementedCount);
      cumulativeResult = (cumulativeResult + subProblemResult) % MODULO_VALUE;
    }
    // Modulo is applied within the loop, so no final modulo is needed here.
    return cumulativeResult;
  };

  // Determine the final output based on the first divisor
  const finalComputedOutput = (sortedDivisorArray[0] === 1) 
    ? 0 
    : calculateRecursiveCombinations(targetSumValue, totalElements);
  
  console.log(finalComputedOutput);
}

// Read input from stdin and pass to the main processing function
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
