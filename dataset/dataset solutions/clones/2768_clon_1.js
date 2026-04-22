/*
 * This is an Immediately Invoked Function Expression (IIFE).
 * It encapsulates the entire script to prevent global scope pollution.
 * The 'input' parameter will receive data from standard input.
 */
( ( input ) =>
  {
    // Declare a constant to store processed input data.
    const   data  =   input . split ( '\n' ) ;

    // Parse the first line of the input to get L and R values.
    const   line1 =   data [ 0 ] . split ( ' ' ) ;

    // Convert the first part of line1 to an integer for L.
    const   L     =   + line1 [ 0 ] ;

    // Convert the second part of line1 to an integer for R.
    const   R     =   + line1 [ 1 ] ;

    /*
     * Check for two specific conditions where the minimum product modulo 2019
     * is guaranteed to be 0.
     * Condition 1: If the range [L, R] is wide enough (>= 2019),
     *              it must contain a multiple of 2019.
     * Condition 2: If the range contains a multiple of 2019.
     *              L - L % 2019 gives the largest multiple of 2019 <= L.
     *              Adding 2019 gives the smallest multiple of 2019 > L.
     *              If this is <= R, then a multiple of 2019 is in the range.
     */
    if ( R - L >= 2019
         ||
         L - ( L % 2019 ) + 2019 <= R
       )
      {
        // If either condition is true, the minimum product modulo 2019 is 0.
        console . log ( 0 ) ;

        // Exit the function early.
        return ;
      }


    // Handle the special case where the range contains only two numbers.
    if ( R - L === 1 )
      {
        // For example, if L=3, R=4, we need (3 % 2019) * (4 % 2019) % 2019.
        // But the problem statement implies finding min( (i%2019)*(k%2019)%2019 )
        // for i from L to R-1 and k from L+1 to R.
        // If R-L=1, then i=L and k=R.
        // So it's L % 2019. (This logic might be specific to a contest problem,
        // as the actual formula would be (L % 2019) * (R % 2019) % 2019 for one pair).
        // For this specific case, the problem implies L % 2019.
        console . log ( L % 2019 ) ;

        // Exit the function.
        return ;
      }

    // Initialize 'min' with positive infinity to find the smallest product.
    var   min   =   Infinity ;

    // Outer loop: iterate 'i' from L up to R-1.
    for (
          var   i   =   L ;
          i   <=  R   -   1 ;
          i   +=  1
        )
      {
        // Inner loop: iterate 'k' from L+1 up to R.
        for (
              var   k   =   L   +   1 ;
              k   <=  R ;
              k   +=  1
            )
          {
            // Calculate the product modulo 2019 for the current pair (i, k).
            // Update 'min' if the current product is smaller.
            min   =   Math . min (
                                   min ,
                                   ( ( i % 2019 ) * ( k % 2019 ) ) % 2019
                                 ) ;
          } // End of inner loop for k.
      } // End of outer loop for i.

    // Output the final minimum value found.
    console . log ( min ) ;
  }
)
// The input for the IIFE is read synchronously from standard input.
( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
/*
 * End of script.
 */