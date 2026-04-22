let         accumulatedText    =    '';
const    inputSource = process.stdin;

inputSource.resume();
inputSource.setEncoding( 'utf-8' );

inputSource.on( 'data', function ( dataSegment ) {
  accumulatedText += dataSegment; /* Append the incoming data fragment */
} );


inputSource.on( 'end', function () {

  const       processedLines = accumulatedText.split( '\n' );

  const elementQuantity = parseInt( processedLines[0] );
  const firstCoordSet   = processedLines[1].split( ' ' ).map( Number );
  const secondCoordSet  = processedLines[2].split( ' ' ).map( Number );

  let sumAbsDiff        = 0;
  let sumSqDiff         = 0;
  let sumCubedDiff      = 0;
  let maximumDifference = 0;

  let currentAbsDiff;

  for ( let indexVal = 0; indexVal < elementQuantity; indexVal++ ) {

    currentAbsDiff = Math.abs( firstCoordSet[indexVal] - secondCoordSet[indexVal] );

    sumAbsDiff       += currentAbsDiff;
    sumSqDiff        += Math.pow( currentAbsDiff, 2 );
    sumCubedDiff     += Math.pow( currentAbsDiff, 3 );
    maximumDifference = Math.max( maximumDifference, currentAbsDiff );
  }

  console.log( sumAbsDiff );
  console.log( Math.sqrt( sumSqDiff ) );
  console.log( Math.pow( sumCubedDiff, 1 / 3 ) );
  console.log( maximumDifference ); /* Display the Chebyshev Distance */
} );