'use strict';

/**
 * Parses a space-separated string of numbers into an array of integers.
 * @param {string} inputLine - The string containing space-separated numbers.
 * @returns {number[]} An array of parsed numbers. Returns an empty array for empty input.
 */
const parseNumericLine = (inputLine) => {
  if (!inputLine || inputLine.trim() === '') {
    return []; // Return empty array for empty or whitespace-only input
  }
  return inputLine.split(' ').map((valueStr) => {
    const num = Number(valueStr);
    // Basic validation: ensure it's a valid number. Default to 0 if invalid.
    if (isNaN(num)) {
      console.warn(`Warning: Non-numeric value '${valueStr}' found in input line. Defaulting to 0.`);
      return 0;
    }
    return num;
  });
};

/**
 * Performs a binary search to find the lower bound of a target value in a sorted array.
 * That is, it returns the index of the first element greater than or equal to the target value.
 * @param {number[]} dataArray - The sorted array to search within.
 * @param {number} startIndex - The starting index for the search (inclusive).
 * @param {number} endIndex - The ending index for the search (exclusive).
 * @param {number} targetValue - The value to search for.
 * @returns {number} The index of the lower bound.
 */
function findLowerBoundIndex(dataArray, startIndex, endIndex, targetValue) {
  let lowPtr = startIndex;
  let highPtr = endIndex;

  // Binary search loop: continues as long as there are at least two elements in the search range.
  while (highPtr - lowPtr > 1) {
    let midIndex = lowPtr + Math.floor((highPtr - lowPtr) / 2);
    if (dataArray[midIndex] < targetValue) {
      lowPtr = midIndex; // Target is in the upper half
    } else {
      highPtr = midIndex; // Target is in the lower half or at midIndex
    }
  }

  // After the loop, lowPtr and highPtr are adjacent.
  // Determine the final result based on the element at lowPtr.
  if (dataArray[lowPtr] < targetValue) {
    return highPtr; // The element at lowPtr is too small, so highPtr is the lower bound.
  } else {
    return lowPtr; // The element at lowPtr is >= targetValue, so lowPtr is the lower bound.
  }
}

/**
 * A Segment Tree implementation for range minimum queries with range updates.
 * It stores a minimum value for each segment. Updates are applied to nodes
 * whose range exactly matches a sub-range of the update query.
 */
class SegmentTreeMinimizer {
  // Sentinel value for uninitialized or out-of-range segments, representing a very large number.
  static DEFAULT_MIN_VALUE = 2_000_000_000; // Using 2e9 as in original, but with underscore for readability.

  /** @type {number[]} */
  treeNodes;
  /** @type {number} */
  leafNodeOffset; // Offset to get to the first leaf node in the treeNodes array.

  /**
   * Constructs a new SegmentTreeMinimizer.
   * The tree capacity will be the smallest power of 2 greater than or equal to initialCapacity.
   * @param {number} initialCapacity - The number of elements the segment tree should be able to cover.
   */
  constructor(initialCapacity) {
    if (initialCapacity <= 0 || !Number.isInteger(initialCapacity)) {
      throw new Error('Segment tree capacity must be a positive integer.');
    }

    // Calculate the smallest power of 2 greater than or equal to initialCapacity.
    // This ensures a complete binary tree structure.
    let actualTreeSize = 1;
    while (actualTreeSize < initialCapacity) {
      actualTreeSize <<= 1; // Equivalent to actualTreeSize = actualTreeSize * 2;
    }

    // The tree array will have 2*actualTreeSize - 1 nodes.
    // We fill it with a large number indicating "no value" or "infinity".
    this.treeNodes = new Array(2 * actualTreeSize - 1).fill(SegmentTreeMinimizer.DEFAULT_MIN_VALUE);
    this.leafNodeOffset = actualTreeSize; // The index of the first leaf node.
  }

