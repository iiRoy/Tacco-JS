const ioSettings = {
  sourceFile: '/dev/stdin', // Default for Linux environments
  lineSeparator: '\n',
  // Potentially add: isWindows: process.platform === 'win32'
};

// Override for Windows if necessary, though not strictly part of cloning
// if (ioSettings.isWindows) { ioSettings.sourceFile = 'tmp'; ioSettings.lineSeparator = '\r\n'; }

const strictAssert = require('assert').strict; // Using strict assertions

// Class to represent a node in the graph
class GraphNode {
  constructor(identifier) {
    this.vertexIdentifier = identifier;
    this.distanceFromSource = Infinity; // 'd' - initialized to positive infinity
    this.predecessorNodeId = null;     // 'pi' - stores the ID of the predecessor node
    this.heapPositionIndex = null;     // 'heapindex' - stores current position in the priority queue's underlying array
  }
}

// Read raw input data from the configured source file
const rawInputContent = require('fs').readFileSync(ioSettings.sourceFile, 'utf8');
const inputLines = rawInputContent
  .trim() // Remove leading/trailing whitespace
  .split(ioSettings.lineSeparator) // Split into individual lines
  .filter(lineContent => lineContent.length > 0); // Discard any empty lines

// The first line contains the total number of vertices
const totalVertices = Number(inputLines.shift()); // 'n'
if (isNaN(totalVertices) || totalVertices < 0) {
  strictAssert.fail('Input error: Invalid or missing total number of vertices.');
}

// Data structures for graph representation
const nodeRegistry = new Map(); // 'V' - Maps vertex ID to GraphNode objects
const adjacencyMap = new Map(); // 'w' - Maps source vertex ID to a Map of (destination vertex ID -> edge weight)

/**
 * Establishes a directed edge between two vertices with a given weight.
 * @param {number} originId The ID of the starting vertex.
 * @param {number} destinationId The ID of the ending vertex.
 * @param {number} weight The cost/weight of the edge.
 */
function establishEdge(originId, destinationId, weight) {
  if (!adjacencyMap.has(originId)) {
    adjacencyMap.set(originId, new Map());
  }
  adjacencyMap.get(originId).set(destinationId, weight);
}

// Process remaining input lines to build the graph
for (const currentLineContent of inputLines) {
  const parsedLineTokens = currentLineContent.split(' ').map(Number);
  const currentVertexId = parsedLineTokens[0];

  if (isNaN(currentVertexId) || currentVertexId < 0) {
    console.warn(`Skipping line due to invalid vertex ID: ${currentVertexId}`);
    continue;
  }

  // Ensure the current vertex exists in the registry
  if (!nodeRegistry.has(currentVertexId)) {
    nodeRegistry.set(currentVertexId, new GraphNode(currentVertexId));
  }

  // Iterate through edge pairs (neighbor ID, edge weight) starting from the third token
  // Original code: ary[0] is u, ary[1] is a count (unused), then pairs start from ary[2]
  for (let tokenIndex = 2; tokenIndex < parsedLineTokens.length; tokenIndex += 2) {
    const neighborId = parsedLineTokens[tokenIndex];
    const edgeWeight = parsedLineTokens[tokenIndex + 1];

    if (isNaN(neighborId) || isNaN(edgeWeight) || neighborId < 0 || edgeWeight < 0) {
      console.warn(`Skipping malformed edge data for vertex ${currentVertexId}: neighbor ${neighborId}, weight ${edgeWeight}`);
      continue; // Skip this pair, proceed with next if available
    }

    // Ensure the neighbor vertex also exists in the registry
    if (!nodeRegistry.has(neighborId)) {
      nodeRegistry.set(neighborId, new GraphNode(neighborId));
    }

    establishEdge(currentVertexId, neighborId, edgeWeight);
  }
}

// Set the initial distance of the source node to 0.
// The original code implicitly uses node 0 as the source.
const sourceVertexId = 0;
if (nodeRegistry.has(sourceVertexId)) {
  nodeRegistry.get(sourceVertexId).distanceFromSource = 0;
} else if (totalVertices > 0) {
  // If source node 0 is not in the input (e.g., a disconnected graph), add it.
  const sourceNode = new GraphNode(sourceVertexId);
  sourceNode.distanceFromSource = 0;
  nodeRegistry.set(sourceVertexId, sourceNode);
}


// --- Min-Priority Queue Implementation (Heap) ---

