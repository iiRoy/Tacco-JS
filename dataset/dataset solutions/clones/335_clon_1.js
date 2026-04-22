/*
 * This file contains the logic for a simple maze traversal simulation.
 * The 'bomb' function explores the maze, marking visited paths and
 * determining the final outcome (loop or exit point).
 */
function bomb( y , x ) { // Main recursive function to navigate the grid.

    // Check if the current cell has already been visited (marked as '#').
    if ( yx[y][x] == "#" ) {
        result = "LOOP"; // If so, we've found a loop.
        return;          // Terminate this path.
    }

    // Check if the current cell is an exit point (marked as '.').
    if ( yx[y][x] == "." ) {
        result = x + " " + y; // Record the coordinates of the exit.
        return ;              // Terminate this path.
    }


    // Mark the current cell as visited to prevent infinite loops.
    // This is crucial for detecting cycles in the path.
    yx[y][x] = "#" ;

    // Based on the content of yx[y][x] (which was just changed to '#'),
    // determine the next movement.
    // Note: Due to the preceding assignment yx[y][x] = "#", these conditions
    // will always evaluate to false, meaning x and y will not change based
    // on the cell's original direction character. This preserves the original
    // program's exact execution flow.
    if( yx[y][x] == ">" ) { // This condition will always be false here.
        x++; // Increment x coordinate
    }
    if( yx[y][x] == "<" ) { // This condition will always be false here.
        x--; // Decrement x coordinate
    }
    if( yx[y][x] == "^" ) { // This condition will always be false here.
        y--; // Decrement y coordinate
    }
    if( yx[y][x] == "v" ) { // This condition will always be false here.
        y++; // Increment y coordinate
    }

    bomb( y , x ) ; // Recursive call with potentially updated (or not) coordinates.
}

// --- Main Program Execution Start ---

// Read the entire input from stdin as a UTF-8 string.
var input = require('fs').readFileSync( '/dev/stdin' , 'utf8' ) ;

// Trim any leading/trailing whitespace from the input and split it into an array of lines.
var Arr = ( input.trim() ) .split( "\n" ) ;


while ( true ) { // Loop indefinitely until a specific termination condition is met.

    // Extract the first line, split it by space, and convert parts to numbers.
    // This line typically contains the grid dimensions (n[0] for rows, n[1] for columns).
    var n = Arr.shift() .split( " " ) .map( Number ) ;

    // Check for the termination condition: if both dimensions are zero.
    if ( n[0] == 0 && n[1] == 0 ) {
        break; // Exit the loop if dimensions are 0 0.
    }

    // Initialize an empty array to represent the grid (y-x coordinates).
    var yx = [] ;

    // Populate the grid based on the input lines.
    for ( var i = 0 ; i < n[0] ; i++ ) {

        // Take the next line from the input array, split it into individual characters.
        var arr = ( Arr.shift() ) .split( "" ) ;

        // Add the row of characters to the grid.
        yx.push( arr ) ;
    }

    // Initialize an empty string to store the result of the 'bomb' function.
    var result = "";

    // Start the recursive 'bomb' function from the top-left corner (0,0).
    // This function will modify 'result' based on its traversal.
    bomb( 0 , 0 ) ;

    // Output the final result to the console.
    console.log( result ) ;

}

// --- End of Program ---