/*
 *  This JavaScript module is tasked with performing a
 *  basic numerical transformation. It accepts a textual
 *  input, converts it into an integer, and then computes
 *  a specific difference, which is subsequently displayed.
 */

function   handleInputAndCompute( initialStringValue )
{

  // Transform the provided string into an integer using base 10.
  // The original parameter reference is updated to hold this numeric representation.
  initialStringValue   =   parseInt ( initialStringValue , 10 ) ;


  // Log the result of subtracting the processed number from the constant 48.
  // This output goes to the standard console stream.
  console . log ( 48 - initialStringValue ) ;

}

// Orchestrate the execution: obtain raw data from the filesystem,
// then pass it to our primary processing function for calculation.
handleInputAndCompute (
  require('fs') . readFileSync ( '/dev/stdin' ,  'utf8' )
) ;