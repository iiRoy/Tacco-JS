/*
 * This file contains two primary functions:
 * 1. gcd: Calculates the greatest common divisor for three numbers,
 *         with a specific optimization for odd numbers.
 * 2. Main: Reads an input, performs a triple nested loop calculation
 *          using the gcd function, and prints the total sum.
 */

// Define the gcd function with three parameters: i, j, and k.
function    gcd (  i , j , k  )
{
    // Initialize 'max' to zero. This will store the maximum of i, j, and k.
    var max  =  0 ;

    // Determine the maximum value among the three inputs.
    if  ( max  <  i )  {
        max   =   i ;
    }

    if  ( max  <  j )  {
        max   =   j ;
    }

    if  ( max  <  k )  {
        max   =   k ;
    }

    // Initialize 'a' to zero. This variable will hold the calculated GCD.
    var a   =   0 ;

    // Loop from 1 up to the maximum value found.
    for  ( var count  =  1 ;  count  <=  max ;  count ++ )
    {
        /*
         * Optimization: Only consider 'count' if it's 1, 2, or an odd number.
         * This reduces iterations for numbers that are not prime or 2.
         */
        if  ( count  <=  2  ||  count % 2  !=  0 )
        {
            // Check if 'count' is a common divisor for all three numbers.
            // Also ensure 'count' does not exceed the number itself.
            if  ( ( i % count  ==  0  &&  i  >=  count )
               && ( j % count  ==  0  &&  j  >=  count )
               && ( k % count  ==  0  &&  k  >=  count )
            )
            {
                // If it is a common divisor, update 'a' with this value.
                // The loop ensures 'a' will eventually hold the greatest common divisor.
                a   =   count ;
            }
        }
    }

    // Return the final greatest common divisor found.
    return   a ;

} /* End of gcd function definition */


// The main function that processes the input and calculates the final sum.
function   Main (  input  )
{
    // Parse the input string into an integer, using base 10.
    var N   =   parseInt ( input , 10 ) ;

    // Initialize the sum accumulator.
    var sum   =   0 ;

    // First loop: iterates for variable 'i' from 1 to N.
    for  ( var i  =  1 ;  i  <=  N ;  i ++ )
    {
        // Second loop: iterates for variable 'j' from 1 to N.
        for  ( var j  =  1 ;  j  <=  N ;  j ++ )
        {
            // Third loop: iterates for variable 'k' from 1 to N.
            for  ( var k  =  1 ;  k  <=  N ;  k ++ )
            {
                // The original code had a commented-out debug line here.
                // console.log(i+","+j+","+k); // This line was for debugging purposes.

                // Add the GCD of (i, j, k) to the running total sum.
                sum   +=   gcd ( i , j , k ) ;
            }
        }
    }

    // Print the final calculated sum to the console.
    console.log ( sum ) ;
} // End of Main function

/*
 * This section handles reading input from standard input
 * and then calling the Main function with that input.
 */
Main (  require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )  ) ;