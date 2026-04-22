/*
    This program reads numerical data from standard input,
    performs a series of cubic calculations, and then
    outputs the minimum resulting value for each dataset.
    It's designed to process multiple test cases until
    a zero value is encountered.
*/

var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ;
var arr   = input . trim ( ) . split ( "\n" ) ; // Input lines are split into an array

while ( true )
{
    // Extract the next number from the input array
    var z = arr . shift ( ) - 0 ; // The -0 ensures explicit number conversion

    // Check if the input value signals termination
    if ( z == 0 )
        break ; // Exit the loop if z is zero

    // Calculate the cube of the current input value
    var zzz = z * z * z ;

    // Initialize an array to store the calculated differences
    var ary = [ ] ;

    // Outer loop: iterates downwards from z-1
    for ( var i = z - 1 ; i > 0 ; i -- )
    {
        // Inner loop: iterates downwards from the current value of i
        for ( var j = i ; j > 0 ; j -- )
        {
            // Calculate the difference: zzz - i^3 - j^3
            var x = zzz - i * i * i - j * j * j ;

            // If the calculated difference is positive, add it to our array
            if ( x > 0 )
                ary . push ( x ) ;
        }
    }

    // Sort the array of differences in ascending order
    ary . sort ( function ( a , b ) { return a - b ; } ) ; // Standard numeric sort

    // Output the smallest difference found for the current z
    console . log ( ary [ 0 ] ) ; // The first element after sorting is the minimum
}