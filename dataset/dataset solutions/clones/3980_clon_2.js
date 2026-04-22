function ExecuteMatchingAlgorithm(rawSource) {
 const parsedLines = rawSource . trim ( ) . split( "\n" ) . map( function ( singleLine ) { return singleLine . split(" " ) } ) ;
 const graphSize = Number . parseInt( parsedLines[0][0], 10 ) ;
 const leftNodes = [ ] ;
 const rightNodes = [ ] ;
 for ( let loopIdx = 0 ; loopIdx < graphSize ; loopIdx ++ ) {
  leftNodes . push( parsedLines[ loopIdx + 1 ] . map( strVal => Number . parseInt( strVal , 10 ) ) ) ;
  rightNodes . push( parsedLines[ loopIdx + graphSize + 1 ] . map( strVal => Number . parseInt( strVal , 10 ) ) ) ;
 }
 const leftAdjacency = Array . from( { length : graphSize } , ( ) => [ ] ) ;
 const rightAdjacency = Array . from( { length : graphSize } , ( ) => [ ] ) ;
 const leftDegrees = Array . from( { length : graphSize } , ( ) => 0 ) ;
 const rightDegrees = Array . from( { length : graphSize } , ( ) => 0 ) ;
 let totalUnmatchedEdges = 0 ;
 for ( let lIdx = 0 ; lIdx < graphSize ; lIdx ++ ) {
  for ( let rIdx = 0 ; rIdx < graphSize ; rIdx ++ ) {
   if ( leftNodes[lIdx][0] < rightNodes[rIdx][0] && leftNodes[lIdx][1] < rightNodes[rIdx][1] ) {
    leftAdjacency[lIdx] . push( rIdx ) ;
    leftDegrees[lIdx] ++ ;
    rightAdjacency[rIdx] . push( lIdx ) ;
    rightDegrees[rIdx] ++ ;
    totalUnmatchedEdges ++ ;
   }
  }
 }
 let smallestDegreeSum ;
 let chosenVertexPair = [ -1 , -1 ] ;
 let maximumMatches = 0 ;
 const isVertexMatched = [ Array . from( { length : graphSize } , ( ) => 0 ) , Array . from( { length : graphSize } , ( ) => 0 ) ] ;
 while ( totalUnmatchedEdges > 0 ) {
  smallestDegreeSum = 2 * graphSize + 1 ;
  for ( let currentLIdx = 0 ; currentLIdx < leftAdjacency . length ; currentLIdx ++ ) {
   if ( isVertexMatched[0][currentLIdx] === 1 ) continue ;
   for ( let connectedRIdx of leftAdjacency[currentLIdx] ) {
    if ( isVertexMatched[1][connectedRIdx] === 1 ) continue ;
    if ( ( leftDegrees[currentLIdx] + rightDegrees[connectedRIdx] ) <= smallestDegreeSum ) {
     smallestDegreeSum = leftDegrees[currentLIdx] + rightDegrees[connectedRIdx] ;
     chosenVertexPair[0] = currentLIdx ;
     chosenVertexPair[1] = connectedRIdx ;
    }
   }
  }
  totalUnmatchedEdges -= ( smallestDegreeSum - 1 ) ;
  maximumMatches ++ ;
  for ( let neighborRIdx of leftAdjacency[chosenVertexPair[0]] ) {
   rightAdjacency[neighborRIdx] = rightAdjacency[neighborRIdx] . filter( nodeToFilter => nodeToFilter !== chosenVertexPair[0] ) ;
   rightDegrees[neighborRIdx] -- ;
  }
  for ( let neighborLIdx of rightAdjacency[chosenVertexPair[1]] ) {
   leftAdjacency[neighborLIdx] = leftAdjacency[neighborLIdx] . filter( nodeToFilter => nodeToFilter !== chosenVertexPair[1] ) ;
   leftDegrees[neighborLIdx] -- ;
  }
  isVertexMatched[0][chosenVertexPair[0]] = 1 ;
  isVertexMatched[1][chosenVertexPair[1]] = 1 ;
  leftAdjacency[chosenVertexPair[0]] = chosenVertexPair[1] ;
  leftDegrees[chosenVertexPair[0]] = 1 ;
  rightAdjacency[chosenVertexPair[1]] = chosenVertexPair[0] ;
  rightDegrees[chosenVertexPair[1]] = 1 ;
 }
 console . log( maximumMatches ) ;
}
ExecuteMatchingAlgorithm(require("fs").readFileSync("/dev/stdin", "utf8"));