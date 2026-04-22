/*
 * This JavaScript code processes a grid-based problem,
 * likely involving connected components or a "bomb"-like clearing mechanism.
 * It reads input from standard input, processes multiple test cases,
 * and outputs a count for each.
 */


/**
 * The 'bomb' function recursively clears connected cells
 * in a grid that have a specific value 'v'.
 * It operates in four cardinal directions (up, down, left, right).
 *
 * @param {number} y - The current row index.
 * @param {number} x - The current column index.
 * @param {string} v - The value to be cleared from connected cells.
 */
function bomb ( y, x, v )
{
    // Define delta values for Y coordinate to check neighbors (no change, no change, up, down)
    var dy = [ 0, 0, -1, 1 ];

    // Define delta values for X coordinate to check neighbors (left, right, no change, no change)
    var dx = [ -1, 1, 0, 0 ];


    // Iterate through all four cardinal directions (0: left, 1: right, 2: up, 3: down)
    for ( var i = 0; i < 4; i++ )
    {
        // Calculate the new Y coordinate for the adjacent cell
        var yy = y + dy[ i ];

        // Calculate the new X coordinate for the adjacent cell
        var xx = x + dx[ i ];


        // Check if the calculated adjacent coordinates are outside the grid boundaries
        if ( yy < 0 || yy >= n[ 0 ] || xx < 0 || xx >= n[ 1 ] )
        {
            continue; // If out of bounds, skip to the next direction
        }


        // If the value of the adjacent cell matches the target value 'v'
        if ( v == yx[ yy ][ xx ] )
        {
            yx[ yy ][ xx ] = 0; // Set the current cell's value to 0, marking it as cleared

            // Recursively call the bomb function for the adjacent cell
            bomb( yy, xx, v );
        }
    }
}


// --- Main Program Execution Starts Here ---

// Read the entire standard input content as a UTF-8 string
var input = require( 'fs' ) . readFileSync( '/dev/stdin', 'utf8' );


// Trim any leading/trailing whitespace from the input and split it into an array of lines
var Arr = ( input . trim() ) . split( "\n" );


// Start an infinite loop to process multiple test cases until a specific termination condition is met
while ( true )
{
    /*
     * Extract the first line of the current test case,
     * split it by spaces, and convert the parts to numbers.
     * These numbers typically represent grid dimensions (rows, columns).
     */
    var n = ( Arr . shift() ) . split( " " ) . map( Number );


    // Check if the current test case indicates termination (both dimensions are zero)
    if ( n[ 0 ] == 0 && n[ 1 ] == 0 )
    {
        break; // Exit the while loop if the termination condition is met
    }


    // Initialize an empty array to store the grid (2D array) for the current test case
    var yx = [ ];


    // Loop to read and populate the grid based on the dimensions n[0] (number of rows)
    for ( var i = 0; i < n[ 0 ]; i++ )
    {
        // Get the next line from the input array, split it into individual characters
        var arr = ( Arr . shift() ) . split( "" );

        // Add the array of characters (representing a row) to the grid
        yx . push( arr );
    }


    // Initialize a counter for the number of "bombed" or cleared groups
    var cnt = 0;


    // Iterate through each cell of the grid (row by row, then column by column)
    for ( var i = 0; i < n[ 0 ]; i++ )
    {
        for ( var j = 0; j < n[ 1 ]; j++ )
        {
            // Get the value of the current cell
            var v = yx[ i ][ j ];

            // The following line was commented out in the original code.
            // It suggests a condition for triggering the 'bomb' function
            // based on specific character values. For a Type I clone,
            // we preserve its commented-out status and content.
            // if ( v == "@" || v == "#" || v == "*" ) {
            //     cnt++; // Increment the counter if a target character is found
            //     yx[ i ][ j ] = 0; // Clear the starting cell
            //     bomb( i, j, v ); // Initiate the recursive bombing process
            // }
        }
    }


    // Print the final count for the current test case to the console
    console . log( cnt );
}