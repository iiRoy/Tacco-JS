var input = require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' ) ;
// This line reads input from standard input.
// It uses Node.js 'fs' module to read the file.

var Arr = ( input . trim( ) ) . split( "\n" ) ;
// The input string is trimmed to remove leading/trailing whitespace.
// Then, it is split into an array of strings based on newline characters.

while ( true )
{
    // This loop processes multiple test cases until a termination condition is met.

    var nm = Arr . shift( ) . split( " " ) . map( Number ) ;
    // Reads the first line of the current test case, which contains N and M.
    // 'shift()' removes the first element from 'Arr' and returns it.
    // 'split(" ")' separates the string by space.
    // 'map(Number)' converts the resulting string array elements to numbers.

    var n = nm[ 0 ] ;
    var m = nm[ 1 ] ;

    if ( n == 0 && m == 0 )
    {
        // Termination condition for the loop: if N and M are both 0.
        break ;
    }

    /*
     * Initialize an array 'arr' to store the N numbers for the current test case.
     */
    var arr = [ ] ;

    for ( var i = 0 ; i < n ; i ++ )
    {
        arr . push( Arr . shift( ) - 0 ) ;
        // Reads N numbers from the input array 'Arr' and adds them to 'arr'.
        // '- 0' is a common trick to ensure the value is treated as a number.
    }

    arr . push( 0 ) ;
    // A zero is appended to the 'arr'. This is crucial for the algorithm.

    var Q = [ ] ;
    // 'Q' will store all possible sums of two numbers from 'arr'.

    for ( var i = 0 ; i < arr . length ; i ++ )
    {
        for ( var j = i ; j < arr . length ; j ++ )
        {
            Q . push( arr[ i ] + arr[ j ] ) ;
            // Calculates the sum of every distinct pair (including a number with itself).
        }
    }

    Q . sort( function ( a , b ) { return a - b ; } ) ;
    // Sorts the array 'Q' in ascending order. This is essential for the two-pointer approach.

    var max = 0 ;
    // 'max' will store the maximum sum of two elements from 'Q' that is less than or equal to 'm'.

    var k = Q . length - 1 ;
    // 'k' is a pointer initialized to the last element of the sorted array 'Q'.

    for ( var i = 0 ; i < Q . length ; i ++ )
    {
        // Iterate with pointer 'i' from the beginning of 'Q'.
        while ( Q[ i ] + Q[ k ] > m )
        {
            // If the sum of elements at 'i' and 'k' exceeds 'm',
            // decrement 'k' to try a smaller sum.
            k -- ;
        }
        // At this point, Q[i] + Q[k] <= m.
        // Update 'max' if the current sum is greater than the previously found 'max'.
        max = Math . max( max , Q[ i ] + Q[ k ] ) ;
    }

    console . log( max ) ;
    // Output the maximum sum found for the current test case.
}