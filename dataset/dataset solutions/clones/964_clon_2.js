cfgSettings = {
  input: '/dev/stdin',
  newline: '\n'
}; // Linux configuration

const assert = require('assert'); // Assertion library for debugging

// Read input data from the specified source
const inputLines = require('fs').readFileSync(cfgSettings.input, 'ascii')
  .trim() // Remove leading/trailing whitespace
  .split(cfgSettings.newline); // Split into individual lines

let nodeCount = Number(inputLines.shift()); // First line is the number of nodes
const vertexData = {}; // Stores node objects (id, distance, predecessor, heap index)
const edgeWeights = {}; // Adjacency list for edge weights

/**
 * Adds a weighted edge to the target map.
 * @param {object} targetMap - The map to which the edge is added (e.g., edgeWeights).
 * @param {number} sourceNodeId - The ID of the source node.
 * @param {number} destNodeId - The ID of the destination node.
 * @param {number} weightVal - The weight of the edge.
 */
function addWeightedEdge(targetMap, sourceNodeId, destNodeId, weightVal) {
  if (!targetMap.hasOwnProperty(sourceNodeId)) {
    targetMap[sourceNodeId] = {}; // Initialize if source node not present
  }
  targetMap[sourceNodeId][destNodeId] = weightVal; // Set the weight
}

// Process each line of input to populate vertex data and edge weights
for (let idx in inputLines) {
  const parsedLine = inputLines[idx].split(' ').map(Number); // Parse line into numbers
  const sourceNodeId = parsedLine[0];

  // Initialize vertex properties for the current node
  vertexData[sourceNodeId] = {
    'identifier': sourceNodeId,
    'distance': Number.POSITIVE_INFINITY, // Initial distance is infinite
    'predecessor': null, // No predecessor initially
    'heapPosition': null // Not in heap yet
  };

  // Add outgoing edges from the current source node
  for (let subIdx = 2; subIdx < parsedLine.length; subIdx += 2) {
    addWeightedEdge(edgeWeights, sourceNodeId, parsedLine[subIdx], parsedLine[subIdx + 1]);
  }
}

// Set the distance of the starting node (node with identifier 0) to 0
for (let nodeIdStr in vertexData) {
  if (vertexData[nodeIdStr].identifier === 0) {
    vertexData[nodeIdStr].distance = 0;
    break;
  }
}

// --- Min-Priority Queue (Heap) Implementation ---

const priorityQueue = new Array(nodeCount + 1); // Array to represent the min-heap
let queueSize = 0; // Current number of elements in the heap

// Initialize heap array with nulls
for (let idx = 0; idx <= nodeCount; idx++) {
  priorityQueue[idx] = null; // Heap stores node objects
}

/**
 * Maintains the min-heap property by sifting down an element.
 * @param {Array} heapArray - The array representing the heap.
 * @param {number} currentIdx - The index of the element to sift down.
 */
function siftDownMinHeap(heapArray, currentIdx) {
  let leftChildIdx, rightChildIdx, minElementIdx, tempNode;
  leftChildIdx = 2 * currentIdx;
  rightChildIdx = 2 * currentIdx + 1;

  // Determine the smallest among current, left child, and right child
  if (leftChildIdx <= queueSize && heapArray[leftChildIdx].distance < heapArray[currentIdx].distance) {
    minElementIdx = leftChildIdx;
  } else {
    minElementIdx = currentIdx;
  }

  if (rightChildIdx <= queueSize && heapArray[rightChildIdx].distance < heapArray[minElementIdx].distance) {
    minElementIdx = rightChildIdx;
  }

  // If the smallest is not the current element, swap and recurse
  if (minElementIdx !== currentIdx) {
    tempNode = heapArray[currentIdx];
    heapArray[currentIdx] = heapArray[minElementIdx];
    heapArray[currentIdx].heapPosition = currentIdx; // Update heap index
    heapArray[minElementIdx] = tempNode;
    heapArray[minElementIdx].heapPosition = minElementIdx; // Update heap index
    siftDownMinHeap(heapArray, minElementIdx);
  }
}

/**
 * Extracts the minimum element (root) from the min-heap.
 * @param {Array} heapArray - The array representing the heap.
 * @returns {object} The node object with the minimum distance.
 */
function extractMinimum(heapArray) {
  let extractedMin;
  assert(queueSize >= 1, 'Priority queue underflow detected'); // Ensure heap is not empty

  extractedMin = heapArray[1]; // The minimum element is at the root
  extractedMin.heapPosition = null; // Mark as no longer in heap

  heapArray[1] = heapArray[queueSize]; // Move last element to root
  heapArray[1].heapPosition = 1; // Update its heap index
  heapArray[queueSize] = null; // Clear the last position
  queueSize--; // Decrease heap size

  siftDownMinHeap(heapArray, 1); // Sift down the new root to maintain heap property
  return extractedMin;
}

