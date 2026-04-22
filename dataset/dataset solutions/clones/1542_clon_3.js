"use strict";

// --- Core Input Processing Setup ---
const fileSystemModule = require("fs");
const rawInputData = fileSystemModule.readFileSync("/dev/stdin", "utf8");
let tokenStream = rawInputData.trim().split(/\s+/).filter(Boolean); // Trim to handle leading/trailing whitespace, split by any whitespace, filter empty strings
let tokenCursor = 0; // Pointer to the current token in the stream

// --- Input Reading Utilities ---

/**
 * Retrieves the next token from the input stream and converts it to a number.
 * @returns {number} The next numerical token.
 */
function obtainNextNumericValue() {
  if (tokenCursor >= tokenStream.length) {
    throw new Error("Attempted to read past end of input stream.");
  }
  return Number(tokenStream[tokenCursor++]);
}

/**
 * Retrieves the next token from the input stream as a string.
 * @returns {string} The next string token.
 */
function obtainNextStringToken() {
  if (tokenCursor >= tokenStream.length) {
    throw new Error("Attempted to read past end of input stream.");
  }
  return tokenStream[tokenCursor++];
}

/**
 * Retrieves the next token and converts it to a BigInt.
 * @returns {bigint} The next BigInt token.
 */
function obtainNextLargeInteger() {
  if (tokenCursor >= tokenStream.length) {
    throw new Error("Attempted to read past end of input stream.");
  }
  return BigInt(tokenStream[tokenCursor++]);
}

/**
 * Reads a specified number of tokens from the stream.
 * Optionally converts them to numbers if `asNumbers` is true.
 * @param {number} count - The number of tokens to read.
 * @param {boolean} [asNumbers=false] - Whether to convert tokens to numbers.
 * @returns {Array<string|number>} An array of tokens.
 */
function fetchMultipleTokens(count, asNumbers = false) {
  if (count <= 0) return [];
  const fetchedSegment = tokenStream.slice(tokenCursor, tokenCursor + count);
  tokenCursor += count;
  if (asNumbers) {
    return fetchedSegment.map(Number);
  }
  return fetchedSegment;
}

/**
 * Reads a specified number of tokens, converts them to numbers, and sorts them.
 * @param {number} numItems - The number of items to read.
 * @param {boolean} [descendingOrder=false] - True for descending sort, false for ascending.
 * @returns {Array<number>} An array of sorted numbers.
 */
function fetchAndSortNumericTokens(numItems, descendingOrder = false) {
  if (numItems <= 0) return [];
  const items = fetchMultipleTokens(numItems, true);
  if (descendingOrder) {
    return items.sort((valA, valB) => valB - valA);
  }
  return items.sort((valA, valB) => valA - valB);
}

/**
 * Reads a 2D matrix of tokens (rows x columns).
 * @param {number} numRows - The number of rows.
 * @param {number} numCols - The number of columns per row.
 * @param {boolean} [asNumbers=false] - Whether to convert elements to numbers.
 * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
 */
function fetchMatrix(numRows, numCols, asNumbers = false) {
  if (numRows <= 0 || numCols <= 0) return [];
  const matrix = [];
  for (let r = 0; r < numRows; ++r) {
    matrix.push(fetchMultipleTokens(numCols, asNumbers));
  }
  return matrix;
}

/**
 * Dynamically creates a multi-dimensional array.
 * This function uses `eval` and should be used with caution.
 * @param {*} initialValue - The value to fill the innermost array with.
 * @param {...number} dimensions - The dimensions of the array.
 * @returns {Array} The created multi-dimensional array.
 */
function createNdimensionalArray(initialValue, ...dimensions) {
  if (dimensions.length === 0) return initialValue;
  
  let expression = "Array(dimensions[" + (dimensions.length - 1) + "]).fill().map(() => " + JSON.stringify(initialValue) + ")";
  for (let i = dimensions.length - 2; i >= 0; --i) {
    expression = "Array(dimensions[" + i + "]).fill().map(() => " + expression + ")";
  }
  
  // Note: Using eval is generally discouraged for security and performance reasons.
  // This is kept for cloning purposes to match the original's dynamic array creation style.
  return eval(expression);
}


// --- Disjoint Set Union (DSU) Structure ---

/**
 * Implements a Disjoint Set Union (DSU) data structure, also known as Union-Find.
 * It manages a collection of disjoint sets, supporting efficient union and find operations.
 */
class DisjointSetStructure {
  /**
   * Initializes the DSU structure for `count` elements.
   * Elements are typically 1-indexed, so internal array size is `count + 1`.
   * Each element initially belongs to its own set, represented by -1 in the parent array.
   * The absolute value of `parents[i]` when `parents[i] < 0` indicates the size of the set rooted at `i`.
   * @param {number} count - The total number of elements to manage.
   */
  constructor(count) {
    if (count < 0) {
      throw new Error("Number of elements for DSU must be non-negative.");
    }
    // Initialize parent array. Each element is its own root, with size 1.
    // Negative value indicates a root, and its absolute value is the set size.
    this.parentLinks = new Array(count + 1).fill(-1);
    this.totalComponents = count; // Track the number of distinct sets
  }

