// This function calculates the maximum consecutive 'ab' values
// along all 26 possible 3D directions starting from a given point (x, y, z).
function   bomb   (   ab   ,   x   ,   y   ,   z   )
{
    // Define initial directional vectors for dx, dy, dz.
    // These arrays represent the 26 possible directions in a 3D grid.
    var   dx   =   [   -1   ,   0   ,   1   ,   -1   ]   ;
    var   dy   =   [   -1   ,   -1   ,   -1    ,   0   ]   ;
    var   dz   =   [   0   ,   0   ,   0   ,   0   ]   ;

    // Concatenate more directional components to build the full 26 directions.
    dy   =   dy   .   concat   (   [   -1   ,   0   ,   1   ,   -1   ]   )   ;
    dz   =   dz   .   concat   (   [   -1   ,   -1   ,   -1   ,   0   ]   )   ;
    dx   =   dx   .   concat   (   [   0   ,   0   ,   0   ,   0   ]   )   ;

    dz   =   dz   .   concat   (   [   -1   ,   0   ,   1   ,   -1   ]   )   ;
    dx   =   dx   .   concat   (   [   -1   ,   -1   ,   -1   ,   0   ]   )   ;
    dy   =   dy   .   concat   (   [   0   ,   0   ,   0   ,   0   ]   )   ;

    dx   =   dx   .   concat   (   [   1   ,   -1   ,   1   ,   -1   ]   )   ;
    dy   =   dy   .   concat   (   [   -1   ,   -1   ,   -1   ,   -1   ]   )   ;
    dz   =   dz   .   concat   (   [   -1   ,   -1   ,   1   ,   1   ]   )   ;

    // Initialize 'max' to store the maximum count found in any direction.
    var   max   =   0   ;

    // Iterate through each of the defined 26 directions.
    for   (   var   i   =   0   ;   i   <   dx   .   length   ;   i   ++   )
    {
        // Initialize current coordinates (X, Y, Z) with the starting point (x, y, z).
        var   X   =   x   ;
        var   Y   =   y   ;
        var   Z   =   z   ;

        // Move backward along the current direction until out of bounds.
        while   (   true   )
        {
            X   -=   dx   [   i   ]   ;
            Y   -=   dy   [   i   ]   ;
            Z   -=   dz   [   i   ]   ;

            // Check if the current position is outside the grid boundaries.
            if   (   X   <   0   ||   Y   <   0   ||   Z   <   0   )   break   ;
            if   (   X   >=   n   ||   Y   >=   n   ||   Z   >=   p   )   break   ;
        }

        // Initialize a counter for consecutive 'ab' values.
        var   cnt   =   0   ;

        // Move forward along the current direction from the adjusted starting point.
        while   (   true   )
        {
            X   +=   dx   [   i   ]   ;
            Y   +=   dy   [   i   ]   ;
            Z   +=   dz   [   i   ]   ;

            // Check if the current position is outside the grid boundaries.
            if   (   X   <   0   ||   Y   <   0   ||   Z   <   0   )   break   ;
            if   (   X   >=   n   ||   Y   >=   n   ||   Z   >=   p   )   break   ;

            // If the cell contains 'ab', increment the counter. Otherwise, reset it.
            if   (   ball   [   X   ]   [   Y   ]   [   Z   ]   ==   ab   )   cnt   ++   ;
            else   cnt   =   0   ;

            // Update the maximum consecutive count found so far.
            max   =   Math   .   max   (   max   ,   cnt   )   ;
        }
    }
    // Return the overall maximum consecutive count.
    return   max   ;
}

// Read the entire input from standard input.
var   input   =   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   ;
// Split the input into an array of lines, removing leading/trailing whitespace.
var   arr   =   input   .   trim   (   )   .   split   (   "\n"   )   ;

// Main loop to process multiple test cases until "0 0 0" is encountered.
while   (   true   )
{
    // Get the first line, which contains n, m, p values.
    var   nmp   =   arr   .   shift   (   )   ;

    // Termination condition for the loop.
    if   (   nmp   ==   "0 0 0"   )   break   ;

    // Parse n, m, and p from the current line.
    nmp   =   nmp   .   split   (   " "   )   .   map   (   Number   )   ;
    var   n   =   nmp   [   0   ]   ; // Grid size N x N
    var   m   =   nmp   [   1   ]   ; // Consecutive count required for a win
    var   p   =   nmp   [   2   ]   ; // Number of pieces to be dropped

    // Initialize the 3D game board (ball grid) with zeros.
    var   ball   =   [   ]   ;
    for   (   var   i   =   0   ;   i   <   n   ;   i   ++   )
    {
        ball   [   i   ]   =   [   ]   ;
        for   (   var   j   =   0   ;   j   <   n   ;   j   ++   )
        {
            ball   [   i   ]   [   j   ]   =   [   ]   ;
            for   (   var   k   =   0   ;   k   <   p   ;   k   ++   )
            {
                ball   [   i   ]   [   j   ]   [   k   ]   =   0   ; // Initialize cell to empty
            }
        }
    }

    // Read the piece drop coordinates.
    var   P   =   [   ]   ;
    for   (   var   i   =   0   ;   i   <   p   ;   i   ++   )   P   .   push   (   arr   .   shift   (   )   .   split   (   " "   )   .   map   (   Number   )   )   ;

    // 'ab' represents the current player (1 for Black, 2 for White).
    var   ab   =   1   ;
    var   draw   =   true   ; // Flag to check if the game is a draw.

    // Process each piece drop.
    for   (   var   i   =   0   ;   i   <   p   ;   i   ++   )
    {
        var   xy   =   P   [   i   ]   ; // Get drop coordinates for the current turn.
        var   x   =   xy   [   0   ]   -   1   ; // Adjust to 0-indexed.
        var   y   =   xy   [   1   ]   -   1   ; // Adjust to 0-indexed.

        var   cnt   =   0   ;
        // Find the lowest available position (Z-coordinate) in the column (x, y).
        while   (   true   )
        {
            if   (   ball   [   x   ]   [   y   ]   [   cnt   ]   !==   0   )   cnt   ++   ;
            else   break   ;
        }

        // Place the current player's piece ('ab') at the found position.
        ball   [   x   ]   [   y   ]   [   cnt   ]   =   ab   ;

        // Check if the current player has won after placing the piece.
        if   (   bomb   (   ab   ,   x   ,   y   ,   cnt   )   >=   m   )
        {
            // Output the winner and the turn number.
            console   .   log   (   (   ab   ==   2   )   ?   "White"   :   "Black"   ,   i   +   1   )   ;
            draw   =   false   ; // Game is not a draw.
            break   ; // End the current game.
        }

        // Switch players: 1 -> 2, 2 -> 1. (2/1 = 2, 2/2 = 1)
        ab   =   2   /   ab   ;
    }

    // If the loop finished without a winner, it's a draw.
    if   (   draw   )   console   .   log   (   "Draw"   )   ;
}