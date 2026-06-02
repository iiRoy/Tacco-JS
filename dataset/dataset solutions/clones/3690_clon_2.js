function processInput(inputString) {
  // Split the entire input string into an array of lines.
  const lines = inputString.split("\n");

  // Parse the first line to get graph parameters.
  const initialParameters = lines[0].split(" ").map(value => +value);

  // Extract the number of edges.
  const numberOfEdges = initialParameters[1];
  // Extract the starting node for the first Dijkstra run (0-indexed).
  const startNodeForPathA = initialParameters[2] - 1;
  // Extract the starting node for the second Dijkstra run (0-indexed).
  const startNodeForPathB = initialParameters[3] - 1;
  // Extract the total number of nodes.
  const totalNodes = initialParameters[0];

  // Arrays to store edge information: source, target, and two sets of weights.
  const sourceVertices = [];
  const targetVertices = [];
  const weightsSetA = [];
  const weightsSetB = [];

  // Populate edge arrays from the input lines.
  for (let edgeIndex = 0; edgeIndex < numberOfEdges; edgeIndex++) {
    const edgeDetails = lines[edgeIndex + 1].split(" ").map(value => +value);
    sourceVertices[edgeIndex] = edgeDetails[0] - 1; // Convert to 0-indexed
    targetVertices[edgeIndex] = edgeDetails[1] - 1; // Convert to 0-indexed
    weightsSetA[edgeIndex] = edgeDetails[2];
    weightsSetB[edgeIndex] = edgeDetails[3];
  }

  // Calculate shortest paths from startNodeForPathA using weightsSetA.
  const distancesFromStartA = calculateShortestPaths(sourceVertices, targetVertices, weightsSetA, startNodeForPathA, totalNodes);
  // Calculate shortest paths from startNodeForPathB using weightsSetB.
  const distancesFromStartB = calculateShortestPaths(sourceVertices, targetVertices, weightsSetB, startNodeForPathB, totalNodes);

  // Array to store the final calculated values for each node.
  const finalCalculatedValues = [];
  let currentVertexIndex = totalNodes - 1;

  // Calculate the value for the last node.
  finalCalculatedValues[currentVertexIndex] = 1e15 - distancesFromStartA[currentVertexIndex] - distancesFromStartB[currentVertexIndex];

  // Iterate backwards to calculate and find the maximum cumulative value.
  for (; currentVertexIndex--;) {
    finalCalculatedValues[currentVertexIndex] = Math.max(
      finalCalculatedValues[currentVertexIndex + 1],
      1e15 - distancesFromStartA[currentVertexIndex] - distancesFromStartB[currentVertexIndex]
    );
  }

  // Output the results, each on a new line.
  console.log(finalCalculatedValues.join("\n"));
}

/**
 * Implements Dijkstra's algorithm to find the shortest paths from a source vertex
 * to all other vertices in a graph.
 * @param {number[]} srcNodes - Array of source nodes for each edge.
 * @param {number[]} destNodes - Array of destination nodes for each edge.
 * @param {number[]} edgeWeights - Array of weights for each edge.
 * @param {number} startVertex - The starting vertex for Dijkstra's algorithm (0-indexed).
 * @param {number} totalVertices - The total number of vertices in the graph.
 * @returns {number[]} An array where the index is the vertex and the value is the shortest distance from the startVertex.
 */
