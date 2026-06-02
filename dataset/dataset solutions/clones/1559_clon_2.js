"use strict"; // Enforce strict mode for cleaner code practices

// Load the file system module and read all content from standard input
var sourceData = require("fs").readFileSync("/dev/stdin", "utf8");

// Split the entire input string by spaces or newlines into an array of tokens
var parsedInput = sourceData.split(/ |\n/);

// Initialize an index to track the current position in the parsed input array
var currentIndex = 0;

/**
 * Retrieves the next token from the parsed input and converts it to a numeric type.
 * @returns {number} The next numerical value from the input stream.
 */
function getNextNumber() {
  return +parsedInput[currentIndex++];
}

/**
 * Retrieves the next token from the parsed input as a string.
 * @returns {string} The next string value from the input stream.
 */
function getNextString() {
  return parsedInput[currentIndex++];
}

/**
 * Retrieves the next token from the parsed input and converts it to a BigInt type.
 * @returns {BigInt} The next BigInt value from the input stream.
 */
function getNextBigInt() {
  return BigInt(parsedInput[currentIndex++]);
}

/**
 * Fetches a specified number of tokens from the input, converting them to numbers by default,
 * or keeping them as strings if specified.
 * @param {number} count - The quantity of tokens to retrieve.
 * @param {boolean} [asStrings=false] - If true, tokens are returned as strings; otherwise, as numbers.
 * @returns {Array<number|string>} An array containing the retrieved tokens.
 */
function getNumbersArray(count, asStrings) {
  // If 'asStrings' is truthy, return the slice directly; otherwise, map to numbers.
  return asStrings ? parsedInput.slice(currentIndex, currentIndex += count) : parsedInput.slice(currentIndex, currentIndex += count).map(val => +val);
}

/**
 * Retrieves a specified number of tokens, converts them to numbers, and then sorts them.
 * Sorting can be in ascending (default) or descending order.
 * @param {number} count - The number of elements to fetch and sort.
 * @param {boolean} [descending=false] - If true, sorts in descending order; otherwise, ascending.
 * @returns {Array<number>} An array of sorted numerical values.
 */
function getSortedNumbersArray(count, descending) {
  // Retrieve the numbers and apply sorting based on the 'descending' flag.
  return descending ? parsedInput.slice(currentIndex, currentIndex += count).map(val => +val).sort((valA, valB) => valB - valA) : parsedInput.slice(currentIndex, currentIndex += count).map(val => +val).sort((valA, valB) => valA - valB);
}

/**
 * Constructs a 2D array (matrix) from the input stream.
 * Elements can be numbers (default) or strings.
 * @param {number} height - The number of rows for the matrix.
 * @param {number} width - The number of columns per row.
 * @param {boolean} [asStrings=false] - If true, matrix elements are strings; otherwise, numbers.
 * @returns {Array<Array<number|string>>} The generated 2D array.
 */
function getMatrix(height, width, asStrings) {
  var resultMatrix = []; // Array to hold the rows of the matrix
  var rowIdx = 0; // Loop counter for rows

  // Populate the matrix, converting to numbers or keeping as strings as requested.
  if (asStrings) {
    for (; rowIdx < height; rowIdx++) {
      resultMatrix.push(parsedInput.slice(currentIndex, currentIndex += width));
    }
  } else {
    for (; rowIdx < height; rowIdx++) {
      resultMatrix.push(parsedInput.slice(currentIndex, currentIndex += width).map(val => +val));
    }
  }
  return resultMatrix;
}

/**
 * Dynamically creates a multi-dimensional array with specified dimensions,
 * initialized with a given value. Uses `eval` for construction.
 * @param {*} initialValue - The value to fill the array elements with.
 * @param {...number} dimensions - The sizes of each dimension of the array.
 * @returns {Array} The newly created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  var args = arguments; // Access all arguments passed to this function
  var argCount = args.length; // Total number of arguments
  // Start building the string for the innermost array creation
  var evalString = "Array(args[" + --argCount + "]).fill().map(element => {return " + initialValue + ";})";

  // Loop to construct the string for nested array creation based on dimensions
  while (--argCount) {
    evalString = "Array(args[" + argCount + "]).fill().map(element =>" + evalString + ")";
  }
  return eval(evalString); // Execute the constructed string to create the array
}

/**
 * Implements the Disjoint Set Union (DSU) data structure, also known as Union-Find.
 * This structure efficiently tracks a collection of disjoint sets.
 */
