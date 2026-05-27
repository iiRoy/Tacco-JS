var graphAdjList = [];
var numVertices, numEdges;

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on( 'data', function( inputData )
{
  var inputLines = inputData.split('\n');

  // Structural edit: Process first line separately using shift()
  var firstLineContent = inputLines.shift();
  var vertexEdgeCounts = firstLineContent.split(' ').map(Number);
  numVertices = vertexEdgeCounts[0];
  numEdges = vertexEdgeCounts[1];

  // Initialize graphAdjList for all vertices
  for( var vertexIdx = 0; vertexIdx < numVertices; ++vertexIdx )
    graphAdjList[vertexIdx] = [];

  // Process remaining lines for edges
  for( var lineIdx = 0; lineIdx < inputLines.length; ++lineIdx )
  {
    var edgeDetails = inputLines[lineIdx].split(' ').map(Number);
    addFlowEdge( edgeDetails[0], edgeDetails[1], edgeDetails[2] );
  }

  console.log( calculateMaxFlow( 0, numVertices - 1 ) );
});

function addFlowEdge( sourceNode, targetNode, capacity )
{
  // Structural edit: Create explicit edge objects with named properties
  var forwardEdge = { target: targetNode, capacity: capacity, reverseIdx: graphAdjList[targetNode].length };
  var backwardEdge = { target: sourceNode, capacity: 0, reverseIdx: graphAdjList[sourceNode].length };

  graphAdjList[sourceNode].push( forwardEdge );
  graphAdjList[targetNode].push( backwardEdge );
}

var visitedNodes;

function findAugmentingPath( currentNode, sinkNode, flowAmount )
{
  if( currentNode === sinkNode )
    return flowAmount;

  visitedNodes[currentNode] = true;

  // Structural edit: Use a helper variable for loop limit
  var currentEdgesCount = graphAdjList[currentNode].length;
  for( var edgeIdx = 0; edgeIdx < currentEdgesCount; ++edgeIdx )
  {
    var currentEdge = graphAdjList[currentNode][edgeIdx];

    // Structural edit: Guard clause for invalid edges
    if( visitedNodes[currentEdge.target] || currentEdge.capacity <= 0 ) {
      continue;
    }

    // Structural edit: Explicitly define potentialFlow for clarity
    var potentialFlow = Math.min( flowAmount, currentEdge.capacity );
    var resultantFlow = findAugmentingPath( currentEdge.target, sinkNode, potentialFlow );

    if( resultantFlow > 0 )
    {
      currentEdge.capacity -= resultantFlow;
      // Structural edit: Use a temporary variable for the reverse edge reference
      var reverseEdge = graphAdjList[currentEdge.target][currentEdge.reverseIdx];
      reverseEdge.capacity += resultantFlow;

      return resultantFlow;
    }
  }

  return 0;
}

function calculateMaxFlow( sourceNodeStart, sinkNodeEnd )
{
  var totalFlow = 0;
  // Structural edit: Use a named constant for Number.POSITIVE_INFINITY
  const MAX_CAPACITY_VALUE = Number.POSITIVE_INFINITY;

  while( true )
  {
    // Structural edit: Initialize visitedNodes array more explicitly
    visitedNodes = new Array(numVertices).fill(false);

    var currentAugmentingFlow = findAugmentingPath( sourceNodeStart, sinkNodeEnd, MAX_CAPACITY_VALUE );

    totalFlow += currentAugmentingFlow;

    if( currentAugmentingFlow === 0 )
      break;
  }

  return totalFlow;
}
