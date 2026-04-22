/*
 * This function is responsible for recursively "bombing" or filling a path
 * within a 2D grid represented by the 'yx' array.
 * It simulates a pathfinding algorithm or a maze generation step.
 */
function bomb( y, x, z ) {
    // If the current cell is not a '+', it means it's already visited or marked,
    // so we return to prevent infinite loops or incorrect pathing.
    if ( yx[y][x] !== "+" ) {
        return;
    }


    // Define change in y and x coordinates for each of the four directions (0, 1, 2, 3)
    var dy = [ -1, 0, 1, 0 ]; // dy: Up, Right, Down, Left
    var dx = [ 0, 1, 0, -1 ]; // dx: Up, Right, Down, Left


    // Calculate the coordinates of the next cell based on the current direction 'z'
    var Y = y + dy[z];
    var X = x + dx[z];


    // Check for boundary conditions: if the next cell is out of bounds
    if ( Y < 0 || X < 0 || Y >= n || X >= n ) {
        // If out of bounds, change direction (rotate clockwise)
        z = ( z + 1 ) % 4;
        // Recursively call bomb with the same current cell but new direction
        bomb( y, x, z );
    } else {
        // If the next cell is within bounds
        if ( yx[Y][X] === "#" ) {
            // If the next cell is already marked as '#', it means we've hit a wall
            // or a previously carved path. We need to "undo" the previous step
            // and try a different path from the current cell.
            // Mark the cell *before* the wall as '+' (unvisited/open)
            yx[ Y - dy[z] ][ X - dx[z] ] = "+";


            // Based on the current direction 'z', try to bomb from a new position
            // This part seems to be handling specific corner cases or path adjustments
            // related to the 'wall' hit. The offsets are crucial here.
            if      ( z === 3 ) bomb( Y - 2 * dy[z] - 1, X - 2 * dx[z],     0 );
            else if ( z === 0 ) bomb( Y - 2 * dy[z],     X - 2 * dx[z] + 1, 1 );
            else if ( z === 1 ) bomb( Y - 2 * dy[z] + 1, X - 2 * dx[z],     2 );
            else if ( z === 2 ) bomb( Y - 2 * dy[z],     X - 2 * dx[z] - 1, 3 );
        } else {
            // If the next cell is not a '#', it means it's an open path ('+')
            // Mark the current cell as '#', indicating it's part of the path
            yx[y][x] = "#";
            // Store the coordinates of the last marked cell
            last = [ y, x ];
            // Recursively call bomb for the next cell in the current direction
            bomb( Y, X, z );
        }
    }
}


// --- Main program execution starts here ---

// Read input from stdin, assuming it's a file path
var input = require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' );


// Process the input: trim whitespace, split by newlines, and convert to numbers
var arr = input.trim().split( "\n" ).map( Number );


// The first number in the array 'arr' represents the number of test cases 'd'
var d = arr.shift();


// Loop through each test case
while ( d-- ) {
    // Get the size of the grid 'n' for the current test case
    var n = arr.shift();


    // Handle special case: n = 0 (empty grid)
    if ( n === 0 ) {
        console.log( "" ); // Output an empty line
        continue;          // Move to the next test case
    }


    // Handle special case: n = 1 (1x1 grid)
    if ( n === 1 ) {
        console.log( "#" ); // Output a single '#'
        continue;          // Move to the next test case
    }


    // Initialize a 2D array (grid) 'yx' of size n x n
    // All cells are initially marked with '+'
    var yx = [];
    for ( var i = 0; i < n; i++ ) {
        yx[i] = [];
        for ( var j = 0; j < n; j++ ) {
            yx[i][j] = "+";
        }
    }


    // 'last' will store the coordinates of the last cell visited by the 'bomb' function
    var last = [];


    // Start the recursive 'bomb' function from the bottom-left corner (n-1, 0)
    // with an initial direction of 0 (up)
    bomb( n - 1, 0, 0 );


    // If 'n' is an even number, the last cell might need to be reset to '+'
    // This is likely a correction for a specific pattern or edge case in the algorithm
    if ( n % 2 === 0 ) {
        yx[ last[0] ][ last[1] ] = "+";
    }


    // Join the rows of the 'yx' grid with newlines,
    // then remove all commas (from array.join),
    // and finally replace all '+' characters with spaces for the final output.
    console.log( yx.join( "\n" ).replace( /,/g, "" ).replace( /\+/g, " " ) );
}