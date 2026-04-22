'use strict'; // Ensures strict parsing and execution of JavaScript code.

/**
 * Implements a min-priority queue using a binary heap data structure.
 * Elements are ordered based on a provided comparison function.
 */
function BinaryMinHeap( comparatorFunction ) {
  /** @private {Array<*>} Internal array representing the heap's underlying data. */
  this.heapData = [];
  /** @private {function(*, *): number} The function used to compare two elements.
   * It should return a negative value if a < b, a positive value if a > b, and 0 if a == b. */
  this.comparatorFunction = comparatorFunction;
}

/**
 * Swaps two elements within the heap's internal array.
 * @private
 * @param {number} indexA - The index of the first element.
 * @param {number} indexB - The index of the second element.
 */
BinaryMinHeap.prototype._swapElements = function( indexA, indexB ) {
  // Use a temporary variable to facilitate the swap operation.
  const temporaryValue = this.heapData[ indexA ];
  this.heapData[ indexA ] = this.heapData[ indexB ];
  this.heapData[ indexB ] = temporaryValue;
};

/**
 * Moves an element up the heap (towards the root) to maintain the min-heap property.
 * This is typically called after an element has been added to the end of the heap.
 * @private
 * @param {number} initialIndex - The starting index of the element to bubble up.
 */
BinaryMinHeap.prototype._bubbleUp = function( initialIndex ) {
  let currentIndex = initialIndex;
  // Continue bubbling up as long as the current element is not the root.
  while ( currentIndex > 0 ) {
    // Calculate the index of the parent node.
    const parentIndex = Math.floor( ( currentIndex - 1 ) / 2 );
    
    // If the parent is smaller than or equal to the current element,
    // the min-heap property is satisfied, so we stop.
    if ( this.comparatorFunction( this.heapData[ parentIndex ], this.heapData[ currentIndex ] ) <= 0 ) {
      break;
    }
    
    // If the parent is larger, swap the current element with its parent.
    this._swapElements( currentIndex, parentIndex );
    // Update the current index to the parent's index and continue.
    currentIndex = parentIndex;
  }
};

/**
 * Moves an element down the heap (towards the leaves) to maintain the min-heap property.
 * This is typically called after the root element has been removed and the last element
 * has been moved to the root.
 * @private
 * @param {number} initialIndex - The starting index of the element to sink down.
 */
BinaryMinHeap.prototype._sinkDown = function( initialIndex ) {
  let currentIndex = initialIndex;
  const totalElements = this.heapData.length;

  // Loop indefinitely until the element is in its correct position.
  while ( true ) {
    // Calculate the indices of the left and right children.
    const leftChildIndex = 2 * currentIndex + 1;
    const rightChildIndex = 2 * currentIndex + 2;
    let smallestChildIndex = currentIndex; // Assume current element is the smallest initially.

    // Check if the left child exists and is smaller than the current smallest.
    if ( leftChildIndex < totalElements &&
         this.comparatorFunction( this.heapData[ leftChildIndex ], this.heapData[ smallestChildIndex ] ) < 0 ) {
      smallestChildIndex = leftChildIndex;
    }

    // Check if the right child exists and is smaller than the current smallest (or left child if it was smaller).
    if ( rightChildIndex < totalElements &&
         this.comparatorFunction( this.heapData[ rightChildIndex ], this.heapData[ smallestChildIndex ] ) < 0 ) {
      smallestChildIndex = rightChildIndex;
    }

    // If the current element is indeed the smallest among itself and its children,
    // the heap property is satisfied, and we stop.
    if ( smallestChildIndex === currentIndex ) {
      break;
    }

    // Otherwise, swap the current element with the smallest child.
    this._swapElements( currentIndex, smallestChildIndex );
    // Update the current index to the child's index and continue sinking down.
    currentIndex = smallestChildIndex;
  }
};

/**
 * Adds a new element to the heap, maintaining the min-heap property.
 * @param {*} valueToInsert - The element to be added.
 */
BinaryMinHeap.prototype.insertValue = function( valueToInsert ) {
  this.heapData.push( valueToInsert ); // Add the new element to the end of the array.
  this._bubbleUp( this.heapData.length - 1 ); // Bubble it up to its correct position.
};

/**
 * Removes and returns the minimum element from the heap.
 * @returns {*} The minimum element, or `undefined` if the heap is empty.
 */
BinaryMinHeap.prototype.extractMin = function() {
  // Guard clause for an empty heap.
  if ( this.heapData.length === 0 ) {
    return undefined;
  }
  // Edge case: if only one element, simply remove and return it.
  if ( this.heapData.length === 1 ) {
    return this.heapData.pop();
  }

  // The minimum element is always at the root (index 0).
  const minimumElement = this.heapData[ 0 ];
  // Move the last element to the root position.
  this.heapData[ 0 ] = this.heapData.pop();
  // Restore the heap property by sinking down the new root element.
  this._sinkDown( 0 );

  return minimumElement;
};

