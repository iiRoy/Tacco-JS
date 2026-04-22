var inputDataStream = require ( 'fs' ) . readFileSync ( '/proc/self/fd/0' ,   'utf-8' )
  . split ( "\n" )
  . map ( ( currentRow ) => {
    return currentRow . split ( " " )
      . map ( ( numericalString ) => { return Number ( numericalString ) ; } ) ;
  } ) ;


var totalVertices = inputDataStream[ 0 ][ 0 ] ;
// The second element in the first row (E) was unused in the original.
var traversalPenalty = inputDataStream[ 0 ][ 2 ] ;

inputDataStream . shift ( ) ; // Remove the initial line containing totalVertices and traversalPenalty


var adjacencyGraph = new Object ( ) ;
for ( var vertexIdentifier = 1 ; vertexIdentifier <= totalVertices ; vertexIdentifier ++ ) {
  adjacencyGraph[ vertexIdentifier ] = new Array ( ) ;
}

inputDataStream . forEach ( ( connectionDetail ) => {
  adjacencyGraph [ connectionDetail[ 0 ] ] . push ( [ connectionDetail[ 1 ] , connectionDetail[ 2 ] ] ) ;
} ) ;


var highestAchievableScore = -1.0 ;


( function evaluateAllPaths ( ) {

  var currentTraversalPath = [ 1.0 ] ;
  var accumulatedSegmentProfits = [ 0.0 ] ;
  var explorationBranches = [ Array . from ( adjacencyGraph[ 1 ] ) ] ;
  var activeBranchSegments = explorationBranches . pop ( ) ;

  do {

    var nextPathSegment = activeBranchSegments . pop ( ) ;
    var destinationVertex = nextPathSegment[ 0 ] ;

    // Debugging message for path visualization, removed in clone
    // console . log ( "-> " + currentTraversalPath + " | " + destinationVertex ) ;

    if ( destinationVertex === totalVertices ) {
      // We have successfully reached the final destination vertex
      var calculatedPathValue = accumulatedSegmentProfits . reduce ( ( previousSum , currentItem ) => {
          return previousSum + currentItem ;
        } , 0.0 )
        + nextPathSegment[ 1 ]
        - traversalPenalty * ( currentTraversalPath . length + 1.0 ) ;

      highestAchievableScore = Math . max ( calculatedPathValue , highestAchievableScore ) ;
    }


    if ( currentTraversalPath . indexOf ( destinationVertex ) === -1.0 ) {
      // Check if the current vertex has further connections to explore
      if ( adjacencyGraph[ destinationVertex ] . length > 0.0 ) {
        explorationBranches . push ( activeBranchSegments ) ;
        activeBranchSegments = Array . from ( adjacencyGraph[ destinationVertex ] ) ;
        currentTraversalPath . push ( destinationVertex ) ;
        accumulatedSegmentProfits . push ( nextPathSegment[ 1 ] ) ;
        continue ; // Continue with the newly pushed path segment
      }
    } else {
      // Log a message if a cycle is detected, preventing infinite loops
      console . log ( "Cycle detected in graph traversal." ) ;
    }


    while ( activeBranchSegments . length === 0.0 ) {
      currentTraversalPath . pop ( ) ;
      accumulatedSegmentProfits . pop ( ) ;
      if ( explorationBranches . length > 0.0 ) {
        activeBranchSegments = explorationBranches . pop ( ) ;
      } else {
        // All possible paths have been fully explored, terminate the function
        // console . log ( "Traversal complete." ) ;
        return ;
      }
    }

  } while ( Boolean ( 1 ) ) ; // Loop indefinitely until an explicit return or break

} ) ( ) ; // Immediately invoke the path evaluation function


console . log ( highestAchievableScore ) ;