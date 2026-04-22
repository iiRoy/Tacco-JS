/*
 * This file contains a JavaScript program designed to solve a specific
 * coordinate-related problem by iterating through possible grid widths.
 * Original creation date: October 5, 2013.
 * Author: hiroqn.
 */


    // Utilize Node.js file system module for synchronous operations.
    var fs = require( 'fs' );

    // Determine the size of the standard input.
    var length = fs.fstatSync( process.stdin.fd ).size;

    // Allocate a buffer to hold the input data.
    var buffer = new Buffer( length );

    // Read data synchronously from standard input into the buffer.
    var bytesRead = fs.readSync( process.stdin.fd, buffer, 0, length, 0 );

    // Convert the buffer content to a UTF-8 string and split it by newlines.
    var input = buffer.toString( 'utf8', 0, bytesRead ).split( '\n' );


    // Parse the first line of input to get 'n'.
    var n = input[ 0 ] - 0; // Convert string to number.

    // Parse the second line of input for coordinates 'a' and 'b'.
    var a = input[ 1 ].split( ' ' )[ 0 ] - 1; // X-coordinate for point A.
    var b = input[ 1 ].split( ' ' )[ 1 ] - 1; // Y-coordinate for point B.

    // Parse the third line of input for coordinates 'c' and 'd'.
    var c = input[ 2 ].split( ' ' )[ 0 ] - 1; // X-coordinate for point C.
    var d = input[ 2 ].split( ' ' )[ 1 ] - 1; // Y-coordinate for point D.


    // Declare loop counter variable.
    var w;

    // Declare variables to store calculated distances.
    var ab;
    var cd;

    // Initialize minimum distance to a very large value.
    var min = Infinity;


// Main calculation loop.
// Iterates through possible grid widths 'w' from 1 to 'n'.
for ( w = 1; w <= n; w++ )
{
    // Calculate the Manhattan distance between (a,b) and (c,d)
    // considering 'w' as the grid width for coordinate transformation.

    // Calculate transformed coordinates and Manhattan distance for (a,b).
    // a % w gives the x-coordinate in the new grid.
    // ~~(a / w) gives the y-coordinate in the new grid.
    ab = Math.abs( a % w - b % w ) + Math.abs( ~~( a / w ) - ~~( b / w ) );

    // Calculate transformed coordinates and Manhattan distance for (c,d).
    cd = Math.abs( c % w - d % w ) + Math.abs( ~~( c / w ) - ~~( d / w ) );


    // Update the minimum total distance found so far.
    min = Math.min( min, ab + cd );
}


// Output the final minimum distance to the console.
console.log( min );