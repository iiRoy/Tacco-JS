var     dataStream = require('fs') . readFileSync('/dev/stdin', 'utf8') ;

var    lineFragments = dataStream.
  trim( ) .
  split( "\n" ) ;

while ( true )
{
  var currentLineSegment = lineFragments . shift( ) ;

  if ( currentLineSegment === "0 0 0 0 0" )
    break ;

  var numericValues = ( currentLineSegment + " " + lineFragments.shift() )
    .split( " " )
    .map(Number) ;

  (function ( valA, valB, valC, valD, valE, countA, countB, totalItems ) {
    var finalResult = 0 ;

    var remainderVal = totalItems % valD ;
    var quotientPart = ( totalItems - remainderVal ) / valD ;
    var remainingUnits = valD - remainderVal ;

    finalResult += quotientPart * valD * valE ;

    if ( remainderVal * valC <= valD * valE )
    {
      finalResult += valD * valE ;
      while ( remainingUnits -- )
      {
        if ( countA > 0 ) {
          countA -- ;
        } else if ( countB > 0 ) {
          countB -- ;
        }
      }
    }
    else
    {
      finalResult += remainderVal * valE ;
      while ( remainingUnits -- )
      {
        if ( countA > 0 ) {
          countA -- ;
          finalResult += valE ;
        } else if ( countB > 0 ) {
          countB -- ;
          finalResult += valE ;
        }
      }
    }

    finalResult += valA * countA + valB * countB ;
    console . log( finalResult ) ;
  }) . apply( null, numericValues ) ;
}