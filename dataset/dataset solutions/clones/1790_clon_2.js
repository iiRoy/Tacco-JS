'use strict';


function AssessSituation ( rawInputTxt ) {
  // This section processes the raw input string, splitting it into individual lines.
  const dataLines = rawInputTxt.  trim() . split ( /\r?\n/g );

  // The first line contains initial position and velocity values.
  const initialSpeeds = dataLines [ 0 ] . split ( ' ' ) . map ( ( numStr ) => Number ( numStr ) ) ;
  const initialPos  =  initialSpeeds [ 0 ] ;
  const initialVel = initialSpeeds [ 1 ] ;

  // The second line contains target position and velocity values.
  const targetSpeeds = dataLines [ 1 ] . split ( ' ' ) . map ( ( stringVal ) => Number ( stringVal ) ) ;
  const finalPos = targetSpeeds [ 0 ] ;
  const finalVel = targetSpeeds [ 1 ] ;

  // The third line specifies the allowed time duration.
  const allowedTime = dataLines [ 2 ] ;

  let outcomeMessage = 'NO' ; // Initialize the outcome as 'NO' by default.

  // Calculate the linear distance that needs to be covered.
  const travelDistance = finalPos - initialPos ;

  // Determine the effective speed difference between the two entities.
  const speedDelta = initialVel - finalVel ;

  // Evaluate if the relative movement over the given time is sufficient to close the distance.
  if ( ( speedDelta * allowedTime ) > travelDistance )
  {
    outcomeMessage = 'YES' ; // If so, update the outcome.
  }

  // Display the determined outcome to the console.
  console.log ( outcomeMessage ) ;
}


// Core execution block: This part handles reading input from the standard input stream
// and passes it to the main processing function for calculation.
AssessSituation (
  require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )
) ;