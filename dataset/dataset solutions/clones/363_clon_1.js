/*
 * This JavaScript module defines a function 'puzzle' that solves an 8-puzzle (or a 2x4 sliding tile puzzle)
 * by performing a Breadth-First Search (BFS).
 * It calculates the minimum number of moves required to reach any possible state from a solved state.
 */
function puzzle ( ) {

    // Initialize an empty object to store the puzzle states and their corresponding minimum move counts.
    // The key will be a string representation of the puzzle state, and the value will be the integer move count.
    var obj = { } ;

    // The "solved" state of the puzzle is defined as "01234567".
    // It takes 0 moves to be in the solved state itself.
    obj [ "01234567" ] = 0 ;

    // Define the possible changes in y-coordinate (row) for moving the empty tile (0).
    // Corresponds to: Up (-1), No change (0), No change (0), Down (+1).
    var dy = [ -1 , 0 , 0 , 1 ] ;

    // Define the possible changes in x-coordinate (column) for moving the empty tile (0).
    // Corresponds to: No change (0), Left (-1), Right (+1), No change (0).
    var dx = [ 0 , -1 , 1 , 0 ] ;

    // Represent the initial (solved) state as a 1D array of numbers.
    var V = [ 0 , 1 , 2 , 3 , 4 , 5 , 6 , 7 ] ;

    // Initialize the BFS queue 'P'. Each element in 'P' is an array:
    // [ [current_puzzle_state_as_array], current_move_count ].
    // We start with the solved state and 0 moves.
    var P = [ [ V , 0 ] ] ;

    // Begin the Breadth-First Search. The loop continues as long as there are states in the queue to explore.
    while ( P.length > 0 ) {

        // Dequeue the first element from the queue. This is the current state we are analyzing.
        var A = P.shift ( ) ;

        // Extract the current puzzle arrangement (1D array of tiles).
        var arr = A [ 0 ] ;

        // Extract the number of moves taken to reach this 'arr' state from the initial solved state.
        var cnt = A [ 1 ] ;

        // Find the index of the empty tile (represented by 0) within the current 1D arrangement.
        var index = arr.indexOf ( 0 ) ;

        // Convert the 1D index of the empty tile to 2D coordinates (y, x) for a 2x4 grid.
        // 'y' is the row index (0 or 1).
        var y = Math.floor ( index / 4 ) ;
        // 'x' is the column index (0, 1, 2, or 3).
        var x = index % 4 ;

        // Create a 2D array representation of the puzzle for easier tile manipulation.
        // yx[0] holds the first row (tiles 0-3), yx[1] holds the second row (tiles 4-7).
        var yx = [ arr.slice ( 0 , 4 ) , arr.slice ( 4 , 8 ) ] ;

        // Iterate through all four possible directions (up, left, right, down) to move the empty tile.
        for ( var i = 0 ; i < 4 ; i ++ ) {

            // Calculate the new potential coordinates (yy, xx) for the empty tile
            // if it moves in the current direction 'i'.
            var yy = y + dy [ i ] ;
            var xx = x + dx [ i ] ;

            // Check if the calculated new coordinates (yy, xx) are within the valid 2x4 grid boundaries.
            // Valid rows: 0 to 1 (yy must be >= 0 and < 2).
            // Valid columns: 0 to 3 (xx must be >= 0 and < 4).
            if ( yy < 0 || xx < 0 || yy >= 2 || xx >= 4 )
            {
                // If the move is out of bounds, skip this iteration and try the next direction.
                continue ;
            }

            // --- Perform the tile swap to simulate the move ---

            // Move the tile from the target position (yy, xx) into the current empty position (y, x).
            yx [ y ] [ x ] = yx [ yy ] [ xx ] ;

            // Store the value of the tile that was just moved. This is needed for reverting the swap.
            var card = yx [ yy ] [ xx ] ;

            // Set the target position (where the tile came from) to 0, as it is now the new empty spot.
            yx [ yy ] [ xx ] = 0 ;

            // --- Convert the new 2D state back to a 1D array and then to a string ---

            // Concatenate the two rows of the 2D array 'yx' back into a single 1D array.
            var YX = yx [ 0 ] .concat ( yx [ 1 ] ) ;

            // Convert the 1D array 'YX' into a string representation, e.g., "12345670".
            var str = YX.join ( "" ) ;

            // --- Check if this new state 'str' has been visited before ---

            // If the 'obj' object does NOT have a property with this 'str' key,
            // it means this state has not been visited yet (or we found a new path to it,
            // but BFS guarantees the first path found is the shortest).
            if ( obj.hasOwnProperty ( str ) == false ) {
                // Record the minimum number of moves required to reach this new state.
                obj [ str ] = cnt + 1 ;
                // Add this new state (1D array and its move count) to the BFS queue for future exploration.
                P.push ( [ YX , cnt + 1 ] ) ;
            }

            // --- Revert the tile swap to restore the puzzle state ---
            // This is crucial! It allows the loop to try other moves from the *original* state 'arr'
            // without being affected by the current move.
            yx [ yy ] [ xx ] = card ; // Put the 'card' tile back to its original position.
            yx [ y ] [ x ] = 0 ;      // Restore the empty tile (0) to its original position for this iteration.
        }
    }

    // After the BFS completes, 'obj' will contain all reachable puzzle states
    // and the minimum number of moves to reach each from the solved state.
    return obj ;
}


// --- Main script execution block ---

// Use Node.js's 'fs' module to synchronously read all input from standard input ('/dev/stdin').
// The input is expected to be encoded in 'utf8'.
var input = require ( 'fs' ) .readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Process the input string:
// 1. Remove any leading or trailing whitespace (like newlines at the end).
// 2. Split the cleaned input string into an array of strings, using the newline character as a delimiter.
//    Each element in 'Arr' will be a single line representing a puzzle state from the input.
var Arr = ( input.trim ( ) ) .split ( "\n" ) ;

// Call the 'puzzle' function once to pre-calculate all possible puzzle states and their move counts.
// This result is stored in 'PUZZLE' and will be used for all subsequent lookups.
var PUZZLE = puzzle ( ) ;

// Iterate over each puzzle state provided in the input array 'Arr'.
Arr.forEach ( function ( v ) {
    // For each input line 'v':
    // 1. Split the string by spaces (e.g., "1 2 3 4 5 6 7 0" becomes ["1", "2", ...]).
    // 2. Join the resulting array elements back into a single string without spaces (e.g., "12345670").
    var cleanedState = v.split ( " " ) .join ( "" ) ;

    // Look up the cleaned puzzle state in the pre-computed 'PUZZLE' object.
    // 'PUZZLE[cleanedState]' will give the minimum number of moves to reach that state.
    // Print this number to the console.
    console.log ( PUZZLE [ cleanedState ] ) ;
} ) ;