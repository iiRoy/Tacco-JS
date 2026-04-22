/*
 * This file contains a JavaScript program implementing a game logic.
 * It processes a grid-based game, likely involving color matching and
 * gravity simulation.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

// Recursive function to identify and mark connected components of a specific color.
// 'y' and 'x' are the current coordinates, 'color' is the target color.
function bomb( y , x , color ) {

    // Define relative offsets for checking adjacent cells (up, left, right, down).
    var dy = [ -1 , 0 , 0 , 1 ] ;
    var dx = [ 0 , -1 , 1 , 0 ] ;

    // Loop through the four possible directions.
    for ( var i = 0 ; i < 4 ; i ++ ) {

        // Calculate the coordinates of the adjacent cell.
        var yy = y + dy[i] ;
        var xx = x + dx[i] ;

        // Check if the adjacent cell is out of bounds.
        // If it is, skip to the next iteration.
        if ( yy < 0 || xx < 0 || yy >= 12 || xx >= 6 ) {
            continue ;
        }

        // If the adjacent cell has the same color.
        if ( yx[yy][xx] == color ) {
            CNT ++ ; // Increment the counter for the current connected component.

            // If the component size reaches 4, add its coordinates to the 'p' array.
            if ( CNT == 4 ) {
                p.push( [ yy , xx ] ) ;
            }

            // Mark the cell as visited by modifying its color (e.g., adding 0 to it).
            yx[yy][xx] = color + 0 ;

            // Recursively call bomb for the adjacent cell.
            bomb( yy , xx , color ) ;
        }
    }
}


// Recursive function to clear a connected component of a specific color.
// 'y' and 'x' are the current coordinates, 'color' is the target color to clear.
function BOMB( y , x , color ) {

    // Define relative offsets for checking adjacent cells (up, left, right, down).
    var dy = [ -1 , 0 , 0 , 1 ] ;
    var dx = [ 0 , -1 , 1 , 0 ] ;

    // Loop through the four possible directions.
    for ( var i = 0 ; i < 4 ; i ++ ) {

        // Calculate the coordinates of the adjacent cell.
        var yy = y + dy[i] ;
        var xx = x + dx[i] ;

        // Check if the adjacent cell is out of bounds.
        // If it is, skip to the next iteration.
        if ( yy < 0 || xx < 0 || yy >= 12 || xx >= 6 ) {
            continue ;
        }

        // If the adjacent cell has the same color, clear it and recurse.
        if ( yx[yy][xx] == color ) {
            yx[yy][xx] = "." ; // Mark as empty.
            BOMB( yy , xx , color ) ;
        }
        // If the adjacent cell is an 'O' (special block), clear it.
        else if ( yx[yy][xx] == "O" ) {
            yx[yy][xx] = "." ; // Mark as empty.
        }
    }
}


// Function to simulate gravity for a single column.
// Moves blocks down to fill empty spaces.
// 'y' is the starting row (bottom of the column), 'x' is the column index.
function up( y , x ) {

    var yy = y ; // Store the original y position for placing the moved block.

    // Iterate upwards from the current position.
    while ( y > 0 ) {
        y -- ; // Move to the cell above.

        // If a non-empty block is found above.
        if ( yx[y][x] != "." ) {
            yx[yy][x] = yx[y][x] ; // Move the block down to the original 'yy' position.
            yx[y][x] = "." ; // Empty the original position of the moved block.
            break ; // Stop after moving one block.
        }
    }
}


// Read input from standard input.
var input = require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' ) ;

// Process input: trim whitespace, split by newlines into an array.
var Arr = ( input . trim() ) . split( "\n" ) ;

// Get the number of test cases from the first line of input.
var n = Arr . shift() - 0 ;

// Main loop for each test case.
for ( var I = 0 ; I < n ; I ++ ) {

    var yx = [] ; // Initialize the game grid for the current test case.

    // Populate the game grid from the input.
    for ( var i = 0 ; i < 12 ; i ++ ) {
        var arr = ( Arr . shift() ) . split( "" ) ; // Get a row and split into characters.
        yx . push( arr ) ; // Add the row to the grid.
    }

    var result = 0 ; // Initialize the score/result for the current test case.

    // Main game loop: continues as long as blocks are being cleared.
    while ( true ) {
        var p = [] ; // Array to store coordinates of blocks to be cleared (groups of 4+).
        var CNT ;    // Counter for connected component size.

        // First pass: identify connected components of 4 or more same-colored blocks.
        for ( var i = 0 ; i < 12 ; i ++ ) {
            for ( var j = 0 ; j < 6 ; j ++ ) {
                // Check for different colors and initiate 'bomb' function if found.
                // The `+0` is used to mark cells as 'visited' during the `bomb` recursion,
                // differentiating them from unvisited cells of the same color.
                if ( yx[i][j] == "R" ) { yx[i][j] = "R" + 0 ; CNT = 1 ; bomb( i , j , "R" ) ; }
                if ( yx[i][j] == "G" ) { yx[i][j] = "G" + 0 ; CNT = 1 ; bomb( i , j , "G" ) ; }
                if ( yx[i][j] == "B" ) { yx[i][j] = "B" + 0 ; CNT = 1 ; bomb( i , j , "B" ) ; }
                if ( yx[i][j] == "Y" ) { yx[i][j] = "Y" + 0 ; CNT = 1 ; bomb( i , j , "Y" ) ; }
                if ( yx[i][j] == "P" ) { yx[i][j] = "P" + 0 ; CNT = 1 ; bomb( i , j , "P" ) ; }
            }
        }

        // Second pass: reset the visited markers (remove the "+0" part).
        for ( var i = 0 ; i < 12 ; i ++ ) {
            for ( var j = 0 ; j < 6 ; j ++ ) {
                yx[i][j] = yx[i][j] . slice( 0 , 1 ) ; // Get the first character (original color).
            }
        }

        // If no groups of 4+ were found in this iteration, break the game loop.
        if ( p . length == 0 ) {
            break ;
        }

        result ++ ; // Increment the result (score or number of clearings).

        // Third pass: clear the identified groups using the BOMB function.
        p . forEach( function( v ) {
            var i = v[0] ; // Row index.
            var j = v[1] ; // Column index.
            var color = yx[i][j] ; // Get the color of the block to be cleared.

            // Only clear if the block hasn't been cleared by another group in this pass.
            if ( color != "." ) {
                BOMB( i , j , color ) ;
            }
        } ) ;

        // Fourth pass: apply gravity. Iterate from bottom-up for each column.
        for ( var i = 11 ; i > 0 ; i -- ) { // Start from the second-to-last row up to the first.
            for ( var j = 0 ; j < 6 ; j ++ ) { // For each column.
                // If the current cell is empty, attempt to pull a block down.
                if ( yx[i][j] == "." ) {
                    up( i , j ) ;
                }
            }
        }
    }

    // Output the final result for the current test case.
    console . log( result ) ;
}