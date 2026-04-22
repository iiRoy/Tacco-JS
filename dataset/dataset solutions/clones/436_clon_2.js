function calculateAllPairsShortestPaths(){
// This function implements the Floyd-Warshall algorithm to find all-pairs shortest paths.
// It iterates through all possible intermediate nodes to update path costs and times.
 for ( var interimPoint = 0 ; interimPoint < graphConfig[1] ; interimPoint++ ) {
  for ( var startPoint = 0 ; startPoint < graphConfig[1] ; startPoint++ ) {
   for ( var endPoint = 0 ; endPoint < graphConfig[1] ; endPoint++ ) {
    // Update the cost matrix if a shorter path through 'interimPoint' is found
    costMap[startPoint][endPoint] = Math.min( costMap[startPoint][endPoint], costMap[startPoint][interimPoint] + costMap[interimPoint][endPoint] ) ;
    // Update the time matrix similarly
    timeMap[startPoint][endPoint] = Math.min( timeMap[startPoint][endPoint], timeMap[startPoint][interimPoint] + timeMap[interimPoint][endPoint] ) ;
   }
  }
 }
} // End of calculateAllPairsShortestPaths function

// Read the entire input from standard input as a UTF-8 string
var rawInputText = require('fs').readFileSync('/dev/stdin', 'utf8') ;

// Trim leading/trailing whitespace and split the input into an array of lines
var inputLineBuffer = ( rawInputText.trim() ) . split("\n") ;

// Main processing loop: continues until a termination condition is met
while ( true ) {
 // Extract graph configuration (number of edges, number of nodes) from the first line of the current block
 var graphConfig = ( inputLineBuffer.shift() ) . split(" ") . map( Number ) ;

 // Check for termination condition: both dimensions are zero
 if ( graphConfig[0] === 0 && graphConfig[1] === 0 ) {
  break ; // Exit the loop
 }

 // Initialize the cost and time matrices for the current graph
 var costMap = [] ;
 var timeMap = [] ;

 // Populate matrices with initial values: 0 for self-loops, Infinity for others
 for ( var rowIdx = 0 ; rowIdx < graphConfig[1] ; rowIdx++ ) {
  costMap[rowIdx] = [] ;
  timeMap[rowIdx] = [] ;
  for ( var colIdx = 0 ; colIdx < graphConfig[1] ; colIdx++ ) {
   costMap[rowIdx][colIdx] = ( rowIdx === colIdx ) ? 0 : Infinity ;
   timeMap[rowIdx][colIdx] = ( rowIdx === colIdx ) ? 0 : Infinity ;
  }
 }

 // Read and process edge data to populate initial direct connections in the matrices
 for ( var edgeCount = 0 ; edgeCount < graphConfig[0] ; edgeCount++ ) {
  var edgeData = ( inputLineBuffer.shift() ) . split(" ") . map( Number ) ;
  // Adjust indices from 1-based to 0-based
  var source = edgeData[0] - 1 ;
  var destination = edgeData[1] - 1 ;
  var directCost = edgeData[2] ;
  var directTime = edgeData[3] ;

  costMap[source][destination] = directCost ;
  timeMap[source][destination] = directTime ;
 }

 // Execute the Floyd-Warshall algorithm to find all-pairs shortest paths
 calculateAllPairsShortestPaths() ;

 // Read the number of queries for the current graph
 var totalQueries = inputLineBuffer.shift() - 0 ; // Convert string to number

 // Process each query
 for ( var queryIndex = 0 ; queryIndex < totalQueries ; queryIndex++ ) {
  var queryData = ( inputLineBuffer.shift() ) . split(" ") . map( Number ) ;
  var querySource = queryData[0] - 1 ;
  var queryDestination = queryData[1] - 1 ;
  var queryType = queryData[2] ;

  // Output the result based on the query type (0 for cost, 1 for time)
  if ( queryType === 0 ) {
   console.log( costMap[querySource][queryDestination] ) ;
  }
  if ( queryType === 1 ) {
   console.log( timeMap[querySource][queryDestination] ) ;
  }
 }
} // End of main processing loop