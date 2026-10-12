let cfg = { source: '/dev/stdin', lineSeparator: '\n' }; // Configuration for input source and line endings

let inputLines = require('fs').readFileSync(cfg.source, 'ascii')
  .trim()
  .split(cfg.lineSeparator);

let nodeCount = Number(inputLines.shift());

let adjacencyList = {};

// Process input lines to build the adjacency list
for (let idxA in inputLines) {
  let currentLineParts = inputLines[idxA].split(' ');
  let currentNodeId = currentLineParts.shift(); // Get the node ID
  currentLineParts.shift(); // Discard the count of neighbors (not used in this algorithm)
  adjacencyList[currentNodeId] = currentLineParts; // Store the list of neighbors
}

// Sort the neighbors for each node numerically
for (let idxA in adjacencyList) {
  adjacencyList[idxA].sort(function (valA, valB) {
    return Number(valA) - Number(valB);
  });
}

let discoveryTimes = {}; // Stores discovery time for each node
let finishTimes = {};    // Stores finish time for each node
let timeCounter = 1;     // Global time counter for DFS
let dfsStack = [];       // Stack to manage DFS traversal
let currentVertex = '1'; // Starting node for DFS

// Perform Depth First Search
do {
  // If the current node has not been visited (discovered) yet
  if (!discoveryTimes.hasOwnProperty(currentVertex)) {
    discoveryTimes[currentVertex] = timeCounter;
  }

  let nextNeighborIndex = null;
  let neighbors = adjacencyList[currentVertex];

  // Find the next unvisited neighbor
  for (let idxA in neighbors) {
    if (!discoveryTimes.hasOwnProperty(neighbors[idxA])) {
      nextNeighborIndex = idxA;
      break;
    }
  }

  if (nextNeighborIndex !== null) {
    // If an unvisited neighbor is found, push current node to stack and move to neighbor
    dfsStack.push(currentVertex);
    currentVertex = neighbors[nextNeighborIndex];
    timeCounter++;
  } else {
    // If no unvisited neighbors, backtrack
    timeCounter++;
    finishTimes[currentVertex] = timeCounter;
    currentVertex = dfsStack.pop();
  }
} while (dfsStack.length !== 0); // Continue until the stack is empty

// Handle the last node (the one that started the DFS and has no parent to pop to)
timeCounter++;
finishTimes[currentVertex] = timeCounter;

// Output the discovery and finish times for each node
for (let idxA = 1; idxA <= nodeCount; idxA++) {
  console.log("%d %s %s", idxA, discoveryTimes[idxA], finishTimes[idxA]);
}
