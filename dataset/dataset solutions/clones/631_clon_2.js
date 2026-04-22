/* This script processes input from standard input to solve a pathfinding problem. */

var rawData = ''; // Stores all incoming standard input data.

// Resume the standard input stream to listen for data.
process.stdin.resume( );

// Set the encoding for the input stream to UTF-8.
process.stdin.setEncoding( 'utf8' );

// Attach a listener for 'data' events.
process.stdin.on( 'data', function ( dataSegment ) {
  rawData += dataSegment; // Append new data segments to the rawData string.
} );

// Attach a listener for the 'end' event, indicating all input has been received.
process.stdin.on( 'end', function ( ) {
  executeProblemSolver( ); // Once input is complete, invoke the main solver function.
} );


/**
 * The primary function that orchestrates the problem-solving logic.
 * It parses input, initializes graph structures, performs a Bellman-Ford
 * calculation, and then executes a state-space search.
 */
function executeProblemSolver( ) {

  // Split the entire raw input into individual lines.
  const inputLines = rawData.split( '\n' );

  // Parse the first line to get problem parameters:
  // numVertices: total number of nodes/vertices in the graph.
  const numVertices = inputLines[ 0 ].split( ' ' )[ 0 ] - 0;
  // numConnections: total number of edges/connections between nodes.
  const numConnections = inputLines[ 0 ].split( ' ' )[ 1 ] - 0;
  // initialCapacity: the starting fluid capacity or resource level.
  const initialCapacity = inputLines[ 0 ].split( ' ' )[ 2 ] - 0;


  // Declare loop control variables.
  let idx;
  let counter;
  let iterator;

  // vertexCapacities: An array storing the height/capacity associated with each vertex.
  const vertexCapacities = new Array( numVertices );
  // adjacencyList: A representation of the graph, where each element is an array
  // of objects, detailing connections from that vertex.
  const adjacencyList = new Array( numVertices );
  // visitedStates: A history of visited states for each vertex, used for pruning
  // redundant paths in the search.
  const visitedStates = new Array( numVertices );
  // processingQueue: A stack (or priority queue, due to sorting) used for the
  // state-space search algorithm.
  const processingQueue = [ ];


  // Initialize vertex-specific data structures.
  for ( idx = 0; idx < numVertices; idx++ ) {
    // Populate vertexCapacities from the input lines.
    vertexCapacities[ idx ] = inputLines[ idx + 1 ] - 0;
    // Initialize an empty array for each vertex's adjacency list.
    adjacencyList[ idx ] = [ ];
    // Initialize an empty array for each vertex's visited states history.
    visitedStates[ idx ] = [ ];
  }


  // Variables for parsing connection details.
  let segmentParts;
  let sourceNodeIdx;
  let targetNodeIdx;
  let travelCost;

  // connectionDetails: An array to hold all edge information, primarily used by Bellman-Ford.
  const connectionDetails = new Array( numConnections );

  // Iterate through the input lines to build the graph's connections.
  for ( idx = 0; idx < numConnections; idx++ ) {
    segmentParts = inputLines[ idx + numVertices + 1 ].split( ' ' );
    sourceNodeIdx = segmentParts[ 0 ] - 1; // Adjust to 0-based indexing.
    targetNodeIdx = segmentParts[ 1 ] - 1; // Adjust to 0-based indexing.
    travelCost = segmentParts[ 2 ] - 0;   // Convert cost to a number.

    // Add connection from source to target.
    adjacencyList[ sourceNodeIdx ].push( {
      neighborVertex: targetNodeIdx,
      edgeWeight: travelCost
    } );
    // Add connection from target to source (assuming an undirected graph).
    adjacencyList[ targetNodeIdx ].push( {
      neighborVertex: sourceNodeIdx,
      edgeWeight: travelCost
    } );
    // Store the edge for the Bellman-Ford algorithm.
    connectionDetails[ idx ] = [ sourceNodeIdx, targetNodeIdx, travelCost ];
  }


  /**
   * Implements the Bellman-Ford algorithm to find shortest paths from a
   * specified source node to all other nodes in a graph with edge constraints.
   *
   * @param {number} totalNodes The total number of nodes in the graph.
   * @param {number} startNode The index of the source node.
   * @param {Array<Array<number>>} allConnections An array of all edges [u, v, weight].
   * @returns {Array<number>} An array containing the shortest distance from the startNode
   *                            to every other node.
   */
  function calculateShortestPaths( totalNodes, startNode, allConnections ) {
    // distanceMap: Stores the shortest distance from the startNode to each node.
    const distanceMap = new Array( totalNodes );
    let loopVar;

    // Initialize all distances to positive infinity.
    for ( loopVar = 0; loopVar < totalNodes; loopVar++ ) {
      distanceMap[ loopVar ] = Number.POSITIVE_INFINITY;
    }
    // The distance from the startNode to itself is zero.
    distanceMap[ startNode ] = 0;

    // Flag to track if any distance was updated in an iteration.
    let hasUpdated = true;
    let fromVertex, toVertex, edgeWeight;

    // Continue relaxing edges until no more updates are possible.
    while ( hasUpdated ) {
      hasUpdated = false; // Reset flag for the current iteration.

      // Iterate over all connections (edges).
      for ( loopVar = 0; loopVar < allConnections.length; loopVar++ ) {
        fromVertex = allConnections[ loopVar ][ 0 ];
        toVertex = allConnections[ loopVar ][ 1 ];
        edgeWeight = allConnections[ loopVar ][ 2 ];

        // Relaxation for path from fromVertex to toVertex, considering capacity constraint.
        if ( distanceMap[ toVertex ] > distanceMap[ fromVertex ] + edgeWeight && vertexCapacities[ toVertex ] >= edgeWeight ) {
          distanceMap[ toVertex ] = distanceMap[ fromVertex ] + edgeWeight;
          hasUpdated = true;
        }
        // Relaxation for path from toVertex to fromVertex (for undirected edges), considering capacity constraint.
        if ( distanceMap[ fromVertex ] > distanceMap[ toVertex ] + edgeWeight && vertexCapacities[ fromVertex ] >= edgeWeight ) {
          distanceMap[ fromVertex ] = distanceMap[ toVertex ] + edgeWeight;
          hasUpdated = true;
        }
      }
    }
    return distanceMap; // Return the computed shortest distances.
  }

  // Calculate the shortest path distances from the last vertex (numVertices - 1)
  // to all other vertices using the Bellman-Ford variant.
  const minDistancesFromEnd = calculateShortestPaths( numVertices, numVertices - 1, connectionDetails );


  // Initialize the processing queue with the starting state.
  // currentVertex: The current node index (starting at 0).
  // accumulatedTime: The time elapsed to reach this state (starting at 0).
  // currentCapacity: The current fluid capacity at this state (starting with initialCapacity).
  processingQueue.push( {
    currentVertex: 0,
    accumulatedTime: 0,
    currentCapacity: initialCapacity
  } );

  // Declare variables for the main search loop.
  let currentExplorationState;
  let neighborVertex;
  let connectionInfo;
  let destination; // This variable was unused in the original, keeping for structure.
  let nextExplorationState;

  // Initialize the overall minimum traversal time to infinity.
  let minimumTraversalTime = Number.POSITIVE_INFINITY;

  // Record the initial state in the visited states history for the starting vertex.
  visitedStates[ 0 ].push( {
    accumulatedTime: 0,
    currentCapacity: initialCapacity
  } );


  // Main state-space search loop (similar to Dijkstra's or A* with pruning).
  while ( processingQueue.length > 0 ) {
    // Pop the state with the highest accumulated time (simulating a max-heap for sorting by time, though a min-heap is usually used for shortest path).
    // The sorting at the end makes this behave like a priority queue.
    currentExplorationState = processingQueue.pop( );

    // Pruning condition: If the current path's estimated total time (current time +
    // 2 * Bellman-Ford distance to end - current capacity) is already worse than
    // the best known minimumTraversalTime, then prune this path.
    if ( currentExplorationState.accumulatedTime + minDistancesFromEnd[ currentExplorationState.currentVertex ] * 2 - currentExplorationState.currentCapacity >= minimumTraversalTime ) {
      continue; // Skip to the next state in the queue.
    }

    // Explore all neighbors of the current vertex.
    for ( idx = 0; idx < adjacencyList[ currentExplorationState.currentVertex ].length; idx++ ) {
      connectionInfo = adjacencyList[ currentExplorationState.currentVertex ][ idx ];
      neighborVertex = connectionInfo.neighborVertex;

      // Constraint check: The current vertex's capacity must be at least the edge weight.
      if ( vertexCapacities[ currentExplorationState.currentVertex ] < connectionInfo.edgeWeight ) {
        continue; // Cannot traverse this edge.
      }

      // Calculate the next exploration state based on capacity dynamics.
      if ( vertexCapacities[ neighborVertex ] + connectionInfo.edgeWeight < currentExplorationState.currentCapacity ) {
        // Case 1: Next vertex's capacity plus edge weight is less than current capacity.
        // This means the capacity will be fully utilized and then replenished at the next vertex.
        nextExplorationState = {
          currentVertex: neighborVertex,
          accumulatedTime: currentExplorationState.accumulatedTime + connectionInfo.edgeWeight + currentExplorationState.currentCapacity - ( vertexCapacities[ neighborVertex ] + connectionInfo.edgeWeight ),
          currentCapacity: vertexCapacities[ neighborVertex ]
        };
      } else if ( vertexCapacities[ neighborVertex ] + connectionInfo.edgeWeight >= currentExplorationState.currentCapacity && currentExplorationState.currentCapacity >= connectionInfo.edgeWeight ) {
        // Case 2: Next vertex's capacity plus edge weight is greater than or equal to current capacity,
        // and current capacity is sufficient for the edge weight.
        // Capacity decreases by edge weight.
        nextExplorationState = {
          currentVertex: neighborVertex,
          accumulatedTime: currentExplorationState.accumulatedTime + connectionInfo.edgeWeight,
          currentCapacity: currentExplorationState.currentCapacity - connectionInfo.edgeWeight
        };
      } else {
        // Case 3: Current capacity is less than the edge weight.
        // This implies depletion of capacity, and time is added to cover the deficit.
        nextExplorationState = {
          currentVertex: neighborVertex,
          accumulatedTime: currentExplorationState.accumulatedTime + connectionInfo.edgeWeight + connectionInfo.edgeWeight - currentExplorationState.currentCapacity,
          currentCapacity: 0
        };
      }

      // Check if the destination vertex (numVertices - 1) has been reached.
      if ( neighborVertex === numVertices - 1 ) {
        // Update the overall minimum traversal time.
        minimumTraversalTime = Math.min( minimumTraversalTime, nextExplorationState.accumulatedTime + vertexCapacities[ numVertices - 1 ] - nextExplorationState.currentCapacity );
      } else {
        // If not the destination, check if this state has been visited in a better or equivalent way.
        // The .some() method checks if any historical state for this neighbor is better (less time, greater or equal capacity).
        if ( !visitedStates[ neighborVertex ].some( function ( historicalState ) {
          return historicalState.accumulatedTime < nextExplorationState.accumulatedTime && historicalState.currentCapacity >= nextExplorationState.currentCapacity;
        } ) ) {
          // If this is a new or improved state, record it and push to the queue.
          visitedStates[ neighborVertex ].push( {
            accumulatedTime: nextExplorationState.accumulatedTime,
            currentCapacity: nextExplorationState.currentCapacity
          } );
          processingQueue.push( nextExplorationState );
        }
      }
    }

    // Sort the processing queue by accumulated time in descending order.
    // This makes `pop()` retrieve the state with the highest time, which is
    // an unusual choice for shortest path, but matches the original code's behavior.
    // If it were a min-priority queue, it would be `a.accumulatedTime - b.accumulatedTime`.
    processingQueue.sort( function ( stateA, stateB ) {
      return stateB.accumulatedTime - stateA.accumulatedTime;
    } );

    // Optional: console.log for debugging purposes, commented out as per original.
    // console.log(processingQueue[processingQueue.length - 1].accumulatedTime, minimumTraversalTime);
  }

  // Output the final result.
  if ( minimumTraversalTime === Number.POSITIVE_INFINITY ) {
    console.log( -1 ); // No path found.
  } else {
    console.log( minimumTraversalTime ); // Output the minimum time.
  }

}