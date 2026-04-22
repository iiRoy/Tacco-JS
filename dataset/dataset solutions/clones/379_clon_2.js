let sourceTextContent = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;
let inputLines = ( sourceTextContent.replace ( /\n$/ , "" ) ) . split ( "\n" ) ;
let totalCount = Number ( inputLines.shift ( ) ) ;
for ( let loopIndex = 0 ; loopIndex < totalCount ; loopIndex ++ ) {
  let timePartsArray = inputLines[loopIndex] . split ( ":" ) ;
  let currentHour = parseInt ( timePartsArray [ 0 ] , 10 ) ;
  let currentMinute = parseInt ( timePartsArray [ 1 ] , 10 ) ;
  let hourPositionDegrees = currentHour * ( 360 / 12 ) + currentMinute * ( ( 360 / 12 ) / 60 ) ;
  let minutePositionDegrees = currentMinute * ( 360 / 60 ) ;
  let angularDifferenceValue = Math.abs ( hourPositionDegrees - minutePositionDegrees ) ;
  let outcomeMessage ;
  if ( angularDifferenceValue >= 0 && angularDifferenceValue < 30 )
    outcomeMessage = "alert" ;
  else if ( angularDifferenceValue >= 90 && angularDifferenceValue < 180 )
    outcomeMessage = "safe" ;
  else
    outcomeMessage = "warning" ;
  console . log ( outcomeMessage ) ;
}