  /**
   * Queries the minimum value set for a specific index by traversing up from the leaf.
   * @param {number} targetIndex - The index to query.
   * @returns {number} The minimum value found for the index, or -1 if no value was set
   *                   (i.e., it's still DEFAULT_MIN_VALUE).
   */
  queryMinRange(targetIndex) {
    // Validate targetIndex against the tree's effective leaf capacity.
    if (targetIndex < 0 || targetIndex >= this.leafNodeOffset) {
      console.warn(`Query index ${targetIndex} is out of bounds [0, ${this.leafNodeOffset - 1}]. Returning -1.`);
      return -1; // Return -1 for invalid query indices.
    }

    // Calculate the array index of the corresponding leaf node.
    let currentNodeIdx = targetIndex + this.leafNodeOffset - 1;
    let currentMinimum = SegmentTreeMinimizer.DEFAULT_MIN_VALUE;

    // Traverse up from the leaf node to the root (index 0), updating the minimum.
    // The loop continues as long as currentNodeIdx is a valid array index.
    while (currentNodeIdx >= 0) {
      if (this.treeNodes[currentNodeIdx] < currentMinimum) {
        currentMinimum = this.treeNodes[currentNodeIdx];
      }
      // Move to parent node: (idx - 1) / 2 using bitwise right shift for integer division.
      currentNodeIdx = (currentNodeIdx - 1) >> 1;
    }

    // Convert the default minimum value to -1 as per the original problem's output requirement.
    if (currentMinimum === SegmentTreeMinimizer.DEFAULT_MIN_VALUE) {
      return -1;
    } else {
      return currentMinimum;
    }
  }

  /**
   * Applies a value to a specified range [updateStartIdx, updateEndIdx) within the segment tree.
   * This is a range assignment operation where values are set at nodes whose range
   * exactly matches the update sub-range.
   * @param {number} updateStartIdx - The starting index of the range (inclusive).
   * @param {number} updateEndIdx - The ending index of the range (exclusive).
   * @param {number} valueToSet - The value to set for the specified range.
   */
  applyRangeUpdate(updateStartIdx, updateEndIdx, valueToSet) {
    // Basic validation for the update range.
    if (updateStartIdx >= updateEndIdx || updateStartIdx < 0 || updateEndIdx > this.leafNodeOffset) {
      console.warn(`Invalid update range [${updateStartIdx}, ${updateEndIdx}) for tree capacity ${this.leafNodeOffset}. Skipping update.`);
      return;
    }

    const nodeValues = this.treeNodes; // Reference to the tree array for the recursive function.
    const maxCoverage = this.leafNodeOffset; // Total coverage of the tree (number of leaf nodes).

    /**
     * Internal recursive function to perform the range update.
     * It propagates the original update range (updateStartIdx, updateEndIdx) down the tree,
     * updating a node only if its covered range (nodeRangeStart, nodeRangeEnd)
     * exactly matches a segment of the original update range.
     * @param {number} currentQueryStart - The start of the original update range (inclusive).
     * @param {number} currentQueryEnd - The end of the original update range (exclusive).
     * @param {number} nodeRangeStart - The start of the current node's covered range (inclusive).
     * @param {number} nodeRangeEnd - The end of the current node's covered range (exclusive).
     * @param {number} nodeIndex - Index of the current node in the treeNodes array.
     */
    function _recursiveUpdateSegment(currentQueryStart, currentQueryEnd, nodeRangeStart, nodeRangeEnd, nodeIndex) {
      // Base case: If the current node's range exactly matches the query range, update this node.
      if (currentQueryStart === nodeRangeStart && currentQueryEnd === nodeRangeEnd) {
        nodeValues[nodeIndex] = valueToSet;
        return;
      }

      const midPoint = nodeRangeStart + Math.floor((nodeRangeEnd - nodeRangeStart) / 2);
      const leftChildIndex = 2 * nodeIndex + 1;
      const rightChildIndex = 2 * nodeIndex + 2;

      // Determine which child (or both) to recurse into based on the query range relative to the midpoint.
      if (midPoint < currentQueryEnd) { // The query range extends into or covers the right child's domain.
        if (currentQueryStart < midPoint) { // The query range also extends into or covers the left child's domain.
          // The query range spans across both children. Recurse into both,
          // passing the part of the query range relevant to each child.
          _recursiveUpdateSegment(currentQueryStart, midPoint, nodeRangeStart, midPoint, leftChildIndex);
          _recursiveUpdateSegment(midPoint, currentQueryEnd, midPoint, nodeRangeEnd, rightChildIndex);
        } else { // The query range is entirely within the right child's domain (starts at or after midpoint).
          // Recurse only into the right child.
          _recursiveUpdateSegment(currentQueryStart, currentQueryEnd, midPoint, nodeRangeEnd, rightChildIndex);
        }
      } else { // The query range is entirely within the left child's domain (ends at or before midpoint).
        // Recurse only into the left child.
        _recursiveUpdateSegment(currentQueryStart, currentQueryEnd, nodeRangeStart, midPoint, leftChildIndex);
      }
    }

    // Initiate the recursive update from the root (node 0),
    // covering the entire range of leaves [0, maxCoverage).
    _recursiveUpdateSegment(updateStartIdx, updateEndIdx, 0, maxCoverage, 0);
  }
}

/**
 * Main application logic to process input, build data structures,
 * perform segment tree operations, and output results.
 * @param {string} rawInput - The entire input string from stdin.
 */
