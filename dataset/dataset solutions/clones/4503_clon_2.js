"use strict"

// This module processes a single line of numerical input.

const evaluateCondition = ( incomingText ) => {

  // Parse the input string into numerical components.
  const [ thresholdValue, startPoint, endPoint ] = incomingText
    .trim()
    .split( " " )
    .map( Number )
  ;

  // Determine the outcome based on the difference between endPoint and startPoint
  // relative to zero and the specified thresholdValue.

  if ( ( endPoint - startPoint ) < 0 ) {
    return "delicious" ; // Condition met for the first category.
  }
  else if ( ( endPoint - startPoint ) < thresholdValue )
  {
    return "safe" ; // Condition met for the second category.
  }
  else
  {
    return "dangerous" ; // Default outcome if other conditions are not met.
  }

}
; /* End of evaluateCondition function definition */

// Do not modify the following section. It handles standard input/output.
console.log(
  evaluateCondition(
    require( "fs" )
      .readFileSync( "/dev/stdin", "utf8" )
  )
)
; /* Script termination point */