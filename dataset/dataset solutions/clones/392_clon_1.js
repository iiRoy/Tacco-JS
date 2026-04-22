/*
 * This JavaScript code processes numerical input from standard input.
 * It reads a sequence of numbers, where each number 'n' signifies a test case.
 * A value of 0 for 'n' indicates the end of input.
 */

// Import the Node.js 'fs' (file system) module to read input.
var input = require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' ); // Read the entire input as a UTF-8 string.

/*
 * Process the raw input string:
 * 1. Trim any leading/trailing whitespace.
 * 2. Split the string by newline characters to get an array of string representations of numbers.
 * 3. Map each string element to its numerical equivalent.
 */
var arr = input . trim( ) . split( "\n" ) . map( Number ) ;

// The main processing loop continues indefinitely until a specific condition is met.
while ( true )
{
    // Extract the first number from the array, which represents 'n' for the current test case.
    var n = arr . shift( ) ;

    // If 'n' is 0, it signals the end of input, so break out of the loop.
    if ( n == 0 )
    {
        // This comment indicates the termination condition.
        break ;
    }

    /*
     * Initialize an array 'ary' of size 'n'.
     * This array will be used to mark certain indices as 'true'.
     */
    var ary = [ ] ;

    // Populate 'ary' with 'false' values initially.
    for ( var i = 0 ; i < n ; i++ )
    {
        ary [ i ] = false ;
    }

    // Mark positions in 'ary' corresponding to (i*i) % n as true.
    // The loop starts from 1, as 0*0 % n would always be 0, which might not be relevant for the problem.
    for ( var i = 1 ; i < n ; i++ )
    {
        ary [ i * i % n ] = true ; // Mark the calculated index as true.
    }

    // Create an array 'm' to store the indices that were marked as true in 'ary'.
    var m = [ ] ;

    // Iterate over 'ary' and collect all indices 'i' where 'ary[i]' is true.
    ary . forEach( function ( v , i )
    {
        // 'v' is the value (true/false), 'i' is the index.
        if ( v )
        {
            m . push( i ) ; // Add the index to array 'm'.
        }
    } ) ;

    // Initialize an array 'ans' to store the counts of differences.
    var ans = [ ] ;

    // Calculate 'len', which represents half of (n-1), effectively the maximum difference to consider.
    var len = ( n - 1 ) / 2 ;

    // Initialize 'ans' array with zeros up to 'len'.
    for ( var i = 0 ; i <= len ; i++ )
    {
        ans [ i ] = 0 ;
    }

    // Nested loops to calculate differences between elements in 'm'.
    for ( var i = 0 ; i < m . length ; i++ )
    {
        for ( var j = 0 ; j < m . length ; j++ )
        {
            // Skip if indices are the same to avoid self-subtraction.
            if ( i == j )
            {
                continue ;
            }

            // Calculate the difference 'x'.
            var x = m [ i ] - m [ j ] ;

            // Adjust 'x' to be positive if it's negative, by adding 'n'.
            if ( x < 0 )
            {
                x += n ;
            }

            // Adjust 'x' if it's greater than 'len', by subtracting 'n'.
            // This normalizes 'x' into the range [0, len].
            if ( len < x )
            {
                x -= n ;
            }

            // Increment the count for the calculated difference 'x' in 'ans'.
            ans [ x ] ++ ;
        }
    }

    // Remove the first element of 'ans' (ans[0]), as it corresponds to a difference of 0, which is typically ignored.
    ans . shift( ) ;

    // Iterate over the remaining elements in 'ans' and print each value multiplied by 2.
    ans . forEach( function ( v )
    {
        console . log( v * 2 ) ; // Output the result for each difference.
    } ) ;
}
// End of the main processing loop.