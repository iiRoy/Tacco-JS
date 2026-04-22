'use strict';

// Defines a custom minimum priority queue data structure.
// This queue maintains its elements in a min-heap structure based on a provided comparator function.
function MinPriorityQueue( elementComparator ) {
  // Validate the comparator function.
  if (typeof elementComparator !== 'function') {
    throw new Error('A comparison function must be provided to the MinPriorityQueue constructor.');
  }

  // The internal array representing the min-heap.
  this.internalStorage = [];
  // The function used to compare two elements.
  // It should return a negative number if a < b, positive if a > b, and 0 if a == b.
  this.elementComparator = elementComparator;
}

// Helper method to swap two elements in the internal array.
MinPriorityQueue.prototype._swapElements = function(idxA, idxB) {
  if (idxA < 0 || idxA >= this.internalStorage.length || idxB < 0 || idxB >= this.internalStorage.length) {
    // Optionally, throw an error or log a warning for invalid indices.
    return;
  }
  const temporaryVal = this.internalStorage[idxA];
  this.internalStorage[idxA] = this.internalStorage[idxB];
  this.internalStorage[idxB] = temporaryVal;
};

// Helper method to get the parent index of a given child index.
MinPriorityQueue.prototype._getParentIndex = function(childIdx) {
  if (childIdx <= 0) return -1; // Root has no parent, or invalid index.
  return Math.floor((childIdx - 1) / 2);
};

// Helper method to get the left child index of a given parent index.
MinPriorityQueue.prototype._getLeftChildIndex = function(parentIdx) {
  return (2 * parentIdx) + 1;
};

// Helper method to get the right child index of a given parent index.
MinPriorityQueue.prototype._getRightChildIndex = function(parentIdx) {
  return (2 * parentIdx) + 2;
};

// Inserts a new element into the priority queue and maintains the heap property.
MinPriorityQueue.prototype.offer = function( newElement ) {
  if (newElement === undefined || newElement === null) {
    console.warn("Attempted to insert an undefined or null element into the priority queue.");
    return;
  }

  this.internalStorage.push(newElement);
  let currentElementIndex = this.internalStorage.length - 1;

  // Perform heapify-up operation to restore heap property.
  while (currentElementIndex > 0) {
    const parentIdx = this._getParentIndex(currentElementIndex);
    const parentElement = this.internalStorage[parentIdx];
    const currentElement = this.internalStorage[currentElementIndex];

    // If the current element is smaller than its parent, swap them.
    if (this.elementComparator(currentElement, parentElement) < 0) {
      this._swapElements(currentElementIndex, parentIdx);
      currentElementIndex = parentIdx;
    } else {
      // Heap property is satisfied, no further swaps needed.
      break;
    }
  }
};

// Removes and returns the element with the highest priority (minimum value) from the queue.
MinPriorityQueue.prototype.poll = function() {
  const queueSize = this.internalStorage.length;
  if (queueSize === 0) {
    return undefined; // Queue is empty.
  }
  if (queueSize === 1) {
    return this.internalStorage.pop(); // Only one element, just remove and return it.
  }

  // The minimum element is at the root (index 0).
  const minimumValue = this.internalStorage[0];
  // Move the last element to the root position.
  const lastElement = this.internalStorage.pop();
  this.internalStorage[0] = lastElement;

  let currentIndex = 0;
  const newQueueSize = this.internalStorage.length;

  // Perform heapify-down operation to restore heap property.
  while (true) {
    const leftChildIdx = this._getLeftChildIndex(currentIndex);
    const rightChildIdx = this._getRightChildIndex(currentIndex);
    let smallestChildIdx = currentIndex; // Assume current node is smallest initially.

    // Check if left child exists and is smaller than current smallest.
    if (leftChildIdx < newQueueSize && this.elementComparator(this.internalStorage[leftChildIdx], this.internalStorage[smallestChildIdx]) < 0) {
      smallestChildIdx = leftChildIdx;
    }

    // Check if right child exists and is smaller than current smallest.
    if (rightChildIdx < newQueueSize && this.elementComparator(this.internalStorage[rightChildIdx], this.internalStorage[smallestChildIdx]) < 0) {
      smallestChildIdx = rightChildIdx;
    }

    // If the current node is not the smallest among itself and its children, swap with the smallest child.
    if (smallestChildIdx !== currentIndex) {
      this._swapElements(currentIndex, smallestChildIdx);
      currentIndex = smallestChildIdx; // Continue heapifying down from the new position.
    } else {
      // Heap property is satisfied, no further swaps needed.
      break;
    }
  }

  return minimumValue;
};

// Returns the element with the highest priority (minimum value) without removing it.
MinPriorityQueue.prototype.peekMin = function() {
  if (this.internalStorage.length === 0) {
    return undefined;
  }
  return this.internalStorage[0];
};

// Returns the number of elements in the queue.
MinPriorityQueue.prototype.getSize = function() {
  return this.internalStorage.length;
};

// Checks if the queue is empty.
MinPriorityQueue.prototype.isEmptyQueue = function() {
  return this.internalStorage.length === 0;
};

// --- Graph Algorithm Specifics ---

const MAX_VERTICES_LIMIT = 100000; // Maximum number of vertices supported.
const MAX_POSSIBLE_DISTANCE = Number.POSITIVE_INFINITY / 2; // A large value representing unreachable paths.

