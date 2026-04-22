'use strict'; // Enable strict mode for better error handling

/**
 *  Implements a min-priority queue data structure.
 *  Elements are ordered based on a provided comparison function.
 *
 *  @param {function(any, any): number} comparisonFunc - Function to compare two elements.
 *         Should return a negative number if first < second, positive if first > second, zero if equal.
 */
function OrderedCollection( comparisonFunc ) {
  this.elements = []; // Internal array to store heap elements
  this.comparisonFunc = comparisonFunc; // The function used for ordering
}


/**
 *  Adds a new item to the priority queue, maintaining heap property.
 *
 *  @param {any} newItem - The item to be inserted.
 */
OrderedCollection.prototype.insertElement = function( newItem ) {
  this.elements.push( newItem ); // Add new item to the end
  let currentIndex = this.elements.length - 1; // Start from the last element

  // Bubble up the new item if it's smaller than its parent
  while ( currentIndex > 0 ) {
    let parentIndex = Math.floor(( currentIndex - 1 ) / 2 ); // Calculate parent index
    
    // If parent is already smaller or equal, then heap property is satisfied
    if ( this.comparisonFunc( this.elements[parentIndex], newItem ) <= 0 ) {
      break;
    }

    // Swap current element with its parent
    this.elements[currentIndex] = this.elements[parentIndex];
    currentIndex = parentIndex; // Move up to the parent's position
  }

  // Place the new item in its final sorted position
  if ( this.elements.length > 0 ) {
    this.elements[currentIndex] = newItem;
  }
};


/**
 *  Removes and returns the smallest item from the priority queue.
 *
 *  @returns {any | undefined} The smallest item, or undefined if the queue is empty.
 */
OrderedCollection.prototype.extractMin = function() {
  const smallestValue = this.viewTop(); // Get the current minimum value
  const lastElement = this.elements[this.elements.length - 1]; // Get the last element
  this.elements.splice( this.elements.length - 1, 1 ); // Remove the last element

  let currentIndex = 0; // Start from the root

  // Sift down the last element to maintain heap property
  while ( currentIndex * 2 + 1 < this.elements.length ) {
    const leftChild = currentIndex * 2 + 1;
    const rightChild = currentIndex * 2 + 2;

    // Determine the smaller child
    const chosenChild = ( rightChild < this.elements.length && this.comparisonFunc( this.elements[rightChild], this.elements[leftChild] ) < 0 )
                        ? rightChild
                        : leftChild;

    // If the last element (now at root) is smaller than or equal to its smallest child,
    // then it's in its correct position.
    if ( this.comparisonFunc( this.elements[chosenChild], lastElement ) >= 0 ) {
      break;
    }

    // Swap current element with the smaller child
    this.elements[currentIndex] = this.elements[chosenChild];
    currentIndex = chosenChild; // Move down to the child's position
  }

  // Place the last element in its final sorted position
  if ( this.elements.length > 0 ) {
    this.elements[currentIndex] = lastElement;
  }

  return smallestValue; // Return the original minimum value
};


/**
 *  Retrieves the smallest item in the priority queue without removing it.
 *
 *  @returns {any | undefined} The smallest item, or undefined if the queue is empty.
 */
OrderedCollection.prototype.viewTop = function() {
  return this.elements.length === 0 ? undefined : this.elements[0];
};


/**
 *  Returns the current number of items in the priority queue.
 *
 *  @returns {number} The count of items.
 */
OrderedCollection.prototype.countItems = function() {
  return this.elements.length;
};


/**
 *  Checks if the priority queue is empty.
 *
 *  @returns {boolean} True if empty, false otherwise.
 */
OrderedCollection.prototype.isDepleted = function() {
  return this.countItems() === 0;
};


const MAX_VERTICES = 100000; // Maximum number of vertices allowed
const HUGE_DISTANCE = Number.POSITIVE_INFINITY / 4; // Represents an unreachable path
let numVertices, numEdges, startNode; // Graph properties: number of nodes, connections, and starting point
let adjacencyList; // Adjacency list representation of the graph
let distances; // Array to store shortest distances from the source node