class MinPriorityQueue {
  constructor(initialCapacity) {
    // The heap array is 1-indexed for simpler parent/child calculations
    this._heapArray = new Array(initialCapacity + 1).fill(null);
    this._currentSize = 0; // Number of elements currently in the heap
  }

  /**
   * Checks if the priority queue is empty.
   * @returns {boolean} True if empty, false otherwise.
   */
  get isEmpty() {
    return this._currentSize === 0;
  }

  /**
   * Returns the number of elements in the priority queue.
   * @returns {number} The current size.
   */
  get size() {
    return this._currentSize;
  }

  /**
   * Swaps two elements in the heap array and updates their stored heap indices.
   * @param {number} index1 The first index.
   * @param {number} index2 The second index.
   * @private
   */
  _swapElements(index1, index2) {
    const tempNode = this._heapArray[index1];
    this._heapArray[index1] = this._heapArray[index2];
    this._heapArray[index2] = tempNode;

    // Update the heapPositionIndex property on the actual GraphNode objects
    this._heapArray[index1].heapPositionIndex = index1;
    this._heapArray[index2].heapPositionIndex = index2;
  }

  /**
   * Restores the min-heap property by sifting a node down the heap.
   * @param {number} index The index of the node to sift down.
   * @private
   */
  _siftDown(index) { // Equivalent to original minHeapify
    let smallestElementIdx = index;
    const leftChildIdx = 2 * index;
    const rightChildIdx = 2 * index + 1;

    // Compare with left child
    if (leftChildIdx <= this._currentSize &&
        this._heapArray[leftChildIdx].distanceFromSource < this._heapArray[smallestElementIdx].distanceFromSource) {
      smallestElementIdx = leftChildIdx;
    }

    // Compare with right child
    if (rightChildIdx <= this._currentSize &&
        this._heapArray[rightChildIdx].distanceFromSource < this._heapArray[smallestElementIdx].distanceFromSource) {
      smallestElementIdx = rightChildIdx;
    }

    // If the current node is not the smallest, swap and continue sifting down
    if (smallestElementIdx !== index) {
      this._swapElements(index, smallestElementIdx);
      this._siftDown(smallestElementIdx);
    }
  }

  /**
   * Restores the min-heap property by bubbling a node up the heap.
   * @param {number} index The index of the node to bubble up.
   * @private
   */
  _bubbleUp(index) { // Part of original heapDecreaseKey logic
    let currentIdx = index;
    while (currentIdx > 1) {
      const parentIdx = Math.floor(currentIdx / 2);
      // If parent is smaller or equal, min-heap property is satisfied
      if (this._heapArray[parentIdx].distanceFromSource <= this._heapArray[currentIdx].distanceFromSource) {
        break;
      }
      this._swapElements(currentIdx, parentIdx);
      currentIdx = parentIdx;
    }
  }

  /**
   * Inserts a new GraphNode object into the priority queue.
   * @param {GraphNode} nodeObject The node to insert.
   */
  insert(nodeObject) { // Equivalent to original minHeapInsert
    this._currentSize++;
    // Dynamically resize heap array if capacity is exceeded
    if (this._currentSize >= this._heapArray.length) {
      this._heapArray.length = this._currentSize * 2; // Double capacity
    }
    this._heapArray[this._currentSize] = nodeObject;
    nodeObject.heapPositionIndex = this._currentSize; // Store its position
    this._bubbleUp(this._currentSize); // Bubble up to maintain min-heap property
  }

  /**
   * Extracts and returns the node with the minimum distance from the priority queue.
   * @returns {GraphNode} The node with the minimum distance.
   */
  extractMinimum() { // Equivalent to original heapExtractMin
    strictAssert(!this.isEmpty, 'Priority queue underflow: Cannot extract from an empty queue.');

    const minimumNode = this._heapArray[1];
    minimumNode.heapPositionIndex = null; // Mark node as no longer in the heap

    // Move the last element to the root
    this._heapArray[1] = this._heapArray[this._currentSize];
    this._heapArray[1].heapPositionIndex = 1;
    this._heapArray[this._currentSize] = null; // Clear the last position
    this._currentSize--;

    // If elements remain, restore heap property
    if (this._currentSize > 0) {
      this._siftDown(1);
    }
    return minimumNode;
  }