let vertexCount; // Total number of vertices in the graph.
let edgeCount;   // Total number of edges in the graph.
let initialVertex; // The starting vertex for the shortest path calculation.

let graphAdjacencyList; // Adjacency list representation of the graph.
let pathDistances;      // Array to store the shortest distance from the source to each vertex.

// Calculates the shortest paths from a source vertex to all other vertices using Dijkstra's algorithm.
function computeShortestPaths( originNode ) {
  // Basic input validation for the origin node.
  if (originNode < 0 || originNode >= vertexCount) {
    console.error(`Invalid origin node: ${originNode}. Must be between 0 and ${vertexCount - 1}.`);
    return;
  }

  // Initialize all distances to infinity, except for the origin node which is 0.
  // This is crucial for the algorithm's correctness.
  for (let i = 0; i < vertexCount; ++i) {
    pathDistances[i] = MAX_POSSIBLE_DISTANCE;
  }
  pathDistances[originNode] = 0;

  // The priority queue stores objects of { currentDistance, vertexId }.
  // It orders them by currentDistance, then by vertexId for tie-breaking.
  const minHeap = new MinPriorityQueue(function(nodeA, nodeB) {
    // Compare based on distance first.
    if (nodeA.currentDistance !== nodeB.currentDistance) {
      return nodeA.currentDistance - nodeB.currentDistance;
    }
    // If distances are equal, compare by vertex ID to ensure a stable ordering.
    return nodeA.vertexId - nodeB.vertexId;
  });

  // Add the starting node to the priority queue.
  minHeap.offer({ currentDistance: 0, vertexId: originNode });

  // Process nodes from the priority queue until it's empty.
  while (!minHeap.isEmptyQueue()) {
    const extractedVertexInfo = minHeap.poll();

    const currentVertexId = extractedVertexInfo.vertexId;
    const distanceToCurrentVertex = extractedVertexInfo.currentDistance;

    // Optimization: If we've already found a shorter path to this vertex, skip.
    // This handles redundant entries in the priority queue.
    if (distanceToCurrentVertex > pathDistances[currentVertexId]) {
      continue;
    }

    // Iterate over all outgoing edges from the current vertex.
    const neighbors = graphAdjacencyList[currentVertexId];
    if (neighbors && neighbors.length > 0) { // Ensure neighbors array exists and is not empty.
      for (const connection of neighbors) {
        const targetVertex = connection.targetVertex;
        const edgeWeight = connection.edgeWeight;

        const newCalculatedDistance = pathDistances[currentVertexId] + edgeWeight;

        // If a shorter path to the target vertex is found, update its distance
        // and add it to the priority queue.
        if (newCalculatedDistance < pathDistances[targetVertex]) {
          pathDistances[targetVertex] = newCalculatedDistance;
          minHeap.offer({ currentDistance: newCalculatedDistance, vertexId: targetVertex });
        }
      }
    }
  }
  // The pathDistances array now contains the shortest distances from the originNode.
}

// Main execution block: reads input, builds graph, runs Dijkstra, and prints results.
(function initializeGraphAndRunDijkstra( rawInputData ) {
  // Guard clause for empty input.
  if (!rawInputData || typeof rawInputData !== 'string') {
    console.error("No input data provided or invalid format.");
    return;
  }

  const inputLines = rawInputData.trim().split('\n');
  let isFirstConfigurationLine = true;

  // Process each line of the input.
  for (let lineIndex = 0; lineIndex < inputLines.length; ++lineIndex) {
    const currentLine = inputLines[lineIndex];
    // Skip empty lines or lines with only whitespace.
    if (currentLine.trim() === '') {
      continue;
    }

    const parsedNumbers = currentLine.split(' ').map(Number);

    // The first line contains graph configuration (V, E, r).
    if (isFirstConfigurationLine) {
      vertexCount = parsedNumbers[0];
      edgeCount = parsedNumbers[1];
      initialVertex = parsedNumbers[2];

      // Initialize graph adjacency list.
      graphAdjacencyList = new Array(vertexCount);
      for (let i = 0; i < vertexCount; ++i) {
        graphAdjacencyList[i] = [];
      }

      // Initialize distances array.
      pathDistances = new Array(vertexCount);
      // For robustness, ensure all elements are initialized to MAX_POSSIBLE_DISTANCE.
      for (let i = 0; i < vertexCount; ++i) {
        pathDistances[i] = MAX_POSSIBLE_DISTANCE;
      }
      isFirstConfigurationLine = false; // Mark that the first line has been processed.
    } else {
      // Subsequent lines define edges: u, v, cost.
      const sourceNode = parsedNumbers[0];
      const targetNode = parsedNumbers[1];
      const edgeCost = parsedNumbers[2];

      // Add the edge to the adjacency list.
      // Assuming a directed graph based on the original structure.
      graphAdjacencyList[sourceNode].push({ targetVertex: targetNode, edgeWeight: edgeCost });
    }
  }

  // After parsing all input, execute Dijkstra's algorithm.
  computeShortestPaths( initialVertex );

  // Output the calculated shortest distances.
  pathDistances.forEach( function(distanceValue) {
    // Format output: "INF" for unreachable nodes, otherwise the distance.
    if (distanceValue === MAX_POSSIBLE_DISTANCE) {
      console.log("INF");
    } else {
      console.log(distanceValue);
    }
  });

})( require('fs').readFileSync( '/dev/stdin', 'utf8' ) ); // Reads input from standard input.