/**
 *  Computes the shortest path from a source node to all other nodes
 *  in a weighted graph using Dijkstra's algorithm.
 *
 *  @param {number} sourceNode - The starting node for path computation.
 */
function findShortestPaths( sourceNode ) {
  // Initialize a min-priority heap for Dijkstra's algorithm
  const priorityHeap = new OrderedCollection(function( itemA, itemB ) { 
    // Compare based on distance first
    if ( itemA.distanceVal !== itemB.distanceVal ) {
      return itemA.distanceVal - itemB.distanceVal;
    }
    // If distances are equal, compare by vertex ID for tie-breaking
    return itemA.vertexId - itemB.vertexId;
  });

  distances[sourceNode] = 0; // Distance to source is 0
  priorityHeap.insertElement( { distanceVal: 0, vertexId: sourceNode } ); // Add source to heap

  // Process nodes until the priority heap is empty
  while ( !priorityHeap.isDepleted() ) {
    const currentPath = priorityHeap.extractMin(); // Get node with smallest distance

    // If we've found a shorter path to this node already, skip it
    if ( distances[currentPath.vertexId] < currentPath.distanceVal ) {
      continue;
    }

    // Iterate through all neighbors of the current node
    for ( let loopIndex = 0; loopIndex < adjacencyList[currentPath.vertexId].length; ++loopIndex ) {
      const edgeData = adjacencyList[currentPath.vertexId][loopIndex]; // Get edge information

      // If a shorter path to the neighbor is found
      if ( distances[edgeData.target] > distances[currentPath.vertexId] + edgeData.weight ) {
        distances[edgeData.target] = distances[currentPath.vertexId] + edgeData.weight; // Update distance
        priorityHeap.insertElement( { distanceVal: distances[edgeData.target], vertexId: edgeData.target } ); // Add/update neighbor in heap
      }
    }
  }
}


// Self-executing anonymous function to handle input and output
(function executeProgram( rawInputData ) {
  const inputLines = rawInputData.trim().split('\n'); // Split input into individual lines
  let isFirstLine = true; // Flag to identify the first line of input

  // Loop through each line of input data
  for ( let lineIndex = 0; lineIndex < inputLines.length; ++lineIndex ) {
    const parsedNumbers = inputLines[lineIndex].split(' ').map(Number); // Parse numbers from the line

    /*
     *  The following block is commented out in the original code.
     *  It would typically handle graph initialization from input.
     *  Since it's commented out, it remains so, with updated variable names.
     */
    /*
    if ( isFirstLine ) {
      numVertices = parsedNumbers[0]; // Number of nodes
      numEdges = parsedNumbers[1];   // Number of connections
      startNode = parsedNumbers[2];  // Starting node for Dijkstra's

      adjacencyList = []; // Initialize graph adjacency list
      for ( let vertexLoopIndex = 0; vertexLoopIndex < numVertices; ++vertexLoopIndex ) {
        adjacencyList[vertexLoopIndex] = [];
      }

      distances = (new Array(numVertices)).fill(HUGE_DISTANCE); // Initialize distances to infinity
    } else {
      // Add edge to the graph
      adjacencyList[parsedNumbers[0]].push( { target: parsedNumbers[1], weight: parsedNumbers[2] } );
    }
    */
    isFirstLine = false; // After processing the first line (or skipping it), set flag to false
  }

  // Call the shortest path algorithm if the graph was initialized
  // findShortestPaths( startNode );

  // Output the calculated distances (also commented out in original)
  // distances.forEach( function( currentDistance ) { console.log( currentDistance === HUGE_DISTANCE ? "INFINITY" : currentDistance ) } );
})( require('fs').readFileSync( '/dev/stdin', 'utf8' ) ); // Read input from standard input