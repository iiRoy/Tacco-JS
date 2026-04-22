function     bomb  (  y,  x,  color  )
{
    // Initialize direction vectors for bomb expansion
    var   dy   =   [   -1,   0,   0,   1   ]   ;
    var   dx   =   [   0,   -1,   1,   0   ]   ;

    /*
     * Iterate through all four possible directions (up, left, right, down)
     * to check adjacent cells.
     */
    for    (   var   i   =   0   ;   i   <   4   ;   i++   )
    {
        // Calculate the coordinates of the adjacent cell
        var   yy   =   y   +   dy   [   i   ]   ;
        var   xx   =   x   +   dx   [   i   ]   ;

        // Check for boundary conditions
        if   (   yy   <   0   ||   xx   <   0   ||   yy   >=   12   ||   xx   >=   6   )
        {
            continue   ; // Skip if out of bounds
        }

        // If the adjacent cell has the same color
        if   (   yx   [   yy   ]   [   xx   ]   ==   color   )
        {
            CNT++   ; // Increment the counter for connected cells
            // If 4 or more cells are connected, mark the current cell for removal
            if   (   CNT   ==   4   )
            {
                p.push   (   [   yy,   xx   ]   )   ;
            }
            // Mark the cell with color and count to prevent re-processing in current chain
            yx   [   yy   ]   [   xx   ]   =   color   +   CNT   ;
            // Recursively call bomb for the adjacent cell
            bomb   (   yy,   xx,   color   )   ;
        }
    }
}


/* This function is responsible for clearing connected cells of a specific color,
 * and also clearing 'O' cells which might be special blocks.
 */
function   BOMB   (   y,   x,   color   )
{
    var   dy   =   [   -1,   0,   0,   1   ]   ; // Vertical offsets for neighbors
    var   dx   =   [   0,   -1,   1,   0   ]   ; // Horizontal offsets for neighbors

    for   (   var   i   =   0   ;   i   <   4   ;   i++   )
    {
        var   yy   =   y   +   dy   [   i   ]   ;
        var   xx   =   x   +   dx   [   i   ]   ;

        // Boundary check: ensure coordinates are within the grid
        if   (   yy   <   0   ||   xx   <   0   ||   yy   >=   12   ||   xx   >=   6   )
        {
            continue   ; // Move to the next direction if out of bounds
        }

        // If the adjacent cell matches the target color
        if   (   yx   [   yy   ]   [   xx   ]   ==   color   )
        {
            yx   [   yy   ]   [   xx   ]   =   "."   ; // Mark it as empty
            BOMB   (   yy,   xx,   color   )   ; // Recursively clear connected cells
        }
        else   if   (   yx   [   yy   ]   [   xx   ]   ==   "O"   )
        {
            yx   [   yy   ]   [   xx   ]   =   "."   ; // Clear 'O' blocks as well
        }
    }
}


// This function moves blocks down to fill empty spaces in a given column.
function   up   (   y,   x   )
{
    var   yy   =   y   ; // 'yy' stores the original empty position to fill

    while   (   y   >   0   ) // Iterate upwards from the current position
    {
        y--   ; // Move to the cell directly above

        // If a non-empty block is found
        if   (   yx   [   y   ]   [   x   ]   !=   "."   )
        {
            // Move the found block down to the empty position
            yx   [   yy   ]   [   x   ]   =   yx   [   y   ]   [   x   ]   ;
            yx   [   y   ]   [   x   ]   =   "."   ; // Clear the original position of the moved block
            break   ; // Stop after moving one block
        }
    }
}

// Read input from standard input, typically for competitive programming environments.
var   input   =   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   ;

// Process the input: trim whitespace and split into lines.
var   Arr   =   (   input.trim   (   )   )   .   split   (   "\n"   )   ;

// Get the number of test cases from the first line of input.
var   n   =   Arr.shift   (   )   -   0   ;

// Loop through each test case.
for   (   var   I   =   0   ;   I   <   n   ;   I++   )
{
    var   yx   =   [   ]   ; // Initialize the game grid for the current test case.

    // Populate the grid with 12 rows from the input.
    for   (   var   i   =   0   ;   i   <   12   ;   i++   )
    {
        var   arr   =   (   Arr.shift   (   )   )   .   split   (   ""   )   ; // Split line into characters.
        yx.push   (   arr   )   ; // Add row to the grid.
    }

    var   result   =   0   ; // Initialize the score/result for the current test case.

    // Main game loop: continues as long as blocks are exploding.
    while   (   true   )
    {
        var   p   =   [   ]   ; // List to store coordinates of blocks to be removed.
        var   CNT   ; // Counter for connected blocks of the same color.

        // First pass: identify connected blocks of 4 or more.
        for   (   var   i   =   0   ;   i   <   12   ;   i++   )
        {
            for   (   var   j   =   0   ;   j   <   6   ;   j++   )
            {
                // Check each color block type and initiate bomb detection.
                if   (   yx   [   i   ]   [   j   ]   ==   "R"   )   {   CNT   =   1   ;   yx   [   i   ]   [   j   ]   =   "R"   +   CNT   ;   bomb   (   i,   j,   "R"   )   ;   }
                if   (   yx   [   i   ]   [   j   ]   ==   "G"   )   {   CNT   =   1   ;   yx   [   i   ]   [   j   ]   =   "G"   +   CNT   ;   bomb   (   i,   j,   "G"   )   ;   }
                if   (   yx   [   i   ]   [   j   ]   ==   "B"   )   {   CNT   =   1   ;   yx   [   i   ]   [   j   ]   =   "B"   +   CNT   ;   bomb   (   i,   j,   "B"   )   ;   }
                if   (   yx   [   i   ]   [   j   ]   ==   "Y"   )   {   CNT   =   1   ;   yx   [   i   ]   [   j   ]   =   "Y"   +   CNT   ;   bomb   (   i,   j,   "Y"   )   ;   }
                if   (   yx   [   i   ]   [   j   ]   ==   "P"   )   {   CNT   =   1   ;   yx   [   i   ]   [   j   ]   =   "P"   +   CNT   ;   bomb   (   i,   j,   "P"   )   ;   }
            }
        }

        // Second pass: reset temporary marks (e.g., "R1", "G2") back to their original color.
        for   (   var   i   =   0   ;   i   <   12   ;   i++   )
        {
            for   (   var   j   =   0   ;   j   <   6   ;   j++   )
            {
                yx   [   i   ]   [   j   ]   =   yx   [   i   ]   [   j   ]   .   slice   (   0,   1   )   ;
            }
        }

        // If no blocks were marked for removal (p is empty), then the game round ends.
        if   (   p.length   ==   0   )
        {
            break   ;
        }

        result++   ; // Increment the result (score) for this successful round.

        // Third pass: remove the identified blocks using the BOMB function.
        p.forEach   (   function   (   v   )
        {
            var   i   =   v   [   0   ]   ;
            var   j   =   v   [   1   ]   ;
            var   color   =   yx   [   i   ]   [   j   ]   ;
            BOMB   (   i,   j,   color   )   ;
        }   )   ;

        // Fourth pass: apply gravity - move blocks down to fill empty spaces.
        // Iterate from bottom up, column by column.
        for   (   var   i   =   11   ;   i   >   0   ;   i--   )
        {
            for   (   var   j   =   0   ;   j   <   6   ;   j++   )
            {
                if   (   yx   [   i   ]   [   j   ]   ==   "."   )   {   up   (   i,   j   )   ;   } // If empty, call 'up' to fill it.
            }
        }
    }

    // Output the final result for the current test case.
    console.log   (   result   )   ;
}