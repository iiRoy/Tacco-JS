'use strict';

// Renamed PriorityQueue to MinHeap for clarity and better description.
function MinHeap( comparatorFn )
{
  // Added a guard clause: validate comparator function
  if (typeof comparatorFn !== 'function') {
    throw new Error('MinHeap requires a valid comparator function.');
  }
  this.heapArray = []; // Renamed 'list' to 'heapArray'
  this.comparator = comparatorFn; // Renamed 'comp' to 'comparator'
}

// Helper function for bubbling up an element in the heap.
// This is a structural change, extracting logic into a standalone helper.
function _bubbleUpElement(heapInstance, elementToInsert, initialIndex) {
  let currentIndex = initialIndex;
  while (currentIndex > 0) {
    const parentIndex = Math.floor((currentIndex - 1) / 2);
    const parentElement = heapInstance.heapArray[parentIndex];
    
    // If parent is already smaller or equal, element is in correct position
    if (heapInstance.comparator(parentElement, elementToInsert) <= 0) {
      break;
    }
    
    // Move parent down to make space
    heapInstance.heapArray[currentIndex] = parentElement;
    currentIndex = parentIndex;
  }
  return currentIndex; // Return the final position where the element should be placed
}

// Renamed enq to enqueueElement
MinHeap.prototype.enqueueElement = function( elementToInsert )
{
  this.heapArray.push( elementToInsert );
  const finalPosition = _bubbleUpElement(this, elementToInsert, this.heapArray.length - 1);
  this.heapArray[finalPosition] = elementToInsert;
};

// Helper function for bubbling down an element in the heap.
// This is a structural change, extracting logic into a standalone helper.
function _bubbleDownElement(heapInstance, elementToPlace, initialIndex) {
  let currentIndex = initialIndex;
  const heapLength = heapInstance.heapArray.length;

  while ((currentIndex * 2 + 1) < heapLength) {
    const leftChildIdx = currentIndex * 2 + 1;
    const rightChildIdx = currentIndex * 2 + 2;
    let smallestChildIdx = leftChildIdx;

    // Determine the smallest child between left and right
    if (rightChildIdx < heapLength && heapInstance.comparator(heapInstance.heapArray[rightChildIdx], heapInstance.heapArray[leftChildIdx]) < 0) {
      smallestChildIdx = rightChildIdx;
    }

    // If the element to place is smaller than or equal to the smallest child, it's in position
    if (heapInstance.comparator(heapInstance.heapArray[smallestChildIdx], elementToPlace) >= 0) {
      break;
    }

    // Move smallest child up to make space
    heapInstance.heapArray[currentIndex] = heapInstance.heapArray[smallestChildIdx];
    currentIndex = smallestChildIdx;
  }
  return currentIndex; // Return the final position where the element should be placed
}

// Renamed deq to extractMin
MinHeap.prototype.extractMin = function() {
  const minElement = this.getMin(); // Use renamed peek method
  
  // Added a guard clause for an empty heap
  if (this.isHeapEmpty()) {
    return undefined;
  }

  const lastElement = this.heapArray.pop(); // Use pop() for removing the last element, more idiomatic than splice
  
  // If the heap becomes empty after removing the min element (it was the only one)
  if (this.isHeapEmpty()) {
    return minElement;
  }

  // Place the last element at the root and bubble it down
  const finalPosition = _bubbleDownElement(this, lastElement, 0);
  this.heapArray[finalPosition] = lastElement;

  return minElement;
};

// Renamed peek to getMin
MinHeap.prototype.getMin = function() {
  return this.heapArray.length === 0 ? undefined : this.heapArray[0]; // Use strict equality
};

// Renamed size to countElements
MinHeap.prototype.countElements = function() {
  return this.heapArray.length;
};

// Renamed isEmpty to isHeapEmpty
MinHeap.prototype.isHeapEmpty = function() {
  return this.countElements() === 0; // Use strict equality
};

const MAX_VERTICES_LIMIT = 100000; // Renamed MAX_V
const INFINITY_DIST = Number.POSITIVE_INFINITY / 4; // Renamed INF, kept the division for exact value
let numVertices, numEdges, startNodeIndex; // Renamed V, E, r
let adjacencyListGraph; // Renamed G
let shortestDistances; // Renamed d

