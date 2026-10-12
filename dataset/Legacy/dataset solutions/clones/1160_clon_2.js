'use strict'; // Enforce strict parsing and error handling for better code quality

/**
 * Represents a min-priority queue (min-heap) data structure.
 * Elements are ordered based on a provided comparison function.
 * @param {function(any, any): number} comparisonFunction - A function that compares two elements.
 *   It should return a negative number if the first argument is "smaller" than the second,
 *   zero if they are "equal", or a positive number if the first is "larger".
 */
function MinPriorityQueue( comparisonFunction ) {
  // The internal array that stores the heap elements.
  this.heapElements = [];
  // The comparison function used to maintain the heap property.
  this.elementComparator = comparisonFunction;
}

/**
 * Inserts a new item into the priority queue, maintaining the min-heap property.
 * The item is added to the end and then "bubbled up" to its correct position.
 * @param {any} itemToAdd - The item to be inserted into the queue.
 */
MinPriorityQueue.prototype.insert = function( itemToAdd ) {
  this.heapElements.push( itemToAdd ); // Append the new item to the end of the array
  let currentIndex = this.heapElements.length - 1; // Start from the index of the newly added item

  // Perform the "bubble up" operation to restore the heap property
  while ( currentIndex > 0 ) {
    const parentIndex = Math.floor( ( currentIndex - 1 ) / 2 ); // Calculate the parent's index
    
    // If the parent element is less than or equal to the current item,
    // the heap property is satisfied, so we can stop.
    if ( this.elementComparator( this.heapElements[ parentIndex ], itemToAdd ) <= 0 ) {
      break;
    }

    // If the parent is larger, swap the current item with its parent
    this.heapElements[ currentIndex ] = this.heapElements[ parentIndex ];
    currentIndex = parentIndex; // Move up to the parent's position
  }

  // Place the item in its final sorted position within the heap
  if ( this.heapElements.length > 0 ) {
    this.heapElements[ currentIndex ] = itemToAdd;
  }
};

/**
 * Removes and returns the minimum element from the priority queue.
 * This operation involves removing the root, replacing it with the last element,
 * and then "sifting down" the new root to restore the heap property.
 * @returns {any | undefined} The minimum element, or `undefined` if the queue is empty.
 */
MinPriorityQueue.prototype.extractMin = function() {
  const minimumValue = this.getMin(); // Retrieve the smallest element (which is at the root)
  const lastHeapElement = this.heapElements[ this.heapElements.length - 1 ]; // Get the last element in the heap
  this.heapElements.splice( this.heapElements.length - 1, 1 ); // Remove the last element from the array

  let heapifyIndex = 0; // Start the "sift down" process from the root (index 0)

  // Continue sifting down as long as the current node has at least one child
  while ( heapifyIndex * 2 + 1 < this.heapElements.length ) {
    const leftChildIdx = heapifyIndex * 2 + 1; // Calculate the index of the left child
    const rightChildIdx = heapifyIndex * 2 + 2; // Calculate the index of the right child
    
    // Determine the index of the smallest child.
    // NOTE: The original code contained a bug here, referencing a global 'comp'
    // instead of 'this.comp'. This clone replicates that exact bug by
    // referencing 'elementComparator' globally, which would result in a ReferenceError.
    const smallestChildIdx = rightChildIdx < this.heapElements.length && elementComparator( this.heapElements[ rightChildIdx ], this.heapElements[ leftChildIdx ] ) < 0
      ? rightChildIdx
      : leftChildIdx;

    // If the last element (which is now conceptually at 'heapifyIndex') is
    // smaller than or equal to its smallest child, the heap property is restored.
    if ( this.elementComparator( this.heapElements[ smallestChildIdx ], lastHeapElement ) >= 0 ) {
      break;
    }

    // If not, swap the current element with its smallest child
    this.heapElements[ heapifyIndex ] = this.heapElements[ smallestChildIdx ];
    heapifyIndex = smallestChildIdx; // Move down to the child's position
  }

  // Place the last element in its final position after sifting down
  if ( this.heapElements.length > 0 ) {
    this.heapElements[ heapifyIndex ] = lastHeapElement;
  }

  return minimumValue; // Return the originally extracted minimum value
};

/**
 * Returns the minimum element of the priority queue without removing it.
 * @returns {any | undefined} The minimum element, or `undefined` if the queue is empty.
 */
MinPriorityQueue.prototype.getMin = function() {
  return this.heapElements.length === 0 ? undefined : this.heapElements[ 0 ];
};

/**
 * Returns the current number of elements in the priority queue.
 * @returns {number} The count of elements in the queue.
 */
MinPriorityQueue.prototype.count = function() {
  return this.heapElements.length;
};

/**
 * Checks if the priority queue is currently empty.
 * @returns {boolean} `true` if the queue contains no elements, `false` otherwise.
 */
MinPriorityQueue.prototype.isVoid = function() {
  return this.count() === 0;
};

// --- Global constants and variables for Dijkstra's Algorithm implementation ---

