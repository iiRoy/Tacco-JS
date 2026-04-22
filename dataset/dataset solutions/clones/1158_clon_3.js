// A custom implementation of a min-priority queue (min-heap) data structure.
// It uses an array to store elements and a comparison function to maintain heap property.
function MinHeap( comparisonFn )
{
  // The internal array representing the heap.
  this.heapArray = [];
  // The function used to compare elements and determine their priority.
  // It should return a negative value if a < b, positive if a > b, and 0 if a == b.
  if (typeof comparisonFn !== 'function') {
      // It's crucial for the heap to have a valid comparison logic.
      throw new Error("MinHeap requires a comparison function to order elements.");
  }
  this.comparisonFn = comparisonFn;
}

// Private helper method to move an element up the heap to maintain heap property.
// This is typically called after inserting a new element at the end.
MinHeap.prototype._bubbleUp = function( currentIndex ) {
  const elementToMove = this.heapArray[currentIndex]; // Cache the element to avoid multiple array accesses.
  while (currentIndex > 0) {
    const parentIndex = Math.trunc((currentIndex - 1) / 2); // Calculate parent index.
    const parentElement = this.heapArray[parentIndex];

    // If the element is already in the correct position relative to its parent (i.e., it's not smaller), stop.
    if (this.comparisonFn(elementToMove, parentElement) >= 0) {
      break;
    }

    // Otherwise, move the parent element down to the current position.
    this.heapArray[currentIndex] = parentElement;
    currentIndex = parentIndex; // Move up to the parent's position.
  }
  // Place the element at its final sorted position in the heap.
  this.heapArray[currentIndex] = elementToMove;
};

// Private helper method to move an element down the heap to maintain heap property.
// This is typically called after extracting the root or moving an element to the root.
MinHeap.prototype._bubbleDown = function( currentIndex ) {
  const heapSize = this.heapArray.length;
  const elementToMove = this.heapArray[currentIndex]; // Cache the element being moved.

  while (true) {
    const leftChildIndex = 2 * currentIndex + 1;
    const rightChildIndex = 2 * currentIndex + 2;
    let smallestChildIndex = currentIndex; // Assume current element is the smallest initially.

    // Determine if the left child exists and is smaller than the current smallest.
    if (leftChildIndex < heapSize && this.comparisonFn(this.heapArray[leftChildIndex], elementToMove) < 0) {
      smallestChildIndex = leftChildIndex;
    }
    // Determine if the right child exists and is smaller than the current smallest (which could be the left child).
    if (rightChildIndex < heapSize && this.comparisonFn(this.heapArray[rightChildIndex], this.heapArray[smallestChildIndex]) < 0) {
      smallestChildIndex = rightChildIndex;
    }

    // If the current element is already in the correct position (smallest among itself and children), stop.
    if (smallestChildIndex === currentIndex) {
      break;
    }

    // Otherwise, swap the current element with the smallest child.
    this.heapArray[currentIndex] = this.heapArray[smallestChildIndex];
    currentIndex = smallestChildIndex; // Move down to the child's position.
  }
  // Place the element at its final sorted position.
  this.heapArray[currentIndex] = elementToMove;
};

// Adds a new element to the heap, maintaining the heap property.
MinHeap.prototype.insert = function( item )
{
  this.heapArray.push( item ); // Add the new item to the end of the array.
  this._bubbleUp( this.heapArray.length - 1 ); // Restore heap property by bubbling up.
};

// Removes and returns the smallest element (root) from the heap.
// Returns null if the heap is empty.
MinHeap.prototype.extractMin = function() {
  if (this.isVacant()) {
    // Cannot extract from an empty heap.
    return null;
  }

  const minimumValue = this.heapArray[0]; // The smallest element is always at the root.
  const lastElement = this.heapArray.pop(); // Remove the last element from the array.

  // If there are still elements remaining in the heap, move the last element
  // to the root and then bubble it down to its correct position.
  if (!this.isVacant()) {
    this.heapArray[0] = lastElement;
    this._bubbleDown(0); // Restore heap property by bubbling down from the new root.
  }

  return minimumValue;
};

