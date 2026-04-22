/* This is a Type I clone example.
   The original code's functionality is preserved entirely.
   Only whitespace and comments have been altered. */

function   bomb( y , x , v )
{

    // Increment global counter for recursion depth.
    CNT++;

    // Base case: Prevent excessive recursion to avoid stack overflow or infinite loops.
    if( CNT > 50 )
    {
        return;
    }

    // Define relative y-coordinates for neighbors.
    var dy = [ 0, 0, -1, 1 ];
    // Define relative x-coordinates for neighbors.
    var dx = [ -1, 1, 0, 0 ];

    /* Loop through all four possible directions (up, down, left, right)
       to find adjacent cells. */
    for ( var i = 0 ; i < 4 ; i++ )
    {
        var yy = y + dy[i]; // Calculate new y-coordinate.
        var xx = x + dx[i]; // Calculate new x-coordinate.

        // Check if the new coordinates are within the grid boundaries.
        if ( yy < 0 || yy >= n[0] || xx < 0 || xx >= n[1] )
        {
            continue; // Skip to the next direction if out of bounds.
        }

        // Check if the current cell's value matches the target value 'v'.
        if ( v == yx[yy][xx] )
        {
            yx[yy][xx] = 0; // Mark the cell as visited/processed by setting its value to 0.
            bomb( yy, xx, v ); // Recursively call bomb for the adjacent cell.
        }
    }
} /* End of bomb function */


// Require the 'fs' module for file system operations.
var input = require('fs') . readFileSync( '/dev/stdin' , 'utf8' );

// Trim whitespace from input and split it into an array of lines.
var Arr = ( input . trim() ) . split( "\n" );


// Main processing loop; continues until a specific termination condition is met.
while ( true )
{

    // Parse grid dimensions from the first line of the current input block.
    var n = ( Arr.shift() ) . split( " " ) . map( Number );

    // Termination condition: if both dimensions are 0, break the loop.
    if ( n[0] == 0 && n[1] == 0 )
    {
        break;
    }

    // Initialize an empty array to store the grid.
    var yx = [ ];

    // Populate the grid row by row.
    for ( var i = 0 ; i < n[0] ; i++ )
    {
        var arr = ( Arr.shift() ) . split( "" ); // Read a row and split into characters.
        yx . push( arr ); // Add the row to the grid.
    }

    // Initialize counters for found groups and recursion depth.
    var cnt = 0;
    var CNT = 0; // This `CNT` is re-initialized for each grid.

    // Iterate through each cell of the grid to find "bombs".
    for ( var i = 0 ; i < n[0] ; i++ )
    {
        for ( var j = 0 ; j < n[1] ; j++ )
        {
            var v = yx[i][j]; // Get the value of the current cell.

            // Check if the cell contains a "bomb" character.
            if ( v == "@" || v == "#" || v == "*" )
            {
                cnt++; // Increment the group counter.
                yx[i][j] = "m"; // Mark the cell as visited ('m' for marked).
                bomb( i, j, v ); // Initiate recursive search for connected bombs.
            }
        }
    }

    // Output the total count of distinct bomb groups found in the current grid.
    console . log( cnt );
} // End of while loop.