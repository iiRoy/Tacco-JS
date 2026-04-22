/*
 * Main processing routine for graph problem.
 * This function takes raw string input, parses it,
 * performs graph computations, and outputs results.
 */
function ProcessInput ( rawData ) {
  // Split the entire input block into individual lines
  rawData = rawData.split( '\n' );

  // Parse the first line to extract key parameters
  var initialParameters = rawData[0].split( ' ' ).map( value => +value );

  // Assign parsed values to descriptive variables
  var numberOfEdges = initialParameters[1];
  var startingVertexA = initialParameters[2] - 1; // Adjust for zero-based indexing
  var startingVertexB = initialParameters[3] - 1; // Adjust for zero-based indexing
  var totalVertices = initialParameters[0];

  // Initialize arrays to hold edge data: source, destination, and two sets of weights
  var sourceNodes = [];
  var destinationNodes = [];
  var weightSetAlpha = [];
  var weightSetBeta = [];

  // Loop through each edge definition line
  for ( let edgeIterator = 0; edgeIterator < numberOfEdges; edgeIterator++ ) {
    var currentEdgeDetails = rawData[ edgeIterator + 1 ].split( ' ' ).map( item => +item );
    sourceNodes[ edgeIterator ]      = currentEdgeDetails[0] - 1; // Adjust source to 0-indexed
    destinationNodes[ edgeIterator ] = currentEdgeDetails[1] - 1; // Adjust destination to 0-indexed
    weightSetAlpha[ edgeIterator ]   = currentEdgeDetails[2];
    weightSetBeta[ edgeIterator ]    = currentEdgeDetails[3];
  }

  // Calculate shortest path distances from startingVertexA using weightSetAlpha
  var distancesFromA = calculateShortestPaths( sourceNodes, destinationNodes, weightSetAlpha, startingVertexA, totalVertices );

  // Calculate shortest path distances from startingVertexB using weightSetBeta
  var distancesFromB = calculateShortestPaths( sourceNodes, destinationNodes, weightSetBeta, startingVertexB, totalVertices );

  // Array to store the final computed scores for each vertex
  var finalScores = [];

  // Define a large constant for calculations
  const veryLargeNumber = 1000000000000000; // Equivalent to 1e15

  // Initialize loop counter for backward iteration
  let vertexIndex = totalVertices - 1;

  // Compute the score for the last vertex
  finalScores[ vertexIndex ] = veryLargeNumber - distancesFromA[ vertexIndex ] - distancesFromB[ vertexIndex ];

  // Iterate backwards from the second-to-last vertex to the first
  while ( vertexIndex-- > 0 ) {
    finalScores[ vertexIndex ] = Math.max(
      finalScores[ vertexIndex + 1 ], // Compare with the maximum score of subsequent vertices
      veryLargeNumber - distancesFromA[ vertexIndex ] - distancesFromB[ vertexIndex ] // Current vertex's score
    );
  }

  // Output the calculated final scores, each on a new line
  console.log( finalScores.join( "\n" ) );
}

/*
 * Implements Dijkstra's algorithm to compute single-source shortest paths.
 *
 * @param {Array<number>} srcArr - Array of source nodes for graph edges.
 * @param {Array<number>} destArr - Array of destination nodes for graph edges.
 * @param {Array<number>} edgeCosts - Array of costs associated with each edge.
 * @param {number} startNode - The starting node for path computations (0-indexed).
 * @param {number} numNodesTotal - The total count of nodes in the graph.
 * @returns {Array<number>} An array containing the minimum distance from 'startNode' to all other nodes.
 */