  /**
   * Updates the position of a node in the heap after its key (distance) has decreased.
   * Assumes the node's distanceFromSource property has already been updated externally.
   * @param {GraphNode} nodeObject The node whose distance has decreased.
   */
  decreaseKey(nodeObject) { // Equivalent to original heapDecreaseKey logic
    // Only proceed if the node is actually in the heap
    if (nodeObject.heapPositionIndex !== null && nodeObject.heapPositionIndex <= this._currentSize) {
      this._bubbleUp(nodeObject.heapPositionIndex);
    }
  }
}


// --- Dijkstra's Algorithm Functions ---

/**
 * Attempts to relax an edge from a source node to a neighbor node.
 * If a shorter path to the neighbor is found, its distance is updated,
 * and its position in the priority queue is adjusted.
 * @param {GraphNode} currentNode The node currently being processed (u).
 * @param {GraphNode} neighborNode The adjacent node (v).
 * @param {Map<number, Map<number, number>>} globalAdjacencyMap The global map of edge weights.
 * @param {MinPriorityQueue} graphPriorityQueue The priority queue instance.
 */
function updateNeighborDistance(currentNode, neighborNode, globalAdjacencyMap, graphPriorityQueue) { // Equivalent to original relax
  const edgeWeightsFromCurrent = globalAdjacencyMap.get(currentNode.vertexIdentifier);
  if (!edgeWeightsFromCurrent) {
      // Current node has no outgoing edges, or data is malformed
      return;
  }
  const edgeWeight = edgeWeightsFromCurrent.get(neighborNode.vertexIdentifier);

  if (edgeWeight === undefined) {
      // No direct edge found between current and neighbor
      return;
  }

  const newPathDistance = currentNode.distanceFromSource + edgeWeight;

  // If a shorter path to the neighbor is found
  if (neighborNode.distanceFromSource > newPathDistance) {
    neighborNode.distanceFromSource = newPathDistance;
    neighborNode.predecessorNodeId = currentNode.vertexIdentifier; // Store predecessor's ID

    // If the neighbor is in the priority queue, update its position
    if (neighborNode.heapPositionIndex !== null) {
      graphPriorityQueue.decreaseKey(neighborNode);
    }
    // Note: If neighborNode was not in the queue (e.g., already extracted),
    // this implementation assumes it's still there or will be re-inserted.
    // Standard Dijkstra typically inserts all nodes initially and relies on decreaseKey.
  }
}

/**
 * Computes the shortest paths from the source node (node 0) to all other nodes
 * in the graph using Dijkstra's algorithm.
 * @param {Map<number, GraphNode>} nodesMap The map of all graph nodes.
 * @param {Map<number, Map<number, number>>} adjacencies The adjacency map representing graph edges.
 */
function computeShortestPaths(nodesMap, adjacencies) { // Equivalent to original dijkstra
  const visitedNodesCollection = new Set(); // 'S' - Set of nodes whose shortest path has been finalized

  // Initialize a priority queue with all nodes.
  // Initial distances (0 for source, Infinity for others) are already set in nodesMap.
  const graphPriorityQueue = new MinPriorityQueue(nodesMap.size + 1);
  for (const node of nodesMap.values()) {
    graphPriorityQueue.insert(node);
  }

  // Main Dijkstra loop: continue until all reachable nodes are processed
  while (!graphPriorityQueue.isEmpty) {
    const currentMinNode = graphPriorityQueue.extractMinimum(); // 'u'

    // Optimization: If the extracted node has an infinite distance, it means
    // all remaining nodes in the queue are unreachable from the source.
    if (currentMinNode.distanceFromSource === Infinity) {
      break;
    }

    visitedNodesCollection.add(currentMinNode.vertexIdentifier); // Mark node as finalized

    // Iterate over all neighbors of the current node
    const neighborsAndWeights = adjacencies.get(currentMinNode.vertexIdentifier);
    if (neighborsAndWeights) { // Check if current node has any outgoing edges
      for (const neighborId of neighborsAndWeights.keys()) {
        const neighborNode = nodesMap.get(neighborId);
        // Ensure neighbor exists. The original `relax` does not check if `v` is in `S`.
        // The priority queue's `decreaseKey` handles multiple updates.
        if (neighborNode) {
          updateNeighborDistance(currentMinNode, neighborNode, adjacencies, graphPriorityQueue);
        }
      }
    }
  }
}

// --- Execution and Output ---

// Run Dijkstra's algorithm
computeShortestPaths(nodeRegistry, adjacencyMap);

// Output the shortest distances from the source node to all other nodes
for (const [nodeIdentifier, nodeDetails] of nodeRegistry.entries()) {
  console.log(`${nodeIdentifier} ${nodeDetails.distanceFromSource}`);
}