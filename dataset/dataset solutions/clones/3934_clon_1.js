/*
 *  This is a Type I clone of the original JavaScript code.
 *  All identifiers, variable names, function names, operators, and expressions
 *  are kept exactly the same.
 *  Only whitespace and comments have been altered significantly
 *  to provide a visually distinct yet logically identical code fragment.
 */
function Main( input )
{
  // The primary function to process the input data
  const N = parseInt( input ) ; // Parse the input string into an integer N

  /*
   * Initialize an empty array 'a' which will store numbers
   * based on the value of N and various conditions.
   */
  var a = [ ] ;


  // Check for invalid input range for N
  if ( N < 3 || N > 20000 )
  {
    // If N is outside the valid range [3, 20000], print an error message.
    console.log( "しね" ) ; // Output the error message.
    // The program would typically terminate here or handle the error.
  }
  else
  {
    // If N is within the valid range, proceed with array population.

    a [ 0 ] = 3 ; // Set the first element of array 'a' to 3.
    a [ 1 ] = 9 ; // Set the second element of array 'a' to 9.

    // --- Section for N values in the range 3 <= N <= 10003 ---
    // This loop populates 'a' for a specific range of indices.
    for ( var i = 2 ; i < N && i < 10002 ; i ++ )
    {
      /*
       * Calculate the value for a[i] using the formula:
       * i * 3 - 4 - (i % 2)
       * This formula generates a sequence of numbers,
       * effectively placing pairs of even numbers around multiples of 3.
       */
      a [ i ] = i * 3 - 4 - i % 2 ;
    } // End of the first population loop.


    // --- Section for N values in the range 10004 <= N <= 15001 ---
    // This loop continues populating 'a' from index 10002 up to N or 15000.
    for ( i = 10002 ; i < N && i < 15000 ; i ++ )
    {
      /*
       * Calculate the value for a[i] using the formula:
       * (i - 10000) * 6 + 3
       * This generates pairs of odd multiples of 3.
       */
      a [ i ] = ( i - 10000 ) * 6 + 3 ;
    } // End of the second population loop.


    // Conditional adjustments based on the value of N.
    if ( N == 3 )
    {
      // Special case: if N is exactly 3, modify a[1].
      a [ 1 ] = 25 ; // Change a[1] from 9 to 25.
      // The intended sequence for N=3 becomes 3, 25, then the next value (which would be a[2] if it existed from the loop).
      // The original comment implies 3, 25, 2 but a[2] is not explicitly set to 2 here.
    }
    else if ( N % 2 == 1 || N < 15000 )
    {
      // If N is an odd number (and not 3), or if N is less than 15000,
      // the last element of the array 'a' is set to 6.
      a [ N - 1 ] = 6 ; // Modify the last element of 'a'.
    }


    // --- Section for N values in the range 15002 <= N <= 20000 ---
    // This loop populates 'a' for indices starting from 15000 up to N.
    for ( i = 15000 ; i < N ; i ++ )
    {
      /*
       * Calculate the value for a[i] using the formula:
       * (i - 14999) * 6
       * This sequence generates multiples of 6.
       */
      a [ i ] = ( i - 14999 ) * 6 ;
    } // End of the third population loop.


    // Sort the array 'a' in ascending order.
    a . sort (
      function ( p , q ) {
        // Custom comparison function for ascending order.
        return ( p < q ? -1 : 1 ) ; // Returns -1 if p comes before q, 1 otherwise.
      }
    ) ; // The array 'a' is now sorted.


    // Output the sorted array elements, joined by a space.
    console . log ( a . join ( " " ) ) ;
  }
} // End of the Main function definition.


// Call the Main function with input read from standard input.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;