/*
 * This JavaScript program processes input from /dev/stdin.
 * It calculates a sum based on a series of movements and values.
 */

// Import the Node.js 'fs' module for file system operations.
var input = require( 'fs' ) . readFileSync( '/dev/stdin' ,   'utf8'   );


// Process the raw input string.
// Trim any leading/trailing whitespace and split it into an array of lines.
var arr = input . trim() . split( "\n" );


// The first line contains two numbers: m and n, separated by a space.
// Shift this line from the array, split it, and convert parts to numbers.
var mn  =  arr . shift() . split( " " ) . map( Number );


// Extract the first number as 'm'.
var m = mn[ 0 ];

// Extract the second number as 'n'.
var n = mn[ 1 ];


// Initialize an array 'si' to store sequence values.
var si = [];

// Populate 'si' with m-1 values from the input array.
// The '-0' is a trick to convert string to number.
for ( var i = 0 ; i < m - 1 ; i ++ )
{
    si . push( arr . shift() - 0 ); // Add the next line value to 'si'.
}


// Initialize an array 'ai' to store action values.
var ai = [];

// Populate 'ai' with 'n' values from the input array.
for ( var i = 0 ; i < n ; i ++ )
{
    ai . push( arr . shift() - 0 ); // Add the next line value to 'ai'.
}


// Initialize 'sum' to keep track of the total calculated sum.
var sum = 0;

// Initialize 'i' as an index for the 'si' array.
var i   =   0 ;


/*
 * Iterate over each value in the 'ai' array.
 * Each value 'v' in 'ai' dictates a series of movements and additions to 'sum'.
 */
ai . forEach( function ( v )
{
    // Determine the direction of movement: 1 for positive 'v', -1 for negative 'v'.
    var k = ( v > 0 ) ? 1 : -1 ;


    // Use the absolute value of 'v' to determine the number of steps.
    var v = Math . abs( v );


    // Loop 'v' times, decrementing 'v' in each iteration.
    while ( v -- )
    {
        // If moving in the positive direction (k=1), add si[i] to sum *before* moving.
        if ( k == 1 )
        {
            sum += si[ i ];
        }

        // Update the index 'i' based on the direction 'k'.
        i = i + k ;

        // If moving in the negative direction (k=-1), add si[i] to sum *after* moving.
        // Note: The logic here is specific to the original code's intent.
        if ( k == -1 )
        {
            sum += si[ i ];
        }
    }
} ); // End of forEach loop.


// Output the final calculated sum to the console.
console . log( sum );