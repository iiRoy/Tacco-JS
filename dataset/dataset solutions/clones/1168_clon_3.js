const flowNetworkGraph = []; // The adjacency list representing the graph for flow calculations.
let totalNodesInGraph, totalEdgesGiven; // Store the total number of nodes and edges from input.

// Resume standard input processing and set encoding.
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Event handler for incoming data from standard input.
process.stdin.on( 'data', ( rawDataInput ) =>
{
  // Split the raw input string into an array of lines.
  const inputLinesArray = rawDataInput.split('\n');

  // Process each line of input to construct the graph.
  for( let lineIndex = 0; lineIndex < inputLinesArray.length; ++lineIndex )
  {
    const currentLine = inputLinesArray[lineIndex].trim(); // Trim whitespace

    // Skip empty lines that might result from extra newlines in input.
    if (!currentLine) {
        continue;
    }

    if( lineIndex === 0 )
    {
      // The first line contains the number of vertices (nodes) and edges.
      const [parsedNodes, parsedEdges] = currentLine.split(' ').map(Number);

      // Basic input validation
      if (isNaN(parsedNodes) || parsedNodes < 2 || isNaN(parsedEdges) || parsedEdges < 0) {
          console.error("Invalid graph dimensions provided. Nodes must be at least 2.");
          process.exit(1); // Exit with an error code
          return; // Stop processing further input
      }

      totalNodesInGraph = parsedNodes;
      totalEdgesGiven = parsedEdges;

      // Initialize the adjacency list for each node.
      // Each element in the array will be an array to hold outgoing edges from that node.
      for( let nodeIdx = 0; nodeIdx < totalNodesInGraph; ++nodeIdx ) {
        flowNetworkGraph[nodeIdx] = [];
      }
    }
    else
    {
      // Subsequent lines describe the edges: from_node, to_node, capacity.
      const [sourceNd, destNd, edgeCapacity] = currentLine.split(' ').map(Number);

      // Add the directed edge and its reverse edge (for residual graph) to the flow network.
      // The `flowNetworkGraph` is passed explicitly to `establishConnection` to avoid global reliance within the function.
      establishConnection( flowNetworkGraph, sourceNd, destNd, edgeCapacity );
    }
  }

  // After processing all input, compute and print the maximum flow.
  // The source node is typically 0, and the sink node is totalNodesInGraph - 1.
  const graphSourceNode = 0;
  const graphSinkNode = totalNodesInGraph - 1;

  // Add a final check to ensure graph is properly initialized before computation.
  if (totalNodesInGraph === undefined || flowNetworkGraph.length !== totalNodesInGraph) {
      console.error("Graph initialization incomplete or incorrect.");
      process.exit(1);
  }

  // Calculate the maximum flow from the source to the sink.
  console.log( calculateMaximumNetworkFlow( flowNetworkGraph, totalNodesInGraph, graphSourceNode, graphSinkNode ) );
});

/**
 * Establishes a directed edge in the flow network and its corresponding reverse edge.
 * For residual graphs, a reverse edge with 0 capacity is added for future flow adjustments.
 *
 * @param {Array<Array<Object>>} graph The adjacency list representation of the flow network.
 * @param {number} sourceNode The starting node of the directed edge.
 * @param {number} targetNode The ending node of the directed edge.
 * @param {number} capacityValue The maximum flow capacity of this edge.
 */
function establishConnection( graph, sourceNode, targetNode, capacityValue )
{
  // Basic validation for node indices and capacity.
  if (sourceNode < 0 || sourceNode >= totalNodesInGraph ||
      targetNode < 0 || targetNode >= totalNodesInGraph) {
      console.error(`Invalid node index encountered: ${sourceNode} or ${targetNode}`);
      return;
  }
  if (capacityValue < 0) {
      console.warn(`Attempted to add edge with negative capacity: ${capacityValue}. Setting to 0.`);
      capacityValue = 0; // Treat negative capacity as zero.
  }

  // Create the forward edge object. 'rev' stores the index of its reverse edge in the targetNode's list.
  const forwardEdge = {
    destination: targetNode,
    flowCapacity: capacityValue,
    reverseEdgeIndex: graph[targetNode].length // Index where the reverse edge will be added in the targetNode's list.
  };
  graph[sourceNode].push( forwardEdge );

  // Create the reverse edge object. 'rev' stores the index of its forward edge in the sourceNode's list.
  // Initial capacity of reverse edge is 0.
  const backwardEdge = {
    destination: sourceNode,
    flowCapacity: 0, // Residual capacity for reverse flow.
    reverseEdgeIndex: graph[sourceNode].length - 1 // Index of the forward edge just added.
  };
  graph[targetNode].push( backwardEdge );
}

let visitedNodesStatus; // Global for DFS, indicating if a node has been visited in the current path search.

