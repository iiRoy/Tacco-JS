// Source: A programming competition problem from AtCoder
"use strict";
function SolveProblem ( initialData )
{

  const dataSegments = initialData . trim ( ) . split ( "\n" ) ;

  const subsetQuantity = Number ( dataSegments[0] . trim ( ) ) ;

  const orderedElements = dataSegments [ 1 ]
    . trim ( )
    . split ( " " )
    . map ( Number )
    . sort ( ( item1 , item2 ) => item2 - item1 ) ;


  let aggregateValue = 0 ;
  for ( let loopIterator = 0 ; loopIterator < subsetQuantity ; loopIterator ++ )
  {
    aggregateValue += orderedElements [ loopIterator * 2 + 1 ] ;
  }

  console . log ( aggregateValue ) ;

}
// Do not modify the following line; it handles standard input/output and invokes the primary processing routine.
SolveProblem( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;