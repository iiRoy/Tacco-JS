let cfgOpts = { input: 'tmp', newline: '\r\n' }; // Configuration for Windows-style input
// cfgOpts = { input: '/dev/stdin', newline: '\n' }; // Configuration for Linux-style input

const assert = require('assert'); // Import the assertion module for validation

// Read the input file, remove leading/trailing whitespace, and split into lines
let inputLines = require('fs').readFileSync(cfgOpts.input, 'ascii')
  .trim()
  .split(cfgOpts.newline);

// The first line contains the total number of nodes in the graph
const nodeCount = Number(inputLines.shift());

// Initialize adjacency lists for forward and backward edges
const forwardEdges = {}; // Stores edges from u to v: forwardEdges[u][v] = cost
const backwardEdges = {}; // Stores edges from v to u: backwardEdges[v][u] = cost (same as forwardEdges[u][v])

/**
 * Inserts an edge into a given graph object.
 * @param {object} graphObj - The graph adjacency list (e.g., forwardEdges or backwardEdges).
 * @param {number} sourceNode - The starting node of the edge.
 * @param {number} destinationNode - The ending node of the edge.
 * @param {number} edgeWeight - The cost associated with traversing the edge.
 */
function insertEdge(graphObj, sourceNode, destinationNode, edgeWeight) {
  // Ensure the source node exists as a key in the graph object
  if (!graphObj.hasOwnProperty(sourceNode)) {
    graphObj[sourceNode] = {};
  }
  // Assign the edge weight to the destination node
  graphObj[sourceNode][destinationNode] = edgeWeight;
}

// Process each remaining line to build the graph's adjacency lists
for (let nodeIdx in inputLines) {
  // Split the line into parts and convert them to numbers
  const lineParts = inputLines[nodeIdx].split(' ').map(Number);
  const currNode = lineParts[0]; // The current node (u)

  // Iterate through the edge definitions, which come in pairs (destination, cost)
  for (let subIdx = 2; subIdx < lineParts.length; subIdx += 2) {
    // Add the forward edge from currNode to lineParts[subIdx] with its cost
    insertEdge(forwardEdges, currNode, lineParts[subIdx], lineParts[subIdx + 1]);
    // Add the backward edge from lineParts[subIdx] to currNode with the same cost
    insertEdge(backwardEdges, lineParts[subIdx], currNode, lineParts[subIdx + 1]);
  }
}

// Verify that the graph structures have been initialized
assert(forwardEdges);
assert(backwardEdges);

// --- Phase 1: Initial Breadth-First Search (BFS) for shortest paths from node 0 ---

let levelCounter = 0; // Tracks the current BFS level
const levelDistances = new Array(nodeCount); // Stores the BFS level of each node from source 0
const minPathCosts = new Array(nodeCount); // Stores the minimum path cost from source 0 to each node

// Initialize all nodes as unvisited (null level) and with infinite path cost
for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
  levelDistances[nodeIdx] = null;
  minPathCosts[nodeIdx] = Number.MAX_VALUE;
}

// Start BFS from node 0
levelDistances[0] = 0;
minPathCosts[0] = 0;

let hasMoreLevels; // Flag to indicate if new nodes were discovered in the last level
do {
  hasMoreLevels = 0; // Reset for the current iteration

  // Iterate through all nodes that have outgoing edges
  for (let nodeIdx in forwardEdges) {
    // Only process nodes that belong to the current BFS level
    if (levelDistances[nodeIdx] !== levelCounter) {
      continue;
    }

    const currentAdjList = forwardEdges[nodeIdx]; // Get the outgoing edges for the current node
    // Explore each neighbor of the current node
    for (let neighborNodeIdx in currentAdjList) {
      // If the neighbor has not been visited yet (its level is null)
      if (levelDistances[neighborNodeIdx] === null) {
        levelDistances[neighborNodeIdx] = levelCounter + 1; // Assign it to the next level
        hasMoreLevels = 1; // Mark that new nodes were found
      }
      // Update the minimum path cost to the neighbor
      minPathCosts[neighborNodeIdx] = Math.min(minPathCosts[neighborNodeIdx], minPathCosts[nodeIdx] + currentAdjList[neighborNodeIdx]);
    }
  }
  levelCounter++; // Move to the next BFS level
} while (hasMoreLevels); // Continue as long as new nodes are being discovered

// Verify BFS results
assert(levelDistances);
assert(minPathCosts);

// --- Phase 2: Sort nodes based on their initial minimum path costs ---

const sortedNodesByCost = new Array(nodeCount); // Array to hold nodes sorted by minPathCosts
for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
  sortedNodesByCost[nodeIdx] = nodeIdx; // Initialize with node indices
}

// Sort the nodes using their minPathCosts as the comparison key
sortedNodesByCost.sort(function (nodeA, nodeB) { return minPathCosts[nodeA] - minPathCosts[nodeB]; });

const nodeCostRank = {}; // Maps each node to its rank (index) in the sortedNodesByCost array
for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
  nodeCostRank[sortedNodesByCost[nodeIdx]] = nodeIdx;
}

// Verify sorting and ranking
assert(sortedNodesByCost);
assert(nodeCostRank);

// --- Phase 3: Dynamic Programming with Depth-First Search (DFS) for final shortest paths ---

const pathVisited = new Array(nodeCount); // Tracks visited nodes within a single DFS call
for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
  pathVisited[nodeIdx] = false; // Initialize all nodes as unvisited
}

const currentPathStack = new Array(nodeCount); // Stores the current path of nodes in the DFS stack
const remainingNeighbors = new Array(nodeCount); // Stores the list of neighbors to explore for each node on the stack

// Verify initialization of DFS-related arrays
assert(pathVisited);
assert(currentPathStack);
assert(remainingNeighbors);

/**
 * Performs a specialized Depth-First Search to find a path from a source node to a target node
 * that potentially updates the minimum path cost. This DFS explores predecessors.
 *
 * @param {number} startNode - The node from which this DFS branch starts (a predecessor 'v' of 'u').
 * @param {number} targetNode - The node 'u' for which we are currently calculating minPathCosts.
 * @param {number} initialMinCost - The current minimum cost to 'targetNode' minus the cost of the edge (startNode, targetNode).
 *                                  This value serves as an upper bound for paths explored in this DFS.
 * @returns {number} The minimum path cost found from source 0 to 'startNode' through this exploration.
 */
function explorePath(startNode, targetNode, initialMinCost) {
  let stackPointer = 0; // Current depth of the DFS stack
  let currentPathCost = 0; // Accumulated cost along the current path in DFS
  let minResult = initialMinCost; // The best path cost found so far for this DFS call
  let nextNeighbor; // Variable to hold the next predecessor to explore

  // Reset the visited array for this specific DFS invocation
  for (let k = 0; k < nodeCount; k++) {
    pathVisited[k] = false;
  }

  pathVisited[targetNode] = true; // Mark the target node as visited to prevent cycles back to it
  pathVisited[startNode] = true; // Mark the starting node of this DFS branch as visited

  currentPathStack[0] = startNode; // Push the starting node onto the stack
  // Get the predecessors of the startNode to begin exploration
  remainingNeighbors[0] = Object.keys(backwardEdges[startNode]);

  // Main DFS loop
  while (true) {
    // If there are no more predecessors to explore from the current node on the stack
    if (remainingNeighbors[stackPointer].length === 0) {
      // If we are back at the initial node of this DFS, we are done
      if (stackPointer === 0) {
        return minResult;
      }
      // Backtrack: pop from stack, subtract the cost of the edge just traversed
      currentPathCost -= backwardEdges[currentPathStack[stackPointer - 1]][currentPathStack[stackPointer]];
      stackPointer--;
      continue;
    }

    // Get the next predecessor to explore from the current node
    nextNeighbor = remainingNeighbors[stackPointer].pop();

    // Skip if this predecessor has already been visited in the current DFS path
    if (pathVisited[nextNeighbor]) {
      continue;
    }

    // Pruning: If the path cost through this predecessor already exceeds the current best path
    if (currentPathCost + backwardEdges[currentPathStack[stackPointer]][nextNeighbor] >= initialMinCost) {
      continue;
    }

    // If the predecessor has a smaller rank (meaning its minPathCosts is considered finalized or smaller)
    if (nodeCostRank[nextNeighbor] < nodeCostRank[targetNode]) {
      // Update the overall minimum result for this DFS
      minResult = Math.min(minResult, currentPathCost + backwardEdges[currentPathStack[stackPointer]][nextNeighbor] + minPathCosts[nextNeighbor]);
      continue; // Continue exploring other predecessors from the current node
    }

    // If the predecessor has a larger rank, push it onto the stack and continue DFS
    // NOTE: The original code had a bug here: `cost += adjinv[cur][next];`
    // It should have been `cost += adjinv[cur[sp]][next];`.
    // To preserve exact observable behavior (including potential runtime errors),
    // we replicate the original's structure.
    currentPathCost += backwardEdges[currentPathStack][nextNeighbor]; // This line replicates the original bug
    stackPointer++;
    currentPathStack[stackPointer] = nextNeighbor;
    pathVisited[nextNeighbor] = true; // Mark the new node as visited
    remainingNeighbors[stackPointer] = Object.keys(backwardEdges[nextNeighbor]); // Get its predecessors
  }
}

// Iterate through nodes in the order of their increasing minPathCosts (from BFS)
for (let nodeIdx in sortedNodesByCost) {
  const currNode = sortedNodesByCost[nodeIdx];

  // First pass: Consider predecessors 'prevNode' that have a smaller rank.
  // Their minPathCosts are already finalized or smaller, so we can use them directly.
  for (let prevNode in backwardEdges[currNode]) {
    if (nodeCostRank[prevNode] < nodeCostRank[currNode]) {
      minPathCosts[currNode] = Math.min(minPathCosts[currNode], minPathCosts[prevNode] + forwardEdges[prevNode][currNode]);
    }
  }

  // Second pass: Consider predecessors 'prevNode' that have a larger rank.
  // Their minPathCosts might not be finalized, so we use DFS to explore paths through them.
  for (let prevNode in backwardEdges[currNode]) {
    if (nodeCostRank[prevNode] > nodeCostRank[currNode]) {
      // Call DFS to find a potentially shorter path to 'prevNode'
      // The 'initialMinCost' for DFS is d[u] - adj[v][u], representing the cost to 'v'
      // The DFS returns the minimum path cost from source 0 to 'prevNode' found.
      // We then add back the cost of the edge (prevNode, currNode) to get the total path cost to 'currNode'.
      minPathCosts[currNode] = Math.min(minPathCosts[currNode], explorePath(prevNode, currNode, minPathCosts[currNode] - forwardEdges[prevNode][currNode]) + forwardEdges[prevNode][currNode]);
    }
  }
}

// --- Phase 4: Output the final shortest path costs ---

// Print each node's index and its calculated minimum path cost
for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
  console.log(nodeIdx + ' ' + minPathCosts[nodeIdx]);
}
