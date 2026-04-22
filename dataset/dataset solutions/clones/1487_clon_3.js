/*
 * This module processes input from standard input,
 * calculates the maximum overlap of intervals using a Fenwick Tree (Binary Indexed Tree),
 * and prints the resulting maximum overlap count.
 *
 * This code is a Type III clone, featuring:
 * - Extensive renaming of all identifiers (variables, functions, classes, parameters).
 * - Comprehensive reformatting of whitespace and code structure.
 * - Rewritten, more descriptive comments throughout the file.
 * - Removal of several unused input utility functions to streamline the code.
 * - Addition of helper variables, constants, and intermediate steps for clarity.
 * - Inclusion of guard clauses and basic validation checks in functions.
 * - Structural modifications within class methods and the main logic flow.
 * - The overall functionality, which solves the maximum interval overlap problem
 *   using a sweep-line approach with a Fenwick Tree, remains identical.
 */
"use strict"; // Enforce strict parsing and error handling for cleaner code.

// --- Input Handling Utilities ---
// Import the Node.js file system module to read input.
const fileSystem = require("fs");

// Read all input from standard input, treating it as UTF-8 encoded text.
const rawInputData = fileSystem.readFileSync("/dev/stdin", "utf8");

// Split the input string into individual tokens using any whitespace as a delimiter.
// The .filter(Boolean) removes any empty strings that might result from multiple consecutive delimiters.
const tokenStream = rawInputData.split(/\s+/).filter(Boolean);

// Initialize a pointer to keep track of the current position in the token stream.
let currentTokenIndex = 0;

/**
 * Reads the next token from the stream and converts it into an integer.
 * Throws an error if an attempt is made to read beyond the end of the stream.
 * @returns {number} The next integer value from the input.
 */
function obtainNextInteger() {
  if (currentTokenIndex >= tokenStream.length) {
    throw new Error("Input stream exhausted: No more tokens to read.");
  }
  // Use parseInt with a radix of 10 for reliable integer conversion.
  return parseInt(tokenStream[currentTokenIndex++], 10);
}

/**
 * Reads a specified number of tokens from the stream and returns them as an array of integers.
 * @param {number} quantity The number of integers to read from the stream.
 * @returns {number[]} An array containing the specified quantity of integers.
 */
function obtainIntegerArray(quantity) {
  if (quantity <= 0) {
    return []; // Return an empty array if no elements are requested.
  }
  const resultCollection = [];
  for (let i = 0; i < quantity; i++) {
    resultCollection.push(obtainNextInteger());
  }
  return resultCollection;
}

// --- Fenwick Tree (Binary Indexed Tree) Implementation ---
// This data structure is optimized for performing point updates and prefix sum queries
// on an array in logarithmic time complexity. It's 1-indexed internally.
class FenwickTree {
  /**
   * Constructs a new Fenwick Tree instance.
   * @param {number} maximumIndex The largest 1-indexed position that the tree will manage.
   */
  constructor(maximumIndex) {
    // The internal array is 1-indexed, so its size needs to be maximumIndex + 1.
    this.treeElements = new Array(maximumIndex + 1).fill(0);
    this.treeSize = maximumIndex; // Stores the actual maximum index for boundary checks.
  }

  /**
   * Adds a specified value to the element at a given index in the conceptual array
   * and propagates this change up through the tree structure.
   * @param {number} valueToAdd The numerical value to add.
   * @param {number} targetPosition The 1-indexed position in the array to update.
   */
  applyDeltaUpdate(valueToAdd, targetPosition) {
    // Validate the target position to ensure it's within the tree's bounds.
    if (targetPosition <= 0 || targetPosition > this.treeSize) {
      // For a robust system, one might log a warning or throw an error here.
      // For competitive programming, often silently ignored or assumed valid.
      return;
    }

    let currentIdx = targetPosition;
    while (currentIdx <= this.treeSize) {
      this.treeElements[currentIdx] += valueToAdd;
      // Move to the next parent node by adding the least significant bit.
      currentIdx += currentIdx & (-currentIdx);
    }
  }

  /**
   * Computes the prefix sum of elements from index 1 up to a specified query index.
   * @param {number} queryPosition The 1-indexed position up to which the sum is required.
   * @returns {number} The sum of all elements from index 1 to queryPosition.
   */
  retrievePrefixSum(queryPosition) {
    // Handle edge cases for query positions outside valid range.
    if (queryPosition <= 0) {
      return 0; // Sum up to or before the first element is zero.
    }
    // If query position exceeds tree size, clamp it to the maximum valid index.
    if (queryPosition > this.treeSize) {
      queryPosition = this.treeSize;
    }

    let accumulatedSum = 0;
    let currentIdx = queryPosition;
    while (currentIdx > 0) {
      accumulatedSum += this.treeElements[currentIdx];
      // Move to the next parent node by subtracting the least significant bit.
      currentIdx -= currentIdx & (-currentIdx);
    }
    return accumulatedSum;
  }

