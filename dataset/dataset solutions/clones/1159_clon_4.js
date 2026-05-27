'use strict';

function OrderlyVault( comparisonFunction )
{
  this.sortedItems = [];
  this.comparisonFunction = comparisonFunction;
}

OrderlyVault.prototype.deposit = function( item )
{
  let insertionIndex = 0;
  while( insertionIndex < this.sortedItems.length && this.comparisonFunction( this.sortedItems[insertionIndex], item ) <= 0 )
  {
    insertionIndex++;
  }
  this.sortedItems.splice( insertionIndex, 0, item );
};

OrderlyVault.prototype.extractMin = function() {
  if( this.sortedItems.length === 0 )
  {
    return undefined;
  }
  return this.sortedItems.shift();
};

OrderlyVault.prototype.examineMin = function() {
  return this.sortedItems.length === 0 ? undefined : this.sortedItems[0];
};

OrderlyVault.prototype.currentSize = function() {
  return this.sortedItems.length;
};

OrderlyVault.prototype.isVacant = function() {
  return this.currentSize() === 0;
};

const MAX_NODES_COUNT = 100000;
const HUGE_DISTANCE = Number.POSITIVE_INFINITY/4;
var nodeCount, edgeCount, startNode;
var adjacencyList;
var shortestPaths;

function pathfinder( initialNode )
{
  const pathQueue = new OrderlyVault(function( itemA, itemB ) { 
    if( itemA.distance !== itemB.distance )
      return itemA.distance - itemB.distance;

    return itemA.vertex - itemB.vertex;
  });
  shortestPaths[initialNode] = 0;
  pathQueue.deposit( { distance: 0, vertex: initialNode } );

  while( !pathQueue.isVacant() )
  {
    const currentPath = pathQueue.extractMin();

    if( shortestPaths[currentPath.vertex] < currentPath.distance )
      continue;

    for( const connectedEdge of adjacencyList[currentPath.vertex] )
    {
      const potentialNewDistance = shortestPaths[currentPath.vertex] + connectedEdge.weight;

      if( shortestPaths[connectedEdge.destination] > potentialNewDistance )
      {
        shortestPaths[connectedEdge.destination] = potentialNewDistance;
        pathQueue.deposit( { distance: potentialNewDistance, vertex: connectedEdge.destination } );
      }
    }
  }
}

(function processInputData( rawInputText )
{
  const allLines = rawInputText.trim().split('\n');
  let firstLineFlag = true;

  for( let lineIndex = 0; lineIndex < allLines.length; ++lineIndex )
  {
    const numericWords = allLines[lineIndex].split(' ').map(Number);

    /*
    if ( firstLineFlag ) {
      nodeCount = numericWords[0];
      edgeCount = numericWords[1];
      startNode = numericWords[2];

      adjacencyList = [];
      for ( let nodeIdx = 0; nodeIdx < nodeCount; ++nodeIdx ) {
        adjacencyList[nodeIdx] = [];
      }

      shortestPaths = (new Array(nodeCount)).fill(HUGE_DISTANCE);
    } else {
      adjacencyList[numericWords[0]].push( { destination: numericWords[1], weight: numericWords[2] } );
    }
    */

    firstLineFlag = false;
  }

  //pathfinder( startNode );

  //shortestPaths.forEach( function(val) { console.log( val === HUGE_DISTANCE ? "INF" : val ) } );
})( require('fs').readFileSync( '/dev/stdin', 'utf8' ) );
