function MinHeap( comparatorFn )
{
  // The internal array storing heap elements
  this.heapArray = [];
  // The comparison function to maintain heap property
  this.comparatorFn = comparatorFn;
}

// Method to insert an element into the heap
MinHeap.prototype.insert = function( elementToInsert )
{
  this.heapArray.push( elementToInsert );
  let currentIdx = this.heapArray.length - 1; // Index of the newly added element

  // Bubble up the element to maintain heap property
  while( currentIdx > 0 )
  {
    const parentIdx = Math.floor((currentIdx - 1) / 2); // Calculate parent index
    
    // If parent is smaller or equal (for min-heap), stop
    if( this.comparatorFn( this.heapArray[parentIdx], elementToInsert ) <= 0 )
      break;

    // Swap current element with its parent
    this.heapArray[currentIdx] = this.heapArray[parentIdx];
    currentIdx = parentIdx; // Move up
  }

  // Place the element at its final sorted position
  if( this.heapArray.length > 0 )
    this.heapArray[currentIdx] = elementToInsert;
};

// Method to extract the minimum element from the heap
MinHeap.prototype.extractMin = function() {
  const minVal = this.getMin(); // Get the minimum value (root)
  const lastHeapElement = this.heapArray[this.heapArray.length - 1]; // Get the last element
  this.heapArray.splice( this.heapArray.length - 1, 1 ); // Remove the last element

  let currentIdx = 0; // Start from the root

  // Bubble down the last element to maintain heap property
  while( currentIdx * 2 + 1 < this.heapArray.length )
  {
    const leftChildIdx = currentIdx * 2 + 1;
    const rightChildIdx = currentIdx * 2 + 2;
    
    // Determine the smallest child
    // Note: The original code used 'comp' globally here, which is likely a typo.
    // It should use 'this.comp' (renamed to 'this.comparatorFn') for consistency with the class.
    const smallestChildIdx = rightChildIdx < this.heapArray.length && this.comparatorFn(this.heapArray[rightChildIdx], this.heapArray[leftChildIdx]) < 0 ? rightChildIdx : leftChildIdx;

    // If the last element is smaller than or equal to its smallest child, stop
    if( this.comparatorFn( this.heapArray[smallestChildIdx], lastHeapElement ) >= 0 )
      break;

    // Swap current element with its smallest child
    this.heapArray[currentIdx] = this.heapArray[smallestChildIdx];
    currentIdx = smallestChildIdx; // Move down
  }

  // Place the last element at its final sorted position
  if( this.heapArray.length > 0 )
    this.heapArray[currentIdx] = lastHeapElement;

  return minVal; // Return the original minimum value
};

// Method to get the minimum element without removing it
MinHeap.prototype.getMin = function() {
  // Return undefined if heap is empty, otherwise return the root element
  return this.heapArray.length === 0 ? undefined : this.heapArray[0];
};

// Method to get the number of elements in the heap
MinHeap.prototype.count = function() {
  return this.heapArray.length;
};

// Method to check if the heap is empty
MinHeap.prototype.isVacant = function() {
  return this.count() === 0;
};

// Constants for graph algorithm
const MAX_NODES_COUNT = 100000;
const HUGE_DISTANCE = Number.POSITIVE_INFINITY / 4; // A large value representing infinity
let vertexCount, edgeCount, sourceVertex;
let graphAdjacencyList; // Adjacency list for the graph
let shortestDistances; // Array to store shortest distances from source

/*
// Function to calculate shortest paths using Dijkstra's algorithm
function calculateShortestPaths( startVertex )
{
  // Initialize a min-heap for Dijkstra's algorithm
  const priorityQueueInstance = new MinHeap(function(itemOne, itemTwo) { 
    // Compare based on distance first
    if( itemOne.pathDistance !== itemTwo.pathDistance )
      return itemOne.pathDistance - itemTwo.pathDistance;

    // If distances are equal, compare based on vertex index
    return itemOne.nodeIndex - itemTwo.nodeIndex;
  });
  
  shortestDistances[startVertex] = 0; // Distance to source is 0
  priorityQueueInstance.insert( { pathDistance: 0, nodeIndex: startVertex } ); // Add source to priority queue

  // Process nodes until the priority queue is empty
  while( !priorityQueueInstance.isVacant() )
  {
    const currentVertexInfo = priorityQueueInstance.extractMin(); // Get node with smallest distance

    // If we found a shorter path already, skip
    if( shortestDistances[currentVertexInfo.nodeIndex] < currentVertexInfo.pathDistance )
      continue;

    // Iterate through all neighbors of the current node
    for( let neighborIdx = 0; neighborIdx < graphAdjacencyList[currentVertexInfo.nodeIndex].length; ++neighborIdx )
    {
      const edgeDetails = graphAdjacencyList[currentVertexInfo.nodeIndex][neighborIdx]; // Get edge details

      // If a shorter path to the neighbor is found
      if( shortestDistances[edgeDetails.destinationNode] > shortestDistances[currentVertexInfo.nodeIndex] + edgeDetails.edgeWeight )
      {
        shortestDistances[edgeDetails.destinationNode] = shortestDistances[currentVertexInfo.nodeIndex] + edgeDetails.edgeWeight; // Update distance
        priorityQueueInstance.insert( { pathDistance: shortestDistances[edgeDetails.destinationNode], nodeIndex: edgeDetails.destinationNode } ); // Add/update neighbor in priority queue
      }
    }
  }
}
*/

// Main execution block (Immediately Invoked Function Expression)
(function processGraphInput( rawInputData )
{
  /*
  const inputLinesArray = rawInputData.trim().split('\n'); // Split input into lines
  let isFirstLineProcessed = true; // Flag to identify the first line

  // Process each line of input
  for( let lineIterator = 0; lineIterator < inputLinesArray.length; ++lineIterator )
  {
    const parsedLineValues = inputLinesArray[lineIterator].split(' ').map(Number); // Parse numbers from the line

    if( isFirstLineProcessed )
    {
      vertexCount = parsedLineValues[0]; // Number of vertices
      edgeCount = parsedLineValues[1]; // Number of edges
      sourceVertex = parsedLineValues[2]; // Starting vertex for Dijkstra

      graphAdjacencyList = []; // Initialize adjacency list
      for( let i = 0; i < vertexCount; ++i )
        graphAdjacencyList[i] = []; // Each vertex gets an empty list of neighbors

      shortestDistances = (new Array(vertexCount)).fill(HUGE_DISTANCE); // Initialize distances to infinity
    }
    else
      // Add edge to the adjacency list
      graphAdjacencyList[parsedLineValues[0]].push( { destinationNode: parsedLineValues[1], edgeWeight: parsedLineValues[2] } );

    isFirstLineProcessed = false; // Mark first line as processed
  }

  calculateShortestPaths( sourceVertex ); // Run Dijkstra's algorithm

  // Output the shortest distances
  shortestDistances.forEach( function(currentDistance) { console.log( currentDistance === HUGE_DISTANCE ? "INF" : currentDistance ) } );
  */
})( require('fs').readFileSync( '/dev/stdin', 'utf8' ) );
