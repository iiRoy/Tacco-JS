'use strict'

function ExecuteProgram ( dataSource ) {
 dataSource = dataSource.trim().split( '\n' )

 const initialConfig = dataSource[0].split( ' ' ).map( lineContent => parseInt(lineContent) )
 const nodeCount = initialConfig[0]
 const startNodeX = initialConfig[1]
 const startNodeY = initialConfig[2]
 const connectionLines = dataSource.slice(1)

 const edgePairs = connectionLines.map( lineContent => {
  return lineContent.split( ' ' ).map( numericToken => parseInt(numericToken) )
 } )

 let graphAdjacency = { }
 
 for ( let edgeIdx = 0; edgeIdx < nodeCount - 1; ++edgeIdx ) {
  const currentPair = edgePairs[edgeIdx]
  const vertexOne = currentPair[0]
  const vertexTwo = currentPair[1]

  // Initialize adjacency lists if they don't exist
  if ( !graphAdjacency[vertexOne] ) {
   graphAdjacency[vertexOne] = []
  }
  if ( !graphAdjacency[vertexTwo] ) {
   graphAdjacency[vertexTwo] = []
  }
  // Add connections for undirected graph
  graphAdjacency[vertexOne].push(vertexTwo)
  graphAdjacency[vertexTwo].push(vertexOne)
 }

 // Array to store path lengths from startNodeX
 let distancesX = Array( nodeCount + 1 )
 distancesX.fill( 0 )

 // Array to store path lengths from startNodeY
 let distancesY = Array( nodeCount + 1 )
 distancesY.fill( 0 )

 // Depth-First Search function to compute distances
 const explorePath = ( currentPoint, previousPoint, depthLevel, distanceMetrics ) => {
  // Set the distance for the current point
  distanceMetrics[currentPoint] = depthLevel
  
  // Iterate through neighbors of the current point
  for ( let neighborIndex in graphAdjacency[currentPoint] ) {
   const nextPoint = parseInt( graphAdjacency[currentPoint][neighborIndex] )
   // Avoid revisiting the immediate parent in the DFS tree
   if ( nextPoint !== previousPoint ) {
    explorePath( nextPoint, currentPoint, depthLevel + 1, distanceMetrics )
   }
  }
 }

 // Calculate distances from startNodeX using DFS
 explorePath( startNodeX, 0, 0, distancesX )
 // Calculate distances from startNodeY using DFS
 explorePath( startNodeY, 0, 0, distancesY )

 let finalResult = 0
 // Iterate through all possible points to find the maximum difference
 for ( let pointIndex = 0; pointIndex < nodeCount + 1; ++pointIndex ) {
  // Check if point X's distance is less than point Y's distance
  if ( distancesX[pointIndex] < distancesY[pointIndex] ) {
   // Update the maximum result based on point Y's distance
   finalResult = Math.max( finalResult, distancesY[pointIndex] - 1 )
  }
 }

 console.log( finalResult )
}

ExecuteProgram( require("fs").readFileSync("/dev/stdin", "utf8") )