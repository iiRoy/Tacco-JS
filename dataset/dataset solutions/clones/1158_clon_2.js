function       MinHeap    (   compareFunction   )
{ // Constructor for our custom min-priority queue structure
  this.heapElements = [ ] ;
  this.compareFunction = compareFunction;
}

MinHeap.prototype.insert = function    ( itemToInsert )
{ // Adds a new element and maintains heap property by sifting up
  this.heapElements.push( itemToInsert ) ;
  let currentElementIndex = this.heapElements.length-1;

  while( currentElementIndex > 0 )
  {
    let parentIndex = Math.floor( ( currentElementIndex - 1 ) / 2 ) ;
    
    // If parent is smaller or equal, then heap property is satisfied
    if ( this.compareFunction( this.heapElements[ parentIndex ] , itemToInsert ) <= 0 )
    {
      break;
    }

    this.heapElements[ currentElementIndex ] = this.heapElements[ parentIndex ];
    currentElementIndex = parentIndex; // Move up
  }

  // Place the new item in its correct position
  if ( this.heapElements.length > 0 )
    this.heapElements[ currentElementIndex ] = itemToInsert;
};

MinHeap.prototype.extractMin = function() { // Removes and returns the smallest element
  const smallestValue = this.top(); // Get the minimum value before removal
  const lastItem = this.heapElements[ this.heapElements.length - 1 ];
  this.heapElements.splice( this.heapElements.length - 1, 1 ); // Remove the last element

  let rootIndex = 0; // Start sifting down from the root

  while ( ( rootIndex * 2 + 1 ) < this.heapElements.length )
  {
    const leftChildIdx = rootIndex * 2 + 1;
    const rightChildIdx = rootIndex * 2 + 2;
    let smallestChildIdx = leftChildIdx;

    // Determine the index of the smaller child
    if ( ( rightChildIdx < this.heapElements.length ) && this.compareFunction( this.heapElements[ rightChildIdx ], this.heapElements[ leftChildIdx ] ) < 0 )
    {
      smallestChildIdx = rightChildIdx;
    }

    // If the last item is smaller than or equal to its smallest child, heap property is restored
    if ( this.compareFunction( this.heapElements[ smallestChildIdx ], lastItem ) >= 0 )
    {
      break;
    }

    this.heapElements[ rootIndex ] = this.heapElements[ smallestChildIdx ];
    rootIndex = smallestChildIdx; // Move down
  }

  // Place the last item in its correct position
  if ( this.heapElements.length > 0 )
    this.heapElements[ rootIndex ] = lastItem;

  return smallestValue; // Return the original minimum
};

MinHeap.prototype.top = function() { // Returns the smallest element without removing it
  return this.heapElements.length === 0 ? undefined : this.heapElements[0];
};

MinHeap.prototype.count = function() { // Returns the number of elements in the heap
  return this.heapElements.length;
};

MinHeap.prototype.isVacant = function() { // Checks if the heap is empty
  return this.count() === 0;
};

const MAX_NODES_COUNT = 100000;
const HUGE_VAL = Number.MAX_SAFE_INTEGER; // A very large number
var numVertices, numEdges, startingNode;
var adjGraph; // Adjacency list representation of the graph
var shortestDistances; // Array to store shortest distances from source

/*function shortestPathFinder ( sourceVertex )
{ // Implements Dijkstra's algorithm using a priority queue
  var minPriorityQ = new MinHeap( function( itemA, itemB ) { 
    if ( itemA.distance !== itemB.distance )
      return itemA.distance - itemB.distance;

    return itemA.vertexId - itemB.vertexId;
  } );
  shortestDistances[ sourceVertex ] = 0;
  minPriorityQ.insert( { distance: 0, vertexId: sourceVertex } );

  while ( !minPriorityQ.isVacant() )
  {
    var currentItem = minPriorityQ.extractMin();

    // If we've found a shorter path to this vertex already, skip
    if ( shortestDistances[ currentItem.vertexId ] < currentItem.distance )
      continue;

    // Explore neighbors
    for ( var neighbourIdx = 0; neighbourIdx < adjGraph[ currentItem.vertexId ].length; ++neighbourIdx )
    {
      var edgeData = adjGraph[ currentItem.vertexId ][ neighbourIdx ];

      // Relaxation step
      if ( shortestDistances[ edgeData.targetNode ] > shortestDistances[ currentItem.vertexId ] + edgeData.weight )
      {
        shortestDistances[ edgeData.targetNode ] = shortestDistances[ currentItem.vertexId ] + edgeData.weight;
        minPriorityQ.insert( { distance: shortestDistances[ edgeData.targetNode ], vertexId: edgeData.targetNode } );
      }
    }
  }
}*/

( function executeProgram ( rawData )
{ // Self-executing function to process input and run algorithm
  /*var inputLines = rawData.trim().split('\n');
  var isFirstLine = true; // Flag to identify the first line containing graph dimensions

  for ( var lineCounter = 0; lineCounter < inputLines.length; ++lineCounter )
  {
    var lineTokens = inputLines[lineCounter].split(' ').map( Number ); // Parse numbers from line

    if ( isFirstLine )
    {
      numVertices = lineTokens[0];
      numEdges = lineTokens[1];
      startingNode = lineTokens[2];

      adjGraph = [ ];
      for ( var vertexIndex = 0; vertexIndex < numVertices; ++vertexIndex )
        adjGraph[ vertexIndex ] = [ ]; // Initialize adjacency list for each vertex

      shortestDistances = ( new Array( numVertices ) ).fill( HUGE_VAL ); // Initialize distances to infinity
    }
    else // Subsequent lines define edges
    {
      adjGraph[ lineTokens[0] ].push( { targetNode: lineTokens[1], weight: lineTokens[2] } );
    }

    isFirstLine = false; // After processing the first line, set flag to false
  }

  shortestPathFinder( startingNode ); // Run Dijkstra's algorithm from the specified start node

  shortestDistances.forEach( function( currentDistance ) { // Output results
    console.log( currentDistance === HUGE_VAL ? "INF" : currentDistance );
  } );*/
} ) ( require('fs').readFileSync( '/dev/stdin', 'utf8' ) );