/**
 * Returns the minimum element of the heap without removing it.
 * @returns {*} The minimum element, or `undefined` if the heap is empty.
 */
BinaryMinHeap.prototype.getMin = function() {
  // Return the first element if the heap is not empty, otherwise undefined.
  return this.heapData.length > 0 ? this.heapData[ 0 ] : undefined;
};

/**
 * Returns the current number of elements in the heap.
 * @returns {number} The count of elements.
 */
BinaryMinHeap.prototype.getSize = function() {
  return this.heapData.length;
};

/**
 * Checks if the heap contains no elements.
 * @returns {boolean} `true` if the heap is empty, `false` otherwise.
 */
BinaryMinHeap.prototype.isCollectionEmpty = function() {
  return this.getSize() === 0;
};

// --- Graph Algorithm Section (Dijkstra's Shortest Path Implementation) ---

/** @constant {number} A large value representing an infinite distance for unreachable nodes. */
const HUGE_DISTANCE_VAL = Number.POSITIVE_INFINITY / 2; // Slightly different constant value.

/**
 * Computes the shortest path distances from a specified source node to all other
 * nodes in a weighted, directed graph using Dijkstra's algorithm.
 *
 * @param {number} totalNodes - The total number of vertices in the graph.
 * @param {number} initialSourceNode - The identifier of the starting node (source).
 * @param {Map<number, Array<{ target: number, weight: number }>>} graphAdjacencyList -
 *   The graph structure represented as an adjacency list where keys are source nodes
 *   and values are arrays of objects describing outgoing edges (target node and weight).
 * @returns {Map<number, number>} A map where keys are node identifiers and values are
 *   their shortest distances from the `initialSourceNode`.
 */
function calculateMinPathDistances( totalNodes, initialSourceNode, graphAdjacencyList ) {
  // Map to store the shortest distance found so far for each node.
  // Initially, all distances are set to HUGE_DISTANCE_VAL.
  const shortestDistances = new Map();
  for ( let nodeIndex = 0; nodeIndex < totalNodes; ++nodeIndex ) {
    shortestDistances.set( nodeIndex, HUGE_DISTANCE_VAL );
  }

  // The distance from the source node to itself is 0.
  shortestDistances.set( initialSourceNode, 0 );

  // Define a comparator function for the priority queue.
  // It prioritizes nodes with smaller distances, and then by node ID for tie-breaking.
  const pathNodeComparator = ( nodeA, nodeB ) => {
    if ( nodeA.distance !== nodeB.distance ) {
      return nodeA.distance - nodeB.distance;
    }
    return nodeA.nodeId - nodeB.nodeId; // Secondary sort by node ID.
  };

  // Initialize a min-priority queue to manage nodes to be explored.
  // It stores objects like { distance: currentShortestDistance, nodeId: nodeIdentifier }.
  const explorationQueue = new BinaryMinHeap( pathNodeComparator );
  // Add the source node to the queue to start the algorithm.
  explorationQueue.insertValue( { distance: 0, nodeId: initialSourceNode } );

  // A set to keep track of nodes for which the shortest path has already been finalized.
  // This helps in avoiding redundant processing of nodes.
  const finalizedNodes = new Set(); // New fragment: explicitly track finalized nodes.

  // Continue processing until the priority queue is empty.
  while ( !explorationQueue.isCollectionEmpty() ) {
    // Extract the node with the smallest known distance.
    const { distance: currentPathDistance, nodeId: currentNodeIdentifier } = explorationQueue.extractMin();

    // If this node has already been finalized, or if we found a shorter path to it previously,
    // then this entry from the priority queue is stale, so skip it.
    if ( finalizedNodes.has( currentNodeIdentifier ) || currentPathDistance > shortestDistances.get( currentNodeIdentifier ) ) {
      continue;
    }

    // Mark the current node as finalized; its shortest path has been determined.
    finalizedNodes.add( currentNodeIdentifier );

    // Retrieve the list of neighbors (outgoing edges) from the current node.
    // Use an empty array if the node has no outgoing edges to prevent errors.
    const neighborConnections = graphAdjacencyList.get( currentNodeIdentifier ) || [];

    // Iterate over each connection (edge) from the current node.
    for ( const connectionDetails of neighborConnections ) {
      const { target: neighborNodeIdentifier, weight: edgeWeight } = connectionDetails;
      // Calculate the potential distance to the neighbor through the current node.
      const candidateDistance = currentPathDistance + edgeWeight;

      // If this new path to the neighbor is shorter than any previously found path, update it.
      if ( candidateDistance < shortestDistances.get( neighborNodeIdentifier ) ) {
        shortestDistances.set( neighborNodeIdentifier, candidateDistance );
        // Add the neighbor to the priority queue with its updated shortest distance.
        explorationQueue.insertValue( { distance: candidateDistance, nodeId: neighborNodeIdentifier } );
      }
    }
  }

  return shortestDistances;
}

