function main( input )
{
  // This is the main function that processes the input string.
  // It parses numerical values and performs calculations.

  // Parse the first line of input to get the value of N.
  const N = parseInt( input.split( "\n" ) [ 0 ] , 10 ) ;

  /*
   * Extract the second line of input, split it by spaces,
   * and convert each part to an integer to form array arrA.
   */
  const arrA = input.split( '\n' ) [ 1 ] . split ( ' ' ) . map ( ( n ) => parseInt ( n , 10 ) ) ;

  // Similarly, extract the third line for array arrB.
  const arrB = input.split ( '\n' ) [ 2 ] . split ( ' ' ) . map ( ( n ) => parseInt ( n , 10 ) ) ;

  // Initialize an empty array arrN. This will store calculated values.
  var arrN = [ ] ;

  // Initialize an empty array nokoriB. This will store 'remaining B' values.
  var nokoriB = [ ] ;


  // Loop from 0 up to N (inclusive), so N+1 iterations.
  for ( var i = 0 ; i < N + 1 ; i ++ )
  {
    // Special handling for the first iteration (i == 0).
    if ( i == 0 )
    {
      // If arrA[0] is greater than or equal to arrB[0]
      if ( arrA [ i ] >= arrB [ i ] )
      {
        // Set arrN[0] to arrB[0].
        arrN [ i ] = arrB [ i ] ;
        // No remainder from B.
        nokoriB [ i ] = 0 ;
      }
      else
      {
        // If arrA[0] is less than arrB[0]
        // Set arrN[0] to arrA[0].
        arrN [ i ] = arrA [ i ] ;
        // Calculate the remainder of B.
        nokoriB [ i ] = arrB [ i ] - arrA [ i ] ;
      }
    }
    // For subsequent iterations (i > 0).
    else
    {
      // Check a condition involving arrA[i], arrB[i], and the previous nokoriB.
      if ( arrA [ i ] - nokoriB [ i - 1 ] >= arrB [ i ] )
      {
        // If the condition is met, calculate arrN[i].
        arrN [ i ] = nokoriB [ i - 1 ] + arrB [ i ] ;
        // No remainder for nokoriB[i].
        nokoriB [ i ] = 0 ;
      }
      else
      {
        // If the condition is not met.
        // Set arrN[i] to arrA[i].
        arrN [ i ] = arrA [ i ] ;
        // Calculate the remainder for nokoriB[i] based on the difference.
        nokoriB [ i ] = arrB [ i ] - ( arrA [ i ] - nokoriB [ i - 1 ] ) ;
      }
    }
  }


  /*
   * Define a helper function to calculate the sum of elements in an array.
   * This is a function expression assigned to the 'sum' variable.
   */
  var sum = function ( arr )
  {
    // Initialize sum accumulator.
    var sum = 0 ;
    // Iterate through the array elements.
    for ( var i = 0 ; i < arr . length ; i ++ )
    {
      // Add each element to the sum.
      sum += arr [ i ] ;
    } ;
    // Return the total sum.
    return sum ;
  } ;

  // Output the sum of the elements in the arrN array to the console.
  console . log ( sum ( arrN ) ) ;
}

// Read input from standard input, decode it as UTF-8, and pass it to the main function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;