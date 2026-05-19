/**
 * This module provides an input parsing utility and implements a solution
 * for a connectivity problem using a Disjoint Set Union (DSU) data structure.
 */

/**
 * Constructor function for an input processing utility.
 * It takes a complete input string, typically read from a file or stdin,
 * and provides methods to extract data line by line or value by value.
 * @param {string} rawText - The entire input content as a single string.
 */
function InputProcessor(rawText) {
  // Stores all input lines, split by newline characters.
  this._inputLines = rawText.split("\n");
  // A pointer indicating the current line being processed.
  this._currentLineIndex = 0;
}

// Define methods for the InputProcessor's prototype.
InputProcessor.prototype = {
  /**
   * Extracts a single value from the current line.
   * If the current line contains multiple space-separated values,
   * it processes them from left to right (by reversing and popping).
   * Advances the internal line pointer if the current line becomes empty after extraction.
   * @param {boolean} returnAsString - If true, the value is returned as a string; otherwise, it's converted to a number.
   * @returns {string|number} The extracted value.
   */
  getOne: function(returnAsString) {
    let lineData = this._inputLines;
    let currentPosition = this._currentLineIndex;
    let extractedItem;

    // If the current line is still a raw string, split it into tokens and reverse for easy popping.
    if (typeof lineData[currentPosition] === "string") {
      lineData[currentPosition] = lineData[currentPosition].split(" ").reverse();
    }

    // Retrieve the last element (which was originally the first) from the token array.
    extractedItem = lineData[currentPosition].pop();

    // If all tokens from the current line have been consumed, advance to the next line.
    if (!lineData[currentPosition].length) {
      this._currentLineIndex++;
    }

    // Return the item, converting to a number unless explicitly requested as a string.
    return returnAsString ? extractedItem : +extractedItem;
  },

  /**
   * Reads an entire line of space-separated values.
   * Advances the internal line pointer after reading the line.
   * @param {boolean} returnAsStrings - If true, returns an array of strings; otherwise, an array of numbers.
   * @returns {string[]|number[]} An array containing the values from the read line.
   */
  getLine: function(returnAsStrings) {
    // Split the current line by spaces and then increment the line pointer.
    let lineTokens = this._inputLines[this._currentLineIndex++].split(" ");
    // Return the tokens as strings or map them to numbers.
    return returnAsStrings ? lineTokens : lineTokens.map(val => +val);
  },

  /**
   * Reads a specified number of consecutive lines, parsing each into an array of values.
   * Advances the internal line pointer by the number of lines read.
   * @param {number} numberOfLines - The count of lines to read.
   * @param {boolean} returnAsStrings - If true, returns a 2D array of strings; otherwise, a 2D array of numbers.
   * @returns {string[][]|number[][]} A 2D array where each inner array represents a line's values.
   */
  getMany: function(numberOfLines, returnAsStrings) {
    let sourceData = this._inputLines;
    let startingLine = this._currentLineIndex;
    let resultMatrix = [];
    let lineCounter = 0;

    // Iterate and process each of the specified lines.
    if (returnAsStrings) {
      for (; lineCounter < numberOfLines; lineCounter++) {
        resultMatrix[lineCounter] = sourceData[startingLine + lineCounter].split(" ");
      }
    } else {
      for (; lineCounter < numberOfLines; lineCounter++) {
        resultMatrix[lineCounter] = sourceData[startingLine + lineCounter].split(" ").map(element => +element);
      }
    }

    // Update the line pointer to reflect the lines consumed.
    this._currentLineIndex += numberOfLines;
    return resultMatrix;
  },
};

// Global array used for the Disjoint Set Union (DSU) data structure.
// `parentArray[i]` stores the parent of element `i`.
let parentArray = [];

/**
 * Finds the representative (root) of the set to which `elementIndex` belongs.
 * This function employs path compression for optimized performance.
 * @param {number} elementIndex - The element whose set representative is to be found.
 * @returns {number} The representative of the set containing `elementIndex`.
 */
function findRepresentative(elementIndex) {
  // If an element is its own parent, it is the representative of its set.
  if (parentArray[elementIndex] === elementIndex) {
    return elementIndex;
  }
  // Otherwise, recursively find the representative and update the parent (path compression).
  return parentArray[elementIndex] = findRepresentative(parentArray[elementIndex]);
}

/**
 * Checks if two elements, `nodeA` and `nodeB`, belong to the same disjoint set.
 * @param {number} nodeA - The first element.
 * @param {number} nodeB - The second element.
 * @returns {boolean} True if both elements are in the same set, false otherwise.
 */
function isSameSet(nodeA, nodeB) {
  return findRepresentative(nodeA) === findRepresentative(nodeB);
}

/**
 * Merges the sets containing `itemA` and `itemB`.
 * If they are already in the same set, no action is taken.
 * @param {number} itemA - The first element.
 * @param {number} itemB - The second element.
 */
function unionSets(itemA, itemB) {
  // Find the representatives of both elements.
  itemA = findRepresentative(itemA);
  itemB = findRepresentative(itemB);
  // If their representatives are the same, they are already in the same set.
  if (itemA === itemB) {
    return;
  }
  // Otherwise, merge the sets by making the representative of `itemA` point to the representative of `itemB`.
  parentArray[itemA] = itemB;
}

// Initialize an instance of the InputProcessor, reading data from standard input.
let dataHandler = new InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

// Execute the main solution logic and print its result to the console.
console.log(processInputAndSolve());

/**
 * The primary function that reads problem parameters, performs DSU operations,
 * and computes the final answer based on the problem's requirements.
 * @returns {number} The final calculated count.
 */
function processInputAndSolve() {
  // Read the number of elements (N) and the number of union operations (M).
  let numElements = dataHandler.getOne();
  let numOperations = dataHandler.getOne();

  // Read the permutation array (P).
  let permutationArray = dataHandler.getLine();

  // Initialize the DSU structure: each element is initially in its own set.
  // The array is 1-indexed for convenience, so it goes up to `numElements`.
  for (let loopIndex = 0; loopIndex <= numElements; loopIndex++) {
    parentArray[loopIndex] = loopIndex;
  }

  // Perform M union operations as specified by the input.
  for (let loopIndex = 0; loopIndex < numOperations; loopIndex++) {
    let operationPair = dataHandler.getLine(); // Read two elements to unite.
    unionSets(operationPair[0], operationPair[1]);
  }

  // Calculate the final answer: count how many elements `i` are in the same set
  // as their corresponding value `P[i-1]` in the permutation array.
  let finalCount = 0;
  for (let loopIndex = 1; loopIndex <= numElements; loopIndex++) {
    // Check if the element `permutationArray[loopIndex - 1]` is connected to `loopIndex`.
    if (isSameSet(permutationArray[loopIndex - 1], loopIndex)) {
      finalCount++;
    }
  }

  return finalCount;
}
