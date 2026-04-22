applicationOptions = { entryPoint: 'tmp', lineDelimiter: '\r\n' }; // Windows-style pathing for I/O
// applicationOptions = { entryPoint: '/dev/stdin', lineDelimiter: '\n' }; // Unix-style pathing for I/O

verify = require('assert');

sourceData = require('fs').readFileSync(applicationOptions.entryPoint, 'ascii')
    .trim()
    .split(applicationOptions.lineDelimiter);
totalNodes = Number(sourceData.shift());
outgoingConnections = {};
incomingConnections = {};

function establishLink(graphMap, sourceVertex, targetVertex, connectionCost) {
  if (!graphMap.hasOwnProperty(sourceVertex)) {
    graphMap[sourceVertex] = {};
  }
  graphMap[sourceVertex][targetVertex] = connectionCost;
}

for (let lineIndex in sourceData) {
  let components = sourceData[lineIndex].split(' ').map(Number);
  let currentSource = components[0];
  for (let connectionIndex = 2; connectionIndex < components.length; connectionIndex += 2) {
    establishLink(outgoingConnections, currentSource, components[connectionIndex], components[connectionIndex + 1]);
    establishLink(incomingConnections, components[connectionIndex], currentSource, components[connectionIndex + 1]);
  }
}

verify(outgoingConnections);
verify(incomingConnections);

// Compute initial shortest paths from node 0 using a breadth-first approach.
let levelCounter = 0;
let breadthLevels = new Array(totalNodes);
let pathCosts = new Array(totalNodes);

for (let nodeIdx = 0; nodeIdx < totalNodes; nodeIdx++) {
  breadthLevels[nodeIdx] = null;
  pathCosts[nodeIdx] = Number.MAX_VALUE;
}

breadthLevels[0] = 0;
pathCosts[0] = 0;

do {
  let moreToProcess = 0;
  for (let originKey in outgoingConnections) {
    if (breadthLevels[originKey] !== levelCounter) {
      continue;
    }
    let currentAdjacencies = outgoingConnections[originKey];
    for (let destinationKey in currentAdjacencies) {
      if (breadthLevels[destinationKey] === null) {
        breadthLevels[destinationKey] = levelCounter + 1;
        moreToProcess = 1;
      }
      pathCosts[destinationKey] = Math.min(pathCosts[destinationKey], pathCosts[originKey] + currentAdjacencies[destinationKey]);
    }
  }
  levelCounter++;
} while (moreToProcess);

verify(breadthLevels);
verify(pathCosts);

// Create an ordered list of nodes based on their initial path costs.
let sortedNodes = new Array(totalNodes);
for (let nodeIdx = 0; nodeIdx < totalNodes; nodeIdx++) {
  sortedNodes[nodeIdx] = nodeIdx;
}

sortedNodes.sort(function (nodeA, nodeB) { return pathCosts[nodeA] - pathCosts[nodeB]; });

let nodeRankings = {};
for (let nodeIdx = 0; nodeIdx < totalNodes; nodeIdx++) {
  nodeRankings[sortedNodes[nodeIdx]] = nodeIdx;
}

verify(sortedNodes);
verify(nodeRankings);

// Data structures for the path refinement algorithm (DFS-like).
let exploredNodes = new Array(totalNodes);
for (let nodeIdx = 0; nodeIdx < totalNodes; nodeIdx++) {
  exploredNodes[nodeIdx] = false;
}

let pathStack = new Array(totalNodes);
let neighborStack = new Array(totalNodes);

verify(exploredNodes);
verify(pathStack);
verify(neighborStack);

function calculateMinPath(sourceNode, targetNode, initialCost) {
  let stackPointer = 0, accumulatedWeight = 0, minimumResult = initialCost, nextVertex;
  exploredNodes[targetNode] = true;
  exploredNodes[sourceNode] = true;
  pathStack[0] = sourceNode;
  neighborStack[0] = Object.keys(incomingConnections[sourceNode]);
  while (true) {
    if (neighborStack[stackPointer].length === 0) {
      if (stackPointer === 0) return minimumResult;
      accumulatedWeight -= incomingConnections[pathStack[stackPointer-1]][pathStack[stackPointer]];
      stackPointer--;
      continue;
    }
    nextVertex = neighborStack[stackPointer].pop();
    if (exploredNodes[nextVertex]) continue;
    if (accumulatedWeight + incomingConnections[pathStack[stackPointer]][nextVertex] >= initialCost) continue;
    if (nodeRankings[nextVertex] < nodeRankings[targetNode]) {
      minimumResult = Math.min(minimumResult, accumulatedWeight + incomingConnections[pathStack[stackPointer]][nextVertex] + pathCosts[nextVertex]);
      continue;
    }
    accumulatedWeight += incomingConnections[pathStack[stackPointer]][nextVertex];
    stackPointer++;
    pathStack[stackPointer] = nextVertex;
    neighborStack[stackPointer] = Object.keys(incomingConnections[nextVertex]);
  }
}

// Main loop for dynamic programming path optimization.
for (let nodeIteration in sortedNodes) {
  let currentVertex = sortedNodes[nodeIteration];

  // Update paths from nodes that appear earlier in the sorted order.
  for (let priorNeighbor in incomingConnections[currentVertex]) {
    if (nodeRankings[priorNeighbor] < nodeRankings[currentVertex])
      pathCosts[currentVertex] = Math.min(pathCosts[currentVertex], pathCosts[priorNeighbor] + outgoingConnections[priorNeighbor][currentVertex]);
  }

  // Use the DFS-like function for nodes appearing later in the sorted order.
  for (let laterNeighbor in incomingConnections[currentVertex]) {
    if (nodeRankings[laterNeighbor] > nodeRankings[currentVertex])
      pathCosts[currentVertex] = calculateMinPath(laterNeighbor, currentVertex, pathCosts[currentVertex] - outgoingConnections[laterNeighbor][currentVertex]) + outgoingConnections[laterNeighbor][currentVertex];
  }
}

// Output the final computed shortest path costs.
for (let nodeIdx = 0; nodeIdx < totalNodes; nodeIdx++) {
  console.log(nodeIdx + ' ' + pathCosts[nodeIdx]);
}