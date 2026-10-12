'use strict';

// This function processes the input data to solve a graph problem.
function ProcessInput(rawData) {
  // Trim whitespace and split the input into lines.
  let processedLines = rawData.trim().split('\n');

  // Parse the first line to get N, u, and v.
  const initialParameters = processedLines[0].split(' ').map(strVal => parseInt(strVal, 10));
  const nodeCount = initialParameters[0]; // Total number of nodes in the graph.
  const startNodeA = initialParameters[1]; // Starting node for the first DFS.
  const startNodeB = initialParameters[2]; // Starting node for the second DFS.

  // Extract the remaining lines which represent edges.
  const edgeStrings = processedLines.slice(1);

  // Convert edge strings into arrays of integers.
  const edgeDataList = edgeStrings.map(edgeStr => {
    return edgeStr.split(' ').map(numStr => parseInt(numStr, 10));
  });

  // Initialize an adjacency map (graph representation).
  let adjacencyMap = {};

  // Populate the adjacency map with edges.
  // The loop runs N-1 times because a tree with N nodes has N-1 edges.
  for (let idx = 0; idx < nodeCount - 1; ++idx) {
    let currentEdge = edgeDataList[idx];
    let nodeOne = currentEdge[0];
    let nodeTwo = currentEdge[1];

    // Ensure arrays exist for both nodes in the map.
    if (!adjacencyMap[nodeOne]) {
      adjacencyMap[nodeOne] = [];
    }
    if (!adjacencyMap[nodeTwo]) {
      adjacencyMap[nodeTwo] = [];
    }

    // Add bidirectional edges.
    adjacencyMap[nodeOne].push(nodeTwo);
    adjacencyMap[nodeTwo].push(nodeOne);
  }

  // Initialize distance arrays for DFS from startNodeA and startNodeB.
  // Array size is nodeCount + 1 to accommodate 1-indexed nodes.
  let distanceFromA = Array(nodeCount + 1);
  distanceFromA.fill(0); // Initialize all distances to zero.

  let distanceFromB = Array(nodeCount + 1);
  distanceFromB.fill(0); // Initialize all distances to zero.

  // Define the Depth First Search function.
  // It calculates distances from a given start node to all reachable nodes.
  const calculateDistances = (currentNode, parentNode, currentDepth, distanceArray) => {
    // Set the distance for the current node.
    distanceArray[currentNode] = currentDepth;

    // Iterate over all neighbors of the current node.
    for (let neighborIndex in adjacencyMap[currentNode]) {
      let nextNode = parseInt(adjacencyMap[currentNode][neighborIndex], 10);

      // If the neighbor is not the parent node (to avoid going back immediately).
      if (nextNode !== parentNode) {
        // Recursively call DFS for the neighbor, incrementing depth.
        calculateDistances(nextNode, currentNode, currentDepth + 1, distanceArray);
      }
    }
  };

  // Perform DFS starting from startNodeA.
  // The parent of the initial node is 0 (or any non-existent node ID).
  calculateDistances(startNodeA, 0, 0, distanceFromA);
  // Perform DFS starting from startNodeB.
  calculateDistances(startNodeB, 0, 0, distanceFromB);

  // Find the maximum value based on the condition.
  let maximumValue = 0;
  // Iterate through all possible node identifiers.
  for (let nodeIdentifier = 0; nodeIdentifier < nodeCount + 1; ++nodeIdentifier) {
    // If the distance from A to the current node is less than the distance from B.
    if (distanceFromA[nodeIdentifier] < distanceFromB[nodeIdentifier]) {
      // Update the maximum value. The problem asks for distB[i]-1.
      maximumValue = Math.max(maximumValue, distanceFromB[nodeIdentifier] - 1);
    }
  }
  // Output the final calculated maximum value.
  console.log(maximumValue);
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