// Returns the smallest element in the heap without removing it.
// Returns undefined if the heap is empty.
MinHeap.prototype.getMin = function() {
  // Check if the heap has any elements before trying to access the root.
  return this.isVacant() ? undefined : this.heapArray[0];
};

// Returns the total number of elements currently stored in the heap.
MinHeap.prototype.countElements = function() {
  return this.heapArray.length;
};

// Checks if the heap contains no elements.
MinHeap.prototype.isVacant = function() {
  return this.heapArray.length === 0;
};

// --- Global Graph Algorithm Configuration ---
// A constant defining the maximum number of nodes the graph algorithm is designed to handle.
const MAX_NODES_SUPPORTED = 100000;
// A large number representing an effectively infinite distance for pathfinding algorithms,
// chosen to be half of MAX_SAFE_INTEGER to prevent potential overflow during additions.
const HUGE_DISTANCE_VALUE = Number.MAX_SAFE_INTEGER / 2;

let nodeCount;             // Stores the total number of vertices (nodes) in the graph.
let edgeCount;             // Stores the total number of edges (connections) in the graph.
let startingNodeIndex;     // The index of the source node from which shortest paths are computed.

let adjacencyListGraph;    // The graph structure, represented as an array of arrays.
                           // Each element `adjacencyListGraph[i]` is a list of objects,
                           // where each object `{ destination: int, weight: int }` describes an outgoing edge.
let shortestDistances;     // An array to store the computed shortest distance from `startingNodeIndex`
                           // to every other node in the graph.

/*
// Function to compute the shortest paths from a given source node to all other nodes
// in a weighted, directed graph using Dijkstra's algorithm.
function computeShortestPaths( sourceNode )
{
  // Basic input validation: ensure the source node index is valid for the graph.
  if (sourceNode < 0 || sourceNode >= nodeCount) {
      console.error("Error: Provided source node index is out of valid bounds.");
      return; // Abort if the source node is invalid.
  }

  // Initialize a min-priority queue to manage nodes to visit.
  // Nodes are prioritized by their current shortest distance, with vertex index as a tie-breaker.
  const pathQueue = new MinHeap(function(pathA, pathB) {
    // Primary comparison: shortest distance.
    if (pathA.distance !== pathB.distance) {
      return pathA.distance - pathB.distance;
    }
    // Secondary comparison (tie-breaker): vertex index.
    return pathA.vertex - pathB.vertex;
  });

  // Initialize all shortest distances to an "infinite" value.
  // The distance to the source node itself is 0.
  shortestDistances.fill(HUGE_DISTANCE_VALUE);
  shortestDistances[sourceNode] = 0;

  // Add the source node to the priority queue with its initial distance.
  pathQueue.insert( { distance: 0, vertex: sourceNode } );

  // Continue processing nodes from the priority queue until it becomes empty.
  while ( !pathQueue.isVacant() )
  {
    // Extract the node with the smallest known distance.
    const currentPathInfo = pathQueue.extractMin();

    const currentVertex = currentPathInfo.vertex;
    const currentDistance = currentPathInfo.distance;

    // If a shorter path to this vertex has already been found and processed,
    // skip this entry (it's an outdated entry in the priority queue).
    if (shortestDistances[currentVertex] < currentDistance) {
      continue;
    }

    // Iterate over all outgoing edges from the current vertex.
    for (let i = 0; i < adjacencyListGraph[currentVertex].length; ++i)
    {
      const edgeData = adjacencyListGraph[currentVertex][i]; // Get details of the current edge.
      const neighborVertex = edgeData.destination;
      const edgeWeight = edgeData.weight;

      // Calculate the potential new distance to the neighbor through the current vertex.
      const newCalculatedDistance = currentDistance + edgeWeight;

      // If this new path is shorter than any previously known path to the neighbor,
      // update the neighbor's shortest distance and add it to the priority queue.
      if (shortestDistances[neighborVertex] > newCalculatedDistance)
      {
        shortestDistances[neighborVertex] = newCalculatedDistance;
        pathQueue.insert( { distance: newCalculatedDistance, vertex: neighborVertex } );
      }
    }
  }
}
*/

