/*
 * This is a Type I clone of the original JavaScript code.
 *
 * All identifiers, variable names, function names, operators, and expressions
 * remain exactly the same as in the original source.
 *
 * Only whitespace (indentation, line breaks, spacing) and comments have been
 * modified to create a visually distinct, yet functionally identical, version.
 */
"use strict"
; /* Enable strict mode for cleaner code and fewer errors */

( function ( input ) {

  // Process the input string: trim, split by whitespace, and convert to numbers.
  input = input . trim ( ) . split ( / \s + / ) . map ( x => x - 0 ) ;

  // Extract the first number, which represents N.
  const N = input . shift ( ) ;

  // Calculate conditions A and B.
  // A is true if N is divisible by 3.
  const A = ( N % 3 === 0 ) ,
        // B is true if the sum of squares of the remaining numbers is 0.
        B = ( ( input . reduce ( ( a , c ) => a + c * c , 0 ) ) === 0 ) ;

  // Check initial conditions and output "No" if both A and B are false.
  if ( ( ! A ) && ( ! B ) )
  {
    console . log ( "No" ) ; // Output "No"
    return ; // Exit the function
  }

  // If condition B is true, output "Yes" and exit.
  if ( B )
  {
    console . log ( "Yes" ) ; // Output "Yes"
    return ; // Exit the function
  }

  // Initialize arrays for storing unique values and their counts.
  const values = [ ] ,
        counts = [ 0 , 0 , 0 ] ;

  // Iterate through the remaining numbers in the input array.
  for ( let i = 0 ; i < N ; i ++ )
  {
    // Get the current number of unique values found so far.
    let V = values . length ;

    // If more than 3 unique values are found, output "No" and exit.
    if ( V > 3 )
    {
      console . log ( "No" ) ; // Output "No"
      return ; // Exit the function
    }

    // Check if the current input number already exists in 'values'.
    for ( let v = 0 ; v < V ; v ++ )
    {
      if ( input [ i ] === values [ v ] )
      {
        counts [ v ] ++ ; // Increment the count for the existing value.
        i ++ ;           // Move to the next input number.
        v = - 1 ;        // Reset 'v' to re-check from the beginning of 'values' array.
        continue ;       // Continue to the next iteration of the outer loop.
      }
    }
    // If the number was not found (or after processing a match), add it as a new unique value.
    values . push ( input [ i ] ) ;

    // If this is a new unique value and its count is 0, initialize its count to 1.
    if ( counts [ V ] === 0 )
    {
      counts [ V ] ++ ;
    }
  }

  // After processing all numbers, check if the counts of the three unique values are equal.
  if ( counts [ 0 ] === counts [ 1 ] && counts [ 1 ] === counts [ 2 ] )
  {
    console . log ( "Yes" ) ; // If counts are equal, output "Yes".
  }
  else
  {
    console . log ( "No" ) ; // Otherwise, output "No".
  }

} ) ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ; // Read input from stdin.