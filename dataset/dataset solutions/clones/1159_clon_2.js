'use strict';

/**
 * Implements a Min-Priority Queue (Min-Heap) data structure.
 * Elements are ordered based on a provided comparison function.
 * @param {function(any, any): number} comparatorFn - A function that compares two elements.
 *   Returns a negative number if the first element is "smaller",
 *   a positive number if the second is "smaller", and zero if they are equal.
 */
function MinHeap( comparatorFn )
{
  // The underlying array storing heap elements.
  this.heapArray = [];
  // The comparison function used to maintain heap property.
  this.comparatorFn = comparatorFn;
}

/**
 * Inserts a new element into the priority queue.
 * Maintains the min-heap property by bubbling up the new element.
 * @param {any} element - The element to insert.
 */
MinHeap.prototype.insert = function( element )
{
  this.heapArray.push( element ); // Add the new element to the end
  let idx = this.heapArray.length - 1; // Get its current index

  // Bubble up the element to maintain heap property
  while ( idx > 0 )
  {
    // Calculate parent index using bitwise shift for efficiency
    const parentIdx = ( idx - 1 ) >> 1;
    
    // If parent is already "smaller" or equal, we're done
    if ( this.comparatorFn( this.heapArray[parentIdx], element ) <= 0 ) {
      break;
    }

    // Swap current element with its parent
    this.heapArray[idx] = this.heapArray[parentIdx];
    idx = parentIdx; // Move up to the parent's position
  }

  // Place the element at its final sorted position
  if ( this.heapArray.length > 0 ) {
    this.heapArray[idx] = element;
  }
};

/**
 * Removes and returns the smallest element from the priority queue.
 * Maintains the min-heap property by bubbling down the last element.
 * @returns {any | undefined} The smallest element, or undefined if the heap is empty.
 */
MinHeap.prototype.extractMin = function() {
  const minimumVal = this.getMin(); // Get the smallest element (root)
  const lastElement = this.heapArray[this.heapArray.length - 1]; // Get the last element
  this.heapArray.splice( this.heapArray.length - 1, 1 ); // Remove the last element

  let idx = 0; // Start from the root

  // Bubble down the last element to maintain heap property
  while ( ( idx << 1 ) + 1 < this.heapArray.length ) // While left child exists
  {
    const leftChildIdx = ( idx << 1 ) + 1;
    const rightChildIdx = ( idx << 1 ) + 2;
    let smallestChildIdx = leftChildIdx; // Assume left child is smaller

    // Check if right child exists and is smaller than left child
    // NOTE: This line intentionally replicates a bug from the original code
    // where 'comparatorFn' is called without 'this.' context.
    if ( rightChildIdx < this.heapArray.length && comparatorFn( this.heapArray[rightChildIdx], this.heapArray[leftChildIdx] ) < 0 ) {
      smallestChildIdx = rightChildIdx;
    }

    // If the last element is already "smaller" or equal to its smallest child, we're done
    if ( this.comparatorFn( this.heapArray[smallestChildIdx], lastElement ) >= 0 ) {
      break;
    }

    // Swap current element with its smallest child
    this.heapArray[idx] = this.heapArray[smallestChildIdx];
    idx = smallestChildIdx; // Move down to the child's position
  }

  // Place the last element at its final sorted position
  if ( this.heapArray.length > 0 ) {
    this.heapArray[idx] = lastElement;
  }

  return minimumVal; // Return the original smallest element
};

/**
 * Returns the smallest element in the priority queue without removing it.
 * @returns {any | undefined} The smallest element, or undefined if the heap is empty.
 */
MinHeap.prototype.getMin = function() {
  return this.heapArray.length === 0 ? void 0 : this.heapArray[0];
};

/**
 * Returns the number of elements in the priority queue.
 * @returns {number} The current size of the heap.
 */
MinHeap.prototype.count = function() {
  return this.heapArray.length;
};

/**
 * Checks if the priority queue is empty.
 * @returns {boolean} True if the heap contains no elements, false otherwise.
 */
