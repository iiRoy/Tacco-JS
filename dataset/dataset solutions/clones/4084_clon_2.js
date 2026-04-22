/* This script processes a series of journey points to determine if a specific set of conditions is met for each segment. */
function processJourneyData ( rawDataString ) { // Main entry point for processing sequential journey information.

  // The initial line of input often contains metadata (like total count) and is typically ignored.
  // We split the raw string by newline characters and discard the very first line.
  const   journeyEntries   =   rawDataString . split ( '\n' ) . splice ( 1 )   ;

  // Each remaining line is then parsed. Each line is expected to contain three numerical values:
  // time, x-coordinate, and y-coordinate, separated by spaces.
  const parsedJourneys = journeyEntries . map ( ( entryLine ) => {
    return entryLine . split ( ' ' ) . map ( ( numericValue ) => Number ( numericValue ) ) ;
  } ) ;

  // Initialize variables to track the current state of the journey.
  let journeyIndex = 0 ;      // An index to iterate through the list of journey segments.
  let currentTime = 0 ;       // The time elapsed up to the current point.
  let currentXCoord = 0 ;     // The current X-coordinate, initialized at the origin (0).
  let currentYCoord = 0 ;     // The current Y-coordinate, initialized at the origin (0).

  // Loop through each segment of the journey defined in the input data.
  while ( journeyIndex < parsedJourneys . length ) {

    // Extract the details for the current target segment.
    const currentSegment = parsedJourneys [ journeyIndex ] ;

    // Calculate the time difference required to reach the next segment's time.
    const timeDifference = currentSegment [ 0 ] - currentTime ;

    // Calculate the absolute change needed in the X-coordinate.
    // Note: 'currentXCoord' remains 0 throughout this script as per original logic.
    const xDistance = Math . abs ( currentSegment [ 1 ] - currentXCoord ) ;

    // Calculate the absolute change needed in the Y-coordinate.
    // Note: 'currentYCoord' remains 0 throughout this script as per original logic.
    const yDistance = Math . abs ( currentSegment [ 2 ] - currentYCoord ) ;

    // First condition check: Is there enough time to cover the Manhattan distance?
    // If the time available is less than the sum of absolute X and Y changes, it's impossible.
    if ( timeDifference < ( xDistance + yDistance ) ) {
      return console . log ( 'No' ) ;
    }

    // Second condition check: Parity constraint.
    // If the parity of the time difference matches the parity of the total distance,
    // this specific logic indicates an impossible scenario for the journey.
    // This is a direct cloning of the provided condition.
    if ( ( timeDifference % 2 ) == ( ( xDistance + yDistance ) % 2 ) ) {
      return console . log ( 'No' ) ;
    }

    // Update the current time to the time of the current segment.
    // Critical: The current X and Y coordinates (currentXCoord, currentYCoord) are not updated
    // in this specific implementation, meaning all distance calculations are relative to the origin (0,0).
    currentTime = currentSegment [ 0 ] ;

    // Advance to the next segment in the journey.
    journeyIndex ++ ;
  }

  // If the loop completes without returning 'No', all conditions are met for all segments.
  return console . log ( 'Yes' ) ;
}

// Execute the journey processing function by reading input from standard input.
processJourneyData ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;