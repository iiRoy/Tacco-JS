/*
 * This JavaScript program processes a 2D grid, performing a Breadth-First Search (BFS)
 * to calculate the maximum distance from any starting '#' (black) cell to any other
 * reachable cell in the grid. It reads grid dimensions and content from standard input.
 *
 * The problem essentially asks for the "farthest cell from any black cell" in terms
 * of Manhattan distance on a grid where all black cells are considered distance 0.
 *
 * Author: Code Clone Generator
 * Date: YYYY-MM-DD (placeholder)
 */


// Declare global variables for storing input lines, the grid 'A',
// and the grid's height 'H' and width 'W'.
var lines = [ ] , A ;
var H , W ;

// Import the 'readline' module, which is essential for
// asynchronous line-by-line input processing in Node.js.
var readline = require ( 'readline' ) ;


// Configure the readline interface to interact with the standard input and output streams.
// 'input' is where the program will read from.
// 'output' is typically used for prompts, but is required even if not explicitly used for writing prompts.
var rl = readline . createInterface ( {
    input : process . stdin ,
    output : process . stdout
} ) ;


// Attach an event listener for the 'line' event.
// This function is executed every time a new line of input is received.
// The received line 'x' is appended to the 'lines' array.
rl . on ( 'line' , function ( x ) {
    lines . push ( x ) ;
} ) ;


// Attach an event listener for the 'close' event.
// This function runs once all input has been received and the input stream is closed.
// The core logic of the program, including parsing, grid initialization, and BFS execution,
// is encapsulated within this event handler.
rl . on ( 'close' , function ( ) {

    // Extract the height 'H' and width 'W' from the first line of input.
    // The first line is expected to be in the format "H W".
    H = Number ( lines [ 0 ] . split ( " " ) [ 0 ] ) ;
    W = Number ( lines [ 0 ] . split ( " " ) [ 1 ] ) ;

    // Remove the first line from the 'lines' array, as its data (H and W)
    // has already been parsed and stored.
    lines . shift ( ) ;


    // Initialize the 2D grid 'A'.
    // Each string in the 'lines' array (representing a row) is
    // split into an array of individual characters.
    A = lines . map ( i => i . split ( "" ) ) ;


    // Declare and initialize an array named 'black'.
    // This array will serve as the initial queue for the BFS,
    // storing the coordinates [y, x] and initial distance (0)
    // for all cells that contain the character '#'.
    var black = [ ] ;


    // Iterate through the entire grid 'A' using nested loops.
    // The outer loop iterates through rows (from 0 to H-1).
    for ( var i = 0 ; i < H ; i ++ ) {
        // The inner loop iterates through columns (from 0 to W-1) for each row.
        for ( var j = 0 ; j < W ; j ++ ) {
            // Check if the current cell contains the '#' character.
            if ( A [ i ] [ j ] === "#" ) {
                // If it's a '#' cell, add its coordinates [row, column]
                // along with an initial distance of 0 to the 'black' array.
                black . push ( [ i , j , 0 ] ) ;
            }
        }
    }


    // Call the Breadth-First Search (BFS) function, passing the 'black' array
    // as the initial queue. The result (maximum distance) is then printed
    // to the standard output using 'console.log'.
    console . log ( bfs ( black ) ) ;

} ) ;


/**
 * Implements a Breadth-First Search (BFS) algorithm to find the maximum
 * distance from a set of starting points in a 2D grid.
 *
 * @param {Array<Array<number>>} q - The initial queue for BFS. Each element is
 *                                   an array [y, x, distance], representing a
 *                                   cell's row, column, and its distance from a source.
 * @returns {number} The maximum distance encountered during the BFS traversal.
 */
function bfs ( q ) {

    // Initialize 'max' to keep track of the largest distance found so far.
    // 'count' will temporarily store the distance of the current cell being processed.
    var max = 0 ;
    var count = 0 ;

    // Create a 2D array 'm' (memoization matrix or visited array)
    // with dimensions H x W. It's initialized with -1, indicating
    // that all cells are unvisited and their distances are unknown.
    var m = Array ( H ) . fill ( -1 ) . map ( i => i = Array ( W ) . fill ( -1 ) ) ;


    // Begin the BFS loop. The loop continues as long as there are elements
    // (cells to visit) in the queue 'q'.
    while ( q . length ) {
        // Dequeue the first element from the queue. This element 'a'
        // contains the coordinates [y, x] and the distance from a source [count].
        var a = q . shift ( ) ;

        // Extract the row 'y', column 'x', and the current distance 'count'
        // from the dequeued array 'a'.
        var y = a [ 0 ] , x = a [ 1 ] ;
        count = a [ 2 ] ;


        // Check if the current cell (y, x) has already been visited.
        // If 'm[y][x]' is not -1, it means we've already found a path
        // to this cell (and since it's BFS, it's the shortest path),
        // so we skip processing it again.
        if ( m [ y ] [ x ] !== -1 ) {
            continue ;
        }

        // Mark the current cell (y, x) as visited by storing its distance 'count'
        // in the memoization matrix 'm'.
        m [ y ] [ x ] = count ;

        // Update the 'max' distance if the current cell's distance 'count'
        // is greater than the previously recorded maximum.
        max = Math . max ( max , count ) ;


        // --- Explore Neighbors ---
        // The following 'if' conditions check the four adjacent neighbors
        // (down, up, right, left) of the current cell (y, x).
        // For each valid neighbor (within grid boundaries), it's enqueued
        // with an incremented distance (count + 1).

        // Check the cell directly below (y+1, x).
        if ( y + 1 < H ) {
            q . push ( [ y + 1 , x , count + 1 ] ) ;
        }

        // Check the cell directly above (y-1, x).
        // The condition '0 < y - 1' ensures 'y-1' is not negative (i.e., y > 0).
        if ( 0 < y - 1 ) {
            q . push ( [ y - 1 , x , count + 1 ] ) ;
        }

        // Check the cell to the right (y, x+1).
        if ( x + 1 < W ) {
            q . push ( [ y , x + 1 , count + 1 ] ) ;
        }

        // Check the cell to the left (y, x-1).
        // The condition '0 < x - 1' ensures 'x-1' is not negative (i.e., x > 0).
        if ( 0 < x - 1 ) {
            q . push ( [ y , x - 1 , count + 1 ] ) ;
        }
    }

    // Once the BFS loop completes (meaning all reachable cells have been visited),
    // return the maximum distance found during the traversal.
    return ( max ) ;
}