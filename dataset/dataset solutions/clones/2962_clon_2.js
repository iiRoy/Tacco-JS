'use strict'; // Enforce strict mode for robust code execution

// Anonymous self-executing function to encapsulate the entire program logic
(function ( sourceData ) {
  // Prepare the raw input: remove leading/trailing whitespace and split into individual lines
  sourceData = sourceData.trim().split( /\n/ );

  // Extract the total number of graph vertices from the first line of input
  // The 'shift()' method removes the first element from the array and returns it
  let vertexCount = parseInt( sourceData.shift(), 10 ); // Use parseInt for explicit integer conversion

  // Process the remaining lines of input:
  // Each line is split by whitespace, and its parts are converted to numbers
  sourceData = sourceData.map(function( lineText ) {
    return lineText.split( /\s+/ ).map(function( numVal ) {
      return parseInt( numVal, 10 ); // Convert each string part into an integer
    });
  });

  /**
   * Constructor function for a GraphVertex object.
   * Represents a single node within the graph structure.
   * @param {number} idValue - A unique numerical identifier for this vertex.
   */
  function GraphVertex( idValue ) {
    const selfRef = this; // Maintain a consistent reference to the current object instance
    selfRef.adjacencyList = []; // Array to store all connections (edges) from this vertex
    selfRef.partitionLabel = -1; // Initial partition label; -1 indicates unvisited/unassigned
  }

  // Create an array to store all GraphVertex objects, indexed from 1 up to vertexCount
  let cellCollection = new Array( vertexCount + 1 );

  // Initialize each entry in the collection with a new GraphVertex instance
  for ( let currentIdx = 1; currentIdx <= vertexCount; currentIdx++ ) {
    cellCollection[ currentIdx ] = new GraphVertex( currentIdx );
  }

  // Iterate over the processed input data to build the graph's adjacency lists
  sourceData.forEach(function( edgeData ) {
    // Each 'edgeData' array contains [source_id, destination_id, connection_type]
    // Add the destination ID and the parity (0 or 1) of the connection type to the source vertex's list
    cellCollection[ edgeData[ 0 ] ].adjacencyList.push( [ edgeData[ 1 ], edgeData[ 2 ] % 2 ] );
  });

  // Initialize a stack for depth-first traversal of the graph
  let processingStack = [ 1 ]; // Begin the traversal from vertex with ID 1

  // Assign the initial partition label to the starting vertex
  cellCollection[ 1 ].partitionLabel = 0;

  // Main loop for graph traversal and partition labeling
  while ( processingStack.length > 0 ) {
    // Get the index of the vertex currently at the top of the stack (without removing it)
    let topElementIndex = processingStack[ processingStack.length - 1 ];
    // Retrieve the actual GraphVertex object from the collection
    let currentVertex = cellCollection[ topElementIndex ];

    // Check if the current vertex has any unvisited connections remaining
    if ( currentVertex.adjacencyList.length === 0 ) {
      processingStack.pop(); // If no connections, this vertex is fully processed; remove from stack
    } else {
      // Get the details of the most recently added connection
      let connectionDetail = currentVertex.adjacencyList[ currentVertex.adjacencyList.length - 1 ];
      // Get the neighboring vertex object referenced by this connection
      let neighborVertex = cellCollection[ connectionDetail[ 0 ] ];

      // If the neighbor vertex has not yet been assigned a partition label (-1 indicates unassigned)
      if ( neighborVertex.partitionLabel === -1 ) {
        // Assign a partition label to the neighbor using an XOR operation
        // This ensures proper alternating labels based on connection type
        neighborVertex.partitionLabel = ( currentVertex.partitionLabel ^ connectionDetail[ 1 ] );
        // Push the neighbor's index onto the stack to visit it next
        processingStack.push( connectionDetail[ 0 ] );
      } else {
        // If the neighbor has already been visited, this connection is redundant for labeling
        // Remove this connection from the current vertex's adjacency list
        currentVertex.adjacencyList.pop();
      }
    }
  }

  // Collect the final assigned partition labels for all vertices into an output array
  let outputCollection = [];
  for ( let resultIterator = 1; resultIterator <= vertexCount; resultIterator++ ) {
    outputCollection.push( cellCollection[ resultIterator ].partitionLabel );
  }

  // Output the collected partition labels, each on a new line
  console.log( outputCollection.join( '\n' ) );

// Invoke the anonymous function, passing the content of '/dev/stdin' as input
}( require('fs').readFileSync('/dev/stdin', 'utf8') ) );