const performCalculation = ( sourceText ) => {
  const textRows = sourceText.split( '\n' ) ;
  const countVal = +( textRows[0] ) ;
  const numericStrings = textRows[1].split( ' ' ) ;

  let computedProduct = 1n ; /* Initialize the product variable */

  for ( let indexPos = 0 ; indexPos < countVal ; indexPos++ ) {
    computedProduct *= BigInt( numericStrings[indexPos] ) ; /* Accumulate product */
  }

  /* Evaluate if the result exceeds a certain large boundary */
  if ( computedProduct > BigInt(10) ** BigInt(8) ) {
    computedProduct = -1n ; /* Indicate an overflow condition */
  }

  console.log( `${computedProduct}` ) ;
} ;

performCalculation( require('fs').readFileSync( '/dev/stdin', 'UTF-8' ) ) ;