/**
 * Decreases the key value of an element in the min-heap and sifts it up.
 * @param {Array} heapArray - The array representing the heap.
 * @param {number} currentIdx - The index of the element whose key is decreased.
 * @param {object} newNodeInfo - The new node object with the decreased key (distance).
 */
function decreaseKeyValue(heapArray, currentIdx, newNodeInfo) {
  let parentNodeIdx, tempNode;
  assert(newNodeInfo.distance <= heapArray[currentIdx].distance, 'New key value is larger than current key'); // New key must be smaller or equal

  heapArray[currentIdx] = newNodeInfo; // Update the node object
  heapArray[currentIdx].heapPosition = currentIdx; // Update its heap index

  // Sift up the element until min-heap property is restored
  while (currentIdx > 1) {
    parentNodeIdx = Math.floor(currentIdx / 2);
    if (heapArray[parentNodeIdx].distance <= heapArray[currentIdx].distance) {
      break; // Parent is smaller or equal, heap property holds
    }
    // Swap with parent
    tempNode = heapArray[currentIdx];
    heapArray[currentIdx] = heapArray[parentNodeIdx];
    heapArray[currentIdx].heapPosition = currentIdx; // Update heap index
    heapArray[parentNodeIdx] = tempNode;
    heapArray[parentNodeIdx].heapPosition = parentNodeIdx; // Update heap index
    currentIdx = parentNodeIdx; // Move up
  }
}

const INFINITE_DISTANCE_NODE = {
  'identifier': null,
  'distance': Number.POSITIVE_INFINITY,
  'predecessor': null,
  'heapPosition': null
};

/**
 * Inserts a new element into the min-heap.
 * @param {Array} heapArray - The array representing the heap.
 * @param {object} newNodeInfo - The node object to insert.
 */
function insertIntoMinHeap(heapArray, newNodeInfo) {
  queueSize++; // Increase heap size
  heapArray[queueSize] = INFINITE_DISTANCE_NODE; // Insert a placeholder with infinite distance
  decreaseKeyValue(heapArray, queueSize, newNodeInfo); // Decrease its key to the actual value and sift up
}

// --- Dijkstra's Algorithm Implementation ---

/**
 * Relaxes an edge (u, v) with weight w.
 * Updates the distance to v if a shorter path through u is found.
 * @param {object} sourceNode - The source node object (u).
 * @param {object} targetNode - The target node object (v).
 * @param {object} edgeWeightsMap - The map containing edge weights.
 */
function updateEdge(sourceNode, targetNode, edgeWeightsMap) {
  // Check if a shorter path to targetNode through sourceNode exists
  if (targetNode.distance > sourceNode.distance + edgeWeightsMap[sourceNode.identifier][targetNode.identifier]) {
    targetNode.distance = sourceNode.distance + edgeWeightsMap[sourceNode.identifier][targetNode.identifier]; // Update distance
    targetNode.predecessor = sourceNode; // Set predecessor
    // If targetNode is in the heap, update its position
    if (targetNode.heapPosition !== null) {
      decreaseKeyValue(priorityQueue, targetNode.heapPosition, targetNode);
    }
  }
}

/**
 * Executes Dijkstra's shortest path algorithm.
 * @param {object} edgeWeightsMap - The map containing edge weights.
 */
function runDijkstraAlgorithm(edgeWeightsMap) {
  const finalizedNodes = []; // Stores nodes whose shortest path has been finalized
  const currentQueue = priorityQueue; // Reference to the global priority queue

  // Insert all vertices into the min-priority queue
  for (let nodeIdStr in vertexData) {
    insertIntoMinHeap(currentQueue, vertexData[nodeIdStr]);
  }

  // Continue while the priority queue is not empty
  while (queueSize !== 0) {
    const extractedNode = extractMinimum(currentQueue); // Extract node with minimum distance
    finalizedNodes.push(extractedNode); // Add to finalized set

    // Iterate over all neighbors of the extracted node
    for (let neighborIdStr in edgeWeightsMap[extractedNode.identifier]) {
      const neighborNode = vertexData[neighborIdStr]; // Get the neighbor node object
      updateEdge(extractedNode, neighborNode, edgeWeightsMap); // Relax the edge
    }
  }
}

// Run the Dijkstra algorithm
runDijkstraAlgorithm(edgeWeights);

// Output the shortest distance from the source (node 0) to all other nodes
for (let nodeIdStr in vertexData) {
  console.log("%s %d", nodeIdStr, vertexData[nodeIdStr].distance);
}
