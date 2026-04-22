/*
 * This JavaScript file processes numerical input.
 * It reads integers from standard input, sorts them,
 * and then computes a specific value based on these numbers.
 * The calculation involves summing parts of the sorted array
 * with specific multipliers and conditional adjustments.
 */

// Primary execution block: Reads input from stdin,
// passes it to the 'main' function, and logs the returned result.
console.log( main( require("fs").readFileSync( "/dev/stdin", "utf8" ) ) );


/**
 * The central function that performs all the necessary computations.
 * It takes a raw string input, parses it, sorts the numbers,
 * and then applies a series of calculations to derive the final answer.
 *
 * @param   {string}  inp  - The raw string content read from standard input.
 * @returns {number}       - The calculated numerical result.
 */
function   main (  inp  )
{
  // First, process the input string:
  // - Split it by newline characters to get individual lines.
  // - Use map to convert each line (string) into a number.
  inp   =   inp.split( "\n" ) .  map(  a  =>  +a  ) ;

  // The first element of the processed input array 'inp'
  // represents the count of subsequent numbers, stored in 'n'.
  var n  =  inp[0] ;

  // Initialize an empty array 's' which will store the actual numbers
  // to be processed, excluding the initial count 'n'.
  var s  =  [] ;

  // Populate the 's' array:
  // Iterate from 0 up to 'n' (exclusive).
  // Each element of 's' corresponds to an element in 'inp'
  // starting from the second position (index 1).
  for  ( var i  =  0 ;  i  <  n ;  i++ )
  {
    s[i]  =  inp[i + 1] ;
  }

  // Sort the 's' array in ascending numerical order.
  // This is a crucial step for the subsequent calculations.
  s.sort( ( a, b ) => a - b ) ;


  // Initialize the 'ans' variable, which will accumulate the final result.
  var ans  =  0 ;

  // Calculate 'm', which represents the approximate middle index
  // of the 's' array. It uses a bitwise right shift for integer division.
  var m  =  ( n  +  1 )  >>  1 ;

  // First phase of calculation:
  // Iterate through the first half of the sorted array 's' (up to 'm').
  // For each element in this range, subtract its value multiplied by 2 from 'ans'.
  for  ( i  =  0 ;  i  <  m ;  i++ )
  {
    ans  -=  s[i]  *  2 ;
  }

  // Second phase of calculation:
  // Continue iterating from the current value of 'i' (which is 'm')
  // up to 'n' (exclusive), covering the second half of the array.
  // For each element in this range, add its value multiplied by 2 to 'ans'.
  for  ( ;  i  <  n ;  i++ )
  {
    ans  +=  s[i]  *  2 ;
  }


  // Final adjustments to 'ans' based on the parity of 'n'
  // and specific conditions involving elements around the middle index.

  // Case 1: If 'n' is an even number.
  if  ( n  %  2  ===  0 )
  {
    // Apply a specific adjustment and return the result immediately.
    return  ans  -  s[m]  +  s[m - 1] ;
  }

  // Case 2: If 'n' is an odd number.
  // Evaluate a condition involving elements 's[m-1]', 's[m-2]', and 's[m]'.
  if  ( s[m - 1]  +  s[m - 2]  >  s[m - 1]  *  3  -  s[m] )
  {
    // If the condition is true, apply this specific adjustment.
    return  ans  +  s[m - 1]  +  s[m - 2] ;
  }
  else
  {
    // Otherwise (if the condition is false), apply this alternative adjustment.
    return  ans  +  s[m - 1]  *  3  -  s[m] ;
  }
}