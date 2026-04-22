// Declare global variables for storing input lines and problem parameters.
// This array will hold each line read from standard input.
var lines = [ ] ;

// N represents the grid size, and A will be the 2D grid itself.
var N , A ;


/*
 *  The 'readline' module provides an interface for reading data
 *  from a Readable stream (like process.stdin) one line at a time.
 */
var readline = require ( 'readline' ) ;


// Create an instance of the readline interface.
// It will read from standard input and write to standard output.
var rl = readline . createInterface ( {

    input  :  process . stdin ,  // Set the input stream to standard input.
    output :  process . stdout , // Set the output stream to standard output.

} ) ;



// Attach an event listener for the 'line' event.
// This function executes every time a new line of input is received.
rl . on ( 'line' , function ( x ) {

    // Add the current line 'x' to the 'lines' array.
    lines . push ( x ) ;

} ) ;



// Attach an event listener for the 'close' event.
// This function executes once the input stream has ended.
rl . on ( 'close' , function ( ) {

    // The first line of input (lines[0]) contains the value for N.
    // Convert it to a number and store it in N.
    N = Number ( lines [ 0 ] ) ;

    // Remove the first line from the 'lines' array as it's already processed.
    lines . shift ( ) ;


    // Process the remaining lines to populate the 2D array 'A'.
    // Each line is split by spaces, and each part is converted to a number.
    A = lines . map ( i => i . split ( " " ) . map ( i => Number ( i ) ) ) ;


    // Initialize the queue 'q' for the Breadth-First Search (BFS).
    // The initial state is [y-coordinate, x-coordinate, current_sum].
    // Starting at (0,0) with an initial sum of 0.
    var q = [ [ 0 , 0 , 0 ] ] ;


    // Call the BFS function with the initialized queue
    // and print the returned maximum sum to the console.
    console . log ( bfs ( q ) ) ;

} ) ;



/**
 * Implements a Breadth-First Search (BFS) algorithm
 * to find the maximum possible sum of values along specific paths in a grid.
 *
 * @param {Array<Array<number>>} q - The queue for BFS,
 *                                   each element is [y, x, current_path_sum].
 * @returns {number} The maximum sum encountered during the traversal.
 */
function bfs ( q ) {

    // 'ans' will store the overall maximum sum found.
    // 'counter' will store the sum for the current path being explored.
    var ans = 0 , counter = 0 ;


    // Continue the BFS as long as there are states in the queue to explore.
    while ( q . length ) {

        // Dequeue the first element from the queue.
        // 't' contains the current y, x coordinates and the sum up to that point.
        var t = q . shift ( ) ;

        // Extract y and x coordinates from the dequeued element.
        var y = t [ 0 ] , x = t [ 1 ] ;

        // Calculate the current path sum by adding the value of the cell A[y][x]
        // to the sum accumulated until the previous cell (t[2]).
        counter = t [ 2 ] + A [ y ] [ x ] ;


        // Update the maximum answer found so far.
        ans = Math . max ( ans , counter )


        // Check if moving one step to the right (x + 1) is within the grid boundaries (N).
        if ( x + 1 < N ) {
            // If valid, enqueue the new state: [current_y, next_x, updated_sum].
            q . push ( [ y , x + 1 , counter ] )
        }


        // Check if moving one step down (y + 1) is within the grid boundaries (2 rows).
        if ( y + 1 < 2 ) {
            // If valid, enqueue the new state: [next_y, current_x, updated_sum].
            q . push ( [ y + 1 , x , counter ] )
        }

    }

    // Return the final maximum sum found after exploring all reachable paths.
    return ( ans ) ;

}