function ExecuteTask ( incomingText )
{
  const parsedLines = incomingText
    .split( "\n" )
    .map( lineStr => lineStr.split( " " ) );

  const targetDivisor = parsedLines[ 0 ][ 0 ];

  let runningTotal = 0;
  let iterationCount = 0;

  for ( let stepValue = 1;
        true;
        stepValue++ )
  {
    runningTotal += stepValue;
    iterationCount++;

    if ( runningTotal % targetDivisor === 0 &&
         stepValue !== 1 )
    {
      break;
    }
  }

  console.log( iterationCount ) ;
}

// Initiating the core processing logic.
ExecuteTask( require( "fs" )
  .readFileSync( "/dev/stdin", "utf8" ) ) ;