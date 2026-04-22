function ProcessInputData(rawInputText) {
  // Validate raw input string: Ensure it's not null or empty before processing.
  if (!rawInputText || typeof rawInputText !== 'string') {
    console.error("Error: Invalid or empty input provided.");
    return 0; // Return a default value for error cases
  }

  // Split the raw input into individual lines for easier parsing.
  const parsedLines = rawInputText.split('\n');

  // Parse the total number of elements from the first line.
  // Using Number() for explicit type conversion.
  const numElements = Number(parsedLines[0]);

  // Check for valid number of elements.
  if (isNaN(numElements) || numElements < 0) {
    console.error("Error: Invalid number of elements specified.");
    return 0;
  }

  // Parse the array of height indices (1-based) from the second line.
  // Using map with Number() for robust integer conversion.
  const indexValues = parsedLines[1].split(' ').map(val => Number(val));

  // Parse the array of associated score increments from the third line.
  const scoreIncrements = parsedLines[2].split(' ').map(val => Number(val));

  // Determine the base capacity for the segment tree.
  // This needs to be the smallest power of 2 greater than or equal to `numElements`.
  // The original loop was:
  // for(var i=0;N/Math.pow(2,i)>0.5;i++){ var x = i; } var n = Math.pow(2,x);
  // This can be rewritten more clearly and efficiently.
  let baseCapacity = 1;
  while (baseCapacity < numElements) {
    baseCapacity *= 2; // Equivalent to bit-shift: baseCapacity <<= 1;
  }

  // Initialize the segment tree data structure.
  // A complete binary tree with 'baseCapacity' leaves requires '2 * baseCapacity - 1' nodes.
  // All nodes are initialized to zero.
  const treeNodes = Array.from({ length: (baseCapacity * 2) - 1 }, () => 0);

  /**
   * Performs a range maximum query on the segment tree.
   * Finds the maximum value within a specified range [queryStartIdx, queryEndIdx).
   *
   * @param {number} queryStartIdx - The start index of the query range (inclusive).
   * @param {number} queryEndIdx - The end index of the query range (exclusive).
   * @param {number} currentNodeIdx - The index of the current node in `treeNodes`.
   * @param {number} nodeRangeStart - The start index of the range covered by `currentNodeIdx`.
   * @param {number} nodeRangeEnd - The end index of the range covered by `currentNodeIdx` (exclusive).
   * @returns {number} The maximum value found in the query range.
   */
  const retrieveMaxRange = (queryStartIdx, queryEndIdx, currentNodeIdx, nodeRangeStart, nodeRangeEnd) => {
    // Case 1: The current node's range is completely outside the query range.
    // No overlap, so return 0 (identity for max operation).
    if (nodeRangeEnd <= queryStartIdx || queryEndIdx <= nodeRangeStart) {
      return 0;
    }
    // Case 2: The current node's range is completely contained within the query range.
    // Return the value stored in this node directly.
    else if (queryStartIdx <= nodeRangeStart && nodeRangeEnd <= queryEndIdx) {
      return treeNodes[currentNodeIdx];
    }
    // Case 3: Partial overlap. Recursively query left and right children.
    else {
      const midPoint = Math.floor((nodeRangeStart + nodeRangeEnd) / 2);
      const leftSubtreeMax = retrieveMaxRange(queryStartIdx, queryEndIdx, currentNodeIdx * 2 + 1, nodeRangeStart, midPoint);
      const rightSubtreeMax = retrieveMaxRange(queryStartIdx, queryEndIdx, currentNodeIdx * 2 + 2, midPoint, nodeRangeEnd);
      // Return the maximum of the results from the children.
      return Math.max(leftSubtreeMax, rightSubtreeMax);
    }
  };

  /**
   * Updates a value at a specific leaf index in the segment tree.
   * The update propagates upwards to maintain the max property of parent nodes.
   *
   * @param {number} targetLeafIdx - The 0-based index of the leaf to update.
   * @param {number} newValueForLeaf - The new value to set at the leaf.
   */
  const modifyValueAtIndex = (targetLeafIdx, newValueForLeaf) => {
    // Convert the 0-based leaf index to the corresponding index in the `treeNodes` array.
    // Leaf nodes start from index `baseCapacity - 1`.
    let currentTreeIndex = targetLeafIdx + baseCapacity - 1;

    // Update the leaf node directly.
    treeNodes[currentTreeIndex] = newValueForLeaf;

    // Propagate the update upwards to all parent nodes until the root is reached.
    while (currentTreeIndex > 0) {
      // Calculate the parent node's index.
      const parentIndex = Math.floor((currentTreeIndex - 1) / 2);
      // Update the parent node with the maximum of its two children.
      treeNodes[parentIndex] = Math.max(treeNodes[parentIndex * 2 + 1], treeNodes[parentIndex * 2 + 2]);
      // Move up to the parent.
      currentTreeIndex = parentIndex;
    }
  };

  // Initialize the overall maximum score found.
  let maximumAchievedScore = 0;

  // Iterate through each element to process heights and scores.
  for (let idx = 0; idx < numElements; idx++) {
    // Get the 0-based index corresponding to the current height value.
    // Original h[i] is 1-indexed, so subtract 1 for 0-indexed segment tree.
    const currentHeightAdjustedIdx = indexValues[idx] - 1;

    // Ensure the index is valid for our segment tree.
    if (currentHeightAdjustedIdx < 0 || currentHeightAdjustedIdx >= baseCapacity) {
      // Log an error and skip this iteration if the index is out of bounds.
      console.warn(`Warning: Index ${indexValues[idx]} is out of expected range. Skipping.`);
      continue;
    }

    // Query the segment tree for the maximum score achievable before the current height.
    // The query range is [0, currentHeightAdjustedIdx), meaning up to but not including current height.
    const bestPreviousScore = retrieveMaxRange(0, currentHeightAdjustedIdx, 0, 0, baseCapacity);

    // Calculate the new score for the current height by adding the associated increment.
    const scoreAtCurrentHeight = bestPreviousScore + scoreIncrements[idx];

    // Update the segment tree at the current height's index with the newly calculated score.
    modifyValueAtIndex(currentHeightAdjustedIdx, scoreAtCurrentHeight);

    // Update the global maximum achieved score if the current score is higher.
    maximumAchievedScore = Math.max(maximumAchievedScore, scoreAtCurrentHeight);
  }

  // Output the final computed maximum score.
  console.log(`Computed maximum score: ${maximumAchievedScore}`);

  // Return the final result.
  return maximumAchievedScore;
}

