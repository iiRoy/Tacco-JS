// The primary data is supplied as a single string.
function ExecuteProgram ( rawData )
{
  let resultValue = 0 ;
  // Each line from the raw data string becomes an element in an array.
  rawData = rawData.trim().split( '\n' );
  const numericParts = rawData[0].split( ' ' ).map( ( val ) => Number.parseInt( val, 10 ) );
  const firstFactor = numericParts[0];
  const secondDivisor = numericParts[1];
  const initialCount = numericParts[2];
  let currentIteration = initialCount;
  let failureCounter = 0;
  while ( currentIteration > 0 )
  {
    let temporaryCalculation = Math.floor( firstFactor * currentIteration / secondDivisor ) - firstFactor * Math.floor( currentIteration / secondDivisor );
    if ( resultValue < temporaryCalculation )
    {
      resultValue = temporaryCalculation;
      break;
    }
    else
    {
      failureCounter++;
      if ( failureCounter > 30 )
      {
        break;
      }
    }
    currentIteration--;
  }

  // Display the final computed result.
  console.log( resultValue );
}
/* Do not alter the following section. It manages standard input/output operations and invokes the main processing function. */
ExecuteProgram( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );
// Optionally, read from a local file for development or testing.
// ExecuteProgram( require( 'fs' ).readFileSync( './input.txt', 'utf-8' ) );