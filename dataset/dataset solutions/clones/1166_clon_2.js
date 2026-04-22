/* This array holds the adjacency list representation of the flow network. */
var networkGraph = [ ];
/* Variables to store the total number of vertices and edges in the graph. */
var nodeCount, linkCount;

// Start listening for incoming data on the standard input stream.
process.stdin.resume();

// Configure the encoding for the input data.
process.stdin.setEncoding( 'utf8' );

/* When data is received, this callback function processes it. */
process.stdin.on( 'data', function( rawInputData )
{
  // Split the raw input string into individual lines.
  var inputDataRows = rawInputData.split( '\n' );

  /* Loop through each line of input to parse graph details.
     We skip the last line as it's often empty due to trailing newline. */
  for ( var currentRowIndex = 0; currentRowIndex < inputDataRows.length - 1; ++currentRowIndex )
  {
    // The very first line contains the total number of nodes and edges.
    if ( currentRowIndex === 0 )
    {
      /* Parse the first line to extract node and edge counts. */
      var nodeEdgeInfo = inputDataRows[currentRowIndex].split( ' ' ).map( Number );
      nodeCount = nodeEdgeInfo[0];
      linkCount = nodeEdgeInfo[1];

      // Initialize the adjacency list for each node.
      for ( var nodeIterator = 0; nodeIterator < nodeCount; ++nodeIterator )
      {
        networkGraph[nodeIterator] = [];
      }
    }
    // Subsequent lines define the connections (edges) in the graph.
    else
    {
      /* Extract connection details: origin, destination, and capacity. */
      var connectionSpecs = inputDataRows[currentRowIndex].split( ' ' ).map( Number );
      establishConnection( connectionSpecs[0], connectionSpecs[1], connectionSpecs[2] );
    }
  }

  /* After processing all input, calculate and display the maximum flow
     from the source (node 0) to the sink (last node). */
  console.log( computeMaximumThroughput( 0, nodeCount - 1 ) );
} );


/* This function creates a directed edge and its corresponding reverse edge in the network.
   The reverse edge is used to allow flow cancellation in the residual graph. */
function establishConnection( originNode, destinationNode, edgeCapacity )
{
  // Add the forward edge to the adjacency list of the origin node.
  networkGraph[originNode].push( { destinationNode: destinationNode, edgeCapacity: edgeCapacity, reverseLinkIdx: networkGraph[destinationNode].length } );
  // Add the reverse edge (with zero initial capacity) to the adjacency list of the destination node.
  networkGraph[destinationNode].push( { destinationNode: originNode, edgeCapacity: 0, reverseLinkIdx: networkGraph[originNode].length - 1 } );
}


/* An array to keep track of visited nodes during a Depth-First Search traversal. */
var visitedStatus;


/* Performs a Depth-First Search to find an augmenting path from currentVertex to targetVertex
   with a maximum possible flowAmount. */
function explorePathForFlow( currentVertex, targetVertex, flowAmount )
{
  // If the target vertex is reached, return the current flow amount.
  if ( currentVertex === targetVertex )
    return flowAmount;

  // Mark the current vertex as visited to prevent cycles in this DFS pass.
  visitedStatus[currentVertex] = true;

  /* Iterate through all outgoing edges from the current vertex. */
  for ( var currentLinkIndex = 0; currentLinkIndex < networkGraph[currentVertex].length; ++currentLinkIndex )
  {
    var currentLink = networkGraph[currentVertex][currentLinkIndex];

    // Check if the destination of the edge has not been visited and has available capacity.
    if ( !visitedStatus[currentLink.destinationNode] && currentLink.edgeCapacity > 0 )
    {
      // Recursively call DFS for the next vertex, limiting flow by current edge capacity.
      var foundFlow = explorePathForFlow( currentLink.destinationNode, targetVertex, Math.min( flowAmount, currentLink.edgeCapacity ) );

      // If an augmenting path was found downstream.
      if ( foundFlow > 0 )
      {
        // Reduce capacity of the forward edge.
        currentLink.edgeCapacity -= foundFlow;
        // Increase capacity of the reverse edge (in the residual graph).
        networkGraph[currentLink.destinationNode][currentLink.reverseLinkIdx].edgeCapacity += foundFlow;

        // Return the flow found along this path.
        return foundFlow;
      }
    }
  }

  // If no augmenting path could be found from this vertex, return 0.
  return 0;
}


/* Computes the maximum possible flow from a given sourceVertex to a targetVertex
   using the Edmonds-Karp algorithm (iterative DFS). */
function computeMaximumThroughput( sourceVertex, targetVertex )
{
  var totalFlow = 0; // Initialize total flow to zero.

  // Continuously find augmenting paths until no more can be found.
  while ( true )
  {
    // Reset the visited status for all nodes before each new DFS search.
    visitedStatus = new Array( nodeCount ).fill( false );

    /* Perform DFS to find an augmenting path from source to target.
       Start with theoretically infinite flow capacity. */
    var foundFlow = explorePathForFlow( sourceVertex, targetVertex, Number.POSITIVE_INFINITY );

    // Add the flow found in this iteration to the total flow.
    totalFlow += foundFlow;

    // If no flow was found in this DFS, it means the max flow has been reached.
    if ( foundFlow === 0 )
      break;
  }

  // Return the accumulated maximum flow.
  return totalFlow;
}