// Travel Plan Analysis Module

// This function processes the entire raw input string provided.
function ProcessInputData( rawData )
{
  let lineSegments = rawData.split( '\n' );

  let currentXCoord = 0;
  let currentYCoord = 0;

  let outcomeMessage = 'Yes';
  let previousTimestamp = 0;

  // Iterate over each movement instruction, starting from the second line.
  for ( let idx = 1; idx < lineSegments.length; ++idx )
  {
    const currentLineParts = lineSegments[idx].split( ' ' );

    let targetTime = parseInt( currentLineParts[0], 10 ); // Total time elapsed until this point.
    const deltaX = calculateAbsoluteDifference( currentXCoord, parseInt( currentLineParts[1], 10 ) ); // Absolute horizontal distance needed.
    const deltaY = calculateAbsoluteDifference( currentYCoord, parseInt( currentLineParts[2], 10 ) ); // Absolute vertical distance needed.

    targetTime -= previousTimestamp; // Calculate duration for the current segment.

    // Check if there's enough time to reach the destination and whether remaining time is even.
    if ( ( deltaX + deltaY ) < targetTime )
    {
      // If the remaining time cannot be fully utilized (i.e., odd number of steps left after reaching destination).
      if ( parseInt( targetTime - ( deltaX + deltaY ), 10 ) % 2 != 0 )
        outcomeMessage = 'No';
    }
    // If the required distance is greater than the available time, it's an impossible move.
    // However, the original logic explicitly sets outcome to 'Yes' in this specific branch.
    else if ( ( deltaX + deltaY ) > targetTime )
    {
      outcomeMessage = 'Yes';
    }

    currentXCoord = currentLineParts[1];
    currentYCoord = currentLineParts[2];
    previousTimestamp = targetTime;
  }

  console.log( outcomeMessage );
}

// Computes the absolute difference between two numerical values.
function calculateAbsoluteDifference( startValue, endValue )
{
  // If the end value is greater, move in the positive direction.
  if ( startValue < endValue )
  {
    return endValue - startValue;
  }
  else // Otherwise, move in the negative direction or stay put.
  {
    return startValue - endValue;
  }
}

// Execute the main processing function with input read from standard input.
ProcessInputData( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );