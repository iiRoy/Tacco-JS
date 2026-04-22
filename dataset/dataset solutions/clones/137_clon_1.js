/*
 *  This JavaScript file contains an immediately invoked function expression (IIFE)
 *  that processes input data, along with a helper function 'cross'.
 *  The primary goal is to demonstrate a Type I code clone,
 *  meaning only whitespace and comments are altered.
 */

( function ( input ) /* Start of the main processing block */
{
        // First, prepare the input string for parsing.
        // It removes a potential trailing newline character, then splits the string into an array of lines.
    var p = input . replace ( /\n$/, '' ) . split ( '\n' ) ;

        // 'n' will store the total number of lines to be processed.
    var n   = p . length ;


        // Begin iterating through each line of the prepared input 'p'.
    for ( var i = 0 ; i < n ; i++ )
    {
            // For each iteration, remove the first element from 'p' (which is a line string),
            // split it by commas, and convert each part into a number.
        var a = p . shift ( ) . split ( ',' ) . map ( Number ) ;

            // Extract the last two numerical values from the 'a' array.
            // Note: .pop() removes and returns the last element.
        var v2 = a . pop ( ) ;
        var v1 = a . pop ( ) ;

            // Call the 'cross' function with the remaining part of 'a', v1, and v2,
            // then print the result to the console.
        console . log ( cross ( a , v1 , v2 ) ) ;
    }
} ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ; // IIFE invocation: reads from standard input.


/*
 *  Function: cross
 *  Purpose:  Performs a specific calculation based on an array and two scalar values.
 *  Parameters:
 *    - a: An array of numbers.
 *    - v1: A numeric scalar.
 *    - v2: Another numeric scalar.
 *  Returns: A calculated numeric value.
 */
function cross ( a , v1 , v2 )
{
    // Initialize an empty array 'l'. This array will store cumulative sums.
  var l = [ ] ;

    // Loop through the input array 'a' to compute cumulative sums.
  for ( var i = 0 ; i < a . length ; i++ )
  {
        // Assign the current element of 'a' to the corresponding position in 'l'.
    l [ i ] = a [ i ] ;

        // If it's not the first element (i.e., 'i' is greater than 0),
        // add the previous cumulative sum from 'l' to the current element.
    if ( i > 0 )
    {
      l [ i ] += l [ i - 1 ] ; // Cumulative sum calculation.
    }
  }

    // Calculate 'x' using the last element of the cumulative sum array 'l', and v1, v2.
    // This involves multiplication and division.
  var x = l [ l . length - 1 ] * v1 / ( v1 + v2 ) ;

    // The following line was previously used for debugging. It is now intentionally commented out.
    // console . log ( l , x ) ; // Debugging line: shows the cumulative sums and the calculated 'x'.

    // Initialize a counter 'c' to 1. This value will be updated based on conditions.
  var c = 1 ;

    // Iterate through the cumulative sums in 'l' to determine the final value of 'c'.
  for ( i = 0 ; i < l . length ; i++ )
  {
        // If 'x' is greater than the current cumulative sum 'l[i]',
        // update 'c' and continue to the next iteration.
    if ( x > l [ i ] )
    {
      c = i + 2 ; // Update 'c' based on current index.
      continue ; // Proceed to the next element in 'l'.
    }
        // If 'x' is NOT greater than 'l[i]', then 'c' has been determined,
        // so return its current value.
    return c ;
  }
}