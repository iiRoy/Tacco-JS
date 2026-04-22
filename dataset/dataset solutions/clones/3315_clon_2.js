'use strict' // Enforces strict parsing and error handling

/**
 * Recursively computes the maximum path length starting from a given node
 * within an acyclic graph. Utilizes memoization to avoid re-computation.
 * @param {number} currentNodeId - The identifier of the current node.
 * @param {Array<Array<number>>} adjacencyMap - The adjacency list representation of the graph.
 * @param {Object<string, number>} pathCache - A memoization table for path lengths.
 * @returns {number} The maximum path length from the current node.
 */
function computeLongestPath ( currentNodeId, adjacencyMap, pathCache ) {
  // If the result for this node is already cached, return it.
  if ( pathCache[currentNodeId.toString()] ) {
    return pathCache[currentNodeId.toString()] ;
  }

  // If the current node has no outgoing edges, its path length is 0.
  if ( !adjacencyMap[currentNodeId].length ) {
    return 0 ;
  }

  let maxLength = 0 ; // Initialize maximum path length found so far from this node.

  // Iterate over all direct neighbors of the current node.
  for ( let idx = 0 ; idx < adjacencyMap[currentNodeId].length ; idx++ ) {
    // Recursively compute the path length from the neighbor and update maxLength.
    maxLength = Math.max( maxLength, 1 + computeLongestPath( adjacencyMap[currentNodeId][idx], adjacencyMap, pathCache ) ) ;
  }

  // Store the computed maximum path length in the cache before returning.
  pathCache[currentNodeId.toString()] = maxLength ;
  return maxLength ;
}

/**
 * Builds an adjacency list and calculates in-degrees for all nodes
 * based on the provided node count and edge connections.
 * @param {number} nodeCount - The total number of nodes in the graph.
 * @param {Array<Array<number>>} connectionPairs - An array of [from, to] edge pairs.
 * @returns {{graphMap: Array<Array<number>>, entryDegrees: Array<number>}} An object containing the adjacency list and in-degree counts.
 */
function buildAdjacencyStructure( nodeCount, connectionPairs ) {
  // Initialize adjacency list: an array of arrays, one for each node (1-indexed).
  let adjacencies = new Array( nodeCount + 1 ).fill(0).map( e => [] ) ;
  // Initialize in-degree counts for each node (1-indexed).
  let inDegreeCounts = new Array( nodeCount + 1 ).fill( 0 ) ;

  // Process each edge to populate the adjacency list and in-degree counts.
  for ( let edgeIndex = 0 ; edgeIndex < connectionPairs.length ; edgeIndex++ ) {
    const sourceNode = connectionPairs[edgeIndex][0] ;
    const destinationNode = connectionPairs[edgeIndex][1] ;

    adjacencies[sourceNode].push( destinationNode ) ;
    inDegreeCounts[destinationNode]++ ;
  }

  // Return the constructed graph components.
  return {
    graphMap: adjacencies,
    entryDegrees: inDegreeCounts
  } ;
}

/**
 * Determines the overall longest path in a directed acyclic graph (DAG)
 * by starting DFS from all nodes with an in-degree of zero.
 * @param {number} totalNodes - The total number of nodes in the graph.
 * @param {Array<Array<number>>} connections - An array of [from, to] edge pairs.
 * @returns {number} The maximum path length found in the entire graph.
 */
function determineOverallLongestPath( totalNodes, connections ) {
  // Build the graph's adjacency structure and in-degree information.
  const graphData = buildAdjacencyStructure( totalNodes, connections ) ;
  const nodeGraph = graphData.graphMap ;
  const entryPoints = graphData.entryDegrees ;

  let globalMaxPath = 0 ; // Stores the maximum path length across all possible starting points.

  // Iterate through all possible nodes to find those with no incoming edges.
  for ( let nodeIter = 1 ; nodeIter <= entryPoints.length ; nodeIter++ ) {
    // If a node has an in-degree of 0, it's a potential starting point for a path.
    if ( entryPoints[nodeIter] === 0 ) {
      let currentPathMemo = {} ; // A fresh memoization table for each top-level DFS call.
      // Compute the longest path starting from this entry point and update the overall maximum.
      globalMaxPath = Math.max( globalMaxPath, computeLongestPath( nodeIter, nodeGraph, currentPathMemo ) ) ;
    }
  }
  return globalMaxPath ; // Return the grand maximum path length.
}

/**
 * Main entry point for the program. Reads input, processes it, and prints the result.
 * @param {string} rawData - The raw input string containing graph data.
 * @returns {number} The final computed answer.
 */
function executeProgram( rawData ) {
  const inputLines = rawData.split( '\n' ) ; // Split input into individual lines.

  // Parse the first line for node and edge counts.
  const nodeEdgeCounts = inputLines[0].split( ' ' ).map( val => parseInt( val, 10 ) ) ;
  const numNodes = nodeEdgeCounts[0] ;

  // Parse subsequent lines to get the list of edges.
  const edgeList = inputLines.slice( 1 ).map( lineStr => lineStr.split( ' ' ).map( element => parseInt( element, 10 ) ) ) ;

  // Solve the problem using the parsed data.
  const finalResult = determineOverallLongestPath( numNodes, edgeList ) ;
  return finalResult ; // Output the computed answer.
}

// Read input from stdin and execute the main program function.
executeProgram( require('fs').readFileSync('/dev/stdin', 'utf8') ) ;