// Self-executing anonymous function to encapsulate the main program logic.
// It reads input, constructs the graph, executes the algorithm, and prints results.
(function executeGraphAlgorithm( rawInputData )
{
  // A utility function to parse a string line containing space-separated numbers into an array of numbers.
  const parseNumericLine = (line) => line.split(/\s+/).filter(Boolean).map(Number);

  // Process the raw input data: trim whitespace, split into lines, and filter out any empty lines.
  const inputLines = rawInputData.trim().split('\n').filter(Boolean);

  let isFirstLineProcessed = false; // Flag to indicate if the graph dimensions line has been parsed.

  // Loop through each line of the input data.
  for (let lineIndex = 0; lineIndex < inputLines.length; ++lineIndex)
  {
    const currentLineNumbers = parseNumericLine(inputLines[lineIndex]);

    // Perform a basic check for successful number parsing.
    if (currentLineNumbers.some(isNaN)) {
        console.error(`Warning: Input line ${lineIndex + 1} contains non-numeric data and will be skipped.`);
        continue; // Move to the next line if parsing failed.
    }

    if (!isFirstLineProcessed)
    {
      // The first line defines the graph's overall structure: V (nodes), E (edges), r (start node).
      nodeCount = currentLineNumbers[0];
      edgeCount = currentLineNumbers[1];
      startingNodeIndex = currentLineNumbers[2];

      // Validate the initial graph parameters.
      if (nodeCount <= 0 || edgeCount < 0 || startingNodeIndex < 0 || startingNodeIndex >= nodeCount) {
          console.error("Error: Invalid graph dimensions (V, E) or starting node (r) provided in input.");
          return; // Exit the program if critical parameters are invalid.
      }
      if (nodeCount > MAX_NODES_SUPPORTED) {
          console.warn(`Warning: Node count (${nodeCount}) exceeds recommended max (${MAX_NODES_SUPPORTED}). Performance may degrade.`);
      }

      // Initialize the adjacency list for the graph, creating an empty array for each node.
      adjacencyListGraph = Array.from({ length: nodeCount }, () => []);

      // Initialize the shortest distances array, setting all distances to "infinity".
      shortestDistances = Array(nodeCount).fill(HUGE_DISTANCE_VALUE);
      isFirstLineProcessed = true; // Mark the first line as successfully processed.
    }
    else
    {
      // Subsequent lines define the edges: source_node, destination_node, weight.
      const sourceVertex = currentLineNumbers[0];
      const destinationVertex = currentLineNumbers[1];
      const edgeWeight = currentLineNumbers[2];

      // Validate edge coordinates before adding to prevent errors.
      if (sourceVertex >= 0 && sourceVertex < nodeCount &&
          destinationVertex >= 0 && destinationVertex < nodeCount &&
          edgeWeight >= 0) // Edge weights are typically non-negative for Dijkstra's.
      {
        // Add the directed edge to the adjacency list.
        adjacencyListGraph[sourceVertex].push( { destination: destinationVertex, weight: edgeWeight } );
      } else {
        console.error(`Warning: Skipping invalid edge definition on line ${lineIndex + 1}: [${sourceVertex}, ${destinationVertex}, ${edgeWeight}]`);
      }
    }
  }

  // Uncomment the following line to execute the Dijkstra's algorithm.
  // computeShortestPaths( startingNodeIndex );

  // Output the results: the shortest distance to each node from the starting node.
  /*
  shortestDistances.forEach( (currentDistance, nodeIdx) => {
    // If a node's distance is still "infinity", it means it's unreachable.
    const outputDisplay = currentDistance === HUGE_DISTANCE_VALUE ? "UNREACHABLE" : currentDistance;
    console.log( outputDisplay );
  });
  */

})( require('fs').readFileSync( '/dev/stdin', 'utf8' ) );