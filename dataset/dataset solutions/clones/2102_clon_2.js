function ProcessInput ( rawData ) {

  "use strict" /* Enforce stricter parsing and error handling for better code quality. */

  // Split the raw string by newline, take the first line, then split by space.
  const   partsArray  =    rawData.split ( "\n" ) [0] .split( " " ) ;

  // Extract and parse the first two integer values from the array.
  const valX   = parseInt( partsArray.shift() ) ;
  const valY   = parseInt( partsArray.shift() ) ;

  /* Calculate the lower and upper bounds for the first value (valX). */
  const xLowerBound = Math.ceil(valX * 12.5);
  const xUpperBound = Math.ceil( valX * 12.5 + 11.5 );

  // Determine the lower and upper bounds for the second value (valY).
  const yLowerBound = Math.ceil(valY * 10);
  const yUpperBound = Math.ceil(valY * 10 + 9);
  
  // Check for overlap between the two ranges.
  if ( xUpperBound < yLowerBound || yUpperBound < xLowerBound ) {
    console.log( -1 ); // If no overlap, output -1.
  }
  else {
    // Otherwise, output the maximum of the lower bounds.
    console.log( Math.max( xLowerBound, yLowerBound ) );
  }
}

// Ensure the processing function is called with standard input.
ProcessInput ( require( "fs" ) .readFileSync( "/dev/stdin", "utf8" ) ) ;