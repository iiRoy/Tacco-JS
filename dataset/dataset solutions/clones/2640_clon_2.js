'use strict'; // Enforce strict mode for cleaner code execution

/**
 * Processes input data to calculate accumulated values in a tree-like structure.
 * @param {string} inputString - The raw input data as a single string.
 */
function processInput(inputString) {
  // Trim leading/trailing whitespace and split into individual lines
  inputString = inputString.trim().split('\n');

  // Parse the first line to get configuration parameters (e.g., number of nodes, number of operations)
  // The first element is typically N (number of nodes), the second is Q (number of queries/operations).
  const configParams = inputString.shift().split(' ').map(val => parseInt(val, 10));

  // Initialize an object to represent the adjacency list for the graph structure.
  // Each key is a node ID, and its value is an array of connected nodes.
  let adjacencyList = {};
  // Populate the adjacency list with empty arrays for each node from 1 to N.
  for (let nodeIndex = 1; nodeIndex <= configParams[0]; nodeIndex++) {
    adjacencyList[nodeIndex] = [];
  }

  // Initialize an array to store the accumulated values for each node.
  // The array is 1-indexed to match node IDs, so it has N+1 elements.
  let valueAccumulator = new Array(configParams[0] + 1).fill(0);

  // Iterate through the remaining input lines to build the graph and apply initial value changes.
  // The first N-1 lines define edges, and the subsequent Q lines define value updates.
  for (let currentLineIndex = 0; currentLineIndex < inputString.length; currentLineIndex++) {
    const lineValues = inputString[currentLineIndex].split(' ').map(item => Number(item));
    let targetNodeId = lineValues[0];

    // If the current line index is less than N-1, it describes an edge.
    // N-1 edges typically define a tree for N nodes.
    if (currentLineIndex < configParams[0] - 1) {
      // Add the second value as a neighbor to the target node in the adjacency list.
      adjacencyList[targetNodeId].push(lineValues[1]);
    } else {
      // Otherwise, it's a value update operation.
      // Add the second value to the accumulator for the target node.
      valueAccumulator[targetNodeId] += lineValues[1];
    }
  }

  // Initialize a queue for a Breadth-First Search (BFS) or similar traversal.
  // Start the propagation from node 1.
  let processingQueue = [1];

  /**
   * Recursively propagates values from a parent node to its children.
   * This function is designed to be called for each node in the propagation order.
   * @param {number} currentNodeIdentifier - The ID of the current node being processed.
   */
  const propagateValues = currentNodeIdentifier => {
    // Iterate over all neighbors (children) of the current node.
    for (let neighborIdx = 0; neighborIdx < adjacencyList[currentNodeIdentifier].length; neighborIdx++) {
      let neighborNode = adjacencyList[currentNodeIdentifier][neighborIdx];

      // Add the current node's accumulated value to its neighbor's accumulator.
      valueAccumulator[neighborNode] += valueAccumulator[currentNodeIdentifier];

      // Add the neighbor to the queue to process its children later.
      processingQueue.push(neighborNode);
    }
  };

  // Process nodes in the queue until it's empty.
  // This ensures values are propagated down the tree structure.
  while (processingQueue.length > 0) {
    propagateValues(processingQueue.shift()); // Dequeue a node and propagate its values.
  }

  // Remove the first element (index 0) from the accumulator array,
  // as node IDs are 1-indexed and the 0th element is unused.
  valueAccumulator.shift();

  // Output the final accumulated values, joined by spaces.
  console.log(valueAccumulator.join(' '));
}

// Read input from standard input and pass it to the processing function.
processInput(require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8' }));