/**
 * Performs a Depth-First Search (DFS) to find an augmenting path from a source node to a sink node
 * in a residual graph, and determines the maximum flow that can be pushed along this path.
 *
 * @param {Array<Array<Object>>} currentGraph The current state of the residual graph.
 * @param {number} currentNode The node currently being visited in the DFS.
 * @param {number} finalSinkNode The target sink node for which a path is sought.
 * @param {number} pathFlowLimit The maximum flow that can be pushed through the path found so far.
 * @returns {number} The amount of flow found along the augmenting path, or 0 if no path exists.
 */
function depthFirstSearchForPath( currentGraph, currentNode, finalSinkNode, pathFlowLimit )
{
  // Base case: If the current node is the sink, we've found a path, return the flow limit.
  if( currentNode === finalSinkNode ) {
    return pathFlowLimit;
  }

  // Mark the current node as visited for this DFS traversal.
  visitedNodesStatus[currentNode] = true;

  // Iterate over all edges originating from the current node.
  // Ensure the current node actually has edges before iterating.
  if (!currentGraph[currentNode]) {
      return 0; // No edges from this node, no path.
  }

  for( let edgeIdx = 0; edgeIdx < currentGraph[currentNode].length; ++edgeIdx )
  {
    const currentEdge = currentGraph[currentNode][edgeIdx];

    // Check if the destination node of this edge hasn't been visited yet
    // and if there's available capacity on this edge.
    if( !visitedNodesStatus[currentEdge.destination] && currentEdge.flowCapacity > 0 )
    {
      // Recursively call DFS for the next node, limiting the flow by the current edge's capacity.
      const foundFlowAmount = depthFirstSearchForPath(
        currentGraph,
        currentEdge.destination,
        finalSinkNode,
        Math.min( pathFlowLimit, currentEdge.flowCapacity ) // The bottleneck capacity for this path.
      );

      // If a positive flow was found from the recursive call, it means an augmenting path exists.
      if( foundFlowAmount > 0 )
      {
        // Update the capacities:
        // Decrease capacity of the forward edge.
        currentEdge.flowCapacity -= foundFlowAmount;
        // Increase capacity of the reverse edge (in the residual graph).
        currentGraph[currentEdge.destination][currentEdge.reverseEdgeIndex].flowCapacity += foundFlowAmount;

        return foundFlowAmount; // Return the flow found for this path.
      }
    }
  }

  return 0; // No augmenting path found from this node.
}

/**
 * Computes the maximum flow from a specified source node to a sink node
 * in a given flow network graph using the Edmonds-Karp algorithm (BFS-based for shortest paths,
 * but here using DFS for path finding, which is generally Ford-Fulkerson).
 *
 * @param {Array<Array<Object>>} graphDefinition The adjacency list representation of the flow network.
 * @param {number} nodeCountTotal The total number of nodes in the graph.
 * @param {number} sourceNodeIdentifier The starting node for flow calculation.
 * @param {number} sinkNodeIdentifier The ending node for flow calculation.
 * @returns {number} The total maximum flow from source to sink.
 */
function calculateMaximumNetworkFlow( graphDefinition, nodeCountTotal, sourceNodeIdentifier, sinkNodeIdentifier )
{
  let totalFlowAccumulated = 0; // Initialize total flow to zero.

  // Edge case: if source and sink are the same or not enough nodes.
  if (sourceNodeIdentifier === sinkNodeIdentifier || nodeCountTotal < 2) {
      console.warn("Source and sink nodes are identical or not enough nodes to form a path. Max flow is 0.");
      return 0;
  }
  // Validate source and sink nodes are within bounds.
  if (sourceNodeIdentifier < 0 || sourceNodeIdentifier >= nodeCountTotal ||
      sinkNodeIdentifier < 0 || sinkNodeIdentifier >= nodeCountTotal) {
      console.error("Source or sink node identifier is out of graph bounds.");
      return 0;
  }


  // The algorithm repeatedly finds augmenting paths until no more can be found.
  while( true )
  {
    // Reset the visited status for each new DFS traversal.
    // This ensures that new paths can be explored in each iteration.
    visitedNodesStatus = new Array(nodeCountTotal).fill(false);

    // Attempt to find an augmenting path from source to sink with potentially infinite capacity.
    // The actual flow will be limited by the bottleneck edge on the path.
    const MAX_POSSIBLE_FLOW_CAP = Number.POSITIVE_INFINITY;
    const currentPathFlow = depthFirstSearchForPath(
      graphDefinition,
      sourceNodeIdentifier,
      sinkNodeIdentifier,
      MAX_POSSIBLE_FLOW_CAP
    );

    // If no flow was found along the path (i.e., no augmenting path exists), break the loop.
    if( currentPathFlow === 0 ) {
      break;
    }

    // Add the flow found in this path to the total accumulated flow.
    totalFlowAccumulated += currentPathFlow;
  }

  return totalFlowAccumulated; // Return the final maximum flow.
}