function calculateShortestPaths(srcNodes, destNodes, edgeWeights, startVertex, totalVertices) {
  // Initialize an adjacency matrix to represent the graph.
  // Each cell [i][j] stores the weight of the edge between i and j.
  const graphAdjacency = Array(totalVertices).fill(0).map(row => []);

  // Populate the adjacency matrix. The graph is undirected.
  for (let edgeIdentifier = 0; edgeIdentifier < srcNodes.length; edgeIdentifier++) {
    graphAdjacency[srcNodes[edgeIdentifier]][destNodes[edgeIdentifier]] = graphAdjacency[destNodes[edgeIdentifier]][srcNodes[edgeIdentifier]] = edgeWeights[edgeIdentifier];
  }

  // Array to store the shortest distance found so far from the startVertex to each other vertex.
  // Initialize with a very large number (infinity).
  const shortestPathDistances = Array(totalVertices).fill(9e99);
  // The distance from the startVertex to itself is 0.
  shortestPathDistances[startVertex] = 0;

  // Array to keep track of visited vertices.
  const visitedStatus = Array(totalVertices).fill(0);

  // Create a new priority queue to manage vertices to visit.
  const minHeap = new MinPriorityQueue();
  // Add the starting vertex with its distance (0) to the priority queue.
  minHeap.enqueue([startVertex, 0]);

  // Process vertices until the priority queue is empty.
  while (minHeap.getSize()) {
    // Get the vertex with the smallest distance from the priority queue.
    const currentVertexAndDistance = minHeap.dequeue();
    const currentVertex = currentVertexAndDistance[0]; // The vertex itself

    // If this vertex has already been visited, skip it.
    if (visitedStatus[currentVertex]) {
      continue;
    }

    // Mark the current vertex as visited.
    visitedStatus[currentVertex] = 1;

    // Explore neighbors of the current vertex.
    for (let neighborVertex in graphAdjacency[currentVertex]) {
      // If the path through the current vertex is not shorter, skip.
      if (shortestPathDistances[neighborVertex] <= shortestPathDistances[currentVertex] + graphAdjacency[currentVertex][neighborVertex]) {
        continue;
      }
      // Update the shortest distance to the neighbor.
      shortestPathDistances[neighborVertex] = shortestPathDistances[currentVertex] + graphAdjacency[currentVertex][neighborVertex];
      // Add the neighbor to the priority queue with its new shortest distance.
      minHeap.enqueue([neighborVertex, shortestPathDistances[neighborVertex]]);
    }
  }
  // Return the array of shortest distances from the startVertex.
  return shortestPathDistances;
}

/**
 * A custom Min-Priority Queue implementation using a binary heap.
 * Stores elements as [value, priority], ordered by priority (smallest first).
 */
const MinPriorityQueue = function() {
  this.internalHeap = new Array(); // The array representing the heap structure.
  this.heapSize = 0; // Tracks the number of elements currently in the heap.
};

MinPriorityQueue.prototype = {
  /**
   * Adds an element to the priority queue.
   * @param {Array} elementToInsert - An array [value, priority] to be inserted.
   */
  enqueue: function(elementToInsert) {
    let currentIndex = this.heapSize++; // Get the next available index and increment heap size.
    // Bubble up the new element to maintain heap property.
    while (currentIndex > 0) {
      const parentIndex = Math.floor((currentIndex - 1) / 2); // Calculate parent index.
      // If the parent's priority is already less than or equal to the new element's priority, stop.
      if (this.internalHeap[parentIndex][1] <= elementToInsert[1]) {
        break;
      }
      // Move the parent down.
      this.internalHeap[currentIndex] = this.internalHeap[parentIndex];
      currentIndex = parentIndex; // Move up to the parent's position.
    }
    this.internalHeap[currentIndex] = elementToInsert; // Place the new element at its final position.
  },

  /**
   * Removes and returns the element with the smallest priority from the queue.
   * @returns {any} The value of the element with the smallest priority.
   */
  dequeue: function() {
    const returnValue = this.internalHeap[0]; // The root (smallest priority) is the return value.
    const lastElement = this.internalHeap[--this.heapSize]; // Take the last element and decrement heap size.
    let currentIndex = 0; // Start from the root.

    // Bubble down the last element to maintain heap property.
    while (currentIndex * 2 + 1 < this.heapSize) {
      let leftChildIndex = currentIndex * 2 + 1; // Index of the left child.
      let rightChildIndex = currentIndex * 2 + 2; // Index of the right child.

      // Find the child with the smaller priority.
      if (rightChildIndex < this.heapSize && this.internalHeap[rightChildIndex][1] < this.internalHeap[leftChildIndex][1]) {
        leftChildIndex = rightChildIndex; // Right child is smaller.
      }

      // If the smaller child's priority is greater than or equal to the last element's priority, stop.
      if (this.internalHeap[leftChildIndex][1] >= lastElement[1]) {
        break;
      }
      // Move the smaller child up.
      this.internalHeap[currentIndex] = this.internalHeap[leftChildIndex];
      currentIndex = leftChildIndex; // Move down to the child's position.
    }
    this.internalHeap[currentIndex] = lastElement; // Place the last element at its final position.
    this.internalHeap.pop(); // Remove the now redundant last element from the end of the array.
    return returnValue[0]; // Return the value part of the original root element.
  },

  /**
   * Returns the current number of elements in the priority queue.
   * @returns {number} The size of the heap.
   */
  getSize: function() {
    return this.internalHeap.length;
  }
};

// Read input from stdin and pass it to the main processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
