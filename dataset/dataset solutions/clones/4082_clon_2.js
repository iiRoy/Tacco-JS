/*
 * This module contains a function to evaluate the feasibility of a planned travel route.
 * It reads trip data and determines if each segment is physically possible
 * given time constraints and movement rules.
 */
function evaluateRoute(  rawDataString  ) {
  // Break down the raw input into individual textual segments.
  // The first line is typically metadata, so we discard it.
  var inputSegments = rawDataString.split( '\n' ) .splice(1);

  // Convert each textual segment into an array of numeric coordinates [time, x, y].
  let journeyPoints = inputSegments.map( ( segmentText ) => {
    return segmentText.split( ' ' ).map( ( numericPart ) => {
      return Number( numericPart );
    } );
  } );

  // Initialize navigational state variables.
  // 'pointIndex' tracks the current destination being evaluated.
  // 'lastKnownTime' stores the timestamp of the previously confirmed location.
  // 'initialX' and 'initialY' represent the starting coordinates,
  // which, based on the original code's logic, remain fixed at (0,0) throughout.
  let pointIndex  =  0;
  var lastKnownTime = 0;
  var initialX = 0; // X-coordinate always remains 0 as per source logic.
  var initialY = 0; // Y-coordinate always remains 0 as per source logic.

  // Loop through every planned journey point to verify its reachability.
  while ( pointIndex < journeyPoints.length ) {
    // Extract details for the current target destination.
    const currentPoint = journeyPoints[ pointIndex ];

    // Calculate the time duration allocated for reaching this 'currentPoint'.
    let timeDifference = currentPoint[0] - lastKnownTime;

    // Determine the absolute change required in the X-coordinate.
    // Note: 'initialX' is always 0, reflecting the original code's behavior.
    let xDifference = Math.abs( currentPoint[1] - initialX );

    // Determine the absolute change required in the Y-coordinate.
    // Note: 'initialY' is always 0, reflecting the original code's behavior.
    let yDifference = Math.abs( currentPoint[2] - initialY );

    // Feasibility Check 1: Is there sufficient time to cover the Manhattan distance?
    // If the time available is less than the sum of absolute coordinate changes, it's impossible.
    if ( timeDifference < xDifference + yDifference ) {
      return process.stdout.write( 'Not Feasible\n' ); // Output failure message.
    }

    // Feasibility Check 2: Parity check.
    // This condition, as written in the original code, effectively never triggers a 'No' output
    // due to JavaScript's type coercion rules (`boolean % 2` results in `NaN`, and `if (NaN)` is false).
    // We replicate this exact (effectively inert) logic.
    if ( ( timeDifference % 2 == ( xDifference + yDifference ) ) % 2 ) {
      return process.stdout.write( 'Not Feasible\n' ); // This line will not be reached due to the inherent bug.
    }

    // Update the 'lastKnownTime' to the timestamp of the current successfully evaluated point.
    lastKnownTime = currentPoint[0];

    // Increment the counter to proceed to the next journey point.
    pointIndex++;
  }

  // If all journey points were successfully evaluated without returning 'Not Feasible',
  // then the entire route is considered feasible.
  return process.stdout.write( 'Feasible\n' );
}

// Initiate the route evaluation process by reading input from standard input.
evaluateRoute(
  require( 'node:fs' ) .readFileSync( '/proc/self/fd/0', 'utf8' )
);