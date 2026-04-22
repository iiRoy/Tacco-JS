let dataSource = require('fs') . readFileSync('/dev/stdin' , 'utf8' );

let textRows = dataSource . split ( '\n' );

let vertexCount = textRows [ 0 ] . split ( ' ' ) [ 0 ] - 0 ;
let edgeCount = textRows [ 0 ] . split ( ' ' ) [ 1 ] - 0 ;
let initialAltitude = textRows [ 0 ] . split ( ' ' ) [ 2 ] - 0 ;

let loopIndex , anotherIndex , thirdIndex ;
let altitudes = Array ( vertexCount );

let adjacencyList = Array ( vertexCount );
let pathStack = [ ] ;
for ( loopIndex = 0 ; loopIndex < vertexCount ; loopIndex++ ) {
  altitudes [ loopIndex ] = textRows [ loopIndex + 1 ] - 0 ;
  adjacencyList [ loopIndex ] = [ ] ;
}

let temporaryData , sourceNode , destinationNode , travelTime ;
for ( loopIndex = 0 ; loopIndex < edgeCount ; loopIndex++ ) {
  temporaryData = textRows [ loopIndex + vertexCount + 1 ] . split ( ' ' ) ;
  sourceNode = temporaryData [ 0 ] - 1 ;
  destinationNode = temporaryData [ 1 ] - 1 ;
  travelTime = temporaryData [ 2 ] - 0 ;
  adjacencyList [ sourceNode ] . push ( {
    linkedNode : destinationNode ,
    duration : travelTime
  } ) ;
  adjacencyList [ destinationNode ] . push ( {
    linkedNode : sourceNode ,
    duration : travelTime
  } ) ;
}
pathStack . push ( {
  currentPoint : 0 ,
  accumulatedTime : 0 ,
  currentAltitude : initialAltitude ,
  visitedPath : [ 0 ]
} ) ;
let currentNode , neighborNode , edgeInfo , finalPath ;
let minimumTime = Infinity ;
while ( pathStack . length > 0 ) {
  currentNode = pathStack . pop ( ) ;
  for ( loopIndex = 0 ; loopIndex < adjacencyList [ currentNode . currentPoint ] . length ; loopIndex++ ) {
    edgeInfo = adjacencyList [ currentNode . currentPoint ] [ loopIndex ] ;
    neighborNode = edgeInfo . linkedNode ;
    if ( currentNode . visitedPath . indexOf ( neighborNode ) !== -1 ) {
      continue ;
    }

    if ( altitudes [ currentNode . currentPoint ] < edgeInfo . duration ) {
      continue ;
    }
    if ( altitudes [ neighborNode ] + edgeInfo . duration < currentNode . currentAltitude ) {
      pathStack . push ( {
        currentPoint : neighborNode ,
        accumulatedTime : currentNode . accumulatedTime + edgeInfo . duration + currentNode . currentAltitude - ( altitudes [ neighborNode ] + edgeInfo . duration ) ,
        currentAltitude : altitudes [ neighborNode ] ,
        visitedPath : currentNode . visitedPath . concat ( neighborNode )
      } ) ;
    } else if ( altitudes [ neighborNode + edgeInfo . duration >= currentNode . currentAltitude && currentNode . currentAltitude >= edgeInfo . duration ] ) {
      pathStack . push ( {
        currentPoint : neighborNode ,
        accumulatedTime : currentNode . accumulatedTime + edgeInfo . duration ,
        currentAltitude : currentNode . currentAltitude - edgeInfo . duration ,
        visitedPath : currentNode . visitedPath . concat ( neighborNode )
      } ) ;
    } else {
      pathStack . push ( {
        currentPoint : neighborNode ,
        accumulatedTime : currentNode . accumulatedTime + edgeInfo . duration + edgeInfo . duration - currentNode . currentAltitude ,
        currentAltitude : 0 ,
        visitedPath : currentNode . visitedPath . concat ( neighborNode )
      } ) ;
    }

    if ( neighborNode === vertexCount - 1 ) {
      finalPath = pathStack . pop ( ) ;
      minimumTime = Math . min ( minimumTime , finalPath . accumulatedTime + altitudes [ vertexCount - 1 ] - finalPath . currentAltitude ) ;
    }
  }
}
console . log ( minimumTime ) ;