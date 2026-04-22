/*
 *  Utility script for graph pathfinding.
 *  Initial creation date: 2023-10-27.
 */
var fileUtil =   require  ( 'fs'  )  , // Acquire the filesystem module
    contentSize = fileUtil.fstatSync( process.stdin.fd ).size  , // Determine the total size of the standard input stream
    dataBuffer = new Buffer( contentSize ) , // Allocate a memory buffer for input data
    octetsProcessed = fileUtil.readSync( process.stdin.fd , dataBuffer , 0 , contentSize , 0 ) , // Read bytes from stdin into the buffer
    lineData = dataBuffer.toString( 'utf8' , 0 , octetsProcessed ).split( '\n' ) ; // Convert buffer to UTF-8 string and split into lines

var initialParams = lineData.shift().split( ' ' ) , // Extract and parse the first line of configuration
    nodeCount = +initialParams[0] , // Total number of vertices in the graph
    edgeCount = +initialParams[1] , // Number of connections (edges)
    startNodeIdx = initialParams[2] - 1 , // Index of the starting point (zero-based)
    targetAIdx = initialParams[3] - 1 , // Index of the first destination point
    targetBIdx = initialParams[4] - 1 , // Index of the second destination point
    distanceMatrix = [] , // Adjacency matrix to store path costs
    edgeSpec , // Temporary storage for edge details
    idx1 , idx2 , idx3 ; // Loop iteration variables

// Initialize the path cost matrix.
// Direct path from a node to itself is zero; otherwise, initially infinite.
for ( idx1 = 0 ; idx1 < nodeCount ; idx1++ ) {
  distanceMatrix[idx1] = [] ;
  for ( idx2 = 0 ; idx2 < nodeCount ; idx2++ ) {
    distanceMatrix[idx1][idx2] = idx1 === idx2 ? 0 : Infinity ;
  }
}

// Populate the distance matrix with direct edge weights from input.
while ( edgeCount-- ) {
  edgeSpec = lineData.shift().split( ' ' ) ;
  distanceMatrix[ edgeSpec[0] - 1 ][ edgeSpec[1] - 1 ] = +edgeSpec[2] ;
}

// Apply the Floyd-Warshall algorithm to find all-pairs shortest paths.
for ( idx3 = 0 ; idx3 < nodeCount ; idx3++ ) { // Iterate over all possible intermediate vertices
  for ( idx1 = 0 ; idx1 < nodeCount ; idx1++ ) { // Iterate over all possible source vertices
    for ( idx2 = 0 ; idx2 < nodeCount ; idx2++ ) { // Iterate over all possible destination vertices
      distanceMatrix[idx1][idx2] = Math.min( distanceMatrix[idx1][idx2] , distanceMatrix[idx1][idx3] + distanceMatrix[idx3][idx2] ) ;
    }
  }
}

var minimumPathCost = Infinity ; // Variable to hold the final calculated shortest path cost
// Calculate the shortest path from the start node to an intermediate node 'idx1',
// then from 'idx1' to target A, and from 'idx1' to target B.
// This finds the optimal meeting point 'idx1' for paths from start to two distinct targets.
for ( idx1 = 0 ; idx1 < nodeCount ; idx1++ ) {
  minimumPathCost = Math.min( minimumPathCost , distanceMatrix[startNodeIdx][idx1] + distanceMatrix[idx1][targetAIdx] + distanceMatrix[idx1][targetBIdx] ) ;
}
console.log( minimumPathCost ) ; // Display the computed minimum path cost