"use strict";
/*
 * This is an Immediately Invoked Function Expression (IIFE)
 * It takes the raw file content as input and processes it.
 * The entire script is encapsulated within this function.
 */
( function ( input ) {

  // --- Input Processing Section ---

  // First, remove any leading or trailing whitespace from the input string.
  // Then, split the string into an array of substrings using one or more whitespace characters as delimiters.
  // Finally, convert each substring in the array to a number.
  input = input . trim ( )
                . split ( / \s + / )
                . map ( x => x - 0 ) ; // The 'x - 0' trick converts string to number.

  // Extract the first element from the processed input array.
  // This value represents 'N', the total count of subsequent elements.
  const N = input . shift ( ) ;

  // Define two boolean constants, A and B.
  // A is true if N is perfectly divisible by 3.
  // B is true if the sum of squares of all remaining numbers in the input array is exactly zero.
  const A = ( N % 3 === 0 ) , /* Check for N's divisibility by 3 */
        B = ( ( input . reduce( ( a , c ) => a + c * c , 0 ) ) === 0 ) ; // Calculate sum of squares and check if it's zero.

  // --- Early Exit Conditions ---

  // If neither A nor B is true, then the condition is not met.
  // Output "No" and terminate the script.
  if ( ( ! A ) && ( ! B ) ) {
    console . log ( "No" ) ; // Output negative result.
    return ; // Exit the function.
  }

  // If B is true (meaning all remaining numbers are zero), then the condition is met.
  // Output "Yes" and terminate the script.
  if ( B ) {
    console . log ( "Yes" ) ; // Output positive result.
    return ; // Exit the function.
  }

  // --- Core Logic Initialization ---

  // Initialize an array to store unique values encountered.
  const values = [ ] ,
  // Initialize an array to store counts for each unique value.
  // This array is expected to hold up to 3 counts.
        counts = [ 0 , 0 , 0 ] ;

  // --- Main Loop for Processing Input Elements ---

  // Iterate through the input array from index 0 up to N-1.
  for ( let i = 0 ; i < N ; i ++ ) {
    // Get the current number of unique values stored in the 'values' array.
    let V = values . length ;

    // If more than 3 unique values are found, it's an invalid case.
    // Output "No" and exit.
    if ( V > 3 ) {
      console . log ( "No" ) ;
      return ;
    }

    // --- Inner Loop: Check for Existing Values ---

    // Iterate through the currently stored unique values.
    for ( let v = 0 ; v < V ; v ++ ) {
      // If the current input element matches an existing unique value,
      // increment its corresponding count.
      if ( input [ i ] === values [ v ] ) {
        counts [ v ] ++ ; // Increment count for this value.
        i ++ ;            // Move to the next input element.
        v = - 1 ;         // Reset 'v' to -1 to restart inner loop check for the *new* 'i'.
                          // This effectively breaks out of the inner loop and re-enters it with the next 'i'.
        continue ;        // Continue to the next iteration of the outer loop.
      }
    }

    // --- Add New Unique Value ---

    // If the element was not found in existing values (inner loop completed without a match),
    // add it as a new unique value.
    values . push ( input [ i ] ) ;

    // If the count for this newly added value (at index V) is still 0,
    // increment it to 1. This handles the first occurrence of a new value.
    if ( counts [ V ] === 0 )
      counts [ V ] ++ ; // Set count to 1 for the new value.
  }

  // --- Post-Loop Validation ---

  // After processing all N elements, check if the number of unique values exceeds 3.
  // If so, output "No" and exit.
  if ( values . length > 3 ) {
    console . log ( "No" ) ;
    return ;
  }

  // --- Define Additional Boolean Flags ---

  // C is true if all three counts are equal.
  // This implies counts[0] === counts[1] and counts[1] === counts[2].
  const C = ( ( counts [ 0 ] === counts [ 1 ] ) && ( counts [ 1 ] === counts [ 2 ] ) ) ;

  // E is true if the third count is zero, AND (count[0] is double count[1] OR count[1] is double count[0]).
  const E = ( ( counts [ 2 ] === 0 ) && ( ( counts [ 0 ] === ( 2 * counts [ 1 ] ) ) || ( counts [ 1 ] === ( 2 * counts [ 0 ] ) ) ) ) ;

  // --- Conditional Check for C and E ---

  // If neither C nor E is true, then the condition is not met.
  // Output "No" and terminate the script.
  if ( ( ! C ) && ( ! E ) ) {
    console . log ( "No" ) ;
    return ;
  }

  // --- Final Check: XOR Sum of Unique Values ---

  // D is true if the bitwise XOR sum of the first three unique values is zero.
  // This is a crucial condition for the problem.
  const D = ( ( values [ 0 ] ^ values [ 1 ] ^ values [ 2 ] ) === 0 ) ;

  // --- Final Output Decision ---

  // If D is false, output "No".
  if ( ! D ) {
    console . log ( "No" ) ;
    return ;
  } else {
    // Otherwise (if D is true), output "Yes".
    console . log ( "Yes" ) ;
    return ;
  }

} ) ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ; // Invoke the IIFE with standard input.