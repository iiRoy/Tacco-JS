var dx = [ -1 , 0 , 1 , -1 ] ; // X-axis direction changes
var dy = [ -1 , -1 , -1 , 0 ] ; // Y-axis direction changes
var dz = [ 0 , 0 , 0 , 0 ] ; // Z-axis direction changes

// Concatenate more direction vectors to cover all 26 possible 3D directions
dy = dy . concat ( [ -1 , 0 , 1 , -1 ] ) ;
dz = dz . concat ( [ -1 , -1 , -1 , 0 ] ) ;

dx = dx . concat ( [ 0 , 0 , 0 , 0 ] ) ;

dz = dz . concat ( [ -1 , 0 , 1 , -1 ] ) ;

dx = dx . concat ( [ -1 , -1 , -1 , 0 ] ) ;
dy = dy . concat ( [ 0 , 0 , 0 , 0 ] ) ;

dx = dx . concat ( [ 1 , -1 , 1 , -1 ] ) ;
dy = dy . concat ( [ -1 , -1 , -1 , -1 ] ) ;
dz = dz . concat ( [ -1 , -1 , 1 , 1 ] ) ;


/**
 *  Calculates the maximum consecutive chain of `ab` pieces in a given direction from (x, y, z).
 *  This function simulates checking for a winning condition in a 3D game.
 *
 *  @param {number} ab - The player's piece type (e.g., 1 for black, 2 for white).
 *  @param {number} x  - The x-coordinate of the last placed piece.
 *  @param {number} y  - The y-coordinate of the last placed piece.
 *  @param {number} z  - The z-coordinate of the last placed piece.
 *  @returns {number} The maximum length of a consecutive chain found.
 */
function bomb ( ab , x , y , z ) {

    var max = 0 ; // Stores the maximum consecutive count found

    // Iterate through all defined direction vectors
    for ( var i = 0 ; i < dx . length ; i ++ ) {

        var X = x ; // Current X coordinate, initialized to the last placed piece's X
        var Y = y ; // Current Y coordinate, initialized to the last placed piece's Y
        var Z = z ; // Current Z coordinate, initialized to the last placed piece's Z

        // First while loop: Move backwards in the current direction until out of bounds or an empty spot
        while ( true ) {
            X -= dx [ i ] ;
            Y -= dy [ i ] ;
            Z -= dz [ i ] ;

            // Check if coordinates are out of bounds (less than 0)
            if ( X < 0 || Y < 0 || Z < 0 ) break ;
            // Check if coordinates are out of bounds (greater or equal to board dimensions)
            if ( X >= n || Y >= n || Z >= p ) break ;
        }

        var cnt = 0 ; // Counter for consecutive pieces of the same type

        // Second while loop: Move forwards from the boundary (or starting point) in the current direction
        while ( true ) {
            X += dx [ i ] ;
            Y += dy [ i ] ;
            Z += dz [ i ] ;

            // Check if coordinates are out of bounds (less than 0)
            if ( X < 0 || Y < 0 || Z < 0 ) break ;
            // Check if coordinates are out of bounds (greater or equal to board dimensions)
            if ( X >= n || Y >= n || Z >= p ) break ;

            // If the piece at the current coordinate matches the player's piece type
            if ( ball [ X ] [ Y ] [ Z ] == ab ) cnt ++ ;
            // Otherwise, reset the counter as the chain is broken
            else cnt = 0 ;

            // Update the maximum consecutive count found so far
            max = Math . max ( max , cnt ) ;
        }
    }

    return max ; // Return the overall maximum chain length
}

// Read input from stdin
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Split input into lines and trim any leading/trailing whitespace
var arr = input . trim ( ) . split ( "\n" ) ;


// Main game loop
while ( true ) {

    // Get the first line containing board dimensions (n, m, p)
    var nmp = arr . shift ( ) ;

    // If "0 0 0" is encountered, it signifies the end of input
    if ( nmp == "0 0 0" ) break ;

    // Parse n, m, p values
    nmp = nmp . split ( " " ) . map ( Number ) ;
    var n = nmp [ 0 ] ; // Board dimension (n x n x p)
    var m = nmp [ 1 ] ; // Winning chain length
    var p = nmp [ 2 ] ; // Board depth

    // Initialize the 3D game board (ball array) with zeros
    var ball = [ ] ;
    for ( var i = 0 ; i < n ; i ++ ) {
        ball [ i ] = [ ] ;
        for ( var j = 0 ; j < n ; j ++ ) {
            ball [ i ] [ j ] = [ ] ;
            for ( var k = 0 ; k < p ; k ++ ) {
                ball [ i ] [ j ] [ k ] = 0 ; // 0 indicates an empty spot
            }
        }
    }

    // Read player moves (P array)
    var P = [ ] ;
    for ( var i = 0 ; i < p ; i ++ ) P . push ( arr . shift ( ) . split ( " " ) . map ( Number ) ) ;

    var ab = 1 ; // Current player's piece (1 for Black, 2 for White; 2/1 = 2, 2/2 = 1)
    var draw = true ; // Flag to check if the game ends in a draw

    // Process each player's move
    for ( var i = 0 ; i < p ; i ++ ) {
        var xy = P [ i ] ; // Current move coordinates (1-indexed)
        var x = xy [ 0 ] - 1 ; // Convert to 0-indexed X
        var y = xy [ 1 ] - 1 ; // Convert to 0-indexed Y
        var cnt = 0 ; // Z-coordinate counter

        // Find the lowest available Z-coordinate for the current (x, y) column
        while ( true ) {
            if ( ball [ x ] [ y ] [ cnt ] !== 0 ) cnt ++ ; // If spot occupied, move up
            else break ; // Found an empty spot
        }

        // Place the current player's piece on the board
        ball [ x ] [ y ] [ cnt ] = ab ;

        // Check for winning condition after placing the piece
        if ( bomb ( ab , x , y , cnt ) >= m ) {
            // Output the winner and the move number
            console . log ( ( ab == 2 ) ? "White" : "Black" , i + 1 ) ;
            draw = false ; // Game is not a draw
            break ; // End the game loop
        }

        // Switch player: 1 -> 2, 2 -> 1
        ab = 2 / ab ;
    }

    // If the loop finishes without a winner, it's a draw
    if ( draw ) console . log ( "Draw" ) ;
}