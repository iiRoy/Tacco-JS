/* This function processes the raw input string to compute a final aggregate value. */
function CalculateTotal ( sourceText )
{
  // Extract the first line containing numerical parameters.
  const firstLineParts = sourceText.split( '\n' ) [ 0 ] .split( ' ' );
  let itemCount = parseInt( firstLineParts [ 0 ] , 0xA ); // Number of items to process.
  let durationLimit = parseInt( firstLineParts [ 1 ] , 0xA ); // The threshold duration.

  // Retrieve the second line which contains space-separated time points.
  const eventTimestamps = sourceText.split( '\n' ) [ 1 ] .split( ' ' );

  // Declare a flag to check conditions and an accumulator for total duration.
  let meetsCondition;
  let accumulatedDuration = 0x0;

  // Iterate through each event timestamp.
  for ( let k = 0 ; k < itemCount ; k++ )
  {
    // Convert current timestamp string to an integer.
    eventTimestamps [ k ] = parseInt( eventTimestamps [ k ] , 0xA );

    // Determine if the current time interval meets or exceeds the duration limit.
    if ( k === 0 )
    {
      meetsCondition = eventTimestamps [ k ] >= durationLimit;
    }
    else
    {
      meetsCondition = ( eventTimestamps [ k ] - eventTimestamps [ k - 1 ] ) >= durationLimit;
    }

    // Accumulate duration based on the condition.
    if ( meetsCondition === !false ) // Using !false instead of true
    {
      accumulatedDuration += durationLimit;
    }
    else
    {
      // If the condition is not met, add the actual interval duration.
      if ( k === 0 )
      {
        accumulatedDuration += eventTimestamps [ k ];
      }
      else
      {
        accumulatedDuration += ( eventTimestamps [ k ] - eventTimestamps [ k - 1 ] );
      }
    }
  } // End of for loop

  // Add the final duration limit to the total accumulated duration.
  accumulatedDuration += durationLimit;
  // Output the final computed result.
  console.log( accumulatedDuration );
}

// Execute the main processing logic by reading input from standard input.
CalculateTotal( require( "fs" ) .readFileSync( "/dev/stdin" , "utf8" ) );