function processApplicationLogic(rawInput) {
  const lines = rawInput.trim().split('\n');

  // Basic validation: ensure there's enough input.
  // At least 1 line for N, Q + N lines for items + Q lines for queries.
  if (lines.length < 2) {
    console.error("Error: Insufficient input lines provided. Expected at least N+Q+1 lines.");
    return;
  }

  // Parse the first line for configuration parameters (total items 'N' and total queries 'Q').
  const configParams = parseNumericLine(lines[0]);
  if (configParams.length < 2) {
    console.error("Error: Malformed configuration line. Expected two numbers (N and Q).");
    return;
  }

  const totalItems = configParams[0];
  const totalQueries = configParams[1];

  // Initialize array to hold item data. Each item has [start, end, value].
  const itemCollection = new Array(totalItems);
  for (let i = 0; i < totalItems; ++i) {
    // Input lines for items are from index 1 to totalItems (inclusive).
    itemCollection[i] = parseNumericLine(lines[i + 1]);
    if (itemCollection[i].length < 3) {
      console.warn(`Warning: Item data on line ${i + 1} is incomplete. Expected 3 numbers.`);
      // Handle incomplete data, e.g., fill with defaults or skip.
      // For this clone, we'll proceed assuming the first 3 are valid or 0 if parsed as such.
    }
  }

  // Initialize array to hold query threshold values.
  const queryThresholds = new Array(totalQueries);
  for (let i = 0; i < totalQueries; ++i) {
    // Input lines for queries start after item data (totalItems + 1) and config line (1).
    const thresholdLine = lines[totalItems + i + 1];
    const thresholdVal = Number(thresholdLine);
    if (isNaN(thresholdVal)) {
      console.warn(`Warning: Non-numeric query threshold on line ${totalItems + i + 1}. Defaulting to 0.`);
      queryThresholds[i] = 0; // Default to 0 for invalid thresholds.
    } else {
      queryThresholds[i] = thresholdVal;
    }
  }

  // Initialize the segment tree with the number of queries as its capacity.
  const segmentTreeHandler = new SegmentTreeMinimizer(totalQueries);

  // Sort item collection in descending order based on the third element (value).
  // This is crucial because `applyRangeUpdate` assigns values, and we want
  // the largest values to be considered first for the 'minimum' logic.
  itemCollection.sort((itemA, itemB) => itemB[2] - itemA[2]);

  // Iterate through sorted items and update the segment tree.
  for (let idx = 0; idx < totalItems; ++idx) {
    const currentItem = itemCollection[idx];
    const itemStart = currentItem[0];
    const itemEnd = currentItem[1];
    const itemValue = currentItem[2];

    // Optimization/Guard: If the item's adjusted range cannot possibly cover the first query threshold, skip.
    // The condition (itemEnd - itemValue - 1) < queryThresholds[0] implies that even the smallest
    // possible relevant value for this item, when adjusted, is less than the first (presumably smallest)
    // query threshold. This item won't affect any queries.
    if ((itemEnd - itemValue - 1) < queryThresholds[0]) {
      continue;
    }

    // Find the starting index for updates in the queryThresholds array.
    // This is the first query point `d[k]` such that `d[k] >= (itemStart - itemValue)`.
    const lowerBoundIdx = findLowerBoundIndex(queryThresholds, 0, totalQueries, itemStart - itemValue);

    // Find the ending index for updates in the queryThresholds array.
    // This is the first query point `d[k]` such that `d[k] >= (itemEnd - itemValue)`.
    // The search starts from `lowerBoundIdx` for efficiency.
    const upperBoundIdx = findLowerBoundIndex(queryThresholds, lowerBoundIdx, totalQueries, itemEnd - itemValue);

    // If a valid range for update is found (meaning lowerBoundIdx is strictly less than upperBoundIdx),
    // apply the item's value to this range in the segment tree.
    if (lowerBoundIdx < upperBoundIdx) {
      // The update range is [lowerBoundIdx, upperBoundIdx).
      segmentTreeHandler.applyRangeUpdate(lowerBoundIdx, upperBoundIdx, itemValue);
    }
  }

  // Collect the final results for each query point from the segment tree.
  const finalResults = new Array(totalQueries);
  for (let idx = 0; idx < totalQueries; ++idx) {
    finalResults[idx] = segmentTreeHandler.queryMinRange(idx);
  }

  // Output the results, each on a new line.
  console.log(finalResults.join("\n"));
}

// Read input from standard input and execute the main application logic.
processApplicationLogic(require("fs").readFileSync("/dev/stdin", "utf8"));