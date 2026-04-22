function ProcessInput ( rawData ) {
  // Normalize input string: trim whitespace, split into lines, then split each line by space
  let parsedLines = rawData . trim ( ) . split ( "\n" ) . map ( function ( lineStr ) { return lineStr . split ( " " ) ; } ) ;

  // Extract dimensions from the first line of the parsed input
  const heightVal = parseInt ( parsedLines [ 0 ] [ 0 ] , 10 ) ;
  const widthVal = parseInt ( parsedLines [ 0 ] [ 1 ] , 10 ) ;

  // Define the maximum number of vertices/levels for the graph data
  const maxVertexCount = 10 ; // This constant represents 'lVl' from the original code

  // Initialize the adjacency matrix for graph weights
  let adjacencyMatrix = [ ] ;
  // Populate the initial graph weights from the input
  for ( let rowIdx = 0 ; rowIdx < maxVertexCount ; rowIdx ++ ) {
    adjacencyMatrix . push ( parsedLines [ rowIdx + 1 ] . map ( elementStr => parseInt ( elementStr , 10 ) ) ) ;
  }

  // Initialize an array to count occurrences of specific values
  let occurrenceCounts = Array . from ( { length : maxVertexCount } , ( ) => 0 ) ;
  let currentLineNums ; // Temporary variable to hold numbers from a line

  // Process subsequent lines of input to count value occurrences
  for ( let dataRowIndex = 0 ; dataRowIndex < heightVal ; dataRowIndex ++ ) {
    currentLineNums = parsedLines [ dataRowIndex + 1 + maxVertexCount ] . map ( numStr => parseInt ( numStr , 10 ) ) ;
    for ( let currentNum of currentLineNums ) {
      if ( currentNum === -1 ) {
        continue ; // Skip placeholder values
      }
      occurrenceCounts [ currentNum ] ++ ; // Increment count for the observed number
    }
  }

  // This section implements the Floyd-Warshall algorithm
  // to find all-pairs shortest paths in the adjacency matrix.
  // It calculates the minimum cost to travel between any two nodes.
  for ( let intermediateNode = 0 ; intermediateNode < maxVertexCount ; intermediateNode ++ ) {
    for ( let startNode = 0 ; startNode < maxVertexCount ; startNode ++ ) {
      for ( let endNode = 0 ; endNode < maxVertexCount ; endNode ++ ) {
        // Update the shortest path if a path through 'intermediateNode' is shorter
        adjacencyMatrix [ startNode ] [ endNode ] = Math . min ( adjacencyMatrix [ startNode ] [ endNode ] , adjacencyMatrix [ startNode ] [ intermediateNode ] + adjacencyMatrix [ intermediateNode ] [ endNode ] ) ;
      }
    }
  }
  // End of core pathfinding logic

  let totalCost = 0 ; // Variable to accumulate the final result

  // Calculate the total cost based on shortest paths and value occurrences
  // For each value, multiply its occurrence count by the shortest path cost to node 1
  for ( let valueIndex = 0 ; valueIndex < maxVertexCount ; valueIndex ++ ) {
    totalCost += adjacencyMatrix [ valueIndex ] [ 1 ] * occurrenceCounts [ valueIndex ] ;
  }

  // Output the final computed cost to the console
  console . log ( totalCost ) ;
}


ProcessInput ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;