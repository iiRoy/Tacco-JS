"use strict"; /* This directive enforces stricter parsing and error handling. */

/*
 * Primary function to process an input string and compare
 * the character codes of its first two space-separated elements.
 */
function evaluateValues( sourceText ) {
  // Convert the input string into an array of numerical character codes.
  // Each space-separated segment is taken, and its first character's ASCII/Unicode value is used.
  const processedNumbers = sourceText
    .split( " " )
    .map( singleChar => singleChar.charCodeAt( 0 ) ); // Ensure charCodeAt(0) for clarity, though it's default.

  // Extract the first character code for comparison.
  const alphaCode = processedNumbers[ 0 ];

  // Extract the second character code for comparison.
  const betaCode = processedNumbers[ 1 ];

  // Perform a comparison of the extracted numerical values.
  if ( alphaCode === betaCode ) { // Strict equality check.
    console.log( "=" ); // Output indicating equality.
  } else if ( alphaCode > betaCode ) { // Check if the first value is greater.
    console.log( ">" ); // Output indicating the first is greater.
  } else { // Otherwise, the first value must be less than the second.
    console.log( "<" ); // Output indicating the first is lesser.
  }
}

// Invoke the main processing function with data read from standard input.
evaluateValues( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );