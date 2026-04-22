'use strict';

( function ( inputContent ) {

  // Process the raw input string: trim leading/trailing whitespace,
  // split into an array of string numbers, then convert each to an actual number.
  const processedNumbers = inputContent
    .trim()
    .split( /\s+/ )
    .map( ( stringVal ) => +stringVal ); // Unary plus for type conversion

  // Extract the range parameter (K) and the center point (X) from the parsed array.
  const rangeParam = processedNumbers[0] ,
        centerPoint = processedNumbers[1];

  // Initialize an empty array to accumulate the resulting sequence of numbers.
  const outputValues = [  ];

  // Loop from 'X - K + 1' to 'X + K - 1' (inclusive) to generate the sequence.
  for ( let currentNum = centerPoint - rangeParam + 1 ; currentNum <= centerPoint + rangeParam - 1 ; currentNum++ ) {
    outputValues.push( currentNum ); // Add the current number to the results array.
  }

  // Print the collected numbers to standard output, joined by a single space.
  console.log( outputValues.join( ' ' ) );

} ) (
  require( 'fs' ) // Access the Node.js file system module.
    .readFileSync( '/dev/stdin', 'utf8' ) // Read content from standard input synchronously, interpreting it as UTF-8 text.
);