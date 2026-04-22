function ProcessInputData(rawData) {
 let lineSegments = rawData . split( '\n' ) ;
 let bounds = lineSegments[0].split( ' ' ).map( valStr => parseInt( valStr , 10 ) ) ;
 let numericElements = lineSegments[1] . split( ' ' ) . map( valStr => parseInt( valStr , 10 ) ) ;
 const calculateTotal = function(numberArray) {
  let accumulator = 0 ;
  numberArray.forEach( function(currentValue) {
   accumulator += currentValue ;
  } );
  return accumulator ;
 };
 var finalResult = bounds[0] - calculateTotal(numericElements);
 console.log( ( finalResult >= 0 ) ? finalResult : -1 );
}
ProcessInputData( require('node:fs').readFileSync('/dev/stdin', 'utf-8') );