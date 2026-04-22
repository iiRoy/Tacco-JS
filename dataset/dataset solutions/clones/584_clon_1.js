/*
 * This is a Type I clone of an original JavaScript program.
 * It processes input data to find a specific maximum sum.
 * All identifiers, operators, and expressions are preserved exactly.
 * Only whitespace and comments have been altered significantly.
 */

var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;
// The input is read from standard input as a UTF-8 string.

var Arr = ( input . trim ( ) ) . split ( "\n" ) ; // Trim whitespace and split by newline to get an array of lines.


while ( true )
{
    // Begin processing a new test case.
    var nm = Arr . shift ( ) . split ( " " ) . map ( Number ) ;

    var n = nm [ 0 ] ; // The first number in the line.
    var m = nm [ 1 ] ; // The second number in the line.

    // Check for termination condition: n=0 and m=0.
    if ( n == 0 && m == 0 )
    {
        break ; // Exit the infinite loop if the termination condition is met.
    }


    var arr = [ ] ; // Initialize an empty array to store 'n' numbers.

    // Populate 'arr' with 'n' numbers from the input array.
    for ( var i = 0 ; i < n ; i ++ )
    {
        arr . push ( Arr . shift ( ) - 0 ) ; // Convert the string to a number by subtracting zero.
    }

    arr . push ( 0 ) ; // Add a zero to the end of the array, as per problem logic.


    var Q = [ ] ; // Initialize an empty array to store sums of pairs.

    // Generate all possible sums of pairs from 'arr' that do not exceed 'm'.
    for ( var i = 0 ; i < arr . length ; i ++ )
    {
        for ( var j = i ; j < arr . length ; j ++ )
        {
            // Check if the current sum exceeds 'm'.
            if ( arr [ i ] + arr [ j ] > m )
            {
                continue ; // Skip this pair if the sum is too large.
            }

            Q . push ( arr [ i ] + arr [ j ] ) ; // Add the valid sum to array Q.
        }
    }


    // Sort the array Q in ascending order to facilitate the two-pointer approach.
    Q . sort ( function ( a , b ) { return a - b ; } ) ;


    var max = 0 ; // Initialize the maximum sum found so far to 0.
    var k   = Q . length - 1 ; // Initialize the right pointer for the two-pointer technique.

    // Use a two-pointer approach to find the maximum sum of two elements from Q that is <= m.
    for ( var i = 0 ; i < Q . length ; i ++ )
    {
        while ( Q [ i ] + Q [ k ] > m )
        {
            k -- ; // If the sum is too large, decrement the right pointer.
        }

        // Update the maximum sum found.
        max = Math . max ( max , Q [ i ] + Q [ k ] ) ;
    }

    console . log ( max ) ; // Output the maximum sum for the current test case.

} // End of the main processing loop.

/*
 * End of the Type I clone.
 * This code should behave identically to the original.
 */