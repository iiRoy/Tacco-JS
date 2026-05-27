var graphConnections = [];
var numVertices, numEdges;

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on( 'data', function( inputBuffer )
{
  var inputDataLines = inputBuffer.split('\n');

  for( var lineIterator = 0; lineIterator < inputDataLines.length - 1; ++lineIterator )
  {
    if( lineIterator === 0 )
    {
      var vertexEdgeData = inputDataLines[lineIterator].split(' ').map(Number);
      numVertices = vertexEdgeData[0];
      numEdges = vertexEdgeData[1];

      for( var vertexIterator = 0; vertexIterator < numVertices; ++vertexIterator )
      {
        graphConnections[vertexIterator] = [];
      }
    }
    else
    {
      var edgeSpecification = inputDataLines[lineIterator].split(' ').map(Number);
      establishEdge( edgeSpecification[0], edgeSpecification[1], edgeSpecification[2] );
    }
  }

  console.log( computeMaxNetworkFlow( 0, numVertices - 1 ) );
});

function establishEdge( originNode, terminalNode, edgeCapacity )
{
  graphConnections[originNode].push( { destinationNode: terminalNode, capacityValue: edgeCapacity, reverseEdgeIdx: graphConnections[terminalNode].length } );
  graphConnections[terminalNode].push( { destinationNode: originNode, capacityValue: 0, reverseEdgeIdx: graphConnections[originNode].length - 1 } );
}

var visitedNodes;

function explorePathForFlow( currentNodeIdentifier, flowSinkIdentifier, currentPathFlow )
{
  if( currentNodeIdentifier === flowSinkIdentifier )
  {
    return currentPathFlow;
  }

  visitedNodes[currentNodeIdentifier] = true;

  for( var edgeIndex = 0; edgeIndex < graphConnections[currentNodeIdentifier].length; ++edgeIndex )
  {
    var currentGraphEdge = graphConnections[currentNodeIdentifier][edgeIndex];
    if( !visitedNodes[currentGraphEdge.destinationNode] && currentGraphEdge.capacityValue > 0 )
    {
      var foundFlowAmount = explorePathForFlow( currentGraphEdge.destinationNode, flowSinkIdentifier, Math.min( currentPathFlow, currentGraphEdge.capacityValue ) );

      if( foundFlowAmount > 0 )
      {
        currentGraphEdge.capacityValue -= foundFlowAmount;
        graphConnections[currentGraphEdge.destinationNode][currentGraphEdge.reverseEdgeIdx].capacityValue += foundFlowAmount;

        return foundFlowAmount;
      }
    }
  }

  return 0;
}

function computeMaxNetworkFlow( flowSourceIdentifier, flowSinkIdentifier )
{
  var totalNetworkFlow = 0;

  while( true )
  {
    visitedNodes = new Array(numVertices).fill(false);

    var incrementalFlow = explorePathForFlow( flowSourceIdentifier, flowSinkIdentifier, Number.POSITIVE_INFINITY );

    totalNetworkFlow += incrementalFlow;

    if( incrementalFlow === 0 )
      break;
  }

  return totalNetworkFlow;
}
