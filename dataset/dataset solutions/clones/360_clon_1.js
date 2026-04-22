/*
 * This function recursively "bombs" (clears) connected cells
 * in a 2D grid based on a starting point and a value.
 * It's a depth-first search (DFS) like operation, clearing
 * all adjacent cells that share the same initial character 'v'.
 */
function bomb( y, x, v ) {
    // dy and dx arrays define the 4 possible directions to move
    // [0,0,-1,1] for dy means no change, no change, up, down
    var dy = [ 0, 0, -1, 1 ];
    // [-1,1,0,0] for dx means left, right, no change, no change
    var dx = [ -1, 1, 0, 0 ];

    // Loop through each of the four cardinal directions
    for ( var i = 0; i < 4; i++ ) {
        // Calculate the new Y coordinate (row) for the adjacent cell
        var yy = y + dy[ i ];
        // Calculate the new X coordinate (column) for the adjacent cell
        var xx = x + dx[ i ];

        // Check if the calculated coordinates are outside the grid boundaries
        // n[0] is the number of rows, n[1] is the number of columns
        if ( yy < 0 || yy >= n[ 0 ] || xx < 0 || xx >= n[ 1 ] ) {
            continue; // If out of bounds, skip to the next direction
        }

        // If the value of the adjacent cell matches the target value 'v'
        if ( v == yx[ yy ][ xx ] ) {
            yx[ yy ][ xx ] = 0; // Mark the current cell as "bombed" (cleared) by setting its value to 0
            bomb( yy, xx, v );  // Recursively call bomb on this adjacent cell
        }
    }
}


// --- Main program execution starts here ---

// Use Node.js 'fs' module to read synchronous input from standard input
var input = require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' );

// Trim any leading/trailing whitespace from the input and then split it into an array of lines
var Arr = ( input.trim() ).split( "\n" );

// Loop indefinitely to process multiple test cases until a specific termination condition is met
while ( true ) {
    // Read the first line of the current test case, which contains the grid dimensions (N rows, M columns)
    // Arr.shift() removes the line from the array, .split(" ") separates N and M, .map(Number) converts them to numbers
    var n = ( Arr.shift() ).split( " " ).map( Number );

    // Check for the termination condition: if both N and M are 0, break out of the loop
    if ( n[ 0 ] == 0 && n[ 1 ] == 0 ) {
        break;
    }

    // Initialize an empty array to represent the 2D grid (matrix)
    var yx = [];
    // Loop N times to read each row of the grid
    for ( var i = 0; i < n[ 0 ]; i++ ) {
        // Read the next line (row) from the input, split it into an array of individual characters
        var arr = ( Arr.shift() ).split( "" );
        yx.push( arr ); // Add the character array (row) to the grid
    }

    // Initialize a counter to keep track of the number of distinct "bombed" regions
    var cnt = 0;

    // Iterate through each cell of the grid using nested loops
    for ( var i = 0; i < n[ 0 ]; i++ ) {
        for ( var j = 0; j < n[ 1 ]; j++ ) {
            // Get the value (character) of the current cell
            var v = yx[ i ][ j ];

            // If the current cell contains one of the target characters ('@', '#', or '*')
            if ( v == "@" || v == "#" || v == "*" ) {
                cnt++;           // Increment the counter for a new region found
                yx[ i ][ j ] = 0;  // Mark the starting cell as cleared to avoid re-processing
                bomb( i, j, v ); // Call the bomb function to clear all connected cells of the same type
            }
        }
    }

    // After processing the entire grid for the current test case, print the total count of regions
    console.log( cnt );
}