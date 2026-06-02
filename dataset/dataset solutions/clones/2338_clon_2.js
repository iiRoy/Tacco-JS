'use strict';

// This function processes the raw input data to solve a graph problem.
function ProcessInput(rawData) {
  // Clean up the input string and split it into individual lines.
  let processedLines = rawData.trim().split('\n');

  // Parse the first line to get key numerical parameters.
  const initialParameters = processedLines[0].split(' ').map(strVal => parseInt(strVal, 10));

  // Extract the number of nodes, and the two starting nodes for distance calculations.
  const nodeCount = initialParameters[0];
  const startNodeA = initialParameters[1];
  const startNodeB = initialParameters[2];

  // Get the remaining lines which represent the edges of the graph.
  const remainingLines = processedLines.slice(1);

  // Convert edge lines into an array of arrays, where each inner array is an edge [node1, node2].
  const edgeList = remainingLines.map(lineStr => {
    return lineStr.split(' ').map(numStr => parseInt(numStr, 10));
  });

  // Initialize an adjacency map (or list) to represent the graph.
  let adjacencyMap = {};

  // Populate the adjacency map based on the edge list.
  // The graph is undirected, so add connections in both directions.
  for (let edgeIndex = 0; edgeIndex < nodeCount - 1; ++edgeIndex) {
    const currentEdge = edgeList[edgeIndex];
    const nodeOne = currentEdge[0];
    const nodeTwo = currentEdge[1];

    // Ensure arrays exist for both nodes in the map.
    if (!adjacencyMap[nodeOne]) {
      adjacencyMap[nodeOne] = [];
    }
    if (!adjacencyMap[nodeTwo]) {
      adjacencyMap[nodeTwo] = [];
    }

    // Add connections.
    adjacencyMap[nodeOne].push(nodeTwo);
    adjacencyMap[nodeTwo].push(nodeOne);
  }

  // Initialize arrays to store distances from startNodeA and startNodeB.
  // Arrays are sized nodeCount + 1 because nodes are 1-indexed.
  let distanceFromA = Array(nodeCount + 1);
  distanceFromA.fill(0); // Initialize all distances to zero.

  let distanceFromB = Array(nodeCount + 1);
  distanceFromB.fill(0); // Initialize all distances to zero.

  /**
   * Performs a Depth-First Search (DFS) to calculate distances from a starting node.
   * @param {number} currentNode - The current node being visited.
   * @param {number} previousNode - The node from which the current node was visited (to avoid going back).
   * @param {number} currentDepth - The distance from the starting node to the currentNode.
   * @param {number[]} distanceArray - The array to store calculated distances.
   */
  const calculateDistances = (currentNode, previousNode, currentDepth, distanceArray) => {
    // Store the distance for the current node.
    distanceArray[currentNode] = currentDepth;

    // Iterate over all neighbors of the current node.
    for (let neighborIndex in adjacencyMap[currentNode]) {
      const nextNode = parseInt(adjacencyMap[currentNode][neighborIndex], 10);

      // If the neighbor is not the previous node, recursively call DFS.
      if (nextNode !== previousNode) {
        calculateDistances(nextNode, currentNode, currentDepth + 1, distanceArray);
      }
    }
  };

  // Perform DFS starting from startNodeA to populate distanceFromA.
  calculateDistances(startNodeA, 0, 0, distanceFromA);
  // Perform DFS starting from startNodeB to populate distanceFromB.
  calculateDistances(startNodeB, 0, 0, distanceFromB);

  // Initialize a variable to store the maximum calculated value.
  let maximumValue = 0;

  // Iterate through all nodes (from 1 to nodeCount) to find the maximum.
  for (let nodeIdx = 0; nodeIdx < nodeCount + 1; ++nodeIdx) {
    // The condition checks if nodeIdx is reachable from A in fewer steps than from B.
    // If so, it means B can "catch" A at nodeIdx, and the value is distanceFromB[nodeIdx] - 1.
    // We want the maximum such value.
    if (distanceFromA[nodeIdx] < distanceFromB[nodeIdx]) {
      maximumValue = Math.max(maximumValue, distanceFromB[nodeIdx] - 1);
    }
  }

  // Output the final maximum value.
  console.log(maximumValue);
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
