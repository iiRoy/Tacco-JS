'use strict'; /* Strict mode enabled for cleaner code. */
( function ( rawInput ) {

  // Splits the entire input string into an array of lines.
  const strFragments = rawInput.split( '\n' ) ;

  /*
   * Parses the first line of the input into an array of numbers.
   * This array is stored for potential later use, though it's re-parsed
   * for the actual sorting operation.
   */
  let initialNumbers = strFragments[ 0 ] .split( ' ' ) .map( Number ) ;

  // An immediately invoked function expression (IIFE) to process and sort numbers.
  const finalSequence = ( function ( numberCollection ) {

    // Sorts the numerical elements in ascending order.
    return numberCollection .sort( function ( val1, val2 ) {
               return val1 - val2 ; // Standard numerical comparison.
             } )
             // Joins the sorted numbers back into a single space-separated string.
             .join( ' ' ) ;

  } ( strFragments[ 0 ] .split( ' ' ) .map( Number ) ) ) ; // The first line is re-parsed for sorting.

  // Outputs the resulting sorted string to the console.
  console .log( finalSequence ) ;

} ( require( 'fs' ) .readFileSync( '/dev/stdin', 'utf8' ) ) ) ; // Reads content from standard input synchronously.