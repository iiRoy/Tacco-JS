const InputParser = (function() {
  /**
   * Represents an input stream processor.
   * This class handles reading various data formats from a raw string input,
   * typically from standard input in competitive programming.
   * @class InputProcessor
   */
  class InputProcessor {
    /**
     * Initializes the input processor with the raw string content.
     * @param {string} rawInputString - The entire input content as a single string.
     */
    constructor(rawInputString) {
      // Stores each line of the input, trimmed and filtered to remove empty lines.
      this.sourceLines = rawInputString.trim().split(/\r?\n/).filter(line => line.length > 0);
      // Keeps track of the current line being processed.
      this.currentLineIndex = 0;
      // A temporary buffer for tokens of the current line, processed in reverse order for efficient `pop`.
      this.currentLineTokens = [];
    }

    /**
     * Extracts the last token from the current line.
     * If the current line's tokens are exhausted, it advances to the next line.
     * Converts the extracted token to a number by default.
     * @param {boolean} [retrieveAsString=false] - If true, returns the token as a string; otherwise, as a number.
     * @returns {string|number} The extracted token.
     * @throws {Error} If attempting to read beyond the end of the input.
     */
    popValue(retrieveAsString = false) {
      // If the current line's token buffer is empty, load the next line.
      if (this.currentLineTokens.length === 0) {
        if (this.currentLineIndex >= this.sourceLines.length) {
          throw new Error("InputProcessor: Attempted to read past the end of the input source.");
        }
        // Split the current line by one or more whitespace characters, filter out empty strings, and reverse.
        this.currentLineTokens = this.sourceLines[this.currentLineIndex].split(/\s+/).filter(Boolean).reverse();
        // If the line was empty or only contained whitespace, advance and try again.
        if (this.currentLineTokens.length === 0) {
          this.currentLineIndex++;
          return this.popValue(retrieveAsString); // Recursive call to get value from next line
        }
      }

      const extractedToken = this.currentLineTokens.pop();

      // If the line is now fully consumed, prepare to move to the next line.
      if (this.currentLineTokens.length === 0) {
        this.currentLineIndex++;
      }

      // Return the token, optionally parsed as a number.
      return retrieveAsString ? extractedToken : Number(extractedToken);
    }

    /**
     * Reads an entire line, splits it into tokens, and converts them to numbers by default.
     * Advances the internal line index to the next line.
     * @param {boolean} [keepAsStrings=false] - If true, returns tokens as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array of tokens from the read line.
     * @throws {Error} If attempting to read beyond the end of the input.
     */
    readLineTokens(keepAsStrings = false) {
      if (this.currentLineIndex >= this.sourceLines.length) {
        throw new Error("InputProcessor: Attempted to read past the end of the input source.");
      }
      // Clear any remaining tokens from a previous `popValue` call for this line.
      this.currentLineTokens = [];
      const lineData = this.sourceLines[this.currentLineIndex++];
      const tokens = lineData.split(/\s+/).filter(Boolean);
      return keepAsStrings ? tokens : tokens.map(Number);
    }

    /**
     * Reads a specified number of consecutive lines, parsing each into an array of numbers,
     * effectively creating a 2D array (matrix).
     * @param {number} numLines - The count of lines to read for the matrix.
     * @param {boolean} [preserveStrings=false] - If true, keeps matrix elements as strings.
     * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
     */
    readMatrix(numLines, preserveStrings = false) {
      if (numLines <= 0) return [];
      const linesToProcess = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + numLines);
      this.currentLineIndex += numLines; // Advance the line index
      return preserveStrings ?
        linesToProcess.map(line => line.split(/\s+/).filter(Boolean)) :
        linesToProcess.map(line => line.split(/\s+/).filter(Boolean).map(Number));
    }

    /**
     * Reads a specified number of consecutive lines, concatenating all tokens into a single
     * 1D array, converting them to numbers by default.
     * @param {number} numLines - The count of lines to read for the vector.
     * @param {boolean} [returnStrings=false] - If true, returns tokens as strings.
     * @returns {Array<string|number>} A 1D array representing the vector.
     */
    readVector(numLines, returnStrings = false) {
      if (numLines <= 0) return [];
      const linesToProcess = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + numLines);
      this.currentLineIndex += numLines; // Advance the line index
      return returnStrings ?
        linesToProcess.map(line => line.split(/\s+/).filter(Boolean)).flat() :
        linesToProcess.map(line => line.split(/\s+/).filter(Boolean).map(Number)).flat();
    }
  }

  // The IIFE returns a factory function to create an InputProcessor instance.
  // This maintains a similar structure to the original `GET` IIFE.
  return function(inputContent) {
    return new InputProcessor(inputContent);
  };
})();

