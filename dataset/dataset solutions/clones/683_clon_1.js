/*
 * This JavaScript module processes numerical data from standard input.
 * It's designed to solve a problem where pairs of numbers from a given set
 * need to be counted based on a specific sum condition.
 *
 * The script continuously reads sets of data until a termination condition is met.
 */

var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;
var Arr = ( input . trim ( ) ) . split ( "\n" ) ; // Input lines are stored in this array

while ( true ) {

    // Extract 'n' (number of elements) and 'S' (target sum) from the current line.
    // The line is split by space and each part is converted to a number.
    var nS = Arr . shift ( ) . split ( " " ) . map ( Number ) ;

    var n = nS [ 0 ] ; // The first value is 'n'
    var S = nS [ 1 ] ; // The second value is 'S'

    // Check for the termination condition: n and S both being zero.
    if ( n == 0 && S == 0 ) {
        break ; // Exit the processing loop.
    }

    var arr = [ ] ; // Initialize an empty array to hold the 'n' numbers for the current test case.

    // Populate the 'arr' array with 'n' numbers from subsequent input lines.
    for ( var i = 0 ; i < n ; i ++ ) {
        var r = Arr . shift ( ) - 0 ; // Read a line, convert to number (subtracting 0 is a common trick).
        arr . push ( r ) ;             // Add the number to our array.
    }

    // Sort the array in ascending numerical order. This is crucial for the optimization below.
    arr . sort ( function ( a , b ) { return a - b ; } ) ;

    var cnt = 0 ; // Initialize a counter for pairs that satisfy the condition.

    // Iterate through all possible unique pairs (arr[i], arr[j]) where i < j.
    for ( var i = 0 ; i < n ; i ++ ) {
        for ( var j = i + 1 ; j < n ; j ++ ) {
            // If the sum of the current pair is greater than 'S'...
            if ( arr [ i ] + arr [ j ] > S ) {
                // Since the array is sorted, all subsequent elements (from j to n-1)
                // when paired with arr[i] will also result in a sum > S.
                // So, we can count all of them at once and then move to the next 'i'.
                cnt += n - j ;
                continue ; // Move to the next outer loop iteration (next 'i').
            }
        }
    }

    // Print the total count of pairs for the current test case to standard output.
    console . log ( cnt ) ;
}

// End of script execution.