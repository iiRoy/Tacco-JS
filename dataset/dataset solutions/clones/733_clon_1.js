/*
 * This function calculates the maximum length of a consecutive sequence
 * of the same 'ab' value (player's mark) in various 3D directions
 * starting from a given coordinate (x, y, z).
 * It searches outwards from the given point and then inwards to count.
 */
function bomb( ab,  x,  y,  z )
{
    // Define initial direction vectors for 3D space.
    // dx, dy, dz represent changes in x, y, z coordinates respectively.
    // These first 8 values cover a 3x3 plane with Z change being 0.
    var dx = [ -1,  0,  1, -1,  1, -1,  0,  1 ];
    var dy = [ -1, -1, -1,  0,  0,  1,  1,  1 ];
    var dz = [  0,  0,  0,  0,  0,  0,  0,  0 ];


    // Extend dy and dz for additional directions, followed by dx.
    // This effectively adds 8 more vectors.
    dy = dy.concat( [ -1,  0,  1, -1,  1, -1,  0,  1 ] );
    dz = dz.concat( [ -1, -1, -1,  0,  0,  1,  1,  1 ] );
    dx = dx.concat( [  0,  0,  0,  0,  0,  0,  0,  0 ] );


    // Further extend dz and dx for more directions, followed by dy.
    // This adds another 8 vectors, resulting in 24 total direction vectors.
    dz = dz.concat( [ -1,  0,  1, -1,  1, -1,  0,  1 ] );
    dx = dx.concat( [ -1, -1, -1,  0,  0,  1,  1,  1 ] );
    dy = dy.concat( [  0,  0,  0,  0,  0,  0,  0,  0 ] );


    var max = 0; // Initialize maximum consecutive count found so far.


    // Iterate through all defined 3D direction vectors.
    for ( var i = 0; i < dx.length; i++ )
    {
        // Set current coordinates to the starting point (x, y, z).
        var X = x;
        var Y = y;
        var Z = z;


        // Traverse outwards in the negative direction along the current vector
        // until a grid boundary is hit.
        while ( true )
        {
            X -= dx[ i ];
            Y -= dy[ i ];
            Z -= dz[ i ];


            // If any coordinate falls outside the grid boundaries,
            // break the loop. 'n' is a globally available variable representing grid size.
            if ( X < 0 || Y < 0 || Z < 0 ) break;
            if ( X >= n || Y >= n || Z >= n ) break;
        }


        var cnt = 0; // Initialize count for consecutive 'ab' values for this direction.


        // Traverse inwards (in the positive direction) from the boundary
        // to count consecutive 'ab' values.
        while ( true )
        {
            X += dx[ i ];
            Y += dy[ i ];
            Z += dz[ i ];


            // If any coordinate falls outside the grid boundaries,
            // break the loop.
            if ( X < 0 || Y < 0 || Z < 0 ) break;
            if ( X >= n || Y >= n || Z >= n ) break;


            // Check if the current cell contains the player's mark 'ab'.
            if ( ball[ X ][ Y ][ Z ] == ab )
            {
                cnt++; // Increment count if it's the same player's mark.
            }
            else
            {
                cnt = 0; // Reset count if a different mark or empty cell is encountered.
            }


            // Update the overall maximum consecutive count found across all directions.
            max = Math.max( max, cnt );
        }
    }
    // Return the highest consecutive count found.
    return max;
}


// Read input from standard input.
var input = require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' );

// Process input: trim any leading/trailing whitespace and split into lines.
var arr = input.trim().split( "\n" );


// Main game loop. This loop continues to process game scenarios
// until a specific termination condition ("0 0 0") is met.
while ( true )
{
    // Get the next line of input, which contains n, m, and p values.
    var nmp = arr.shift();


    // Check for the termination condition.
    if ( nmp == "0 0 0" )
    {
        break; // Exit the main game loop if "0 0 0" is encountered.
    }


    // Parse the n, m, and p values from the current line.
    // 'n' is the grid size (n x n for X and Y dimensions).
    // 'm' is the winning condition (number of consecutive pieces required).
    // 'p' is the total number of pieces to be dropped in this game.
    nmp = nmp.split( " " ).map( Number );
    var n = nmp[ 0 ];
    var m = nmp[ 1 ];
    var p = nmp[ 2 ];


    // Initialize the 3D game board (named 'ball').
    // It's an n x n grid for X and Y, and 'p' deep for Z.
    var ball = [];
    for ( var i = 0; i < n; i++ )
    {
        ball[ i ] = []; // Initialize the X dimension (rows).
        for ( var j = 0; j < n; j++ )
        {
            ball[ i ][ j ] = []; // Initialize the Y dimension (columns).
            for ( var k = 0; k < p; k++ )
            {
                ball[ i ][ j ][ k ] = 0; // Initialize each cell to 0 (empty).
            }
        }
    }


    // Initialize the current player. 'ab' will alternate between 1 (Black) and 2 (White).
    var ab = 1;


    // Loop for dropping 'p' pieces, one by one.
    // 'i' is declared outside the loop to check its final value for a draw condition.
    var i;
    for ( i = 0; i < p; i++ )
    {
        // Read the x, y coordinates for the current piece drop from input.
        var xy = arr.shift().split( " " ).map( Number );
        var x = xy[ 0 ] - 1; // Adjust x to be 0-based index.
        var y = xy[ 1 ] - 1; // Adjust y to be 0-based index.


        var cnt = 0; // Counter to find the lowest available Z-level in the column.
        // Find the next available slot (Z-level) in the specified (x, y) column.
        while ( true )
        {
            // If the current cell at (x, y, cnt) is not empty, move up one level.
            if ( ball[ x ][ y ][ cnt ] !== 0 )
            {
                cnt++;
            }
            else
            {
                break; // An empty spot is found, so break from this inner loop.
            }
        }


        // Place the current player's piece ('ab') in the found spot.
        ball[ x ][ y ][ cnt ] = ab;


        // Check if the current move results in a win condition (m consecutive pieces).
        if ( bomb( ab, x, y, cnt ) >= m )
        {
            // Output the winner (White if ab is 2, Black if ab is 1) and the move number.
            console.log( ( ab == 2 ) ? "White" : "Black", i + 1 );
            break; // End the game for this set of inputs, as a winner has been determined.
        }


        // Switch player for the next turn.
        // If 'ab' is 1, 2/1 = 2. If 'ab' is 2, 2/2 = 1.
        ab = 2 / ab;
    }


    // After the loop, if 'i' is equal to 'p', it means all 'p' pieces were dropped
    // without any player reaching the winning condition.
    if ( i == p )
    {
        console.log( "Draw" ); // Declare the game a Draw.
    }
}