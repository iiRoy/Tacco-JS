/* Directional offsets for row (dy) and column (dx) movements */
// These arrays define the 8 possible directions from a given cell
var dx = [1, 1, 1, 0, 0, -1, -1, -1];  // X-axis (column) changes
var dy = [1, 0, -1, 1, -1, 1, 0, -1]; // Y-axis (row) changes


/*
 * Function: judge
 * Calculates the number of opponent pieces that would be flipped
 * if a piece is placed at (ii, jj) by the current 'turn' player.
 *
 * @param s     The current game board state (2D array).
 * @param turn  The current player (1 or -1).
 * @param ii    The row index for the potential move.
 * @param jj    The column index for the potential move.
 * @returns     The total number of pieces that would be flipped.
 */
function judge( s , turn , ii , jj ) {
    var sum = 0; // Initialize total flips for this move

    // Iterate through all 8 possible directions
    for ( var i = 0 ; i < 8 ; i++ ) {
        var su = 0; // Counter for consecutive opponent pieces in current direction

        // Calculate the starting position for checking in the current direction
        var x = jj + dx[i], y = ii + dy[i];

        // Traverse in the current direction as long as we are within board boundaries
        while ( x > 0 && x < 9 && y > 0 && y < 9 ) {
            // If we encounter a piece of the current player,
            // all opponent pieces encountered so far in this direction are flipped.
            if ( s[y][x] == turn ) {
                sum += su; // Add to total flips
                break;     // Stop checking this direction
            }
            // If we encounter an opponent's piece, increment the counter
            else if ( s[y][x] == turn * (-1) ) {
                su++;
            }
            // If we encounter an empty square or an invalid piece,
            // this direction does not lead to a flip.
            else {
                break; // Stop checking this direction
            }

            // Move to the next cell in the current direction
            x += dx[i];
            y += dy[i];
        }
    }
    return sum; // Return the total number of pieces that would be flipped
}


/*
 * Function: put
 * Executes a move by placing a piece at (ii, jj) and flipping
 * all valid opponent pieces.
 *
 * @param s     The current game board state (2D array).
 * @param turn  The current player (1 or -1).
 * @param ii    The row index for the move.
 * @param jj    The column index for the move.
 */
function put( s , turn , ii , jj ) {
    // Loop through all 8 directions
    for ( var i = 0 ; i < 8 ; i++ ) {
        var su = 0; // Count of opponent pieces in this direction
        var x = jj + dx[i] , y = ii + dy[i]; // Starting coordinates for traversal
        var flag = false; // Flag to indicate if a flip sequence is found in this direction

        // Traverse in the current direction
        while ( x > 0 && x < 9 && y > 0 && y < 9 ) {
            // If current player's piece is found, a flip sequence is valid
            if ( s[y][x] == turn ) {
                flag = true;
                break; // Exit inner while loop
            }
            // If opponent's piece is found, increment counter
            else if ( s[y][x] == turn * (-1) ) {
                su++;
            }
            // If empty or invalid piece, no flip in this direction
            else {
                break; // Exit inner while loop
            }

            // Move to the next cell
            x += dx[i];
            y += dy[i];
        }

        // If a flip sequence was found (flag is true)
        if ( flag ) {
            // Reset coordinates to start from the original move position
            var x = jj + dx[i], y = ii + dy[i];
            // Flip the 'su' number of opponent pieces
            for ( var j = 0 ; j < su ; j++ ) {
                s[y][x] = turn; // Change opponent's piece to current player's
                x += dx[i];     // Move to next cell for flipping
                y += dy[i];
            }
        }
    }
    // Finally, place the current player's piece at the chosen position
    s[ii][jj] = turn;
}



/*
 * Main function: Entry point for the Othello game logic.
 * Reads input, simulates the game, and prints the final board state.
 *
 * @param input The raw input string containing the initial board configuration.
 */
