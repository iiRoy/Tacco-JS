"use strict" ; /* This directive enforces strict mode parsing and execution, preventing certain actions and throwing more errors. */

( function ( input ) {

  /* The input string is first processed to remove any leading or trailing whitespace characters. */
  input = input . trim ( ) ;

  /* Next, the cleaned input string is split into an array of strings based on one or more newline characters. */
  input = input . split ( / \n + / ) ;

  /*
   * Here, we declare two constants:
   * N: The first element of the input array (after conversion to a number).
   * A: An array of numbers derived from the second element of the input array,
   *    split by whitespace and each part converted to a number.
   */
  const N = input [ 0 ] - 0
        , A = input [ 1 ] . split ( / \s + / ) . map ( x => x - 0 ) ;

  // Initialize a variable 'last' with the value of the last element in array A.
  let last = A [ N - 1 ] ;

  /*
   * This loop iterates a specific number of times,
   * performing arithmetic operations on 'last' using elements from array A.
   * The loop condition ensures it runs for approximately half the elements (excluding the last one).
   */
  for ( let i = 0 ; i < ( N - 1 ) / 2 ; i ++ )
  {
    last -= A [ 2 * i ] ; // Subtract an element
    last += A [ 2 * i + 1 ] ; // Then add the next element
  }

  // Declare a constant array to store parts of the final answer in reverse order, starting with 'last'.
  const ansReversed = [ last ] ;

  /*
   * This loop iterates backwards from N-2 down to 0.
   * In each iteration, it calculates a new value based on an element from A
   * and the most recently added element to 'ansReversed', then pushes this new value.
   */
  for ( let i = N - 2 ; i >= 0 ; i -- )
  {
    ansReversed . push ( 2 * A [ i ] - ansReversed [ ansReversed . length - 1 ] ) ;
  }

  // Create the final answer array by reversing the 'ansReversed' array.
  const ans = ansReversed . reverse ( ) ;

  // Output the elements of the 'ans' array, joined by a single space, to the console.
  console . log ( ans . join ( " " ) ) ;

} ) (
  // The IIFE is immediately invoked with the content of standard input.
  require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )
) ;