/*
 * This script processes input from standard input to find a specific sum.
 * It reads numbers, performs calculations, and outputs a maximum value.
 */

// Import the 'fs' module for file system operations.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ; // Read input from stdin

// Process the input string: trim whitespace and split into an array of lines.
var Arr = ( input . trim ( ) ) . split ( "\n" ) ;

// Main loop: Continues until a specific termination condition is met (n=0 and m=0).
while ( true )
{
    // Extract n and m values from the first line of the current input block.
    var nm = Arr . shift ( ) . split ( " " ) . map ( Number ) ;

    var n = nm [ 0 ] ; // First number: 'n'
    var m = nm [ 1 ] ; // Second number: 'm'

    // Check for the termination condition.
    if ( n == 0 && m == 0 )
    {
        break ; // Exit the loop if both n and m are zero.
    }

    // Initialize an array 'arr' to store numbers for the current test case.
    var arr = [ ] ;

    // Populate 'arr' with 'n' numbers from the input.
    for ( var i = 0 ; i < n ; i ++ )
    {
        arr . push ( Arr . shift ( ) - 0 ) ; // Convert string to number and add to arr.
    }

    arr . push ( 0 ) ; // Add an additional zero to the 'arr'.

    // Initialize an array 'Q' to store sums of pairs from 'arr'.
    var Q = [ ] ;

    // Generate all possible sums of two elements (including self-pairing) from 'arr'.
    for ( var i = 0 ; i < arr . length ; i ++ )
    {
        for ( var j = i ; j < arr . length ; j ++ )
        {
            Q . push ( arr [ i ] + arr [ j ] ) ; // Store the sum.
        }
    }

    // Sort the 'Q' array in ascending order.
    Q . sort ( function ( a , b ) { return a - b ; } ) ;

    var max = 0 ; // Initialize 'max' to store the maximum valid sum found.

    // Iterate through 'Q' to find the largest sum (Q[i] + Q[j]) that does not exceed 'm'.
    for ( var i = 0 ; i < Q . length ; i ++ )
    {
        for ( var j = i ; j < Q . length ; j ++ )
        {
            var sum = Q [ i ] + Q [ j ] ; // Calculate the current sum.

            // If the sum exceeds 'm', subsequent sums with Q[i] will also exceed 'm'
            // because 'Q' is sorted, so we can break the inner loop.
            if ( sum > m )
            {
                break ;
            }

            // Update 'max' if the current sum is greater.
            if ( max < sum )
            {
                max = sum ;
            }
        }
    }
    // Output the maximum sum found for the current test case.
    console . log ( max ) ;
}