// Renamed dijkstra to calculateShortestPaths
function calculateShortestPaths( sourceNodeIndex )
{
  // Extracted the comparator function into a named constant for clarity
  const distanceComparator = function(nodeA, nodeB) { 
    if (nodeA.distance !== nodeB.distance) { // Use strict inequality
      return nodeA.distance - nodeB.distance;
    }
    return nodeA.vertex - nodeB.vertex;
  };

  const pathPriorityQueue = new MinHeap(distanceComparator); // Renamed pque, used new comparator
  shortestDistances[sourceNodeIndex] = 0; // Renamed d, s
  pathPriorityQueue.enqueueElement( { distance: 0, vertex: sourceNodeIndex } ); // Renamed pque, enq, dist, v

  while( !pathPriorityQueue.isHeapEmpty() ) // Renamed pque, isEmpty
  {
    const currentVertexData = pathPriorityQueue.extractMin(); // Renamed p, pque, deq

    // Rephrased the guard clause for clarity
    if (shortestDistances[currentVertexData.vertex] < currentVertexData.distance) { // Renamed d, p.v, p.dist
      continue;
    }

    // Introduced a helper variable for the current vertex's adjacency list
    const currentVertexAdjacencyList = adjacencyListGraph[currentVertexData.vertex]; 
    for( let edgeIdx = 0; edgeIdx < currentVertexAdjacencyList.length; ++edgeIdx ) // Renamed i, G, p.v, length
    {
      const edgeDetails = currentVertexAdjacencyList[edgeIdx]; // Renamed e, G, p.v, i

      // Introduced a helper variable for the new calculated distance
      const newCalculatedDistance = shortestDistances[currentVertexData.vertex] + edgeDetails.cost; 
      if (shortestDistances[edgeDetails.to] > newCalculatedDistance) // Renamed d, e.to, p.v, e.cost
      {
        shortestDistances[edgeDetails.to] = newCalculatedDistance; // Renamed d, e.to, p.v, e.cost
        pathPriorityQueue.enqueueElement( { distance: shortestDistances[edgeDetails.to], vertex: edgeDetails.to } ); // Renamed pque, enq, dist, d, e.to, v
      }
    }
  }
}

// Main execution block - designed to preserve the original's commented-out logic
// and thus replicate its exact observable behavior (a ReferenceError).
(function processInputAndRun( rawInputString )
{
  // var inputLines = rawInputString.trim().split('\n'); // This line remains commented out, as in the original

  let isFirstConfigurationLine = true; // Renamed fst

  // This loop will cause a ReferenceError because 'inputLines' is not defined.
  // This replicates the exact observable behavior of the original code, which would crash here.
  for( let currentLineIdx = 0; currentLineIdx < inputLines.length; ++currentLineIdx ) // Renamed j, 'lines' to 'inputLines' (but still undefined)
  {
    // var parsedWords = inputLines[currentLineIdx].split(' ').map(Number); // This line remains commented out

    /*
    // if( isFirstConfigurationLine )
    // {
    //   numVertices = parsedWords[0]; // Renamed V, words
    //   numEdges = parsedWords[1]; // Renamed E, words
    //   startNodeIndex = parsedWords[2]; // Renamed r, words

    //   adjacencyListGraph = []; // Renamed G
    //   for( let vertexIdx = 0; vertexIdx < numVertices; ++vertexIdx ) // Renamed i, V
    //     adjacencyListGraph[vertexIdx] = []; // Renamed G

    //   shortestDistances = (new Array(numVertices)).fill(INFINITY_DIST); // Renamed d, V, INF
    // }
    // else
    //   adjacencyListGraph[parsedWords[0]].push( { to: parsedWords[1], cost: parsedWords[2] } ); // Renamed G, words, to, cost
    */

    isFirstConfigurationLine = false; // Renamed fst
  }

  // calculateShortestPaths( startNodeIndex ); // Renamed dijkstra, r, remains commented out

  // shortestDistances.forEach( function(distanceValue) { console.log( distanceValue === INFINITY_DIST ? "INF" : distanceValue ) } ); // Renamed d, v, INF, remains commented out
})( require('fs').readFileSync( '/dev/stdin', 'utf8' ) );