function calculateShortestPaths( srcArr, destArr, edgeCosts, startNode, numNodesTotal ) {
  // Initialize an adjacency structure (array of arrays) for the graph
  var adjacencyStructure = Array( numNodesTotal ).fill( 0 ).map( () => [] );

  // Populate the adjacency structure with edge costs for an undirected graph
  for ( let edgeIdx = 0; edgeIdx < srcArr.length; edgeIdx++ ) {
    let currentSource = srcArr[ edgeIdx ];
    let currentDestination = destArr[ edgeIdx ];
    let currentCost = edgeCosts[ edgeIdx ];
    adjacencyStructure[ currentSource ][ currentDestination ] = currentCost;
    adjacencyStructure[ currentDestination ][ currentSource ] = currentCost; // Symmetric edge for undirected
  }

  // Initialize an array to store the minimum distances found so far
  var minimumDistances = Array( numNodesTotal ).fill( Number.POSITIVE_INFINITY );
  minimumDistances[ startNode ] = 0; // Distance from source to itself is zero

  // Keep track of nodes that have been finalized (visited)
  var visitedNodes = Array( numNodesTotal ).fill( 0 );

  // Create a priority queue to efficiently select the next node to process
  var nodePriorityQueue = new MinimumPriorityQueue();
  nodePriorityQueue.insertItem( [ startNode, 0 ] ); // Push initial node with distance 0

  // Continue processing until all reachable nodes have been visited
  while ( nodePriorityQueue.getCurrentSize() > 0 ) {
    var currentNodeIndex = nodePriorityQueue.extractMinItem(); // Get node with smallest distance
    let currentDistanceValue = minimumDistances[ currentNodeIndex ]; // Retrieve its current shortest distance

    // If this node has already been processed, skip it
    if ( visitedNodes[ currentNodeIndex ] ) continue;

    // Mark the current node as processed
    visitedNodes[ currentNodeIndex ] = 1;

    // Iterate over all neighbors of the current node
    for ( let neighborIdx in adjacencyStructure[ currentNodeIndex ] ) {
      let weightToNeighbor = adjacencyStructure[ currentNodeIndex ][ neighborIdx ];
      // If a shorter path to the neighbor is found, update its distance
      if ( minimumDistances[ neighborIdx ] > currentDistanceValue + weightToNeighbor ) {
        minimumDistances[ neighborIdx ] = currentDistanceValue + weightToNeighbor;
        // Add or update the neighbor in the priority queue
        nodePriorityQueue.insertItem( [ neighborIdx, minimumDistances[ neighborIdx ] ] );
      }
    }
  }
  return minimumDistances;
}

/*
 * Custom implementation of a Minimum Priority Queue using a binary heap.
 * Stores elements as `[value, priority]`, ordered by priority (smallest first).
 */
var MinimumPriorityQueue = function() {
  this.heapArray = new Array();
  this.currentHeapSize = 0;
};

MinimumPriorityQueue.prototype = {
  /*
   * Inserts a new element into the heap, maintaining the min-heap property.
   * @param {Array<any, number>} newItem - The element to insert, typically [node_index, distance].
   */
  insertItem : function( newItem ) {
    var insertionPoint = this.currentHeapSize++;
    while ( insertionPoint > 0 ) {
      // Calculate the parent node's index
      var parentPosition = Math.floor( ( insertionPoint - 1 ) / 2 );
      // If the parent's priority is already less than or equal to the new item's priority,
      // the heap property is satisfied, so stop bubbling up.
      if ( this.heapArray[ parentPosition ][ 1 ] <= newItem[ 1 ] ) break;

      // Move the parent node down to make space for the new item
      this.heapArray[ insertionPoint ] = this.heapArray[ parentPosition ];
      insertionPoint = parentPosition;
    }
    this.heapArray[ insertionPoint ] = newItem; // Place the new item at its correct position
  },

  /*
   * Extracts the element with the smallest priority (root of the heap).
   * @returns {any} The value (first component) of the element with the smallest priority.
   */
  extractMinItem : function() {
    var minElement = this.heapArray[ 0 ]; // The element with the smallest priority is always at the root
    var lastElementInHeap = this.heapArray[ --this.currentHeapSize ]; // Get the last element and decrement heap size
    var heapifyPosition = 0;

    // Re-heapify from the root to maintain the min-heap property
    while ( heapifyPosition * 2 + 1 < this.currentHeapSize ) {
      var leftChildPosition = heapifyPosition * 2 + 1;
      var rightChildPosition = heapifyPosition * 2 + 2;
      var smallestChildPosition = leftChildPosition; // Assume left child is the smallest initially

      // If a right child exists and its priority is smaller than the left child's, it's the smallest
      if ( rightChildPosition < this.currentHeapSize && this.heapArray[ rightChildPosition ][ 1 ] < this.heapArray[ leftChildPosition ][ 1 ] ) {
        smallestChildPosition = rightChildPosition;
      }

      // If the element being placed (lastElementInHeap) has a priority less than or equal to
      // the smallest child, the heap property is restored.
      if ( this.heapArray[ smallestChildPosition ][ 1 ] >= lastElementInHeap[ 1 ] ) break;

      // Move the smallest child up
      this.heapArray[ heapifyPosition ] = this.heapArray[ smallestChildPosition ];
      heapifyPosition = smallestChildPosition;
    }
    this.heapArray[ heapifyPosition ] = lastElementInHeap; // Place the last element at its correct position

    // Remove the duplicate element from the end of the array
    this.heapArray.pop();
    return minElement[0]; // Return only the value component (e.g., node index) of the minimum element
  },

  /*
   * Returns the current number of elements stored in the heap.
   * @returns {number} The count of items in the priority queue.
   */
  getCurrentSize : function() {
    return this.heapArray.length;
  }
};

// Initiate the graph processing by reading input from standard input
ProcessInput( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );