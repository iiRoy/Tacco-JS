const appConfiguration = { input: '/dev/stdin', newline: '\n' };

const fileContent = require('fs').readFileSync(appConfiguration.input, 'ascii');
const inputDataLines = fileContent
  .trim()
  .split(appConfiguration.newline);

const totalNodes = Number(inputDataLines.shift());

const forwardEdges = {};
const backwardEdges = {};

/**
 * Establishes a directed edge in the graph representation.
 * @param {object} graphObj - The adjacency list object (e.g., forwardEdges or backwardEdges).
 * @param {number} sourceNodeId - The source node identifier.
 * @param {number} targetNodeId - The target node identifier.
 * @param {number} edgeCost - The weight/cost of the edge.
 */
function establishEdge(graphObj, sourceNodeId, targetNodeId, edgeCost) {
  if (!graphObj.hasOwnProperty(sourceNodeId)) {
    graphObj[sourceNodeId] = {};
  }
  graphObj[sourceNodeId][targetNodeId] = edgeCost;
}

// Parse input lines to build graph adjacency lists
for (const currentLine of inputDataLines) {
  const parsedSegment = currentLine.split(' ').map(Number);
  const sourceNodeId = parsedSegment[0];
  const edgeDataStartIndex = 2; // Start of (target, weight) pairs

  for (let segmentIndex = edgeDataStartIndex; segmentIndex < parsedSegment.length; segmentIndex += 2) {
    const targetNodeId = parsedSegment[segmentIndex];
    const edgeCost = parsedSegment[segmentIndex + 1];
    establishEdge(forwardEdges, sourceNodeId, targetNodeId, edgeCost);
    establishEdge(backwardEdges, targetNodeId, sourceNodeId, edgeCost);
  }
}

// Simple BFS-like algorithm to find shortest paths from node 0
let currentBfsLevel = 0;
const nodeBfsLevel = Array.from({ length: totalNodes }, () => null); // Stores BFS level
const minPathCosts = Array.from({ length: totalNodes }, () => Number.MAX_VALUE); // Stores shortest path costs

nodeBfsLevel[0] = 0;
minPathCosts[0] = 0;

let levelExpansionOccurred;
do {
  levelExpansionOccurred = false;
  const nodesAtCurrentLevel = Object.keys(forwardEdges).filter(nodeId => nodeBfsLevel[nodeId] === currentBfsLevel);

  for (const sourceNodeIdStr of nodesAtCurrentLevel) {
    const sourceNodeId = Number(sourceNodeIdStr);
    const currentSourceEdges = forwardEdges[sourceNodeId];

    for (const targetNodeIdStr of Object.keys(currentSourceEdges)) {
      const targetNodeId = Number(targetNodeIdStr);
      const edgeWeight = currentSourceEdges[targetNodeId];
      const potentialNewCost = minPathCosts[sourceNodeId] + edgeWeight;

      if (nodeBfsLevel[targetNodeId] === null) {
        nodeBfsLevel[targetNodeId] = currentBfsLevel + 1;
        levelExpansionOccurred = true;
      }
      minPathCosts[targetNodeId] = Math.min(minPathCosts[targetNodeId], potentialNewCost);
    }
  }
  currentBfsLevel++;
} while (levelExpansionOccurred);

// Sort nodes based on their minimum path cost from node 0
const nodesSortedByMinCost = Array.from({ length: totalNodes }, (_, i) => i);
nodesSortedByMinCost.sort((nodeA, nodeB) => minPathCosts[nodeA] - minPathCosts[nodeB]);

// Create a reverse mapping: node ID to its rank in the sorted list
const nodeCostRank = {};
for (let arrayIndex = 0; arrayIndex < totalNodes; arrayIndex++) {
  nodeCostRank[nodesSortedByMinCost[arrayIndex]] = arrayIndex;
}

