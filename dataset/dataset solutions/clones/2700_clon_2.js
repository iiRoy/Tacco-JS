'use strict'
;
function processData(receivedText ) {
  const textRows = receivedText.split( '\n' );
  textRows.pop() ;
  const expectedCount = parseInt(textRows[0], 10 );
  const numericValues = textRows[1] .split(' ') .map( item => {
    return parseInt(item, 10) ;
  } );
  console.log(verifyOrder( numericValues) ) ;
}

function verifyOrder( sourceCollection ) {
  const workingSet = sourceCollection .slice() ;
  let discrepancyCount = 0 ;
  workingSet.forEach( (currentElement , elementIndex) => {
    if ( currentElement !== elementIndex + 1 ) {
      discrepancyCount++ ;
    }
  } )
  ;
  if ( discrepancyCount <= 2 ) {
    return 'YES' ;
  }
  return 'NO' ;
}

processData( require('fs').readFileSync('/dev/stdin', 'utf8') )
;