/**
 * Main execution block: reads graph input, constructs the graph, runs Dijkstra's algorithm,
 * and prints the resulting shortest distances.
 * @param {string} rawInputContent - The raw string input from stdin.
 */
( function executeGraphProcessing( rawInputContent ) {
  // Clean and split the input string into an array of lines.
  const inputLines = rawInputContent.trim().split( '\n' );

  // Basic validation for input lines.
  if ( inputLines.length === 0 ) {
    console.error( "Error: No input data provided. Please check stdin." );
    return;
  }

  // Parse the first line to get graph parameters: V (total nodes), E (total edges), R (source node).
  const initialParameters = inputLines[ 0 ].split( ' ' ).map( Number );
  // Validate the number and type of parameters.
  if ( initialParameters.length !== 3 || initialParameters.some( isNaN ) ) {
    console.error( `Error: Invalid graph parameters in the first line: '${inputLines[ 0 ]}'. Expected 'V E R'.` );
    return;
  }
  const totalNodes = initialParameters[ 0 ];
  const totalEdges = initialParameters[ 1 ];
  const initialSourceNode = initialParameters[ 2 ];

  // Initialize the graph using a Map for its adjacency list representation.
  // This allows for flexible node IDs and efficient access.
  const graphAdjacencyMap = new Map();
  // Ensure every node from 0 to totalNodes-1 exists in the map with an empty array.
  for ( let node = 0; node < totalNodes; ++node ) {
    graphAdjacencyMap.set( node, [] );
  }

  // Process subsequent lines to build the graph's edges.
  // The loop runs for 'totalEdges' lines, starting from the second line (index 1).
  for ( let lineIdx = 1; lineIdx <= totalEdges; ++lineIdx ) {
    // Guard clause: ensure there are enough lines for all declared edges.
    if ( lineIdx >= inputLines.length ) {
      console.warn( `Warning: Expected ${totalEdges} edge lines but only found ${inputLines.length - 1} after header. Stopping edge parsing.` );
      break;
    }

    const edgeComponents = inputLines[ lineIdx ].split( ' ' ).map( Number );
    // Validate edge data format.
    if ( edgeComponents.length !== 3 || edgeComponents.some( isNaN ) ) {
      console.warn( `Warning: Skipping malformed edge data on line ${lineIdx + 1}: '${inputLines[ lineIdx ]}'. Expected 'fromNode toNode edgeWeight'.` );
      continue; // Skip this line and proceed to the next.
    }

    const fromNodeId = edgeComponents[ 0 ];
    const toNodeId = edgeComponents[ 1 ];
    const edgeWeight = edgeComponents[ 2 ];

    // Add the edge to the adjacency list of the 'fromNodeId'.
    // Basic validation for node IDs to be within expected range.
    if ( fromNodeId < 0 || fromNodeId >= totalNodes || toNodeId < 0 || toNodeId >= totalNodes ) {
        console.warn(`Warning: Edge on line ${lineIdx + 1} contains out-of-bounds node IDs (${fromNodeId}, ${toNodeId}). Skipping.`);
        continue;
    }
    
    // Retrieve the adjacency list for the source node and push the new edge.
    // `graphAdjacencyMap.get(fromNodeId)` should always exist due to initialization loop.
    graphAdjacencyMap.get( fromNodeId ).push( { target: toNodeId, weight: edgeWeight } );
  }

  // Execute Dijkstra's algorithm to calculate shortest paths.
  const computedDistances = calculateMinPathDistances( totalNodes, initialSourceNode, graphAdjacencyMap );

  // Output the computed shortest distances for each node.
  // Iterate through all possible node identifiers from 0 to totalNodes-1.
  for ( let nodeIdOutput = 0; nodeIdOutput < totalNodes; ++nodeIdOutput ) {
    const finalDistance = computedDistances.get( nodeIdOutput );
    // If the distance is our "infinity" value, it means the node is unreachable.
    const formattedOutput = finalDistance === HUGE_DISTANCE_VAL ? "INF" : finalDistance;
    console.log( formattedOutput );
  }

// Read input from standard input using Node.js's file system module.
} )( require( 'fs' ).readFileSync( '/dev/stdin' ).toString( 'utf8' ) );