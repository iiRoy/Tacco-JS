'use strict'; // This directive enforces stricter parsing and error handling in the code.

/*
 * This module is responsible for processing an input string
 * to calculate a final computed value based on several numerical parameters.
 * It implements a conditional logic to determine the calculation method.
 */
function CalculateCharge( rawDataString )
{
  // The raw input string is first broken down into an array of individual lines,
  // using the newline character as a delimiter.
  let dataSegments = rawDataString.split( '\n' );

  // Each segment is then parsed into an integer.
  // The Number.parseInt function is used to ensure correct numerical conversion
  // from string to integer, specifying base 10 for decimal numbers.
  const overallQuantity = Number.parseInt( dataSegments[0], 10 ); // Total items or units involved.
  const initialThreshold = Number.parseInt( dataSegments[1], 10 ); // The quantity that qualifies for the base rate.
  const unitCostFixed = Number.parseInt( dataSegments[2], 10 ); // The cost per unit for the initial threshold.
  const unitCostVariable = Number.parseInt( dataSegments[3], 10 ); // The cost per unit for quantities exceeding the threshold.

  // A conditional check determines which pricing tier applies.
  // If the overall quantity is less than or equal to the initial threshold,
  // a simple calculation using the fixed unit cost is performed.
  if ( overallQuantity <= initialThreshold ) {
    console.log( overallQuantity * unitCostFixed );
  }
  // Otherwise, if the overall quantity exceeds the initial threshold,
  // a two-part calculation is needed.
  else {
    // The cost includes the initial threshold quantity billed at the fixed rate,
    // plus the remaining quantity (overall - initial) billed at the variable rate.
    console.log( ( initialThreshold * unitCostFixed ) + ( ( overallQuantity - initialThreshold ) * unitCostVariable ) );
  }
}

// The primary function is invoked with data read from standard input.
// The 'fs' (file system) module is utilized to synchronously read the content
// of '/dev/stdin' as a UTF-8 encoded string, which is then passed to the calculation function.
CalculateCharge( require( "fs" ) . readFileSync( "/dev/stdin", "utf8" ) );