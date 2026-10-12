const [UNVISITED, VISITED] = [0x0, 0b1]; // Define node states: 0 for unvisited, 1 for visited

(function executeAlgorithm() {
  // Read input from standard input, process it
  const inputDataRows = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

  // The first line contains the number of nodes
  const nodeCount = Number(inputDataRows.shift());

  // Parse the adjacency matrix from the remaining lines
  // -1 indicates no direct edge, represented as Infinity for distance calculations
  const adjacencyMatrix = inputDataRows.map((rowStr, rowIndex) =>
    rowStr.trim().split(' ').map(valStr => (valStr == -1 ? Infinity : Number(valStr)))
  );

  // Create an array of node indices from 0 to nodeCount-1
  const nodeIndices = Array.from(Array(nodeCount), (_, idx) => idx);

  // Initialize distance array (minDistances) and node status array (nodeStatus)
  const minDistances = [];
  const nodeStatus = [];

  // Set initial distances to Infinity and all nodes as unvisited
  for (let k = 0; k < nodeCount; k++) {
    minDistances[k] = Infinity;
    nodeStatus[k] = UNVISITED;
  }

  // The starting node (node 0) has a distance of 0
  minDistances[0] = 0x0;

  // Variables for Prim's algorithm
  let currentMinCost, currentNodeIdx, totalCost = 0x0;

  // Main loop for Prim's algorithm
  while (true) {
    // Find the unvisited node with the minimum distance
    currentMinCost = nodeIndices.reduce((accumulatorMin, checkIdx) => {
      // If node is already visited or its distance is not less than current min, skip
      if (nodeStatus[checkIdx] === VISITED || minDistances[checkIdx] >= accumulatorMin) {
        return accumulatorMin;
      }
      // Update current minimum and store the index of this node
      return minDistances[currentNodeIdx = checkIdx];
    }, Infinity); // Initialize accumulatorMin with Infinity

    // If no reachable unvisited nodes are found, break the loop
    if (currentMinCost === Infinity) {
      break;
    }

    // Add the minimum cost to the total sum
    totalCost += currentMinCost;
    // Mark the selected node as visited
    nodeStatus[currentNodeIdx] = VISITED;

    // Update distances to neighbors of the newly visited node
    adjacencyMatrix[currentNodeIdx].forEach((edgeWeight, neighborIdx) => {
      // If the neighbor is unvisited and a shorter path is found
      if (nodeStatus[neighborIdx] !== VISITED && minDistances[neighborIdx] > edgeWeight) {
        minDistances[neighborIdx] = edgeWeight; // Update its distance
      }
    });
  }

  // Output the total minimum spanning tree cost
  console.log(totalCost);
})();
