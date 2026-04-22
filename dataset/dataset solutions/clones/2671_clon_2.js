var DATA_PARSER = ( function ( ) {
  // Inner factory function to create an InputReader instance
  function createReader ( inputSource ) {
    return new InputReader ( inputSource ) ;
  }

  // Constructor for the InputReader class
  function InputReader ( sourceText ) {
    this.lines = sourceText . trim ( ) . split ( '\n' ) ; // Store all lines of input
    this.currentLineIndex = 0 ; // Keep track of the current line being processed
  }

  // Method to read a single value (number or string) from the current line
  // If the line is exhausted, it moves to the next.
  InputReader . prototype . readInteger = function ( returnAsString ) {
    var lineData = this . lines ,
        idx = this . currentLineIndex ,
        parsedValue ;

    if ( typeof lineData [ idx ] === 'string' ) {
      // Split the line into tokens and reverse for easy popping
      lineData [ idx ] = lineData [ idx ] . split ( ' ' ) . reverse ( ) ;
    }

    // Pop the last token (which was the first in original order)
    parsedValue = lineData [ idx ] . pop ( ) ;

    // If the current line is now empty, advance to the next line
    if ( ! lineData [ idx ] . length ) {
      this . currentLineIndex ++ ;
    }

    // Return as string or convert to number
    return returnAsString ? parsedValue : + parsedValue ;
  } ;

  // Method to read an entire line as a list of values
  InputReader . prototype . readList = function ( asStrings ) {
    // Get the current line, increment index, then split by space
    var tokens = this . lines [ this . currentLineIndex ++ ] . split ( ' ' ) ;

    // Return raw strings or map to numbers
    return asStrings ? tokens : tokens . map ( item => + item ) ;
  } ;

  // Method to read multiple lines as a matrix
  InputReader . prototype . readMatrix = function ( numRows , asStringMatrix ) {
    // Extract the specified number of rows and split each into tokens
    var resultMatrix = this . lines . slice ( this . currentLineIndex , this . currentLineIndex += numRows ) . map ( rowStr => rowStr . split ( ' ' ) ) ;

    // Return matrix of strings or matrix of numbers
    return asStringMatrix ? resultMatrix : resultMatrix . map ( row => row . map ( val => + val ) ) ;
  } ;

  // Method to read multiple lines, either as raw strings or converted to numbers
  InputReader . prototype . readLines = function ( count , keepRaw ) {
    // Slice the array of lines to get the requested count
    var extractedLines = this . lines . slice ( this . currentLineIndex , this . currentLineIndex += count ) ;

    // Return raw lines or lines converted to numbers
    return keepRaw ? extractedLines : extractedLines . map ( lineVal => + lineVal ) ;
  } ;

  return createReader ;
} ) ( ) ;