// Initialize the input processor by reading the entire content of standard input.
const inputReader = InputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Performs a binary search on a sorted array to find the lower bound of a target value.
 * The lower bound is the index of the first element that is not less than the target value.
 * @param {Array<number>} sortedDataArray - The sorted array to search within.
 * @param {number} searchRangeStart - The starting index (inclusive) for the search.
 * @param {number} searchRangeEnd - The ending index (exclusive) for the search.
 * @param {number} targetValue - The value to find the lower bound for.
 * @returns {number} The index of the lower bound. If all elements are less than target, returns searchRangeEnd.
 */
function findLowerBound(sortedDataArray, searchRangeStart, searchRangeEnd, targetValue) {
  let lowPointer = searchRangeStart;
  let highPointer = searchRangeEnd; // highPointer is exclusive

  // Continue the search while there are at least two elements in the current range.
  while (lowPointer + 1 < highPointer) {
    const midPointer = Math.floor((lowPointer + highPointer) / 2);
    // If the element at midPointer is less than the target, the lower bound must be in the right half.
    if (sortedDataArray[midPointer] < targetValue) {
      lowPointer = midPointer;
    } else {
      // Otherwise, the lower bound is in the left half, possibly including midPointer.
      highPointer = midPointer;
    }
  }

  // After the loop, lowPointer and highPointer are adjacent.
  // Determine the correct lower bound from these two.
  return sortedDataArray[lowPointer] < targetValue ? highPointer : lowPointer;
}

/**
 * Implements a Segment Tree data structure designed for range minimum queries (point queries)
 * and range assignment updates.
 * @class SegmentTree
 */
class SegmentTree {
  /**
   * Constructs a SegmentTree instance.
   * @param {number} coveredDataSize - The number of logical elements this segment tree will manage.
   */
  constructor(coveredDataSize) {
    // Calculate the smallest power of 2 that is greater than or equal to `coveredDataSize`.
    // This determines the number of leaf nodes in the complete binary tree structure.
    let powerOfTwoLeaves = 1;
    while (powerOfTwoLeaves < coveredDataSize) {
      powerOfTwoLeaves <<= 1; // Equivalent to powerOfTwoLeaves = powerOfTwoLeaves * 2;
    }

    // The total number of nodes in a complete binary tree with `N` leaves is `2*N - 1`.
    // Initialize all nodes with a very large value (effectively infinity) to represent no minimum set yet.
    this.treeNodes = new Array(2 * powerOfTwoLeaves - 1).fill(Number.MAX_SAFE_INTEGER);
    // This offset helps convert a 0-based leaf index to its corresponding 0-based index in `treeNodes`.
    this.leafNodeOffset = powerOfTwoLeaves;
    // Store the original size for bounds checking.
    this.initialDataCapacity = coveredDataSize;
  }

