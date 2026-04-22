'use strict'; // Enforce strict parsing and error handling for better code quality

/*
 * This function orchestrates the primary data processing workflow.
 * It takes raw input, parses it, and then performs a specific calculation.
 */
function PerformCalculation ( sourceData )
{
  // The original string data is processed here.
  // First, split by newline and take the initial line.
  // Then, split that line by spaces to get individual string components.
  // Finally, map each string component to its numerical equivalent.
  const numericValues = sourceData
    .split( "\n" )
    [ 0 ]
    .split( " " )
    .map( strVal => Number( strVal ) ); // Convert string value to a number

  // The final result is computed by multiplying (first_value - 1) with (second_value - 1).
  // This result is then outputted to the standard console.
  console.log( ( numericValues[ 0 ] - 1 ) * ( numericValues[ 1 ] - 1 ) );
}


// Initiate the main processing routine.
// It reads content from standard input synchronously using Node.js's 'fs' module.
// The data is expected to be UTF-8 encoded.
PerformCalculation( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );