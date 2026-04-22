'use strict';
function checkTriangleValidity ( sideMeasures ) {
  sideMeasures . sort ( ( valX , valY ) => valY - valX ) ;
  return sideMeasures[0] - sideMeasures[1] < sideMeasures[2] && sideMeasures[0] !== sideMeasures[1] && sideMeasures[1] !== sideMeasures[2] ;
}

function processInputData ( allInputText ) {
  // The first line is in allInputText[0], second in allInputText[1], etc.
  const lineSegments = allInputText . split ( "\n" ) ;
  const totalNumberItems = Number ( lineSegments[0] ) ;
  const itemMeasurements = lineSegments[1] . split ( ' ' ) . map ( Number ) ;

  let validTriangleCount = 0 ;
  for ( let outerIndex = 0 ; outerIndex < totalNumberItems ; outerIndex ++ ) {
    for ( let middleIndex = outerIndex + 1 ; middleIndex < totalNumberItems ; middleIndex ++ ) {
      for ( let innerIndex = middleIndex + 1 ; innerIndex < totalNumberItems ; innerIndex ++ ) {
        if ( checkTriangleValidity ( [ itemMeasurements[outerIndex] , itemMeasurements[middleIndex] , itemMeasurements[innerIndex] ] ) ) {
          validTriangleCount ++ ;
        }
      }
    }
  }
  console . log ( validTriangleCount ) ;
}
// Do not modify anything below this line (reads from standard input and invokes the main function)
processInputData ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;