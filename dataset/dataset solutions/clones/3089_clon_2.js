"use strict";

/**
 * Custom input parser class designed to read values from a multi-line string input.
 * It processes the input line by line, and then token by token within each line.
 *
 * @param {string} sourceString - The complete input content as a single string.
 * @param {function} valueParser - An optional function to parse each token (e.g., `Number`, `String`). Defaults to `Number`.
 */
function InputParser(sourceString, valueParser) {
  this._sourceLines = sourceString.split("\n"); // Stores each line of the input as an array element.
  this._currentColumn = 0; // Tracks the current token index within the active line.
  this._currentLine = 0; // Tracks the current line index being processed.
  this._parseFunction = valueParser || Number; // The function used to convert string tokens to their desired type.
}

/**
 * Retrieves and parses the next single value (token) from the input stream.
 * This method automatically advances the internal pointers to the next token or line.
 *
 * @returns {*} The parsed value, or `undefined` if there are no more tokens to read.
 */
InputParser.prototype.getNextValue = function() {
  let lineContent = this._sourceLines[this._currentLine]; // Get the string content of the current line.
  if (!lineContent) {
    return; // If the line is empty or undefined, there's no more input.
  }

  let tokens = lineContent.trim().split(" "); // Split the current line into an array of string tokens.
  let nextToken = tokens[this._currentColumn]; // Extract the token at the current column index.
  this._currentColumn++; // Increment the column pointer to move to the next token.

  // Check if all tokens on the current line have been consumed.
  if (tokens.length === this._currentColumn) {
    this._currentColumn = 0; // Reset column pointer for the new line.
    this._currentLine++; // Advance to the next line.
  }

  return this._parseFunction(nextToken); // Parse the extracted token using the specified function and return it.
};

/**
 * Retrieves and parses all values from the current line as an array.
 * This method consumes the entire current line and advances the internal line pointer.
 *
 * @returns {Array<*>} An array of parsed values from the current line, or `undefined` if no more lines.
 */
InputParser.prototype.getLineValues = function() {
  let lineContent = this._sourceLines[this._currentLine]; // Get the string content of the current line.
  if (!lineContent) {
    return; // If the line is empty or undefined, there's no more input.
  }

  this._currentColumn = 0; // Reset column as the entire line is being consumed.
  this._currentLine++; // Advance to the next line.

  // Split the line into tokens and map each token to its parsed value.
  return lineContent.split(" ").map(this._parseFunction);
};


/**
 * The primary function that orchestrates the problem-solving logic.
 * It reads input, performs calculations, and outputs the final result.
 *
 * @param {string} rawInput - The complete raw input string received from standard input.
 */
function processInput(rawInput) {
  // Initialize an instance of the custom input parser.
  const parserInstance = new InputParser(rawInput);

  // Read the initial problem parameters: N (number of elements) and X (target value).
  const numElements = parserInstance.getNextValue();
  const targetValue = parserInstance.getNextValue();
  
  // Read the array 'S' (dataArray) containing 'N' elements.
  const dataArray = [];
  for (let idx = 0; idx < numElements; idx++) {
    dataArray.push(parserInstance.getNextValue());
  }

  // Sort the 'dataArray' in ascending order, which is crucial for the `calculateCombinations` logic.
  dataArray.sort((valA, valB) => valA - valB);

  // Pre-calculate factorials up to 'numElements' modulo 1000000007.
  // This cache is used in the base case of the recursive function.
  const factorialCache = [1, 1]; // 0! = 1, 1! = 1
  const MODULO_CONSTANT = 1000000007; // The modulo value for all calculations.
  for (let idx = 2; idx <= numElements; idx++) {
    factorialCache[idx] = (factorialCache[idx - 1] * idx) % MODULO_CONSTANT;
  }

  // Initiate the recursive calculation process with the target value and an initial mask
  // where all elements are marked as unselected ("0").
  console.log(calculateCombinations(targetValue, "0".repeat(numElements)));

  /**
   * A recursive function to calculate the number of valid combinations.
   * It explores different ways to reduce `currentRemainder` by selecting elements from `dataArray`.
   *
   * @param {number} currentRemainder - The current value that needs to be reduced.
   * @param {string} selectionMask - A binary string where '1' indicates an element at that index has been selected,
   *                                 and '0' indicates it has not.
   * @returns {number} The total count of valid combinations modulo `MODULO_CONSTANT`.
   */
  function calculateCombinations(currentRemainder, selectionMask) {
    // Base case: If the `currentRemainder` is smaller than the smallest element in `dataArray`,
    // no further reduction is possible using elements from `dataArray`.
    // The remaining '0's in the `selectionMask` represent elements that were not chosen.
    // We multiply `currentRemainder` by the factorial of these unselected elements to account for their permutations.
    if (currentRemainder < dataArray[0]) {
      const unselectedCount = selectionMask.split("").filter(charItem => charItem === "0").length;
      return (currentRemainder * factorialCache[unselectedCount]) % MODULO_CONSTANT;
    }

    // Find the index of the first element in `dataArray` that is greater than or equal to `currentRemainder`.
    // All elements before this `firstLargerIndex` are strictly smaller than `currentRemainder`.
    let firstLargerIndex = 0;
    while (dataArray[firstLargerIndex] < currentRemainder) {
      firstLargerIndex++;
    }

    let totalCombinations = 0; // Accumulator for the sum of combinations found in this branch.

    // Iterate through elements in `dataArray` that are smaller than `currentRemainder`.
    for (let idx = 0; idx < firstLargerIndex; idx++) {
      // Only proceed if the element at `idx` has not been selected yet (i.e., its mask bit is '0').
      if (selectionMask[idx] !== "1") {
        // Create a new `selectionMask` by marking the current element as selected ('1').
        let updatedMaskArray = selectionMask.split("");
        updatedMaskArray[idx] = "1";
        let newSelectionMask = updatedMaskArray.join("");

        // Recursively call `calculateCombinations` with the new remainder (`currentRemainder % dataArray[idx]`)
        // and the updated mask. Add the result to `totalCombinations`.
        totalCombinations += calculateCombinations(currentRemainder % dataArray[idx], newSelectionMask);
        totalCombinations = totalCombinations % MODULO_CONSTANT; // Apply modulo to prevent overflow.
      }
    }
    return totalCombinations; // Return the accumulated count of combinations.
  }
}

// Read the entire content of standard input synchronously and pass it to the main processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
