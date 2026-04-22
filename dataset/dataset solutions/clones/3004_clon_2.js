/*
 *  The entire raw data is provided as an argument to this function.
 */
function ProcessInput( rawData )
{
  // Split the raw string into an array of lines.
  var parsedLines = rawData.split( '\n' );

  // Take the first line and split it by spaces to get individual tokens.
  let firstLineTokens = parsedLines[ 0 ] .split( ' ' );

  // Parse the first token as the time interval.
  const intervalDuration = Number( firstLineTokens[ 0 ] );

  // Parse the second token as the amount to add per interval.
  const rewardAmount = Number( firstLineTokens[ 1 ] );

  // Parse the third token as the overall time constraint.
  const totalTimeLimit = Number( firstLineTokens[ 2 ] );

  // Initialize a counter for the current interval cycle.
  let currentCycle = 1;

  // Initialize the total accumulated value.
  var totalAccumulation = 0;

  // Loop through time points, including a small buffer beyond the limit.
  for ( let currentTimePoint = 0; currentTimePoint <= ( totalTimeLimit + 0.5 ); currentTimePoint++ )
  {
    // Check if the current time point aligns with a multiple of the interval duration.
    if ( currentTimePoint === ( currentCycle * intervalDuration ) )
    {
      // If aligned, add the reward amount to the total.
      totalAccumulation += rewardAmount;

      // Increment the cycle counter for the next interval.
      currentCycle++;
    }
  }

  // Display the final calculated total.
  console.log( totalAccumulation );
}

/*
 *  Do not modify the code below this line. It handles reading input and invoking the main processing function.
 */
ProcessInput( require( "fs" ) .readFileSync( "/dev/stdin", "utf8" ) );