  /**
   * Queries the minimum value associated with a specific leaf index (point query).
   * It traverses upwards from the specified leaf to the root, collecting the minimum value encountered.
   * @param {number} targetPointIndex - The 0-based index of the leaf element to query.
   * @returns {number} The minimum value found for the queried point, or -1 if no value was set (still `Number.MAX_SAFE_INTEGER`).
   */
  queryPoint(targetPointIndex) {
    // Basic validation for the query index.
    if (targetPointIndex < 0 || targetPointIndex >= this.initialDataCapacity) {
      // console.warn(`SegmentTree: Query index ${targetPointIndex} is out of bounds [0, ${this.initialDataCapacity - 1}].`);
      return -1; // Or throw an error, depending on error handling strategy.
    }

    // Convert the 0-based leaf index to its corresponding 0-based node index in `treeNodes`.
    let currentNodeIndex = targetPointIndex + this.leafNodeOffset - 1;
    let currentMinimumValue = Number.MAX_SAFE_INTEGER;

    // Traverse from the leaf node up to the root (index 0).
    while (currentNodeIndex >= 0) {
      // If the current node's value is smaller than the current minimum, update it.
      if (this.treeNodes[currentNodeIndex] < currentMinimumValue) {
        currentMinimumValue = this.treeNodes[currentNodeIndex];
      }
      // Move to the parent node: parent of node `i` is `(i-1)/2`.
      currentNodeIndex = Math.floor((currentNodeIndex - 1) / 2);
    }

    // If no value was ever set, the minimum remains `Number.MAX_SAFE_INTEGER`, so return -1.
    return currentMinimumValue === Number.MAX_SAFE_INTEGER ? -1 : currentMinimumValue;
  }

  /**
   * Updates a range of leaf nodes with a new assigned value and propagates the minimums upwards.
   * This function performs a range assignment where all leaf nodes within the specified
   * `targetRangeStart` (inclusive) to `targetRangeEnd` (exclusive) are effectively set
   * to `assignedValue`. Internal nodes are then updated to store the minimum of their children.
   * This implementation corrects and standardizes the original's unusual `update` logic
   * for a min-segment tree.
   *
   * @param {number} targetRangeStart - The starting index (inclusive) of the range to update.
   * @param {number} targetRangeEnd - The ending index (exclusive) of the range to update.
   * @param {number} assignedValue - The value to assign to the elements within the range.
   */
  updateRange(targetRangeStart, targetRangeEnd, assignedValue) {
    // Validate the input range for logical consistency and against tree capacity.
    if (targetRangeStart >= targetRangeEnd || targetRangeStart < 0 || targetRangeEnd > this.initialDataCapacity) {
      // console.warn(`SegmentTree: Invalid update range [${targetRangeStart}, ${targetRangeEnd}) for capacity ${this.initialDataCapacity}.`);
      return;
    }

    /**
     * Recursive helper function for updating the segment tree.
     * @param {number} queryL - The left boundary (inclusive) of the query range.
     * @param {number} queryR - The right boundary (exclusive) of the query range.
     * @param {number} nodeL - The left boundary (inclusive) of the current node's segment.
     * @param {number} nodeR - The right boundary (exclusive) of the current node's segment.
     * @param {number} nodeIdx - The index of the current node in the `treeNodes` array.
     */
    const performRecursiveUpdate = (queryL, queryR, nodeL, nodeR, nodeIdx) => {
      // Case 1: The current node's range is completely outside the query range. No action needed.
      if (nodeR <= queryL || nodeL >= queryR) {
        return;
      }

      // Case 2: The current node's range is completely contained within the query range.
      // Assign the new value directly to this node. This is a range assignment.
      if (queryL <= nodeL && nodeR <= queryR) {
        this.treeNodes[nodeIdx] = assignedValue;
        return;
      }

      // Case 3: The current node's range partially overlaps the query range.
      // Recurse into its children.
      const midPoint = Math.floor((nodeL + nodeR) / 2);
      const leftChildIndex = 2 * nodeIdx + 1;
      const rightChildIndex = 2 * nodeIdx + 2;

      performRecursiveUpdate(queryL, queryR, nodeL, midPoint, leftChildIndex);
      performRecursiveUpdate(queryL, queryR, midPoint, nodeR, rightChildIndex);

      // After children have been updated, update the current node to reflect
      // the minimum value of its children. This is crucial for minimum queries.
      this.treeNodes[nodeIdx] = Math.min(this.treeNodes[leftChildIndex], this.treeNodes[rightChildIndex]);
    };

    // Initiate the recursive update process starting from the root node (index 0),
    // covering the full range of leaves [0, this.leafNodeOffset).
    performRecursiveUpdate(targetRangeStart, targetRangeEnd, 0, this.leafNodeOffset, 0);
  }
}

/**
 * The primary function that orchestrates the problem-solving logic.
 * Reads input, processes data, performs calculations, and formats the output.
 * @returns {string} The final result, with individual answers separated by newline characters.
 */
function solveProblem() {
  // Read the total count of segments (N) and queries (Q) from the input.
  const entityCount = inputReader.popValue();
  const queryCount = inputReader.popValue();

  // Read N lines, each representing a segment with [start, end, length].
  const segmentDataCollection = inputReader.readMatrix(entityCount);

  // Read Q lines, each containing a distance threshold.
  const distanceThresholds = inputReader.readVector(queryCount);

  // Initialize a SegmentTree capable of handling `queryCount` leaf elements.
  const rangeMinimumSegmentTree = new SegmentTree(queryCount);

  // Sort the segments in descending order based on their length.
  // This ensures that longer segments are processed first, which is often important
  // in problems where segments might overlap and priority is given to longer ones.
  segmentDataCollection.sort((segmentA, segmentB) => segmentB[2] - segmentA[2]);

  // Iterate through each segment to update the segment tree.
  for (let i = 0; i < entityCount; i++) {
    const currentSegmentDetails = segmentDataCollection[i];
    const segmentStartCoordinate = currentSegmentDetails[0];
    const segmentEndCoordinate = currentSegmentDetails[1];
    const segmentLengthValue = currentSegmentDetails[2];

    // Optimization: If the segment's effective endpoint (end - length - 1)
    // is less than the smallest distance threshold, this segment cannot affect
    // any query point, so skip it. This acts as a guard clause.
    if ((segmentEndCoordinate - segmentLengthValue - 1) < distanceThresholds[0]) {
      continue;
    }

    // Determine the effective start value for lower bound search.
    const effectiveStartQueryValue = segmentStartCoordinate - segmentLengthValue;
    // Find the leftmost index in `distanceThresholds` that is affected by this segment.
    const affectedRangeLeftIndex = findLowerBound(distanceThresholds, 0, queryCount, effectiveStartQueryValue);

    // Determine the effective end value for lower bound search.
    const effectiveEndQueryValue = segmentEndCoordinate - segmentLengthValue;
    // Find the rightmost index (exclusive) in `distanceThresholds` that is affected.
    const affectedRangeRightIndex = findLowerBound(distanceThresholds, affectedRangeLeftIndex, queryCount, effectiveEndQueryValue);

    // Update the segment tree: for the range [affectedRangeLeftIndex, affectedRangeRightIndex),
    // set the value to the current segment's length. The segment tree will store
    // the minimum length encountered for each point in this range.
    rangeMinimumSegmentTree.updateRange(affectedRangeLeftIndex, affectedRangeRightIndex, segmentLengthValue);
  }

  // After processing all segments, query the segment tree for each of the `queryCount` points.
  const finalResultsArray = new Array(queryCount);
  for (let queryIdx = 0; queryIdx < queryCount; queryIdx++) {
    finalResultsArray[queryIdx] = rangeMinimumSegmentTree.queryPoint(queryIdx);
  }

  // Format the results into a single string with each answer on a new line.
  return finalResultsArray.join("\n");
}

// Execute the main problem-solving function and print its return value to standard output.
console.log(solveProblem());