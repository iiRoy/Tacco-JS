/*
 * This module processes input data to calculate an optimal value
 * using a segment tree data structure.
 * It identifies the maximum sum achievable based on given heights and values.
 */
function ProcessData(rawData) {
  // Split the entire input string into individual lines
  const parsedLines = rawData.split("\n");

  // Parse the first line to get the total number of items
  const itemCount = parseInt(parsedLines[0], 10);

  // Parse the second line for an array of height indicators
  const heights = parsedLines[1].split(" ").map(element => parseInt(element, 10));

  // Parse the third line for an array of associated numerical values
  const values = parsedLines[2].split(" ").map(valStr => parseInt(valStr, 10));

  // Determine the appropriate base size for the segment tree.
  // This loop finds the smallest power of 2 greater than or equal to N.
  let powerExp = 0;
  for (let loopCounter = 0; itemCount / Math.pow(2, loopCounter) > 0.5; loopCounter++) {
    powerExp = loopCounter;
  }

  // Calculate the actual base size for the segment tree (next power of 2)
  const treeSizeBase = Math.pow(2, powerExp);

  // Initialize the segment tree array with zeros.
  // The size is 2 * treeSizeBase - 1 for a complete binary tree.
  const segmentTree = new Array(Math.pow(2, powerExp) * 2 - 1).fill(0);

  /**
   * Performs a range maximum query on the segment tree.
   * Finds the maximum value within a specified range [queryStart, queryEnd).
   *
   * @param {number} queryStart - The starting index of the query range (inclusive).
   * @param {number} queryEnd   - The ending index of the query range (exclusive).
   * @param {number} nodeIndex  - The current node's index in the segmentTree array.
   * @param {number} rangeLeft  - The left boundary of the current node's covered range.
   * @param {number} rangeRight - The right boundary of the current node's covered range.
   * @returns {number} The maximum value in the queried range.
   */
  function fetchMaxRange(queryStart, queryEnd, nodeIndex, rangeLeft, rangeRight) {
    // If the current node's range is completely outside the query range, return 0.
    if (rangeRight <= queryStart || queryEnd <= rangeLeft) {
      return 0;
    }
    // If the current node's range is completely within the query range, return its value.
    else if (queryStart <= rangeLeft && rangeRight <= queryEnd) {
      return segmentTree[nodeIndex];
    }
    // Otherwise, partially overlap. Recurse on children and take the maximum.
    else {
      const midPoint = (rangeLeft + rangeRight) / 2;
      const leftNodeMax = fetchMaxRange(queryStart, queryEnd, nodeIndex * 2 + 1, rangeLeft, midPoint);
      const rightNodeMax = fetchMaxRange(queryStart, queryEnd, nodeIndex * 2 + 2, midPoint, rangeRight);
      return Math.max(leftNodeMax, rightNodeMax);
    }
  }

  /**
   * Updates a value at a specific index in the segment tree and propagates changes upwards.
   *
   * @param {number} targetIndex - The index of the leaf node to update.
   * @param {number} newValue    - The new value to set at the target index.
   */
  function modifyTreeValue(targetIndex, newValue) {
    // Navigate to the leaf node corresponding to the target index.
    let currentTreeIdx = targetIndex + treeSizeBase - 1;
    segmentTree[currentTreeIdx] = newValue;

    // Propagate the update upwards to parent nodes.
    while (currentTreeIdx > 0) {
      currentTreeIdx = Math.floor((currentTreeIdx - 1) / 2); // Move to parent
      // Update parent with the maximum of its children.
      segmentTree[currentTreeIdx] = Math.max(segmentTree[currentTreeIdx * 2 + 1], segmentTree[currentTreeIdx * 2 + 2]);
    }
  }

  // The initial state of segmentTree[heights[0]] = values[0] is not directly used,
  // but the logic implicitly handles this via the loop.

  let finalResult = 0; // Initialize the variable to store the ultimate maximum answer.

  // Iterate through each item to compute the maximum cumulative value.
  for (let loopIdx = 0; loopIdx < itemCount; loopIdx++) {
    let currentMaxVal = 0;
    // Query the segment tree for the maximum value in the range [0, heights[loopIdx]-1).
    // This finds the maximum cumulative sum achievable before the current height.
    currentMaxVal = fetchMaxRange(0, heights[loopIdx] - 1, 0, 0, treeSizeBase);

    // Update the segment tree at the current height index with the new cumulative sum.
    // The new sum is the previously found max + the value associated with the current item.
    modifyTreeValue(heights[loopIdx] - 1, currentMaxVal + values[loopIdx]);

    // Update the overall maximum result if the new cumulative sum is greater.
    finalResult = Math.max(finalResult, currentMaxVal + values[loopIdx]);
  }

  // Print the final calculated result to the console.
  console.log('%s', finalResult);

  // Return the final result.
  return finalResult;
}

// This function is for testing purposes, typically in a browser environment.
// It simulates fetching input from HTML elements and comparing against expected output.
function testSolution(testCaseId) {
  // Retrieve input string from a designated HTML element.
  const testInputString = document.getElementById("input" + testCaseId).value;
  // Execute the main processing function with the retrieved input.
  const calculatedAnswer = ProcessData(testInputString);

  let testOutcome = "WA"; // Assume Wrong Answer initially.
  // Compare the calculated answer with the expected output from another HTML element.
  if (calculatedAnswer === parseInt(document.getElementById("output" + testCaseId).value.split("\n")[0], 10)) {
    testOutcome = "AC"; // If they match, it's Accepted.
  }
  // Display the test outcome in a specific HTML element.
  document.getElementById("result" + testCaseId).innerHTML = testOutcome;
}

// Execute the primary function with input read from standard input in a Node.js environment.
ProcessData(require("node:fs").readFileSync("/dev/stdin", "utf8"));