// --- Auxiliary functions for local testing/debugging ---

/**
 * Executes a test scenario for the main logic.
 * This function is typically used in a browser environment for interactive testing.
 * @param {number} scenarioNumber - An identifier for the test scenario.
 */
function runTestScenario(scenarioNumber) {
  // Retrieve test input from a DOM element.
  const testInputString = document.getElementById("input" + scenarioNumber).value;
  // Execute the main processing function with the test input.
  const computedResult = ProcessInputData(testInputString);
  // Initialize test outcome status.
  let testOutcome = "WA"; // "Wrong Answer" by default.

  // Retrieve the expected output from a DOM element.
  const expectedOutput = document.getElementById("output" + scenarioNumber).value.split("\n")[0];

  // Compare computed result with expected output.
  if (String(computedResult) === expectedOutput) {
    testOutcome = "AC"; // "Accepted" if results match.
  }

  // Display the test outcome in a designated DOM element.
  document.getElementById("result" + scenarioNumber).innerHTML = testOutcome;
}

// Entry point for execution in a Node.js environment (e.g., competitive programming platforms).
// Reads input from standard input and passes it to the main processing function.
if (typeof require !== 'undefined' && require.main === module) {
  try {
    // Using fs.readFileSync to synchronously read from stdin.
    // Ensure 'utf8' encoding for correct string interpretation.
    const stdInput = require("fs").readFileSync("/dev/stdin", "utf8");
    ProcessInputData(stdInput);
  } catch (error) {
    console.error("Failed to read input from /dev/stdin:", error);
    // Exit with an error code to indicate failure.
    process.exit(1);
  }
}