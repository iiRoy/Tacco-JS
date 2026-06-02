'use strict';
( function ( rawData ) {
  // Process the raw input string
  // Trim whitespace, split by spaces, and convert each part to a number
  rawData = rawData.trim().split( /\s+/ ).map( ( parsedVal ) => parsedVal - 0 );

  // Extract the two key values from the processed input array
  const spanLength = rawData[ 0 ]; // Represents K from the original
  const midPoint = rawData[ 1 ];   // Represents X from the original

  // Initialize an array to store the generated sequence of numbers
  const outputNumbers = [];

  // Iterate to generate numbers within the specified range
  // The range is from (midPoint - spanLength + 1) to (midPoint + spanLength - 1)
  for ( let currentNumber = midPoint - spanLength + 1; currentNumber <= midPoint + spanLength - 1; currentNumber++ ) {
    // Add each generated number to our collection
    outputNumbers.push( currentNumber );
  }

  // Print the collected numbers, joined by a single space
  console.log( outputNumbers.join( ' ' ) );

} )( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );
