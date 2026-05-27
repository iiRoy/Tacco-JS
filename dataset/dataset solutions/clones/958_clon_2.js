let cfg = { srcPath: '/dev/stdin', lineSep: '\n' }; // Configuration for input file path and line separator

let inputLines = require('fs').readFileSync(cfg.srcPath, 'ascii')
  .trim()
  .split(cfg.lineSep);

let nodeCount = Number(inputLines.shift()); // Extract the total number of nodes from the first line

let forwardEdges = {}; // Adjacency list for outgoing edges: forwardEdges[u][v] = cost
let backwardEdges = {}; // Adjacency list for incoming edges: backwardEdges[v][u] = cost (from u to v)

/**
 * Inserts an edge into a given graph object.
 * @param {object} graphObj - The graph representation (an object of objects).
 * @param {number} startNode - The identifier of the starting node.
 * @param {number} endNode - The identifier of the ending node.
 * @param {number} edgeCost - The cost associated with traversing this edge.
 */
function insertEdge(graphObj, startNode, endNode, edgeCost) {
  if (!graphObj.hasOwnProperty(startNode)) {
    graphObj[startNode] = {};
  }
  graphObj[startNode][endNode] = edgeCost;
}

// Parse the remaining input lines to build the graph's adjacency lists.
// Each line describes a node and its connections: [node_id, num_connections, connected_node_1, cost_1, ...]
for (let idx in inputLines) {
  let currentLineData = inputLines[idx].split(' ').map(Number);
  let currentNode = currentLineData[0]; // The node whose outgoing edges are described

  // Iterate through the connections listed in the current line.
  for (let dataIdx = 2; dataIdx < currentLineData.length; dataIdx += 2) {
    // Add the forward edge from currentNode to the connected node.
    insertEdge(forwardEdges, currentNode, currentLineData[dataIdx], currentLineData[dataIdx + 1]);
    // Add the backward edge from the connected node to currentNode (for reverse traversal).
    insertEdge(backwardEdges, currentLineData[dataIdx], currentNode, currentLineData[dataIdx + 1]);
  }
}

// --- Initial Breadth-First Search (BFS) to find shortest paths from node 0 ---

let levelCounter = 0; // Tracks the current BFS level being processed.
let levelMap = new Array(nodeCount); // Stores the BFS level for each node.
let minDistances = new Array(nodeCount); // Stores the minimum distance from the source node (node 0).

// Initialize all nodes: set their level to null (unvisited) and distance to infinity.
for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
  levelMap[nodeIdx] = null;
  minDistances[nodeIdx] = Number.MAX_VALUE;
}

// The source node (node 0) starts at level 0 with a distance of 0.
levelMap[0] = 0;
minDistances[0] = 0;

let nodesProcessedInLevel; // Flag to indicate if any new nodes were reached in the current BFS level.
do {
  nodesProcessedInLevel = 0; // Reset the flag for the new level.

  // Iterate through all nodes to find those belonging to the current level.
  for (let nodeIdx in forwardEdges) {
    if (levelMap[nodeIdx] !== levelCounter) continue; // Skip if the node is not at the current level.

    let currentAdjList = forwardEdges[nodeIdx]; // Get the outgoing edges for the current node.

    // Explore each neighbor of the current node.
    for (let neighborNode in currentAdjList) {
      // If the neighbor has not been visited yet, assign it to the next BFS level.
      if (levelMap[neighborNode] === null) {
        levelMap[neighborNode] = levelCounter + 1;
        nodesProcessedInLevel = 1; // Mark that a new node was discovered.
      }
      // Relax the edge: update the minimum distance to the neighbor if a shorter path is found.
      minDistances[neighborNode] = Math.min(minDistances[neighborNode], minDistances[nodeIdx] + currentAdjList[neighborNode]);
    }
  }
  levelCounter++; // Advance to the next BFS level.
} while (nodesProcessedInLevel); // Continue as long as new nodes are being reached.

// --- Prepare nodes for dynamic programming by sorting based on initial BFS distances ---

let sortedNodesByDist = new Array(nodeCount); // Array to hold node identifiers.
for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
  sortedNodesByDist[nodeIdx] = nodeIdx;
}

// Sort the nodes based on their calculated minimum distances from node 0.
sortedNodesByDist.sort(function (nodeA, nodeB) {
  return minDistances[nodeA] - minDistances[nodeB];
});

// Create a map to quickly find a node's rank (its index in the sorted array).
let nodeRankMap = {};
for (let sortIdx = 0; sortIdx < nodeCount; sortIdx++) {
  nodeRankMap[sortedNodesByDist[sortIdx]] = sortIdx;
}

// --- Dynamic Programming with Depth-First Search (DFS) for path refinement ---

let isVisited = new Array(nodeCount); // Tracks visited nodes during a single DFS run.
for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
  isVisited[nodeIdx] = false;
}

let dfsStackNodes = new Array(nodeCount); // Stores the nodes currently in the DFS path.
let dfsStackNeighbors = new Array(nodeCount); // Stores iterators for neighbors at each stack level.

/**
 * Performs a DFS-like exploration to find the shortest path from the source (node 0) to 'prevNode',
 * considering paths that might involve nodes with higher BFS ranks than 'targetNode'.
 * This function is used to refine 'minDistances[prevNode]'.
 *
 * @param {number} prevNode - The node for which we are trying to find P(0, prevNode).
 * @param {number} targetNode - The node 'u' in the main loop, used for rank comparison.
 * @param {number} initialMinCost - An upper bound for P(0, prevNode), derived from P(0, targetNode) - P(prevNode, targetNode).
 * @returns {number} The refined minimum cost from node 0 to 'prevNode'.
 */
