function ProcessInput(rawText) {
  // Split the entire input string into individual lines.
  let lineSegments = rawText.split("\n");

  // Parse the number of nodes and edges from the first line.
  const firstLineParts = lineSegments[0].split(" ");
  const nodeCount = parseInt(firstLineParts[0], 10);
  const edgeCount = parseInt(firstLineParts[1], 10);

  // Initialize an adjacency list for the graph.
  // The size is nodeCount + 1 to accommodate 1-based indexing.
  const adjacencyMap = new Array(nodeCount + 1);
  // A set to store all unique nodes that have outgoing edges.
  const uniqueSources = new Set();

  // Remove the first line, which contained N and M.
  lineSegments.shift();

  // Parse the remaining lines into an array of edge pairs.
  // Each edge pair is [sourceNode, destinationNode].
  const parsedEdges = lineSegments.map(segment => segment.split(" ").map(str => parseInt(str, 10)));

  // Remove the last two elements from the parsed edges array.
  // This is often done to handle empty lines at the end of input files.
  parsedEdges.pop();
  parsedEdges.pop();

  // Populate the adjacency list and the set of unique source nodes.
  parsedEdges.map(function(edgePair) {
    const sourceNode = edgePair[0];
    const destinationNode = edgePair[1];
    // If the source node doesn't have an entry in the adjacency list yet, create one.
    if (adjacencyMap[sourceNode] === undefined) {
      adjacencyMap[sourceNode] = [];
    }
    // Add the destination node to the source node's list of neighbors.
    adjacencyMap[sourceNode].push(destinationNode);
    // Add the source node to the set of unique sources.
    uniqueSources.add(sourceNode);
  });

  // Convert the set of unique source nodes into an array for iteration.
  const startNodes = [...uniqueSources];

  // Initialize a memoization table for dynamic programming.
  // Fill with -1 to indicate uncomputed values.
  const memoizationTable = new Array(nodeCount + 1).fill(-1);
  // Variable to store the overall longest path found.
  let longestPathResult = 0;

  // Iterate through each unique starting node to find the longest path originating from it.
  for (let k = 0; k < startNodes.length; k++) {
    const currentStartNode = startNodes[k];
    // Compute the longest path from the current starting node.
    memoizationTable[currentStartNode] = calculateLongestPath(currentStartNode);
    // Update the overall longest path result.
    longestPathResult = Math.max(memoizationTable[currentStartNode], longestPathResult);
  }

  /**
   * Recursively calculates the longest path starting from a given node
   * using dynamic programming (memoization).
   * @param {number} currentNode - The node from which to calculate the longest path.
   * @returns {number} The length of the longest path starting from currentNode.
   */
  function calculateLongestPath(currentNode) {
    // If the result for this node is already computed, return it (memoization hit).
    if (memoizationTable[currentNode] !== -1) {
      return memoizationTable[currentNode];
    } else {
      // If the current node has no outgoing edges, the longest path from it is 0.
      if (adjacencyMap[currentNode] === undefined) {
        memoizationTable[currentNode] = 0;
        return 0;
      }

      // Initialize the maximum path length found from this node.
      let maximumLength = 0;
      // Iterate through all neighbors of the current node.
      for (let neighborIdx = 0; neighborIdx < adjacencyMap[currentNode].length; neighborIdx++) {
        const neighborNode = adjacencyMap[currentNode][neighborIdx];
        // Recursively calculate the longest path from the neighbor and add 1 (for the current edge).
        const currentPathLength = calculateLongestPath(neighborNode) + 1;
        // Update the maximum length found.
        maximumLength = Math.max(maximumLength, currentPathLength);
      }
      // Store the computed maximum length in the memoization table before returning.
      memoizationTable[currentNode] = maximumLength;
      return maximumLength;
    }
  }

  // Output the final longest path result to the console.
  console.log('%s', longestPathResult);
  // Return the result.
  return longestPathResult;
}

// This function is for local debugging purposes, typically in a browser environment.
function testSolution(testCaseIndex) {
  // Retrieve input and expected output from DOM elements.
  const testInput = document.getElementById("input" + testCaseIndex).value;
  const expectedOutput = document.getElementById("output" + testCaseIndex).value.split("\n")[0];

  // Execute the main logic with the test input.
  const actualResult = ProcessInput(testInput);

  // Determine if the actual result matches the expected output.
  let testOutcome = "WA"; // Wrong Answer
  if (actualResult.toString() === expectedOutput) {
    testOutcome = "AC"; // Accepted
  }

  // Display the test outcome in a designated DOM element.
  document.getElementById("result" + testCaseIndex).innerHTML = testOutcome;
}

// Main execution block for competitive programming environments (e.g., Node.js).
// Reads input from standard input and passes it to the ProcessInput function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
