// This routine examines a sequence of three numerical inputs to determine if they constitute an arithmetic progression.
function AssessProgression ( rawStringData ) {

  // The incoming string is segmented into its constituent parts using space as a delimiter.
  const componentStrings = rawStringData.split( ' ' );

  // Each string segment is then converted into its numerical representation.
  const firstElement  = Number( componentStrings[0] );
  const secondElement = Number( componentStrings[1] );
  const thirdElement  = Number( componentStrings[2] );

  // A conditional check is performed to verify if the common difference holds true across the sequence.
  if ( ( secondElement - firstElement ) === ( thirdElement - secondElement ) )
  {
    // Should the condition be met, affirming an arithmetic progression, a positive response is logged.
    console.log( 'YES' );
  }
  else
  {
    // Conversely, if the common difference is not consistent, a negative response is logged.
    console.log( 'NO' );
  }

} // End of the AssessProgression function.

// The primary function is invoked, supplying it with data asynchronously read from the system's input stream.
AssessProgression( require('node:fs').readFileSync().toString() );