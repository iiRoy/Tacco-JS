var  fileContent  =  require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ;
var   lineSegments = fileContent . trim ( ) . split ( "\n" ) ;
while ( true ) {
  var   currentSegment = lineSegments . shift ( ) ;
  if ( currentSegment === "0 0 0 0 0" ) break ;
  var   parsedValues = ( currentSegment + " " + lineSegments . shift ( ) ) . split ( " " ) . map ( Number ) ;
  ( function ( paramA, paramB, paramC, paramD, paramE, countA, countB, countC ) {
    var   calculatedResultOne , calculatedResultTwo ;
    var   remainingPart = countC % paramD ;
    calculatedResultOne = countA * paramA + countB * paramB + Math . floor ( countC / paramD ) * paramD * paramE + remainingPart * paramC ;
    if ( countC >= paramD ) calculatedResultTwo = countA * paramA + countB * paramB + countC * paramE ;
    if ( countC < paramD ) {
      var   requiredAmount = paramD - remainingPart ;
      while ( requiredAmount -- ) {
        if ( countB > 0 ) countB -- ;
        else if ( countA > 0 ) countA -- ;
      }
      calculatedResultTwo = countA * paramA + countB * paramB + paramD * paramE ;
    }
    console . log ( Math . min ( calculatedResultOne , calculatedResultTwo ) ) ;
  } ) . apply ( null , parsedValues ) ;
}