function Main ( input ) {
    // Split the input string by newline to get individual lines
    input = input.split("\n");

    // Initialize the game board 's' as a 2D array (1-indexed for convenience)
    var s = [];
    for ( var i = 1 ; i <= 8 ; i++ ) {
        s[i] = []; // Initialize each row
    }

    // 'fin' counts the number of pieces currently on the board
    var fin = 0;

    // Parse the initial board state from input
    for ( var i = 1 ; i <= 8 ; i++ ) {
        for ( var j = 1 ; j <= 8 ; j++ ) {
            // 'o' represents player 1's piece
            if ( input[i - 1][j - 1] == 'o' ) {
                fin++;
                s[i][j] = 1;
            }
            // 'x' represents player -1's piece
            else if ( input[i - 1][j - 1] == 'x' ) {
                fin++;
                s[i][j] = -1;
            }
            // '.' or any other character represents an empty square
            else {
                s[i][j] = 0;
            }
        }
    }

    // 'turn' tracks the current player (1 or -1)
    // 'aaa' is a flag to detect if two consecutive players have no valid moves (game over)
    var turn = 1;
    var aaa = false;

    // Main game loop: Continues as long as the board is not full (64 pieces)
    while ( fin < 64 ) {
        var maxi = 0, imax = -1, jmax = -1; // Variables to store the best move found
                                            // maxi: max flips, imax, jmax: coordinates

        // Player 1's turn (prioritizes moves with more flips)
        if ( turn == 1 ) {
            // Iterate through all possible board positions
            for ( var i = 1 ; i <= 8 ; i++ ) {
                for ( var j = 1 ; j <= 8 ; j++ ) {
                    // Only consider empty squares
                    if ( s[i][j] == 0 ) {
                        // Calculate potential flips for this move
                        var a = judge( s , turn , i , j );
                        // If this move results in more flips than the current best
                        if ( a > maxi ) {
                            maxi = a;   // Update max flips
                            imax = i;   // Update best row
                            jmax = j;   // Update best column
                        }
                    }
                }
            }
        }
        // Player -1's turn (prioritizes moves with more flips, but uses '>=' for tie-breaking)
        else {
            // Iterate through all possible board positions
            for ( var i = 1 ; i <= 8 ; i++ ) {
                for ( var j = 1 ; j <= 8 ; j++ ) {
                    // Only consider empty squares
                    if ( s[i][j] == 0 ) {
                        // Calculate potential flips for this move
                        var a = judge( s , turn , i , j );
                        // If this move results in more flips or equal flips (preferring later positions)
                        if ( a >= maxi ) {
                            maxi = a;   // Update max flips
                            imax = i;   // Update best row
                            jmax = j;   // Update best column
                        }
                    }
                }
            }
        }

        // Check if a valid move was found for the current player
        if ( maxi > 0 ) {
            aaa = false; // Reset pass flag, as a move was made
            fin++;       // Increment total pieces on board
            put( s , turn , imax , jmax ); // Execute the chosen move
        }
        // If no valid move was found for the current player
        else {
            // If the previous player also had no valid moves, the game ends
            if ( aaa ) {
                break; // Exit game loop
            }
            // Otherwise, this player passes their turn
            aaa = true; // Set pass flag for the current player
        }
        // Switch turn to the other player
        turn *= (-1);
    } // End of main game loop

    // Print the final board state
    for ( var i = 1 ; i <= 8 ; i++ ) {
        var ans = ""; // String to build each row's output

        for ( var j = 1 ; j <= 8 ; j++ ) {
            // Convert internal representation (1, -1, 0) to output ('o', 'x', '.')
            if ( s[i][j] == 1 ) {
                ans += 'o'; // Player 1's piece
            }
            else if ( s[i][j] == (-1) ) {
                ans += 'x'; // Player -1's piece
            }
            else {
                ans += '.'; // Empty square
            }
        }
        console.log( ans ); // Print the completed row
    }
}
// Call the Main function with input read from stdin
Main( require("fs").readFileSync("/dev/stdin","utf8") );