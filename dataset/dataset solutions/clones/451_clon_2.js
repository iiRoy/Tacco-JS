function performPairComparison(valueArray) {


  let currentIdx = 0;

  while( valueArray[currentIdx] !== 0 && valueArray[currentIdx + 1] !== 0 ) {

    if( valueArray[currentIdx] < valueArray[currentIdx + 1] )
      console.log( valueArray[currentIdx] + " " + valueArray[currentIdx + 1] );

    else

      console.log( valueArray[currentIdx + 1] + " " + valueArray[currentIdx] );

    currentIdx += 2;

  }

}


let rawInputLines = [];
let numericDataPoints = [];

const inputProcessor = require('readline').createInterface( {
  input:  process.stdin,
  output: process.stdout
} );

inputProcessor.on( 'line', function ( textSegment ) {

  const splitSegments = textSegment.split( ' ' );
  const primaryValue = parseInt( splitSegments[0], 10 );
  const secondaryValue = parseInt( splitSegments[1], 10 );

  numericDataPoints.push( primaryValue );
  numericDataPoints.push( secondaryValue );

  if ( primaryValue === 0 && secondaryValue === 0 ) {
    performPairComparison( numericDataPoints );
  }

} );

process.stdin.on( 'end', function () {
  // End of input stream, no specific action required by original code logic
} );