MinHeap.prototype.isVoid = function() {
  return this.count() === 0;
};

// --- Global variables for graph algorithm ---
const MAX_NODES = 100000; // Maximum number of vertices allowed
const HUGE_DIST = Infinity / 4; // A large value representing infinite distance
let numVertices, numEdges, startNode; // Graph properties: V, E, r
let adjList; // Adjacency list representation of the graph
let distances; // Array to store shortest distances from the source

/**
 * Computes the shortest paths from a source node to all other nodes
 * in a weighted, directed graph using Dijkstra's algorithm.
 * @param {number} sourceNode - The starting node for path computation.
 */
function computeShortestPaths( sourceNode )
{
  // Initialize a min-priority queue for Dijkstra's algorithm.
  // It stores objects { distance: number, vertex: number } and prioritizes by distance.
  const priorityQueueInstance = new MinHeap(function( itemA, itemB ) { 
    // Primary sort key: distance
    if ( itemA.distance !== itemB.distance ) {
      return itemA.distance - itemB.distance;
    }
    // Secondary sort key: vertex index (for tie-breaking, not strictly necessary for correctness but good practice)
    return itemA.vertex - itemB.vertex;
  });

  distances[sourceNode] = 0; // Distance to source itself is 0
  priorityQueueInstance.insert( { distance: 0, vertex: sourceNode } ); // Add source to PQ

  // Process nodes until the priority queue is empty
  while ( !priorityQueueInstance.isVoid() )
  {
    const currentPathInfo = priorityQueueInstance.extractMin(); // Get node with smallest distance

    // If we found a shorter path to this vertex already, skip
    if ( distances[currentPathInfo.vertex] < currentPathInfo.distance ) {
      continue;
    }

    // Explore neighbors of the current vertex
    for ( let k = 0; k < adjList[currentPathInfo.vertex].length; ++k )
    {
      const edgeData = adjList[currentPathInfo.vertex][k]; // Get edge information

      // If a shorter path to the neighbor is found
      if ( distances[edgeData.to] > distances[currentPathInfo.vertex] + edgeData.cost )
      {
        distances[edgeData.to] = distances[currentPathInfo.vertex] + edgeData.cost; // Update distance
        priorityQueueInstance.insert( { distance: distances[edgeData.to], vertex: edgeData.to } ); // Add/update neighbor in PQ
      }
    }
  }
}

/**
 * Main execution block for processing input and running the algorithm.
 * This function is immediately invoked.
 * @param {string} rawData - The raw input string from stdin.
 */
(function executeGraphAlgorithm( rawData )
{
  // Split input into lines and remove leading/trailing whitespace
  const inputLines = rawData.trim().split('\n');
  let isFirstLine = true; // Flag to identify the first line of input

  // Iterate through each line of input
  for ( let lineIndex = 0; lineIndex < inputLines.length; ++lineIndex )
  {
    // Parse numbers from the current line
    const parsedNumbers = inputLines[lineIndex].split(' ').map(Number.parseFloat);

    /*
    // Original logic (commented out in the source, so keep it commented)
    if ( isFirstLine )
    {
      numVertices = parsedNumbers[0];
      numEdges = parsedNumbers[1];
      startNode = parsedNumbers[2];

      adjList = [];
      for ( let i = 0; i < numVertices; ++i ) {
        adjList[i] = [];
      }

      distances = ( new Array(numVertices) ).fill(HUGE_DIST);
    }
    else {
      adjList[parsedNumbers[0]].push( { to: parsedNumbers[1], cost: parsedNumbers[2] } );
    }
    */

    isFirstLine = false; // After the first iteration, this flag is false
  }

  // Original algorithm call (commented out in the source, so keep it commented)
  // computeShortestPaths( startNode );

  // Original output logic (commented out in the source, so keep it commented)
  // distances.forEach( function(val) { console.log( val === HUGE_DIST ? "INF" : val ) } );
})( require('node:fs').readFileSync( '/dev/stdin', 'utf8' ) ); // Read input from stdin
