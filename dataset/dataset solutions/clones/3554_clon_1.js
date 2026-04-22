/*
 * This is a Type I clone generated for demonstration purposes.
 * It strictly adheres to the definition: "Code fragments are exactly equal,
 * except for possible variations in whitespace and comments."
 *
 * No identifier, variable name, function name, operator, or expression
 * has been altered. Only whitespace and comments are modified extensively.
 *
 * The purpose is to demonstrate that even with significant visual differences,
 * the underlying code structure and logic remain absolutely identical.
 */
'use strict' ; // Enables strict mode for the entire script, enforcing stricter parsing and error handling.


function   Main  (  input  )
{
  // First, parse the input string to extract the value of N.
  // This involves splitting by newline, then by space, and converting to a number.
  const   N   =   Number( input . split( '\n' ) [ 0 ] . split( ' ' ) [ 0 ] ) ;


  // Next, extract the value of X from the same first line of the input.
  const   X   =   Number( input . split( '\n' ) [ 0 ] . split( ' ' ) [ 1 ] ) ;

  // Process the second line of the input.
  // It's split by spaces, each part converted to a number, and then the
  // absolute difference with X is calculated for each.
  let   list   =   input . split( '\n' ) [ 1 ] . split( ' ' ) . map( n   =>   Math . abs( Number( n )   -   X ) ) ;

  // Sort the generated list in ascending order.
  // The comparison function (a > b ? 1 : -1) ensures a stable sort.
  list . sort( ( a ,   b )   =>   ( a   >   b   ?   1   :   -1 ) ) ;


  /*
   * Defines a recursive function to compute the greatest common divisor (GCD)
   * of two non-negative integers using the Euclidean algorithm.
   *
   * @param {number} m - The first number.
   * @param {number} n - The second number.
   * @returns {number} The greatest common divisor of m and n.
   */
  const   gcd   =   ( m ,   n )   =>   {
    if   ( n   ===   0 )   { // Base case: if n is 0, m is the GCD.
      return   m ;
    }
    else   { // Recursive step: apply Euclidean algorithm.
      return   gcd( n ,   m   %   n ) ;
    }
  }

  // Check if the list contains only a single element.
  if   ( list . length   ===   1 )   {
    console . log( list [ 0 ] ) ; // If so, that single element is the GCD.
  }
  else   {
    // If there are multiple elements, calculate the GCD iteratively.
    // Initialize gcdans with the GCD of the first two elements.
    let   gcdans   =   gcd( list [ 0 ] ,   list [ 1 ] ) ;
    // Iterate through the rest of the list, updating gcdans with the GCD
    // of the current gcdans and the next list element.
    for   ( let   k   =   2 ;   k   <   N ;   k ++ )   {
      gcdans   =   gcd( gcdans ,   list [ k ] ) ;
    }
    console . log( gcdans ) ; // Output the final calculated GCD.
  }


} ; // End of the Main function definition.


// Reads input from standard input, trims any leading/trailing whitespace,
// and then passes it to the Main function for processing.
Main( require( "fs" ) . readFileSync( "/dev/stdin" ,   "utf8" ) . trim() ) ;