// Initialize the input stream by reading from standard input
var inputStream = DATA_PARSER ( require ( 'node:fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;

// Function to create a multi-dimensional array dynamically
function multiDimArray ( baseValue ) {
  var args = arguments , // All arguments passed to the function
      len = args . length , // Total number of arguments
      arrayCreationCode = "Array(args[" + -- len + "]).fill(null).map(e => { return " + baseValue + "; })" ; // Innermost array definition

  // Loop to build up the nested array creation code
  while ( -- len ) {
    arrayCreationCode = "Array(args[" + len + "]).fill(null).map(e => " + arrayCreationCode + ")" ;
  }

  // Evaluate the generated string to create the array
  return eval ( arrayCreationCode ) ;
}

// Self-executing function to encapsulate the shortest path algorithm
var shortestPathAlgorithm = ( function ( ) {
  // Define a constant for positive infinity, used for unreachable nodes
  const POS_INFINITY = 1e9 ;

  // Factory function to create a new PathFinder instance
  function initializePathFinder ( edgeGraph , initialNode ) {
    return new PathFinder ( edgeGraph , initialNode ) ;
  }

  // Constructor for the PathFinder class (implements Bellman-Ford)
  function PathFinder ( edgeGraph , initialNode ) {
    // Get the number of nodes and a value for iteration limits
    let numNodes = edgeGraph . length ,
        twiceNumNodes = numNodes * 2 ;

    // Initialize all distances to infinity, except for the starting node
    let distances = this . nodeDistances = Array ( numNodes ) . fill ( POS_INFINITY ) ;
    distances [ initialNode ] = 0 ;

    // Perform relaxations for a sufficient number of iterations
    // numNodes * 2 iterations ensure detection of negative cycles (n-1 for shortest paths, an extra n for negative cycles)
    for ( let iterationCount = 0 ; iterationCount < twiceNumNodes ; ++ iterationCount ) {
      // Iterate through each vertex in the graph
      for ( let vertexIdx = 0 ; vertexIdx < numNodes ; ++ vertexIdx ) {
        // If the current vertex is unreachable, skip it
        if ( distances [ vertexIdx ] === POS_INFINITY ) continue ;

        // Iterate through all outgoing edges from the current vertex
        for ( let edgeIdx = 0 ; edgeIdx < edgeGraph [ vertexIdx ] . length ; ++ edgeIdx ) {
          const currentEdge = edgeGraph [ vertexIdx ] [ edgeIdx ] ;

          // If a shorter path to the destination node is found
          if ( distances [ currentEdge . destination ] > distances [ vertexIdx ] + currentEdge . weight ) {
            // If we are in the Nth or later iteration, it implies a negative cycle
            if ( iterationCount >= numNodes - 1 ) {
              distances [ currentEdge . destination ] = - POS_INFINITY ; // Mark as negatively infinite
            } else {
              distances [ currentEdge . destination ] = distances [ vertexIdx ] + currentEdge . weight ; // Update path
            }
          }
        }
      }
    }
  }

  // Prototype method to retrieve the calculated distance to a specific node
  PathFinder . prototype . getDistance = function ( targetIndex ) {
    return this . nodeDistances [ targetIndex ] ;
  } ;

  return initializePathFinder ;
} ) ( ) ;

// Output the result of the main calculation function
console . log ( calculateMaxProfit ( ) ) ;

// Main function to solve the problem
function calculateMaxProfit ( ) {
  // Read problem parameters: number of nodes, number of edges, and fixed profit
  const nodeCount = inputStream . readInteger ( ) ;
  const edgeCount = inputStream . readInteger ( ) ;
  const fixedProfit = inputStream . readInteger ( ) ;

  // Initialize an adjacency list for the graph, where each node has an empty array of edges
  const networkEdges = multiDimArray ( "[]" , nodeCount ) ;

  // Populate the graph with edges based on input
  for ( let edgeIndex = 0 ; edgeIndex < edgeCount ; ++ edgeIndex ) {
    // Read edge data: start node, end node, and original cost
    const edgeData = inputStream . readList ( ) ,
          startNode = edgeData [ 0 ] - 1 , // Adjust to 0-indexed
          endNode = edgeData [ 1 ] - 1 ,   // Adjust to 0-indexed
          costValue = edgeData [ 2 ] ;

    // Add the edge to the graph. The "cost" is transformed to (fixedProfit - originalCost)
    // This transforms the max profit path problem into a shortest path problem
    networkEdges [ startNode ] . push ( { destination : endNode , weight : fixedProfit - costValue } ) ;
  }

  // Run the Bellman-Ford algorithm starting from node 0
  const pathResult = shortestPathAlgorithm ( networkEdges , 0 ) ;

  // Check the distance to the last node (nodeCount - 1)
  // If it's -POS_INFINITY, it means a negative cycle is reachable, allowing infinite profit
  if ( pathResult . getDistance ( nodeCount - 1 ) === - POS_INFINITY ) return -1 ;

  // If the shortest path (which represents maximum profit) is non-negative,
  // it means we can't make a positive profit, so return 0.
  if ( pathResult . getDistance ( nodeCount - 1 ) >= 0 ) return 0 ;

  // Otherwise, return the positive value of the maximum profit
  // (since the algorithm finds minimum cost, we negate it to get maximum profit)
  return - pathResult . getDistance ( nodeCount - 1 ) ;
}