const MAX_VERTICES_COUNT = 100000; // Defines the maximum number of vertices supported in the graph
const HUGE_DISTANCE = Number.POSITIVE_INFINITY / 4; // A large numerical value representing an effectively infinite distance
let vertexCount, edgeCount, sourceNode; // Variables to store the graph's number of vertices, edges, and the starting node for Dijkstra's
let graphAdjacencyList; // An adjacency list to represent the graph structure
let shortestDistances; // An array to store the calculated shortest distances from the source node to all other nodes

/**
 * Computes the shortest paths from a specified starting vertex to all other vertices
 * in a weighted graph using Dijkstra's algorithm.
 * @param {number} startVertex - The index of the vertex from which to calculate shortest paths.
 */
function calculateShortestPaths( startVertex ) {
  // Initialize a min-priority queue. It will store objects with 'dist' (distance)
  // and 'v' (vertex index). The queue prioritizes by 'dist' first, then by 'v' for tie-breaking.
  const priorityQueueInstance = new MinPriorityQueue( function( nodeA, nodeB ) {
    if ( nodeA.dist !== nodeB.dist ) {
      return nodeA.dist - nodeB.dist; // Primary sorting by distance
    }
    return nodeA.v - nodeB.v; // Secondary sorting by vertex index for consistent tie-breaking
  } );

  shortestDistances[ startVertex ] = 0; // The distance from the source vertex to itself is zero
  priorityQueueInstance.insert( { dist: 0, v: startVertex } ); // Add the source vertex to the priority queue

  // Continue processing nodes as long as the priority queue is not empty
  while ( !priorityQueueInstance.isVoid() ) {
    const currentPathData = priorityQueueInstance.extractMin(); // Extract the vertex with the smallest known distance

    // If a shorter path to this vertex has already been found and processed, skip this entry
    if ( shortestDistances[ currentPathData.v ] < currentPathData.dist ) {
      continue;
    }

    // Iterate over all outgoing edges from the current vertex
    for ( let edgeIterator = 0; edgeIterator < graphAdjacencyList[ currentPathData.v ].length; ++edgeIterator ) {
      const currentEdgeDetails = graphAdjacencyList[ currentPathData.v ][ edgeIterator ];

      // Check if a shorter path to the neighbor vertex can be achieved through the current vertex
      if ( shortestDistances[ currentEdgeDetails.to ] > shortestDistances[ currentPathData.v ] + currentEdgeDetails.cost ) {
        shortestDistances[ currentEdgeDetails.to ] = shortestDistances[ currentPathData.v ] + currentEdgeDetails.cost; // Update the shortest distance to the neighbor
        priorityQueueInstance.insert( { dist: shortestDistances[ currentEdgeDetails.to ], v: currentEdgeDetails.to } ); // Add or update the neighbor in the priority queue
      }
    }
  }
}

// This Immediately Invoked Function Expression (IIFE) serves as the main entry point
// for the application, handling input processing and orchestrating the Dijkstra's algorithm.
( function runDijkstraApplication( rawInputData ) {
  // The following lines were commented out in the original source code.
  // To preserve exact behavioral equivalence, they remain commented here.
  // var inputLines = rawInputData.trim().split('\n');
  let isInitialConfig = true; // A flag to indicate if the current line being processed is the first configuration line

  // Loop through each line of the input data.
  // Note: The 'lines' variable is not defined in this scope, mirroring the original's commented-out input processing.
  for ( let lineIndex = 0; lineIndex < lines.length; ++lineIndex ) {
    // var parsedLineValues = inputLines[lineIndex].split(' ').map(Number);

    /*
    // This block of code, also commented out in the original, would be responsible
    // for parsing the graph's dimensions and edges from the input data.
    if ( isInitialConfig ) {
      vertexCount = parsedLineValues[0]; // Assign the total number of vertices
      edgeCount = parsedLineValues[1];   // Assign the total number of edges
      sourceNode = parsedLineValues[2];  // Assign the starting node for Dijkstra's algorithm

      graphAdjacencyList = []; // Initialize the graph's adjacency list
      for ( let vertexIndex = 0; vertexIndex < vertexCount; ++vertexIndex ) {
        graphAdjacencyList[vertexIndex] = []; // Each vertex starts with an empty list of neighbors
      }

      shortestDistances = ( new Array( vertexCount ) ).fill( HUGE_DISTANCE ); // Initialize all distances to the "infinity" value
    } else {
      // For subsequent lines, add edges to the graph's adjacency list
      graphAdjacencyList[ parsedLineValues[0] ].push( { to: parsedLineValues[1], cost: parsedLineValues[2] } );
    }
    */

    isInitialConfig = false; // After the first line, this flag is set to false
  }

  // The call to the shortest path calculation function was commented out in the original.
  // calculateShortestPaths( sourceNode );

  // The output loop for printing the calculated distances was also commented out in the original.
  // shortestDistances.forEach( function( distanceValue ) { console.log( distanceValue === HUGE_DISTANCE ? "INF" : distanceValue ) } );
} )( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );
