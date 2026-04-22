/* This is the strict mode directive. It helps catch common coding errors and "unsafe" actions. */
"use strict";


// Main function definition. This is the entry point for processing the input.
function main( input )
{
  // Process the raw input string: trim whitespace, then split into an array of lines.
  input = input . trim ( ) . split ( "\n" ) ;


  // The first line of input (index 0) contains the value N. Convert it to a number.
  const N = Number ( input [ 0 ] ) ;

  // The second line of input (index 1) contains space-separated values. Split them into an array.
  const line2_arr = input [ 1 ] . split ( " " ) ;

  // Initialize the answer variable. This will accumulate the total difference.
  let ans = 0 ;

  // Loop through the array from the first element up to the second-to-last element.
  // The loop iterates N-1 times to compare each element with its successor.
  for ( let i = 0 ; i < N - 1 ; i ++ )
  {
    // Check if the current number is greater than the next number.
    // Both numbers are converted from string to Number for comparison.
    if ( Number ( line2_arr [ i ] ) > Number ( line2_arr [ i + 1 ] ) )
    {
      // If the current number is greater, calculate the difference and add it to the total answer.
      ans += Number ( line2_arr [ i ] ) - Number ( line2_arr [ i + 1 ] ) ;

      // To make the array non-decreasing, set the next element's value to the current element's value.
      // This ensures that the difference is only counted once for this pair.
      line2_arr [ i + 1 ] = line2_arr [ i ] ;
    }
  }
  // After the loop, print the final accumulated answer to the console.
  console . log ( ans ) ;
}


/*
 * This function sorts an array of numbers in ascending order.
 * It uses a custom comparison function 'f'.
 */
function numberSort ( array )
{
  // The sort method of arrays sorts elements in place.
  array . sort ( f ) ;
  // Return the modified array.
  return array ;
}

// Global variable 'f' defined as an anonymous function.
// This function is a standard comparison function for ascending numerical sort.
var f = function ( a , b )
{
  // Returns a negative value if a < b, zero if a == b, and a positive value if a > b.
  return a - b ;
} ;

// Main execution block.
// Reads input from standard input, then calls the main function with that input.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf-8" ) ) ;