class DisjointSet {
  /**
   * Initializes a new DisjointSet instance with a specified number of elements.
   * Each element initially belongs to its own set.
   * @param {number} elementCount - The total number of elements (1-indexed).
   */
  constructor(elementCount) {
    // 'parentOrSize' array: stores the parent index for an element,
    // or a negative value representing the size of the set if it's a root.
    this.parentOrSize = Array(elementCount + 1).fill(-1);
  }

  /**
   * Finds the representative (root) of the set to which 'idx' belongs.
   * Applies path compression optimization during traversal.
   * @param {number} idx - The element whose set representative is to be found.
   * @returns {number} The root element of the set containing 'idx'.
   */
  findRoot(idx) {
    // If 'idx' is a root (its value is negative), return it.
    // Otherwise, recursively find the root and update 'idx's parent for path compression.
    return this.parentOrSize[idx] < 0 ? idx : (this.parentOrSize[idx] = this.findRoot(this.parentOrSize[idx]));
  }

  /**
   * Checks if two elements, 'elemX' and 'elemY', belong to the same set.
   * @param {number} elemX - The first element.
   * @param {number} elemY - The second element.
   * @returns {boolean} True if both elements are in the same set, false otherwise.
   */
  areConnected(elemX, elemY) {
    return this.findRoot(elemX) === this.findRoot(elemY);
  }

  /**
   * Merges the sets containing 'elemX' and 'elemY'.
   * Uses the union-by-size heuristic to maintain tree balance.
   * @param {number} elemX - The first element.
   * @param {number} elemY - The second element.
   * @returns {boolean} True if the sets were successfully merged, false if they were already in the same set.
   */
  unionSets(elemX, elemY) {
    const internalArray = this.parentOrSize; // Shorthand for the internal array
    elemX = this.findRoot(elemX); // Find the root of elemX's set
    elemY = this.findRoot(elemY); // Find the root of elemY's set

    // If both elements already share the same root, no union is needed.
    if (elemX === elemY) {
      return false;
    }

    // Union by size: attach the smaller tree under the root of the larger tree.
    // The negative value at a root indicates the size of its set.
    if (internalArray[elemY] < internalArray[elemX]) {
      internalArray[elemY] += internalArray[elemX]; // Add size of elemX's set to elemY's set
      internalArray[elemX] = elemY; // Make elemY the new parent of elemX
    } else {
      internalArray[elemX] += internalArray[elemY]; // Add size of elemY's set to elemX's set
      internalArray[elemY] = elemX; // Make elemX the new parent of elemY
    }
    return true; // Indicates a successful merge operation
  }

  /**
   * Retrieves the size of the set that contains the specified element 'idx'.
   * @param {number} idx - The element whose set size is to be queried.
   * @returns {number} The total number of elements in the set.
   */
  getSetSize(idx) {
    return -this.parentOrSize[this.findRoot(idx)];
  }
}

// Execute the primary logic of the program.
var programResult = executeProgram();

// If the program's execution yields a defined result, print it to the console.
if (programResult !== undefined) {
  console.log(String(programResult));
}

/**
 * The core function encapsulating the problem's specific algorithm.
 * It reads graph data, processes connections, and determines the largest connected component.
 * @returns {number} The size of the largest connected component in the graph.
 */
function executeProgram() {
  // Read the total number of nodes (N) and the number of edges (M) from input.
  var nodeCount = getNextNumber();
  var edgeCount = getNextNumber();

  // Instantiate the DisjointSet structure to manage 'nodeCount' elements.
  var disjointSetInstance = new DisjointSet(nodeCount);

  // Iterate through each edge to establish connections.
  for (var loopCounter = 0; loopCounter < edgeCount; loopCounter++) {
    // Read the two nodes that an edge connects.
    var [firstNode, secondNode] = getNumbersArray(2);
    // Perform a union operation on the sets containing these two nodes.
    disjointSetInstance.unionSets(firstNode, secondNode);
  }

  // To find the largest connected component, we look for the root with the most negative value
  // in the 'parentOrSize' array (as negative values store set sizes).
  // Math.min will find the smallest (most negative) value, and negating it gives the largest positive size.
  return -Math.min(...disjointSetInstance.parentOrSize);
}
