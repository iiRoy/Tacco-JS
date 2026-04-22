function Processor( rawData )
{
  rawData = rawData.split( "\n" );

  let timeConfig = rawData[0].split( " " );
  let rateA = rawData[1].split( " " );
  let rateB = rawData[2].split( " " );

  for ( let idx = 0; idx < 2; idx++ ) {
    timeConfig[idx] = Number( timeConfig[idx] );
    rateA[idx] = Number( rateA[idx] );
    rateB[idx] = Number( rateB[idx] );
  }

  let sumDiff1 = timeConfig[0] * rateA[0] - timeConfig[0] * rateB[0];
  let sumDiff2 = sumDiff1 + timeConfig[1] * rateA[1] - timeConfig[1] * rateB[1];

  if ( sumDiff2 === 0 ) {
    console.log( 'infinity' );
  } else if ( sumDiff1 * sumDiff2 > 0 ) {
    console.log( 0 );
  } else if ( sumDiff1 / sumDiff2 - Math.ceil( sumDiff1 / sumDiff2 ) === 0 ) {
    console.log( Math.ceil( sumDiff1 / sumDiff2 ) * 2 );
  } else {
    console.log( -Math.ceil( sumDiff1 / sumDiff2 ) * 2 + 1 );
  }
}

Processor( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );