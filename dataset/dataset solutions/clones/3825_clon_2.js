'use strict';

function PrimaryProcessor ( incomingDatum )
{
  // Convert the raw input string into an integer value for processing
  incomingDatum = Number.parseInt ( incomingDatum.trim() );


  if ( incomingDatum < 1 )
  {
    return;
  }

  // Iterate downwards from the given input value to locate a perfect square
  for ( let currentIterationValue = incomingDatum; currentIterationValue > 0; currentIterationValue-- )
  {
    // Validate if the square root of the current value is an integer (indicating a perfect square)
    if ( Math.sqrt ( currentIterationValue ) % 1 === 0 )
    {
      console.log ( '%d', currentIterationValue );
      return; // Exit upon discovering the first perfect square
    }
  }
}


// The subsequent section manages standard input/output operations and initiates the primary processing routine.
// Please refrain from altering any code positioned below this boundary, as it governs interaction with the execution environment.
PrimaryProcessor ( require ( "fs" ) .readFileSync ( "/dev/stdin", "utf8" ) );