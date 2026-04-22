/* This JavaScript file processes multiple sliding tile puzzles.
 * Each input line represents a puzzle configuration.
 * The goal is to find the minimum number of moves (using BFS)
 * to reach the sorted state "01234567".
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */


// --- Module Imports ---
// The 'fs' module is used here to read file system data.
var input = require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' ) ;


// --- Input Processing ---
// Trim any leading/trailing whitespace from the input string,
// then split it into an array of strings based on newline characters.
var Arr = ( input . trim( ) ) . split( "\n" ) ;


// --- Directional Arrays for Movement ---
// These arrays define the relative changes in y and x coordinates
// for moving up, down, left, and right in a 2D grid.
// dy:  [-1 (up),  0 (no change), 0 (no change), 1 (down)]
var dy = [ -1 , 0 , 0 , 1 ] ;

// dx:  [ 0 (no change), -1 (left), 1 (right),  0 (no change)]
var dx = [ 0 , -1 , 1 , 0 ] ;


// --- Main Puzzle Solver Loop ---
// Iterate through each puzzle configuration provided in the input array.
Arr . forEach( function ( v ) {

    // Convert the space-separated string of numbers into an array of actual numbers.
    var arr = v . split( " " ) . map( Number ) ;

    // 'obj' serves as a hash map to keep track of visited puzzle states.
    // This prevents redundant computations and infinite loops in BFS.
    var obj = { } ;

    // 'P' is the queue used for Breadth-First Search (BFS).
    // Each element in 'P' is a tuple: [puzzle_state_array, current_move_count].
    var P = [ [ arr , 0 ] ] ;


    // --- BFS Loop ---
    // Continue exploring states as long as the queue is not empty.
    while ( P . length > 0 ) {

        // Dequeue the state at the front of the queue.
        var A = P . shift( ) ;

        // Extract the puzzle state (array of numbers) and the move count.
        var arr = A[ 0 ] ;
        var cnt = A[ 1 ] ;

        // --- Goal Check ---
        // If the current puzzle state matches the target sorted state ("01234567").
        if ( arr . join( "" ) == "01234567" ) {
            console . log( cnt ) ; // Output the number of moves.
            break ; // Terminate the BFS for this specific puzzle.
        }

        // --- Find Empty Tile (0) ---
        // Determine the 1D index of the empty tile (value 0).
        var index = arr . indexOf( 0 ) ;

        // Convert the 1D index to 2D coordinates (y, x) for a 2x4 grid.
        var y = Math . floor( index / 4 ) ; // Row index.
        var x = index % 4 ; // Column index.

        // --- Grid Representation ---
        // Create a 2D representation of the puzzle grid for easier manipulation.
        // yx[0] contains the first four tiles (row 0), yx[1] contains the next four (row 1).
        var yx = [ arr . slice( 0 , 4 ) , arr . slice( 4 , 8 ) ] ;


        // --- Explore Neighbors ---
        // Loop through all four possible directions (up, down, left, right).
        for ( var i = 0 ; i < 4 ; i ++ ) {

            // Calculate the new coordinates (yy, xx) for the tile adjacent to the empty spot.
            var yy = y + dy[ i ] ;
            var xx = x + dx[ i ] ;

            // --- Boundary Check ---
            // Ensure the new coordinates are within the valid bounds of the 2x4 grid.
            if ( yy < 0 || xx < 0 || yy >= 2 || xx >= 4 ) {
                continue ; // If out of bounds, skip this move and try the next direction.
            }

            // --- Perform Tile Swap ---
            // Move the tile from (yy, xx) into the empty spot at (y, x).
            yx[ y ] [ x ] = yx[ yy ] [ xx ] ;

            // Store the value of the tile that was just moved.
            var card = yx[ yy ] [ xx ] ;

            // Set the original position of the moved tile to 0, making it the new empty spot.
            yx[ yy ] [ xx ] = 0 ;

            // --- Convert Back to 1D Array ---
            // Combine the two rows back into a single 1D array to represent the new puzzle state.
            var YX = yx[ 0 ] . concat( yx[ 1 ] ) ;

            // --- State Hashing ---
            // Create a string representation of the new state for hashing and comparison.
            var str = YX . join( "" ) ;

            // --- Check for Visited State ---
            // If this new state has NOT been visited before.
            if ( obj . hasOwnProperty( str ) == false ) {
                obj[ str ] = true ; // Mark the new state as visited.
                // Add the new state to the BFS queue with an incremented move count.
                P . push( [ YX , cnt ++ ] ) ; // Note: cnt is incremented AFTER its current value is used.
            }

            // --- Backtrack (Undo Swap) ---
            // Restore the grid to its state before the current move was made.
            // This is crucial for exploring other possible moves from the *original* empty tile position.
            yx[ yy ] [ xx ] = card ; // Put the moved tile back.
            yx[ y ] [ x ] = 0 ; // Restore the empty spot to its original position (y, x).
        }
    }
} ) ;