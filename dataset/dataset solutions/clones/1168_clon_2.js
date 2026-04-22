var adjacencyList = [];
var nodeCount;
var edgeCount;

process.stdin.resume();
process.stdin.setEncoding( 'utf8' );

process.stdin.on(
  'data',
  function( incomingData )
  {
    var inputLines = incomingData.split( '\n' );

    for ( let lineIndex = 0; lineIndex < inputLines.length; ++lineIndex ) {
      if ( lineIndex === 0 ) {
        var nodeEdgeCounts = inputLines[lineIndex].split( ' ' ).map( Number );
        nodeCount = nodeEdgeCounts[0];
        edgeCount = nodeEdgeCounts[1];

        for ( let vertexIterator = 0; vertexIterator < nodeCount; ++vertexIterator ) {
          adjacencyList[vertexIterator] = [];
        }
      }
      else
      {
        var edgeDetails = inputLines[lineIndex].split( ' ' ).map( Number );
        createConnection( edgeDetails[0], edgeDetails[1], edgeDetails[2] );
      }
    }

    console.log( computeMaxFlow( 0, nodeCount - 1 ) );
  }
);


function createConnection( sourceNode, targetNode, capacityValue )
{
  adjacencyList[sourceNode].push( { dest: targetNode, currentCap: capacityValue, reverseIdx: adjacencyList[targetNode].length } );
  adjacencyList[targetNode].push( { dest: sourceNode, currentCap: 0, reverseIdx: adjacencyList[sourceNode].length - 1 } );
}

var visitedNodes;

function depthFirstSearch( currentNode, sinkNode, pathCapacity )
{
  if ( currentNode === sinkNode ) return pathCapacity;

  visitedNodes[currentNode] = true;

  for ( let connectionIndex = 0; connectionIndex < adjacencyList[currentNode].length; ++connectionIndex )
  {
    var currentEdge = adjacencyList[currentNode][connectionIndex];

    if ( !visitedNodes[currentEdge.dest] && currentEdge.currentCap > 0 )
    {
      var foundFlow = depthFirstSearch( currentEdge.dest, sinkNode, Math.min( pathCapacity, currentEdge.currentCap ) );

      if ( foundFlow > 0 )
      {
        currentEdge.currentCap -= foundFlow;
        adjacencyList[currentEdge.dest][currentEdge.reverseIdx].currentCap += foundFlow;

        return foundFlow;
      }
    }
  }

  return 0;
}

function computeMaxFlow( originNode, sinkNode )
{
  var totalFlow = 0;

  while ( true )
  {
    visitedNodes = new Array( nodeCount ).fill( false );

    var iterationFlow = depthFirstSearch( originNode, sinkNode, Number.POSITIVE_INFINITY );

    totalFlow += iterationFlow;

    if ( iterationFlow === 0 ) break;
  }

  return totalFlow;
}