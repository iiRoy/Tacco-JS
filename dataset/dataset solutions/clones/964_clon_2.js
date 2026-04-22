// System configuration for input/output handling.
const systemSettings = { inputFilePath: '/dev/stdin', lineSeparator: '\n' };

const ensure = require('assert'); // Module for assertions.

// Read input data, process it, and extract the node count.
let rawInputLines = require('fs').readFileSync(systemSettings.inputFilePath, 'ascii')
  .trim()
  .split(systemSettings.lineSeparator);
let totalNodeCount = Number(rawInputLines.shift());

// Initialize data structures for vertices and edge weights.
const graphNodes = {};
const edgeCosts = {};

/**
 * Establishes a connection between two vertices with a given cost.
 * @param {Object} connectionMap - The map to store connections (e.g., adjacency list).
 * @param {number} sourceId - The identifier of the source vertex.
 * @param {number} destinationId - The identifier of the destination vertex.
 * @param {number} connectionCost - The cost associated with this connection.
 */
const createConnection = (connectionMap, sourceId, destinationId, connectionCost) => {
  if (!connectionMap.hasOwnProperty(sourceId)) {
    connectionMap[sourceId] = {};
  }
  connectionMap[sourceId][destinationId] = connectionCost;
};

// Parse each input line to populate graph nodes and their connections.
for (const lineIndex in rawInputLines) {
  const currentLineData = rawInputLines[lineIndex].split(' ').map(Number);
  const currentNodeIdentifier = currentLineData[0];

  // Initialize node properties for pathfinding.
  graphNodes[currentNodeIdentifier] = {
    nodeIdentifier: currentNodeIdentifier,
    currentDistance: Number.POSITIVE_INFINITY,
    previousNode: null,
    queuePosition: null
  };

  // Add edges and their weights.
  for (let dataSegmentIndex = 2; dataSegmentIndex < currentLineData.length; dataSegmentIndex += 2) {
    createConnection(edgeCosts, currentNodeIdentifier, currentLineData[dataSegmentIndex], currentLineData[dataSegmentIndex + 1]);
  }
}

// Locate the starting node (typically node 0) and set its initial distance to zero.
for (const nodeKey in graphNodes) {
  if (graphNodes[nodeKey].nodeIdentifier === 0) {
    graphNodes[nodeKey].currentDistance = 0;
    break;
  }
}

// Initialize the min-priority queue (represented as an array).
const minPriorityQueue = new Array(totalNodeCount + 1);
let currentQueueSize = 0;
// Each element in the queue array will hold a node object.
for (let initIndex = 0; initIndex <= totalNodeCount; initIndex++) {
  minPriorityQueue[initIndex] = null;
}

/**
 * Maintains the min-heap property by sifting down an element.
 * @param {Array} queueArrayRef - The array representing the min-priority queue.
 * @param {number} currentIndex - The index of the element to sift down.
 */
const siftDown = (queueArrayRef, currentIndex) => {
  let leftChildIndex, rightChildIndex, minChildIndex, temporaryNode;

  leftChildIndex = 2 * currentIndex;
  rightChildIndex = 2 * currentIndex + 1;

  // Determine the smallest among parent, left child, and right child.
  if (leftChildIndex <= currentQueueSize && queueArrayRef[leftChildIndex].currentDistance < queueArrayRef[currentIndex].currentDistance)
    minChildIndex = leftChildIndex;
  else
    minChildIndex = currentIndex;

  if (rightChildIndex <= currentQueueSize && queueArrayRef[rightChildIndex].currentDistance < queueArrayRef[minChildIndex].currentDistance)
    minChildIndex = rightChildIndex;

  // If the smallest is not the current element, swap them and recursively call siftDown.
  if (minChildIndex !== currentIndex) {
    temporaryNode = queueArrayRef[currentIndex];
    queueArrayRef[currentIndex] = queueArrayRef[minChildIndex];
    queueArrayRef[currentIndex].queuePosition = currentIndex; // Update new position
    queueArrayRef[minChildIndex] = temporaryNode;
    queueArrayRef[minChildIndex].queuePosition = minChildIndex; // Update new position
    siftDown(queueArrayRef, minChildIndex);
  }
};

/**
 * Extracts the minimum element (root) from the min-priority queue.
 * @param {Array} queueArrayRef - The array representing the min-priority queue.
 * @returns {Object} The node with the minimum distance.
 */
const extractMinimum = (queueArrayRef) => {
  let minimumNode;
  ensure(currentQueueSize >= 1, 'Priority queue underflow: cannot extract from an empty queue.');

  minimumNode = queueArrayRef[1];
  minimumNode.queuePosition = null; // Mark as removed from queue.

  queueArrayRef[1] = queueArrayRef[currentQueueSize];
  queueArrayRef[1].queuePosition = 1; // Update new position of moved element.
  queueArrayRef[currentQueueSize] = null; // Clear the last position.

  currentQueueSize--;
  siftDown(queueArrayRef, 1); // Restore heap property.

  return minimumNode;
};

/**
 * Decreases the key (distance) of a node in the priority queue and sifts it up.
 * @param {Array} queueArrayRef - The array representing the min-priority queue.
 * @param {number} elementIndex - The current index of the element to update.
 * @param {Object} updatedNodeData - The node object with the new, smaller distance.
 */
const updateKey = (queueArrayRef, elementIndex, updatedNodeData) => {
  let parentElementIndex, temporaryNodeSwap;

  ensure(updatedNodeData.currentDistance <= queueArrayRef[elementIndex].currentDistance, 'New distance must be less than or equal to current distance.');

  queueArrayRef[elementIndex] = updatedNodeData;
  queueArrayRef[elementIndex].queuePosition = elementIndex; // Ensure position is correct.

  while (elementIndex > 1) {
    parentElementIndex = Math.floor(elementIndex / 2);
    if (queueArrayRef[parentElementIndex].currentDistance <= queueArrayRef[elementIndex].currentDistance) {
      break; // Heap property satisfied.
    }

    // Swap current element with its parent.
    temporaryNodeSwap = queueArrayRef[elementIndex];
    queueArrayRef[elementIndex] = queueArrayRef[parentElementIndex];
    queueArrayRef[elementIndex].queuePosition = elementIndex;
    queueArrayRef[parentElementIndex] = temporaryNodeSwap;
    queueArrayRef[parentElementIndex].queuePosition = parentElementIndex;

    elementIndex = parentElementIndex;
  }
};

// A placeholder node with infinite distance, used for insertion.
const INFINITE_DISTANCE_SENTINEL = {
  nodeIdentifier: null,
  currentDistance: Number.POSITIVE_INFINITY,
  previousNode: null,
  queuePosition: null
};

/**
 * Inserts a new node into the min-priority queue.
 * @param {Array} queueArrayRef - The array representing the min-priority queue.
 * @param {Object} newNodeToInsert - The node object to insert.
 */
const insertIntoQueue = (queueArrayRef, newNodeToInsert) => {
  currentQueueSize++;
  queueArrayRef[currentQueueSize] = INFINITE_DISTANCE_SENTINEL; // Insert sentinel first.
  updateKey(queueArrayRef, currentQueueSize, newNodeToInsert); // Then decrease its key to actual value.
};

/**
 * Updates the shortest path to a neighbor if a shorter path is found.
 * @param {Object} sourceVertex - The current source vertex (u).
 * @param {Object} neighborVertex - The neighboring vertex (v).
 * @param {Object} adjacencyCosts - The map of edge weights (w).
 */
const updateDistances = (sourceVertex, neighborVertex, adjacencyCosts) => {
  // Check if a shorter path to neighborVertex is found through sourceVertex.
  if (neighborVertex.currentDistance > sourceVertex.currentDistance + adjacencyCosts[sourceVertex.nodeIdentifier][neighborVertex.nodeIdentifier]) {
    neighborVertex.currentDistance = sourceVertex.currentDistance + adjacencyCosts[sourceVertex.nodeIdentifier][neighborVertex.nodeIdentifier];
    neighborVertex.previousNode = sourceVertex;

    // If the neighbor is still in the priority queue, update its position.
    if (neighborVertex.queuePosition !== null) {
      updateKey(minPriorityQueue, neighborVertex.queuePosition, neighborVertex);
    }
  }
};

/**
 * Computes the shortest paths from a source node to all other nodes using Dijkstra's algorithm.
 * @param {Object} adjacencyCosts - The map representing edge weights.
 */
const computeShortestPaths = (adjacencyCosts) => {
  const finalizedNodesSet = []; // Stores nodes whose shortest path has been finalized.
  let currentNodeInProcess;

  // Initially add all graph nodes to the priority queue.
  for (const nodeKey in graphNodes) {
    insertIntoQueue(minPriorityQueue, graphNodes[nodeKey]);
  }

  // Continue as long as there are nodes in the priority queue.
  while (currentQueueSize !== 0) {
    currentNodeInProcess = extractMinimum(minPriorityQueue);
    finalizedNodesSet.push(currentNodeInProcess);

    // Iterate over all neighbors of the extracted node.
    for (const neighborIdKey in adjacencyCosts[currentNodeInProcess.nodeIdentifier]) {
      const neighborVertex = graphNodes[neighborIdKey];
      updateDistances(currentNodeInProcess, neighborVertex, adjacencyCosts);
    }
  }
};

// Execute the shortest path computation.
computeShortestPaths(edgeCosts);

// Output the calculated shortest distances for each node.
for (const finalNodeKey in graphNodes) {
  console.log("%s %d", finalNodeKey, graphNodes[finalNodeKey].currentDistance);
}