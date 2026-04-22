'use strict';

function OrderedList( comparisonFunction ) {
  this.dataStore = []; // Internal array to hold the heap elements
  this.comparisonFunction = comparisonFunction; // Function to compare two elements
}

OrderedList.prototype.insertElement = function( newItem )
{
  // Add the new item to the end of the heap structure
  this.dataStore.push( newItem );
  let currentIdx = this.dataStore.length - 1;

  // Bubble up the new item to maintain heap property (min-heap)
  while ( currentIdx > 0 )
  {
    const parentIdx = Math.floor( ( currentIdx - 1 ) / 2 );

    // If parent is smaller (or equal) than current, heap property is satisfied
    if ( this.comparisonFunction( this.dataStore[parentIdx], newItem ) <= 0 ) {
      break;
    }

    // Otherwise, swap with parent and continue bubbling up
    this.dataStore[currentIdx] = this.dataStore[parentIdx];
    currentIdx = parentIdx;
  }

  // Place the new item in its final position
  if ( this.dataStore.length > 0 ) {
    this.dataStore[currentIdx] = newItem;
  }
};

OrderedList.prototype.extractSmallest = function()
{
  const extractedValue = this.retrieveMinimum(); // Get the smallest value (root)
  const lastHeapElement = this.dataStore[this.dataStore.length - 1]; // Get the last element
  this.dataStore.splice( this.dataStore.length - 1, 1 ); // Remove the last element from the heap

  let currentPosition = 0;

  // Sift down the last element (now at root) to its correct position
  while ( currentPosition * 2 + 1 < this.dataStore.length )
  {
    const leftNode = currentPosition * 2 + 1;
    const rightNode = currentPosition * 2 + 2;

    // Determine which child is smaller (or left if right doesn't exist)
    const bestChildIndex = ( rightNode < this.dataStore.length &&
                             this.comparisonFunction( this.dataStore[rightNode], this.dataStore[leftNode] ) < 0 )
                             ? rightNode : leftNode;

    // If the element to sift down is smaller than or equal to its smallest child, we're done
    if ( this.comparisonFunction( this.dataStore[bestChildIndex], lastHeapElement ) >= 0 ) {
      break;
    }

    // Swap with the smallest child and continue sifting down
    this.dataStore[currentPosition] = this.dataStore[bestChildIndex];
    currentPosition = bestChildIndex;
  }

  // Place the last element in its final position
  if ( this.dataStore.length > 0 ) {
    this.dataStore[currentPosition] = lastHeapElement;
  }

  return extractedValue; // Return the original smallest value
};

OrderedList.prototype.retrieveMinimum = function()
{
  // Return the smallest element without removing it
  return this.dataStore.length === 0 ? undefined : this.dataStore[0];
};

OrderedList.prototype.getElementCount = function()
{
  // Return the number of elements currently in the list
  return this.dataStore.length;
};

OrderedList.prototype.isCurrentlyEmpty = function()
{
  // Check if the list contains any elements
  return this.getElementCount() === 0;
};

const MAXIMUM_NODES = 100000; // A constant for maximum possible nodes
const EXTREMELY_LARGE_VALUE = Infinity; // Represents an unreachable distance
let nodeQuantity, edgeQuantity, initialPoint; // Variables for graph properties
let graphStructure; // Adjacency list representation of the graph
let pathCosts; // Array to store shortest distances from the source

function findShortestPaths( startingNode )
{
  // Initialize a priority queue for Dijkstra's algorithm
  const priorityContainer = new OrderedList( function( itemOne, itemTwo ) {
    // Custom comparison function: prioritize by distance, then by node index for tie-breaking
    if ( itemOne.distanceValue !== itemTwo.distanceValue ) {
      return itemOne.distanceValue - itemTwo.distanceValue;
    }
    return itemOne.nodeIndex - itemTwo.nodeIndex;
  });

  // Set distance to starting node as 0, others remain at infinity
  pathCosts[startingNode] = 0;
  priorityContainer.insertElement( { distanceValue: 0, nodeIndex: startingNode } );

  // Process nodes until the priority queue is empty
  while ( !priorityContainer.isCurrentlyEmpty() )
  {
    const currentNodeInfo = priorityContainer.extractSmallest(); // Get node with smallest distance

    // If we've found a shorter path to this node already, skip
    if ( pathCosts[currentNodeInfo.nodeIndex] < currentNodeInfo.distanceValue ) {
      continue;
    }

    // Iterate over all neighbors (edges) of the current node
    for ( let edgeIterator = 0; edgeIterator < graphStructure[currentNodeInfo.nodeIndex].length; ++edgeIterator )
    {
      const currentEdge = graphStructure[currentNodeInfo.nodeIndex][edgeIterator];

      // Relax edge: if a shorter path to neighbor is found through the current node
      if ( pathCosts[currentEdge.targetNode] > pathCosts[currentNodeInfo.nodeIndex] + currentEdge.edgeWeight )
      {
        pathCosts[currentEdge.targetNode] = pathCosts[currentNodeInfo.nodeIndex] + currentEdge.edgeWeight;
        priorityContainer.insertElement( { distanceValue: pathCosts[currentEdge.targetNode], nodeIndex: currentEdge.targetNode } );
      }
    }
  }
}

(function executeProcessing( rawInputData )
{
  // The following lines are commented out in the original structure,
  // indicating they are placeholders or for debugging purposes.
  // const parsedLines = rawInputData.trim().split('\n');
  let isFirstSegment = true; // Flag to indicate processing of the initial data block

  // Loop through potential input lines (the loop condition is set to 0 as 'parsedLines' is commented out)
  for ( let loopCounter = 0; loopCounter < /*parsedLines.length*/ 0; ++loopCounter )
  {
    // const numericValues = parsedLines[loopCounter].split(' ').map(Number); // Parse numbers from the line

    /*
    // This block would typically initialize graph parameters (nodes, edges, start) and the adjacency list
    if ( isFirstSegment )
    {
      nodeQuantity = numericValues[0]; // Total number of vertices
      edgeQuantity = numericValues[1]; // Total number of edges
      initialPoint = numericValues[2]; // The designated starting vertex for pathfinding

      graphStructure = []; // Initialize the adjacency list as an empty array
      for ( let nodeIndex = 0; nodeIndex < nodeQuantity; ++nodeIndex ) {
        graphStructure[nodeIndex] = []; // Each node gets an empty list for its edges
      }

      pathCosts = ( new Array( nodeQuantity ) ).fill( EXTREMELY_LARGE_VALUE ); // Initialize all distances to a very large value
    }
    else
    {
      // Add edge information to the graph structure
      graphStructure[numericValues[0]].push( { targetNode: numericValues[1], edgeWeight: numericValues[2] } );
    }
    */

    isFirstSegment = false; // After the first iteration, mark that the initial segment has been processed
  }

  // The main pathfinding algorithm would be invoked here with the specified starting point
  // findShortestPaths( initialPoint );

  // The results (shortest path costs) would typically be printed to the console
  // pathCosts.forEach( function( currentDistance ) {
  //   console.log( currentDistance === EXTREMELY_LARGE_VALUE ? "HUGE" : currentDistance );
  // });

})( require('node:fs').readFileSync( '/dev/stdin', 'utf8' ) ); // Read input from standard input file system