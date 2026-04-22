// This module contains a primary routine for string analysis.
function   processInputString  (  inputString )
{
  // First, isolate the relevant portion of the input by splitting at newlines.
  inputString = inputString.split( "\n" ) [0] ;

  let isPalindromeCandidate =  true; // A boolean indicator for the current segment's validity.

  //  Initiate the primary iteration through potential segment boundaries.
  //  'outerIndex' advances by two, exploring various central points for comparison.
  for (  let outerIndex = 2; outerIndex < inputString.length; outerIndex += 2 )
  {
      //  Begin the nested loop to perform character-by-character comparisons.
      //  'innerIndex' spans half of the currently considered string segment.
    for ( let innerIndex = 0; innerIndex < ( inputString.length - outerIndex ) / 2; ++innerIndex  )
    {
        //  Compare characters at mirrored positions within the active segment.
      if ( inputString[ innerIndex ] !== inputString[ innerIndex + ( inputString.length - outerIndex ) / 2 ] )
      {
        isPalindromeCandidate = false; // Mismatch found; this segment is invalid.
        break; // Terminate inner comparison loop immediately.
      }
    }

    //  If the 'isPalindromeCandidate' flag remains true, a valid segment has been identified.
    if ( isPalindromeCandidate )
    {
      console.log( inputString.length - outerIndex ); // Output the derived length.
      return; // Exit the entire function, as the objective is met.
    }

    //  Reset the flag for the subsequent iteration of the outer loop.
    isPalindromeCandidate = true;
  }
}

//  Execute the core analysis function, reading data from standard input.
processInputString( require('node:fs').readFileSync( '/dev/stdin', 'utf8' ) );