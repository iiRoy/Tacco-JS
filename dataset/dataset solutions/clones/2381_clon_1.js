/*
 * This is a Type I clone of the original JavaScript code.
 * It has been extensively modified with whitespace and comments
 * to appear visually different, while maintaining exact structural
 * and logical equivalence to the original.
 */

function Main ( input )
{
    // Process the input string: trim, split by newline, then split each line by space.
    input = input
            .trim()
            .split( "\n" )
            .map( function ( x )
            {
                /* Each element 'x' (a line from input) is further
                 * split into an array of strings based on spaces. */
                return x.split( " " )
            } ) ;

    /*
     * Parse integer values from the processed input array.
     * These represent various parameters for calculations.
     */
    let T1 = parseInt( input[ 0 ][ 0 ], 10 ) ; // First value from the first line
    let T2 = parseInt( input[ 0 ][ 1 ], 10 ) ; // Second value from the first line

    let A1 = parseInt( input[ 1 ][ 0 ], 10 ) ; // First value from the second line
    let A2 = parseInt( input[ 1 ][ 1 ], 10 ) ; // Second value from the second line

    let B1 = parseInt( input[ 2 ][ 0 ], 10 ) ; // First value from the third line
    let B2 = parseInt( input[ 2 ][ 1 ], 10 ) ; // Second value from the third line


    // Calculate initial differences using BigInt for precision
    let d1 = BigInt( A1 - B1 ) * BigInt( T1 ) ; // Difference for T1 period
    let d2 = BigInt( A2 - B2 ) * BigInt( T2 ) + d1 ; // Cumulative difference after T2 period


    let ans = 0n ; // Initialize answer as a BigInt zero
    let tmp ;      // Temporary variable for intermediate calculations

    /*
     * Conditional logic to determine the final answer based on 'd2' and 'd1'.
     */
    if ( d2 === 0n ) // If d2 is exactly zero BigInt
    {
        // In this specific case, the answer is 'infinity' as per problem logic
        ans = 'infinity' ;
    }
    else if ( d1 * d2 < 0n ) // If d1 and d2 have opposite signs (their product is negative)
    {
        /*
         * Adjust d2 to be positive for the calculation, effectively
         * handling the absolute difference in one direction.
         */
        d2 = d2 * -1n ;
        tmp = ( d1 / d2 ) ; // Calculate integer division

        /*
         * Determine 'ans' based on whether d1 is perfectly divisible by the adjusted d2.
         * This often relates to finding the number of steps or cycles.
         */
        ans = ( tmp * d2 === d1 ) ? tmp * 2n : tmp * 2n + 1n ;
    }
    else // If d2 is not zero and d1 * d2 is not negative (i.e., d1 * d2 >= 0n)
    {
        // Default case: answer remains 0 (or 0n, depending on problem context)
        ans = 0 ;
    }

    // Output the final answer, converted to its string representation.
    console.log( ans.toString( ) ) ;
}


// Call the Main function with input read from standard input.
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;