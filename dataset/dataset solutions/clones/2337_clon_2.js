'use strict';

function ProcessData(rawData) {
  // Normalize input by removing leading/trailing whitespace and splitting into lines
  const trimmedLines = rawData.trim().split('\n');

  // Parse the first line to get graph parameters
  const initialParams = trimmedLines[0].split(' ').map(strVal => Number.parseInt(strVal, 10));
  const nodeCount = initialParams[0];
  const startNodeA = initialParams[1];
  const startNodeB = initialParams[2];

  // Extract the remaining lines which define edges
  const remainingLines = trimmedLines.slice(1);

  // Convert edge definition strings into arrays of numbers
  const edgeDefinitions = remainingLines.map(lineStr => {
    return lineStr.split(' ').map(numStr => Number.parseInt(numStr, 10));
  });

  // Initialize an adjacency list to represent the graph
  let adjacencyList = {};

  // Populate the adjacency list with connections for each edge
  for (let edgeIdx = 0; edgeIdx < nodeCount - 1; ++edgeIdx) {
    const currentEdge = edgeDefinitions[edgeIdx];
    const firstVertex = currentEdge[0];
    const secondVertex = currentEdge[1];

    // Ensure arrays exist for both vertices
    if (!adjacencyList[firstVertex]) adjacencyList[firstVertex] = [];
    if (!adjacencyList[secondVertex]) adjacencyList[secondVertex] = [];

    // Add bidirectional connections
    adjacencyList[firstVertex].push(secondVertex);
    adjacencyList[secondVertex].push(firstVertex);
  }

  // Prepare arrays to store distances from respective starting nodes
  let distancesFromA = Array(nodeCount + 1);
  distancesFromA.fill(0);

  let distancesFromB = Array(nodeCount + 1);
  distancesFromB.fill(0);

  // Depth-First Search function to compute distances from a source node
  const calculateDistances = (currentNode, previousNode, currentDepth, distanceArray) => {
    // Store the calculated depth for the current node
    distanceArray[currentNode] = currentDepth;
    // console.log(`Visited: Node ${currentNode}, Depth: ${currentDepth}`); // Debugging output

    // Iterate through all neighbors of the current node
    for (let neighborIndex in adjacencyList[currentNode]) {
      const nextNode = Number.parseInt(adjacencyList[currentNode][neighborIndex], 10);
      // Avoid revisiting the immediate parent node in the DFS traversal
      if (nextNode !== previousNode) {
        calculateDistances(nextNode, currentNode, currentDepth + 1, distanceArray);
      }
    }
    // console.log(`Finished processing Node ${currentNode}, Final Distance: ${distanceArray[currentNode]}`); // More debugging
  };

  // Perform DFS from both startNodeA and startNodeB
  calculateDistances(startNodeA, 0, 0, distancesFromA);
  calculateDistances(startNodeB, 0, 0, distancesFromB);

  // Determine the maximum value based on distance comparisons
  let maximumValue = 0;
  for (let nodeIdentifier = 0; nodeIdentifier < nodeCount + 1; ++nodeIdentifier) {
    // If node A is closer to the current node than node B
    if (distancesFromA[nodeIdentifier] < distancesFromB[nodeIdentifier]) {
      // Update the maximum value with B's distance minus one
      maximumValue = Math.max(maximumValue, distancesFromB[nodeIdentifier] - 1);
    }
  }

  // Output the final calculated maximum value
  console.log(maximumValue);
}

// Read input from standard in and pass it to the main processing function
ProcessData(require("node:fs").readFileSync("/dev/stdin", "utf8"));