/*
// dynamic programming and dfs (commented out in original, so kept commented)
//   min[0, u] = min { min[0, v] + forwardEdges[v, u] if min[0, v] is known,
//                     find min[0, v] starting from (bfsmin[0, u] - forwardEdges[u, v])
//                       and min[0, v] + forwardEdges[v, u] }
//                   for v in backwardEdges[u]

const visitedNodes = Array.from({ length: totalNodes }, () => false);
const currentPathStack = new Array(totalNodes); // stack for DFS path
const remainingNeighborsStack = new Array(totalNodes); // stack for neighbors to explore

function depthFirstSearch(startNode, targetNode, initialMinCost) {
  let stackPointer = 0;
  let currentPathCost = 0;
  let resultMinCost = initialMinCost;
  let nextNeighbor;

  visitedNodes[targetNode] = true;
  visitedNodes[startNode] = true; // Mark both ends of the initial edge as visited for this path
  currentPathStack[0] = startNode;
  remainingNeighborsStack[0] = Object.keys(backwardEdges[startNode]);

  while (true) {
    if (remainingNeighborsStack[stackPointer].length === 0) {
      if (stackPointer === 0) return resultMinCost; // DFS path exhausted
      // Backtrack
      currentPathCost -= backwardEdges[currentPathStack[stackPointer - 1]][currentPathStack[stackPointer]];
      stackPointer--;
      continue;
    }

    nextNeighbor = remainingNeighborsStack[stackPointer].pop();
    if (visitedNodes[nextNeighbor]) continue; // Skip already visited nodes in this path
    if (currentPathCost + backwardEdges[currentPathStack[stackPointer]][nextNeighbor] >= initialMinCost) continue; // Pruning

    if (nodeCostRank[nextNeighbor] < nodeCostRank[targetNode]) {
      // If neighbor is "closer" to source 0, use its pre-calculated minPathCosts
      resultMinCost = Math.min(resultMinCost, currentPathCost + backwardEdges[currentPathStack[stackPointer]][nextNeighbor] + minPathCosts[nextNeighbor]);
      continue;
    }

    // Explore deeper
    currentPathCost += backwardEdges[currentPathStack[stackPointer]][nextNeighbor];
    stackPointer++;
    currentPathStack[stackPointer] = nextNeighbor;
    remainingNeighborsStack[stackPointer] = Object.keys(backwardEdges[nextNeighbor]);
  }
}

for (const nodeIdentifierStr of nodesSortedByMinCost) {
  const currentNode = Number(nodeIdentifierStr);
  const incomingEdges = backwardEdges[currentNode];

  if (incomingEdges) { // Check if there are any incoming edges
    for (const prevNodeStr of Object.keys(incomingEdges)) {
      const previousNode = Number(prevNodeStr);
      // Phase 1: Update using nodes already processed (smaller rank)
      if (nodeCostRank[previousNode] < nodeCostRank[currentNode]) {
        minPathCosts[currentNode] = Math.min(minPathCosts[currentNode], minPathCosts[previousNode] + forwardEdges[previousNode][currentNode]);
      }
    }

    for (const prevNodeStr of Object.keys(incomingEdges)) {
      const previousNode = Number(prevNodeStr);
      // Phase 2: Update using nodes not yet processed (larger rank) via DFS
      if (nodeCostRank[previousNode] > nodeCostRank[currentNode]) {
        // Reset visited for DFS
        for (let k = 0; k < totalNodes; k++) visitedNodes[k] = false;
        const costFromPrev = forwardEdges[previousNode][currentNode];
        const dfsResult = depthFirstSearch(previousNode, currentNode, minPathCosts[currentNode] - costFromPrev);
        minPathCosts[currentNode] = Math.min(minPathCosts[currentNode], dfsResult + costFromPrev);
      }
    }
  }
}

// The original code had this console.log commented out.
// for (let arrayIndex = 0; arrayIndex < totalNodes; arrayIndex++) {
//   console.log(arrayIndex + ' ' + minPathCosts[arrayIndex]);
// }
*/
