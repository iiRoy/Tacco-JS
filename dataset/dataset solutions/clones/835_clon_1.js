/*
 * This function is designed to recursively explore a grid from a given
 * (y, x) coordinate, identifying and marking connected cells of the same color.
 * It's part of a game logic, likely for a 'match-3' or 'bubble-popper' type game.
 *
 * @param {number} y     The current row index.
 * @param {number} x     The current column index.
 * @param {string} color The color of the cell to match.
 */
function bomb( y, x, color ) {

    // Define relative offsets for checking adjacent cells (up, left, right, down).
    var dy = [ -1, 0, 0, 1 ];
    var dx = [ 0, -1, 1, 0 ];

    // Iterate through all four cardinal directions.
    for ( var i = 0; i < 4; i++ ) {

        // Calculate the coordinates of the adjacent cell.
        var yy = y + dy[ i ];
        var xx = x + dx[ i ];

        // Check for boundary conditions: if the adjacent cell is out of bounds,
        // skip to the next iteration.
        if ( yy < 0 || xx < 0 || yy >= 12 || xx >= 6 ) {
            continue;
        }

        // If the adjacent cell has the target color...
        if ( yx[ yy ][ xx ] == color ) {
            // Increment a global counter for connected cells.
            CNT++;

            // If the counter reaches 4 (indicating a match of 4 or more),
            // store the coordinates of this cell in a global pending list 'p'.
            if ( CNT == 4 ) {
                p.push( [ yy, xx ] );
            }

            // Mark the current cell by appending the count to its color.
            // This prevents re-processing it in the current recursive chain
            // and indicates it's part of a group.
            yx[ yy ][ xx ] = color + CNT;

            // Recursively call bomb for the adjacent cell.
            bomb( yy, xx, color );
        }
    }
}


/*
 * This function serves to clear out connected cells of a specific color,
 * effectively 'exploding' them from the grid. It's typically called after
 * a group of matching cells has been identified.
 *
 * @param {number} y     The starting row index for the explosion.
 * @param {number} x     The starting column index for the explosion.
 * @param {string} color The color of the cells to be cleared.
 */
function BOMB( y, x, color ) {

    // Relative offsets for checking adjacent cells (up, left, right, down).
    var dy = [ -1, 0, 0, 1 ];
    var dx = [ 0, -1, 1, 0 ];

    // Loop through all four directions.
    for ( var i = 0; i < 4; i++ ) {

        // Calculate adjacent cell coordinates.
        var yy = y + dy[ i ];
        var xx = x + dx[ i ];

        // Boundary check: skip if out of grid.
        if ( yy < 0 || xx < 0 || yy >= 12 || xx >= 6 ) {
            continue;
        }

        // If the adjacent cell matches the target color, clear it.
        if ( yx[ yy ][ xx ] == color ) {
            yx[ yy ][ xx ] = "."; // Mark as empty.
            BOMB( yy, xx, color ); // Recursively clear connected cells.
        }
        // If the adjacent cell is an 'O' (likely a special block or obstacle), clear it too.
        else if ( yx[ yy ][ xx ] == "O" ) {
            yx[ yy ][ xx ] = "."; // Mark as empty.
        }
    }
}


/*
 * This function simulates gravity, moving a block upwards if there's an empty
 * space below it. It finds the first non-empty block above the given (y,x)
 * and moves it down to the position (yy,x) which was the original y.
 *
 * @param {number} y The initial row index of the empty spot.
 * @param {number} x The column index.
 */
function up( y, x ) {

    // Store the original y-coordinate where the block needs to move.
    var yy = y;

    // Traverse upwards from the current position.
    while ( y > 0 ) {
        y--; // Move to the cell directly above.

        // If a non-empty block is found...
        if ( yx[ y ][ x ] != "." ) {
            // Move that block down to the original empty spot (yy, x).
            yx[ yy ][ x ] = yx[ y ][ x ];
            // Mark the original position of the moved block as empty.
            yx[ y ][ x ] = ".";
            break; // Stop after moving one block.
        }
    }
}

// Read input from standard input.
var input = require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' );

// Process input: trim whitespace, split into lines.
var Arr = ( input.trim() ).split( "\n" );

// The first line of input indicates the number of test cases (n).
var n = Arr.shift() - 0; // Convert to number.

// Loop through each test case.
for ( var I = 0; I < n; I++ ) {

    // Initialize the game grid for the current test case.
    var yx = [];

    // Populate the 12x6 grid from the input lines.
    for ( var i = 0; i < 12; i++ ) {
        var arr = ( Arr.shift() ).split( "" ); // Each line is a row.
        yx.push( arr );
    }

    // Initialize the result counter for the number of chain reactions.
    var result = 0;

    // Main game loop: continues as long as chain reactions occur.
    while ( true ) {

        // 'p' will store coordinates of cells that initiated a chain reaction (4+ match).
        var p = [];
        // 'CNT' is a temporary counter for connected cells during 'bomb' function calls.
        var CNT;

        // First pass: Identify and mark groups of 4 or more connected cells.
        for ( var i = 0; i < 12; i++ ) {
            for ( var j = 0; j < 6; j++ ) {

                // For each cell, if it's an unvisited color, start a 'bomb' check.
                // The 'bomb' function will mark visited cells by appending CNT to their color.
                if ( yx[ i ][ j ] == "R" ) {
                    CNT = 1;
                    yx[ i ][ j ] = "R" + CNT;
                    bomb( i, j, "R" );
                }
                if ( yx[ i ][ j ] == "G" ) {
                    CNT = 1;
                    yx[ i ][ j ] = "G" + CNT;
                    bomb( i, j, "G" );
                }
                if ( yx[ i ][ j ] == "B" ) {
                    CNT = 1;
                    yx[ i ][ j ] = "B" + CNT;
                    bomb( i, j, "B" );
                }
                if ( yx[ i ][ j ] == "Y" ) {
                    CNT = 1;
                    yx[ i ][ j ] = "Y" + CNT;
                    bomb( i, j, "Y" );
                }
                if ( yx[ i ][ j ] == "P" ) {
                    CNT = 1;
                    yx[ i ][ j ] = "P" + CNT;
                    bomb( i, j, "P" );
                }
            }
        }

        // Second pass: Reset marked cells to their original color (remove the CNT suffix).
        // This is necessary before clearing, so 'BOMB' can correctly identify colors.
        for ( var i = 0; i < 12; i++ ) {
            for ( var j = 0; j < 6; j++ ) {
                yx[ i ][ j ] = yx[ i ][ j ].slice( 0, 1 ); // Get the first character (the color).
            }
        }

        // If no groups of 4 or more were found in this iteration, break the loop.
        if ( p.length == 0 ) {
            break;
        }

        // A chain reaction occurred, increment the result.
        result++;

        // Third pass: Clear the identified groups using the 'BOMB' function.
        // 'p' contains the starting points for explosions.
        p.forEach( function ( v ) {
            var i = v[ 0 ];
            var j = v[ 1 ];
            var color = yx[ i ][ j ];

            // Only 'BOMB' if the cell still contains a color (not already cleared by another BOMB).
            if ( color != "." ) {
                BOMB( i, j, color );
            }
        } );

        // Fourth pass: Apply gravity. Iterate from bottom-up to ensure correct falling order.
        for ( var i = 11; i > 0; i-- ) { // Start from the second-to-last row and go up.
            for ( var j = 0; j < 6; j++ ) {
                // If a cell is empty, attempt to move a block into it from above.
                if ( yx[ i ][ j ] == "." ) {
                    up( i, j );
                }
            }
        }
    }

    // Output the total number of chain reactions for the current test case.
    console.log( result );
}