  /**
   * Calculates the sum of elements within a given inclusive range [startPos, endPos].
   * @param {number} startPos The 1-indexed start of the range (inclusive).
   * @param {number} endPos The 1-indexed end of the range (inclusive).
   * @returns {number} The sum of elements within the specified range.
   */
  retrieveRangeSum(startPos, endPos) {
    if (startPos > endPos) {
      return 0; // An invalid range (start after end) yields a sum of zero.
    }
    // The sum of a range [L, R] is (prefix sum up to R) - (prefix sum up to L-1).
    return this.retrievePrefixSum(endPos) - this.retrievePrefixSum(startPos - 1);
  }
}

// --- Core Algorithm Execution ---

/**
 * Executes the primary logic to determine the maximum number of overlapping intervals.
 * This function utilizes a sweep-line algorithm in conjunction with a Fenwick Tree.
 * Each input element `a_i` defines an interval `[a_i - K, a_i + K]`.
 * The algorithm marks the start of an interval with an increment and the point
 * immediately after its end with a decrement in the Fenwick Tree.
 * By querying prefix sums at various points, we can find the maximum active interval count.
 * @returns {number} The highest count of simultaneously active intervals.
 */
function computeMaximumOverlap() {
  // Read the number of elements (N) and the range parameter (K) from input.
  const [numberOfItems, rangeParameter] = obtainIntegerArray(2);

  // Guard clause: If there are no items, no overlap is possible.
  if (numberOfItems <= 0) {
    return 0;
  }

  // Read the array of N elements.
  const sourceValues = obtainIntegerArray(numberOfItems);

  // Define the maximum coordinate value that can appear, based on problem constraints.
  // This determines the required size for our Fenwick Tree.
  const MAX_POSSIBLE_COORD = 300000;
  const FENWICK_CAPACITY = MAX_POSSIBLE_COORD + 1; // Tree is 1-indexed, covering 0 to MAX_POSSIBLE_COORD.

  // Initialize the Fenwick Tree to track interval activity.
  const intervalActivityTracker = new FenwickTree(FENWICK_CAPACITY);

  // Process each source value to define its corresponding interval.
  // This phase populates the Fenwick Tree with event points (increments/decrements).
  for (let itemIdx = 0; itemIdx < numberOfItems; ++itemIdx) {
    const currentItemValue = sourceValues[itemIdx];

    // Calculate the effective start and end points of the interval.
    // The interval is [currentItemValue - rangeParameter, currentItemValue + rangeParameter].
    // These points are clamped within the valid coordinate range [0, MAX_POSSIBLE_COORD].
    const intervalStartCoord = Math.max(0, currentItemValue - rangeParameter);
    const intervalEndCoord = Math.min(MAX_POSSIBLE_COORD, currentItemValue + rangeParameter);

    // Apply an increment at the start of the interval.
    // Fenwick Tree is 1-indexed, so we add 1 to the 0-indexed coordinate.
    intervalActivityTracker.applyDeltaUpdate(1, intervalStartCoord + 1);

    // Apply a decrement immediately after the end of the interval.
    // This correctly accounts for the interval's duration.
    // Ensure the decrement point does not exceed the Fenwick Tree's capacity.
    const decrementPoint = intervalEndCoord + 1;
    if (decrementPoint <= FENWICK_CAPACITY) {
      intervalActivityTracker.applyDeltaUpdate(-1, decrementPoint);
    }
  }

  let peakOverlapCount = 0; // Variable to store the highest overlap encountered.

  // Iterate through relevant points to find the maximum number of active intervals.
  // The original problem iterates 'i' from 0 to N-1 and queries `bi.get(i+1)`.
  // This implies we are interested in the overlap at the first N coordinate points
  // (0-indexed, so `i+1` for 1-indexed Fenwick Tree query).
  for (let queryPoint = 0; queryPoint < numberOfItems; ++queryPoint) {
    // Query the Fenwick Tree for the current number of active intervals at this point.
    // The prefix sum at `queryPoint + 1` represents the total count of intervals
    // that have started by `queryPoint` and have not yet ended.
    const currentActiveIntervals = intervalActivityTracker.retrievePrefixSum(queryPoint + 1);

    // Update the maximum overlap if the current count is higher.
    peakOverlapCount = Math.max(peakOverlapCount, currentActiveIntervals);
  }

  return peakOverlapCount; // Return the final maximum overlap count.
}

// --- Program Entry Point ---
// Execute the main algorithm and print the computed result to standard output.
const finalComputedResult = computeMaximumOverlap();
console.log(String(finalComputedResult)); // Convert the numerical result to a string for console output.