  /**
   * Finds the representative (root) of the set containing element `idx`.
   * Applies path compression for optimization.
   * @param {number} idx - The index of the element.
   * @returns {number} The root of the set containing `idx`.
   */
  findRepresentative(idx) {
    // If element is a root (value is negative), return itself.
    if (this.parentLinks[idx] < 0) {
      return idx;
    }
    // Otherwise, recursively find the root and compress the path.
    // Assigning the root directly to parentLinks[idx] flattens the tree.
    this.parentLinks[idx] = this.findRepresentative(this.parentLinks[idx]);
    return this.parentLinks[idx];
  }

  /**
   * Checks if two elements belong to the same set.
   * @param {number} elementX - The first element.
   * @param {number} elementY - The second element.
   * @returns {boolean} True if `elementX` and `elementY` are in the same set, false otherwise.
   */
  areConnected(elementX, elementY) {
    return this.findRepresentative(elementX) === this.findRepresentative(elementY);
  }

  /**
   * Merges the sets containing `elementX` and `elementY`.
   * Uses union by size heuristic to keep the tree flat.
   * @param {number} elementX - The first element.
   * @param {number} elementY - The second element.
   * @returns {boolean} True if the sets were successfully merged (i.e., they were different), false otherwise.
   */
  mergeSets(elementX, elementY) {
    let rootX = this.findRepresentative(elementX);
    let rootY = this.findRepresentative(elementY);

    // If both elements already share the same root, no merge is needed.
    if (rootX === rootY) {
      return false;
    }

    // Heuristic: Attach the smaller tree under the root of the larger tree.
    // The parentLinks value stores the negative size of the set if it's a root.
    // So, a smaller negative value (e.g., -5) means a larger set than a larger negative value (e.g., -2).
    if (this.parentLinks[rootY] < this.parentLinks[rootX]) {
      // Root Y's set is larger or equal in size. Attach root X's set to root Y.
      this.parentLinks[rootY] += this.parentLinks[rootX]; // Update size of new root
      this.parentLinks[rootX] = rootY;                   // Make root Y the parent of root X
    } else {
      // Root X's set is larger. Attach root Y's set to root X.
      this.parentLinks[rootX] += this.parentLinks[rootY]; // Update size of new root
      this.parentLinks[rootY] = rootX;                   // Make root X the parent of root Y
    }
    this.totalComponents--; // One less distinct component after a successful merge
    return true;
  }

  /**
   * Returns the size of the set containing element `idx`.
   * @param {number} idx - The index of the element.
   * @returns {number} The number of elements in the set.
   */
  getComponentSize(idx) {
    return -this.parentLinks[this.findRepresentative(idx)];
  }

  /**
   * Returns the total number of disjoint components currently in the structure.
   * @returns {number} The count of distinct sets.
   */
  getDistinctComponentCount() {
    return this.totalComponents;
  }
}

// --- Main Application Logic ---

/**
 * The primary function that processes queries on the DSU structure.
 * @returns {string} A newline-separated string of query results.
 */
function processConnectivityQueries() {
  const [numElements, numQueries] = fetchMultipleTokens(2, true);

  // Basic validation for input sizes
  if (numElements < 1 || numQueries < 0) {
    return ""; // No elements or no queries, return empty output.
  }

  const connectivityManager = new DisjointSetStructure(numElements);
  const queryResults = [];
  let currentQueryIndex = 0;

  // Process each query sequentially
  while (currentQueryIndex < numQueries) {
    const [queryType, firstVal, secondVal] = fetchMultipleTokens(3, true);

    // Ensure values are within expected bounds, though DSU itself handles 1-indexing.
    if (firstVal < 1 || firstVal > numElements || secondVal < 1 || secondVal > numElements) {
      // For competitive programming, usually assume valid input.
      // For robustness, one might log an error or skip. Here, we'll proceed as if valid.
    }

    // Determine the type of operation based on queryType
    const isQueryOperation = (queryType !== 0); // 0 for union, non-zero for check

    if (isQueryOperation) {
      // Type 1 query: Check if two elements are connected
      const areNodesConnected = connectivityManager.areConnected(firstVal, secondVal);
      queryResults.push(areNodesConnected ? 1 : 0);
    } else {
      // Type 0 query: Union two sets
      connectivityManager.mergeSets(firstVal, secondVal);
    }
    currentQueryIndex++;
  }

  // Return the collected results, joined by newlines.
  return queryResults.join("\n");
}

// --- Execution Entry Point ---

const problemSolutionOutput = processConnectivityQueries();
// Output the final result to standard output, ensuring it's a string.
if (problemSolutionOutput !== undefined && problemSolutionOutput !== null) {
  console.log(String(problemSolutionOutput));
}