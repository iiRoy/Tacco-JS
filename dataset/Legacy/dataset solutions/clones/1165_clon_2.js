var graphAdjList = []; // Adjacency list to represent the graph
var numVertices, numEdges; // Global variables for vertex and edge counts

// Resume standard input and set encoding
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Event listener for incoming data from stdin
process.stdin.on( 'data', function( dataChunk )
{
  // Trim whitespace and split the input into individual lines
  var inputLines = dataChunk.trim().split('\n');

  // Iterate through each line of input
  for( var lineIndex = 0; lineIndex < inputLines.length; ++lineIndex )
  {
    // The first line contains the number of vertices and edges
    if( lineIndex === 0 )
    {
      // Parse vertex and edge counts from the first line
      var vertexEdgeCounts = inputLines[lineIndex].split(' ').map(Number);
      numVertices = vertexEdgeCounts[0];
      numEdges = vertexEdgeCounts[1];

      // Initialize the adjacency list for each vertex
      for( var vertexIndex = 0; vertexIndex < numVertices; ++vertexIndex )
      {
        graphAdjList[vertexIndex] = [];
      }
    }
    // Subsequent lines define the edges
    else
    {
      // Parse edge details (from, to, capacity)
      var edgeDetails = inputLines[lineIndex].split(' ').map(Number);
      // Add the edge to the graph
      addGraphEdge( edgeDetails[0], edgeDetails[1], edgeDetails[2] );
    }
  }

  // After processing all input, calculate and print the maximum flow
  console.log( calculateMaxFlow( 0, numVertices - 1 ) );
});

/**
 * Adds a directed edge and its reverse (residual) edge to the graph.
 * @param {number} sourceNode - The starting node of the edge.
 * @param {number} targetNode - The ending node of the edge.
 * @param {number} capacityValue - The capacity of the forward edge.
 */
function addGraphEdge( sourceNode, targetNode, capacityValue )
{
  // Add the forward edge
  graphAdjList[sourceNode].push( { destination: targetNode, flowCapacity: capacityValue, reverseEdgeIndex: graphAdjList[targetNode].length } );
  // Add the reverse (residual) edge with 0 initial capacity
  graphAdjList[targetNode].push( { destination: sourceNode, flowCapacity: 0, reverseEdgeIndex: graphAdjList[sourceNode].length - 1 } );
}

var visitedNodes; // Array to keep track of visited nodes during DFS

/**
 * Performs a Depth-First Search to find an augmenting path in the residual graph.
 * @param {number} currentNode - The current node in the DFS traversal.
 * @param {number} sinkNode - The target sink node.
 * @param {number} currentFlow - The minimum capacity found along the path to the current node.
 * @returns {number} The amount of flow that can be pushed along the found path, or 0 if no path exists.
 */
function depthFirstSearch( currentNode, sinkNode, currentFlow )
{
  // If the sink node is reached, return the current flow
  if( currentNode === sinkNode )
  {
    return currentFlow;
  }

  // Mark the current node as visited
  visitedNodes[currentNode] = true;

  // Iterate through all edges from the current node
  for( var edgeIterator = 0; edgeIterator < graphAdjList[currentNode].length; ++edgeIterator )
  {
    var currentEdge = graphAdjList[currentNode][edgeIterator];

    // If the destination node is not visited and the edge has remaining capacity
    if( !visitedNodes[currentEdge.destination] && currentEdge.flowCapacity > 0 )
    {
      // Recursively call DFS for the next node, updating the path flow
      var resultantFlow = depthFirstSearch( currentEdge.destination, sinkNode, Math.min( currentFlow, currentEdge.flowCapacity ) );

      // If a positive flow was found through this path
      if( resultantFlow > 0 )
      {
        // Reduce capacity of the forward edge
        currentEdge.flowCapacity -= resultantFlow;
        // Increase capacity of the reverse edge
        graphAdjList[currentEdge.destination][currentEdge.reverseEdgeIndex].flowCapacity += resultantFlow;

        // Return the flow found for this path
        return resultantFlow;
      }
    }
  }

  // No augmenting path found from this node
  return 0;
}

/**
 * Calculates the maximum flow from a source node to a sink node using the Edmonds-Karp algorithm.
 * @param {number} sourceNode - The starting source node.
 * @param {number} sinkNode - The ending sink node.
 * @returns {number} The total maximum flow from source to sink.
 */
function calculateMaxFlow( sourceNode, sinkNode )
{
  var totalFlow = 0; // Initialize total flow to zero

  // Loop indefinitely until no more augmenting paths can be found
  while( true )
  {
    // Reset the visited nodes array for each DFS iteration
    visitedNodes = new Array(numVertices).fill(false);

    // Find an augmenting path using DFS
    var flowFound = depthFirstSearch( sourceNode, sinkNode, Number.POSITIVE_INFINITY );

    // Add the flow found in this path to the total flow
    totalFlow += flowFound;

    // If no flow was found in this iteration, break the loop
    if( flowFound === 0 )
    {
      break;
    }
  }

  // Return the accumulated maximum flow
  return totalFlow;
}
