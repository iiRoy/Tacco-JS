/**
 * Processes input data to solve a specific problem using a segment tree.
 * This function reads numerical arrays and calculates a maximum value based on certain conditions.
 * @param {string} rawData - The raw input string, typically from stdin, containing multiple lines.
 * @returns {number} The final computed maximum value.
 */
function ProcessInput(rawData) {
  // Split the input string into individual lines for easier parsing.
  let parsedLines = rawData.split("\n");

  // Parse the first line to get the total count of items.
  const itemCount = parseInt(parsedLines[0], 10);

  // Parse the second line to get an array of height values.
  const heightsArr = parsedLines[1].split(" ").map(valStr => parseInt(valStr, 10));

  // Parse the third line to get an array of associated values.
  const valuesArr = parsedLines[2].split(" ").map(valStr => parseInt(valStr, 10));

  // Determine the smallest power of 2 greater than or equal to itemCount.
  // This is used to size the segment tree appropriately.
  let powerExponent = 0;
  for (let currentPower = 0; itemCount / Math.pow(2, currentPower) > 0.5; currentPower++) {
    powerExponent = currentPower;
  }
  const segmentTreeSize = Math.pow(2, powerExponent);

  // Initialize the segment tree (represented as an array) with zeros.
  // The size is 2*segmentTreeSize - 1 for a complete binary tree.
  const treeData = new Array(segmentTreeSize * 2 - 1).fill(0);

  /**
   * Performs a range maximum query on the segment tree.
   * Finds the maximum value within a specified range [queryStart, queryEnd).
   * @param {number} queryStart - The starting index of the query range (inclusive).
   * @param {number} queryEnd - The ending index of the query range (exclusive).
   * @param {number} nodeIndex - The current node's index in the treeData array.
   * @param {number} nodeRangeStart - The starting index of the current node's covered range (inclusive).
   * @param {number} nodeRangeEnd - The ending index of the current node's covered range (exclusive).
   * @returns {number} The maximum value found in the queried range.
   */
  function retrieveMax(queryStart, queryEnd, nodeIndex, nodeRangeStart, nodeRangeEnd) {
    // If the current node's range is completely outside the query range, return 0 (identity for max).
    if (nodeRangeEnd <= queryStart || queryEnd <= nodeRangeStart) {
      return 0;
    }
    // If the current node's range is completely within the query range, return its stored value.
    else if (queryStart <= nodeRangeStart && nodeRangeEnd <= queryEnd) {
      return treeData[nodeIndex];
    }
    // Otherwise, the query range partially overlaps; recurse on children.
    else {
      const leftChildValue = retrieveMax(queryStart, queryEnd, nodeIndex * 2 + 1, nodeRangeStart, (nodeRangeStart + nodeRangeEnd) / 2);
      const rightChildValue = retrieveMax(queryStart, queryEnd, nodeIndex * 2 + 2, (nodeRangeStart + nodeRangeEnd) / 2, nodeRangeEnd);
      // Return the maximum of the values from the children.
      return Math.max(leftChildValue, rightChildValue);
    }
  }

  /**
   * Updates a value at a specific index in the segment tree and propagates changes upwards.
   * @param {number} targetIndex - The index of the leaf node to update.
   * @param {number} newValue - The new value to set at the target index.
   */
  function modifyTree(targetIndex, newValue) {
    // Convert the logical index to the corresponding leaf node index in the treeData array.
    let currentTreeIdx = targetIndex + segmentTreeSize - 1;
    treeData[currentTreeIdx] = newValue; // Set the new value at the leaf.

    // Propagate the update upwards to parent nodes.
    while (currentTreeIdx > 0) {
      currentTreeIdx = Math.floor((currentTreeIdx - 1) / 2); // Move to the parent node.
      // Update the parent node with the maximum of its children.
      treeData[currentTreeIdx] = Math.max(treeData[currentTreeIdx * 2 + 1], treeData[currentTreeIdx * 2 + 2]);
    }
  }

  // Initialize the overall maximum result.
  let finalResult = 0;

  // Iterate through each item to process heights and values.
  for (let currentIdx = 0; currentIdx < itemCount; currentIdx++) {
    let currentMax = 0;
    // Query the segment tree for the maximum value in the range [0, h[currentIdx]-1).
    // This finds the maximum value associated with a height strictly less than the current height.
    currentMax = retrieveMax(0, heightsArr[currentIdx] - 1, 0, 0, segmentTreeSize);

    // Update the segment tree at the current height's index with the new calculated value.
    // The new value is the previously found max plus the current item's value.
    modifyTree(heightsArr[currentIdx] - 1, currentMax + valuesArr[currentIdx]);

    // Update the overall maximum result if the new calculated value is greater.
    finalResult = Math.max(finalResult, currentMax + valuesArr[currentIdx]);
  }

  // Output the final maximum result to the console.
  console.log('%s', finalResult);
  return finalResult;
}

// This section is for debugging purposes, typically used in a browser environment.
// It simulates input and checks the output against expected values.
function testSolution(testCaseNum) {
  const testInputString = document.getElementById("input" + testCaseNum).value;
  const computedAnswer = ProcessInput(testInputString);
  let testOutcome = "WA"; // Default to Wrong Answer
  // Compare the computed answer with the expected output.
  if (computedAnswer == document.getElementById("output" + testCaseNum).value.split("\n")[0]) {
    testOutcome = "AC"; // Set to Accepted if they match.
  }
  // Display the test outcome.
  document.getElementById("result" + testCaseNum).innerHTML = testOutcome;
}

// Main execution block for Node.js environment.
// Reads input from stdin and passes it to the ProcessInput function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
