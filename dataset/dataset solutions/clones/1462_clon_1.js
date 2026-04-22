/*
 * This JavaScript code snippet processes input to find commonalities
 * between two sets of numbers. This particular version is a Type I
 * clone, meaning it is exactly identical to the original source
 * except for variations in whitespace and comments.
 */

( function ( input ) {

  // Declare a variable 'p' to hold the processed input lines.
  // The entire input string is split by newline characters.
  var p = input . split ( '\n' ) ;


  // Extract the first number from the 'p' array.
  // This number 'n' typically represents the size of the first sequence.
  var n = Number ( p . shift ( ) ) ;

  // Process the next line: split it by spaces, then convert each part to a Number.
  // The 'n' parameter in split is technically redundant here if 'p' contains exactly 'n' elements,
  // but it's part of the original logic and must be preserved.
  var S = p . shift ( ) . split ( ' ' , n ) . map ( Number ) ;


  // Extract the second number from the 'p' array.
  // This number 'q' typically represents the size of the second sequence.
  var q = Number ( p . shift ( ) ) ;

  // Process the next line: split it by spaces, then convert each part to a Number.
  // Similar to 'S', 'q' acts as a limit for the split operation.
  var T = p . shift ( ) . split ( ' ' , q ) . map ( Number ) ;


  // Initialize a counter variable to keep track of matches.
  var count = 0 ;


  // Iterate over each element 'e' in the second sequence 'T'.
  T . forEach ( function ( e ) {

    // The 'in' operator checks if 'e' exists as a property key (index) in the array 'S'.
    // For example, if S = [10, 20, 30] and e = 1, then '1 in S' is true because S[1] exists.
    // If S = [10, 20, 30] and e = 10, then '10 in S' is false because there is no index 10.
    // This exact behavior is replicated as per Type I cloning rules.
    if ( e in S ) {

      // If 'e' is found as a valid index in 'S', increment the counter.
      count ++ ;
    }

  } ) ; // End of forEach loop.


  // Print the final count to the standard output.
  console . log ( count ) ;


} ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ; // Immediately-invoked function expression (IIFE) with file system input.