function explorePath(prevNode, targetNode, initialMinCost) {
  let stackPointer = 0; // Current depth of the DFS stack.
  let currentPathCost = 0; // Accumulated cost of the path from 'prevNode' to the current stack node (using backward edges).
  let minResult = initialMinCost; // The best path cost found so far for P(0, prevNode).

  // Mark the starting nodes as visited for this specific DFS run to prevent immediate cycles.
  isVisited[targetNode] = true;
  isVisited[prevNode] = true;

  dfsStackNodes[0] = prevNode; // Push the starting node 'prevNode' onto the stack.
  // Initialize the list of neighbors to explore from 'prevNode' (using backward edges).
  dfsStackNeighbors[0] = Object.keys(backwardEdges[prevNode]);

  while (true) {
    // If there are no more neighbors to explore from the current node on the stack.
    if (dfsStackNeighbors[stackPointer].length === 0) {
      // If we are at the root of the DFS stack, the exploration from 'prevNode' is complete.
      if (stackPointer === 0) {
        // Reset visited status for the nodes involved in this DFS run.
        isVisited[targetNode] = false;
        isVisited[prevNode] = false;
        return minResult;
      }
      // Backtrack: remove the cost of the edge just traversed (going up the stack).
      currentPathCost -= backwardEdges[dfsStackNodes[stackPointer - 1]][dfsStackNodes[stackPointer]];
      isVisited[dfsStackNodes[stackPointer]] = false; // Mark as unvisited for future DFS runs.
      stackPointer--; // Move up one level in the stack.
      continue;
    }

    // Get the next neighbor to explore from the current node on the stack.
    let nextNode = dfsStackNeighbors[stackPointer].pop();

    // Skip if this neighbor has already been visited in the current DFS path.
    if (isVisited[nextNode]) continue;

    // Calculate the cost of the edge from 'nextNode' to the current stack node.
    let costToNext = backwardEdges[dfsStackNodes[stackPointer]][nextNode];

    // Pruning: If the path from 'prevNode' to 'nextNode' (currentPathCost + costToNext)
    // is already too long to potentially beat 'initialMinCost', skip this path.
    if (currentPathCost + costToNext >= initialMinCost) continue;

    // If 'nextNode' has a lower BFS rank than 'targetNode', its shortest distance from 0 is already finalized.
    // We can form a complete path from 0 to 'prevNode' via 'nextNode'.
    if (nodeRankMap[nextNode] < nodeRankMap[targetNode]) {
      minResult = Math.min(minResult, currentPathCost + costToNext + minDistances[nextNode]);
      continue; // No need to explore further down this path, as we found a complete path.
    }

    // If not pruned and not a complete path, extend the current path.
    currentPathCost += costToNext; // Add the cost of the edge to the current path.
    stackPointer++; // Move deeper into the stack.
    dfsStackNodes[stackPointer] = nextNode; // Add 'nextNode' to the DFS path.
    isVisited[nextNode] = true; // Mark 'nextNode' as visited for this DFS run.
    // Initialize neighbors for the new stack level (from 'nextNode' using backward edges).
    dfsStackNeighbors[stackPointer] = Object.keys(backwardEdges[nextNode]);
  }
}

// Main dynamic programming loop: iterate through nodes in increasing order of their initial BFS distances.
for (let mainLoopIdx in sortedNodesByDist) {
  let currentDPNode = sortedNodesByDist[mainLoopIdx];

  // First pass: Consider direct backward edges from nodes with lower BFS ranks.
  // This is a standard relaxation step, ensuring paths through already finalized nodes are considered.
  for (let neighborDPNode in backwardEdges[currentDPNode]) {
    if (nodeRankMap[neighborDPNode] < nodeRankMap[currentDPNode]) {
      minDistances[currentDPNode] = Math.min(minDistances[currentDPNode], minDistances[neighborDPNode] + forwardEdges[neighborDPNode][currentDPNode]);
    }
  }

  // Second pass: Use DFS to explore paths involving nodes with higher BFS ranks.
  // This step refines distances by considering paths that might "go against" the BFS order.
  for (let neighborDPNode in backwardEdges[currentDPNode]) {
    if (nodeRankMap[neighborDPNode] > nodeRankMap[currentDPNode]) {
      // The 'explorePath' function finds the shortest path from node 0 to 'neighborDPNode'.
      // The 'initialMinCost' passed to 'explorePath' is an upper bound for P(0, neighborDPNode),
      // derived from the current best path to 'currentDPNode' minus the direct edge cost from 'neighborDPNode' to 'currentDPNode'.
      let pathFromZeroToNeighbor = explorePath(neighborDPNode, currentDPNode, minDistances[currentDPNode] - forwardEdges[neighborDPNode][currentDPNode]);
      
      // Update the minimum distance to 'currentDPNode' if a shorter path is found
      // by going from 0 to 'neighborDPNode' (via 'explorePath') and then directly to 'currentDPNode'.
      minDistances[currentDPNode] = Math.min(minDistances[currentDPNode], pathFromZeroToNeighbor + forwardEdges[neighborDPNode][currentDPNode]);
    }
  }
}

// Output the final shortest distances from node 0 to all other nodes.
for (let outputIdx = 0; outputIdx < nodeCount; outputIdx++) {
  console.log(outputIdx + ' ' + minDistances[outputIdx]);
}
